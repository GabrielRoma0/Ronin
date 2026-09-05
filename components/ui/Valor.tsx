import { corValor, formatBRL } from "@/lib/format";

export function Valor({ valor, className = "" }: { valor: number; className?: string }) {
  return (
    <span className={`tabular-money font-medium ${corValor(valor)} ${className}`}>
      {formatBRL(valor)}
    </span>
  );
}
