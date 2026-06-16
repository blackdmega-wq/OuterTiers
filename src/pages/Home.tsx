import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { CATEGORIES, getTitle } from '../data/players';
import PlayerAvatar from '../components/PlayerAvatar';
import PodiumSkin3D from '../components/PodiumSkin3D';
import DiscordJoinModal from '../components/DiscordJoinModal';
import Logo from '../components/Logo';
import { usePlayers } from '../hooks/usePlayers';
import { usePresence } from '../hooks/usePresence';

const GAME_MODE_CATEGORIES = CATEGORIES.filter(c => c.id !== 'overall');

function useCountUp(target: number, duration = 900) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const start = prev.current;
    const diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(start + diff * ease));
      if (t < 1) raf = requestAnimationFrame(tick);
      else prev.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return display;
}

interface FeedEntry { username: string; category?: string; tier: string; region: string; mode?: string | null; }

const HIGH_TIER_CUTOFF = new Set(['HT1', 'HT2', 'HT3']);
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || 'https://outertiers-api.onrender.com';

function useLiveFeed() {
  const [liveResults, setLiveResults] = useState<FeedEntry[]>([]);
  const [highResults, setHighResults] = useState<FeedEntry[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/results/live`).then(r => r.json()).catch(() => ({ results: [] })),
      fetch(`${API_BASE}/api/results/high-tier`).then(r => r.json()).catch(() => ({ results: [] })),
    ]).then(([live, high]) => {
      const liveArr = (live.results ?? []).slice(0, 15).map((r: { username: string; mode?: string | null; tier: string; region: string }) => ({
        username: r.username,
        category: modeLabel(r.mode ?? null),
        tier: r.tier,
        region: r.region,
      }));
      const highArr = (high.results ?? [])
        .filter((r: { tier: string }) => HIGH_TIER_CUTOFF.has(r.tier))
        .slice(0, 15)
        .map((r: { username: string; mode?: string | null; tier: string; region: string }) => ({
          username: r.username,
          category: modeLabel(r.mode ?? null),
          tier: r.tier,
          region: r.region,
        }));
      setLiveResults(liveArr);
      setHighResults(highArr);
    });
  }, []);

  return { liveResults, highResults };
}

function modeLabel(mode: string | null): string {
  if (!mode) return 'Overall';
  const MAP: Record<string, string> = {
    sword: 'Sword', speed: 'Speed', pot: 'Pot', nethop: 'NethOP',
    ogvanilla: 'OG Vanilla', vanilla: 'Crystal', uhc: 'UHC',
    axe: 'Axe', mace: 'Mace', smp: 'SMP',
  };
  return MAP[mode.toLowerCase()] ?? mode;
}

const DISCORD_SVG = (size = 22, cls = "") => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={cls}>
    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

function StatCard({ value, label, icon, wide, liveIndicator }: { value: string | number; label: string; icon: React.ReactNode; wide?: boolean; liveIndicator?: boolean }) {
  return (
    <div className={`stat-card ripple-card${wide ? ' stat-card-wide' : ''}`}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">
        {label}
        {liveIndicator && <span className="stat-live-dot" title="Live count" />}
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode; title: string; desc: string; delay: string }) {
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

function FeedItem({ username, category, tier, region }: FeedEntry) {
  return (
    <div className="feed-item">
      <div className="feed-item-avatar"><PlayerAvatar username={username} size={36} /></div>
      <span className="feed-item-name">{username}</span>
      <span className="feed-item-mode-pill">{category}</span>
      <div className="feed-item-right">
        <TierLabel tier={tier} />
        <RegionBadge region={region} />
      </div>
    </div>
  );
}

/* ── Trophy icon for podium ── */
function LbTrophyIcon({ rank }: { rank: number }) {
  const cls = rank === 1 ? 'lb-trophy--gold' : rank === 2 ? 'lb-trophy--silver' : 'lb-trophy--bronze';
  return (
    <svg className={`lb-trophy ${cls}`} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 2h12v8a6 6 0 0 1-12 0V2z"/>
      <path d="M4 4H6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M18 4h2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <line x1="12" y1="14" x2="12" y2="16.5" stroke="currentColor" strokeWidth="2" fill="none"/>
      <rect x="7.5" y="16.5" width="9" height="2.6" rx="1.3"/>
      <rect x="9.5" y="19" width="5" height="1.8" rx="0.9" opacity="0.7"/>
    </svg>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { players, loading: playersLoading } = usePlayers();
  const top100 = [...players]
    .filter(p => p.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 100);
  const [showDiscordModal, setShowDiscordModal] = useState(false);
  const displayCount = useCountUp(players.length, 1100);
  const live = !playersLoading;
  const { liveResults, highResults } = useLiveFeed();
  const onlineCount = usePresence();
  const displayOnline = useCountUp(onlineCount, 700);

  const top3 = top100.slice(0, 3);
  const rest = top100.slice(3);

  return (
    <div className="home-page">

      {/* ===== HERO ===== */}
      <div className="hero-section">
        <div className="hero-glow-left" />
        <div className="hero-glow-right" />
        <div className="hero-glow-center" />

        <a
          href="https://modrinth.com/mod/outertiers-tiertagger"
          target="_blank"
          rel="noopener noreferrer"
          className="hero-tiertagger-link animate-fade-down"
          style={{ animationDelay: '0.02s' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download TierTagger Mod
        </a>

        <div className="hero-eyebrow animate-fade-down" style={{ animationDelay: '0.05s' }}>
          <span className="hero-eyebrow-dot" />
          Minecraft PvP Ranking
        </div>

        <h1 className="hero-title hero-title-with-logo animate-fade-in">
          <Logo size={88} className="hero-title-logo" />
          <span className="hero-title-text">
            <span className="logo-outer">OUTER</span><span className="logo-tiers">TIERS</span>
          </span>
        </h1>
        <p className="hero-tagline animate-fade-in" style={{ animationDelay: '0.1s' }}>Minecraft PvP Rankings</p>

        <div className="hero-divider animate-expand" style={{ animationDelay: '0.2s' }} />

        <p className="hero-subtitle animate-fade-up" style={{ animationDelay: '0.25s' }}>
          The competitive Minecraft PvP ranking platform.
        </p>

        <div className="hero-stats-row animate-fade-up" style={{ animationDelay: '0.35s' }}>
          <StatCard
            value={displayCount}
            label="Players Tested"
            liveIndicator={live}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
              </svg>
            }
          />
          <StatCard
            value={displayOnline}
            label="Viewers Online"
            liveIndicator
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            }
          />
          <StatCard
            value={GAME_MODE_CATEGORIES.length}
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

        <div className="hero-game-modes animate-fade-up" style={{ animationDelay: '0.55s' }}>
          {GAME_MODE_CATEGORIES.map((cat) => (
            <Link key={cat.id} to={`/rankings/${cat.id}`} className="game-mode-chip btn-press">
              <img src={cat.icon} alt="" className="game-mode-chip-icon" />
              <span>{cat.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ===== TOP 100 REVAMPED ===== */}
      <div className="home-top100">
        <div className="section-header animate-fade-up">
          <div className="section-label">Leaderboard</div>
          <h2 className="section-heading">Top 100 Players</h2>
        </div>

        {playersLoading ? (
          <div className="rankings-loading animate-fade-up">Loading leaderboard...</div>
        ) : top100.length === 0 ? (
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
          <div className="lb-wrap animate-fade-up">

            {/* ── TOP 3 PODIUM ── */}
            {top3.length > 0 && (
              <div className="lb-podium">
                <div className="lb-podium-bg" />
                {([
                  top3[1] ? { player: top3[1], rank: 2 } : null,
                  top3[0] ? { player: top3[0], rank: 1 } : null,
                  top3[2] ? { player: top3[2], rank: 3 } : null,
                ] as Array<{ player: typeof top3[0]; rank: number } | null>)
                  .filter((e): e is { player: typeof top3[0]; rank: number } => e !== null)
                  .map(({ player, rank }) => (
                    <div
                      key={player.id}
                      className={`lb-pod lb-pod--rank${rank}`}
                      onClick={() => navigate(`/player/${player.username}`)}
                    >
                      {rank === 1 && (
                        <div className="lb-fire-wrap">
                          {/* Revamped multi-color Minecraft firework rockets */}
                          {([
                            {l:'4%',  dur:'2.4s',delay:'0s',    fh:'152px',fc:'#FFD700',fe:'#FFFF44',fs:'255,220,0'},
                            {l:'13%', dur:'3.0s',delay:'0.55s', fh:'174px',fc:'#FF4455',fe:'#FF8899',fs:'255,80,80'},
                            {l:'23%', dur:'2.65s',delay:'1.25s',fh:'158px',fc:'#44AAFF',fe:'#88CCFF',fs:'80,160,255'},
                            {l:'33%', dur:'3.25s',delay:'0.3s', fh:'182px',fc:'#FFD700',fe:'#FFFF88',fs:'255,220,0'},
                            {l:'43%', dur:'2.5s', delay:'1.85s',fh:'148px',fc:'#BB44FF',fe:'#DD88FF',fs:'180,80,255'},
                            {l:'53%', dur:'2.8s', delay:'0.85s',fh:'166px',fc:'#22EE66',fe:'#88FFAA',fs:'50,220,100'},
                            {l:'62%', dur:'3.1s', delay:'1.5s', fh:'170px',fc:'#FF4455',fe:'#FF7788',fs:'255,80,80'},
                            {l:'71%', dur:'2.6s', delay:'0.2s', fh:'156px',fc:'#44AAFF',fe:'#AADDFF',fs:'80,160,255'},
                            {l:'80%', dur:'3.45s',delay:'1.05s',fh:'184px',fc:'#FFD700',fe:'#FFFF44',fs:'255,220,0'},
                            {l:'89%', dur:'2.75s',delay:'0.65s',fh:'162px',fc:'#BB44FF',fe:'#EE99FF',fs:'180,80,255'},
                            {l:'18%', dur:'2.9s', delay:'2.15s',fh:'145px',fc:'#22EE66',fe:'#66FFBB',fs:'50,220,100'},
                            {l:'58%', dur:'2.35s',delay:'1.7s', fh:'160px',fc:'#FFD700',fe:'#FFEE88',fs:'255,220,0'},
                          ] as {l:string;dur:string;delay:string;fh:string;fc:string;fe:string;fs:string}[]).map((r,i) => (
                            <div key={i} className="lb-fire-rocket"
                              style={{'--fdur':r.dur,'--fdelay':r.delay,'--fh':r.fh,'--fc':r.fc,'--fe':r.fe,'--fs':r.fs,left:r.l} as React.CSSProperties}
                            />
                          ))}
                        </div>
                      )}
                                            <LbTrophyIcon rank={rank} />
                      <div className="lb-pod-skin-wrap">
                        <PodiumSkin3D username={player.username} rank={rank as 1 | 2 | 3} />
                      </div>
                      <div className="lb-pod-pedestal">
                        <span className="lb-pod-num">{rank}</span>
                      </div>
                      <div className="lb-pod-info">
                        <span className="lb-pod-name">{player.username}</span>
                        <span className="lb-pod-title">{getTitle(player.points)}</span>
                        <span className="lb-pod-pts">
                          {player.points}
                          <span className="lb-pod-pts-unit"> pts</span>
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* ── RANKS 4–100 ── */}
            {rest.length > 0 && (
              <div className="lb-list">
                <div className="lb-list-header">
                  <span className="lb-lh-rank">#</span>
                  <span />
                  <span className="lb-lh-player">Player</span>
                  <span className="lb-lh-pts">Points</span>
                </div>
                {rest.map((player, i) => {
                  const rank = i + 4;
                  const isTop10 = rank <= 10;
                  return (
                    <div
                      key={player.id}
                      className={`lb-row${isTop10 ? ' lb-row--top10' : ''}`}
                      onClick={() => navigate(`/player/${player.username}`)}
                    >
                      <span className="lb-rank">{rank}</span>
                      <img
                        src={`https://mc-heads.net/avatar/${player.username}/36`}
                        alt={player.username}
                        className="lb-avatar"
                        loading="lazy"
                      />
                      <span className="lb-info">
                        <span className="lb-name">{player.username}</span>
                        <span className="lb-title">{getTitle(player.points)}</span>
                      </span>
                      <span className="lb-pts">
                        {player.points}
                        <span className="lb-pts-label">pts</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}
      </div>

      {/* ===== ABOUT / DESCRIPTION ===== */}
      <div className="about-section animate-fade-up">
        <img src="/minecraft-grass.gif" alt="Minecraft" style={{ display: 'block', margin: '0 auto 1.5rem', width: 64, height: 64, imageRendering: 'pixelated' }} />
        <div className="about-eyebrow">THE ULTIMATE COMPETITIVE PVP EXPERIENCE IN MINECRAFT FEATURING A STATE OF THE ART SERVER AND GLOBAL RANKING NETWORK.</div>
        <div className="hero-tagline-box hero-tagline-box-purple">
          <span className="hero-tagline-box-glow" />
          <h2 className="about-title hero-tagline-box-text">The Ultimate PvP Experience</h2>
        </div>
        <p className="about-body">
          The 1.9+ scene has always known who the real players are.
          OuterTiers puts it on record. Structured tier tests across Crystal, Sword,
          and more, with testers held to a strict standard. Your placement reflects
          your actual skill. Nothing more, nothing less.
        </p>
      </div>

      {/* ===== HIGH TIER RESULTS + LIVE TEST RESULTS (side by side) ===== */}
      <div className="feeds-row-section animate-fade-up">
        <div className="feed-card">
          <div className="feed-card-header">
            <h3 className="feed-card-title">High Tier Results</h3>
            <span className="feed-badge feed-badge-red">HT3 AND ABOVE ONLY</span>
          </div>
          <div className="feed-list">
            {highResults.length === 0 ? (
              <div className="feed-empty">No high tier results yet.</div>
            ) : (
              highResults.map((r, i) => <FeedItem key={i} {...r} />)
            )}
          </div>
        </div>

        <div className="feed-card">
          <div className="feed-card-header">
            <h3 className="feed-card-title">Live Test Results</h3>
            <span className="feed-badge feed-badge-red">FEED OF ALL TIER RESULTS</span>
          </div>
          <div className="feed-list">
            {liveResults.length === 0 ? (
              <div className="feed-empty">No results available yet.</div>
            ) : (
              liveResults.map((r, i) => <FeedItem key={i} {...r} />)
            )}
          </div>
        </div>
      </div>

      {/* ===== FEATURES ===== */}
      <div className="features-section">
        <div className="section-header animate-fade-up">
          <div className="section-label">Why OuterTiers?</div>
          <div className="hero-tagline-box hero-tagline-box-blue">
            <span className="hero-tagline-box-glow" />
            <h2 className="section-heading hero-tagline-box-text">Why OuterTiers is Goated</h2>
          </div>
          <p className="section-sub animate-fade-up" style={{ animationDelay: '0.1s' }}>
            OuterTiers exists to create a fair, competitive, and great ranking system where everyone will be satisfied. We will try our best for you to get the greatest experience on OuterTiers.
          </p>
        </div>
        <div className="features-grid">
          <FeatureCard delay="0s"    icon={<img src="/feature-icons/feature-1.png" alt="" style={{width:48,height:48,objectFit:'contain'}} />} title="Fairness & Neutrality First" desc="Fairness and neutrality is our biggest priority. Every tier test and ticket is strictly overseen to make sure everything stays neutral and fair — no exceptions, no favouritism." />
          <FeatureCard delay="0.07s" icon={<img src="/feature-icons/feature-2.png" alt="" style={{width:48,height:48,objectFit:'contain'}} />} title="Zero Corruption" desc="We won't allow corrupted staff or testers on OuterTiers. If anyone isn't neutral and fair, they will be immediately demoted. Boosting players is strictly forbidden." />
          <FeatureCard delay="0.14s" icon={<img src="/feature-icons/feature-3.png" alt="" style={{width:48,height:48,objectFit:'contain'}} />} title="Accurate Rankings" desc="We are tired of testers ranking players unfairly. OuterTiers puts a lot of value into professionalism, every tier test is strictly overseen to guarantee accurate and fair placements. Unnecessary punishments or extended cooldowns will not happen here." />
          <FeatureCard delay="0.21s" icon={<img src="/feature-icons/feature-4.png" alt="" style={{width:48,height:48,objectFit:'contain'}} />} title="Better Queue System" desc="Queues open one minute after being announced, giving every player enough time to join. This makes queue-sniping bots useless and ensures the process is fair for everyone." />
          <FeatureCard delay="0.28s" icon={<img src="/feature-icons/feature-5.png" alt="" style={{width:48,height:48,objectFit:'contain'}} />} title="Equal Treatment for All" desc="Everyone is treated as any other member. No one is treated differently because of their ethnicity, religion, or personality." />
          <FeatureCard delay="0.35s" icon={<img src="/feature-icons/feature-6.png" alt="" style={{width:48,height:48,objectFit:'contain'}} />} title="Real & Respectful Community" desc="We are friendly, respectful, and real — no hypocrisy on our team. We will never tolerate false punishments of legit players out of hatred. What you see is what you get." />
        </div>
      </div>

      {/* ===== DISCORD JOIN ===== */}
      <div className="discord-section animate-fade-up">
        <div className="discord-card">
          <h2 className="discord-title">Join our official Discord Server!</h2>
          <p className="discord-subtitle">Choose your community and connect with competitive players.</p>
          <div className="discord-btns-row">
            <button className="discord-btn btn-press" onClick={() => setShowDiscordModal(true)}>
              {DISCORD_SVG(22, "discord-icon-spin")} OuterTiers Official
            </button>
            <button className="discord-btn discord-btn-community btn-press" onClick={() => setShowDiscordModal(true)}>
              {DISCORD_SVG(22, "discord-icon-spin")} Outer Community
            </button>
          </div>
        </div>
      </div>

      {showDiscordModal && <DiscordJoinModal onClose={() => setShowDiscordModal(false)} />}
    </div>
  );
}
