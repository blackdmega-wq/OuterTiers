import type { TierLevel } from '../data/players';
import { CATEGORIES } from '../data/players';

const TIER_BORDER: Record<string, string> = {
  HT1: '#1565c0',
  HT2: '#2e7d32',
  HT3: '#6a1b9a',
  HT4: '#e65100',
  LT1: '#283593',
  LT2: '#388e3c',
  LT3: '#00695c',
  LT4: '#b71c1c',
  LT5: '#424242',
};

const TIER_GLOW: Record<string, string> = {
  HT1: 'rgba(21,101,192,0.35)',
  HT2: 'rgba(46,125,50,0.35)',
  HT3: 'rgba(106,27,154,0.35)',
  HT4: 'rgba(230,81,0,0.35)',
  LT1: 'rgba(40,53,147,0.35)',
  LT2: 'rgba(56,142,60,0.35)',
  LT3: 'rgba(0,105,92,0.35)',
  LT4: 'rgba(183,28,28,0.35)',
  LT5: 'rgba(66,66,66,0.20)',
};

interface CategoryTierBadgeProps {
  categoryId: string;
  tier: TierLevel;
}

export default function CategoryTierBadge({ categoryId, tier }: CategoryTierBadgeProps) {
  const cat = CATEGORIES.find(c => c.id === categoryId);
  const icon = cat?.icon ?? '';

  if (tier === '-') {
    return (
      <div className="cat-tier-badge cat-tier-badge-empty">
        <div className="cat-tier-circle cat-tier-circle-empty">
          {icon && <img src={icon} alt={categoryId} width={16} height={16} />}
        </div>
        <span className="cat-tier-text">-</span>
      </div>
    );
  }

  const border = TIER_BORDER[tier] ?? '#424242';
  const glow = TIER_GLOW[tier] ?? 'transparent';

  return (
    <div className="cat-tier-badge">
      <div
        className="cat-tier-circle"
        style={{ borderColor: border, boxShadow: `0 0 6px ${glow}` }}
      >
        {icon && <img src={icon} alt={categoryId} width={16} height={16} />}
      </div>
      <span className="cat-tier-text" style={{ color: border }}>{tier}</span>
    </div>
  );
}
