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
  HT1:'rgba(241,196,15,0.7)',LT1:'rgba(212,179,84,0.6)',
  HT2:'rgba(164,178,199,0.65)',LT2:'rgba(136,141,149,0.5)',
  HT3:'rgba(223,135,70,0.7)',LT3:'rgba(179,105,50,0.6)',
  HT4:'rgba(70,223,93,0.65)',LT4:'rgba(49,146,40,0.55)',
  HT5:'rgba(164,213,255,0.5)',LT5:'rgba(164,213,255,0.4)',
};
const TIER_BG: Record<string, string> = {
  HT1:'rgba(241,196,15,0.06)',LT1:'rgba(212,179,84,0.05)',
  HT2:'rgba(164,178,199,0.06)',LT2:'rgba(136,141,149,0.05)',
  HT3:'rgba(223,135,70,0.06)',LT3:'rgba(179,105,50,0.05)',
  HT4:'rgba(70,223,93,0.06)',LT4:'rgba(49,146,40,0.05)',
  HT5:'rgba(164,213,255,0.05)',LT5:'rgba(164,213,255,0.04)',
};

const RANK_CFG: Record<string, {
  primary: string; secondary: string; tertiary: string;
  glow: string; dim: string; label: string; labelColor: string;
}> = {
  'rank-gold': {
    primary:'#fbbf24', secondary:'#f59e0b', tertiary:'#fde68a',
    glow:'rgba(251,191,36,0.55)', dim:'rgba(251,191,36,0.10)',
    label:'Champion', labelColor:'#fde68a',
  },
  'rank-silver': {
    primary:'#cbd5e1', secondary:'#94a3b8', tertiary:'#e2e8f0',
    glow:'rgba(203,213,225,0.45)', dim:'rgba(148,163,184,0.09)',
    label:'Runner Up', labelColor:'#e2e8f0',
  },
  'rank-bronze': {
    primary:'#fb923c', secondary:'#c97940', tertiary:'#fed7aa',
    glow:'rgba(251,146,60,0.48)', dim:'rgba(180,120,60,0.09)',
    label:'Bronze Finish', labelColor:'#fed7aa',
  },
  '': {
    primary:'#60a5fa', secondary:'#3b82f6', tertiary:'#bfdbfe',
    glow:'rgba(96,165,250,0.40)', dim:'rgba(96,165,250,0.08)',
    label:'', labelColor:'#60a5fa',
  },
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
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h1>Player Not Found</h1>
        <p>No player named <strong style={{ color: 'var(--text-dim)' }}>"{username}"</strong> exists in the system.</p>
        <Link to="/" className="go-home-btn btn-press"><ArrowLeft size={15} /> Go Home</Link>
      </div>
    );
  }

  const sorted = [...players].sort((a, b) => b.points - a.points);
  const rank = sorted.findIndex(p => p.id === player.id) + 1;
  const modeCats = CATEGORIES.filter(c => c.id !== 'overall');
  const rankClass = rank === 1 ? 'rank-gold' : rank === 2 ? 'rank-silver' : rank === 3 ? 'rank-bronze' : '';
  const cfg = RANK_CFG[rankClass] ?? RANK_CFG[''];
  const rankedModes = modeCats.filter(c => { const t = player.tiers[c.id as keyof PlayerTiers]; return t && t !== '-'; });
  const unrankedModes = modeCats.filter(c => { const t = player.tiers[c.id as keyof PlayerTiers]; return !t || t === '-'; });
  const rankLabel = rank > 0 ? `#${rank}` : '—';

  const cssVars = {
    '--accent':     cfg.primary,
    '--accent-sec': cfg.secondary,
    '--accent-tri': cfg.tertiary,
    '--accent-glow':cfg.glow,
    '--accent-dim': cfg.dim,
  } as React.CSSProperties;

  return (
    <div className="profile-page ppv2-page">
      <div className={`ppv2-hero${rankClass ? ` ppv2-hero--${rankClass}` : ''}`} style={cssVars}>

        {/* Layered background */}
        <div className="ppv2-bg-orb ppv2-bg-orb--1" />
        <div className="ppv2-bg-orb ppv2-bg-orb--2" />
        <div className="ppv2-bg-grid" />
        <div className="ppv2-bg-vignette" />

        <div className="ppv2-hero-inner">
          <Link to="/rankings/overall" className="back-link btn-press ppv2-back">
            <ArrowLeft size={14} /> Back to Rankings
          </Link>

          {/* Champion banner for top 3 */}
          {rankClass && cfg.label && (
            <div className={`ppv2-champion-banner ppv2-champion-banner--${rankClass}`}>
              <div className="ppv2-champion-banner-line" />
              <Trophy size={12} />
              <span>{cfg.label}</span>
              <Trophy size={12} />
              <div className="ppv2-champion-banner-line" />
            </div>
          )}

          {/* ── The main card ── */}
          <div className="ppv2-card-wrap">
            {/* animated border */}
            <div className="ppv2-card-border-anim" />

            <div className="ppv2-card">
              {/* Top highlight line */}
              <div className="ppv2-card-top-line" />

              {/* ── LEFT: Avatar ── */}
              <div className="ppv2-card-left">
                {/* Diagonal stripes background */}
                <div className="ppv2-card-left-stripes" />

                {/* Ghost rank */}
                {rank > 0 && (
                  <div className="ppv2-ghost-rank" aria-hidden="true">{rankLabel}</div>
                )}

                {/* Particles for top 3 */}
                {rankClass && (
                  <div className="ppv2-particles" aria-hidden="true">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className={`ppv2-particle ppv2-particle--${i + 1}`} />
                    ))}
                  </div>
                )}

                {/* Avatar frame */}
                <div className={`ppv2-avatar-frame${rankClass ? ` ppv2-avatar-frame--${rankClass}` : ''}`}>
                  {/* Outer glow disc */}
                  <div className="ppv2-avatar-disc" />

                  {/* Double SVG rings */}
                  <svg className="ppv2-frame-svg ppv2-frame-svg--outer" viewBox="0 0 180 180" fill="none">
                    <defs>
                      <linearGradient id="outerRingGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={cfg.tertiary} stopOpacity="0.9"/>
                        <stop offset="35%" stopColor={cfg.primary} stopOpacity="0.6"/>
                        <stop offset="70%" stopColor={cfg.secondary} stopOpacity="0.3"/>
                        <stop offset="100%" stopColor={cfg.tertiary} stopOpacity="0.0"/>
                      </linearGradient>
                    </defs>
                    <polygon
                      points="90,5 151,33 175,90 151,147 90,175 29,147 5,90 29,33"
                      stroke="url(#outerRingGrad)"
                      strokeWidth="1.5"
                      fill="none"
                      className="ppv2-ring-spin"
                    />
                    <polygon
                      points="90,14 145,40 167,90 145,140 90,166 35,140 13,90 35,40"
                      stroke={cfg.primary}
                      strokeWidth="0.7"
                      strokeDasharray="5 20"
                      fill="none"
                      className="ppv2-ring-spin-rev"
                    />
                  </svg>

                  {/* Inner tight ring */}
                  <svg className="ppv2-frame-svg ppv2-frame-svg--inner" viewBox="0 0 140 140" fill="none">
                    <polygon
                      points="70,3 117,27 137,70 117,113 70,137 23,113 3,70 23,27"
                      stroke={cfg.primary}
                      strokeWidth="1.2"
                      strokeOpacity="0.5"
                      fill="none"
                    />
                  </svg>

                  {/* Corner sparks */}
                  <div className="ppv2-spark ppv2-spark--tl" />
                  <div className="ppv2-spark ppv2-spark--tr" />
                  <div className="ppv2-spark ppv2-spark--bl" />
                  <div className="ppv2-spark ppv2-spark--br" />

                  {/* Avatar clipped to octagon */}
                  <div className="ppv2-avatar-clip">
                    <div className="ppv2-avatar-inner-glow" />
                    <PlayerAvatar username={live.uuid || player.uuid || live.username} size={124} />
                  </div>

                  {/* Crown */}
                  {rank > 0 && rank <= 3 && (
                    <div className={`ppv2-crown ppv2-crown--${rank}`}>
                      {rank === 1 ? <ProfileCrownGold /> : rank === 2 ? <ProfileCrownSilver /> : <ProfileCrownBronze />}
                    </div>
                  )}

                  {/* Rank pill at bottom of frame */}
                  {rank > 0 && (
                    <div className={`ppv2-frame-rank${rankClass ? ` ppv2-frame-rank--${rankClass}` : ''}`}>
                      <Trophy size={8} />
                      {rankLabel}
                    </div>
                  )}
                </div>

                {/* Left accent bar */}
                <div className="ppv2-accent-bar" />
              </div>

              {/* ── RIGHT: Info ── */}
              <div className="ppv2-card-right">

                <div className="ppv2-eyebrow">
                  <Zap size={9} />
                  <span>OuterTiers Player</span>
                  <span className="ppv2-eyebrow-sep">·</span>
                  <span className={`ppv2-eyebrow-region region-badge region-${player.region.toLowerCase()}`}>
                    {player.region}
                  </span>
                </div>

                {/* Name — main focus */}
                <h1 className="ppv2-username">{live.username}</h1>

                {/* Achievement title — DIRECTLY under name, tight */}
                <div className="ppv2-achievement-title">
                  <Shield size={11} className="ppv2-title-icon" />
                  <span>{getTitle(player.points)}</span>
                </div>

                {/* Accent divider */}
                <div className="ppv2-divider" />

                {/* Rank pill */}
                <div className="ppv2-pills-row">
                  {rank > 0 && (
                    <span className={`ppv2-rank-pill${rankClass ? ` ppv2-rank-pill--${rankClass}` : ''}`}>
                      <Trophy size={10} /> {rankLabel} Overall
                    </span>
                  )}
                  <span className={`region-badge region-${player.region.toLowerCase()}`}>{player.region}</span>
                </div>

                {/* UUID */}
                <UuidBadge uuid={live.uuid || player.uuid || ''} />

                {/* Bottom meta row */}
                <div className="ppv2-meta-row">
                  <div className="ppv2-meta-item">
                    <span className="ppv2-meta-val">{animPts}</span>
                    <span className="ppv2-meta-lbl">points</span>
                  </div>
                  <div className="ppv2-meta-sep" />
                  <div className="ppv2-meta-item">
                    <span className="ppv2-meta-val">{rankedModes.length}<span className="ppv2-meta-dim">/{modeCats.length}</span></span>
                    <span className="ppv2-meta-lbl">modes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Stat cards ── */}
          <div className="ppv2-stat-cards">
            {[
              { icon: <Star size={15}/>, val: animPts, lbl: 'Total Points', color: 'var(--accent)', glow: 'var(--accent-glow)' },
              { icon: <Trophy size={15}/>, val: rank > 0 ? rankLabel : '—', lbl: 'Overall Rank', color: 'var(--accent)', glow: 'var(--accent-glow)' },
              { icon: <Globe size={15}/>, val: player.region, lbl: 'Region', color: '#34d399', glow: 'rgba(52,211,153,0.35)' },
              { icon: <Zap size={15}/>, val: <>{rankedModes.length}<span className="ppv2-stat-card-of">/{modeCats.length}</span></>, lbl: 'Modes Ranked', color: '#a78bfa', glow: 'rgba(167,139,250,0.35)' },
            ].map((s, i) => (
              <div
                key={i}
                className="ppv2-stat-card"
                style={{ '--sc': s.color, '--sg': s.glow, animationDelay: `${i * 60}ms` } as React.CSSProperties}
              >
                <div className="ppv2-stat-card-bg" />
                <div className="ppv2-stat-card-top-line" />
                <div className="ppv2-stat-card-icon">{s.icon}</div>
                <div className="ppv2-stat-card-num">{s.val}</div>
                <div className="ppv2-stat-card-lbl">{s.lbl}</div>
              </div>
            ))}
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
                  <div key={cat.id} className="ppv2-tier-card"
                    style={{ '--tier-glow': glow, '--tier-bg': bg, animationDelay: `${i * 55}ms` } as React.CSSProperties}>
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
          <div className="ppv2-no-ranks"><Trophy size={28} style={{ opacity: 0.3 }} /><p>No ranked modes yet</p></div>
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
