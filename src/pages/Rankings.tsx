import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CATEGORIES, getCategoryTiers, getTitle } from '../data/players';
import type { Player, PlayerTiers } from '../data/players';
import { usePlayers } from '../hooks/usePlayers';
import InfoModal from '../components/InfoModal';
import { Info } from 'lucide-react';

const TIER_CONFIG: Record<string, { label: string; gradient: string; border: string; glow: string; textColor: string; headerBg: string }> = {
  T1: { label: 'Tier 1', gradient: 'linear-gradient(135deg, rgba(212,160,23,0.22) 0%, rgba(255,200,40,0.10) 100%)', border: 'rgba(212,160,23,0.65)', glow: 'rgba(212,160,23,0.22)', textColor: '#f0c040', headerBg: 'rgba(212,160,23,0.10)' },
  T2: { label: 'Tier 2', gradient: 'linear-gradient(135deg, rgba(185,195,215,0.18) 0%, rgba(160,175,195,0.08) 100%)', border: 'rgba(185,195,215,0.45)', glow: 'rgba(180,190,210,0.18)', textColor: '#b8c8dc', headerBg: 'rgba(170,185,210,0.07)' },
  T3: { label: 'Tier 3', gradient: 'linear-gradient(135deg, rgba(180,115,40,0.22) 0%, rgba(160,100,30,0.10) 100%)', border: 'rgba(180,115,40,0.55)', glow: 'rgba(170,105,35,0.18)', textColor: '#c8873a', headerBg: 'rgba(180,115,40,0.09)' },
  T4: { label: 'Tier 4', gradient: 'linear-gradient(135deg, rgba(192,126,245,0.15) 0%, rgba(200,140,255,0.06) 100%)', border: 'rgba(192,126,245,0.35)', glow: 'rgba(192,126,245,0.12)', textColor: '#cf97f8', headerBg: 'rgba(192,126,245,0.07)' },
  T5: { label: 'Tier 5', gradient: 'linear-gradient(135deg, rgba(28,30,42,0.30) 0%, rgba(20,22,32,0.10) 100%)', border: 'rgba(50,52,68,0.35)', glow: 'rgba(40,42,58,0.06)', textColor: '#666880', headerBg: 'rgba(30,32,44,0.10)' },
};

const REGION_COLOR: Record<string, string> = {
  na: '#60a5fa', eu: '#34d399', as: '#fbbf24', oc: '#a78bfa',
};

function TierArrows({ rawTier }: { rawTier?: string | null }) {
  if (!rawTier || rawTier === '-') return null;
  const isHT = rawTier.startsWith('HT');
  return (
    <span className={`tier-arrow-wrap ${isHT ? 'ht' : 'lt'}`}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15" /></svg>
      {isHT && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="arrow-second"><polyline points="18 15 12 9 6 15" /></svg>
      )}
    </span>
  );
}

/* ── Custom rank icons — trophy shape ── */
function RankIcon({ rank }: { rank: number }) {
  const cls = rank === 1 ? 'ot-rl-rank-icon--gold' : rank === 2 ? 'ot-rl-rank-icon--silver' : 'ot-rl-rank-icon--bronze';
  return (
    <svg className={`ot-rl-rank-icon ${cls}`} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 2h12v8a6 6 0 0 1-12 0V2z"/>
      <path d="M4 4H6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M18 4h2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <line x1="12" y1="14" x2="12" y2="16.5" stroke="currentColor" strokeWidth="2" fill="none"/>
      <rect x="7.5" y="16.5" width="9" height="2.6" rx="1.3"/>
      <rect x="9.5" y="19" width="5" height="1.8" rx="0.9" opacity="0.7"/>
    </svg>
  );
}

/* ── Overall rankings — full list with ring-avatar + tier badges ── */

const TIER_PRIORITY: Record<string, number> = {
  HT1: 0, LT1: 1, HT2: 2, LT2: 3, HT3: 4, LT3: 5, HT4: 6, LT4: 7, HT5: 8, LT5: 9,
};

