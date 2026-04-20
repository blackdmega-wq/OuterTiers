import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CATEGORIES, TIER_COLS, getCategoryTiers, getTitle } from '../data/players';
import type { Player, PlayerTiers } from '../data/players';
import { usePlayers } from '../hooks/usePlayers';
import CategoryTierBadge from '../components/CategoryTierBadge';
import InfoModal from '../components/InfoModal';
import { Info } from 'lucide-react';

const RANK_STYLE: Record<number, { bg: string; glow: string; border: string; shimmerClass: string }> = {
  1: {
    bg: 'linear-gradient(145deg, #a06a00 0%, #f0c040 45%, #e8b820 70%, #c89010 100%)',
    glow: 'rgba(240,192,64,0.6)',
    border: 'rgba(240,192,64,0.35)',
    shimmerClass: 'shimmer-gold',
  },
  2: {
    bg: 'linear-gradient(145deg, #4a5a6a 0%, #aabccc 45%, #98acbc 70%, #7890a0 100%)',
    glow: 'rgba(170,188,204,0.45)',
    border: 'rgba(170,188,204,0.25)',
    shimmerClass: 'shimmer-silver',
  },
  3: {
    bg: 'linear-gradient(145deg, #5a2a00 0%, #c07830 45%, #b06020 70%, #804010 100%)',
    glow: 'rgba(192,120,48,0.5)',
    border: 'rgba(192,120,48,0.3)',
    shimmerClass: 'shimmer-bronze',
  },
};

const RANK_DEFAULT_STYLE = {
  bg: 'linear-gradient(145deg, #111320 0%, #1a1d2e 50%, #141728 100%)',
  glow: 'rgba(91,164,245,0.15)',
  border: 'rgba(50,55,80,0.35)',
  shimmerClass: '',
};

const TIER_CONFIG: Record<string, { label: string; gradient: string; border: string; glow: string; textColor: string }> = {
  T1: { label: 'Tier 1', gradient: 'linear-gradient(135deg, rgba(212,160,23,0.22) 0%, rgba(255,200,40,0.10) 100%)', border: 'rgba(212,160,23,0.7)', glow: 'rgba(212,160,23,0.25)', textColor: '#f0c040' },
  T2: { label: 'Tier 2', gradient: 'linear-gradient(135deg, rgba(185,195,215,0.18) 0%, rgba(160,175,195,0.08) 100%)', border: 'rgba(185,195,215,0.55)', glow: 'rgba(180,190,210,0.2)', textColor: '#b8c8dc' },
  T3: { label: 'Tier 3', gradient: 'linear-gradient(135deg, rgba(180,115,40,0.22) 0%, rgba(160,100,30,0.10) 100%)', border: 'rgba(180,115,40,0.60)', glow: 'rgba(170,105,35,0.2)', textColor: '#c8873a' },
  T4: { label: 'Tier 4', gradient: 'linear-gradient(135deg, rgba(192,126,245,0.18) 0%, rgba(200,140,255,0.08) 100%)', border: 'rgba(192,126,245,0.45)', glow: 'rgba(192,126,245,0.15)', textColor: '#cf97f8' },
  T5: { label: 'Tier 5', gradient: 'linear-gradient(135deg, rgba(28,30,42,0.35) 0%, rgba(20,22,32,0.15) 100%)', border: 'rgba(50,52,68,0.40)', glow: 'rgba(40,42,58,0.08)', textColor: '#666880' },
};

