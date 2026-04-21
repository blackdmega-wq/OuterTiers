interface LogoProps {
  size?: number;
  className?: string;
  glow?: boolean;
  alt?: string;
}

/**
 * OuterTiers emblem — pure SVG, no text.
 * Hexagonal badge (à la modern tier-list sites): gold outer ring,
 * deep-blue inner field, an upright sword piercing a 3-bar tier stack.
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
        {/* Outer hex ring — gold */}
        <linearGradient id="ot-ring" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#fff3a0" />
          <stop offset="35%" stopColor="#ffd740" />
          <stop offset="70%" stopColor="#f0a800" />
          <stop offset="100%" stopColor="#7a4200" />
        </linearGradient>
        {/* Inner hex field — deep blue */}
        <linearGradient id="ot-field" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1d3a8a" />
          <stop offset="55%"  stopColor="#0e1f5c" />
          <stop offset="100%" stopColor="#050d2e" />
        </linearGradient>
        {/* Field highlight sweep */}
        <linearGradient id="ot-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.18)" />
          <stop offset="55%"  stopColor="rgba(255,255,255,0.0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.25)" />
        </linearGradient>
        {/* Sword blade */}
        <linearGradient id="ot-blade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="55%"  stopColor="#cfe1ff" />
          <stop offset="100%" stopColor="#7ab8ff" />
        </linearGradient>
        {/* Tier bars */}
        <linearGradient id="ot-bar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#ffe566" />
          <stop offset="100%" stopColor="#f0a800" />
        </linearGradient>
      </defs>

      {/* Outer hex ring */}
      <polygon
        points="64,4 116,32 116,96 64,124 12,96 12,32"
        fill="url(#ot-ring)"
      />
      {/* Inner hex field */}
      <polygon
        points="64,14 107,38 107,90 64,114 21,90 21,38"
        fill="url(#ot-field)"
      />
      {/* Sheen overlay on inner hex */}
      <polygon
        points="64,14 107,38 107,90 64,114 21,90 21,38"
        fill="url(#ot-sheen)"
      />

      {/* Tier bars (3, widening downward like a podium) */}
      <g stroke="#3a1f00" strokeWidth="1.5" strokeLinejoin="round">
        <rect x="48" y="70" width="32" height="6" rx="2" fill="url(#ot-bar)" opacity="0.95" />
        <rect x="42" y="80" width="44" height="6" rx="2" fill="url(#ot-bar)" opacity="0.85" />
        <rect x="36" y="90" width="56" height="6" rx="2" fill="url(#ot-bar)" opacity="0.75" />
      </g>

      {/* Upright sword piercing the bars */}
      {/* Pommel */}
      <circle cx="64" cy="22" r="4" fill="#ffe566" stroke="#3a1f00" strokeWidth="1.2" />
      {/* Grip */}
      <rect x="62" y="26" width="4" height="10" rx="1" fill="#7a4200" />
      {/* Guard */}
      <rect x="50" y="36" width="28" height="5" rx="1.5" fill="#ffd740" stroke="#3a1f00" strokeWidth="1.2" />
      {/* Blade */}
      <polygon
        points="60,42 68,42 68,98 64,104 60,98"
        fill="url(#ot-blade)"
        stroke="#1d3a8a"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* Blade fuller (center groove) */}
      <line x1="64" y1="44" x2="64" y2="96" stroke="rgba(29,58,138,0.55)" strokeWidth="1" />
    </svg>
  );
}
