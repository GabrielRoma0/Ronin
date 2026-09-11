/**
 * Riscos de pincel vermelhos decorativos nos cantos, como nas artes de
 * divulgação da Ronin. A forma "pintada" (não uma elipse perfeita) vem de
 * um filtro de turbulência distorcendo elipses simples — mais confiável e
 * mais barato que tentar acertar uma curva bézier irregular à mão.
 */
export function BrushMarks() {
  return (
    <>
      <svg
        aria-hidden
        viewBox="0 0 300 300"
        className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 opacity-90 sm:h-[28rem] sm:w-[28rem]"
      >
        <filter id="brush-rough-a">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.06" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="26" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <g filter="url(#brush-rough-a)">
          <ellipse cx="90" cy="70" rx="170" ry="34" transform="rotate(-24 90 70)" fill="var(--color-blood-700)" />
          <ellipse cx="55" cy="115" rx="120" ry="20" transform="rotate(-16 55 115)" fill="var(--color-blood-600)" />
        </g>
      </svg>

      <svg
        aria-hidden
        viewBox="0 0 300 300"
        className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 opacity-90 sm:h-[28rem] sm:w-[28rem]"
      >
        <filter id="brush-rough-b">
          <feTurbulence type="fractalNoise" baseFrequency="0.014 0.055" numOctaves="2" seed="13" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="26" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <g filter="url(#brush-rough-b)">
          <ellipse cx="210" cy="230" rx="170" ry="34" transform="rotate(-24 210 230)" fill="var(--color-blood-700)" />
          <ellipse cx="245" cy="185" rx="120" ry="20" transform="rotate(-16 245 185)" fill="var(--color-blood-600)" />
        </g>
      </svg>
    </>
  );
}
