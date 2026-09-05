/**
 * PRNG determinístico (mulberry32) usado só para gerar os lançamentos de
 * demonstração. Determinístico de propósito: a demo precisa mostrar sempre
 * os mesmos números entre reloads/apresentações.
 */
export function mulberry32(seed: number) {
  let a = seed;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Divide `totalCents` em `count` partes inteiras (centavos) que somam
 * exatamente `totalCents`. O último item absorve o resto do arredondamento,
 * garantindo soma exata mesmo com valores "aleatórios" nos demais.
 */
export function splitCentsExact(
  totalCents: number,
  count: number,
  rng: () => number,
): number[] {
  if (count <= 1) return [totalCents];

  const weights = Array.from({ length: count }, () => 0.5 + rng());
  const weightSum = weights.reduce((a, b) => a + b, 0);

  const parts = weights
    .slice(0, count - 1)
    .map((w) => Math.round(totalCents * (w / weightSum)));

  let usedSum = parts.reduce((a, b) => a + b, 0);
  let last = totalCents - usedSum;

  // Garante que o último item fique com pelo menos 1 centavo plausível,
  // tirando a diferença do maior item já gerado.
  if (last < 1) {
    const deficit = 1 - last;
    const maxIdx = parts.indexOf(Math.max(...parts));
    parts[maxIdx] -= deficit;
    usedSum = parts.reduce((a, b) => a + b, 0);
    last = totalCents - usedSum;
  }

  return [...parts, last];
}

export function pickIndex(rng: () => number, length: number): number {
  return Math.min(length - 1, Math.floor(rng() * length));
}

export function pickDayInMonth(rng: () => number, daysInMonth: number): number {
  return 1 + Math.floor(rng() * daysInMonth);
}
