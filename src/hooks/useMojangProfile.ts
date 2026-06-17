import { useState, useEffect } from 'react';

/* ══════════════════════════════════════════════════════════════════════════
   UUID OVERRIDES
   ─────────────────────────────────────────────────────────────────────────
   Use this to permanently fix any player whose Minecraft account was renamed
   AND whose UUID is missing or wrong in the backend.

   HOW TO FIX A BROKEN PLAYER (name/skin not updating):
   1. Find their permanent Minecraft UUID:
        → https://namemc.com/search?q=OLDNAME  (click the profile → copy UUID)
        → https://laby.net/@OLDNAME             (UUID shown in the URL / profile)
        → https://api.mojang.com/users/profiles/minecraft/NEWNAME
   2. Add ONE line below: 'stored-backend-username': 'their-uuid-here'
      UUID format: 32 hex chars, dashes optional.
   3. Push — name + skin will update automatically everywhere on the site.

   IMPORTANT: The key is the username currently stored in the BACKEND DB,
   NOT the player's new name. The value is the permanent UUID (never changes).
   ══════════════════════════════════════════════════════════════════════════ */
export const UUID_OVERRIDES: Record<string, string> = {
  // Example — uncomment and fill in when a player renames:
  // 'karajic': 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  //
  // HOW TO FIND: go to https://namemc.com/search?q=karajic
  // or ask the player for their UUID directly.
};

export interface MojangProfile { username: string; uuid: string; }
interface CacheEntry   { profile: MojangProfile | null; expiry: number; }

const _cache = new Map<string, CacheEntry>();
const TTL    = 5 * 60 * 1000; // 5-minute in-memory cache

function withTimeout(url: string, ms = 7000): Promise<Response> {
  const ctrl = new AbortController();
  const id   = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(id));
}

/** Resolve current Minecraft username + UUID from Mojang (playerdb → ashcon → mojang). */
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

  // ── Fallback 1: Ashcon proxy ──────────────────────────────────────────
  try {
    const r = await withTimeout(
      `https://api.ashcon.app/mojang/v2/user/${encodeURIComponent(identifier)}`
    );
    if (r.ok) {
      const d = await r.json();
      if (d?.username) return set({ username: d.username, uuid: d.uuid ?? '' });
    }
  } catch { /* timeout / offline */ }

  // ── Fallback 2: Official Mojang API (username lookups only) ──────────
  // Only try this for username-style identifiers (no dashes/32-char UUID)
  const isUuid = /^[0-9a-f-]{32,36}$/i.test(identifier);
  if (!isUuid) {
    try {
      const r = await withTimeout(
        `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(identifier)}`
      );
      if (r.ok) {
        const d = await r.json();
        if (d?.name) return set({ username: d.name, uuid: d.id ?? '' });
      }
    } catch { /* timeout / offline */ }
  }

  return set(null); // all sources failed — keep existing display name as-is
}

/**
 * React hook: returns the *current* Mojang profile for a player.
 * Starts with the backend values immediately (no flash), then silently
 * updates once the Mojang lookup resolves.
 *
 * UUID_OVERRIDES takes priority over the stored UUID so admins can
 * fix renamed players with a single line in this file.
 *
 * Resolution order (UUID always preferred — it never changes after rename):
 *   1. UUID_OVERRIDES[storedUsername]  — admin override
 *   2. storedUuid                      — backend-stored UUID
 *   3. storedUsername                  — fallback (fails for renamed accounts)
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
    const overrideUuid = UUID_OVERRIDES[storedUsername.toLowerCase()];
    const uuid         = overrideUuid || storedUuid;
    // Always prefer UUID lookup — resolves renamed accounts transparently
    const identifier   = uuid || storedUsername;

    // Spread requests 0–300 ms so many rows don't hammer the API at once
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
