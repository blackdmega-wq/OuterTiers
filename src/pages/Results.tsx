import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || 'https://outertiers-api.onrender.com';

interface TierResult {
  id: number;
  username: string;
  testerName: string | null;
  tier: string;
  mode: string | null;
  region: string | null;
  ticketType: string | null;
  isHighTier: boolean;
  createdAt: number;
}

const TIER_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  HT1: { color: '#f0c040', bg: 'rgba(240,192,64,0.15)', border: 'rgba(240,192,64,0.5)' },
  LT1: { color: '#f0c040', bg: 'rgba(240,192,64,0.08)', border: 'rgba(240,192,64,0.3)' },
  HT2: { color: '#7ab8ff', bg: 'rgba(91,164,245,0.15)', border: 'rgba(91,164,245,0.5)' },
  LT2: { color: '#7ab8ff', bg: 'rgba(91,164,245,0.08)', border: 'rgba(91,164,245,0.3)' },
  HT3: { color: '#5ddb78', bg: 'rgba(76,199,104,0.15)', border: 'rgba(76,199,104,0.5)' },
  LT3: { color: '#5ddb78', bg: 'rgba(76,199,104,0.08)', border: 'rgba(76,199,104,0.3)' },
  HT4: { color: '#cf97f8', bg: 'rgba(192,126,245,0.15)', border: 'rgba(192,126,245,0.5)' },
  LT4: { color: '#cf97f8', bg: 'rgba(192,126,245,0.08)', border: 'rgba(192,126,245,0.3)' },
  HT5: { color: '#888', bg: 'rgba(120,120,120,0.12)', border: 'rgba(120,120,120,0.35)' },
  LT5: { color: '#888', bg: 'rgba(120,120,120,0.08)', border: 'rgba(120,120,120,0.25)' },
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function modeLabel(mode: string | null): string {
  if (!mode) return 'Overall';
  const MAP: Record<string, string> = {
    sword: 'Sword', speed: 'Speed', pot: 'Pot', nethop: 'NethOP',
    ogvanilla: 'OG Vanilla',
    // 'vanilla' is used by test-ticket results (mapMode("Crystal") → "vanilla")
    // 'crystal' is used by /givetier results (normalizeMode("Crystal") → "crystal")
    // Both represent the Crystal gamemode on the website.
    vanilla: 'Crystal', crystal: 'Crystal',
    uhc: 'UHC', axe: 'Axe', mace: 'Mace', smp: 'SMP',
  };
  return MAP[mode.toLowerCase()] ?? mode;
}

export default function Results() {
  const [results, setResults] = useState<TierResult[]>([]);
  const [highTier, setHighTier] = useState<TierResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'live' | 'high'>('live');

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/results/live`).then(r => r.json()),
      fetch(`${API_BASE}/api/results/high-tier`).then(r => r.json()),
    ]).then(([live, high]) => {
      setResults(live.results ?? []);
      setHighTier(high.results ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const displayed = tab === 'live' ? results : highTier;

  return (
    <div className="rankings-page">
      <div className="rankings-page-header">
        <div className="rankings-page-header-glow" />
        <div className="rankings-header-inner">
          <div className="rankings-header-eyebrow">
            <span>📋</span>
            <span>Live Feed</span>
          </div>
          <h1 className="rankings-header-title">Tier Results</h1>
          <p className="rankings-header-sub">Recent tier assignments from the Discord bot.</p>
        </div>
      </div>

      <div className="rankings-container">
        <div className="results-tabs">
          <button
            className={`results-tab ${tab === 'live' ? 'active' : ''}`}
            onClick={() => setTab('live')}
          >
            🕐 Live Results
          </button>
          <button
            className={`results-tab ${tab === 'high' ? 'active' : ''}`}
            onClick={() => setTab('high')}
          >
            ⚡ High Tier
          </button>
        </div>

        {loading ? (
          <div className="rankings-loading">Loading results...</div>
        ) : displayed.length === 0 ? (
          <div className="rankings-empty">No tier results yet.</div>
        ) : (
          <div className="results-list">
            {displayed.map(r => {
              const tierStyle = TIER_COLORS[r.tier] ?? { color: '#888', bg: 'rgba(80,80,80,0.08)', border: 'rgba(80,80,80,0.25)' };
              return (
                <div key={r.id} className="result-card">
                  <div className="result-card-left">
                    <img
                      src={`https://mc-heads.net/avatar/${r.username}/40`}
                      alt={r.username}
                      width={40} height={40}
                      style={{ imageRendering: 'pixelated', borderRadius: 4, display: 'block', flexShrink: 0 }}
                      loading="lazy"
                    />
                    <div className="result-card-info">
                      <div className="result-card-name-row">
                        <Link to={`/player/${r.username}`} className="result-player-name">
                          {r.username}
                        </Link>
                        {r.region && (
                          <span className={`region-badge region-${r.region.toLowerCase()}`}>{r.region}</span>
                        )}
                      </div>
                      <div className="result-card-meta">
                        <span className="result-mode">{modeLabel(r.mode)}</span>
                        {r.testerName && (
                          <>
                            <span className="result-sep">·</span>
                            <span className="result-tester">by {r.testerName}</span>
                          </>
                        )}
                        <span className="result-sep">·</span>
                        <span className="result-time">{timeAgo(r.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div
                    className="result-tier-badge"
                    style={{ color: tierStyle.color, background: tierStyle.bg, borderColor: tierStyle.border }}
                  >
                    {r.tier}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
