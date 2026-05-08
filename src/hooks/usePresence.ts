import { useEffect, useState } from 'react';

const PRESENCE_BASE = (import.meta.env.VITE_PRESENCE_URL as string | undefined)
  || 'https://outertiers-api.onrender.com/api';
const HEARTBEAT_MS = 20000;

function getOrCreateClientId(): string {
  try {
    const KEY = 'ot_pid';
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return `anon-${Math.random().toString(36).slice(2, 10)}`;
  }
}

export function usePresence() {
  const [online, setOnline] = useState<number>(1);

  useEffect(() => {
    const cid = getOrCreateClientId();
    let cancelled = false;

    const beat = async () => {
      try {
        const res = await fetch(`${PRESENCE_BASE}/presence`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: cid }),
        });
        if (!res.ok) throw new Error('presence not available');
        const data = await res.json();
        if (!cancelled && typeof data.online === 'number') {
          setOnline(Math.max(1, data.online));
        }
      } catch {
        if (!cancelled) setOnline(o => o);
      }
    };

    beat();
    const t = window.setInterval(beat, HEARTBEAT_MS);
    const onVis = () => { if (document.visibilityState === 'visible') beat(); };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelled = true;
      window.clearInterval(t);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return online;
}