const MODE_KEYS: (keyof NonNullable<Player['rawTiers']>)[] = [
  'ogvanilla', 'vanilla', 'uhc', 'pot', 'nethop', 'smp', 'sword', 'axe', 'mace', 'speed',
];

function tierRingCls(tier: string): string {
  const t = tier.toUpperCase();
  if (t.endsWith('1')) return 'gold';
  if (t.endsWith('2')) return 'silver';
  if (t.endsWith('3')) return 'blue';
  return 'gray';
}

function OverallTable({ players }: { players: Player[] }) {
  return (
    <div className="ot-rl-wrap">
      <div className="ot-rl-header">
        <span />
        <span className="ot-rl-hcol">Player</span>
        <span className="ot-rl-hcol ot-rl-hcol--center">Region</span>
        <span className="ot-rl-hcol">All Modes</span>
        <span className="ot-rl-hcol ot-rl-hcol--right">Points</span>
      </div>
      {players.map((player, i) => {
        const rank = i + 1;
        const raw = player.rawTiers ?? {};
        const allModes = MODE_KEYS.map(k => ({
          modeId: k as string,
          rawTier: (raw as Record<string, string | null | undefined>)[k] ?? null,
        }));
        const sortedModes = [
          ...allModes
            .filter((e): e is { modeId: string; rawTier: string } => !!e.rawTier && e.rawTier !== '-')
            .sort((a, b) => (TIER_PRIORITY[a.rawTier.toUpperCase()] ?? 99) - (TIER_PRIORITY[b.rawTier.toUpperCase()] ?? 99)),
          ...allModes.filter(e => !e.rawTier || e.rawTier === '-'),
        ];
        const ringCls = rank === 1 ? 'ring-gold' : rank === 2 ? 'ring-silver' : rank === 3 ? 'ring-bronze' : 'ring-blue';
        const rowCls = rank <= 3 ? ` ot-rl-row--top${rank}` : '';

        /* Mobile: show first 5 badges, rest overflow */
        const MOBILE_MAX = 5;
        const overflowCount = sortedModes.length - MOBILE_MAX;

        return (
          <Link key={player.id} to={`/player/${player.username}`} className={`ot-rl-row${rowCls}`}>
            <span className="ot-rl-rank">
              {rank <= 3
                ? <span className="ot-rl-medal"><RankIcon rank={rank} /></span>
                : `${rank}.`}
            </span>

            <span className="ot-rl-player">
              <span className={`ot-rl-skin-outer${rank <= 3 ? ` ot-rl-skin-outer--rank${rank}` : ''}`}>
                {rank <= 3 && <span className="ot-rl-aura" />}
                <span className={`ot-rl-avatar-ring ${ringCls}`}>
                  <span className="ot-rl-avatar-bg" />
                  <img
                    src={`https://visage.surgeplay.com/full/256/${player.username}.png`}
                    alt={player.username}
                    className="ot-rl-avatar-img"
                    loading="lazy"
                  />
                </span>
                {rank <= 3 && (
                  <>
                    <span className="ot-rl-bolt ot-rl-bolt--1" />
                    <span className="ot-rl-bolt ot-rl-bolt--2" />
                    <span className="ot-rl-bolt ot-rl-bolt--3" />
                    <span className="ot-rl-bolt ot-rl-bolt--4" />
                    <span className="ot-rl-bolt ot-rl-bolt--5" />
                    <span className="ot-rl-bolt ot-rl-bolt--6" />
                  </>
                )}
              </span>
              <span className="ot-rl-info">
                <span className="ot-rl-name">{player.username}</span>
                <span className="ot-rl-title">◆ {getTitle(player.points)}</span>
              </span>
            </span>

            <span className="ot-rl-region">
              <span className={`region-badge region-${player.region.toLowerCase()}`}>{player.region}</span>
            </span>

            <span className="ot-rl-tiers">
              {sortedModes.map(({ modeId, rawTier }, idx) => {
                const cat = CATEGORIES.find(c => c.id === modeId);
                if (!cat) return null;
                const hasRank = !!rawTier && rawTier !== '-';
                const isOverflowHidden = idx >= MOBILE_MAX;
                return (
                  <span
                    key={modeId}
                    className={`ot-rl-tbadge${hasRank ? ` ot-rl-tbadge--${tierRingCls(rawTier!)}` : ' ot-rl-tbadge--unranked'}${isOverflowHidden ? ' ot-rl-tbadge--mobile-hidden' : ''}`}
                  >
                    <span className="ot-rl-ticon-wrap">
                      <img src={cat.icon} alt={cat.label} className="ot-rl-ticon" loading="lazy" />
                    </span>
                    <span className="ot-rl-tlabel">{hasRank ? rawTier : '—'}</span>
                  </span>
                );
              })}
              {overflowCount > 0 && (
                <span className="ot-rl-tmore ot-rl-tmore--mobile-only">+{overflowCount}</span>
              )}
            </span>

            <span className="ot-rl-pts">{player.points}<span className="ot-rl-pts-unit">pts</span></span>
          </Link>
        );
      })}
    </div>
  );
}

