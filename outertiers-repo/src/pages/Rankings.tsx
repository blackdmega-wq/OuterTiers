import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CATEGORIES, getCategoryTiers } from '../data/players';
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

/* ── Overall rankings — premium leaderboard with player skins ── */
const RANK_CFG = {
  1: { medal: '🥇', color: '#fde68a', pts: '#fbbf24', border: 'rgba(251,191,36,0.45)', glow: 'rgba(251,191,36,0.28)', bg: 'linear-gradient(180deg,rgba(251,191,36,0.11) 0%,rgba(120,70,0,0.06) 100%)' },
  2: { medal: '🥈', color: '#e2e8f0', pts: '#94a3b8', border: 'rgba(148,163,184,0.32)', glow: 'rgba(148,163,184,0.18)', bg: 'linear-gradient(180deg,rgba(148,163,184,0.08) 0%,rgba(50,60,80,0.04) 100%)' },
  3: { medal: '🥉', color: '#fbd0a0', pts: '#c97940', border: 'rgba(192,120,48,0.32)', glow: 'rgba(192,120,48,0.18)', bg: 'linear-gradient(180deg,rgba(192,120,48,0.08) 0%,rgba(80,40,10,0.04) 100%)' },
} as const;

function OverallTable({ players }: { players: Player[] }) {
  const top3 = players.slice(0, 3);
  const rest  = players.slice(3);

  const podiumOrder = top3.length >= 3
    ? [{ p: top3[1], r: 2 as const }, { p: top3[0], r: 1 as const }, { p: top3[2], r: 3 as const }]
    : top3.map((p, i) => ({ p, r: (i + 1) as 1 | 2 | 3 }));

  return (
    <div className="ot-v2-wrap">

      {/* ── TOP 3 PODIUM with full body skins ── */}
      {top3.length > 0 && (
        <div className="ot-v2-podium">
          {podiumOrder.map(({ p: player, r: rank }) => {
            const cfg = RANK_CFG[rank];
            return (
              <Link
                key={player.id}
                to={`/player/${player.username}`}
                className={`ot-v2-card ot-v2-card--r${rank}`}
                style={{
                  '--c-border': cfg.border,
                  '--c-glow':   cfg.glow,
                  '--c-bg':     cfg.bg,
                  '--c-pts':    cfg.pts,
                } as React.CSSProperties}
              >
                <div className="ot-v2-glow-ovl" />
                <div className="ot-v2-card-top">
                  <span className="ot-v2-medal">{cfg.medal}</span>
                  <span className="ot-v2-card-rnum" style={{ color: cfg.color }}>#{rank}</span>
                </div>
                <div className="ot-v2-body-wrap">
                  <img
                    src={`https://mc-heads.net/body/${player.username}/${rank === 1 ? 130 : 110}`}
                    alt={player.username}
                    className="ot-v2-body-img"
                    loading="lazy"
                  />
                  <div className="ot-v2-body-floor" />
                </div>
                <div className="ot-v2-card-footer">
                  <div className="ot-v2-card-pname" style={{ color: cfg.color }}>{player.username}</div>
                  <div className="ot-v2-card-meta">
                    <span className={`region-badge region-${player.region.toLowerCase()}`}>{player.region}</span>
                  </div>
                  <div className="ot-v2-pts-row">
                    <span className="ot-v2-pts-num" style={{ color: cfg.pts }}>{player.points}</span>
                    <span className="ot-v2-pts-sfx">pts</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── LIST rank 4+ ── */}
      {rest.length > 0 && (
        <div className="ot-v2-list">
          <div className="ot-v2-list-hd">
            <span className="ot-v2-lh">#</span>
            <span className="ot-v2-lh">Player</span>
            <span className="ot-v2-lh ot-v2-lh-c">Region</span>
            <span className="ot-v2-lh ot-v2-lh-r">Points</span>
          </div>
          {rest.map((player, i) => (
            <Link key={player.id} to={`/player/${player.username}`} className="ot-v2-row">
              <span className="ot-v2-rrank">{i + 4}.</span>
              <span className="ot-v2-rplayer">
                <img
                  src={`https://mc-heads.net/avatar/${player.username}/32`}
                  alt={player.username}
                  width={32} height={32}
                  className="ot-v2-ravatar"
                  loading="lazy"
                />
                <span className="ot-v2-rname">{player.username}</span>
                <span className={`region-badge region-${player.region.toLowerCase()} ot-v2-rinline`}>{player.region}</span>
              </span>
              <span className="ot-v2-rregion">
                <span className={`region-badge region-${player.region.toLowerCase()}`}>{player.region}</span>
              </span>
              <span className="ot-v2-rpts">{player.points}</span>
            </Link>
          ))}
        </div>
      )}
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
                      <div className="tier-col-header" style={{ borderBottom: `1px solid ${cfg.border}`, background: cfg.headerBg }}>
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
