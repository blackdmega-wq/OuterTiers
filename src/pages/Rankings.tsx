import { useState } from 'react';
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

/* ── Overall rankings table (pvptiers-style) ── */
function OverallTable({ players }: { players: Player[] }) {
  const rankMedal = (r: number) =>
    r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : null;

  return (
    <div className="ot-leaderboard">
      <div className="ot-lb-head">
        <span className="ot-lbh-rank">#</span>
        <span className="ot-lbh-player">Player</span>
        <span className="ot-lbh-title">Title</span>
        <span className="ot-lbh-region">Region</span>
        <span className="ot-lbh-pts">Points</span>
      </div>
      {players.map((player, i) => {
        const rank = i + 1;
        const isTop = rank <= 3;
        const medal = rankMedal(rank);
        return (
          <Link
            key={player.id}
            to={`/player/${player.username}`}
            className={`ot-lb-row${isTop ? ` ot-lb-row--${rank}` : ''}`}
          >
            {/* Rank */}
            <span className={`ot-lb-rank${isTop ? ` ot-lb-rank--top` : ''}`}>
              {medal
                ? <span className="ot-lb-medal">{medal}</span>
                : <span className="ot-lb-ranknum">{rank}</span>}
            </span>

            {/* Player avatar + name */}
            <span className="ot-lb-player">
              <span className={`ot-lb-avatar-wrap${isTop ? ` ot-lb-avatar-wrap--${rank}` : ''}`}>
                <img
                  src={`https://mc-heads.net/avatar/${player.username}/${isTop ? 40 : 32}`}
                  alt={player.username}
                  width={isTop ? 40 : 32}
                  height={isTop ? 40 : 32}
                  style={{ imageRendering: 'pixelated', borderRadius: 6, display: 'block' }}
                  loading="lazy"
                />
              </span>
              <span className={`ot-lb-name${isTop ? ` ot-lb-name--${rank}` : ''}`}>{player.username}</span>
            </span>

            {/* Title */}
            <span className="ot-lb-title">{getTitle(player.points)}</span>

            {/* Region */}
            <span className="ot-lb-region">
              <span className={`region-badge region-${player.region.toLowerCase()}`}>{player.region}</span>
            </span>

            {/* Points */}
            <span className={`ot-lb-pts${isTop ? ` ot-lb-pts--${rank}` : ''}`}>
              {player.points}
              <span className="ot-lb-pts-sfx"> pts</span>
            </span>
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
  const [_prevCategory, setPrevCategory] = useState(category);
  const [slideDir, setSlideDir] = useState<'right' | 'left'>('right');
  const [contentKey, setContentKey] = useState(0);
  const { players, loading } = usePlayers();

  const handleTabClick = (catId: string) => {
    if (catId === category) return;
    const cats = CATEGORIES.map(c => c.id);
    const prevIdx = cats.indexOf(category);
    const nextIdx = cats.indexOf(catId);
    setSlideDir(nextIdx > prevIdx ? 'right' : 'left');
    setContentKey(k => k + 1);
    setPrevCategory(catId);
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
        <div className="category-tabs">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`category-tab ${category === cat.id ? 'active' : ''}`}
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
          <div key={contentKey} className={`overall-rankings rankings-tab-content${slideDir === 'left' ? ' rankings-tab-content--left' : ''}`}>
            {sorted.length === 0
              ? <div className="rankings-empty">No players ranked yet.</div>
              : <OverallTable players={sorted} />
            }
          </div>
        ) : (
          /* ── GAMEMODE TIER COLUMNS ── */
          <div key={contentKey} className={`tier-grid-outer rankings-tab-content${slideDir === 'left' ? ' rankings-tab-content--left' : ''}`}>
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
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                          style={{ color: cfg.textColor, flexShrink: 0 }}>
                          <path d="M6 3h12v7a6 6 0 01-12 0V3z"/>
                          <path d="M4 5h2" strokeLinecap="round"/><path d="M20 5h-2" strokeLinecap="round"/>
                        </svg>
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
