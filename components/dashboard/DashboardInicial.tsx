import type { DashboardKPIs, KpiComDelta } from "@/lib/data/dashboard";
import { formatBRL, formatPercent } from "@/lib/format";

function IconeEntradas() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M12 3v12" strokeLinecap="round" />
      <path d="M7 10l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 20h16" strokeLinecap="round" />
    </svg>
  );
}

function IconeSaidas() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M12 21V9" strokeLinecap="round" />
      <path d="M7 14l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 4h16" strokeLinecap="round" />
    </svg>
  );
}

function IconeResultado() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M4 19h16" strokeLinecap="round" />
      <path d="M6 19v-5M11 19V8M16 19v-9" strokeLinecap="round" />
    </svg>
  );
}

function IconeSaldo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M3 10l9-6 9 6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9M10 10v9M14 10v9M19 10v9" strokeLinecap="round" />
      <path d="M3 19h18" strokeLinecap="round" />
    </svg>
  );
}

interface CardConfig {
  titulo: string;
  kpi: KpiComDelta;
  icone: React.ReactNode;
  /** Quando true, um delta positivo é uma notícia ruim (ex.: saídas subindo). */
  invertido?: boolean;
}

function CorDoDelta(deltaPercent: number, invertido: boolean): string {
  const bom = invertido ? deltaPercent < 0 : deltaPercent > 0;
  const ruim = invertido ? deltaPercent > 0 : deltaPercent < 0;
  if (bom) return "text-emerald-600";
  if (ruim) return "text-red-600";
  return "text-ink-400";
}

function KpiCard({ titulo, kpi, icone, invertido = false }: CardConfig) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-ink-200 bg-paper-50 p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{titulo}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 text-brass-300">
          {icone}
        </span>
      </div>

      <p className="tabular-money font-display text-2xl font-semibold text-ink-900">
        {kpi.valor === null ? "—" : formatBRL(kpi.valor)}
      </p>

      <p className={`text-xs font-medium ${kpi.deltaPercent === null ? "text-ink-300" : CorDoDelta(kpi.deltaPercent, invertido)}`}>
        {kpi.deltaPercent === null
          ? "Sem dado do mês anterior"
          : `${kpi.deltaPercent >= 0 ? "▲" : "▼"} ${formatPercent(Math.abs(kpi.deltaPercent))} vs. mês anterior`}
      </p>
    </div>
  );
}

/**
 * Dash inicial visual do dono — substitui a antiga aba "Resumo Consolidado"
 * como primeira tela do relatório. Os 4 números vêm de `getDashboardKPIs`,
 * sempre calculados a partir de lançamentos/saldos reais — zerado é o estado
 * correto enquanto não houver lançamento nenhum no banco.
 */
export function DashboardInicial({ kpis }: { kpis: DashboardKPIs }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard titulo="Entradas" kpi={kpis.entradas} icone={<IconeEntradas />} />
      <KpiCard titulo="Saídas" kpi={kpis.saidas} icone={<IconeSaidas />} invertido />
      <KpiCard titulo="Resultado do Mês" kpi={kpis.resultadoDoMes} icone={<IconeResultado />} />
      <KpiCard titulo="Saldo em Contas" kpi={kpis.saldoEmContas} icone={<IconeSaldo />} />
    </div>
  );
}
