import { useState, useEffect } from 'react';
import type { Player } from '../data/players';
import { calculatePoints } from '../data/players';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || 'https://outertiers-api.onrender.com';

const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes — auto-check refresh window
const AUTO_REFRESH_MS = 3 * 60 * 1000; // re-fetch every 3 minutes automatically
let _cachedPlayers: Player[] | null = null;
let _cacheTime = 0;
let _inflight: Promise<Player[]> | null = null;

/** Force-invalidate cache so next usePlayers call re-fetches */
export function invalidatePlayerCache() {
  _cachedPlayers = null;
  _cacheTime = 0;
  _inflight = null;
}

function fetchPlayers(): Promise<Player[]> {
  if (_inflight) return _inflight;
  _inflight = fetch(`${API_BASE}/api/players`)
    .then(r => r.json())
    .then(data => {
      const mapped = (data.players ?? []).map((p: Player) => ({
        ...p,
        points: calculatePoints(p.rawTiers),
      }));
      _cachedPlayers = mapped;
      _cacheTime = Date.now();
      _inflight = null;
      return mapped;
    })
    .catch(err => {
      _inflight = null;
      throw err;
    });
  return _inflight;
}

interface UsePlayersResult {
  players: Player[];
  loading: boolean;
  error: string | null;
}

interface UsePlayerResult {
  player: Player | null;
  loading: boolean;
  error: string | null;
}

export function usePlayers(): UsePlayersResult {
  const fresh = _cachedPlayers && Date.now() - _cacheTime < CACHE_TTL_MS;
  const [players, setPlayers] = useState<Player[]>(fresh ? _cachedPlayers! : []);
  const [loading, setLoading] = useState(!fresh);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (_cachedPlayers && Date.now() - _cacheTime < CACHE_TTL_MS) {
      setPlayers(_cachedPlayers);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchPlayers()
      .then(mapped => { setPlayers(mapped); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  // ── AutoCheck: re-fetch every AUTO_REFRESH_MS so name / skin changes appear automatically ──
  useEffect(() => {
    const doRefresh = () => {
      invalidatePlayerCache();
      fetchPlayers()
        .then(mapped => setPlayers(mapped))
        .catch(() => {});
    };

    const intervalId = setInterval(doRefresh, AUTO_REFRESH_MS);

    // Also refresh immediately when the user switches back to this tab
    const handleVisibility = () => {
      if (!document.hidden && Date.now() - _cacheTime > 30_000) {
        doRefresh();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return { players, loading, error };
}

export function usePlayer(username: string | undefined): UsePlayerResult {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) { setLoading(false); return; }

    // Show cached data immediately as a fast placeholder
    if (_cachedPlayers) {
      const cached = _cachedPlayers.find(
        p => p.username.toLowerCase() === username.toLowerCase()
      );
      if (cached) {
        setPlayer(cached);
        // Don't return — always fetch individual endpoint for full tierDates
      }
    }

    // Always fetch the individual player endpoint to get complete data (incl. tierDates)
    fetch(`${API_BASE}/api/players/${encodeURIComponent(username)}`)
      .then(r => { if (!r.ok) throw new Error('Player not found'); return r.json(); })
      .then(data => {
        const full: Player = { ...data, points: calculatePoints(data.rawTiers) };
        setPlayer(full);
        setLoading(false);
        // Patch the cache so navigating away and back still shows full data
        if (_cachedPlayers) {
          const idx = _cachedPlayers.findIndex(
            p => p.username.toLowerCase() === username.toLowerCase()
          );
          if (idx >= 0) _cachedPlayers[idx] = full;
        }
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [username]);

  return { player, loading, error };
}
