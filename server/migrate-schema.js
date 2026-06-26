import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await pool.query(`
  CREATE TABLE IF NOT EXISTS players (
    id          SERIAL PRIMARY KEY,
    user_id     TEXT NOT NULL,
    guild_id    TEXT NOT NULL,
    username    TEXT NOT NULL UNIQUE,
    uuid        TEXT,
    region      TEXT,
    current_tier TEXT,
    peak_tier   TEXT,
    sword_tier  TEXT,
    speed_tier  TEXT,
    pot_tier    TEXT,
    nethop_tier TEXT,
    ogvanilla_tier TEXT,
    vanilla_tier TEXT,
    uhc_tier    TEXT,
    axe_tier    TEXT,
    mace_tier   TEXT,
    smp_tier    TEXT,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`);

console.log('Schema applied successfully.');
await pool.end();
