import { Link } from 'react-router-dom';
import { PLAYERS, getTitle, CATEGORIES } from '../data/players';
import PlayerAvatar from '../components/PlayerAvatar';

function StatCard({ value, label, icon }: { value: string | number; label: string; icon: React.ReactNode }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: string; title: string; desc: string; delay: string }) {
  return (
    <div className="feature-card animate-fade-up" style={{ animationDelay: delay }}>
      <div className="feature-card-icon">{icon}</div>
      <div className="feature-card-title">{title}</div>
      <div className="feature-card-desc">{desc}</div>
    </div>
  );
}

export default function Home() {
  const top100 = [...PLAYERS].sort((a, b) => b.points - a.points).slice(0, 100);

  return (
    <div className="home-page">

      <div className="hero-section">
        <div className="hero-glow-left" />
        <div className="hero-glow-right" />
        <div className="hero-glow-center" />

        <div className="hero-eyebrow animate-fade-down">
          <span className="hero-eyebrow-dot" />
          Minecraft PvP Ranking
        </div>

        <h1 className="hero-title animate-fade-in">
          <span className="logo-outer">OUTER</span><span className="logo-tiers">TIERS</span>
        </h1>
        <p className="hero-tagline animate-fade-in" style={{ animationDelay: '0.1s' }}>Minecraft PvP Rankings</p>

        <div className="hero-divider animate-expand" style={{ animationDelay: '0.2s' }} />

        <p className="hero-subtitle animate-fade-up" style={{ animationDelay: '0.25s' }}>
          The most competitive Minecraft PvP ranking platform.<br />
          Every tier. Every category. Every player.
        </p>

        <div className="hero-stats-row animate-fade-up" style={{ animationDelay: '0.35s' }}>
          <StatCard
            value={PLAYERS.length}
            label="Ranked Players"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
              </svg>
            }
          />
          <StatCard
            value={CATEGORIES.length}
            label="Game Modes"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            }
          />
          <StatCard
            value="5 Tiers"
            label="Ranking System"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 3h12v7a6 6 0 01-12 0V3z"/>
                <path d="M3 5h3v5a6 6 0 01-.5 2.4"/><path d="M21 5h-3v5a6 6 0 00.5 2.4"/>
                <line x1="9" y1="17" x2="15" y2="17"/><rect x="8" y="18" width="8" height="3" rx="0.5"/>
              </svg>
            }
          />
        </div>

        <div className="hero-actions animate-fade-up" style={{ animationDelay: '0.45s' }}>
          <Link to="/rankings/overall" className="hero-btn hero-btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            View Rankings
          </Link>
          <Link to="/api-docs" className="hero-btn hero-btn-secondary">
            API Docs
          </Link>
        </div>
      </div>

      <div className="features-section">
        <div className="section-header animate-fade-up">
          <div className="section-label">Why OuterTiers?</div>
          <h2 className="section-heading">The best Minecraft PvP ranking system</h2>
        </div>
        <div className="features-grid">
          <FeatureCard delay="0s"   icon="⚔️"  title="10 Categories"    desc="From UHC to Mace — every PvP category has its own detailed ranking with precise skill evaluation." />
          <FeatureCard delay="0.07s" icon="🏆"  title="5-Tier System"    desc="A clear and fair tier system from T1 to T5, pinpointing each player's exact skill level." />
          <FeatureCard delay="0.14s" icon="📊"  title="Points & Titles"  desc="Earn ranking points and climb from Rookie all the way up to Combat Grandmaster." />
          <FeatureCard delay="0.21s" icon="🔍"  title="Player Profiles"  desc="Detailed profiles showing all categories, tiers, titles and points at a glance." />
        </div>
      </div>

      <div className="home-top100">
        <div className="section-header animate-fade-up">
          <div className="section-label">Leaderboard</div>
          <h2 className="section-heading">Top 100 Players</h2>
        </div>
        {top100.length === 0 ? (
          <div className="empty-state animate-fade-up">
            <div className="empty-state-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p className="empty-state-title">No players ranked yet</p>
            <p className="empty-state-sub">Rankings will appear here once players are added to the system.</p>
          </div>
        ) : (
          <div className="top100-table-wrapper animate-fade-up">
            <table className="rankings-table">
              <thead>
                <tr>
                  <th className="col-rank">#</th>
                  <th className="col-player">PLAYER</th>
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
