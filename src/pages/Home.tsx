import { Link } from 'react-router-dom';
import { Users, Globe } from 'lucide-react';
import { PLAYERS, getTitle } from '../data/players';
import PlayerAvatar from '../components/PlayerAvatar';

export default function Home() {
  const top100 = [...PLAYERS].sort((a, b) => b.points - a.points).slice(0, 100);

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1 className="hero-title">
          <span className="logo-outer">OUTER</span><span className="logo-tiers">TIERS</span>
        </h1>
        <p className="hero-tagline">Minecraft PvP Rankings</p>
        <div className="hero-divider" />
        <p className="hero-subtitle">The definitive competitive ranking platform</p>
        <div className="hero-stats">
          <div className="hero-stat">
            <Users size={16} />
            <span><strong>{PLAYERS.length}</strong> Ranked Players</span>
          </div>
          <div className="hero-stat">
            <Globe size={16} />
            <span><strong>3</strong> Regions</span>
          </div>
          <div className="hero-stat">
            <img src="/tier_icons/overall.svg" alt="" width={16} height={16} />
            <span><strong>10</strong> Game Modes</span>
          </div>
        </div>
        <Link to="/rankings/overall" className="hero-btn">View Rankings</Link>
      </div>

      <div className="home-top100">
        <h2 className="section-title">Top 100 Players</h2>
        {top100.length === 0 ? (
          <div className="empty-state">
            <p>No players ranked yet. Rankings will appear here once players are added.</p>
          </div>
        ) : (
          <div className="top100-table-wrapper">
            <table className="rankings-table">
              <thead>
                <tr>
                  <th className="col-rank">#</th>
                  <th className="col-player">PLAYER</th>
                  <th className="col-region">REGION</th>
                  <th className="col-points">POINTS</th>
                </tr>
              </thead>
              <tbody>
                {top100.map((player, i) => {
                  const rank = i + 1;
                  const rankClass = rank === 1 ? 'rank-gold' : rank === 2 ? 'rank-silver' : rank === 3 ? 'rank-bronze' : '';
                  return (
                    <tr key={player.id} className={`player-row ${rankClass ? 'player-row-top' : ''}`}>
                      <td className="col-rank">
                        <span className={`rank-number ${rankClass}`}>{rank}.</span>
                      </td>
                      <td className="col-player">
                        <Link to={`/player/${player.username}`} className="player-cell">
                          <div className={`player-avatar-wrapper ${rankClass}`}>
                            <PlayerAvatar username={player.username} size={36} />
                          </div>
                          <div className="player-info">
                            <span className="player-name">{player.username}</span>
                            <span className="player-title">
                              <img src="/tier_icons/overall.svg" alt="" width={12} height={12} style={{ opacity: 0.7 }} />
                              {getTitle(player.points)}
                            </span>
                          </div>
                        </Link>
                      </td>
                      <td className="col-region">
                        <span className={`region-badge region-${player.region.toLowerCase()}`}>{player.region}</span>
                      </td>
                      <td className="col-points">
                        <span className="points-value">{player.points}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
