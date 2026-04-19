import { Link } from 'react-router-dom';
import { useState } from 'react';
import { PLAYERS, getTitle, CATEGORIES } from '../data/players';
import PlayerAvatar from '../components/PlayerAvatar';
import DiscordJoinModal from '../components/DiscordJoinModal';

const DISCORD_OFFICIAL  = 'https://discord.gg/6eAaPqg4up';
const DISCORD_COMMUNITY = 'https://discord.gg/teAFSB5EvF';

const DISCORD_SVG = (size = 22) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const SOCIAL_LINKS = [
  { name: 'OuterTiers Official',  isDiscord: true,  url: DISCORD_OFFICIAL,  icon: DISCORD_SVG() },
  { name: 'Outer Community',      isDiscord: true,  url: DISCORD_COMMUNITY, icon: DISCORD_SVG() },
  {
    name: 'TikTok', isDiscord: false,
    url: 'https://www.tiktok.com/@0utversal?_r=1&_t=ZG-95fYwVyqN04',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
      </svg>
    ),
  },
  {
    name: 'YouTube', isDiscord: false,
    url: 'https://youtube.com/@outversal?si=nUQNC51TzTXQkC7N',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
];

const LIVE_TEST_RESULTS: { username: string; category: string; tier: string; region: string }[] = [];
const HIGH_TIER_RESULTS: { username: string; category: string; tier: string; region: string }[] = [];

function StatCard({ value, label, icon }: { value: string | number; label: string; icon: React.ReactNode }) {
  return (
    <div className="stat-card ripple-card">
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: string; title: string; desc: string; delay: string }) {
  return (
    <div className="feature-card animate-fade-up ripple-card" style={{ animationDelay: delay }}>
      <div className="feature-card-icon">{icon}</div>
      <div className="feature-card-title">{title}</div>
      <div className="feature-card-desc">{desc}</div>
    </div>
  );
}

function RegionBadge({ region }: { region: string }) {
  const cls = region === 'NA' ? 'region-na' : region === 'EU' ? 'region-eu' : region === 'AS' ? 'region-as' : 'region-oc';
  return <span className={`region-badge ${cls}`}>{region}</span>;
}

function TierLabel({ tier }: { tier: string }) {
  const isHigh = tier.startsWith('HT');
  return <span className={`feed-tier-badge ${isHigh ? 'feed-tier-high' : 'feed-tier-low'}`}>{tier}</span>;
}

function FeedItem({ username, category, tier, region }: { username: string; category: string; tier: string; region: string }) {
  return (
    <div className="feed-item">
      <div className="feed-item-avatar"><PlayerAvatar username={username} size={44} /></div>
      <div className="feed-item-name">{username}</div>
      <div className="feed-item-right">
        <span className="feed-item-category">{category}</span>
        <TierLabel tier={tier} />
        <RegionBadge region={region} />
      </div>
    </div>
  );
}

