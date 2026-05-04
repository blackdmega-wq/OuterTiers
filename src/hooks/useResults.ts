import { useState, useEffect, useRef } from 'react';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || 'https://outertiers-api.onrender.com';
const POLL_MS = 30_000;

export interface TierResult {
  id: number;
  guildId: string;
  userId: string;
  username: string;
  testerId: string | null;
  testerName: string | null;
  tier: string;
  mode: string | null;
  region: string | null;
  ticketType: string | null;
  isHighTier: boolean;
  createdAt: number;
}

interface UseResultsResult {
  results: TierResult[];
  loading: boolean;
  error: string | null;
}

function usePolledResults(endpoint: string): UseResultsResult {
  const [results, setResults] = useState<TierResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      if (document.hidden) return; // skip fetch when tab is hidden
      fetch(`${API_BASE}${endpoint}`)
        .then(r => r.json())
        .then(data => {
          if (cancelled) return;
          setResults(data.results ?? []);
          setLoading(false);
        })
        .catch(err => {
          if (cancelled) return;
          setError(err.message);
          setLoading(false);
        });
    };

    const schedule = () => {
      timerRef.current = setTimeout(() => { load(); schedule(); }, POLL_MS);
    };

    load();
    schedule();

    const onVisible = () => { if (!document.hidden) load(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [endpoint]);

  return { results, loading, error };
}

export function useLiveResults(): UseResultsResult {
  return usePolledResults('/api/results/live');
}

export function useHighTierResults(): UseResultsResult {
  return usePolledResults('/api/results/high-tier');
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
