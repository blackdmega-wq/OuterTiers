interface LogoProps {
  size?: number;
  className?: string;
  glow?: boolean;
  alt?: string;
}

/**
 * OuterTiers emblem — pure SVG, no text in the artwork.
 * A shield with crossed swords + a tier-stack glyph.
 */
export default function Logo({ size = 96, className = '', glow = true, alt = 'OuterTiers logo' }: LogoProps) {
  return (
    <svg
      role="img"
      aria-label={alt}
      width={size}
      height={size}
      viewBox="0 0 128 128"
      className={`ot-logo${glow ? ' ot-logo-glow' : ''} ${className}`}
      style={{ width: size, height: size, display: 'block' }}
    >
      <defs>
        <linearGradient id="ot-shield" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7ab8ff" />
          <stop offset="55%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1035a0" />
        </linearGradient>
        <linearGradient id="ot-shield-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe566" />
          <stop offset="100%" stopColor="#c88010" />
        </linearGradient>
        <linearGradient id="ot-blade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#cfe1ff" />
          <stop offset="100%" stopColor="#7ab8ff" />
        </linearGradient>
      </defs>

      {/* Shield body */}
      <path
        d="M64 6 L112 22 V62 C112 92 92 112 64 122 C36 112 16 92 16 62 V22 Z"
        fill="url(#ot-shield)"
        stroke="url(#ot-shield-edge)"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Inner highlight */}
      <path
        d="M64 16 L102 28 V62 C102 86 86 102 64 110 C42 102 26 86 26 62 V28 Z"
        fill="rgba(255,255,255,0.06)"
      />

      {/* Crossed swords */}
      <g stroke="url(#ot-blade)" strokeWidth="6" strokeLinecap="round" fill="none">
        <line x1="34" y1="38" x2="92" y2="96" />
        <line x1="92" y1="38" x2="34" y2="96" />
      </g>
      {/* Sword guards */}
      <g fill="#f0c040" stroke="#7a4200" strokeWidth="1.5">
        <rect x="26" y="32" width="16" height="4" rx="1" transform="rotate(45 34 34)" />
        <rect x="86" y="32" width="16" height="4" rx="1" transform="rotate(-45 94 34)" />
      </g>

      {/* Center tier-stack glyph */}
      <g fill="#ffd740" stroke="#7a4200" strokeWidth="1.5" strokeLinejoin="round">
        <rect x="50" y="58" width="28" height="6"  rx="1.5" />
        <rect x="46" y="68" width="36" height="6"  rx="1.5" opacity="0.85" />
        <rect x="42" y="78" width="44" height="6"  rx="1.5" opacity="0.7" />
      </g>

      {/* Top notch jewel */}
      <circle cx="64" cy="22" r="3.5" fill="#ffe566" stroke="#7a4200" strokeWidth="1" />
    </svg>
  );
}
