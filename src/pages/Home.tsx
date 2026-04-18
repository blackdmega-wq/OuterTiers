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

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="feature-card">
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

        <div className="hero-eyebrow">
          <span className="hero-eyebrow-dot" />
          Minecraft PvP · Season 1
        </div>

        <h1 className="hero-title">
          <span className="logo-outer">OUTER</span><span className="logo-tiers">TIERS</span>
        </h1>
        <p className="hero-tagline">Minecraft PvP Rankings</p>

        <div className="hero-divider" />

        <p className="hero-subtitle">
          Das kompetitivste Minecraft PvP Ranking-System.<br />
          Jeder Tier. Jede Kategorie. Jeder Spieler.
        </p>

        <div className="hero-stats-row">
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
            value="T1–T5"
            label="Tier System"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
              </svg>
            }
          />
        </div>

        <div className="hero-actions">
          <Link to="/rankings/overall" className="hero-btn hero-btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Rankings ansehen
          </Link>
          <Link to="/rankings/uhc" className="hero-btn hero-btn-secondary">
            Top UHC Spieler
          </Link>
        </div>
      </div>

      <div className="features-section">
        <div className="section-header">
          <div className="section-label">Warum OuterTiers?</div>
          <h2 className="section-heading">Das beste PvP Ranking-System</h2>
        </div>
        <div className="features-grid">
          <FeatureCard
            icon="⚔️"
            title="10 Kategorien"
            desc="Von UHC bis Mace — jede PvP-Kategorie hat ihr eigenes detailliertes Ranking."
          />
          <FeatureCard
            icon="🏆"
            title="Tier 1 bis Tier 5"
            desc="Ein klares, faires Tier-System das jedem Spieler seinen genauen Skill-Level zeigt."
          />
          <FeatureCard
            icon="📊"
            title="Punkte & Titel"
            desc="Sammle Ranking-Punkte und steige vom Rookie bis zum Combat Grandmaster auf."
          />
          <FeatureCard
            icon="🔍"
            title="Spielerprofile"
            desc="Detaillierte Profile mit allen Kategorien, Tiers und Titeln auf einen Blick."
          />
        </div>
      </div>

      <div className="home-top100">
        <div className="section-header">
          <div className="section-label">Leaderboard</div>
          <h2 className="section-heading">Top 100 Spieler</h2>
        </div>
        {top100.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p className="empty-state-title">Noch keine Spieler eingetragen</p>
            <p className="empty-state-sub">Rankings erscheinen hier sobald Spieler hinzugefügt werden.</p>
          </div>
        ) : (
          <div className="top100-table-wrapper">
            <table className="rankings-table">
              <thead>
                <tr>
                  <th className="col-rank">#</th>
                  <th className="col-player">SPIELER</th>
                  <th className="col-points">PUNKTE</th>
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
