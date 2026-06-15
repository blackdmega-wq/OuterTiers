import { useParams, Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { CATEGORIES, getTitle } from '../data/players';
import type { PlayerTiers } from '../data/players';
import { usePlayer, usePlayers } from '../hooks/usePlayers';
import CategoryTierBadge from '../components/CategoryTierBadge';
import PlayerAvatar from '../components/PlayerAvatar';
import { ArrowLeft, Calendar, Star, Trophy, Globe, Zap } from 'lucide-react';
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
    const step = (ts: number) => {
      if (!start) start = ts;
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

export default function PlayerProfile() {
  const { username } = useParams<{ username: string }>();
  const { player, loading } = usePlayer(username);
  const { players } = usePlayers();
  const animPts = useCountUp(player?.points ?? 0);

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

      {/* ── Hero ── */}
      <div className="ppv2-hero">
        <div className="ppv2-hero-glow" />
        <div className="ppv2-hero-grid" />
        <div className="ppv2-hero-inner">
          <Link to="/rankings/overall" className="back-link btn-press ppv2-back">
            <ArrowLeft size={14} /> Back to Rankings
          </Link>

          <div className="ppv2-header">
            <div className={`ppv2-avatar-wrap${rankClass ? ` ppv2-avatar-${rankClass}` : ''}`}>
              <div className="ppv2-avatar-bg" />
              <PlayerAvatar username={player.username} size={106} />
              {rank > 0 && rank <= 3 && (
                <div className="ppv2-crown">
                  {rank === 1 ? '👑' : rank === 2 ? '🥈' : '🥉'}
                </div>
              )}
            </div>

            <div className="ppv2-header-info">
              <div className="ppv2-eyebrow">
                <Zap size={10} style={{ opacity: 0.7 }} />
                OuterTiers Player
              </div>
              <h1 className="ppv2-username">{player.username}</h1>
              <div className="ppv2-title-row">
                <img src="/tier_icons/overall.svg" alt="" width={13} height={13} style={{ opacity: 0.6 }} />
                <span>{getTitle(player.points)}</span>
              </div>
              <div className="ppv2-badges-row">
                <span className={`region-badge region-${player.region.toLowerCase()}`}>{player.region}</span>
                {rank > 0 && (
                  <span className={`ppv2-rank-pill${rankClass ? ` ppv2-rank-pill--${rankClass}` : ''}`}>
                    <Trophy size={10} /> #{rank} Overall
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="ppv2-stats-row">
            <div className="ppv2-stat-box">
              <Star size={14} className="ppv2-stat-icon" />
              <div className="ppv2-stat-num">{animPts}</div>
              <div className="ppv2-stat-lbl">Total Points</div>
            </div>
            <div className="ppv2-stat-sep" />
            <div className="ppv2-stat-box">
              <Trophy size={14} className="ppv2-stat-icon" />
              <div className="ppv2-stat-num">{rank > 0 ? `#${rank}` : '—'}</div>
              <div className="ppv2-stat-lbl">Overall Rank</div>
            </div>
            <div className="ppv2-stat-sep" />
            <div className="ppv2-stat-box">
              <Globe size={14} className="ppv2-stat-icon" />
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

      {/* ── Tier Rankings ── */}
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
                    style={{
                      '--tier-glow': glow,
                      '--tier-bg': bg,
                      animationDelay: `${i * 55}ms`,
                    } as React.CSSProperties}
                  >
                    {/* Glow orb */}
                    <div className="ppv2-card-orb" />

                    {/* Mode icon */}
                    <div className="ppv2-card-icon">
                      <img src={cat.icon} alt={cat.label} width={24} height={24} />
                    </div>

                    {/* Mode name */}
                    <div className="ppv2-card-mode">{cat.label}</div>

                    {/* Tier badge — the star of the card */}
                    <div className="ppv2-card-badge">
                      <CategoryTierBadge
                        categoryId={cat.id}
                        tier={tierLevel}
                        rawTier={rawTier ?? null}
                      />
                    </div>

                    {/* Since date */}
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
