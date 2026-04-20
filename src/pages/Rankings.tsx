import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CATEGORIES, TIER_COLS, getCategoryTiers, getTitle } from '../data/players';
import type { Player, PlayerTiers } from '../data/players';
import { usePlayers } from '../hooks/usePlayers';
import CategoryTierBadge from '../components/CategoryTierBadge';
import PlayerAvatar from '../components/PlayerAvatar';
import InfoModal from '../components/InfoModal';
import { Info } from 'lucide-react';

const RANK_STYLE: Record<number, { bg: string; glow: string; shimmerClass: string }> = {
  1: {
    bg: 'linear-gradient(135deg, #b8820a 0%, #f0c040 55%, #d4a020 100%)',
    glow: 'rgba(240,192,64,0.55)',
    shimmerClass: 'shimmer-gold',
  },
  2: {
    bg: 'linear-gradient(135deg, #6a7a8a 0%, #b0c0d0 55%, #808fa0 100%)',
    glow: 'rgba(176,192,208,0.4)',
    shimmerClass: 'shimmer-silver',
  },
  3: {
    bg: 'linear-gradient(135deg, #7a4820 0%, #c07830 55%, #8a5828 100%)',
    glow: 'rgba(192,120,48,0.4)',
    shimmerClass: 'shimmer-bronze',
  },
};

const TIER_CONFIG: Record<string, {
  label: string;
  gradient: string;
  border: string;
  glow: string;
  textColor: string;
}> = {
  T1: {
    label: 'Tier 1',
    gradient: 'linear-gradient(135deg, rgba(212,160,23,0.22) 0%, rgba(255,200,40,0.10) 100%)',
    border: 'rgba(212,160,23,0.7)',
    glow: 'rgba(212,160,23,0.25)',
    textColor: '#f0c040',
  },
  T2: {
    label: 'Tier 2',
    gradient: 'linear-gradient(135deg, rgba(150,160,175,0.18) 0%, rgba(180,190,200,0.08) 100%)',
    border: 'rgba(170,180,195,0.55)',
    glow: 'rgba(160,170,185,0.18)',
    textColor: '#c8d0da',
  },
  T3: {
    label: 'Tier 3',
    gradient: 'linear-gradient(135deg, rgba(160,90,30,0.20) 0%, rgba(200,120,40,0.09) 100%)',
    border: 'rgba(185,110,45,0.55)',
    glow: 'rgba(175,100,35,0.18)',
    textColor: '#d4884a',
  },
  T4: {
    label: 'Tier 4',
    gradient: 'linear-gradient(135deg, rgba(40,50,80,0.30) 0%, rgba(30,35,55,0.15) 100%)',
    border: 'rgba(60,75,110,0.45)',
    glow: 'rgba(50,65,100,0.10)',
    textColor: '#8899bb',
  },
  T5: {
    label: 'Tier 5',
    gradient: 'linear-gradient(135deg, rgba(28,30,42,0.35) 0%, rgba(20,22,32,0.15) 100%)',
    border: 'rgba(50,52,68,0.40)',
    glow: 'rgba(40,42,58,0.08)',
    textColor: '#666880',
  },
};

