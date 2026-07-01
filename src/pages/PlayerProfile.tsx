import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState, useCallback } from 'react';
import { CATEGORIES, getTitle } from '../data/players';
import type { PlayerTiers } from '../data/players';
import { usePlayer, usePlayers } from '../hooks/usePlayers';
import { useLiveProfile, resolveAlias } from '../hooks/useMojangProfile';
import CategoryTierBadge from '../components/CategoryTierBadge';
import PlayerAvatar from '../components/PlayerAvatar';
import { ArrowLeft, Calendar, Star, Trophy, Globe, Zap, Copy, Check, Shield, Clock, AlertTriangle, ChevronDown, Swords, Ban } from 'lucide-react';
import '../styles/profile-v2.css';
import '../styles/profile-history.css';

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

// ── History types ──────────────────────────────────────────────────────────────

interface TestResult {
  id: number;
  username?: string;
  tier: string;
  mode: string | null;
  region: string | null;
  ticketType: string | null;
  testerName: string | null;
  testerId: string | null;
  isHighTier: boolean;
  createdAt: number;
}

interface Punishment {
  id: number;
  type: string;
  reason: string | null;
  durationMs: number | null;
  expiresAt: number | null;
  active: boolean;
  pardonedBy: string | null;
  pardonedAt: number | null;
  moderatorId: string | null;
  moderatorName: string | null;
  createdAt: number;
}

interface PlayerHistory { testResults: TestResult[]; punishments: Punishment[]; }

// ── Mode display map ───────────────────────────────────────────────────────────

const MODE_INFO: Record<string, { label: string; icon: string }> = {
  vanilla:  { label: 'Crystal',   icon: '/tier_icons/crystal.png' },
  crystal:  { label: 'Crystal',   icon: '/tier_icons/crystal.png' },
  ogvanilla:{ label: 'OG Vanilla',icon: '/tier_icons/ogvanilla.png' },
  sword:    { label: 'Sword',     icon: '/tier_icons/sword.png' },
  speed:    { label: 'Speed',     icon: '/tier_icons/speed.png' },
  pot:      { label: 'Pot',       icon: '/tier_icons/pot.png' },
  nethop:   { label: 'NethOP',    icon: '/tier_icons/nethop.png' },
  uhc:      { label: 'UHC',       icon: '/tier_icons/uhc.png' },
  axe:      { label: 'Axe',       icon: '/tier_icons/axe.png' },
  mace:     { label: 'Mace',      icon: '/tier_icons/mace.png' },
  smp:      { label: 'SMP',       icon: '/tier_icons/smp.png' },
};

function getModeInfo(raw: string | null): { label: string; icon: string } {
  if (!raw) return { label: 'Global', icon: '/tier_icons/overall.png' };
  return MODE_INFO[raw.toLowerCase()] ?? { label: raw, icon: '/tier_icons/overall.png' };
}

// Normalise "crystal" → "vanilla" for filter deduplication
function normFilterMode(raw: string | null): string {
  if (!raw) return '__global__';
  const l = raw.toLowerCase();
  return l === 'crystal' ? 'vanilla' : l;
}

// ── Tier colour helpers ────────────────────────────────────────────────────────

function tierBarColor(rawTier: string | null | undefined): string {
  if (!rawTier) return 'rgba(96,165,250,0.70)';
  const u = rawTier.toUpperCase();
  if (u === 'HT1' || u === 'LT1') return 'rgba(251,191,36,0.90)';
  if (u === 'HT2' || u === 'LT2') return 'rgba(203,213,225,0.75)';
  if (u === 'HT3' || u === 'LT3') return 'rgba(251,146,60,0.85)';
  if (u === 'HT4' || u === 'LT4') return 'rgba(52,211,153,0.75)';
  if (u === 'HT5' || u === 'LT5') return 'rgba(164,213,255,0.65)';
  return 'rgba(96,165,250,0.70)';
}

function tierTextColor(rawTier: string | null | undefined): string {
  if (!rawTier) return '#60a5fa';
  const u = rawTier.toUpperCase();
  if (u === 'HT1' || u === 'LT1') return '#fbbf24';
  if (u === 'HT2' || u === 'LT2') return '#cbd5e1';
  if (u === 'HT3' || u === 'LT3') return '#fb923c';
  if (u === 'HT4' || u === 'LT4') return '#34d399';
  if (u === 'HT5' || u === 'LT5') return '#a5d8ff';
  return '#60a5fa';
}

// ── Date helpers ───────────────────────────────────────────────────────────────

function formatRelDate(ts: number): string {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  const mo = Math.floor(d / 30);
  const y = Math.floor(d / 365);
  if (y > 0) return `${y}y ago`;
  if (mo > 0) return `${mo}mo ago`;
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'just now';
}

