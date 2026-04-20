import { useState, useEffect } from 'react';
import type { Player } from '../data/players';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || 'https://outertiers-api.onrender.com';

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
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/players`)
      .then(r => r.json())
      .then(data => {
        setPlayers(data.players ?? []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { players, loading, error };
}

export function usePlayer(username: string | undefined): UsePlayerResult {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${API_BASE}/api/players/${encodeURIComponent(username)}`)
      .then(r => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then(data => {
        setPlayer(data);
        setLoading(false);
      })
      .catch(() => {
        setPlayer(null);
        setLoading(false);
      });
  }, [username]);

  return { player, loading, error };
}
