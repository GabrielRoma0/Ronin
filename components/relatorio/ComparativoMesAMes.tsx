"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ComparativoMesAMes as ComparativoMesAMesData } from "@/lib/data/graficos";
import { formatBRL } from "@/lib/format";

export function ComparativoMesAMes({ dados }: { dados: ComparativoMesAMesData }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados.linhas} margin={{ top: 4, right: 8, bottom: 4, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-ink-100)" />
          <XAxis
            dataKey="indicador"
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
          <Bar dataKey="anterior" name={dados.labelAnterior} fill="var(--color-ink-200)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="atual" name={dados.labelAtual} fill="var(--color-brass-600)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
