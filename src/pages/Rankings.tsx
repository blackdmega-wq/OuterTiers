import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CATEGORIES, PLAYERS, TIER_COLS, getCategoryTiers, getTitle } from '../data/players';
import type { PlayerTiers } from '../data/players';
import CategoryTierBadge from '../components/CategoryTierBadge';
import PlayerAvatar from '../components/PlayerAvatar';
import InfoModal from '../components/InfoModal';
import { Info } from 'lucide-react';

function TrophyIcon({ color, shadowColor }: { color: string; shadowColor: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ filter: `drop-shadow(0 1px 3px ${shadowColor})` }}>
      <path d="M6 3h12v7a6 6 0 01-12 0V3z" fill={color} opacity="0.9"/>
      <path d="M3 5h3v5a6 6 0 01-.5 2.4A4 4 0 013 9V5z" fill={color} opacity="0.7"/>
      <path d="M21 5h-3v5a6 6 0 00.5 2.4A4 4 0 0021 9V5z" fill={color} opacity="0.7"/>
      <path d="M9 16.5A6 6 0 0012 17a6 6 0 003-.5V18H9v-1.5z" fill={color} opacity="0.85"/>
      <rect x="9" y="18" width="6" height="2" rx="0.5" fill={color} opacity="0.9"/>
      <rect x="7" y="20" width="10" height="1.5" rx="0.5" fill={color} opacity="0.95"/>
      <path d="M8 6h8v4a4 4 0 01-8 0V6z" fill="white" opacity="0.12"/>
    </svg>
  );
}

const TIER_CONFIG: Record<string, {
  label: string;
  gradient: string;
  border: string;
  glow: string;
  textColor: string;
  subText: string;
  trophyColor: string;
  trophyShadow: string;
  hasTrophy: boolean;
}> = {
  T1: {
    label: 'Tier 1',
    gradient: 'linear-gradient(135deg, rgba(212,160,23,0.22) 0%, rgba(255,200,40,0.10) 100%)',
    border: 'rgba(212,160,23,0.7)',
    glow: 'rgba(212,160,23,0.25)',
    textColor: '#f0c040',
    subText: 'Elite',
    trophyColor: '#f0c040',
    trophyShadow: 'rgba(240,192,64,0.6)',
    hasTrophy: true,
  },
  T2: {
    label: 'Tier 2',
    gradient: 'linear-gradient(135deg, rgba(150,160,175,0.18) 0%, rgba(180,190,200,0.08) 100%)',
    border: 'rgba(170,180,195,0.55)',
    glow: 'rgba(160,170,185,0.18)',
    textColor: '#c8d0da',
    subText: 'High',
    trophyColor: '#b8c8d8',
    trophyShadow: 'rgba(160,180,200,0.5)',
    hasTrophy: true,
  },
  T3: {
    label: 'Tier 3',
    gradient: 'linear-gradient(135deg, rgba(160,90,30,0.20) 0%, rgba(200,120,40,0.09) 100%)',
    border: 'rgba(185,110,45,0.55)',
    glow: 'rgba(175,100,35,0.18)',
    textColor: '#d4884a',
    subText: 'Mid-High',
    trophyColor: '#c87840',
    trophyShadow: 'rgba(180,100,40,0.5)',
    hasTrophy: true,
  },
  T4: {
    label: 'Tier 4',
    gradient: 'linear-gradient(135deg, rgba(40,50,80,0.30) 0%, rgba(30,35,55,0.15) 100%)',
    border: 'rgba(60,75,110,0.45)',
    glow: 'rgba(50,65,100,0.10)',
    textColor: '#8899bb',
    subText: 'Mid',
    trophyColor: '',
    trophyShadow: '',
    hasTrophy: false,
  },
  T5: {
    label: 'Tier 5',
    gradient: 'linear-gradient(135deg, rgba(28,30,42,0.35) 0%, rgba(20,22,32,0.15) 100%)',
    border: 'rgba(50,52,68,0.40)',
    glow: 'rgba(40,42,58,0.08)',
    textColor: '#666880',
    subText: 'Entry',
    trophyColor: '',
    trophyShadow: '',
    hasTrophy: false,
  },
};

export default function Rankings() {
  const { category = 'overall' } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [infoOpen, setInfoOpen] = useState(false);

  const isOverall = category === 'overall';
  const sorted = [...PLAYERS].sort((a, b) => b.points - a.points);
  const tierColumns = !isOverall
    ? getCategoryTiers(category as keyof PlayerTiers)
    : [];

  return (
    <div className="rankings-page">
      {infoOpen && <InfoModal onClose={() => setInfoOpen(false)} />}

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

        {isOverall ? (
          <div className="rankings-table-wrapper">
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
                {sorted.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-row">No players ranked yet.</td>
                  </tr>
                ) : (
                  sorted.map((player, index) => {
                    const rank = index + 1;
                    const rankClass = rank === 1 ? 'rank-gold' : rank === 2 ? 'rank-silver' : rank === 3 ? 'rank-bronze' : '';
                    return (
                      <tr key={player.id} className={`player-row ${rankClass ? 'player-row-top' : ''}`}>
                        <td className="col-rank">
                          <span className={`rank-number ${rankClass}`}>{rank}.</span>
                        </td>
                        <td className="col-player">
                          <Link to={`/player/${player.username}`} className="player-cell">
                            <div className={`player-avatar-wrapper ${rankClass}`}>
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
                              <CategoryTierBadge
                                key={col}
                                categoryId={col}
                                tier={player.tiers[col]}
                              />
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="tier-columns-wrapper">
            <div className="tier-columns">
              {(['T1','T2','T3','T4','T5'] as const).map((tier) => {
                const col = tierColumns.find(c => c.tier === tier);
                const players = col?.players ?? [];
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
                        {cfg.hasTrophy && (
                          <TrophyIcon color={cfg.trophyColor} shadowColor={cfg.trophyShadow} />
                        )}
                        <span className="tier-header-label" style={{ color: cfg.textColor }}>
                          {cfg.label}
                        </span>
                      </div>
                      <span className="tier-header-sub" style={{ color: cfg.textColor, opacity: 0.65 }}>
                        {players.length} {players.length === 1 ? 'player' : 'players'}
                      </span>
                    </div>
                    <div className="tier-column-players">
                      {players.length === 0 ? (
                        <div className="tier-column-empty">
                          <span>No players</span>
                        </div>
                      ) : (
                        players.map((player, i) => (
                          <Link key={player.id} to={`/player/${player.username}`} className="tier-player-row">
                            <span className="tier-player-index">{i + 1}</span>
                            <PlayerAvatar username={player.username} size={22} />
                            <span className="tier-player-name">{player.username}</span>
                            <svg className="tier-player-chevron" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </Link>
                        ))
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
