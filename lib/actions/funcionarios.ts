"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ResultadoAcaoFuncionario {
  sucesso: boolean;
  erro?: string;
}

export async function criarFuncionario(
  empresaId: string,
  nome: string,
  cargo: string,
  valorConducaoPadrao: number | null,
): Promise<ResultadoAcaoFuncionario> {
  if (!nome.trim() || !cargo.trim()) {
    return { sucesso: false, erro: "Nome e cargo são obrigatórios." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("funcionarios").insert({
    empresa_id: empresaId,
    nome: nome.trim(),
    cargo: cargo.trim(),
    valor_conducao_padrao: valorConducaoPadrao,
  });

  if (error) return { sucesso: false, erro: error.message };

  revalidatePath("/painel");
  return { sucesso: true };
}

export async function definirFuncionarioAtivo(
  funcionarioId: string,
  ativo: boolean,
): Promise<ResultadoAcaoFuncionario> {
  const supabase = await createClient();
  const { error } = await supabase.from("funcionarios").update({ ativo }).eq("id", funcionarioId);
  if (error) return { sucesso: false, erro: error.message };

  revalidatePath("/painel");
  return { sucesso: true };
}

/**
 * Só remove de verdade quando não há nenhum lançamento vinculado — a FK de
 * lancamentos.funcionario_id é NO ACTION de propósito, então apagar quem já
 * tem condução/hora extra registrada falha (23503) em vez de arriscar
 * quebrar ou apagar silenciosamente um lançamento financeiro real. Por isso
 * a UI só oferece "apagar" depois de "desativar": é o caminho pra quem
 * cadastrou por engano ou nunca chegou a ter pagamento nenhum.
 */
export async function removerFuncionario(funcionarioId: string): Promise<ResultadoAcaoFuncionario> {
  const supabase = await createClient();
  const { error } = await supabase.from("funcionarios").delete().eq("id", funcionarioId);

  if (error) {
    if (error.code === "23503") {
      return {
        sucesso: false,
        erro: "Não dá pra apagar: já existe pagamento (condução/hora extra) registrado pra esse funcionário. Mantenha desativado.",
      };
    }
    return { sucesso: false, erro: error.message };
  }

  revalidatePath("/painel");
  return { sucesso: true };
}

/**
 * Condução ou horas extras de um funcionário viram um lançamento comum
 * (categoria "Pessoal", sinal negativo), só que com `funcionario_id` (e
 * `horas_extras`, quando for o caso) preenchidos — o Resultado Operacional
 * já soma certo sozinho, sem precisar de nenhuma lógica de agregação nova.
 */
export async function registrarPagamentoFuncionario(params: {
  empresaId: string;
  contaId: string;
  funcionarioId: string;
  funcionarioNome: string;
  tipo: "conducao" | "hora_extra";
  data: string;
  valor: number;
  horas?: number;
}): Promise<ResultadoAcaoFuncionario> {
  const { empresaId, contaId, funcionarioId, funcionarioNome, tipo, data, valor, horas } = params;

  if (!contaId || !funcionarioId || !data || valor <= 0) {
    return { sucesso: false, erro: "Preencha conta, funcionário, data e um valor maior que zero." };
  }
  if (tipo === "hora_extra" && (!horas || horas <= 0)) {
    return { sucesso: false, erro: "Informe a quantidade de horas extras." };
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub as string | undefined;

  const descricao =
    tipo === "conducao"
      ? `Condução - ${funcionarioNome}`
      : `Horas extras - ${funcionarioNome} (${horas}h)`;

  const { error } = await supabase.from("lancamentos").insert({
    empresa_id: empresaId,
    conta_id: contaId,
    data,
    descricao,
    categoria: "Pessoal",
    valor: -Math.abs(valor),
    funcionario_id: funcionarioId,
    horas_extras: tipo === "hora_extra" ? horas : null,
    created_by: userId ?? null,
  });

  if (error) return { sucesso: false, erro: error.message };

  revalidatePath("/painel");
  revalidatePath("/caixa");
  return { sucesso: true };
}
