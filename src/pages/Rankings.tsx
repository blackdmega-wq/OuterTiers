import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CATEGORIES, TIER_COLS, getCategoryTiers, getTitle } from '../data/players';
import type { Player, PlayerTiers } from '../data/players';
import { usePlayers } from '../hooks/usePlayers';
import CategoryTierBadge from '../components/CategoryTierBadge';
import InfoModal from '../components/InfoModal';
import { Info } from 'lucide-react';

const TIER_CONFIG: Record<string, { label: string; gradient: string; border: string; glow: string; textColor: string }> = {
  T1: { label: 'Tier 1', gradient: 'linear-gradient(135deg, rgba(212,160,23,0.22) 0%, rgba(255,200,40,0.10) 100%)', border: 'rgba(212,160,23,0.7)', glow: 'rgba(212,160,23,0.25)', textColor: '#f0c040' },
  T2: { label: 'Tier 2', gradient: 'linear-gradient(135deg, rgba(185,195,215,0.18) 0%, rgba(160,175,195,0.08) 100%)', border: 'rgba(185,195,215,0.55)', glow: 'rgba(180,190,210,0.2)', textColor: '#b8c8dc' },
  T3: { label: 'Tier 3', gradient: 'linear-gradient(135deg, rgba(180,115,40,0.22) 0%, rgba(160,100,30,0.10) 100%)', border: 'rgba(180,115,40,0.60)', glow: 'rgba(170,105,35,0.2)', textColor: '#c8873a' },
  T4: { label: 'Tier 4', gradient: 'linear-gradient(135deg, rgba(192,126,245,0.18) 0%, rgba(200,140,255,0.08) 100%)', border: 'rgba(192,126,245,0.45)', glow: 'rgba(192,126,245,0.15)', textColor: '#cf97f8' },
  T5: { label: 'Tier 5', gradient: 'linear-gradient(135deg, rgba(28,30,42,0.35) 0%, rgba(20,22,32,0.15) 100%)', border: 'rgba(50,52,68,0.40)', glow: 'rgba(40,42,58,0.08)', textColor: '#666880' },
};