function TopCard({ player, rank }: { player: Player; rank: number }) {
  const rs = RANK_STYLE[rank];
  return (
    <Link to={`/player/${player.username}`} className={`top-card top-card-rank-${rank}`}>
      <div
        className="top-card-stripe"
        style={{ background: rs.bg, boxShadow: `4px 0 24px ${rs.glow}` }}
      >
        <div className={`top-card-stripe-shimmer ${rs.shimmerClass}`} />
        <span className="top-card-rank-num">{rank}.</span>
      </div>
      <div className="top-card-avatar">
        <PlayerAvatar username={player.username} size={54} />
      </div>
      <div className="top-card-content">
        <div className="top-card-name-row">
          <span className="top-card-name">{player.username}</span>
          <span className={`region-badge region-${player.region.toLowerCase()}`}>{player.region}</span>
        </div>
        <div className="top-card-subtitle">
          <img src="/tier_icons/overall.svg" alt="" width={13} height={13} style={{ opacity: 0.8 }} />
          <span>{getTitle(player.points)}</span>
          <span className="top-card-pts">({player.points} pts)</span>
        </div>
        <div className="top-card-tiers">
          <span className="top-card-tiers-label">TIERS</span>
          <div className="tier-badges-row">
            {TIER_COLS.map(col => (
              <CategoryTierBadge key={col} categoryId={col} tier={player.tiers[col]} />
            ))}
          </div>
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
  const tierColumns = !isOverall
    ? getCategoryTiers(category as keyof PlayerTiers, players)
    : [];

  const currentCat = CATEGORIES.find(c => c.id === category);

  return (
    <div className="rankings-page">
      {infoOpen && <InfoModal onClose={() => setInfoOpen(false)} />}

      <div className="rankings-page-header">
        <div className="rankings-page-header-glow" />
        <div className="rankings-header-inner">
          <div className="rankings-header-eyebrow">
            {currentCat && (
              <img src={currentCat.icon} alt={currentCat.label} width={14} height={14} style={{ opacity: 0.75 }} />
            )}
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
              <>
                <div className="top3-cards">
                  {sorted.slice(0, 3).map((p, i) => (
                    <TopCard key={p.id} player={p} rank={i + 1} />
                  ))}
                </div>
                {sorted.length > 3 && (
                  <div className="rankings-table-wrapper" style={{ marginTop: 16 }}>
                    <table className="rankings-table">
                      <thead>
                        <tr>
                          <th className="col-rank">#</th>
                          <th className="col-player">PLAYER</th>
                          <th className="col-region">REGION</th>
                          <th className="col-tiers">TIERS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sorted.slice(3).map((player, index) => (
                          <tr key={player.id} className="player-row">
                            <td className="col-rank">
                              <span className="rank-number">{index + 4}.</span>
                            </td>
                            <td className="col-player">
                              <Link to={`/player/${player.username}`} className="player-cell">
                                <div className="player-avatar-wrapper">
                                  <PlayerAvatar username={player.username} size={40} />
                                </div>
                                <div className="player-info">
                                  <span className="player-name">{player.username}</span>
                                  <span className="player-title">
                                    <img src="/tier_icons/overall.svg" alt="" width={13} height={13} style={{ opacity: 0.8 }} />
                                    {getTitle(player.points)}
                                    <span className="player-points">({player.points} pts)</span>
                                  </span>
                                </div>
                              </Link>
                            </td>
                            <td className="col-region">
                              <span className={`region-badge region-${player.region.toLowerCase()}`}>
                                {player.region}
                              </span>
                            </td>
                            <td className="col-tiers">
                              <div className="tier-badges-row">
                                {TIER_COLS.map(col => (
                                  <CategoryTierBadge key={col} categoryId={col} tier={player.tiers[col]} />
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
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
                      style={{
                        background: cfg.gradient,
                        borderBottom: `1px solid ${cfg.border}`,
                        boxShadow: `0 2px 16px ${cfg.glow}`,
                      }}
                    >
                      <div className="tier-header-top">
                        <span className="tier-header-label" style={{ color: cfg.textColor }}>
                          {cfg.label}
                        </span>
                      </div>
                      <span className="tier-header-sub" style={{ color: cfg.textColor, opacity: 0.65 }}>
                        {tieredPlayers.length} {tieredPlayers.length === 1 ? 'player' : 'players'}
                      </span>
                    </div>
                    <div className="tier-column-players">
                      {tieredPlayers.length === 0 ? (
                        <div className="tier-column-empty">
                          <span>No players</span>
                        </div>
                      ) : (
                        tieredPlayers.map((player) => {
                          const rawTier = (player.rawTiers as Record<string, string | null | undefined> | undefined)?.[category];
                          return (
                            <Link key={player.id} to={`/player/${player.username}`} className="tier-player-row">
                              <PlayerAvatar username={player.username} size={28} />
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
