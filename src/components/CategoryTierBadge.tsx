import type { TierLevel } from '../data/players';
import { CATEGORIES } from '../data/players';

const TIER_STYLES: Record<string, { border: string; glow: string; text: string; bg: string }> = {
  T1: { border: '#c8a020', glow: 'rgba(212,160,23,0.55)',  text: '#f0c040', bg: 'rgba(212,160,23,0.12)' },
  T2: { border: '#5ba4f5', glow: 'rgba(91,164,245,0.45)',  text: '#7ab8ff', bg: 'rgba(91,164,245,0.10)' },
  T3: { border: '#4cc768', glow: 'rgba(76,199,104,0.40)',  text: '#5ddb78', bg: 'rgba(76,199,104,0.09)' },
  T4: { border: '#c07ef5', glow: 'rgba(192,126,245,0.35)', text: '#cf97f8', bg: 'rgba(192,126,245,0.09)' },
  T5: { border: '#555',    glow: 'rgba(120,120,120,0.15)', text: '#888',    bg: 'rgba(80,80,80,0.08)' },
};

interface CategoryTierBadgeProps {
  categoryId: string;
  tier: TierLevel;
  rawTier?: string | null;
}

export default function CategoryTierBadge({ categoryId, tier, rawTier }: CategoryTierBadgeProps) {
  const cat = CATEGORIES.find(c => c.id === categoryId);
  const icon = cat?.icon ?? '';

  const displayLabel = rawTier ?? tier;

  if (tier === '-') {
    return (
      <div className="cat-tier-badge cat-tier-badge-empty">
        <div className="cat-tier-circle cat-tier-circle-empty">
          {icon && <img src={icon} alt={categoryId} width={16} height={16} style={{ opacity: 0.3 }} />}
        </div>
        <span className="cat-tier-text" style={{ color: '#3a3a4a' }}>—</span>
      </div>
    );
  }

  const s = TIER_STYLES[tier] ?? TIER_STYLES['T5'];

  return (
    <div className="cat-tier-badge">
      <div
        className="cat-tier-circle"
        style={{
          borderColor: s.border,
          boxShadow: `0 0 7px ${s.glow}, inset 0 0 6px ${s.bg}`,
          background: s.bg,
        }}
      >
        {icon && <img src={icon} alt={categoryId} width={16} height={16} />}
      </div>
      <span className="cat-tier-text" style={{ color: s.text }}>{displayLabel}</span>
    </div>
  );
}
