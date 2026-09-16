"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import type { Periodo } from "@/data/seed";
import type { ContaReal, LancamentoReal } from "@/lib/data/relatorio";
import type { AvaliacaoFuncionario, FuncionarioReal, PagamentoFuncionario } from "@/lib/data/funcionarios";
import type { DashboardKPIs } from "@/lib/data/dashboard";
import type { ComparativoMesAMes as ComparativoMesAMesData, PontoEvolucao } from "@/lib/data/graficos";
import type { SocioReal } from "@/lib/data/socios";
import type { InsumoReal, ItemCardapioReal } from "@/lib/data/cmv";
import { ResumoTab } from "./ResumoTab";
import { AIReportCard } from "./AIReportCard";
import { NovaContaForm } from "@/components/contas/NovaContaForm";
import { DashboardInicial } from "@/components/dashboard/DashboardInicial";

/**
 * Carregadas sob demanda (só quando a aba é aberta), não no bundle inicial
 * do /painel — Comparativos e Funcionários puxam Recharts (~430KB), que não
 * tem por que baixar e parsear em quem só olha o Dashboard. Antes disso, o
 * chunk do Recharts era o recurso mais lento do carregamento do painel
 * mesmo sem nenhuma dessas abas estar aberta.
 */
const LancamentosTab = dynamic(() => import("./LancamentosTab").then((m) => m.LancamentosTab));
const FuncionariosTab = dynamic(() =>
  import("@/components/funcionarios/FuncionariosTab").then((m) => m.FuncionariosTab),
);
const ComparativosTab = dynamic(() => import("./ComparativosTab").then((m) => m.ComparativosTab));
const DivisaoLucrosTab = dynamic(() =>
  import("@/components/socios/DivisaoLucrosTab").then((m) => m.DivisaoLucrosTab),
);
const CustoMercadoriaTab = dynamic(() =>
  import("@/components/cmv/CustoMercadoriaTab").then((m) => m.CustoMercadoriaTab),
);

interface RelatorioAppProps {
  empresaId: string;
  empresaNome: string;
  empresaCnpj: string | null;
  /** Contas reais da empresa — pode ser 0, 1 ou N; nada aqui assume exatamente duas. */
  contas: ContaReal[];
  kpis: DashboardKPIs;
  comparativoMesAMes: ComparativoMesAMesData;
  evolucao6Meses: PontoEvolucao[];
  periodoConsolidado: Periodo;
  /** Chave = conta.id */
  periodosPorConta: Record<string, Periodo>;
  lancamentosPorConta: Record<string, LancamentoReal[]>;
  funcionarios: FuncionarioReal[];
  pagamentosFuncionarios: PagamentoFuncionario[];
  avaliacoesFuncionarios: AvaliacaoFuncionario[];
  socios: SocioReal[];
  insumos: InsumoReal[];
  itensCardapio: ItemCardapioReal[];
  /** Link pra tela de importação (caixa do dia / CSV / nota fiscal) desta empresa. */
  importarHref: string;
}

type Aba =
  | { tipo: "dashboard" }
  | { tipo: "cmv" }
  | { tipo: "comparativos" }
  | { tipo: "funcionarios" }
  | { tipo: "socios" }
  | { tipo: "resumo-conta"; contaId: string }
  | { tipo: "lancamentos-conta"; contaId: string };

interface ItemNav {
  aba: Aba;
  label: string;
}

interface SecaoNav {
  titulo?: string;
  itens: ItemNav[];
}

function chaveAba(aba: Aba): string {
  if (
    aba.tipo === "dashboard" ||
    aba.tipo === "cmv" ||
    aba.tipo === "comparativos" ||
    aba.tipo === "funcionarios" ||
    aba.tipo === "socios"
  )
    return aba.tipo;
  return `${aba.tipo}-${aba.contaId}`;
}

/**
 * Componente único usado tanto pela Visão Cliente quanto pelo detalhe da
 * Visão Admin. Todos os dados chegam já resolvidos via props (buscados no
 * servidor por lib/data/relatorio.ts, respeitando RLS) — este componente
 * nunca busca nada por conta própria a partir de estado global.
 *
 * Navegação em menu lateral (não mais abas horizontais): com Dashboard,
 * Comparativos, Funcionários, Divisão de Lucros e Resumo+Lançamentos de
 * cada conta, uma barra horizontal vira uma faixa rolável impraticável
 * assim que a empresa cadastra 2-3 contas. Fixo à esquerda no desktop,
 * vira gaveta (drawer) no celular.
 */
