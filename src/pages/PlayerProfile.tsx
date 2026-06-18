import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState, useCallback } from 'react';
import { CATEGORIES, getTitle } from '../data/players';
import type { PlayerTiers } from '../data/players';
import { usePlayer, usePlayers } from '../hooks/usePlayers';
import { useLiveProfile, resolveAlias } from '../hooks/useMojangProfile';
import CategoryTierBadge from '../components/CategoryTierBadge';
import PlayerAvatar from '../components/PlayerAvatar';
import { ArrowLeft, Calendar, Star, Trophy, Globe, Zap, Copy, Check, Shield } from 'lucide-react';
import '../styles/profile-v2.css';

function formatDate(ts: number | undefined): string | null {
  if (!ts) return null;
  return new Date(ts * 1000).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  const rafRef = useRef(0);
  useEffect(() => {
    if (!target) { setVal(0); return; }
    let start: number | null = null;
    let lastStep = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      if (ts - lastStep < 33.34) { rafRef.current = requestAnimationFrame(step); return; }
      lastStep = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setVal(Math.round(ease * target));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return val;
}

const TIER_GLOW: Record<string, string> = {
  HT1: 'rgba(241,196,15,0.7)',   LT1: 'rgba(212,179,84,0.6)',
  HT2: 'rgba(164,178,199,0.65)', LT2: 'rgba(136,141,149,0.5)',
  HT3: 'rgba(223,135,70,0.7)',   LT3: 'rgba(179,105,50,0.6)',
  HT4: 'rgba(70,223,93,0.65)',   LT4: 'rgba(49,146,40,0.55)',
  HT5: 'rgba(164,213,255,0.5)',  LT5: 'rgba(164,213,255,0.4)',
};
const TIER_BG: Record<string, string> = {
  HT1: 'rgba(241,196,15,0.06)',   LT1: 'rgba(212,179,84,0.05)',
  HT2: 'rgba(164,178,199,0.06)',  LT2: 'rgba(136,141,149,0.05)',
  HT3: 'rgba(223,135,70,0.06)',   LT3: 'rgba(179,105,50,0.05)',
  HT4: 'rgba(70,223,93,0.06)',    LT4: 'rgba(49,146,40,0.05)',
  HT5: 'rgba(164,213,255,0.05)',  LT5: 'rgba(164,213,255,0.04)',
};

/* Rank accent colors for hero theming */
const RANK_ACCENT: Record<string, { primary: string; secondary: string; glow: string; dim: string }> = {
  'rank-gold':   { primary: '#fbbf24', secondary: '#f59e0b', glow: 'rgba(251,191,36,0.55)', dim: 'rgba(251,191,36,0.12)' },
  'rank-silver': { primary: '#94a3b8', secondary: '#64748b', glow: 'rgba(148,163,184,0.45)', dim: 'rgba(148,163,184,0.10)' },
  'rank-bronze': { primary: '#c97940', secondary: '#b45309', glow: 'rgba(180,120,60,0.50)', dim: 'rgba(180,120,60,0.10)' },
  '':            { primary: '#60a5fa', secondary: '#3b82f6', glow: 'rgba(96,165,250,0.40)', dim: 'rgba(96,165,250,0.08)' },
};

/* Crown SVGs */
function ProfileCrownGold() {
  return (
    <svg viewBox="0 0 110 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pcg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fde68a"/><stop offset="45%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#92400e"/></linearGradient>
        <linearGradient id="pcg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fcd34d"/><stop offset="100%" stopColor="#78350f"/></linearGradient>
        <radialGradient id="pcruby" cx="50%" cy="30%" r="60%"><stop offset="0%" stopColor="#fecaca"/><stop offset="55%" stopColor="#ef4444"/><stop offset="100%" stopColor="#7f1d1d"/></radialGradient>
        <radialGradient id="pcsapp" cx="50%" cy="30%" r="60%"><stop offset="0%" stopColor="#dbeafe"/><stop offset="55%" stopColor="#3b82f6"/><stop offset="100%" stopColor="#1e3a5f"/></radialGradient>
        <radialGradient id="pcemer" cx="50%" cy="30%" r="60%"><stop offset="0%" stopColor="#d1fae5"/><stop offset="55%" stopColor="#10b981"/><stop offset="100%" stopColor="#064e3b"/></radialGradient>
        <filter id="pcglow"><feGaussianBlur stdDeviation="2.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <path d="M15 68 L15 36 L36 56 L55 8 L74 56 L95 36 L95 68 Z" fill="url(#pcg1)" filter="url(#pcglow)"/>
      <rect x="12" y="62" width="86" height="20" rx="5" fill="url(#pcg2)"/>
      <rect x="12" y="62" width="86" height="6" rx="5" fill="rgba(255,255,255,0.15)"/>
      <ellipse cx="55" cy="10" rx="8" ry="9" fill="url(#pcruby)" stroke="#fca5a5" strokeWidth="0.8"/>
      <ellipse cx="52" cy="7" rx="3" ry="2" fill="rgba(255,255,255,0.5)" transform="rotate(-20 52 7)"/>
      <ellipse cx="15.5" cy="38" rx="6" ry="7" fill="url(#pcsapp)" stroke="#93c5fd" strokeWidth="0.8"/>
      <ellipse cx="94.5" cy="38" rx="6" ry="7" fill="url(#pcemer)" stroke="#6ee7b7" strokeWidth="0.8"/>
      <circle cx="34" cy="72" r="5" fill="url(#pcsapp)" stroke="#93c5fd" strokeWidth="0.6"/>
      <circle cx="55" cy="72" r="5" fill="url(#pcruby)" stroke="#fca5a5" strokeWidth="0.6"/>
      <circle cx="76" cy="72" r="5" fill="url(#pcemer)" stroke="#6ee7b7" strokeWidth="0.6"/>
      <path d="M20 48 Q55 38 90 50" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}
function ProfileCrownSilver() {
  return (
    <svg viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="psg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f1f5f9"/><stop offset="40%" stopColor="#94a3b8"/><stop offset="100%" stopColor="#334155"/></linearGradient>
        <linearGradient id="psg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#cbd5e1"/><stop offset="100%" stopColor="#1e293b"/></linearGradient>
        <radialGradient id="psdia" cx="50%" cy="25%" r="60%"><stop offset="0%" stopColor="#e2e8f0"/><stop offset="50%" stopColor="#bfdbfe"/><stop offset="100%" stopColor="#1e3a5f"/></radialGradient>
        <filter id="psglow"><feGaussianBlur stdDeviation="1.8" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <path d="M12 64 L12 38 L28 54 L50 12 L72 54 L88 38 L88 64 Z" fill="url(#psg1)" filter="url(#psglow)"/>
      <rect x="10" y="58" width="80" height="16" rx="4" fill="url(#psg2)"/>
      <rect x="10" y="58" width="80" height="5" rx="4" fill="rgba(255,255,255,0.18)"/>
      <polygon points="50,6 56,15 50,22 44,15" fill="url(#psdia)" stroke="#bfdbfe" strokeWidth="0.7"/>
      <polygon points="12,31 17,38 12,44 7,38" fill="url(#psdia)" stroke="#bfdbfe" strokeWidth="0.6"/>
      <polygon points="88,31 93,38 88,44 83,38" fill="url(#psdia)" stroke="#bfdbfe" strokeWidth="0.6"/>
      <rect x="27" y="62" width="8" height="8" rx="1" fill="url(#psdia)" stroke="#bfdbfe" strokeWidth="0.5" transform="rotate(45 31 66)"/>
      <rect x="46" y="62" width="8" height="8" rx="1" fill="url(#psdia)" stroke="#bfdbfe" strokeWidth="0.5" transform="rotate(45 50 66)"/>
      <rect x="65" y="62" width="8" height="8" rx="1" fill="url(#psdia)" stroke="#bfdbfe" strokeWidth="0.5" transform="rotate(45 69 66)"/>
    </svg>
  );
}
function ProfileCrownBronze() {
  return (
    <svg viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pbg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fed7aa"/><stop offset="45%" stopColor="#c07838"/><stop offset="100%" stopColor="#7c2d12"/></linearGradient>
        <linearGradient id="pbg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fdba74"/><stop offset="100%" stopColor="#431407"/></linearGradient>
        <radialGradient id="pbopal" cx="50%" cy="25%" r="60%"><stop offset="0%" stopColor="#fef3c7"/><stop offset="55%" stopColor="#f97316"/><stop offset="100%" stopColor="#7c2d12"/></radialGradient>
        <filter id="pbglow"><feGaussianBlur stdDeviation="1.8" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <path d="M14 66 L14 38 L30 54 L50 16 L70 54 L86 38 L86 66 Z" fill="url(#pbg1)" filter="url(#pbglow)"/>
      <rect x="12" y="60" width="76" height="18" rx="4" fill="url(#pbg2)"/>
      <ellipse cx="50" cy="18" rx="7" ry="8" fill="url(#pbopal)" stroke="#fdba74" strokeWidth="0.8"/>
      <ellipse cx="14" cy="40" rx="5.5" ry="6.5" fill="url(#pbopal)" stroke="#fdba74" strokeWidth="0.7"/>
      <ellipse cx="86" cy="40" rx="5.5" ry="6.5" fill="url(#pbopal)" stroke="#fdba74" strokeWidth="0.7"/>
      <circle cx="32" cy="70" r="4.5" fill="url(#pbopal)" stroke="#fdba74" strokeWidth="0.6"/>
      <circle cx="50" cy="70" r="4.5" fill="url(#pbopal)" stroke="#fdba74" strokeWidth="0.6"/>
      <circle cx="68" cy="70" r="4.5" fill="url(#pbopal)" stroke="#fdba74" strokeWidth="0.6"/>
    </svg>
  );
}

function UuidBadge({ uuid }: { uuid: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(uuid).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }, [uuid]);
  if (!uuid) return null;
  const display = uuid.replace(/-/g, '');
  const short = display.slice(0, 8) + '…' + display.slice(-4);
  return (
    <button onClick={copy} title={uuid} className="ppv2-uuid-btn">
      {copied
        ? <><Check size={10} style={{ color: '#4ade80' }} /><span style={{ color: '#4ade80' }}>Copied!</span></>
        : <><Copy size={10} /><span>UUID: {short}</span></>}
    </button>
  );
}

export default function PlayerProfile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { player, loading } = usePlayer(username);
  const { players } = usePlayers();
  const animPts = useCountUp(player?.points ?? 0);
  const live = useLiveProfile(player?.username ?? '', player?.uuid ?? '');

  useEffect(() => {
    if (loading || player || !username) return;
    resolveAlias(username).then(stored => {
      if (stored) navigate(`/player/${encodeURIComponent(stored)}`, { replace: true });
    });
  }, [loading, player, username, navigate]);

  if (loading) {
    return (
      <div className="not-found-page">
        <div className="ppv2-spinner" />
        <p style={{ color: 'var(--text-dim)', marginTop: 18 }}>Loading player…</p>
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
          <ArrowLeft size={15} /> Go Home
        </Link>
      </div>
    );
  }

  const sorted = [...players].sort((a, b) => b.points - a.points);
  const rank = sorted.findIndex(p => p.id === player.id) + 1;
  const modeCats = CATEGORIES.filter(c => c.id !== 'overall');
  const rankClass = rank === 1 ? 'rank-gold' : rank === 2 ? 'rank-silver' : rank === 3 ? 'rank-bronze' : '';
  const accent = RANK_ACCENT[rankClass] ?? RANK_ACCENT[''];
  const rankedModes = modeCats.filter(c => { const t = player.tiers[c.id as keyof PlayerTiers]; return t && t !== '-'; });
  const unrankedModes = modeCats.filter(c => { const t = player.tiers[c.id as keyof PlayerTiers]; return !t || t === '-'; });
  const rankLabel = rank === 1 ? '#1' : rank === 2 ? '#2' : rank === 3 ? '#3' : `#${rank}`;

  return (
    <div className="profile-page ppv2-page">
      <div
        className={`ppv2-hero${rankClass ? ` ppv2-hero--${rankClass}` : ''}`}
        style={{
          '--accent': accent.primary,
          '--accent-sec': accent.secondary,
          '--accent-glow': accent.glow,
          '--accent-dim': accent.dim,
        } as React.CSSProperties}
      >
        {/* Background layers */}
        <div className="ppv2-bg-noise" />
        <div className="ppv2-bg-beam" />
        <div className="ppv2-bg-grid" />
        <div className="ppv2-bg-gradient" />

        {/* Scanlines */}
        <div className="ppv2-scanlines" />

        <div className="ppv2-hero-inner">
          {/* Back */}
          <Link to="/rankings/overall" className="back-link btn-press ppv2-back">
            <ArrowLeft size={14} /> Back to Rankings
          </Link>

          {/* ── Main card ── */}
          <div className="ppv2-card">
            {/* Card shine sweep */}
            <div className="ppv2-card-shine" />
            {/* Card border glow */}
            <div className="ppv2-card-edge" />

            {/* Left: Avatar block */}
            <div className="ppv2-card-left">

              {/* Ghost rank number behind avatar */}
              {rank > 0 && rank <= 999 && (
                <div className="ppv2-ghost-rank" aria-hidden="true">
                  {rankLabel}
                </div>
              )}

              {/* Octagonal avatar frame */}
              <div className={`ppv2-avatar-frame${rankClass ? ` ppv2-avatar-frame--${rankClass}` : ''}`}>
                {/* Animated border ring */}
                <svg className="ppv2-frame-svg" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="frameGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={accent.primary} stopOpacity="0.9"/>
                      <stop offset="40%" stopColor={accent.secondary} stopOpacity="0.5"/>
                      <stop offset="100%" stopColor={accent.primary} stopOpacity="0.0"/>
                    </linearGradient>
                  </defs>
                  <polygon
                    points="80,4 136,28 156,84 136,140 80,156 24,140 4,84 24,28"
                    stroke="url(#frameGrad)"
                    strokeWidth="2"
                    fill="none"
                    className="ppv2-frame-poly"
                  />
                  <polygon
                    points="80,12 130,33 149,84 130,135 80,148 30,135 11,84 30,33"
                    stroke={accent.primary}
                    strokeWidth="0.5"
                    strokeDasharray="6 18"
                    fill="none"
                    className="ppv2-frame-dash"
                  />
                </svg>

                {/* Corner accents */}
                <div className="ppv2-frame-corner ppv2-frame-corner--tl" />
                <div className="ppv2-frame-corner ppv2-frame-corner--tr" />
                <div className="ppv2-frame-corner ppv2-frame-corner--bl" />
                <div className="ppv2-frame-corner ppv2-frame-corner--br" />

                {/* Avatar clipped to octagon */}
                <div className="ppv2-avatar-clip">
                  <div className="ppv2-avatar-glow" />
                  <PlayerAvatar username={live.uuid || player.uuid || live.username} size={118} />
                </div>

                {/* Crown for top 3 */}
                {rank > 0 && rank <= 3 && (
                  <div className={`ppv2-crown ppv2-crown--${rank}`}>
                    {rank === 1 ? <ProfileCrownGold /> : rank === 2 ? <ProfileCrownSilver /> : <ProfileCrownBronze />}
                  </div>
                )}

                {/* Rank badge on frame */}
                {rank > 0 && rank <= 3 && (
                  <div className={`ppv2-rank-badge ppv2-rank-badge--${rankClass}`}>
                    <Trophy size={9} />
                    {rankLabel}
                  </div>
                )}
              </div>

              {/* Vertical accent line left of avatar */}
              <div className="ppv2-accent-bar" />
            </div>

            {/* Right: Info block */}
            <div className="ppv2-card-right">

              {/* Eyebrow */}
              <div className="ppv2-eyebrow">
                <Zap size={9} />
                <span>OuterTiers Player</span>
                <span className="ppv2-eyebrow-dot" />
                <span className="ppv2-eyebrow-region">{player.region}</span>
              </div>

              {/* Name */}
              <h1 className="ppv2-username">{live.username}</h1>

              {/* Achievement title — RIGHT UNDER name */}
              <div className="ppv2-achievement-title">
                <Shield size={11} className="ppv2-title-icon" />
                <span>{getTitle(player.points)}</span>
              </div>

              {/* Rank + region pills */}
              <div className="ppv2-pills-row">
                <span className={`region-badge region-${player.region.toLowerCase()}`}>{player.region}</span>
                {rank > 0 && (
                  <span className={`ppv2-rank-pill${rankClass ? ` ppv2-rank-pill--${rankClass}` : ''}`}>
                    <Trophy size={10} /> {rankLabel} Overall
                  </span>
                )}
              </div>

              {/* UUID */}
              <UuidBadge uuid={live.uuid || player.uuid || ''} />

              {/* Horizontal accent line */}
              <div className="ppv2-info-line" />

              {/* Inline mini stats */}
              <div className="ppv2-mini-stats">
                <div className="ppv2-mini-stat">
                  <span className="ppv2-mini-val">{animPts}</span>
                  <span className="ppv2-mini-lbl">pts</span>
                </div>
                <div className="ppv2-mini-sep" />
                <div className="ppv2-mini-stat">
                  <span className="ppv2-mini-val">{rankedModes.length}</span>
                  <span className="ppv2-mini-lbl">/{modeCats.length} modes</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Stat cards row ── */}
          <div className="ppv2-stat-cards">
            <div className="ppv2-stat-card">
              <div className="ppv2-stat-card-icon"><Star size={16} /></div>
              <div className="ppv2-stat-card-num">{animPts}</div>
              <div className="ppv2-stat-card-lbl">Total Points</div>
            </div>
            <div className="ppv2-stat-card">
              <div className="ppv2-stat-card-icon"><Trophy size={16} /></div>
              <div className="ppv2-stat-card-num">{rank > 0 ? rankLabel : '—'}</div>
              <div className="ppv2-stat-card-lbl">Overall Rank</div>
            </div>
            <div className="ppv2-stat-card">
              <div className="ppv2-stat-card-icon"><Globe size={16} /></div>
              <div className="ppv2-stat-card-num">{player.region}</div>
              <div className="ppv2-stat-card-lbl">Region</div>
            </div>
            <div className="ppv2-stat-card">
              <div className="ppv2-stat-card-icon"><Zap size={16} /></div>
              <div className="ppv2-stat-card-num">
                {rankedModes.length}
                <span className="ppv2-stat-card-of">/{modeCats.length}</span>
              </div>
              <div className="ppv2-stat-card-lbl">Modes Ranked</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tier Rankings (unchanged) ── */}
      <div className="profile-container ppv2-content">
        {rankedModes.length > 0 && (
          <>
            <div className="ppv2-section-head">
              <div className="section-label">Performance</div>
              <h2 className="section-heading ppv2-section-title">Tier Rankings by Category</h2>
            </div>
            <div className="ppv2-tiers-grid">
              {rankedModes.map((cat, i) => {
                const rawTier = player.rawTiers?.[cat.id as keyof typeof player.rawTiers];
                const tierLevel = player.tiers[cat.id as keyof PlayerTiers];
                const dateTs = player.tierDates?.[cat.id];
                const dateStr = formatDate(dateTs);
                const rawUp = rawTier?.toUpperCase() ?? '';
                const glow = TIER_GLOW[rawUp] ?? 'rgba(91,164,245,0.35)';
                const bg   = TIER_BG[rawUp]   ?? 'rgba(91,164,245,0.04)';
                return (
                  <div
                    key={cat.id}
                    className="ppv2-tier-card"
                    style={{ '--tier-glow': glow, '--tier-bg': bg, animationDelay: `${i * 55}ms` } as React.CSSProperties}
                  >
                    <div className="ppv2-card-orb" />
                    <div className="ppv2-card-icon"><img src={cat.icon} alt={cat.label} width={24} height={24} /></div>
                    <div className="ppv2-card-mode">{cat.label}</div>
                    <div className="ppv2-card-badge">
                      <CategoryTierBadge categoryId={cat.id} tier={tierLevel} rawTier={rawTier ?? null} />
                    </div>
                    <div className={`ppv2-card-date${!dateStr ? ' ppv2-card-date--unknown' : ''}`}>
                      <Calendar size={9} />
                      <span>{dateStr ? `Since ${dateStr}` : 'Date unknown'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {rankedModes.length === 0 && (
          <div className="ppv2-no-ranks">
            <Trophy size={28} style={{ opacity: 0.3 }} />
            <p>No ranked modes yet</p>
          </div>
        )}

        {unrankedModes.length > 0 && (
          <div className="ppv2-unranked">
            <div className="ppv2-unranked-lbl">Not yet ranked in</div>
            <div className="ppv2-unranked-chips">
              {unrankedModes.map(cat => (
                <span key={cat.id} className="ppv2-unranked-chip">
                  <img src={cat.icon} alt={cat.label} width={13} height={13} style={{ opacity: 0.35 }} />
                  {cat.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
