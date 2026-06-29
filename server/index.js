import express from 'express';
import cors from 'cors';
import pg from 'pg';
import https from 'node:https';
import http from 'node:http';

const { Pool } = pg;
const app = express();
app.use(cors());
app.use(express.json());

const API_SECRET = process.env.WEBSITE_API_SECRET;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ── helpers ──────────────────────────────────────────────────────────────────

function rawTierToTLevel(raw) {
  if (!raw) return '-';
  const u = raw.toUpperCase();
  if (u.endsWith('1')) return 'T1';
  if (u.endsWith('2')) return 'T2';
  if (u.endsWith('3')) return 'T3';
  if (u.endsWith('4')) return 'T4';
  if (u.endsWith('5')) return 'T5';
  return '-';
}

function buildPlayer(p) {
  const rawTiers = {
    current:   p.current_tier,
    peak:      p.peak_tier,
    ogvanilla: p.ogvanilla_tier,
    vanilla:   p.vanilla_tier,
    uhc:       p.uhc_tier,
    pot:       p.pot_tier,
    nethop:    p.nethop_tier,
    smp:       p.smp_tier,
    sword:     p.sword_tier,
    axe:       p.axe_tier,
    mace:      p.mace_tier,
    speed:     p.speed_tier,
  };
  return {
    id:          String(p.id),
    username:    p.username,
    uuid:        p.uuid ?? '',
    region:      p.region ?? 'EU',
    tiers: {
      ogvanilla: rawTierToTLevel(p.ogvanilla_tier),
      vanilla:   rawTierToTLevel(p.vanilla_tier),
      uhc:       rawTierToTLevel(p.uhc_tier),
      pot:       rawTierToTLevel(p.pot_tier),
      nethop:    rawTierToTLevel(p.nethop_tier),
      smp:       rawTierToTLevel(p.smp_tier),
      sword:     rawTierToTLevel(p.sword_tier),
      axe:       rawTierToTLevel(p.axe_tier),
      mace:      rawTierToTLevel(p.mace_tier),
      speed:     rawTierToTLevel(p.speed_tier),
    },
    rawTiers,
    currentTier: rawTierToTLevel(p.current_tier),
    peakTier:    rawTierToTLevel(p.peak_tier),
    updatedAt:   p.updated_at,
  };
}

function checkSecret(req, res) {
  if (API_SECRET && req.body?.secret !== API_SECRET) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

// ── Mojang UUID sync ──────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchJson(url, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers: { 'User-Agent': 'OuterTiers-Server/1.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: null }); }
      });
    });
    req.setTimeout(timeoutMs, () => { req.destroy(); reject(new Error('timeout')); });
    req.on('error', reject);
  });
}

