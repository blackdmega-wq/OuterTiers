import { useParams, Link } from 'react-router-dom';
import { PLAYERS, CATEGORIES, getTitle } from '../data/players';
import type { PlayerTiers } from '../data/players';
import TierBadge from '../components/TierBadge';
import PlayerAvatar from '../components/PlayerAvatar';
import { ArrowLeft } from 'lucide-react';

export default function PlayerProfile() {
  const { username } = useParams<{ username: string }>();
  const player = PLAYERS.find(p => p.username.toLowerCase() === username?.toLowerCase());

  if (!player) {
    return (
      <div className="not-found-page">
        <h1>PAGE NOT FOUND</h1>
        <p>The page you were looking for does not exist.</p>
        <Link to="/" className="go-home-btn">
          <ArrowLeft size={16} />
          Go Home
        </Link>
      </div>
    );
  }

  const rank = [...PLAYERS].sort((a, b) => b.points - a.points).findIndex(p => p.id === player.id) + 1;

  return (
    <div className="profile-page">
      <div className="profile-container">
        <Link to="/rankings/overall" className="back-link">
          <ArrowLeft size={16} />
          Back to Rankings
        </Link>

        <div className="profile-header">
          <div className="profile-avatar-large">
            <PlayerAvatar username={player.username} size={96} />
          </div>
          <div className="profile-header-info">
            <h1 className="profile-username">{player.username}</h1>
            <div className="profile-title">
              <span className="title-diamond">◆</span>
              {getTitle(player.points)}
            </div>
            <div className="profile-meta">
              <span className={`region-badge region-${player.region.toLowerCase()}`}>{player.region}</span>
              <span className="profile-points">{player.points} points</span>
              <span className="profile-rank">Rank #{rank}</span>
            </div>
          </div>
        </div>

        <div className="profile-tiers-section">
          <h2 className="profile-section-title">Tier Rankings</h2>
          <div className="profile-tiers-grid">
            {CATEGORIES.filter(c => c.id !== 'overall').map(cat => (
              <div key={cat.id} className="profile-tier-card">
                <div className="profile-tier-mode">
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </div>
                <TierBadge tier={player.tiers[cat.id as keyof PlayerTiers]} size="md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