/* ── Epic Crown accessories ── */
function CrownGold() {
  return (
    <svg className="rank-crown rank-crown--gold" viewBox="0 0 110 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a"/>
          <stop offset="45%" stopColor="#fbbf24"/>
          <stop offset="100%" stopColor="#92400e"/>
        </linearGradient>
        <linearGradient id="cg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fcd34d"/>
          <stop offset="100%" stopColor="#78350f"/>
        </linearGradient>
        <radialGradient id="ruby" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#fecaca"/>
          <stop offset="55%" stopColor="#ef4444"/>
          <stop offset="100%" stopColor="#7f1d1d"/>
        </radialGradient>
        <radialGradient id="sapp" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#dbeafe"/>
          <stop offset="55%" stopColor="#3b82f6"/>
          <stop offset="100%" stopColor="#1e3a5f"/>
        </radialGradient>
        <radialGradient id="emer" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#d1fae5"/>
          <stop offset="55%" stopColor="#10b981"/>
          <stop offset="100%" stopColor="#064e3b"/>
        </radialGradient>
        <filter id="glow-g">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Crown body */}
      <path d="M15 68 L15 36 L36 56 L55 8 L74 56 L95 36 L95 68 Z" fill="url(#cg1)" filter="url(#glow-g)"/>
      {/* Base band */}
      <rect x="12" y="62" width="86" height="20" rx="5" fill="url(#cg2)"/>
      {/* Highlight on band */}
      <rect x="12" y="62" width="86" height="6" rx="5" fill="rgba(255,255,255,0.15)"/>
      {/* Center spike gem – ruby */}
      <ellipse cx="55" cy="10" rx="8" ry="9" fill="url(#ruby)" stroke="#fca5a5" strokeWidth="0.8"/>
      <ellipse cx="52" cy="7" rx="3" ry="2" fill="rgba(255,255,255,0.5)" transform="rotate(-20 52 7)"/>
      {/* Left spike gem – sapphire */}
      <ellipse cx="15.5" cy="38" rx="6" ry="7" fill="url(#sapp)" stroke="#93c5fd" strokeWidth="0.8"/>
      <ellipse cx="13.5" cy="35" rx="2.5" ry="1.8" fill="rgba(255,255,255,0.45)" transform="rotate(-20 13.5 35)"/>
      {/* Right spike gem – emerald */}
      <ellipse cx="94.5" cy="38" rx="6" ry="7" fill="url(#emer)" stroke="#6ee7b7" strokeWidth="0.8"/>
      <ellipse cx="92.5" cy="35" rx="2.5" ry="1.8" fill="rgba(255,255,255,0.45)" transform="rotate(-20 92.5 35)"/>
      {/* Base gems row */}
      <circle cx="34" cy="72" r="5" fill="url(#sapp)" stroke="#93c5fd" strokeWidth="0.6"/>
      <circle cx="55" cy="72" r="5" fill="url(#ruby)" stroke="#fca5a5" strokeWidth="0.6"/>
      <circle cx="76" cy="72" r="5" fill="url(#emer)" stroke="#6ee7b7" strokeWidth="0.6"/>
      {/* Shimmer line */}
      <path d="M20 48 Q55 38 90 50" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function CrownSilver() {
  return (
    <svg className="rank-crown rank-crown--silver" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f1f5f9"/>
          <stop offset="40%" stopColor="#94a3b8"/>
          <stop offset="100%" stopColor="#334155"/>
        </linearGradient>
        <linearGradient id="sg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cbd5e1"/>
          <stop offset="100%" stopColor="#1e293b"/>
        </linearGradient>
        <radialGradient id="dia" cx="50%" cy="25%" r="60%">
          <stop offset="0%" stopColor="#e2e8f0"/>
          <stop offset="50%" stopColor="#bfdbfe"/>
          <stop offset="100%" stopColor="#1e3a5f"/>
        </radialGradient>
        <filter id="glow-s">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Geometric angular crown */}
      <path d="M12 64 L12 38 L28 54 L50 12 L72 54 L88 38 L88 64 Z" fill="url(#sg1)" filter="url(#glow-s)"/>
      <rect x="10" y="58" width="80" height="16" rx="4" fill="url(#sg2)"/>
      <rect x="10" y="58" width="80" height="5" rx="4" fill="rgba(255,255,255,0.18)"/>
      {/* Top gem */}
      <polygon points="50,6 56,15 50,22 44,15" fill="url(#dia)" stroke="#bfdbfe" strokeWidth="0.7"/>
      <polygon points="50,9 54,15 50,19 46,15" fill="rgba(255,255,255,0.4)"/>
      {/* Side gems */}
      <polygon points="12,31 17,38 12,44 7,38" fill="url(#dia)" stroke="#bfdbfe" strokeWidth="0.6"/>
      <polygon points="88,31 93,38 88,44 83,38" fill="url(#dia)" stroke="#bfdbfe" strokeWidth="0.6"/>
      {/* Base gems */}
      <rect x="27" y="62" width="8" height="8" rx="1" fill="url(#dia)" stroke="#bfdbfe" strokeWidth="0.5" transform="rotate(45 31 66)"/>
      <rect x="46" y="62" width="8" height="8" rx="1" fill="url(#dia)" stroke="#bfdbfe" strokeWidth="0.5" transform="rotate(45 50 66)"/>
      <rect x="65" y="62" width="8" height="8" rx="1" fill="url(#dia)" stroke="#bfdbfe" strokeWidth="0.5" transform="rotate(45 69 66)"/>
      {/* Ice shimmer */}
      <path d="M18 44 Q50 34 82 46" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function CrownBronze() {
  return (
    <svg className="rank-crown rank-crown--bronze" viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="brz1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fed7aa"/>
          <stop offset="45%" stopColor="#c07838"/>
          <stop offset="100%" stopColor="#7c2d12"/>
        </linearGradient>
        <linearGradient id="brz2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fdba74"/>
          <stop offset="100%" stopColor="#431407"/>
        </linearGradient>
        <radialGradient id="opal" cx="50%" cy="25%" r="60%">
          <stop offset="0%" stopColor="#fef3c7"/>
          <stop offset="55%" stopColor="#f97316"/>
          <stop offset="100%" stopColor="#7c2d12"/>
        </radialGradient>
        {/* Flame gradients */}
        <radialGradient id="fl1" cx="50%" cy="80%" r="80%">
          <stop offset="0%" stopColor="#fef08a"/>
          <stop offset="40%" stopColor="#f97316"/>
          <stop offset="100%" stopColor="#ef444400"/>
        </radialGradient>
        <filter id="glow-b">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Small flame effects at tips */}
      <ellipse cx="18" cy="28" rx="5" ry="8" fill="url(#fl1)" opacity="0.8"/>
      <ellipse cx="50" cy="8" rx="6" ry="10" fill="url(#fl1)" opacity="0.9"/>
      <ellipse cx="82" cy="28" rx="5" ry="8" fill="url(#fl1)" opacity="0.8"/>
      {/* Crown body */}
      <path d="M14 66 L14 38 L30 54 L50 16 L70 54 L86 38 L86 66 Z" fill="url(#brz1)" filter="url(#glow-b)"/>
      <rect x="12" y="60" width="76" height="18" rx="4" fill="url(#brz2)"/>
      <rect x="12" y="60" width="76" height="6" rx="4" fill="rgba(255,255,255,0.12)"/>
      {/* Top gem */}
      <ellipse cx="50" cy="18" rx="7" ry="8" fill="url(#opal)" stroke="#fdba74" strokeWidth="0.8"/>
      <ellipse cx="48" cy="15" rx="3" ry="2" fill="rgba(255,255,255,0.4)" transform="rotate(-20 48 15)"/>
      {/* Side gems */}
      <ellipse cx="14" cy="40" rx="5.5" ry="6.5" fill="url(#opal)" stroke="#fdba74" strokeWidth="0.7"/>
      <ellipse cx="86" cy="40" rx="5.5" ry="6.5" fill="url(#opal)" stroke="#fdba74" strokeWidth="0.7"/>
      {/* Base gems */}
      <circle cx="32" cy="70" r="4.5" fill="url(#opal)" stroke="#fdba74" strokeWidth="0.6"/>
      <circle cx="50" cy="70" r="4.5" fill="url(#opal)" stroke="#fdba74" strokeWidth="0.6"/>
      <circle cx="68" cy="70" r="4.5" fill="url(#opal)" stroke="#fdba74" strokeWidth="0.6"/>
    </svg>
  );
}

/* ── Podium card for top 3 ── */
function PodiumCard({ player, rank }: { player: Player; rank: number }) {
  const [bustFailed, setBustFailed] = useState(false);
  const glowColor = rank === 1 ? 'rgba(251,191,36,0.55)' : rank === 2 ? 'rgba(148,163,184,0.45)' : 'rgba(192,120,48,0.45)';
  const borderColor = rank === 1 ? 'rgba(251,191,36,0.4)' : rank === 2 ? 'rgba(148,163,184,0.3)' : 'rgba(192,120,48,0.35)';

  return (
    <Link
      to={`/player/${player.username}`}
      className={`podium-card podium-card--${rank}`}
      style={{ boxShadow: `0 0 0 1px ${borderColor}, 0 16px 48px rgba(0,0,0,0.55), 0 0 40px ${glowColor}` }}
    >
      {/* Accessory */}
      <div className="podium-accessory">
        {rank === 1 && <CrownGold />}
        {rank === 2 && <CrownSilver />}
        {rank === 3 && <CrownBronze />}
      </div>

      {/* Bust */}
      <div className={`podium-bust-frame podium-bust-frame--${rank}`}>
        <img
          src={bustFailed
            ? `https://mc-heads.net/avatar/${player.username}/128`
            : `https://render.crafty.gg/3d/bust/${player.username}`}
          alt={player.username}
          className="podium-bust"
          onError={() => setBustFailed(true)}
        />
      </div>

      {/* Rank badge */}
      <div className={`podium-rank-num podium-rank-num--${rank}`}>{rank}</div>

      {/* Info */}
      <div className="podium-info">
        <div className="podium-name">{player.username}</div>
        <div className="podium-meta">
          <span className={`region-badge region-${player.region.toLowerCase()}`}>{player.region}</span>
          <span className="podium-title-text">{getTitle(player.points)}</span>
        </div>
        <div className={`podium-points podium-points--${rank}`}>
          <span className="podium-pts-num">{player.points}</span>
          <span className="podium-pts-label">pts</span>
        </div>
        {/* Tier badges */}
        <div className="podium-tiers">
          {TIER_COLS.map(col => (
            <CategoryTierBadge
              key={col}
              categoryId={col}
              tier={player.tiers[col]}
              rawTier={player.rawTiers?.[col as keyof typeof player.rawTiers]}
            />
          ))}
        </div>
      </div>

      {/* Platform / podium step */}
      <div className={`podium-step podium-step--${rank}`}>
        <span className="podium-step-num">{rank === 1 ? '1st' : rank === 2 ? '2nd' : '3rd'}</span>
      </div>
    </Link>
  );
}

/* ── List row for #4+ ── */
function OverallListRow({ player, rank }: { player: Player; rank: number }) {
  return (
    <Link to={`/player/${player.username}`} className="overall-list-row">
      <span className="overall-list-rank">{rank}.</span>
      <img
        src={`https://mc-heads.net/avatar/${player.username}/32`}
        alt={player.username}
        width={32} height={32}
        style={{ imageRendering: 'pixelated', borderRadius: 6, flexShrink: 0 }}
        loading="lazy"
      />
      <span className="overall-list-name">{player.username}</span>
      <span className="overall-list-title">{getTitle(player.points)}</span>
      <span className={`region-badge region-${player.region.toLowerCase()}`}>{player.region}</span>
      <span className="overall-list-pts">{player.points}<span className="overall-list-pts-lbl"> pts</span></span>
    </Link>
  );
}

function TierArrows({ rawTier }: { rawTier?: string | null }) {
  if (!rawTier || rawTier === '-') return null;
  const isHT = rawTier.startsWith('HT');
  return (
    <span className={`tier-arrow-wrap ${isHT ? 'ht' : 'lt'}`}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <polyline points="18 15 12 9 6 15" />
      </svg>
      {isHT && (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="arrow-second">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      )}
    </span>
  );
}

/* ── Region bar colors ── */
const REGION_COLOR: Record<string, string> = {
  na: '#60a5fa', eu: '#34d399', as: '#fbbf24', oc: '#a78bfa',
};

export default function Rankings() {
  const { category = 'overall' } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [infoOpen, setInfoOpen] = useState(false);
  const { players, loading } = usePlayers();

  const isOverall = category === 'overall';
  const sorted = [...players].filter(p => p.points > 0).sort((a, b) => b.points - a.points);
  const tierColumns = !isOverall ? getCategoryTiers(category as keyof PlayerTiers, players) : [];
  const currentCat = CATEGORIES.find(c => c.id === category);

  return (
    <div className="rankings-page">
      {infoOpen && <InfoModal onClose={() => setInfoOpen(false)} />}

      <div className="rankings-page-header">
        <div className="rankings-page-header-glow" />
        <div className="rankings-header-inner">
          <div className="rankings-header-eyebrow">
            {currentCat && <img src={currentCat.icon} alt={currentCat.label} width={14} height={14} style={{ opacity: 0.75 }} />}
            <span>Leaderboard</span>
          </div>
          <h1 className="rankings-header-title">
            {isOverall ? 'Overall Rankings' : `${currentCat?.label ?? ''} Rankings`}
          </h1>
          <p className="rankings-header-sub">
            {isOverall
              ? 'Top players ranked by total points across all categories.'
              : `Tier rankings for the ${currentCat?.label ?? ''} game mode.`}
          </p>
        </div>
      </div>

      <div className="rankings-container">
        <div className="category-tabs">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`category-tab ${category === cat.id ? 'active' : ''}`}
              onClick={() => navigate(`/rankings/${cat.id}`)}
            >
              <span className="tab-icon-wrap">
                <img src={cat.icon} alt={cat.label} className="tab-icon" />
              </span>
              <span className="tab-label">{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="rankings-info-bar">
          <button className="info-btn" onClick={() => setInfoOpen(true)}>
            <Info size={13} />
            <span>Information</span>
          </button>
        </div>

        {loading ? (
          <div className="rankings-loading">
            <div className="rankings-loading-spinner" />
            Loading players...
          </div>
        ) : isOverall ? (
          <div className="overall-rankings">
            {sorted.length === 0 ? (
              <div className="rankings-empty">No players ranked yet.</div>
            ) : (
              <>
                {/* ── EPIC PODIUM – TOP 3 ── */}
                <div className="overall-podium-section">
                  <div className="podium-glow-1" />
                  <div className="podium-glow-2" />
                  <div className="podium-glow-3" />
                  <div className="overall-podium">
                    {sorted.length >= 2 && <PodiumCard player={sorted[1]} rank={2} />}
                    {sorted.length >= 1 && <PodiumCard player={sorted[0]} rank={1} />}
                    {sorted.length >= 3 && <PodiumCard player={sorted[2]} rank={3} />}
                  </div>
                </div>

                {/* ── LIST – #4 onwards ── */}
                {sorted.length > 3 && (
                  <div className="overall-list">
                    <div className="overall-list-header">
                      <span className="overall-list-hcol">#</span>
                      <span className="overall-list-hcol">Player</span>
                      <span className="overall-list-hcol">Rank</span>
                      <span className="overall-list-hcol">Region</span>
                      <span className="overall-list-hcol overall-list-hcol--right">Points</span>
                    </div>
                    {sorted.slice(3).map((p, i) => (
                      <OverallListRow key={p.id} player={p} rank={i + 4} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="tier-columns-wrapper">
            <div className="tier-columns">
              {(() => {
                const positions = new Map<string, number>();
                let cursor = 0;
                for (const tier of ['T1','T2','T3','T4','T5'] as const) {
                  const col = tierColumns.find(c => c.tier === tier);
                  const tierPlayers = [...(col?.players ?? [])].sort((a, b) => b.points - a.points);
                  for (const p of tierPlayers) { cursor += 1; positions.set(p.id, cursor); }
                }
                return (['T1','T2','T3','T4','T5'] as const).map((tier) => {
                  const col = tierColumns.find(c => c.tier === tier);
                  const tieredPlayers = [...(col?.players ?? [])].sort((a, b) => b.points - a.points);
                  const cfg = TIER_CONFIG[tier];
                  return (
                    <div key={tier} className="tier-column" style={{ '--tier-glow': cfg.glow } as React.CSSProperties}>
                      <div
                        className="tier-column-header"
                        style={{ background: cfg.gradient, borderBottom: `1px solid ${cfg.border}`, boxShadow: `0 2px 16px ${cfg.glow}` }}
                      >
                        <div className="tier-header-top">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: cfg.textColor, opacity: 0.8, flexShrink: 0 }}>
                            <path d="M6 3h12v7a6 6 0 01-12 0V3z"/>
                            <path d="M3 5h3v5a6 6 0 01-.5 2.4"/><path d="M21 5h-3v5a6 6 0 00.5 2.4"/>
                          </svg>
                          <span className="tier-header-label" style={{ color: cfg.textColor }}>{cfg.label}</span>
                        </div>
                        <span className="tier-header-sub" style={{ color: cfg.textColor, opacity: 0.65 }}>
                          {tieredPlayers.length} {tieredPlayers.length === 1 ? 'player' : 'players'}
                        </span>
                      </div>
                      <div className="tier-column-players">
                        {tieredPlayers.length === 0 ? (
                          <div className="tier-column-empty"><span>No players</span></div>
                        ) : (
                          tieredPlayers.map((player) => {
                            const rawTier = (player.rawTiers as Record<string, string | null | undefined> | undefined)?.[category];
                            const pos = positions.get(player.id);
                            const regionKey = (player.region || 'eu').toLowerCase();
                            const barColor = REGION_COLOR[regionKey] ?? '#60a5fa';
                            return (
                              <Link key={player.id} to={`/player/${player.username}`} className="tier-player-row">
                                {/* Region indicator bar (ultratiers.com style) */}
                                <div
                                  className="region-bar"
                                  style={{ '--rbar-color': barColor } as React.CSSProperties}
                                >
                                  <span className="region-bar-text">{player.region || '?'}</span>
                                </div>
                                <img
                                  src={`https://mc-heads.net/avatar/${player.username}/28`}
                                  alt={player.username}
                                  width={28} height={28}
                                  style={{ imageRendering: 'pixelated', borderRadius: 3, display: 'block', flexShrink: 0 }}
                                  loading="lazy"
                                />
                                <span className="tier-player-name">{player.username}</span>
                                {pos != null && (
                                  <span className="tier-player-pos">#{pos}</span>
                                )}
                                <TierArrows rawTier={rawTier} />
                              </Link>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
