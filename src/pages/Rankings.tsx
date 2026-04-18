import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CATEGORIES, PLAYERS, TIER_COLS, getCategoryTiers, getTitle } from '../data/players';
import type { PlayerTiers } from '../data/players';
import CategoryTierBadge from '../components/CategoryTierBadge';
import PlayerAvatar from '../components/PlayerAvatar';
import InfoModal from '../components/InfoModal';
import { Info } from 'lucide-react';

const TIER_HEADER_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  T1: { bg: 'rgba(180,130,0,0.15)',   border: '#b8860b', text: '#f0c040' },
  T2: { bg: 'rgba(100,100,100,0.15)', border: '#6e6e6e', text: '#c0c0c0' },
  T3: { bg: 'rgba(120,60,20,0.15)',   border: '#7c4a2a', text: '#cd7f32' },
  T4: { bg: 'rgba(50,50,50,0.12)',    border: '#444',    text: '#aaa' },
  T5: { bg: 'rgba(30,30,30,0.10)',    border: '#333',    text: '#888' },
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
        {/* Category Tabs */}
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

        {/* Info bar */}
        <div className="rankings-info-bar">
          <button className="info-btn" onClick={() => setInfoOpen(true)}>
            <Info size={13} />
            <span>Information</span>
          </button>
        </div>

        {/* Overall Rankings Table */}
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
                                <span className="player-points">({player.points} points)</span>
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
          /* Category Tier Columns — always show 5 columns */
          <div className="tier-columns-wrapper">
            <div className="tier-columns">
              {(['T1','T2','T3','T4','T5'] as const).map((tier, i) => {
                const col = tierColumns.find(c => c.tier === tier);
                const players = col?.players ?? [];
                const colors = TIER_HEADER_COLORS[tier];
                return (
                  <div key={tier} className="tier-column">
                    <div
                      className="tier-column-header"
                      style={{ background: colors.bg, borderBottom: `1px solid ${colors.border}` }}
                    >
                      <span style={{ color: colors.text }}>🏆</span>
                      <span style={{ color: colors.text }}>Tier {i + 1}</span>
                    </div>
                    <div className="tier-column-players">
                      {players.length === 0 ? (
                        <div className="tier-column-empty">—</div>
                      ) : (
                        players.map(player => (
                          <Link key={player.id} to={`/player/${player.username}`} className="tier-player-row">
                            <PlayerAvatar username={player.username} size={20} />
                            <span className="tier-player-name">{player.username}</span>
                            <svg className="tier-player-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="18 15 12 9 6 15" />
                              <polyline points="18 21 12 15 6 21" />
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