export default function Rankings() {
  const { category = 'overall' } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [infoOpen, setInfoOpen] = useState(false);
  const [slideDir, setSlideDir] = useState<'right' | 'left'>('right');
  const [contentKey, setContentKey] = useState(0);
  const { players, loading } = usePlayers();

  /* ── Sliding tab indicator ── */
  const tabsRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  useEffect(() => {
    const tabs = tabsRef.current;
    if (!tabs) return;
    const active = tabs.querySelector<HTMLElement>('.category-tab.active');
    if (!active) return;
    setIndicator({ left: active.offsetLeft, width: active.offsetWidth, ready: true });
  }, [category]);

  const handleTabClick = (catId: string) => {
    if (catId === category) return;
    const cats = CATEGORIES.map(c => c.id);
    const prevIdx = cats.indexOf(category);
    const nextIdx = cats.indexOf(catId);
    setSlideDir(nextIdx > prevIdx ? 'right' : 'left');
    setContentKey(k => k + 1);
    navigate(`/rankings/${catId}`);
  };

  const isOverall = category === 'overall';
  const sorted = [...players].filter(p => p.points > 0).sort((a, b) => b.points - a.points);
  const tierColumns = !isOverall ? getCategoryTiers(category as keyof PlayerTiers, players) : [];
  const currentCat = CATEGORIES.find(c => c.id === category);

  return (
    <div className="rankings-page">
      {infoOpen && <InfoModal onClose={() => setInfoOpen(false)} />}

      <div className="rankings-page-header">
        <div className="rankings-page-header-glow" />
        <div className="rankings-header-inner">
          <div className="rankings-header-eyebrow">
            {currentCat && <img src={currentCat.icon} alt={currentCat.label} width={14} height={14} style={{ opacity: 0.75 }} />}
            <span>Leaderboard</span>
          </div>
          <h1 className="rankings-header-title">
            {isOverall ? 'Overall Rankings' : `${currentCat?.label ?? ''} Rankings`}
          </h1>
          <p className="rankings-header-sub">
            {isOverall
              ? 'Top players ranked by total points across all categories.'
              : `Tier rankings for the ${currentCat?.label ?? ''} game mode.`}
          </p>
        </div>
      </div>

      <div className="rankings-container">
        {/* ── CATEGORY TABS with sliding indicator ── */}
        <div className="category-tabs" ref={tabsRef}>
          {indicator.ready && (
            <div
              className="tab-slide-indicator"
              style={{ left: indicator.left, width: indicator.width }}
            />
          )}
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`category-tab${category === cat.id ? ' active' : ''}`}
              onClick={() => handleTabClick(cat.id)}
            >
              <span className="tab-icon-wrap">
                <img src={cat.icon} alt={cat.label} className="tab-icon" />
              </span>
              <span className="tab-label">{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="rankings-info-bar">
          <button className="info-btn" onClick={() => setInfoOpen(true)}>
            <Info size={13} />
            <span>Information</span>
          </button>
        </div>

        {loading ? (
          <div className="rankings-loading">
            <div className="rankings-loading-spinner" />
            Loading players...
          </div>
        ) : isOverall ? (
          <div
            key={contentKey}
            className={`overall-rankings rankings-tab-content${slideDir === 'left' ? ' rankings-tab-content--left' : ''}`}
          >
            {sorted.length === 0
              ? <div className="rankings-empty">No players ranked yet.</div>
              : <OverallTable players={sorted} />
            }
          </div>
        ) : (
          /* ── GAMEMODE TIER COLUMNS ── */
          <div
            key={contentKey}
            className={`tier-grid-outer rankings-tab-content${slideDir === 'left' ? ' rankings-tab-content--left' : ''}`}
          >
            <div className="tier-grid">
              {(() => {
                const positions = new Map<string, number>();
                let cursor = 0;
                for (const tier of ['T1','T2','T3','T4','T5'] as const) {
                  const col = tierColumns.find(c => c.tier === tier);
                  const tp = [...(col?.players ?? [])].sort((a, b) => b.points - a.points);
                  for (const p of tp) { cursor += 1; positions.set(p.id, cursor); }
                }
                return (['T1','T2','T3','T4','T5'] as const).map((tier) => {
                  const col = tierColumns.find(c => c.tier === tier);
                  const tieredPlayers = [...(col?.players ?? [])].sort((a, b) => b.points - a.points);
                  const cfg = TIER_CONFIG[tier];
                  const showTrophy = tier === 'T1' || tier === 'T2' || tier === 'T3';
                  return (
                    <div
                      key={tier}
                      className="tier-col"
                      style={{
                        '--tier-border': cfg.border,
                        '--tier-glow': cfg.glow,
                        '--tier-header-bg': cfg.headerBg,
                      } as React.CSSProperties}
                    >
                      {/* Column header */}
                      <div className="tier-col-header" style={{ background: cfg.headerBg }}>
                        {showTrophy && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                            style={{ color: cfg.textColor, flexShrink: 0 }}>
                            <path d="M6 3h12v7a6 6 0 01-12 0V3z"/>
                            <path d="M4 5h2" strokeLinecap="round"/><path d="M20 5h-2" strokeLinecap="round"/>
                          </svg>
                        )}
                        <span className="tier-col-title" style={{ color: cfg.textColor }}>{cfg.label}</span>
                        <span className="tier-col-count" style={{ color: cfg.textColor }}>
                          {tieredPlayers.length}
                        </span>
                      </div>

                      {/* Players */}
                      <div className="tier-col-players">
                        {tieredPlayers.length === 0 ? (
                          <div className="tier-col-empty">No players</div>
                        ) : (
                          tieredPlayers.map((player) => {
                            const rawTier = (player.rawTiers as Record<string, string | null | undefined> | undefined)?.[category];
                            const pos = positions.get(player.id);
                            const regionKey = (player.region || 'eu').toLowerCase();
                            const barColor = REGION_COLOR[regionKey] ?? '#60a5fa';
                            return (
                              <Link key={player.id} to={`/player/${player.username}`} className="tier-col-row">
                                {/* Region bar */}
                                <div className="tc-region-bar" style={{ '--rbar-color': barColor } as React.CSSProperties}>
                                  <span className="tc-region-text">{player.region || '?'}</span>
                                </div>
                                {/* Avatar */}
                                <img
                                  src={`https://mc-heads.net/avatar/${player.username}/28`}
                                  alt={player.username}
                                  width={28} height={28}
                                  className="tc-avatar"
                                  loading="lazy"
                                />
                                {/* Name */}
                                <span className="tc-name">{player.username}</span>
                                {/* Position */}
                                {pos != null && <span className="tc-pos">#{pos}</span>}
                                {/* HT/LT arrows */}
                                <TierArrows rawTier={rawTier} />
                              </Link>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
