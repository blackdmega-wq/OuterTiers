import { useState, useEffect } from 'react';

/* ══════════════════════════════════════════════════════════════════════════
   UUID OVERRIDES
   ─────────────────────────────────────────────────────────────────────────
   Use this to permanently fix any player whose Minecraft account was renamed
   AND whose UUID is missing (empty) in the backend.

   HOW TO FIX A BROKEN PLAYER:
   1. Find their Minecraft UUID → ask the player, or look on namemc.com / laby.net
   2. Add one line: 'old-backend-username': 'their-uuid'
   3. Push — name + skin will update automatically everywhere on the site.

   UUID format: 32 hex chars, with or without dashes.
   ══════════════════════════════════════════════════════════════════════════ */
export const UUID_OVERRIDES: Record<string, string> = {
  // 'karajic': 'paste-karajic-uuid-here',
};

export interface MojangProfile { username: string; uuid: string; }
interface CacheEntry   { profile: MojangProfile | null; expiry: number; }

const _cache = new Map<string, CacheEntry>();
const TTL    = 5 * 60 * 1000; // cache entries expire after 5 minutes

function withTimeout(url: string, ms = 7000): Promise<Response> {
  const ctrl = new AbortController();
  const id   = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(id));
}

/** Resolve current Minecraft username + UUID from Mojang (playerdb → ashcon). */
export async function fetchMojangProfile(
  identifier: string
): Promise<MojangProfile | null> {
  const key = identifier.toLowerCase();
  const hit = _cache.get(key);
  if (hit && Date.now() < hit.expiry) return hit.profile;

  const set = (p: MojangProfile | null): MojangProfile | null => {
    _cache.set(key, { profile: p, expiry: Date.now() + TTL });
    return p;
  };

  // ── Primary: playerdb.co ─────────────────────────────────────────────
  try {
    const r = await withTimeout(
      `https://playerdb.co/api/player/minecraft/${encodeURIComponent(identifier)}`
    );
    if (r.ok) {
      const d = await r.json();
      const p = d?.data?.player;
      if (p?.username) return set({ username: p.username, uuid: p.id ?? '' });
    }
  } catch { /* timeout / offline */ }

  // ── Fallback: Ashcon proxy ────────────────────────────────────────────
  try {
    const r = await withTimeout(
      `https://api.ashcon.app/mojang/v2/user/${encodeURIComponent(identifier)}`
    );
    if (r.ok) {
      const d = await r.json();
      if (d?.username) return set({ username: d.username, uuid: d.uuid ?? '' });
    }
  } catch { /* timeout / offline */ }

  return set(null); // both failed — keep existing display name as-is
}

/**
 * React hook: returns the *current* Mojang profile for a player.
 * Starts with the backend values immediately (no flash), then silently
 * updates once the Mojang lookup resolves.
 *
 * UUID_OVERRIDES takes priority over the stored UUID so admins can
 * fix renamed players with a single line in this file.
 */
export function useLiveProfile(
  storedUsername: string,
  storedUuid: string
): MojangProfile {
  const [profile, setProfile] = useState<MojangProfile>({
    username: storedUsername,
    uuid:     storedUuid,
  });

  useEffect(() => {
    // Check override first so renamed players are found even with empty UUID
    const overrideUuid = UUID_OVERRIDES[storedUsername.toLowerCase()];
    const uuid         = overrideUuid || storedUuid;
    const identifier   = uuid || storedUsername;

    // Spread requests 0–300 ms so 100+ rows don't all hit the API at once
    const delay = Math.random() * 300;
    const timer = setTimeout(async () => {
      const p = await fetchMojangProfile(identifier);
      if (p) setProfile(p);
    }, delay);

    return () => clearTimeout(timer);
  }, [storedUsername, storedUuid]);

  return profile;
}

/** Daily cache-bust string so skin CDNs reload changed skins once per day. */
export const SKIN_DATE = new Date().toISOString().slice(0, 10);
