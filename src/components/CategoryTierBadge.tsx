import type { TierLevel } from '../data/players';
import { CATEGORIES } from '../data/players';

const TIER_STYLES: Record<string, { border: string; glow: string; text: string }> = {
  T1: { border: '#1565c0', glow: 'rgba(21,101,192,0.4)',  text: '#5ba4f5' },
  T2: { border: '#2e7d32', glow: 'rgba(46,125,50,0.4)',   text: '#4cc768' },
  T3: { border: '#6a1b9a', glow: 'rgba(106,27,154,0.4)',  text: '#c07ef5' },
  T4: { border: '#b8860b', glow: 'rgba(184,134,11,0.35)', text: '#d4a017' },
  T5: { border: '#424242', glow: 'rgba(66,66,66,0.2)',    text: '#888' },
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
        <span className="cat-tier-text" style={{ color: '#444' }}>-</span>
      </div>
    );
  }

  const s = TIER_STYLES[tier] ?? TIER_STYLES['T5'];

  return (
    <div className="cat-tier-badge">
      <div
        className="cat-tier-circle"
        style={{ borderColor: s.border, boxShadow: `0 0 6px ${s.glow}` }}
      >
        {icon && <img src={icon} alt={categoryId} width={16} height={16} />}
      </div>
      <span className="cat-tier-text" style={{ color: s.text }}>{tier}</span>
    </div>
  );
}
