import { useState, useEffect } from 'react';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || 'https://eaf5f4cd-1a77-4dba-80ac-7500213340a4-00-2z4cutntv6hop.riker.replit.dev';

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

export function useLiveResults(): UseResultsResult {
  const [results, setResults] = useState<TierResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = () => {
      fetch(`${API_BASE}/api/results/live`)
        .then(r => r.json())
        .then(data => {
          setResults(data.results ?? []);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    };
    load();
    const interval = setInterval(load, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return { results, loading, error };
}

export function useHighTierResults(): UseResultsResult {
  const [results, setResults] = useState<TierResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = () => {
      fetch(`${API_BASE}/api/results/high-tier`)
        .then(r => r.json())
        .then(data => {
          setResults(data.results ?? []);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  return { results, loading, error };
}

/** Returns a human-readable time difference like "2 min ago" */
export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