function formatDuration(ms: number | null): string | null {
  if (!ms) return null;
  const m = Math.round(ms / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}

// ── Punishment type config ─────────────────────────────────────────────────────

const PUNISH_CFG: Record<string, { emoji: string; label: string; color: string; bg: string; border: string; orb: string }> = {
  ban: {
    emoji: '🔨', label: 'Permanent Ban',
    color: '#f87171', bg: 'rgba(239,68,68,0.10)',
    border: 'rgba(239,68,68,0.28)', orb: 'rgba(239,68,68,0.18)',
  },
  blacklist: {
    emoji: '🚫', label: 'Blacklist',
    color: '#fb923c', bg: 'rgba(251,146,60,0.10)',
    border: 'rgba(251,146,60,0.28)', orb: 'rgba(251,146,60,0.16)',
  },
  timeout: {
    emoji: '⏳', label: 'Timeout',
    color: '#fbbf24', bg: 'rgba(251,191,36,0.10)',
    border: 'rgba(251,191,36,0.26)', orb: 'rgba(251,191,36,0.14)',
  },
};
function getPunishCfg(type: string) {
  return PUNISH_CFG[type.toLowerCase()] ?? {
    emoji: '⚠️', label: type, color: '#f87171',
    bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.28)', orb: 'rgba(248,113,113,0.16)',
  };
}

// ── usePlayerHistory hook ─────────────────────────────────────────────────────

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || 'https://outertiers-api.onrender.com';

function usePlayerHistory(username: string | undefined, enabled: boolean) {
  const [data, setData] = useState<PlayerHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username || !enabled) return;
    setLoading(true); setError(null);

    fetch(`${API_BASE}/api/players/${encodeURIComponent(username)}/history`)
      .then(async r => {
        if (!r.ok) throw new Error('not_found');
        const j = await r.json();
        if (!Array.isArray(j.testResults)) throw new Error('bad_shape');
        return j as PlayerHistory;
      })
      .then(j => { setData(j); setLoading(false); })
      .catch(async () => {
        // Fallback: fetch the live results feed and filter by username.
        // This works with the current server until the history endpoint is deployed.
        try {
          const [liveRes, htRes] = await Promise.all([
            fetch(`${API_BASE}/api/results/live`).then(r => r.json()),
            fetch(`${API_BASE}/api/results/high-tier`).then(r => r.json()),
          ]);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const live = (liveRes.results ?? []) as any[];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ht   = (htRes.results   ?? []) as any[];
          const allById = new Map<number, TestResult>();
          for (const r of [...live, ...ht]) {
            if (r.username?.toLowerCase() === username!.toLowerCase()) {
              allById.set(r.id, {
                id:         r.id,
                tier:       r.tier,
                mode:       r.mode       ?? null,
                region:     r.region     ?? null,
                ticketType: r.ticketType ?? null,
                testerName: r.testerName ?? null,
                testerId:   r.testerId   ?? null,
                isHighTier: r.isHighTier ?? false,
                createdAt:  r.createdAt,
              });
            }
          }
          const testResults = [...allById.values()].sort((a, b) => b.createdAt - a.createdAt);
          setData({ testResults, punishments: [] });
          setLoading(false);
        } catch (e2: unknown) {
          setError((e2 as Error).message);
          setLoading(false);
        }
      });
  }, [username, enabled]);

  return { data, loading, error };
}

// ── Inline tier badge (used inside history rows) ──────────────────────────────

function HistoryTierBadge({ rawTier }: { rawTier: string }) {
  const color = tierTextColor(rawTier);
  const bar   = tierBarColor(rawTier);
  return (
    <span style={{
      display:'inline-flex', alignItems:'center',
      padding:'3px 11px', borderRadius:'20px',
      fontSize:'0.78rem', fontWeight:900, letterSpacing:'0.05em',
      color,
      background: bar.replace(/[\d.]+\)$/, '0.10)'),
      border: `1px solid ${bar.replace(/[\d.]+\)$/, '0.40)')}`,
      whiteSpace:'nowrap',
      boxShadow:`0 0 10px ${bar.replace(/[\d.]+\)$/, '0.25)')}`,
    }}>
      {rawTier}
    </span>
  );
}

// ── History section component ─────────────────────────────────────────────────

const PAGE_SIZE = 30;

