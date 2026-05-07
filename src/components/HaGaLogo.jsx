/**
 * HaGA Official Logo — H+G SVG from Brand Book
 * variant: 'grad' | 'light' | 'white'
 * grad  → #1536C8 → #2563EB → #38BDF8 (default, dark bg)
 * light → #60A5FA → #67E8F9 (lighter, for dark backgrounds)
 * white → solid white
 */
export default function HaGaLogo({ width = 48, variant = 'grad', className = '' }) {
  const uid = `hg-${width}-${variant}`;

  const stops = {
    grad:  [['#1536C8', '0'], ['#2563EB', '.5'], ['#38BDF8', '1']],
    light: [['#60A5FA', '0'], ['#67E8F9', '1']],
  };

  const fill = variant === 'white' ? 'white' : `url(#${uid})`;

  return (
    <svg
      width={width}
      viewBox="0 0 240 170"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ flexShrink: 0 }}
    >
      {variant !== 'white' && (
        <defs>
          <linearGradient id={uid} x1="0" y1="0" x2="240" y2="170" gradientUnits="userSpaceOnUse">
            {stops[variant].map(([color, offset]) => (
              <stop key={offset} stopColor={color} offset={offset}/>
            ))}
          </linearGradient>
        </defs>
      )}

      {/* H — left vertical bar */}
      <rect x="10" y="20" width="28" height="130" rx="4" fill={fill}/>
      {/* H — crossbar */}
      <rect x="10" y="68" width="90" height="34" rx="4" fill={fill}/>
      {/* H — right vertical bar */}
      <rect x="72" y="20" width="28" height="130" rx="4" fill={fill}/>
      {/* G — curved path */}
      <path
        d="M130 150C85 150 72 110 80 75C88 35 130 20 165 30C185 36 195 50 200 68H165C160 56 148 50 135 52C118 55 110 72 112 92C114 112 128 126 148 124C162 122 172 114 174 102H150V82H205V150H185V135C175 145 162 152 148 152L130 150Z"
        fill={fill}
      />
    </svg>
  );
}
