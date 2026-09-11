"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PontoEvolucao } from "@/lib/data/graficos";
import { formatBRL } from "@/lib/format";

export function EvolucaoFinanceira({ pontos }: { pontos: PontoEvolucao[] }) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={pontos} margin={{ top: 4, right: 8, bottom: 4, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-ink-100)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "var(--color-ink-700)" }}
            axisLine={{ stroke: "var(--color-ink-200)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--color-ink-400)" }}
            tickFormatter={(v: number) => formatBRL(v)}
            axisLine={{ stroke: "var(--color-ink-200)" }}
            tickLine={false}
            width={72}
          />
          <Tooltip
            formatter={(v) => formatBRL(Number(v))}
            contentStyle={{ borderRadius: 8, borderColor: "var(--color-ink-200)", fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="entradas" name="Entradas" fill="#059669" radius={[4, 4, 0, 0]} />
          <Bar dataKey="saidas" name="Saídas" fill="#dc2626" radius={[4, 4, 0, 0]} />
          <Line
            type="monotone"
            dataKey="resultado"
            name="Resultado"
            stroke="var(--color-brass-700)"
            strokeWidth={2.5}
            dot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
