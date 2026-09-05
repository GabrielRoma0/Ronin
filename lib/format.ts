const formatterBRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const formatterPercent = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatBRL(valor: number): string {
  // Evita "-R$ 0,00" para valores que arredondam para zero.
  const v = Object.is(valor, -0) ? 0 : valor;
  return formatterBRL.format(v);
}

export function formatPercent(valor: number): string {
  return formatterPercent.format(valor);
}

export function formatDataCurta(iso: string): string {
  const [, mes, dia] = iso.split("-");
  return `${dia}/${mes}`;
}

export function corValor(valor: number): string {
  if (valor < 0) return "text-red-600";
  if (valor > 0) return "text-emerald-600";
  return "text-ink-500";
}

const NOME_MES = [
  "",
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function nomeMes(mes: number): string {
  return NOME_MES[mes] ?? "";
}
