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
    let start: number | null = null; let lastStep = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      if (ts - lastStep < 33.34) { rafRef.current = requestAnimationFrame(step); return; }
      lastStep = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 4)) * target));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return val;
}

const TIER_GLOW: Record<string,string> = {
  HT1:'rgba(241,196,15,0.7)',LT1:'rgba(212,179,84,0.6)',
  HT2:'rgba(164,178,199,0.65)',LT2:'rgba(136,141,149,0.5)',
  HT3:'rgba(223,135,70,0.7)',LT3:'rgba(179,105,50,0.6)',
  HT4:'rgba(70,223,93,0.65)',LT4:'rgba(49,146,40,0.55)',
  HT5:'rgba(164,213,255,0.5)',LT5:'rgba(164,213,255,0.4)',
};
const TIER_BG: Record<string,string> = {
  HT1:'rgba(241,196,15,0.06)',LT1:'rgba(212,179,84,0.05)',
  HT2:'rgba(164,178,199,0.06)',LT2:'rgba(136,141,149,0.05)',
  HT3:'rgba(223,135,70,0.06)',LT3:'rgba(179,105,50,0.05)',
  HT4:'rgba(70,223,93,0.06)',LT4:'rgba(49,146,40,0.05)',
  HT5:'rgba(164,213,255,0.05)',LT5:'rgba(164,213,255,0.04)',
};

const RANK_CFG = {
  'rank-gold':  {p:'#fbbf24',s:'#f59e0b',t:'#fde68a',g:'rgba(251,191,36,0.55)',d:'rgba(251,191,36,0.10)'},
  'rank-silver':{p:'#cbd5e1',s:'#94a3b8',t:'#e2e8f0',g:'rgba(203,213,225,0.42)',d:'rgba(148,163,184,0.08)'},
  'rank-bronze':{p:'#fb923c',s:'#c97940',t:'#fed7aa',g:'rgba(251,146,60,0.46)',d:'rgba(180,120,60,0.09)'},
  '':           {p:'#60a5fa',s:'#3b82f6',t:'#bfdbfe',g:'rgba(96,165,250,0.40)',d:'rgba(96,165,250,0.08)'},
} as const;
type RankKey = keyof typeof RANK_CFG;

/* ── Rank Emblem ── */
function RankEmblem({ rank, rankClass, cfg }: {
  rank: number; rankClass: RankKey; cfg: typeof RANK_CFG[RankKey];
}) {
  if (!rankClass || rank < 1 || rank > 3) return null;
  const symbols = { 1: 'I', 2: 'II', 3: 'III' } as Record<number, string>;
  return (
    <div className={`ppv2-rank-emblem ppv2-rank-emblem--${rankClass}`} aria-label={`Rank ${rank}`}>
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="ppv2-emblem-svg">
        <defs>
          <radialGradient id={`eg${rank}`} cx="50%" cy="40%" r="55%">
            <stop offset="0%"   stopColor={cfg.t} stopOpacity="0.95"/>
            <stop offset="60%"  stopColor={cfg.p} stopOpacity="0.70"/>
            <stop offset="100%" stopColor={cfg.s} stopOpacity="0.20"/>
          </radialGradient>
          <filter id={`ef${rank}`}><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id={`eg2${rank}`}><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <circle cx="60" cy="60" r="52" fill={cfg.g} filter={`url(#eg2${rank})`} opacity="0.6"/>
        <circle cx="60" cy="60" r="52" stroke={cfg.p} strokeWidth="0.8" strokeDasharray="3 9" strokeOpacity="0.65" className="ppv2-emblem-ring-outer"/>
        <circle cx="60" cy="60" r="44" stroke={cfg.p} strokeWidth="1.4" strokeOpacity="0.90" filter={`url(#ef${rank})`}/>
        <circle cx="60" cy="60" r="38" fill={cfg.d}/>
        <circle cx="60" cy="60" r="38" stroke={cfg.p} strokeWidth="0.6" strokeOpacity="0.40"/>
        <text x="60" y="70" textAnchor="middle" fill={`url(#eg${rank})`}
          fontSize={rank===1?34:rank===2?28:26} fontWeight="900"
          fontFamily="system-ui,-apple-system,sans-serif" letterSpacing="-1"
          filter={`url(#ef${rank})`}>{symbols[rank]}</text>
        {[[60,5],[60,115],[5,60],[115,60]].map(([cx,cy],i)=>(
          <rect key={i} x={cx-4} y={cy-4} width="8" height="8" fill={cfg.p} opacity="0.85"
            transform={`rotate(45,${cx},${cy})`} filter={`url(#ef${rank})`}/>
        ))}
        {[[23,23],[97,23],[23,97],[97,97]].map(([cx,cy],i)=>(
          <rect key={i} x={cx-3} y={cy-3} width="6" height="6" fill={cfg.p} opacity="0.45"
            transform={`rotate(45,${cx},${cy})`}/>
        ))}
      </svg>
      <div className="ppv2-emblem-line ppv2-emblem-line--left"/>
      <div className="ppv2-emblem-line ppv2-emblem-line--right"/>
    </div>
  );
}