function PlayerHistorySection({ username }: { username: string }) {
  const [visible, setVisible]   = useState(false);
  const [activeTab, setTab]     = useState<'results'|'punishments'>('results');
  const [modeFilter, setMode]   = useState<string>('__all__');
  const [showCount, setShow]    = useState(PAGE_SIZE);
  const { data, loading, error } = usePlayerHistory(username, visible);

  // Lazy-load: only fetch once user scrolls to or clicks the section
  const sectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (visible) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { rootMargin: '200px' });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [visible]);

  // Unique modes from results (normalised for dedup)
  const uniqueModes: string[] = [];
  if (data) {
    const seen = new Set<string>();
    for (const r of data.testResults) {
      const key = normFilterMode(r.mode);
      if (!seen.has(key)) { seen.add(key); uniqueModes.push(key); }
    }
  }

  const filteredResults = data?.testResults.filter(r =>
    modeFilter === '__all__' || normFilterMode(r.mode) === modeFilter
  ) ?? [];

  const visibleResults = filteredResults.slice(0, showCount);

  const punishments = data?.punishments ?? [];
  const activePunish = punishments.filter(p => p.active).length;

  return (
    <div className="profile-container ph-section" ref={sectionRef}>
      {/* ── Header ── */}
      <div className="ph-head">
        <div className="ph-head-left">
          <div className="ph-eyebrow"><Clock size={10}/> Player History</div>
          <h2 className="ph-title">Activity &amp; Punishment Log</h2>
        </div>

        <div className="ph-tabs">
          <button
            className={`ph-tab${activeTab==='results'?' ph-tab--active':''}`}
            onClick={() => setTab('results')}
          >
            <Swords size={12}/>
            Test Results
            {data && <span className="ph-tab-count">{data.testResults.length}</span>}
          </button>
          <button
            className={`ph-tab ph-tab--punish${activeTab==='punishments'?' ph-tab--active':''}`}
            onClick={() => setTab('punishments')}
          >
            <Ban size={12}/>
            Punishments
            {activePunish > 0 && <span className="ph-tab-count" style={{background:'rgba(248,113,113,0.22)',color:'#f87171'}}>{activePunish} active</span>}
            {data && activePunish === 0 && <span className="ph-tab-count">{punishments.length}</span>}
          </button>
        </div>
      </div>

      <div className="ph-divider"/>

      {/* ── Loading / Error ── */}
      {loading && (
        <div className="ph-loading">
          <div className="ph-spinner"/>
          <span>Loading history…</span>
        </div>
      )}
      {error && !loading && (
        <div className="ph-empty">
          <div className="ph-empty-icon"><AlertTriangle size={32}/></div>
          <p>Could not load history</p>
        </div>
      )}

      {/* ══ TEST RESULTS TAB ══ */}
      {!loading && !error && data && activeTab === 'results' && (
        <>
          {/* Mode filter chips */}
          {uniqueModes.length > 1 && (
            <div className="ph-filter-row">
              <button
                className={`ph-filter-chip${modeFilter==='__all__'?' ph-filter-chip--active':''}`}
                onClick={() => { setMode('__all__'); setShow(PAGE_SIZE); }}
              >
                All <span style={{opacity:0.55,fontWeight:600}}>{data.testResults.length}</span>
              </button>
              {uniqueModes.map(key => {
                const info = getModeInfo(key === '__global__' ? null : key);
                const count = data.testResults.filter(r => normFilterMode(r.mode) === key).length;
                return (
                  <button
                    key={key}
                    className={`ph-filter-chip${modeFilter===key?' ph-filter-chip--active':''}`}
                    onClick={() => { setMode(key); setShow(PAGE_SIZE); }}
                  >
                    <img src={info.icon} width={13} height={13} alt="" style={{imageRendering:'pixelated'}}/>
                    {info.label}
                    <span style={{opacity:0.55,fontWeight:600}}>{count}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Results rows */}
          {filteredResults.length === 0 ? (
            <div className="ph-empty">
              <div className="ph-empty-icon"><Trophy size={30}/></div>
              <p>No test results{modeFilter !== '__all__' ? ' for this mode' : ''}</p>
            </div>
          ) : (
            <div className="ph-results-list">
              {visibleResults.map((r, i) => {
                const info = getModeInfo(r.mode);
                const bar  = tierBarColor(r.tier);
                return (
                  <div
                    key={r.id}
                    className="ph-result-row"
                    style={{'--ph-bar': bar, animationDelay:`${i*22}ms`} as React.CSSProperties}
                  >
                    <div className="ph-result-bar"/>

                    <div className="ph-result-icon">
                      <img src={info.icon} width={26} height={26} alt={info.label} style={{imageRendering:'pixelated'}}/>
                    </div>

                    <div className="ph-result-info">
                      <div className="ph-result-mode">
                        {info.label}
                        {r.isHighTier && <span className="ph-high-tier-dot" style={{marginLeft:8}}>HT</span>}
                      </div>
                      <div className="ph-result-meta">
                        {r.testerName && (
                          <span className="ph-result-tester">
                            <span className="ph-result-tester-label">by</span>
                            {r.testerName}
                          </span>
                        )}
                        {r.ticketType && (
                          <span className={`ph-result-type${r.ticketType==='givetier'?' ph-result-type--givetier':' ph-result-type--test'}`}>
                            {r.ticketType === 'givetier' ? 'Given' : r.ticketType === 'hightier' ? 'High-Tier' : 'Test'}
                          </span>
                        )}
                        {r.region && (
                          <span style={{fontSize:'0.60rem',color:'#374166',letterSpacing:'0.06em'}}>
                            {r.region}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="ph-result-tier">
                      <HistoryTierBadge rawTier={r.tier}/>
                    </div>

                    <div className="ph-result-date">
                      {formatRelDate(r.createdAt)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredResults.length > showCount && (
            <button className="ph-show-more" onClick={() => setShow(c => c + PAGE_SIZE)}>
              <ChevronDown size={14}/>
              Show more ({filteredResults.length - showCount} remaining)
            </button>
          )}
        </>
      )}

      {/* ══ PUNISHMENTS TAB ══ */}
      {!loading && !error && data && activeTab === 'punishments' && (
        <>
          {punishments.length === 0 ? (
            <div className="ph-empty">
              <div className="ph-empty-icon"><Shield size={30}/></div>
              <p>No punishments on record</p>
            </div>
          ) : (
            <div className="ph-punish-list">
              {punishments.map((p, i) => {
                const cfg = getPunishCfg(p.type);
                const dur = formatDuration(p.durationMs);
                return (
                  <div
                    key={p.id}
                    className="ph-punish-card"
                    style={{
                      '--ph-punish-accent': cfg.color,
                      '--ph-punish-bg':     cfg.bg,
                      '--ph-punish-border': cfg.border,
                      '--ph-punish-orb':    cfg.orb,
                      '--ph-punish-color':  cfg.color,
                      animationDelay: `${i*30}ms`,
                    } as React.CSSProperties}
                  >
                    <div className="ph-punish-orb"/>

                    <div className="ph-punish-icon-box" style={{
                      background: cfg.bg,
                      border: `1px solid ${cfg.border}`,
                    }}>
                      {cfg.emoji}
                    </div>

                    <div className="ph-punish-info">
                      <div className="ph-punish-type-row">
                        <span className="ph-punish-type-label" style={{color: cfg.color}}>
                          {cfg.label}
                        </span>
                        <span className={`ph-punish-status${p.active?' ph-punish-status--active':' ph-punish-status--pardoned'}`}>
                          {p.active ? 'Active' : 'Pardoned'}
                        </span>
                        {dur && <span className="ph-punish-duration">{dur}</span>}
                      </div>
                      {p.reason && (
                        <div className="ph-punish-reason" title={p.reason}>
                          "{p.reason}"
                        </div>
                      )}
                      <div className="ph-punish-meta">
                        <span className="ph-punish-date">
                          <Calendar size={9}/>
                          {new Date(p.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                        </span>
                        {p.moderatorName && (
                          <span className="ph-punish-by">
                            <Shield size={9}/>
                            {p.moderatorName}
                          </span>
                        )}
                        {!p.active && p.pardonedAt && (
                          <span className="ph-punish-pardon-tag">
                            <Check size={9}/>
                            Pardoned {formatRelDate(p.pardonedAt)}
                            {p.pardonedBy && ` by ${p.pardonedBy}`}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="ph-punish-right">
                      <div className="ph-punish-date-right">{formatRelDate(p.createdAt)}</div>
                      {p.expiresAt && p.active && (
                        <div style={{fontSize:'0.60rem',color:'#f59e0b'}}>
                          expires {formatRelDate(p.expiresAt)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
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
        <div className="ppv2-bg-fade"/>

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
                  <div className="ppv2-meta-sep"/>
                  <div className="ppv2-meta-item">
                    <span className="ppv2-meta-val">{rank > 0 ? `#${rank}` : '—'}</span>
                    <span className="ppv2-meta-lbl">rank</span>
                  </div>
                </div>

                {/* Decorative bottom rule */}
                <div className="ppv2-right-bottom-deco" aria-hidden="true">
                  <div className="ppv2-deco-line"/>
                  <div className="ppv2-deco-diamond"/>
                  <div className="ppv2-deco-line"/>
                </div>
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

      {/* ── History section ── */}
      <PlayerHistorySection username={player.username}/>
    </div>
  );
}