async function resolveFromMojang(identifier) {
  try {
    const r = await fetchJson(`https://playerdb.co/api/player/minecraft/${encodeURIComponent(identifier)}`);
    if (r.status === 200 && r.body?.data?.player?.username) {
      return { username: r.body.data.player.username, uuid: r.body.data.player.id ?? '' };
    }
  } catch { /* ignore */ }

  try {
    const r = await fetchJson(`https://api.ashcon.app/mojang/v2/user/${encodeURIComponent(identifier)}`);
    if (r.status === 200 && r.body?.username) {
      return { username: r.body.username, uuid: r.body.uuid ?? '' };
    }
  } catch { /* ignore */ }

  const isUuid = /^[0-9a-f-]{32,36}$/i.test(identifier);
  if (!isUuid) {
    try {
      const r = await fetchJson(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(identifier)}`);
      if (r.status === 200 && r.body?.name) {
        return { username: r.body.name, uuid: r.body.id ?? '' };
      }
    } catch { /* ignore */ }
  }

  return null;
}

async function runMojangSync() {
  console.log('[MojangSync] Starting scheduled UUID/name sync...');
  let updated = 0;
  let skipped = 0;
  let failed  = 0;

  try {
    const { rows } = await pool.query('SELECT id, username, uuid FROM players ORDER BY id ASC');
    console.log(`[MojangSync] Syncing ${rows.length} players...`);

    for (const player of rows) {
      try {
        const identifier = (player.uuid && player.uuid.length > 10) ? player.uuid : player.username;
        const profile = await resolveFromMojang(identifier);

        if (!profile) { failed++; continue; }

        const nameChanged = profile.username.toLowerCase() !== player.username.toLowerCase();
        const uuidMissing = !player.uuid || player.uuid.length < 10;
        const uuidChanged = player.uuid && profile.uuid && player.uuid.replace(/-/g, '') !== profile.uuid.replace(/-/g, '');

        if (nameChanged || uuidMissing || uuidChanged) {
          await pool.query(
            'UPDATE players SET username = $1, uuid = $2, updated_at = now() WHERE id = $3',
            [profile.username, profile.uuid, player.id]
          );
          console.log(`[MojangSync] Updated: ${player.username} -> ${profile.username} (uuid: ${profile.uuid})`);
          updated++;
        } else {
          skipped++;
        }
      } catch (e) {
        console.error(`[MojangSync] Error for ${player.username}:`, e.message);
        failed++;
      }
      await sleep(200);
    }

    console.log(`[MojangSync] Done — updated: ${updated}, unchanged: ${skipped}, failed: ${failed}`);
  } catch (e) {
    console.error('[MojangSync] Fatal error:', e.message);
  }
}

setTimeout(() => runMojangSync(), 30_000);
setInterval(() => runMojangSync(), 6 * 60 * 60 * 1000);

// ── routes ───────────────────────────────────────────────────────────────────

app.get('/api/healthz', (_req, res) => res.json({ status: 'ok' }));

app.post('/api/sync-mojang', async (req, res) => {
  if (!checkSecret(req, res)) return;
  res.json({ ok: true, message: 'Mojang sync started in background' });
  runMojangSync().catch(() => {});
});

app.get('/api/players', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM players ORDER BY updated_at DESC');
    res.json({ players: rows.map(buildPlayer) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/players/:username', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM players WHERE LOWER(username) = LOWER($1) LIMIT 1',
      [req.params.username]
    );
    if (!rows.length) return res.status(404).json({ error: 'Player not found' });
    res.json(buildPlayer(rows[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/migrate', async (req, res) => {
  if (!checkSecret(req, res)) return;
  const players = req.body?.players;
  if (!Array.isArray(players) || players.length === 0)
    return res.status(400).json({ error: 'players array required' });

  let inserted = 0;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const p of players) {
      if (!p.username || !p.userId || !p.guildId) continue;
      await client.query(`
        INSERT INTO players
          (user_id, guild_id, username, uuid, region, current_tier, peak_tier,
           sword_tier, speed_tier, pot_tier, nethop_tier, ogvanilla_tier,
           vanilla_tier, uhc_tier, axe_tier, mace_tier, smp_tier, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,now())
        ON CONFLICT (username) DO UPDATE SET
          user_id=EXCLUDED.user_id, guild_id=EXCLUDED.guild_id,
          uuid=COALESCE(EXCLUDED.uuid, players.uuid),
          region=EXCLUDED.region,
          current_tier=EXCLUDED.current_tier,
          peak_tier=EXCLUDED.peak_tier,
          sword_tier=EXCLUDED.sword_tier,
          speed_tier=EXCLUDED.speed_tier,
          pot_tier=EXCLUDED.pot_tier,
          nethop_tier=EXCLUDED.nethop_tier,
          ogvanilla_tier=EXCLUDED.ogvanilla_tier,
          vanilla_tier=EXCLUDED.vanilla_tier,
          uhc_tier=EXCLUDED.uhc_tier,
          axe_tier=EXCLUDED.axe_tier,
          mace_tier=EXCLUDED.mace_tier,
          smp_tier=EXCLUDED.smp_tier,
          updated_at=now()
      `, [
        p.userId, p.guildId, p.username, p.uuid ?? null,
        p.region ?? null, p.currentTier ?? null, p.peakTier ?? null,
        p.swordTier ?? null, p.speedTier ?? null, p.potTier ?? null,
        p.nethopTier ?? null, p.ogvanillaTier ?? null, p.vanillaTier ?? null,
        p.uhcTier ?? null, p.axeTier ?? null, p.maceTier ?? null, p.smpTier ?? null,
      ]);
      inserted++;
    }
    await client.query('COMMIT');

    await pool.query(`
      DELETE FROM players
      WHERE sword_tier IS NULL AND speed_tier IS NULL AND pot_tier IS NULL
        AND nethop_tier IS NULL AND ogvanilla_tier IS NULL AND vanilla_tier IS NULL
        AND uhc_tier IS NULL AND axe_tier IS NULL AND mace_tier IS NULL AND smp_tier IS NULL
    `);

    res.json({ ok: true, inserted });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

// ── Webhook: tier / region update from Discord bot ───────────────────────────
//
// KEY FIX: region is now ALWAYS force-overwritten when explicitly provided
// (was previously COALESCE which could silently keep the old value in edge cases).
// This guarantees /verify and /setplayerregion immediately update the website.
//
app.post('/api/webhook/tier', async (req, res) => {
  if (!checkSecret(req, res)) return;
  const { username, userId, guildId, mode, tier, currentTier, peakTier, region } = req.body ?? {};
  if (!username || !userId || !guildId)
    return res.status(400).json({ error: 'username, userId, guildId required' });

  const MODE_MAP = {
    sword: 'sword_tier', speed: 'speed_tier', pot: 'pot_tier',
    nethop: 'nethop_tier', ogvanilla: 'ogvanilla_tier', vanilla: 'vanilla_tier',
    uhc: 'uhc_tier', axe: 'axe_tier', mace: 'mace_tier', smp: 'smp_tier',
  };

  try {
    const modeCol = mode ? MODE_MAP[mode.toLowerCase().replace(/[\s_]+/g, '')] : null;
    const params  = [userId, guildId, username, region ?? null, currentTier ?? null, peakTier ?? null];
    if (modeCol) params.push(tier ?? null);

    await pool.query(`
      INSERT INTO players
        (user_id, guild_id, username, region, current_tier, peak_tier${modeCol ? ', ' + modeCol : ''}, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6${modeCol ? ',$7' : ''},now())
      ON CONFLICT (username) DO UPDATE SET
        user_id      = EXCLUDED.user_id,
        guild_id     = EXCLUDED.guild_id,
        region       = CASE WHEN EXCLUDED.region IS NOT NULL THEN EXCLUDED.region ELSE players.region END,
        current_tier = COALESCE(EXCLUDED.current_tier, players.current_tier),
        peak_tier    = COALESCE(EXCLUDED.peak_tier, players.peak_tier)
        ${modeCol ? `, ${modeCol} = EXCLUDED.${modeCol}` : ''},
        updated_at   = now()
    `, params);

    console.log(`[webhook/tier] ${username} region=${region ?? '-'} currentTier=${currentTier ?? '-'} mode=${mode ?? '-'}`);
    res.json({ ok: true });
  } catch (e) {
    console.error('[webhook/tier] error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── start ─────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`OuterTiers API running on port ${PORT}`));
