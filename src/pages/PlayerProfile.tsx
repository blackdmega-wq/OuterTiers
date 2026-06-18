import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState, useCallback } from 'react';
import { CATEGORIES, getTitle } from '../data/players';
import type { PlayerTiers } from '../data/players';
import { usePlayer, usePlayers } from '../hooks/usePlayers';
import { useLiveProfile, resolveAlias } from '../hooks/useMojangProfile';
import CategoryTierBadge from '../components/CategoryTierBadge';
import PlayerAvatar from '../components/PlayerAvatar';
import { ArrowLeft, Calendar, Star, Trophy, Globe, Zap, Copy, Check } from 'lucide-react';
import '../styles/profile-v2.css';

function formatDate(ts: number | undefined): string | null {
  if (!ts) return null;
  return new Date(ts * 1000).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function useCountUp(target: number, duration = 1100) {
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

/* ── Crown SVGs ── */
function ProfileCrownGold() {
  return (
    <svg viewBox="0 0 110 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pcg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a"/>
          <stop offset="45%" stopColor="#fbbf24"/>
          <stop offset="100%" stopColor="#92400e"/>
        </linearGradient>
        <linearGradient id="pcg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fcd34d"/>
          <stop offset="100%" stopColor="#78350f"/>
        </linearGradient>
        <radialGradient id="pcruby" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#fecaca"/>
          <stop offset="55%" stopColor="#ef4444"/>
          <stop offset="100%" stopColor="#7f1d1d"/>
        </radialGradient>
        <radialGradient id="pcsapp" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#dbeafe"/>
          <stop offset="55%" stopColor="#3b82f6"/>
          <stop offset="100%" stopColor="#1e3a5f"/>
        </radialGradient>
        <radialGradient id="pcemer" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#d1fae5"/>
          <stop offset="55%" stopColor="#10b981"/>
          <stop offset="100%" stopColor="#064e3b"/>
        </radialGradient>
        <filter id="pcglow">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
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
        <linearGradient id="psg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f1f5f9"/>
          <stop offset="40%" stopColor="#94a3b8"/>
          <stop offset="100%" stopColor="#334155"/>
        </linearGradient>
        <linearGradient id="psg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cbd5e1"/>
          <stop offset="100%" stopColor="#1e293b"/>
        </linearGradient>
        <radialGradient id="psdia" cx="50%" cy="25%" r="60%">
          <stop offset="0%" stopColor="#e2e8f0"/>
          <stop offset="50%" stopColor="#bfdbfe"/>
          <stop offset="100%" stopColor="#1e3a5f"/>
        </radialGradient>
        <filter id="psglow">
          <feGaussianBlur stdDeviation="1.8" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
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
        <linearGradient id="pbg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fed7aa"/>
          <stop offset="45%" stopColor="#c07838"/>
          <stop offset="100%" stopColor="#7c2d12"/>
        </linearGradient>
        <linearGradient id="pbg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fdba74"/>
          <stop offset="100%" stopColor="#431407"/>
        </linearGradient>
        <radialGradient id="pbopal" cx="50%" cy="25%" r="60%">
          <stop offset="0%" stopColor="#fef3c7"/>
          <stop offset="55%" stopColor="#f97316"/>
          <stop offset="100%" stopColor="#7c2d12"/>
        </radialGradient>
        <radialGradient id="pbfl" cx="50%" cy="80%" r="80%">
          <stop offset="0%" stopColor="#fef08a"/>
          <stop offset="40%" stopColor="#f97316"/>
          <stop offset="100%" stopColor="#ef444400"/>
        </radialGradient>
        <filter id="pbglow">
          <feGaussianBlur stdDeviation="1.8" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <ellipse cx="18" cy="28" rx="5" ry="8" fill="url(#pbfl)" opacity="0.8"/>
      <ellipse cx="50" cy="8" rx="6" ry="10" fill="url(#pbfl)" opacity="0.9"/>
      <ellipse cx="82" cy="28" rx="5" ry="8" fill="url(#pbfl)" opacity="0.8"/>
      <path d="M14 66 L14 38 L30 54 L50 16 L70 54 L86 38 L86 66 Z" fill="url(#pbg1)" filter="url(#pbglow)"/>
      <rect x="12" y="60" width="76" height="18" rx="4" fill="url(#pbg2)"/>
      <rect x="12" y="60" width="76" height="6" rx="4" fill="rgba(255,255,255,0.12)"/>
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
    <button
      onClick={copy}
      title={uuid}
      className="ppv2-uuid-btn"
    >
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
  const rankedModes = modeCats.filter(c => { const t = player.tiers[c.id as keyof PlayerTiers]; return t && t !== '-'; });
  const unrankedModes = modeCats.filter(c => { const t = player.tiers[c.id as keyof PlayerTiers]; return !t || t === '-'; });

  return (
    <div className="profile-page ppv2-page">

      {/* ── Hero ── */}
      <div className="ppv2-hero">
        <div className="ppv2-hero-glow" />
        <div className="ppv2-hero-grid" />
        <div className="ppv2-hero-inner">

          {/* Back button */}
          <Link to="/rankings/overall" className="back-link btn-press ppv2-back">
            <ArrowLeft size={14} /> Back to Rankings
          </Link>

          {/* ── Centered profile card ── */}
          <div className="ppv2-profile-center">

            {/* Avatar */}
            <div className={`ppv2-avatar-wrap${rankClass ? ` ppv2-avatar-${rankClass}` : ''}`}>
              <div className="ppv2-avatar-bg" />
              <div className="ppv2-avatar-inner">
                <PlayerAvatar username={live.uuid || player.uuid || live.username} size={110} />
              </div>
              {rank > 0 && rank <= 3 && (
                <div className={`ppv2-crown-svg ppv2-crown-svg--${rank}`}>
                  {rank === 1 ? <ProfileCrownGold /> : rank === 2 ? <ProfileCrownSilver /> : <ProfileCrownBronze />}
                </div>
              )}
              {/* Outer glow ring */}
              <div className="ppv2-avatar-glow-ring" />
            </div>

            {/* Eyebrow */}
            <div className="ppv2-eyebrow">
              <Zap size={10} style={{ opacity: 0.8 }} />
              OuterTiers Player
            </div>

            {/* Name */}
            <h1 className="ppv2-username">{live.username}</h1>

            {/* Achievement title — directly under name */}
            <div className="ppv2-achievement-title">
              <img src="/tier_icons/overall.svg" alt="" width={12} height={12} style={{ opacity: 0.55 }} />
              <span>{getTitle(player.points)}</span>
            </div>

            {/* Divider */}
            <div className="ppv2-hero-divider" />

            {/* Badges row */}
            <div className="ppv2-badges-row">
              <span className={`region-badge region-${player.region.toLowerCase()}`}>{player.region}</span>
              {rank > 0 && (
                <span className={`ppv2-rank-pill${rankClass ? ` ppv2-rank-pill--${rankClass}` : ''}`}>
                  <Trophy size={10} /> #{rank} Overall
                </span>
              )}
            </div>

            {/* UUID */}
            <UuidBadge uuid={live.uuid || player.uuid || ''} />

          </div>

          {/* ── Stats row ── */}
          <div className="ppv2-stats-row">
            <div className="ppv2-stat-box">
              <Star size={13} className="ppv2-stat-icon" />
              <div className="ppv2-stat-num">{animPts}</div>
              <div className="ppv2-stat-lbl">Total Points</div>
            </div>
            <div className="ppv2-stat-sep" />
            <div className="ppv2-stat-box">
              <Trophy size={13} className="ppv2-stat-icon" />
              <div className="ppv2-stat-num">{rank > 0 ? `#${rank}` : '—'}</div>
              <div className="ppv2-stat-lbl">Overall Rank</div>
            </div>
            <div className="ppv2-stat-sep" />
            <div className="ppv2-stat-box">
              <Globe size={13} className="ppv2-stat-icon" />
              <div className="ppv2-stat-num">{player.region}</div>
              <div className="ppv2-stat-lbl">Region</div>
            </div>
            <div className="ppv2-stat-sep" />
            <div className="ppv2-stat-box">
              <div className="ppv2-stat-num">
                {rankedModes.length}
                <span className="ppv2-stat-of">/{modeCats.length}</span>
              </div>
              <div className="ppv2-stat-lbl">Modes Ranked</div>
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
