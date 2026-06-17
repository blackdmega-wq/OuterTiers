import { useState, useEffect } from 'react';

/* ══════════════════════════════════════════════════════════════════════════
   FIXING A RENAMED PLAYER — NO CODE CHANGES NEEDED
   ─────────────────────────────────────────────────────────────────────────
   Edit  /public/uuid-overrides.json  directly on GitHub:

   "overrides": maps old stored username → permanent UUID
     → fixes skin + display name everywhere automatically

   "aliases": maps player's NEW name → old stored username
     → fixes search: typing "clawmc" finds "karajic" in the backend

   HOW TO ADD AFTER A RENAME:
     1. Ask the player for their new Minecraft name
     2. Go to https://playerdb.co/api/player/minecraft/NEWNAME → copy "id"
     3. In overrides: add  "oldname": "the-uuid"
     4. In aliases:   add  "newname": "oldname"
     5. Commit on GitHub → live within minutes, no deployment needed
   ══════════════════════════════════════════════════════════════════════════ */
const CODE_OVERRIDES: Record<string, string> = {};
const CODE_ALIASES:   Record<string, string> = {};

export interface MojangProfile { username: string; uuid: string; }
interface CacheEntry { profile: MojangProfile | null; expiry: number; }

const _profileCache = new Map<string, CacheEntry>();
const PROFILE_TTL   = 5 * 60 * 1000;

/* ── Config loader ───────────────────────────────────────────────────────
   Fetches /uuid-overrides.json once. Returns { overrides, aliases }.     */
interface RuntimeConfig {
  overrides: Record<string, string>;
  aliases:   Record<string, string>;
}

let _config: RuntimeConfig | null = null;
let _configLoading: Promise<RuntimeConfig> | null = null;

function parseEntries(raw: Record<string, string> | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw ?? {})) {
    if (k.startsWith('_')) continue;
    if (typeof v === 'string' && v.length > 1) out[k.toLowerCase()] = v;
  }
  return out;
}

export async function loadConfig(): Promise<RuntimeConfig> {
  if (_config) return _config;
  if (_configLoading) return _configLoading;

  _configLoading = fetch('/uuid-overrides.json', { cache: 'no-cache' })
    .then(r => r.ok ? r.json() : {})
    .then((json: { overrides?: Record<string, string>; aliases?: Record<string, string> }) => {
      _config = {
        overrides: { ...CODE_OVERRIDES, ...parseEntries(json?.overrides) },
        aliases:   { ...CODE_ALIASES,   ...parseEntries(json?.aliases)   },
      };
      _configLoading = null;
      return _config;
    })
    .catch((): RuntimeConfig => {
      _config = { overrides: { ...CODE_OVERRIDES }, aliases: { ...CODE_ALIASES } };
      _configLoading = null;
      return _config;
    });

  return _configLoading;
}

/**
 * If `searchedName` is an alias for a stored backend username, returns
 * the stored name. Otherwise returns null.
 * Use this in PlayerProfile to redirect "clawmc" → "karajic".
 */
export async function resolveAlias(searchedName: string): Promise<string | null> {
  const { aliases } = await loadConfig();
  return aliases[searchedName.toLowerCase()] ?? null;
}

// Kick off load immediately so config is ready before components mount
loadConfig();

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
 *   1. uuid-overrides.json overrides (admin-editable on GitHub, no deploy needed)
 *   2. storedUuid from backend
 *   3. storedUsername — last resort (fails if renamed without UUID)
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

    const delay = Math.random() * 300;
    const timer = setTimeout(async () => {
      const { overrides } = await loadConfig();
      const uuidOverride  = overrides[storedUsername.toLowerCase()];
      const uuid          = uuidOverride || storedUuid;
      const identifier    = uuid || storedUsername;

      const p = await fetchMojangProfile(identifier);
      if (p && !cancelled) setProfile(p);
    }, delay);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [storedUsername, storedUuid]);

  return profile;
}

/** Daily cache-bust string so skin CDNs reload changed skins once per day. */
export const SKIN_DATE = new Date().toISOString().slice(0, 10);
