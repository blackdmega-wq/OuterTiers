import { useParams, Link, useNavigate } from 'react-router-dom';
import { CATEGORIES, PLAYERS, getCategoryTiers, getTitle } from '../data/players';
import type { PlayerTiers } from '../data/players';
import TierBadge from '../components/TierBadge';
import PlayerAvatar from '../components/PlayerAvatar';
import { Info } from 'lucide-react';

const TIER_DISPLAY_COLS = ['vanilla', 'uhc', 'pot', 'nethop', 'smp', 'sword', 'axe', 'ltms'];

export default function Rankings() {
  const { category = 'overall' } = useParams<{ category: string }>();
  const navigate = useNavigate();

  const isOverall = category === 'overall';

  const sorted = [...PLAYERS].sort((a, b) => b.points - a.points);

  const tierColumns = !isOverall
    ? getCategoryTiers(category as keyof PlayerTiers)
    : [];

  const TIER_LABELS: Record<string, string> = {
    HT1: 'Tier 1', HT2: 'Tier 2', HT3: 'Tier 3', HT4: 'Tier 4',
    LT1: 'Tier 5', LT2: 'Tier 6', LT3: 'Tier 7', LT4: 'Tier 8', LT5: 'Tier 9',
  };

  const TIER_HEADER_COLORS: Record<string, string> = {
    HT1: '#b8860b', HT2: '#6e6e6e', HT3: '#7c4a2a', HT4: '#4a3a2a',
    LT1: '#2e4a2e', LT2: '#2a3a4a', LT3: '#2a2a4a', LT4: '#3a2a2a', LT5: '#1e1e1e',
  };

  return (
    <div className="rankings-page">
      <div className="rankings-container">
        <div className="category-tabs">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`category-tab ${category === cat.id ? 'active' : ''}`}
              onClick={() => navigate(`/rankings/${cat.id}`)}
            >
              <span className="tab-emoji">{cat.emoji}</span>
              <span className="tab-label">{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="rankings-info-bar">
          <button className="info-btn">
            <Info size={14} />
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
                {sorted.map((player, index) => {
                  const rank = index + 1;
                  const rankClass = rank === 1 ? 'rank-gold' : rank === 2 ? 'rank-silver' : rank === 3 ? 'rank-bronze' : '';
                  return (
                    <tr key={player.id} className="player-row">
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
                              <span className="title-diamond">◆</span>
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
                          {TIER_DISPLAY_COLS.map(col => (
                            <TierBadge
                              key={col}
                              tier={player.tiers[col as keyof PlayerTiers]}
                            />
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="tier-columns-wrapper">
            <div className="tier-columns">
              {tierColumns.map(({ tier, players }) => (
                <div key={tier} className="tier-column">
                  <div
                    className="tier-column-header"
                    style={{ backgroundColor: TIER_HEADER_COLORS[tier] || '#1e1e1e' }}
                  >
                    <span className="tier-trophy">🏆</span>
                    <span>{TIER_LABELS[tier] || tier}</span>
                  </div>
                  <div className="tier-column-players">
                    {players.map(player => (
                      <Link key={player.id} to={`/player/${player.username}`} className="tier-player-row">
                        <PlayerAvatar username={player.username} size={24} />
                        <span className="tier-player-name">{player.username}</span>
                        <span className="tier-player-arrows">⬆⬆</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
