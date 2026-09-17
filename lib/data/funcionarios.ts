import { createClient } from "@/lib/supabase/server";

export interface FuncionarioReal {
  id: string;
  nome: string;
  cargo: string;
  valorConducaoPadrao: number | null;
  salario: number | null;
  diasTrabalhoSemana: number | null;
  diaInicioCiclo: number | null;
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

export interface AvaliacaoFuncionario {
  id: string;
  funcionarioId: string;
  data: string;
  nota: number;
}

export async function listarFuncionariosReal(empresaId: string): Promise<FuncionarioReal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("funcionarios")
    .select(
      "id, nome, cargo, valor_conducao_padrao, salario, dias_trabalho_semana, dia_inicio_ciclo, ativo",
    )
    .eq("empresa_id", empresaId)
    .order("nome");

  if (error) throw error;

  return (data ?? []).map((f) => ({
    id: f.id,
    nome: f.nome,
    cargo: f.cargo,
    valorConducaoPadrao: f.valor_conducao_padrao,
    salario: f.salario,
    diasTrabalhoSemana: f.dias_trabalho_semana,
    diaInicioCiclo: f.dia_inicio_ciclo,
    ativo: f.ativo,
  }));
}

/** Notas de satisfação (0-10) que o dono lança manualmente a cada quinzena, mais antigas primeiro — pronto pra virar linha do tempo num gráfico. */
export async function listarAvaliacoesReal(empresaId: string): Promise<AvaliacaoFuncionario[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("avaliacoes_funcionario")
    .select("id, funcionario_id, data, nota")
    .eq("empresa_id", empresaId)
    .order("data", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((a) => ({
    id: a.id,
    funcionarioId: a.funcionario_id,
    data: a.data,
    nota: Number(a.nota),
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
