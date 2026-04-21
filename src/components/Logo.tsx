interface LogoProps {
  size?: number;
  className?: string;
  glow?: boolean;
  alt?: string;
}

export default function Logo({ size = 96, className = '', glow = true, alt = 'OuterTiers logo' }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt={alt}
      width={size}
      height={size}
      className={`ot-logo${glow ? ' ot-logo-glow' : ''} ${className}`}
      draggable={false}
      style={{ width: size, height: size }}
    />
  );
}
