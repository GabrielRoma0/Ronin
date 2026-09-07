import {
  ALOCACOES,
  ANO_REFERENCIA,
  DIAS_NO_MES_REFERENCIA,
  MES_REFERENCIA,
  SALDO_FINAL_CENTS,
  SALDO_FINAL_CONSOLIDADO_CENTS,
  SEED_RNG,
} from "./generator-config";
import {
  CATEGORIAS_DESPESA,
  CATEGORIAS_INDICADOR_DISTRIBUICAO,
  CATEGORIAS_OUTRO,
  CATEGORIAS_RECEITA,
  type Banco,
  type Categoria,
} from "./categorias";
import { mulberry32, pickDayInMonth, splitCentsExact } from "@/lib/rng";

// ---------------------------------------------------------------------------
// Tipos de domínio (ver CLAUDE.md — estrutura de dados mock)
// ---------------------------------------------------------------------------

export interface Conta {
  banco: Banco;
  titular: string;
  cnpj: string;
}

export interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  contas: Conta[];
}

export interface Lancamento {
  id: string;
  data: string; // ISO yyyy-mm-dd
  descricao: string;
  categoria: Categoria;
  valor: number; // reais, sinal já aplicado
  conta: Banco;
}

export interface LinhaGrupo {
  categoria: Categoria;
  valor: number; // reais
  percentualDespesas?: number; // só preenchido para despesas
}

export interface Indicadores {
  totalReceitas: number;
  totalDespesas: number; // negativo
  resultadoOperacional: number;
  distribuicaoLucros: number; // negativo (indicador do período)
  resultadoFinal: number;
}

export interface Periodo {
  mes: number;
  ano: number;
  indicadores: Indicadores;
  receitas: LinhaGrupo[];
  despesas: LinhaGrupo[];
  outrosMovimentos: LinhaGrupo[];
  saldoFinal: number;
}

// ---------------------------------------------------------------------------
// Empresa de demonstração
// ---------------------------------------------------------------------------

export const EMPRESA_DEMO_ID = "empresa-demonstracao";

export const EMPRESA_DEMO: Empresa = {
  id: EMPRESA_DEMO_ID,
  nome: "Empresa Demonstração LTDA",
  cnpj: "00.000.000/0001-00",
  contas: [
    { banco: "Banco A", titular: "Titular Pessoa Física (MEI)", cnpj: "00.000.000/0002-01" },
    { banco: "Banco B", titular: "Empresa Demonstração LTDA", cnpj: "00.000.000/0001-00" },
  ],
};

export const EMPRESAS: Empresa[] = [EMPRESA_DEMO];

// ---------------------------------------------------------------------------
// Geração determinística dos lançamentos a partir de data/generator-config.ts
// ---------------------------------------------------------------------------

function gerarLancamentos(): Lancamento[] {
  const rng = mulberry32(SEED_RNG);
  const lancamentos: Lancamento[] = [];
  let seq = 0;

  for (const alocacao of ALOCACOES) {
    for (const porConta of alocacao.contas) {
      if (porConta.count <= 0 || porConta.totalCents === 0) continue;

      const sinal = porConta.totalCents < 0 ? -1 : 1;
      const partesCents = splitCentsExact(Math.abs(porConta.totalCents), porConta.count, rng);

      partesCents.forEach((cents, i) => {
        const dia = pickDayInMonth(rng, DIAS_NO_MES_REFERENCIA);
        const mesStr = String(MES_REFERENCIA).padStart(2, "0");
        const diaStr = String(dia).padStart(2, "0");
        seq += 1;
        lancamentos.push({
          id: `lanc-${seq}`,
          data: `${ANO_REFERENCIA}-${mesStr}-${diaStr}`,
          descricao: porConta.descricoes[i % porConta.descricoes.length],
          categoria: alocacao.categoria,
          valor: (sinal * cents) / 100,
          conta: porConta.conta,
        });
      });
    }
  }

  return lancamentos.sort((a, b) => a.data.localeCompare(b.data) || a.id.localeCompare(b.id));
}

export const LANCAMENTOS_EMPRESA_DEMO: Lancamento[] = gerarLancamentos();

// ---------------------------------------------------------------------------
// Derivação do resumo do período a partir dos lançamentos (fonte única de
// verdade — evita divergência entre "resumo" e "lançamentos").
// ---------------------------------------------------------------------------

function somaCategoria(lancamentos: Lancamento[], categoria: Categoria): number {
  return lancamentos
    .filter((l) => l.categoria === categoria)
    .reduce((acc, l) => acc + l.valor, 0);
}

function arredonda(valor: number): number {
  return Math.round(valor * 100) / 100;
}

/**
 * Monta o Periodo (resumo) de uma empresa, opcionalmente filtrado por conta.
 * `conta` vem sempre explícito do chamador — nunca um índice/posição global.
 */
export function getPeriodo(empresaId: string, conta?: Banco): Periodo | undefined {
  if (empresaId !== EMPRESA_DEMO_ID) return undefined;

  const base = conta
    ? LANCAMENTOS_EMPRESA_DEMO.filter((l) => l.conta === conta)
    : LANCAMENTOS_EMPRESA_DEMO;

  const receitas: LinhaGrupo[] = CATEGORIAS_RECEITA.map((categoria) => ({
    categoria,
    valor: arredonda(somaCategoria(base, categoria)),
  }));

  const totalDespesasBruto = CATEGORIAS_DESPESA.reduce(
    (acc, categoria) => acc + somaCategoria(base, categoria),
    0,
  );

  const despesas: LinhaGrupo[] = CATEGORIAS_DESPESA.map((categoria) => {
    const valor = arredonda(somaCategoria(base, categoria));
    const percentualDespesas =
      totalDespesasBruto !== 0 ? Math.abs(valor) / Math.abs(totalDespesasBruto) : 0;
    return { categoria, valor, percentualDespesas };
  });

  const outrosMovimentos: LinhaGrupo[] = CATEGORIAS_OUTRO.map((categoria) => ({
    categoria,
    valor: arredonda(somaCategoria(base, categoria)),
  }));

  const totalReceitas = arredonda(receitas.reduce((acc, r) => acc + r.valor, 0));
  const totalDespesas = arredonda(totalDespesasBruto);
  const resultadoOperacional = arredonda(totalReceitas + totalDespesas);
  const distribuicaoLucros = arredonda(
    CATEGORIAS_INDICADOR_DISTRIBUICAO.reduce(
      (acc, categoria) => acc + somaCategoria(base, categoria),
      0,
    ),
  );
  const resultadoFinal = arredonda(resultadoOperacional + distribuicaoLucros);

  const saldoFinal = conta
    ? SALDO_FINAL_CENTS[conta] / 100
    : SALDO_FINAL_CONSOLIDADO_CENTS / 100;

  return {
    mes: MES_REFERENCIA,
    ano: ANO_REFERENCIA,
    indicadores: {
      totalReceitas,
      totalDespesas,
      resultadoOperacional,
      distribuicaoLucros,
      resultadoFinal,
    },
    receitas,
    despesas,
    outrosMovimentos,
    saldoFinal,
  };
}

export function getLancamentos(empresaId: string, conta: Banco): Lancamento[] {
  if (empresaId !== EMPRESA_DEMO_ID) return [];
  return LANCAMENTOS_EMPRESA_DEMO.filter((l) => l.conta === conta);
}