export function RelatorioApp({
  empresaId,
  empresaNome,
  empresaCnpj,
  contas,
  kpis,
  comparativoMesAMes,
  evolucao6Meses,
  periodoConsolidado,
  periodosPorConta,
  lancamentosPorConta,
  funcionarios,
  pagamentosFuncionarios,
  avaliacoesFuncionarios,
  socios,
  insumos,
  itensCardapio,
  importarHref,
}: RelatorioAppProps) {
  const [aba, setAba] = useState<Aba>({ tipo: "dashboard" });
  const [menuAberto, setMenuAberto] = useState(false);

  const secoes: SecaoNav[] = [
    {
      itens: [
        { aba: { tipo: "dashboard" }, label: "Dashboard" },
        { aba: { tipo: "cmv" }, label: "Custo de Mercadoria" },
        { aba: { tipo: "comparativos" }, label: "Comparativos" },
        { aba: { tipo: "funcionarios" }, label: "Funcionários" },
        { aba: { tipo: "socios" }, label: "Divisão de Lucros" },
      ],
    },
  ];

  if (contas.length > 0) {
    secoes.push({
      titulo: "Contas",
      itens: contas.flatMap((conta) => [
        { aba: { tipo: "resumo-conta" as const, contaId: conta.id }, label: `Resumo — ${conta.banco}` },
        { aba: { tipo: "lancamentos-conta" as const, contaId: conta.id }, label: `Lançamentos — ${conta.banco}` },
      ]),
    });
  }

  function selecionar(novaAba: Aba) {
    setAba(novaAba);
    setMenuAberto(false);
  }

  const nomesContas = contas.map((c) => c.banco).join(" + ") || "nenhuma conta cadastrada";

  const conteudoNav = (
    <nav className="flex flex-col gap-5">
      {secoes.map((secao, indice) => (
        <div key={secao.titulo ?? `secao-${indice}`} className="flex flex-col gap-1">
          {secao.titulo && (
            <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-ink-300">
              {secao.titulo}
            </p>
          )}
          {secao.itens.map((item) => (
            <button
              key={chaveAba(item.aba)}
              type="button"
              onClick={() => selecionar(item.aba)}
              className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                chaveAba(aba) === chaveAba(item.aba)
                  ? "bg-ink-900 text-brass-300"
                  : "text-ink-500 hover:bg-paper-200 hover:text-ink-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      ))}
    </nav>
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
            {empresaCnpj ?? "CNPJ pendente"}
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink-900">{empresaNome}</h1>
          <p className="mt-1 text-sm text-ink-400">
            {contas.length === 0
              ? "Nenhuma conta bancária cadastrada ainda"
              : contas.map((c) => `${c.banco} · ${c.titular}`).join("  ·  ")}
          </p>
          <div className="mt-2">
            <NovaContaForm empresaId={empresaId} />
          </div>
        </div>
        <Link
          href={importarHref}
          className="flex w-full items-center justify-center rounded-xl border border-ink-200 bg-paper-50 px-4 py-2.5 text-center text-sm font-medium text-ink-700 transition-colors hover:border-ink-400 sm:w-auto"
        >
          Adicionar lançamentos
        </Link>
      </div>

      <button
        type="button"
        onClick={() => setMenuAberto(true)}
        className="flex items-center gap-2 self-start rounded-lg border border-ink-200 bg-paper-50 px-3 py-2 text-sm font-medium text-ink-700 lg:hidden"
      >
        <span aria-hidden>☰</span> Navegar pelo relatório
      </button>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="hidden shrink-0 lg:block lg:w-60">
          <div className="sticky top-6 rounded-xl border border-ink-200 bg-paper-50 p-3">{conteudoNav}</div>
        </aside>

        {menuAberto && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-ink-900/50"
              onClick={() => setMenuAberto(false)}
              aria-hidden
            />
            <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto bg-paper-50 p-4 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-display text-sm font-semibold text-ink-900">Navegação</span>
                <button
                  type="button"
                  onClick={() => setMenuAberto(false)}
                  aria-label="Fechar menu"
                  className="text-ink-400 hover:text-ink-700"
                >
                  ✕
                </button>
              </div>
              {conteudoNav}
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1">
          {aba.tipo === "dashboard" && (
            <div className="flex flex-col gap-8">
              <DashboardInicial kpis={kpis} />
              <AIReportCard periodo={periodoConsolidado} />
              <ResumoTab periodo={periodoConsolidado} subtitulo={`Consolidado (${nomesContas})`} />
            </div>
          )}
          {aba.tipo === "cmv" && (
            <CustoMercadoriaTab empresaId={empresaId} insumos={insumos} itens={itensCardapio} />
          )}
          {aba.tipo === "comparativos" && (
            <ComparativosTab comparativo={comparativoMesAMes} evolucao={evolucao6Meses} />
          )}
          {aba.tipo === "funcionarios" && (
            <FuncionariosTab
              empresaId={empresaId}
              funcionarios={funcionarios}
              contas={contas}
              pagamentosRecentes={pagamentosFuncionarios}
              avaliacoes={avaliacoesFuncionarios}
            />
          )}
          {aba.tipo === "socios" && (
            <DivisaoLucrosTab
              empresaId={empresaId}
              socios={socios}
              resultadoOperacional={periodoConsolidado.indicadores.resultadoOperacional}
              mes={periodoConsolidado.mes}
              ano={periodoConsolidado.ano}
            />
          )}
          {aba.tipo === "resumo-conta" &&
            (() => {
              const conta = contas.find((c) => c.id === aba.contaId);
              const periodo = periodosPorConta[aba.contaId];
              if (!conta || !periodo) return null;
              return <ResumoTab periodo={periodo} subtitulo={`Conta ${conta.banco}`} />;
            })()}
          {aba.tipo === "lancamentos-conta" &&
            (() => {
              const conta = contas.find((c) => c.id === aba.contaId);
              if (!conta) return null;
              return (
                <LancamentosTab conta={conta.banco} lancamentos={lancamentosPorConta[aba.contaId] ?? []} />
              );
            })()}
        </div>
      </div>
    </div>
  );
}
