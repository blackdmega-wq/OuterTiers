import type { TierLevel } from '../data/players';

const TIER_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  HT1: { bg: 'rgba(241,196,15,0.12)', color: '#f1c40f', border: '#f1c40f' },
  LT1: { bg: 'rgba(212,179,84,0.12)', color: '#d4b354', border: '#d4b354' },
  HT2: { bg: 'rgba(164,178,199,0.12)', color: '#a4b2c7', border: '#a4b2c7' },
  LT2: { bg: 'rgba(136,141,149,0.12)', color: '#888d95', border: '#888d95' },
  HT3: { bg: 'rgba(223,135,70,0.12)', color: '#df8746', border: '#df8746' },
  LT3: { bg: 'rgba(179,105,50,0.12)', color: '#b36932', border: '#b36932' },
  HT4: { bg: 'rgba(70,223,93,0.12)', color: '#46df5d', border: '#46df5d' },
  LT4: { bg: 'rgba(49,146,40,0.12)', color: '#319228', border: '#319228' },
  HT5: { bg: 'rgba(164,213,255,0.12)', color: '#a4d5ff', border: '#a4d5ff' },
  LT5: { bg: 'rgba(164,213,255,0.12)', color: '#a4d5ff', border: '#a4d5ff' },
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
