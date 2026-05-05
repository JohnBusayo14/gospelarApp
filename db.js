const { Pool } = require('pg');
require('dotenv').config();

// ─────────────────────────────────────────────────────────────────────────────
// Two connection modes — pick whichever matches the deployment:
//
//   1. DATABASE_URL set       → use the full connection string (Supabase,
//                               Railway Postgres, Render Postgres, Heroku, etc.)
//                               SSL is enabled automatically — managed
//                               providers all require it.
//
//   2. DATABASE_URL not set   → fall back to individual DB_USER/DB_PASSWORD/
//                               DB_HOST/DB_NAME/DB_PORT (local dev convention).
//
// This means the same db.js works for local Postgres AND any cloud provider;
// you only ever change env vars between environments, never code.
// ─────────────────────────────────────────────────────────────────────────────
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      // Supabase, Render, and most managed Postgres require SSL but use
      // certs that aren't in Node's default CA bundle, so we accept them.
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      user:     process.env.DB_USER,
      host:     process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port:     process.env.DB_PORT,
    });

module.exports = {
  query: (text, params) => pool.query(text, params),
};