export default function Home() {
  const top100 = [...PLAYERS].sort((a, b) => b.points - a.points).slice(0, 100);
  const [showDiscordModal, setShowDiscordModal] = useState(false);

  return (
    <div className="home-page">

      {/* ===== HERO ===== */}
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
          The competitive Minecraft PvP ranking platform.<br />
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
          <Link to="/rankings/overall" className="hero-btn hero-btn-primary btn-press">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            View Rankings
          </Link>
          <Link to="/api-docs" className="hero-btn hero-btn-secondary btn-press">
            API Docs
          </Link>
        </div>
      </div>

      {/* ===== TOP 100 ===== */}
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

      {/* ===== GAME MODES GRID ===== */}
      <div className="game-modes-section animate-fade-up">
        <div className="section-header">
          <div className="section-label">Categories</div>
          <h2 className="section-heading">Browse by Game Mode</h2>
        </div>
        <div className="game-modes-grid">
          {CATEGORIES.filter(c => c.id !== 'overall').map((cat, i) => (
            <Link
              key={cat.id}
              to={`/rankings/${cat.id}`}
              className="game-mode-card ripple-card animate-fade-up"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <img src={cat.icon} alt={cat.label} className="game-mode-icon" />
              <span className="game-mode-label">{cat.label}</span>
              <svg className="game-mode-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* ===== ABOUT / DESCRIPTION ===== */}
      <div className="about-section animate-fade-up">
        <div className="about-inner">
          <div className="about-text-col">
            <div className="about-eyebrow">THE ULTIMATE COMPETITIVE PVP EXPERIENCE IN MINECRAFT FEATURING A STATE OF THE ART SERVER AND GLOBAL RANKING NETWORK.</div>
            <h2 className="about-title">The Ultimate PvP Experience:</h2>
            <p className="about-body">
              OuterTiers is a Minecraft network consisting of a Tier List system
              and various communities. Designed by competitive players, for competitive players.
              We are the hub for all things related to competitive gameplay in Minecraft.
              We specialize in championing 1.9+ combat via various kits which are globally
              recognized as game modes within the community.
            </p>
          </div>

          <div className="feed-card">
            <div className="feed-card-header">
              <h3 className="feed-card-title">High Tier Results</h3>
              <span className="feed-badge feed-badge-red">LATEST HIGH TIER 3 AND ABOVE RESULTS</span>
            </div>
            <div className="feed-list">
              {HIGH_TIER_RESULTS.length === 0 ? (
                <div className="feed-empty">No results available yet.</div>
              ) : (
                HIGH_TIER_RESULTS.map((r, i) => <FeedItem key={i} {...r} />)
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== LIVE TEST RESULTS ===== */}
      <div className="live-results-section animate-fade-up">
        <div className="feed-card feed-card-wide">
          <div className="feed-card-header">
            <h3 className="feed-card-title">Live Test Results</h3>
            <span className="feed-badge feed-badge-red">FEED OF ALL TIER RESULTS</span>
          </div>
          <div className="feed-list">
            {LIVE_TEST_RESULTS.length === 0 ? (
              <div className="feed-empty">No results available yet.</div>
            ) : (
              LIVE_TEST_RESULTS.map((r, i) => <FeedItem key={i} {...r} />)
            )}
          </div>
        </div>
      </div>

      {/* ===== FEATURES ===== */}
      <div className="features-section">
        <div className="section-header animate-fade-up">
          <div className="section-label">Why OuterTiers?</div>
          <h2 className="section-heading">The best Minecraft PvP ranking system</h2>
        </div>
        <div className="features-grid">
          <FeatureCard delay="0s"    icon="⚔️"  title="10 Categories"   desc="From UHC to Mace — every PvP category has its own detailed ranking with precise skill evaluation." />
          <FeatureCard delay="0.07s" icon="🏆"  title="5-Tier System"   desc="A clear and fair tier system from T1 to T5, pinpointing each player's exact skill level." />
          <FeatureCard delay="0.14s" icon="📊"  title="Points & Titles" desc="Earn ranking points and climb from Rookie all the way up to Combat Grandmaster." />
          <FeatureCard delay="0.21s" icon="🔍"  title="Player Profiles" desc="Detailed profiles showing all categories, tiers, titles and points at a glance." />
        </div>
      </div>

      {/* ===== DISCORD JOIN ===== */}
      <div className="discord-section animate-fade-up">
        <div className="discord-card">
          <h2 className="discord-title">Join our official Discord Server!</h2>
          <div className="discord-btns-row">
            <button
              className="discord-btn btn-press"
              onClick={() => setShowDiscordModal(true)}
            >
              {DISCORD_SVG(22)}
              OuterTiers Official
            </button>
            <button
              className="discord-btn discord-btn-community btn-press"
              onClick={() => setShowDiscordModal(true)}
            >
              {DISCORD_SVG(22)}
              Outer Community
            </button>
          </div>
        </div>

        <div className="community-stats-grid">
          <div className="community-stat-card">
            <div className="community-stat-title">Community Members</div>
          </div>
          <div className="community-stat-card">
            <div className="community-stat-title">Active Testers</div>
            <div className="discord-stat-row">
              <span className="discord-stat-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }}>
                  <circle cx="12" cy="12" r="10"/>
                </svg>
                Total all-time tests
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SOCIAL MEDIA ===== */}
      <div className="social-section animate-fade-up">
        <div className="social-icons-row">
          {SOCIAL_LINKS.map(s => (
            s.isDiscord ? (
              <button
                key={s.name}
                className="social-icon-btn btn-press"
                aria-label={s.name}
                title={s.name}
                onClick={() => setShowDiscordModal(true)}
              >
                {s.icon}
              </button>
            ) : (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn btn-press"
                aria-label={s.name}
                title={s.name}
              >
                {s.icon}
              </a>
            )
          ))}
        </div>
      </div>

      {/* ===== DISCORD MODAL ===== */}
      {showDiscordModal && <DiscordJoinModal onClose={() => setShowDiscordModal(false)} />}

    </div>
  );
}
