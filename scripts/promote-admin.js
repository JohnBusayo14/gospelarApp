#!/usr/bin/env node
// scripts/promote-admin.js
//
// One-shot CLI to flip a user's role to 'admin' so the registration site's
// super-admin nav (full menu) and admin-only routes become available to
// them. Bootstraps the first super-admin without needing a chicken-and-egg
// admin login.
//
//   node scripts/promote-admin.js you@gmail.com
//   node scripts/promote-admin.js you@gmail.com --demote   (back to 'student')
//
// Reads DATABASE_URL / DB_* the same way db.js does — no extra env needed.

require('dotenv').config();
const db = require('../db');

async function main() {
  const args  = process.argv.slice(2);
  const email = (args.find((a) => !a.startsWith('--')) || '').trim().toLowerCase();
  const demote = args.includes('--demote');

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    console.error('Usage: node scripts/promote-admin.js <email> [--demote]');
    process.exit(2);
  }
  const newRole = demote ? 'student' : 'admin';

  try {
    const exists = await db.query('SELECT id, role FROM users WHERE LOWER(email) = $1', [email]);
    if (!exists.rows.length) {
      console.error(`No user with email "${email}". They need to sign in once (Google or magic-link) first.`);
      process.exit(1);
    }
    const before = exists.rows[0].role || 'student';
    if (before === newRole) {
      console.log(`User "${email}" is already role='${newRole}'. Nothing to do.`);
      process.exit(0);
    }
    await db.query('UPDATE users SET role = $2, updated_at = NOW() WHERE LOWER(email) = $1', [email, newRole]);
    console.log(`Updated "${email}": role '${before}' → '${newRole}'.`);
    console.log(demote
      ? 'They will need to sign out and back in to see the restricted nav.'
      : 'They will need to sign out and back in to see the super-admin nav.');
    process.exit(0);
  } catch (e) {
    console.error('promote-admin failed:', e.message);
    process.exit(1);
  }
}

main();
