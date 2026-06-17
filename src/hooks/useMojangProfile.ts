import { useState, useEffect } from 'react';

/* ══════════════════════════════════════════════════════════════════════════
   FIXING A RENAMED PLAYER — NO CODE CHANGES NEEDED
   ─────────────────────────────────────────────────────────────────────────
   Edit  /public/uuid-overrides.json  directly on GitHub:
     1. Find player's current Minecraft name (ask them)
     2. Go to https://playerdb.co/api/player/minecraft/THEIR_NEW_NAME
     3. Copy the "id" value (their permanent UUID — never changes)
     4. Add: "old-stored-name": "their-uuid"  to the "overrides" object
     5. Click "Commit changes" on GitHub → site updates within minutes

   Code-level overrides below are a fallback only.
   ══════════════════════════════════════════════════════════════════════════ */
const CODE_OVERRIDES: Record<string, string> = {
  // 'karajic': 'paste-uuid-here',
};

export interface MojangProfile { username: string; uuid: string; }
interface CacheEntry { profile: MojangProfile | null; expiry: number; }

const _profileCache = new Map<string, CacheEntry>();
const PROFILE_TTL   = 5 * 60 * 1000;

/* ── Runtime override loader ─────────────────────────────────────────────
   Fetches /uuid-overrides.json once per session. Admins edit that file
   directly on GitHub — no code deployment required.                       */
let _overrides: Record<string, string> | null = null;
let _overridesLoading: Promise<Record<string, string>> | null = null;

async function loadOverrides(): Promise<Record<string, string>> {
  if (_overrides !== null) return _overrides;
  if (_overridesLoading)   return _overridesLoading;

  _overridesLoading = fetch('/uuid-overrides.json', { cache: 'no-cache' })
    .then(r => r.ok ? r.json() : {})
    .then((json: { overrides?: Record<string, string> }) => {
      const merged: Record<string, string> = { ...CODE_OVERRIDES };
      const entries: Record<string, string> = json?.overrides ?? {};
      for (const [k, v] of Object.entries(entries)) {
        if (k.startsWith('_')) continue; // skip comment keys
        if (typeof v === 'string' && v.length > 10 && !v.startsWith('xxx')) {
          merged[k.toLowerCase()] = v;
        }
      }
      _overrides = merged;
      _overridesLoading = null;
      return merged;
    })
    .catch(() => {
      _overrides = { ...CODE_OVERRIDES };
      _overridesLoading = null;
      return _overrides;
    });

  return _overridesLoading;
}

// Kick off the load immediately so it's ready before components mount
loadOverrides();

/* ── HTTP helpers ────────────────────────────────────────────────────────*/
function withTimeout(url: string, ms = 7000): Promise<Response> {
  const ctrl = new AbortController();
  const id   = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(id));
}

/** Resolve current Minecraft username + UUID from Mojang APIs. */
export async function fetchMojangProfile(
  identifier: string
): Promise<MojangProfile | null> {
  const key = identifier.toLowerCase();
  const hit = _profileCache.get(key);
  if (hit && Date.now() < hit.expiry) return hit.profile;

  const set = (p: MojangProfile | null): MojangProfile | null => {
    _profileCache.set(key, { profile: p, expiry: Date.now() + PROFILE_TTL });
    return p;
  };

  // Primary: playerdb.co
  try {
    const r = await withTimeout(
      `https://playerdb.co/api/player/minecraft/${encodeURIComponent(identifier)}`
    );
    if (r.ok) {
      const d = await r.json();
      const p = d?.data?.player;
      if (p?.username) return set({ username: p.username, uuid: p.id ?? '' });
    }
  } catch { /* timeout / network error */ }

  // Fallback 1: Ashcon proxy
  try {
    const r = await withTimeout(
      `https://api.ashcon.app/mojang/v2/user/${encodeURIComponent(identifier)}`
    );
    if (r.ok) {
      const d = await r.json();
      if (d?.username) return set({ username: d.username, uuid: d.uuid ?? '' });
    }
  } catch { /* timeout / network error */ }

  // Fallback 2: Official Mojang API (username lookups only, not UUID)
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
    } catch { /* timeout / network error */ }
  }

  return set(null);
}

/**
 * React hook — returns the *current* Mojang profile for a player.
 *
 * Resolution order (UUID-first so renames are transparent):
 *   1. uuid-overrides.json  override  (admin-editable on GitHub)
 *   2. CODE_OVERRIDES       override  (code-level fallback)
 *   3. storedUuid           from backend
 *   4. storedUsername       last resort (fails if player renamed without UUID)
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
    if (!storedUsername) return;
    let cancelled = false;

    const delay = Math.random() * 300; // stagger requests so many rows don't hammer the API
    const timer = setTimeout(async () => {
      const overrides  = await loadOverrides();
      const uuidFromOverride = overrides[storedUsername.toLowerCase()];
      const uuid       = uuidFromOverride || storedUuid;
      const identifier = uuid || storedUsername; // UUID-first = rename-safe

      const p = await fetchMojangProfile(identifier);
      if (p && !cancelled) setProfile(p);
    }, delay);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [storedUsername, storedUuid]);

  return profile;
}

/** Daily cache-bust string so skin CDNs reload changed skins once per day. */
export const SKIN_DATE = new Date().toISOString().slice(0, 10);
