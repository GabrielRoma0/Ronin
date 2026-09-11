import { createClient } from "@/lib/supabase/server";

export interface FuncionarioReal {
  id: string;
  nome: string;
  cargo: string;
  valorConducaoPadrao: number | null;
  ativo: boolean;
}

export interface PagamentoFuncionario {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  horasExtras: number | null;
  funcionarioId: string;
}

export async function listarFuncionariosReal(empresaId: string): Promise<FuncionarioReal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("funcionarios")
    .select("id, nome, cargo, valor_conducao_padrao, ativo")
    .eq("empresa_id", empresaId)
    .order("nome");

  if (error) throw error;

  return (data ?? []).map((f) => ({
    id: f.id,
    nome: f.nome,
    cargo: f.cargo,
    valorConducaoPadrao: f.valor_conducao_padrao,
    ativo: f.ativo,
  }));
}

/** Últimos lançamentos ligados a algum funcionário (condução/horas extras), pra conferência. */
export async function listarPagamentosFuncionarios(
  empresaId: string,
  limite = 30,
): Promise<PagamentoFuncionario[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lancamentos")
    .select("id, data, descricao, valor, horas_extras, funcionario_id")
    .eq("empresa_id", empresaId)
    .not("funcionario_id", "is", null)
    .order("data", { ascending: false })
    .limit(limite);

  if (error) throw error;

  return (data ?? []).map((l) => ({
    id: l.id,
    data: l.data,
    descricao: l.descricao,
    valor: l.valor,
    horasExtras: l.horas_extras,
    funcionarioId: l.funcionario_id as string,
  }));
}
