import { useParams, Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { CATEGORIES, getTitle } from '../data/players';
import type { PlayerTiers } from '../data/players';
import { usePlayer, usePlayers } from '../hooks/usePlayers';
import CategoryTierBadge from '../components/CategoryTierBadge';
import PlayerAvatar from '../components/PlayerAvatar';
import { ArrowLeft, Calendar, Star, Trophy, Globe } from 'lucide-react';
import '../styles/profile-v2.css';

function formatDate(ts: number | undefined): string | null {
  if (!ts) return null;
  return new Date(ts * 1000).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function useCountUp(target: number, duration = 900) {
  const [val, setVal] = useState(0);
  const rafRef = useRef(0);
  useEffect(() => {
    if (!target) { setVal(0); return; }
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(ease * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return val;
}

const TIER_GLOW: Record<string, string> = {
  HT1: 'rgba(241,196,15,0.65)',  LT1: 'rgba(212,179,84,0.55)',
  HT2: 'rgba(164,178,199,0.55)', LT2: 'rgba(136,141,149,0.45)',
  HT3: 'rgba(223,135,70,0.65)',  LT3: 'rgba(179,105,50,0.55)',
  HT4: 'rgba(70,223,93,0.55)',   LT4: 'rgba(49,146,40,0.45)',
  HT5: 'rgba(164,213,255,0.45)', LT5: 'rgba(164,213,255,0.35)',
};

export default function PlayerProfile() {
  const { username } = useParams<{ username: string }>();
  const { player, loading } = usePlayer(username);
  const { players } = usePlayers();
  const animPts = useCountUp(player?.points ?? 0);

  if (loading) {
    return (
      <div className="not-found-page">
        <div className="ppv2-spinner" />
        <p style={{ color: 'var(--text-dim)', marginTop: 16 }}>Loading player…</p>
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

  const rankedModes = modeCats.filter(c => {
    const t = player.tiers[c.id as keyof PlayerTiers];
    return t && t !== '-';
  });
  const unrankedModes = modeCats.filter(c => {
    const t = player.tiers[c.id as keyof PlayerTiers];
    return !t || t === '-';
  });

  return (
    <div className="profile-page ppv2-page">

      {/* ── Hero Banner ── */}
      <div className="ppv2-hero">
        <div className="ppv2-hero-glow" />
        <div className="ppv2-hero-inner">
          <Link to="/rankings/overall" className="back-link btn-press ppv2-back">
            <ArrowLeft size={14} /> Back to Rankings
          </Link>

          <div className="ppv2-header">
            {/* Avatar */}
            <div className={`ppv2-avatar-wrap ${rankClass}`}>
              <div className="ppv2-avatar-bg" />
              <PlayerAvatar username={player.username} size={100} />
              {rank > 0 && rank <= 3 && (
                <div className={`ppv2-crown ppv2-crown--${rankClass}`}>
                  {rank === 1 ? '👑' : rank === 2 ? '🥈' : '🥉'}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="ppv2-header-info">
              <h1 className="ppv2-username">{player.username}</h1>
              <div className="ppv2-title-row">
                <img src="/tier_icons/overall.svg" alt="" width={13} height={13} style={{ opacity: 0.65 }} />
                <span>{getTitle(player.points)}</span>
              </div>
              <div className="ppv2-badges-row">
                <span className={`region-badge region-${player.region.toLowerCase()}`}>{player.region}</span>
                {rank > 0 && (
                  <span className={`ppv2-rank-badge${rankClass ? ` ppv2-rank-badge--${rankClass}` : ''}`}>
                    <Trophy size={10} /> #{rank}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="ppv2-stats-strip">
            <div className="ppv2-stat">
              <Star size={13} className="ppv2-stat-icon" />
              <span className="ppv2-stat-val">{animPts}</span>
              <span className="ppv2-stat-label">Points</span>
            </div>
            <div className="ppv2-stat-sep" />
            <div className="ppv2-stat">
              <Trophy size={13} className="ppv2-stat-icon" />
              <span className="ppv2-stat-val">{rank > 0 ? `#${rank}` : '—'}</span>
              <span className="ppv2-stat-label">Overall Rank</span>
            </div>
            <div className="ppv2-stat-sep" />
            <div className="ppv2-stat">
              <Globe size={13} className="ppv2-stat-icon" />
              <span className="ppv2-stat-val">{player.region}</span>
              <span className="ppv2-stat-label">Region</span>
            </div>
            <div className="ppv2-stat-sep" />
            <div className="ppv2-stat">
              <span className="ppv2-stat-val">{rankedModes.length}<span style={{ fontSize: '0.75em', opacity: 0.5 }}>/{modeCats.length}</span></span>
              <span className="ppv2-stat-label">Modes Ranked</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tier Rankings ── */}
      <div className="profile-container ppv2-content">
        {rankedModes.length > 0 && (
          <>
            <div className="profile-section-header ppv2-section-header">
              <div className="section-label">Performance</div>
              <h2 className="section-heading" style={{ fontSize: '1.1rem' }}>Tier Rankings by Category</h2>
            </div>
            <div className="ppv2-tiers-grid">
              {rankedModes.map((cat, i) => {
                const rawTier = player.rawTiers?.[cat.id as keyof typeof player.rawTiers];
                const tierLevel = player.tiers[cat.id as keyof PlayerTiers];
                const dateTs = player.tierDates?.[cat.id];
                const dateStr = formatDate(dateTs);
                const glow = rawTier ? (TIER_GLOW[rawTier.toUpperCase()] ?? 'rgba(91,164,245,0.3)') : 'rgba(91,164,245,0.3)';

                return (
                  <div
                    key={cat.id}
                    className="ppv2-tier-card reveal"
                    style={{
                      '--tier-glow': glow,
                      animationDelay: `${i * 45}ms`,
                    } as React.CSSProperties}
                  >
                    <div className="ppv2-card-mode-row">
                      <div className="ppv2-card-icon-wrap">
                        <img src={cat.icon} alt={cat.label} width={20} height={20} />
                      </div>
                      <span className="ppv2-card-mode-name">{cat.label}</span>
                    </div>

                    <div className="ppv2-card-tier-wrap">
                      <CategoryTierBadge categoryId={cat.id} tier={tierLevel} rawTier={rawTier ?? null} />
                    </div>

                    {dateStr ? (
                      <div className="ppv2-card-since">
                        <Calendar size={9} />
                        <span>Since {dateStr}</span>
                      </div>
                    ) : (
                      <div className="ppv2-card-since ppv2-card-since--empty">
                        <Calendar size={9} />
                        <span>Date unknown</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Unranked modes */}
        {unrankedModes.length > 0 && (
          <div className="ppv2-unranked-section">
            <div className="ppv2-unranked-label">Not yet ranked in</div>
            <div className="ppv2-unranked-chips">
              {unrankedModes.map(cat => (
                <div key={cat.id} className="ppv2-unranked-chip">
                  <img src={cat.icon} alt={cat.label} width={14} height={14} style={{ opacity: 0.4 }} />
                  <span>{cat.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
