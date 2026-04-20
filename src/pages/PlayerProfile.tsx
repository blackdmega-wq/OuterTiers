import { useParams, Link } from 'react-router-dom';
import { CATEGORIES, getTitle } from '../data/players';
import type { PlayerTiers } from '../data/players';
import { usePlayer, usePlayers } from '../hooks/usePlayers';
import CategoryTierBadge from '../components/CategoryTierBadge';
import PlayerAvatar from '../components/PlayerAvatar';
import { ArrowLeft } from 'lucide-react';

export default function PlayerProfile() {
  const { username } = useParams<{ username: string }>();
  const { player, loading } = usePlayer(username);
  const { players } = usePlayers();

  if (loading) {
    return (
      <div className="not-found-page">
        <p style={{ color: 'var(--text-dim)' }}>Loading...</p>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="not-found-page">
        <div className="not-found-glow" />
        <div className="not-found-icon">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h1>Player Not Found</h1>
        <p>No player named <strong style={{ color: 'var(--text-dim)' }}>"{username}"</strong> exists in the system.</p>
        <Link to="/" className="go-home-btn btn-press">
          <ArrowLeft size={15} />
          Go Home
        </Link>
      </div>
    );
  }

  const sorted = [...players].sort((a, b) => b.points - a.points);
  const rank = sorted.findIndex(p => p.id === player.id) + 1;
  const modeCats = CATEGORIES.filter(c => c.id !== 'overall');
  const rankClass = rank === 1 ? 'rank-gold' : rank === 2 ? 'rank-silver' : rank === 3 ? 'rank-bronze' : '';

  return (
    <div className="profile-page">
      <div className="profile-page-hero">
        <div className="profile-page-glow" />
        <div className="profile-page-hero-inner">
          <Link to="/rankings/overall" className="back-link btn-press">
            <ArrowLeft size={14} />
            Back to Rankings
          </Link>
        </div>
      </div>

      <div className="profile-container">
        <div className={`profile-header-card ${rankClass ? `profile-header-card--${rankClass}` : ''}`}>
          <div className={`profile-avatar-ring ${rankClass}`}>
            <PlayerAvatar username={player.username} size={88} />
          </div>
          <div className="profile-header-info">
            <h1 className="profile-username">{player.username}</h1>
            <div className="profile-title">
              <img src="/tier_icons/overall.svg" alt="" width={14} height={14} style={{ opacity: 0.7 }} />
              {getTitle(player.points)}
            </div>
            <div className="profile-meta">
              <span className={`region-badge region-${player.region.toLowerCase()}`}>{player.region}</span>
              <span className="profile-points-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                {player.points} pts
              </span>
              {rank > 0 && <span className="profile-rank-badge">#{rank}</span>}
            </div>
          </div>
        </div>

        <div className="profile-tiers-section">
          <div className="profile-section-header">
            <div className="section-label">Performance</div>
            <h2 className="section-heading" style={{ fontSize: '1.1rem' }}>Tier Rankings by Category</h2>
          </div>
          <div className="profile-tiers-grid">
            {modeCats.map(cat => {
              const rawTier = player.rawTiers?.[cat.id as keyof typeof player.rawTiers];
              return (
                <div key={cat.id} className="profile-tier-card ripple-card">
                  <div className="profile-tier-mode">
                    <img src={cat.icon} alt={cat.label} width={26} height={26} />
                    <span>{cat.label}</span>
                  </div>
                  <CategoryTierBadge
                    categoryId={cat.id}
                    tier={player.tiers[cat.id as keyof PlayerTiers]}
                    rawTier={rawTier ?? null}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
