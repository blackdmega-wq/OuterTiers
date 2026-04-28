import type { TierLevel } from '../data/players';
import { CATEGORIES } from '../data/players';

const RAW_TIER_STYLES: Record<string, { border: string; glow: string; text: string; bg: string }> = {
  HT1: { border: '#f1c40f', glow: 'rgba(241,196,15,0.55)',  text: '#f1c40f', bg: 'rgba(241,196,15,0.12)' },
  LT1: { border: '#d4b354', glow: 'rgba(212,179,84,0.45)',  text: '#d4b354', bg: 'rgba(212,179,84,0.12)' },
  HT2: { border: '#a4b2c7', glow: 'rgba(164,178,199,0.45)', text: '#a4b2c7', bg: 'rgba(164,178,199,0.12)' },
  LT2: { border: '#888d95', glow: 'rgba(136,141,149,0.40)', text: '#888d95', bg: 'rgba(136,141,149,0.12)' },
  HT3: { border: '#df8746', glow: 'rgba(223,135,70,0.50)',  text: '#df8746', bg: 'rgba(223,135,70,0.12)' },
  LT3: { border: '#b36932', glow: 'rgba(179,105,50,0.45)',  text: '#b36932', bg: 'rgba(179,105,50,0.12)' },
  HT4: { border: '#46df5d', glow: 'rgba(70,223,93,0.50)',   text: '#46df5d', bg: 'rgba(70,223,93,0.12)' },
  LT4: { border: '#319228', glow: 'rgba(49,146,40,0.45)',   text: '#319228', bg: 'rgba(49,146,40,0.12)' },
  HT5: { border: '#a4d5ff', glow: 'rgba(164,213,255,0.45)', text: '#a4d5ff', bg: 'rgba(164,213,255,0.12)' },
  LT5: { border: '#a4d5ff', glow: 'rgba(164,213,255,0.45)', text: '#a4d5ff', bg: 'rgba(164,213,255,0.12)' },
};

const FALLBACK_TIER_STYLES: Record<string, { border: string; glow: string; text: string; bg: string }> = {
  T1: RAW_TIER_STYLES.HT1,
  T2: RAW_TIER_STYLES.HT2,
  T3: RAW_TIER_STYLES.HT3,
  T4: RAW_TIER_STYLES.HT4,
  T5: RAW_TIER_STYLES.HT5,
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

  const rawKey = rawTier ? rawTier.toUpperCase() : '';
  const s = RAW_TIER_STYLES[rawKey] ?? FALLBACK_TIER_STYLES[tier] ?? FALLBACK_TIER_STYLES['T5'];

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
