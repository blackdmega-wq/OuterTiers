import { Link } from 'react-router-dom';
import { Trophy, Users, Globe } from 'lucide-react';
import { PLAYERS, getTitle } from '../data/players';
import PlayerAvatar from '../components/PlayerAvatar';
import TierBadge from '../components/TierBadge';

export default function Home() {
  const top3 = [...PLAYERS].sort((a, b) => b.points - a.points).slice(0, 3);

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1 className="hero-title">
          <span className="logo-outer">OUTER</span><span className="logo-tiers">TIERS</span>
        </h1>
        <p className="hero-subtitle">The definitive Minecraft PvP ranking platform</p>
        <div className="hero-stats">
          <div className="hero-stat">
            <Users size={20} />
            <span><strong>{PLAYERS.length}</strong> Ranked Players</span>
          </div>
          <div className="hero-stat">
            <Globe size={20} />
            <span><strong>3</strong> Regions</span>
          </div>
          <div className="hero-stat">
            <Trophy size={20} />
            <span><strong>8</strong> Game Modes</span>
          </div>
        </div>
        <Link to="/rankings/overall" className="hero-btn">View Rankings</Link>
      </div>

      <div className="home-top3">
        <h2 className="section-title">Top Players</h2>
        <div className="top3-grid">
          {top3.map((player, i) => (
            <Link key={player.id} to={`/player/${player.username}`} className={`top3-card rank-card-${i + 1}`}>
              <div className="top3-rank">#{i + 1}</div>
              <PlayerAvatar username={player.username} size={64} className="top3-avatar" />
              <div className="top3-name">{player.username}</div>
              <div className="top3-title">{getTitle(player.points)}</div>
              <div className="top3-points">{player.points} pts</div>
              <div className="top3-region">
                <span className={`region-badge region-${player.region.toLowerCase()}`}>{player.region}</span>
              </div>
              <div className="top3-tier">
                <TierBadge tier={player.tiers.overall} size="md" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
