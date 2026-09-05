"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LinhaGrupo } from "@/data/seed";
import { CORES_GRUPO_DESPESA, type CategoriaDespesa } from "@/data/categorias";
import { formatBRL } from "@/lib/format";

export function DespesasChart({ despesas }: { despesas: LinhaGrupo[] }) {
  const dados = despesas
    .filter((d) => d.valor !== 0)
    .map((d) => ({ categoria: d.categoria, valorAbs: Math.abs(d.valor) }))
    .sort((a, b) => b.valorAbs - a.valorAbs);

  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={dados}
          layout="vertical"
          margin={{ top: 4, right: 24, bottom: 4, left: 4 }}
          barCategoryGap={6}
        >
          <CartesianGrid horizontal={false} stroke="var(--color-ink-100)" />
          <XAxis
            type="number"
            tickFormatter={(v: number) => formatBRL(v)}
            tick={{ fontSize: 11, fill: "var(--color-ink-400)" }}
            axisLine={{ stroke: "var(--color-ink-200)" }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="categoria"
            width={190}
            tick={{ fontSize: 12, fill: "var(--color-ink-700)" }}
            axisLine={{ stroke: "var(--color-ink-200)" }}
            tickLine={false}
          />
          <Tooltip
            formatter={(v) => formatBRL(Number(v))}
            contentStyle={{
              borderRadius: 8,
              borderColor: "var(--color-ink-200)",
              fontSize: 12,
            }}
          />
          <Bar dataKey="valorAbs" radius={[0, 4, 4, 0]}>
            {dados.map((d) => (
              <Cell
                key={d.categoria}
                fill={CORES_GRUPO_DESPESA[d.categoria as CategoriaDespesa]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