function PlayerCard({ player, rank }: { player: Player; rank: number }) {
  const rs = RANK_STYLE[rank] ?? RANK_DEFAULT_STYLE;
  const [headFailed, setHeadFailed] = useState(false);
  const isTopThree = rank <= 3;

  return (
    <Link
      to={`/player/${player.username}`}
      className={`top-card top-card-rank-${isTopThree ? rank : 'default'}`}
      style={{ boxShadow: `0 0 0 1px ${rs.border}, 0 8px 32px rgba(0,0,0,0.3)` }}
    >
      <div className="top-card-stripe" style={{ background: rs.bg }}>
        {rs.shimmerClass && <div className={`top-card-stripe-shimmer ${rs.shimmerClass}`} />}
        <span className="top-card-rank-num">{rank}.</span>
        <div className="top-card-bust-wrap">
          <img
            src={headFailed
              ? `https://mc-heads.net/avatar/${player.username}/96`
              : `https://mc-heads.net/head/${player.username}`}
            alt={player.username}
            className="top-card-bust"
            onError={() => setHeadFailed(true)}
          />
        </div>
      </div>

      <div className="top-card-content">
        <div className="top-card-info-main">
          <div className="top-card-name-row">
            <span className="top-card-name">{player.username}</span>
            <span className={`region-badge region-${player.region.toLowerCase()}`}>{player.region}</span>
          </div>
          <div className="top-card-subtitle">
            <span className="top-card-diamond">◆</span>
            <span>{getTitle(player.points)}</span>
          </div>
        </div>

        <div className="top-card-tiers">
          <span className="top-card-tiers-label">TIERS</span>
          <div className="tier-badges-row" style={{ flexWrap: 'wrap', gap: '5px 4px' }}>
            {TIER_COLS.map(col => (
              <CategoryTierBadge
                key={col}
                categoryId={col}
                tier={player.tiers[col]}
                rawTier={player.rawTiers?.[col as keyof typeof player.rawTiers]}
              />
            ))}
          </div>
        </div>

        <div className="top-card-info-side">
          <div className="top-card-side-pts">{player.points}</div>
          <div className="top-card-side-label">POINTS</div>
          {player.peakTier && player.peakTier !== '-' && (
            <div className="top-card-side-peak">
              <span className="top-card-side-peak-label">PEAK</span>
              <span className="top-card-side-peak-val">{player.peakTier}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function TierArrows({ rawTier }: { rawTier?: string | null }) {
  if (!rawTier || rawTier === '-') return null;
  const isHT = rawTier.startsWith('HT');
  return (
    <span className={`tier-arrow-wrap ${isHT ? 'ht' : 'lt'}`}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <polyline points="18 15 12 9 6 15" />
      </svg>
      {isHT && (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="arrow-second">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      )}
    </span>
  );
}

export default function Rankings() {
  const { category = 'overall' } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [infoOpen, setInfoOpen] = useState(false);
  const { players, loading } = usePlayers();

  const isOverall = category === 'overall';
  const sorted = [...players].sort((a, b) => b.points - a.points);
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
              onClick={() => navigate(`/rankings/${cat.id}`)}
            >
              <img src={cat.icon} alt={cat.label} className="tab-icon" />
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
          <div className="rankings-loading">Loading players...</div>
        ) : isOverall ? (
          <div className="overall-rankings">
            {sorted.length === 0 ? (
              <div className="rankings-empty">No players ranked yet.</div>
            ) : (
              <div className="top3-cards">
                {sorted.map((p, i) => (
                  <PlayerCard key={p.id} player={p} rank={i + 1} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="tier-columns-wrapper">
            <div className="tier-columns">
              {(['T1','T2','T3','T4','T5'] as const).map((tier) => {
                const col = tierColumns.find(c => c.tier === tier);
                const tieredPlayers = col?.players ?? [];
                const cfg = TIER_CONFIG[tier];
                return (
                  <div key={tier} className="tier-column" style={{ '--tier-glow': cfg.glow } as React.CSSProperties}>
                    <div
                      className="tier-column-header"
                      style={{ background: cfg.gradient, borderBottom: `1px solid ${cfg.border}`, boxShadow: `0 2px 16px ${cfg.glow}` }}
                    >
                      <div className="tier-header-top">
                        <span className="tier-header-label" style={{ color: cfg.textColor }}>{cfg.label}</span>
                      </div>
                      <span className="tier-header-sub" style={{ color: cfg.textColor, opacity: 0.65 }}>
                        {tieredPlayers.length} {tieredPlayers.length === 1 ? 'player' : 'players'}
                      </span>
                    </div>
                    <div className="tier-column-players">
                      {tieredPlayers.length === 0 ? (
                        <div className="tier-column-empty"><span>No players</span></div>
                      ) : (
                        tieredPlayers.map((player) => {
                          const rawTier = (player.rawTiers as Record<string, string | null | undefined> | undefined)?.[category];
                          return (
                            <Link key={player.id} to={`/player/${player.username}`} className="tier-player-row">
                              <img
                                src={`https://mc-heads.net/avatar/${player.username}/28`}
                                alt={player.username}
                                width={28} height={28}
                                style={{ imageRendering: 'pixelated', borderRadius: 3, display: 'block', flexShrink: 0 }}
                                loading="lazy"
                              />
                              <span className="tier-player-name">{player.username}</span>
                              <TierArrows rawTier={rawTier} />
                            </Link>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