/* ── Crowns ── */
function CrownGold() {
  return (
    <svg viewBox="0 0 110 90" fill="none">
      <defs>
        <linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fde68a"/><stop offset="45%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#92400e"/></linearGradient>
        <linearGradient id="cg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fcd34d"/><stop offset="100%" stopColor="#78350f"/></linearGradient>
        <radialGradient id="cru" cx="50%" cy="30%" r="60%"><stop offset="0%" stopColor="#fecaca"/><stop offset="55%" stopColor="#ef4444"/><stop offset="100%" stopColor="#7f1d1d"/></radialGradient>
        <radialGradient id="csa" cx="50%" cy="30%" r="60%"><stop offset="0%" stopColor="#dbeafe"/><stop offset="55%" stopColor="#3b82f6"/><stop offset="100%" stopColor="#1e3a5f"/></radialGradient>
        <radialGradient id="cem" cx="50%" cy="30%" r="60%"><stop offset="0%" stopColor="#d1fae5"/><stop offset="55%" stopColor="#10b981"/><stop offset="100%" stopColor="#064e3b"/></radialGradient>
        <filter id="cgl"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <path d="M15 68 L15 36 L36 56 L55 8 L74 56 L95 36 L95 68 Z" fill="url(#cg1)" filter="url(#cgl)"/>
      <rect x="12" y="62" width="86" height="20" rx="5" fill="url(#cg2)"/>
      <rect x="12" y="62" width="86" height="6" rx="5" fill="rgba(255,255,255,0.15)"/>
      <ellipse cx="55" cy="10" rx="8" ry="9" fill="url(#cru)" stroke="#fca5a5" strokeWidth="0.8"/>
      <ellipse cx="52" cy="7" rx="3" ry="2" fill="rgba(255,255,255,0.5)" transform="rotate(-20 52 7)"/>
      <ellipse cx="15.5" cy="38" rx="6" ry="7" fill="url(#csa)" stroke="#93c5fd" strokeWidth="0.8"/>
      <ellipse cx="94.5" cy="38" rx="6" ry="7" fill="url(#cem)" stroke="#6ee7b7" strokeWidth="0.8"/>
      <circle cx="34" cy="72" r="5" fill="url(#csa)" stroke="#93c5fd" strokeWidth="0.6"/>
      <circle cx="55" cy="72" r="5" fill="url(#cru)" stroke="#fca5a5" strokeWidth="0.6"/>
      <circle cx="76" cy="72" r="5" fill="url(#cem)" stroke="#6ee7b7" strokeWidth="0.6"/>
    </svg>
  );
}
function CrownSilver() {
  return (
    <svg viewBox="0 0 100 80" fill="none">
      <defs>
        <linearGradient id="sg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f1f5f9"/><stop offset="40%" stopColor="#94a3b8"/><stop offset="100%" stopColor="#334155"/></linearGradient>
        <linearGradient id="sg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#cbd5e1"/><stop offset="100%" stopColor="#1e293b"/></linearGradient>
        <radialGradient id="sdi" cx="50%" cy="25%" r="60%"><stop offset="0%" stopColor="#e2e8f0"/><stop offset="50%" stopColor="#bfdbfe"/><stop offset="100%" stopColor="#1e3a5f"/></radialGradient>
        <filter id="sgl"><feGaussianBlur stdDeviation="1.8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <path d="M12 64 L12 38 L28 54 L50 12 L72 54 L88 38 L88 64 Z" fill="url(#sg1)" filter="url(#sgl)"/>
      <rect x="10" y="58" width="80" height="16" rx="4" fill="url(#sg2)"/>
      <rect x="10" y="58" width="80" height="5" rx="4" fill="rgba(255,255,255,0.18)"/>
      <polygon points="50,6 56,15 50,22 44,15" fill="url(#sdi)" stroke="#bfdbfe" strokeWidth="0.7"/>
      <polygon points="12,31 17,38 12,44 7,38" fill="url(#sdi)" stroke="#bfdbfe" strokeWidth="0.6"/>
      <polygon points="88,31 93,38 88,44 83,38" fill="url(#sdi)" stroke="#bfdbfe" strokeWidth="0.6"/>
    </svg>
  );
}
function CrownBronze() {
  return (
    <svg viewBox="0 0 100 90" fill="none">
      <defs>
        <linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fed7aa"/><stop offset="45%" stopColor="#c07838"/><stop offset="100%" stopColor="#7c2d12"/></linearGradient>
        <linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fdba74"/><stop offset="100%" stopColor="#431407"/></linearGradient>
        <radialGradient id="bop" cx="50%" cy="25%" r="60%"><stop offset="0%" stopColor="#fef3c7"/><stop offset="55%" stopColor="#f97316"/><stop offset="100%" stopColor="#7c2d12"/></radialGradient>
        <filter id="bgl"><feGaussianBlur stdDeviation="1.8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <path d="M14 66 L14 38 L30 54 L50 16 L70 54 L86 38 L86 66 Z" fill="url(#bg1)" filter="url(#bgl)"/>
      <rect x="12" y="60" width="76" height="18" rx="4" fill="url(#bg2)"/>
      <ellipse cx="50" cy="18" rx="7" ry="8" fill="url(#bop)" stroke="#fdba74" strokeWidth="0.8"/>
      <ellipse cx="14" cy="40" rx="5.5" ry="6.5" fill="url(#bop)" stroke="#fdba74" strokeWidth="0.7"/>
      <ellipse cx="86" cy="40" rx="5.5" ry="6.5" fill="url(#bop)" stroke="#fdba74" strokeWidth="0.7"/>
    </svg>
  );
}

function UuidBadge({ uuid }: { uuid: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(uuid).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
  }, [uuid]);
  if (!uuid) return null;
  const d = uuid.replace(/-/g,'');
  return (
    <button onClick={copy} title={uuid} className="ppv2-uuid-btn">
      {copied
        ? <><Check size={10} style={{color:'#4ade80'}}/><span style={{color:'#4ade80'}}>Copied!</span></>
        : <><Copy size={10}/><span>UUID: {d.slice(0,8)}…{d.slice(-4)}</span></>}
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
    resolveAlias(username).then(s => { if (s) navigate(`/player/${encodeURIComponent(s)}`, { replace: true }); });
  }, [loading, player, username, navigate]);

  if (loading) return (
    <div className="not-found-page">
      <div className="ppv2-spinner"/>
      <p style={{color:'var(--text-dim)',marginTop:20}}>Loading player…</p>
    </div>
  );

  if (!player) return (
    <div className="not-found-page">
      <div className="not-found-glow"/>
      <div className="not-found-icon">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      </div>
      <h1>Player Not Found</h1>
      <p>No player named <strong style={{color:'var(--text-dim)'}}>&ldquo;{username}&rdquo;</strong> exists.</p>
      <Link to="/" className="go-home-btn btn-press"><ArrowLeft size={15}/> Go Home</Link>
    </div>
  );

  const sorted = [...players].sort((a,b) => b.points - a.points);
  const rank = sorted.findIndex(p => p.id === player.id) + 1;
  const modeCats = CATEGORIES.filter(c => c.id !== 'overall');
  const rankClass = (rank===1?'rank-gold':rank===2?'rank-silver':rank===3?'rank-bronze':'') as RankKey;
  const cfg = RANK_CFG[rankClass] ?? RANK_CFG[''];
  const rankedModes = modeCats.filter(c => { const t=player.tiers[c.id as keyof PlayerTiers]; return t&&t!=='-'; });
  const unrankedModes = modeCats.filter(c => { const t=player.tiers[c.id as keyof PlayerTiers]; return !t||t==='-'; });
  const rankLabel = rank>0?`#${rank}`:'—';
  const rankPct = players.length > 1 ? Math.max(0, Math.min(100, ((players.length - rank) / (players.length - 1)) * 100)) : 100;

  const cssVars = {
    '--accent':cfg.p,'--accent-sec':cfg.s,'--accent-tri':cfg.t,
    '--accent-glow':cfg.g,'--accent-dim':cfg.d,
  } as React.CSSProperties;

  const statCards = [
    {icon:<Star size={16}/>,   val:animPts,      lbl:'Total Points',  sc:cfg.p, sg:cfg.g},
    {icon:<Trophy size={16}/>, val:rankLabel,     lbl:'Overall Rank',  sc:cfg.p, sg:cfg.g},
    {icon:<Globe size={16}/>,  val:player.region, lbl:'Region',        sc:'#34d399', sg:'rgba(52,211,153,0.38)'},
    {icon:<Zap size={16}/>,    val:<>{rankedModes.length}<span className="ppv2-stat-card-of">/{modeCats.length}</span></>, lbl:'Modes Ranked', sc:'#a78bfa', sg:'rgba(167,139,250,0.38)'},
  ];

  return (
    <div className="profile-page ppv2-page">
      <div className={`ppv2-hero${rankClass?` ppv2-hero--${rankClass}`:''}`} style={cssVars}>

        {/* ── Background layers ── */}
        <div className="ppv2-bg-mesh"/>
        <div className="ppv2-bg-grid"/>
        <div className="ppv2-bg-scanlines"/>
        {rankClass==='rank-gold' && <div className="ppv2-rays"/>}
        <div className="ppv2-bg-fade"/>

        {/* ── Floating ambient orbs ── */}
        <div className="ppv2-float-orb ppv2-float-orb--1" aria-hidden="true"/>
        <div className="ppv2-float-orb ppv2-float-orb--2" aria-hidden="true"/>
        <div className="ppv2-float-orb ppv2-float-orb--3" aria-hidden="true"/>

        {/* ── Spotlight beam ── */}
        <div className="ppv2-spotlight" aria-hidden="true"/>

        <div className="ppv2-hero-inner">
          <Link to="/rankings/overall" className="back-link btn-press ppv2-back">
            <ArrowLeft size={14}/> Back to Rankings
          </Link>

          {/* Rank emblem for top 3 */}
          <RankEmblem rank={rank} rankClass={rankClass} cfg={cfg}/>

          {/* ── Main Card ── */}
          <div className="ppv2-card-wrap">
            <div className="ppv2-card-border-wrap">
              <div className="ppv2-card-border-rot"/>
            </div>

            {/* Card corner ornaments */}
            <div className="ppv2-card-corner ppv2-card-corner--tl" aria-hidden="true"/>
            <div className="ppv2-card-corner ppv2-card-corner--tr" aria-hidden="true"/>
            <div className="ppv2-card-corner ppv2-card-corner--bl" aria-hidden="true"/>
            <div className="ppv2-card-corner ppv2-card-corner--br" aria-hidden="true"/>

            <div className="ppv2-card">
              <div className="ppv2-card-top-line"/>
              <div className="ppv2-card-bottom-line"/>
              <div className="ppv2-card-sheen"/>

              {/* ══ LEFT — avatar ══ */}
              <div className="ppv2-card-left">
                <div className="ppv2-card-left-tex"/>
                {rank>0 && <div className="ppv2-ghost-rank" aria-hidden="true">{rankLabel}</div>}

                {/* Diagonal sweep lines */}
                <div className="ppv2-left-sweep" aria-hidden="true"/>

                {rankClass && (
                  <div className="ppv2-particles" aria-hidden="true">
                    {[...Array(18)].map((_,i)=><div key={i} className={`ppv2-particle ppv2-particle--${i+1}`}/>)}
                  </div>
                )}

                {/* ── Avatar frame with CSS rings ── */}
                <div className={`ppv2-avatar-frame${rankClass?` ppv2-avatar-frame--${rankClass}`:''}`}>
                  <div className="ppv2-avatar-aura"/>
                  <div className="ppv2-avatar-aura ppv2-avatar-aura--2"/>

                  {/* CSS rings */}
                  <div className="ppv2-ring ppv2-ring--1"/>
                  <div className="ppv2-ring ppv2-ring--2"/>
                  <div className="ppv2-ring ppv2-ring--3"/>

                  {/* Corner sparks */}
                  <div className="ppv2-spark ppv2-spark--tl"/>
                  <div className="ppv2-spark ppv2-spark--tr"/>
                  <div className="ppv2-spark ppv2-spark--bl"/>
                  <div className="ppv2-spark ppv2-spark--br"/>

                  {/* ── Avatar box — crown is INSIDE so it levitates with the head ── */}
                  <div className="ppv2-avatar-box">
                    {/* Crown is now a child of avatar-box — floats in sync */}
                    {rank>0&&rank<=3&&(
                      <div className={`ppv2-crown ppv2-crown--${rank}`}>
                        {rank===1?<CrownGold/>:rank===2?<CrownSilver/>:<CrownBronze/>}
                      </div>
                    )}

                    <div className="ppv2-avatar-pedestal"/>
                    <div className="ppv2-avatar-glow-bg"/>
                    <div className="ppv2-avatar-inner">
                      <PlayerAvatar username={live.uuid||player.uuid||live.username} size={220} mode="face3d"/>
                    </div>
                    <div className="ppv2-avatar-reflection"/>
                  </div>

                  {/* Rank pill (stays on frame, not on box) */}
                  {rank>0&&(
                    <div className={`ppv2-frame-rank${rankClass?` ppv2-frame-rank--${rankClass}`:''}`}>
                      <Trophy size={8}/> {rankLabel}
                    </div>
                  )}
                </div>

                <div className="ppv2-accent-bar"/>

                {/* Left panel bottom deco */}
                <div className="ppv2-left-deco-row" aria-hidden="true">
                  <div className="ppv2-deco-dot"/>
                  <div className="ppv2-deco-line"/>
                  <div className="ppv2-deco-diamond"/>
                  <div className="ppv2-deco-line"/>
                  <div className="ppv2-deco-dot"/>
                </div>
              </div>

              {/* ══ RIGHT — player info ══ */}
              <div className="ppv2-card-right">
                {/* Subtle diagonal mesh on right */}
                <div className="ppv2-right-tex" aria-hidden="true"/>

                <div className="ppv2-eyebrow">
                  <Zap size={9}/>
                  <span>OuterTiers Player</span>
                  <span className="ppv2-eyebrow-sep"/>
                  <span className={`ppv2-eyebrow-region region-badge region-${player.region.toLowerCase()}`}>
                    {player.region}
                  </span>
                </div>

                <h1 className="ppv2-username">{live.username}</h1>

                <div className="ppv2-achievement-title">
                  <Shield size={11} className="ppv2-title-icon"/>
                  <span>{getTitle(player.points)}</span>
                  <div className="ppv2-title-dot"/>
                </div>

                <div className="ppv2-divider"/>

                <div className="ppv2-pills-row">
                  {rank>0&&(
                    <span className={`ppv2-rank-pill${rankClass?` ppv2-rank-pill--${rankClass}`:''}`}>
                      <Trophy size={10}/> {rankLabel} Overall
                    </span>
                  )}
                  <span className={`region-badge region-${player.region.toLowerCase()}`}>{player.region}</span>
                </div>

                <UuidBadge uuid={live.uuid||player.uuid||''}/>

                <div className="ppv2-meta-row">
                  <div className="ppv2-meta-item">
                    <span className="ppv2-meta-val">{animPts}</span>
                    <span className="ppv2-meta-lbl">points</span>
                  </div>
                  <div className="ppv2-meta-sep"/>
                  <div className="ppv2-meta-item">
                    <span className="ppv2-meta-val">{rankedModes.length}<span className="ppv2-meta-dim">/{modeCats.length}</span></span>
                    <span className="ppv2-meta-lbl">modes</span>
                  </div>
                </div>

                {/* Rank progress bar */}
                {rank > 0 && players.length > 1 && (
                  <div className="ppv2-rank-progress">
                    <div className="ppv2-rank-progress-labels">
                      <span className="ppv2-rank-progress-lbl">Global Percentile</span>
                      <span className="ppv2-rank-progress-val">{Math.round(rankPct)}%</span>
                    </div>
                    <div className="ppv2-rank-progress-track">
                      <div
                        className={`ppv2-rank-progress-fill${rankClass?` ppv2-rank-progress-fill--${rankClass}`:''}`}
                        style={{width:`${rankPct}%`}}
                      />
                      <div className="ppv2-rank-progress-glow" style={{left:`${rankPct}%`}}/>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Stat cards ── */}
          <div className="ppv2-stat-cards">
            {statCards.map((s,i)=>(
              <div key={i} className="ppv2-stat-card"
                style={{'--sc':s.sc,'--sg':s.sg,animationDelay:`${i*70}ms`} as React.CSSProperties}>
                <div className="ppv2-stat-card-bg"/>
                <div className="ppv2-stat-card-shine"/>
                <div className="ppv2-stat-card-icon">{s.icon}</div>
                <div className="ppv2-stat-card-num">{s.val}</div>
                <div className="ppv2-stat-card-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tier Rankings ── */}
      <div className="profile-container ppv2-content">
        {rankedModes.length>0&&(
          <>
            <div className="ppv2-section-head">
              <div className="section-label">Performance</div>
              <h2 className="section-heading ppv2-section-title">Tier Rankings by Category</h2>
              <div className="ppv2-section-deco" aria-hidden="true">
                <div className="ppv2-deco-line ppv2-deco-line--long"/>
                <div className="ppv2-deco-diamond"/>
                <div className="ppv2-deco-line ppv2-deco-line--long"/>
              </div>
            </div>
            <div className="ppv2-tiers-grid">
              {rankedModes.map((cat,i)=>{
                const rawTier=player.rawTiers?.[cat.id as keyof typeof player.rawTiers];
                const tierLevel=player.tiers[cat.id as keyof PlayerTiers];
                const dateTs=player.tierDates?.[cat.id];
                const dateStr=formatDate(dateTs);
                const rawUp=rawTier?.toUpperCase()??'';
                const glow=TIER_GLOW[rawUp]??'rgba(91,164,245,0.35)';
                const bg=TIER_BG[rawUp]??'rgba(91,164,245,0.04)';
                return (
                  <div key={cat.id} className="ppv2-tier-card"
                    style={{'--tier-glow':glow,'--tier-bg':bg,animationDelay:`${i*55}ms`} as React.CSSProperties}>
                    <div className="ppv2-card-orb"/>
                    <div className="ppv2-card-icon"><img src={cat.icon} alt={cat.label} width={24} height={24}/></div>
                    <div className="ppv2-card-mode">{cat.label}</div>
                    <div className="ppv2-card-badge">
                      <CategoryTierBadge categoryId={cat.id} tier={tierLevel} rawTier={rawTier??null}/>
                    </div>
                    <div className={`ppv2-card-date${!dateStr?' ppv2-card-date--unknown':''}`}>
                      <Calendar size={9}/><span>{dateStr?`Since ${dateStr}`:'Date unknown'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        {rankedModes.length===0&&(
          <div className="ppv2-no-ranks"><Trophy size={28} style={{opacity:0.3}}/><p>No ranked modes yet</p></div>
        )}
        {unrankedModes.length>0&&(
          <div className="ppv2-unranked">
            <div className="ppv2-unranked-lbl">Not yet ranked in</div>
            <div className="ppv2-unranked-chips">
              {unrankedModes.map(cat=>(
                <span key={cat.id} className="ppv2-unranked-chip">
                  <img src={cat.icon} alt={cat.label} width={13} height={13} style={{opacity:0.35}}/>
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
