import type { TierLevel } from '../data/players';

const TIER_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  HT1: { bg: '#1a2744', color: '#4fc3f7', border: '#1565c0' },
  HT2: { bg: '#1a2c1a', color: '#81c784', border: '#2e7d32' },
  HT3: { bg: '#2d1a2d', color: '#ce93d8', border: '#6a1b9a' },
  HT4: { bg: '#2c2010', color: '#ffb74d', border: '#e65100' },
  LT1: { bg: '#1a1a2d', color: '#7986cb', border: '#283593' },
  LT2: { bg: '#1f2d1a', color: '#a5d6a7', border: '#388e3c' },
  LT3: { bg: '#1a2020', color: '#80cbc4', border: '#00695c' },
  LT4: { bg: '#2d2020', color: '#ef9a9a', border: '#b71c1c' },
  LT5: { bg: '#1e1e1e', color: '#bdbdbd', border: '#424242' },
};

interface TierBadgeProps {
  tier: TierLevel;
  size?: 'sm' | 'md';
}

export default function TierBadge({ tier, size = 'sm' }: TierBadgeProps) {
  if (tier === '-') {
    return <span className={`tier-badge tier-badge-empty tier-badge-${size}`}>-</span>;
  }

  const colors = TIER_COLORS[tier] || TIER_COLORS['LT5'];

  return (
    <span
      className={`tier-badge tier-badge-${size}`}
      style={{
        backgroundColor: colors.bg,
        color: colors.color,
        border: `1px solid ${colors.border}`,
      }}
    >
      {tier}
    </span>
  );
}
