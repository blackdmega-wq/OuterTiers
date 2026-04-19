import { Link } from 'react-router-dom';
import { useState } from 'react';
import { PLAYERS, getTitle, CATEGORIES } from '../data/players';
import PlayerAvatar from '../components/PlayerAvatar';
import DiscordJoinModal from '../components/DiscordJoinModal';

const DISCORD_SVG = (size = 22) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const LIVE_TEST_RESULTS: { username: string; category: string; tier: string; region: string }[] = [];
const HIGH_TIER_RESULTS: { username: string; category: string; tier: string; region: string }[] = [];

function StatCard({ value, label, icon, wide }: { value: string | number; label: string; icon: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`stat-card ripple-card${wide ? ' stat-card-wide' : ''}`}>
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
            wide
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
          <p className="section-sub animate-fade-up" style={{ animationDelay: '0.1s' }}>
            OuterTiers sets the standard for competitive Minecraft PvP ranking. Built by players who understand the scene at the highest level, our platform provides the most accurate, transparent and detailed skill evaluation available anywhere.
          </p>
        </div>
        <div className="features-grid">
          <FeatureCard delay="0s"    icon="⚔️"  title="10 Unique Categories"   desc="From OG Vanilla and UHC to Mace and Speed — every major PvP discipline has its own dedicated leaderboard with category-specific tier placements, ensuring your real strengths are always recognised." />
          <FeatureCard delay="0.07s" icon="🏆"  title="Transparent 5-Tier System"   desc="Our T1 through T5 ranking structure is crystal clear and rigorously maintained. No vague labels — just precise tier placements that the entire community trusts, updated regularly by experienced judges." />
          <FeatureCard delay="0.14s" icon="📊"  title="Points, Ranks & Titles" desc="Every game mode you excel in rewards you with ranking points. Stack them across categories to climb from Rookie all the way to Combat Grandmaster and earn a title that reflects your true overall mastery." />
          <FeatureCard delay="0.21s" icon="🔍"  title="Detailed Player Profiles" desc="Each player gets a full profile page — region, overall rank, title, total points, and their individual tier in every category at a glance. The most complete player card in the Minecraft PvP community." />
          <FeatureCard delay="0.28s" icon="🌍"  title="Global Region Support" desc="Players from NA, EU, AS and OC all compete on the same platform. Regional badges let you identify where the best competition is coming from, no matter where in the world you play." />
          <FeatureCard delay="0.35s" icon="🚀"  title="Built for the Community" desc="OuterTiers was created by competitive players for competitive players. Every design decision — from the tier definitions to the point system — was made with fairness, accuracy and community input at its core." />
        </div>
      </div>

      {/* ===== DISCORD JOIN ===== */}
      <div className="discord-section animate-fade-up">
        <div className="discord-card">
          <h2 className="discord-title">Join our official Discord Server!</h2>
          <p className="discord-subtitle">Choose your community and connect with competitive players.</p>
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
      </div>

      <div className="game-modes-bottom animate-fade-up">
        <div className="section-header">
          <div className="section-label">Game Modes</div>
          <h2 className="section-heading">Every Mode on OuterTiers</h2>
        </div>
        <div className="game-modes-chip-grid">
          {CATEGORIES.filter(c => c.id !== 'overall').map((cat) => (
            <Link key={cat.id} to={`/rankings/${cat.id}`} className="game-mode-chip btn-press">
              <img src={cat.icon} alt="" className="game-mode-chip-icon" />
              <span>{cat.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ===== DISCORD MODAL ===== */}
      {showDiscordModal && <DiscordJoinModal onClose={() => setShowDiscordModal(false)} />}

    </div>
  );
}
