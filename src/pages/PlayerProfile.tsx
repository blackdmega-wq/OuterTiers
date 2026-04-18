import { useParams, Link } from 'react-router-dom';
import { PLAYERS, CATEGORIES, getTitle } from '../data/players';
import type { PlayerTiers } from '../data/players';
import CategoryTierBadge from '../components/CategoryTierBadge';
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
          <ArrowLeft size={15} />
          Go Home
        </Link>
      </div>
    );
  }

  const rank = [...PLAYERS].sort((a, b) => b.points - a.points).findIndex(p => p.id === player.id) + 1;
  const modeCats = CATEGORIES.filter(c => c.id !== 'overall');

  return (
    <div className="profile-page">
      <div className="profile-container">
        <Link to="/rankings/overall" className="back-link">
          <ArrowLeft size={14} />
          Back to Rankings
        </Link>

        <div className="profile-header">
          <div className="profile-avatar-large">
            <PlayerAvatar username={player.username} size={96} />
          </div>
          <div className="profile-header-info">
            <h1 className="profile-username">{player.username}</h1>
            <div className="profile-title">
              <img src="/tier_icons/overall.svg" alt="" width={14} height={14} style={{ opacity: 0.7 }} />
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
            {modeCats.map(cat => (
              <div key={cat.id} className="profile-tier-card">
                <div className="profile-tier-mode">
                  <img src={cat.icon} alt={cat.label} width={24} height={24} />
                  <span>{cat.label}</span>
                </div>
                <CategoryTierBadge
                  categoryId={cat.id}
                  tier={player.tiers[cat.id as keyof PlayerTiers]}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
