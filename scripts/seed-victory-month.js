// scripts/seed-victory-month.js
// ─────────────────────────────────────────────────────────────────────────────
// One-shot loader for the Victory Month Prayer Bulletin 2026 content.
//
// Reads ./victory-month-2026.json — { book: {…}, entries: [{…}, …] } — and:
//   1. UPSERTs the `books` row (ON CONFLICT slug DO UPDATE).
//   2. UPSERTs each `book_entries` row keyed by (book_id, entry_number,
//      entry_type) so re-running after a content tweak is safe.
//
// Idempotent. Safe to run multiple times — the second run re-applies any
// content edits without creating duplicates.
//
// Usage:
//   DATABASE_URL=postgres://... node scripts/seed-victory-month.js
//   (or just `node scripts/seed-victory-month.js` if backend/.env is set)
// ─────────────────────────────────────────────────────────────────────────────

const path = require('path');
const fs   = require('fs');

// Load .env from the backend directory regardless of cwd.
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const db = require('../db');

const SEED_PATH = path.resolve(__dirname, 'victory-month-2026.json');

async function main() {
  if (!fs.existsSync(SEED_PATH)) {
    console.error(`[seed] missing JSON file: ${SEED_PATH}`);
    process.exit(1);
  }
  const raw  = fs.readFileSync(SEED_PATH, 'utf8');
  const data = JSON.parse(raw);
  const { book, entries } = data;

  if (!book?.slug || !book?.title) {
    console.error('[seed] book.slug and book.title are required.');
    process.exit(1);
  }
  if (!Array.isArray(entries)) {
    console.error('[seed] entries must be an array.');
    process.exit(1);
  }

  console.log(`[seed] loading "${book.title}" (${book.slug}) — ${entries.length} entries`);

  // 1. Upsert the book row. On conflict, refresh metadata so cover/title edits
  //    in the JSON propagate without manual SQL.
  const bookResult = await db.query(`
    INSERT INTO books (
      slug, title, subtitle, description, cover_image_url, cover_emoji,
      accent_color, route_screen, available, sort_order, language
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT (slug) DO UPDATE SET
      title           = EXCLUDED.title,
      subtitle        = EXCLUDED.subtitle,
      description     = EXCLUDED.description,
      cover_image_url = EXCLUDED.cover_image_url,
      cover_emoji     = EXCLUDED.cover_emoji,
      accent_color    = EXCLUDED.accent_color,
      route_screen    = EXCLUDED.route_screen,
      available       = EXCLUDED.available,
      sort_order      = EXCLUDED.sort_order,
      language        = EXCLUDED.language,
      updated_at      = NOW()
    RETURNING id
  `, [
    book.slug,
    book.title,
    book.subtitle || null,
    book.description || null,
    book.cover_image_url || null,
    book.cover_emoji || '📖',
    book.accent_color || '#1A56DB',
    book.route_screen || 'BookReader',
    book.available !== false,
    Number.isFinite(book.sort_order) ? book.sort_order : 100,
    book.language || 'en',
  ]);

  const bookId = bookResult.rows[0].id;
  console.log(`[seed] book id=${bookId}`);

  // 2. Upsert every entry. Same shape as the admin endpoint's INSERT … ON
  //    CONFLICT … DO UPDATE so editing one row in the JSON file mirrors the
  //    admin UI's edit flow.
  let inserted = 0;
  for (const e of entries) {
    if (!Number.isFinite(e.entry_number)) {
      console.warn('[seed] skipping entry without entry_number:', e.focus?.slice(0, 60));
      continue;
    }
    await db.query(`
      INSERT INTO book_entries (
        book_id, entry_number, entry_type, entry_date,
        focus, scripture_text, inspirational_message,
        prayer_points, special_intercession, hymn,
        discussion_questions, declarations, sort_order
      )
      VALUES ($1, $2, $3, $4::date, $5, $6, $7, $8::jsonb, $9, $10::jsonb, $11::jsonb, $12::jsonb, $13)
      ON CONFLICT (book_id, entry_number, entry_type) DO UPDATE SET
        entry_date            = EXCLUDED.entry_date,
        focus                 = EXCLUDED.focus,
        scripture_text        = EXCLUDED.scripture_text,
        inspirational_message = EXCLUDED.inspirational_message,
        prayer_points         = EXCLUDED.prayer_points,
        special_intercession  = EXCLUDED.special_intercession,
        hymn                  = EXCLUDED.hymn,
        discussion_questions  = EXCLUDED.discussion_questions,
        declarations          = EXCLUDED.declarations,
        sort_order            = EXCLUDED.sort_order
    `, [
      bookId,
      e.entry_number,
      e.entry_type || 'daily',
      e.entry_date || null,
      e.focus || null,
      e.scripture_text || null,
      e.inspirational_message || null,
      JSON.stringify(e.prayer_points || []),
      e.special_intercession || null,
      e.hymn ? JSON.stringify(e.hymn) : null,
      e.discussion_questions ? JSON.stringify(e.discussion_questions) : null,
      e.declarations ? JSON.stringify(e.declarations) : null,
      Number.isFinite(e.sort_order) ? e.sort_order : 100,
    ]);
    inserted++;
  }

  console.log(`[seed] upserted ${inserted}/${entries.length} entries`);
  console.log('[seed] done.');
  process.exit(0);
}

main().catch((err) => {
  console.error('[seed] FAILED:', err.message);
  console.error(err.stack);
  process.exit(1);
});
