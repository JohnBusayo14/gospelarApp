// scripts/seed-adult-quizzes.js
// ─────────────────────────────────────────────────────────────────────────────
// Bulk-seeds template quiz questions for every lesson with category_id='adult'.
//
// Each lesson gets up to 4 multiple-choice questions, derived from fields the
// lesson already carries (title, topic, memory_verse, memory_verse_passage,
// lesson_part). Distractors are drawn from sibling Adult lessons so the wrong
// answers are always plausibly Bible-adjacent rather than random nonsense.
//
// By default the script SKIPS any lesson that already has quiz questions, so
// re-running is safe and won't trample admin-authored content. Pass --force to
// delete existing questions for the targeted lessons and re-seed.
//
// Usage:
//   node scripts/seed-adult-quizzes.js
//   node scripts/seed-adult-quizzes.js --force
//   node scripts/seed-adult-quizzes.js --lesson 42        # one lesson only
//   node scripts/seed-adult-quizzes.js --dry-run          # print, don't write
// ─────────────────────────────────────────────────────────────────────────────

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const db = require('../db');

const argv = process.argv.slice(2);
const FORCE     = argv.includes('--force');
const DRY_RUN   = argv.includes('--dry-run');
const ONE_LESSON = (() => {
  const i = argv.indexOf('--lesson');
  if (i === -1) return null;
  const n = parseInt(argv[i + 1], 10);
  return Number.isFinite(n) ? n : null;
})();

const POINTS_PER_Q = 10;
const CATEGORY     = 'adult';
const LANG         = 'en';

// ── Deterministic shuffle so re-runs produce the same option ordering ────────
// for the same lesson. Uses lesson.id as the seed.
function seededShuffle(arr, seed) {
  const out = arr.slice();
  let s = seed | 0 || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Truncate long strings (memory verses can be a full paragraph) so options
// remain scannable in the quiz UI.
function clip(text, max = 90) {
  if (!text) return '';
  const t = String(text).replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + '…' : t;
}

// Pick `n` plausible distractors from `pool` that differ from `correct` (case-
// insensitive). Falls back to padding with the placeholder so we always return
// `n` items — the caller decides whether a thin pool is acceptable.
function pickDistractors(pool, correct, n, seed, placeholder = 'None of the above') {
  const norm = (s) => String(s || '').trim().toLowerCase();
  const want = norm(correct);
  const unique = Array.from(new Set(pool.map((s) => (s || '').trim()).filter(Boolean)))
    .filter((s) => norm(s) !== want);
  const picked = seededShuffle(unique, seed).slice(0, n);
  while (picked.length < n) picked.push(placeholder);
  return picked;
}

// Lay out the four options with the correct answer at a deterministic slot.
function layout(correct, distractors, seed) {
  const all = [correct, ...distractors];
  const shuffled = seededShuffle(all, seed);
  const idx = shuffled.findIndex((x) => x === correct);
  const keys = ['a', 'b', 'c', 'd'];
  return {
    options: {
      a: clip(shuffled[0]),
      b: clip(shuffled[1]),
      c: clip(shuffled[2]),
      d: clip(shuffled[3]),
    },
    correct_answer: keys[idx],
  };
}

// ── Question builders ────────────────────────────────────────────────────────
// Each returns null when the lesson lacks the source field, so the caller can
// skip and the lesson ends up with however many questions it can support.

function qMemoryVersePassage(lesson, pool, seed) {
  if (!lesson.memory_verse_passage) return null;
  const distractors = pool.passages.filter((p) => p !== lesson.memory_verse_passage);
  if (distractors.length < 3) return null;
  const { options, correct_answer } = layout(
    lesson.memory_verse_passage,
    pickDistractors(distractors, lesson.memory_verse_passage, 3, seed + 1),
    seed + 11,
  );
  return {
    question: `Which Bible passage is the memory verse for "${lesson.title}"?`,
    options,
    correct_answer,
  };
}

function qMemoryVerseText(lesson, pool, seed) {
  if (!lesson.memory_verse) return null;
  const correct = clip(lesson.memory_verse, 120);
  const distractors = pool.memoryVerses
    .filter((m) => clip(m, 120) !== correct)
    .map((m) => clip(m, 120));
  if (distractors.length < 3) return null;
  const { options, correct_answer } = layout(
    correct,
    pickDistractors(distractors, correct, 3, seed + 2),
    seed + 22,
  );
  return {
    question: `Which of these is the memory verse for "${lesson.title}"?`,
    options,
    correct_answer,
  };
}

function qLessonTopic(lesson, pool, seed) {
  if (!lesson.topic) return null;
  const correct = clip(lesson.topic, 140);
  const distractors = pool.topics
    .filter((t) => clip(t, 140) !== correct)
    .map((t) => clip(t, 140));
  if (distractors.length < 3) return null;
  const { options, correct_answer } = layout(
    correct,
    pickDistractors(distractors, correct, 3, seed + 3),
    seed + 33,
  );
  return {
    question: `What is the main topic of "${lesson.title}"?`,
    options,
    correct_answer,
  };
}

function qLessonPart(lesson, pool, seed) {
  // Use the first lesson_part's title as the correct answer; pull distractors
  // from other lessons' parts.
  const parts = Array.isArray(lesson.lesson_part) ? lesson.lesson_part : [];
  const firstTitle = parts[0]?.part_title;
  if (!firstTitle) return null;
  const distractors = pool.partTitles.filter((t) => t !== firstTitle);
  if (distractors.length < 3) return null;
  const { options, correct_answer } = layout(
    firstTitle,
    pickDistractors(distractors, firstTitle, 3, seed + 4),
    seed + 44,
  );
  return {
    question: `Which section heading appears in the lesson "${lesson.title}"?`,
    options,
    correct_answer,
  };
}

// ── Pool builder ─────────────────────────────────────────────────────────────
function buildPool(allLessons) {
  const passages     = [];
  const memoryVerses = [];
  const topics       = [];
  const partTitles   = [];
  for (const l of allLessons) {
    if (l.memory_verse_passage) passages.push(l.memory_verse_passage);
    if (l.memory_verse)         memoryVerses.push(l.memory_verse);
    if (l.topic)                topics.push(l.topic);
    const parts = Array.isArray(l.lesson_part) ? l.lesson_part : [];
    for (const p of parts) if (p?.part_title) partTitles.push(p.part_title);
  }
  return { passages, memoryVerses, topics, partTitles };
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  // Fetch all Adult lessons up front so we have a global pool for distractors.
  const where = ONE_LESSON
    ? `WHERE category_id = $1 AND id = $2`
    : `WHERE category_id = $1`;
  const params = ONE_LESSON ? [CATEGORY, ONE_LESSON] : [CATEGORY];

  const { rows: targetLessons } = await db.query(
    `SELECT id, title, topic, memory_verse, memory_verse_passage, lesson_part
       FROM lessons ${where}
   ORDER BY id ASC`,
    params,
  );

  if (targetLessons.length === 0) {
    console.log(`[seed] no Adult lessons found${ONE_LESSON ? ` for id=${ONE_LESSON}` : ''}.`);
    process.exit(0);
  }

  // Pool always comes from ALL Adult lessons, not just the targeted subset, so
  // distractors stay rich even when you re-seed a single lesson.
  const { rows: allAdult } = await db.query(
    `SELECT id, title, topic, memory_verse, memory_verse_passage, lesson_part
       FROM lessons WHERE category_id = $1`,
    [CATEGORY],
  );
  const pool = buildPool(allAdult);

  console.log(`[seed] ${targetLessons.length} lesson(s) to process; pool size: passages=${pool.passages.length}, memoryVerses=${pool.memoryVerses.length}, topics=${pool.topics.length}, partTitles=${pool.partTitles.length}`);

  let inserted = 0;
  let skipped  = 0;
  let deleted  = 0;

  for (const lesson of targetLessons) {
    // Check existing question count. Skip unless --force.
    const { rows: existing } = await db.query(
      `SELECT id FROM lesson_quizzes WHERE lesson_id = $1 AND category_id = $2 AND lang = $3`,
      [lesson.id, CATEGORY, LANG],
    );
    if (existing.length > 0) {
      if (!FORCE) {
        console.log(`[skip] lesson #${lesson.id} "${lesson.title}" already has ${existing.length} question(s).`);
        skipped++;
        continue;
      }
      if (!DRY_RUN) {
        const { rowCount } = await db.query(
          `DELETE FROM lesson_quizzes WHERE lesson_id = $1 AND category_id = $2 AND lang = $3`,
          [lesson.id, CATEGORY, LANG],
        );
        deleted += rowCount;
      } else {
        deleted += existing.length;
      }
    }

    // Generate questions. Skip nulls (lesson missing the source field) silently.
    const builders = [qMemoryVersePassage, qMemoryVerseText, qLessonTopic, qLessonPart];
    const questions = builders
      .map((fn) => fn(lesson, pool, lesson.id))
      .filter(Boolean);

    if (questions.length === 0) {
      console.log(`[warn] lesson #${lesson.id} "${lesson.title}" — no questions could be built (missing fields).`);
      continue;
    }

    for (const q of questions) {
      if (DRY_RUN) {
        console.log(`[dry] lesson #${lesson.id}: "${q.question}" (correct=${q.correct_answer})`);
      } else {
        await db.query(
          `INSERT INTO lesson_quizzes
             (lesson_id, question, options, correct_answer, points, category_id, lang)
           VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7)`,
          [lesson.id, q.question, JSON.stringify(q.options), q.correct_answer, POINTS_PER_Q, CATEGORY, LANG],
        );
      }
      inserted++;
    }
    console.log(`[ok]   lesson #${lesson.id} "${lesson.title}" → ${questions.length} question(s).`);
  }

  console.log(`\n[seed] done. inserted=${inserted} skipped=${skipped} deleted=${deleted}${DRY_RUN ? ' (DRY RUN — no writes)' : ''}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('[seed] fatal:', err);
  process.exit(1);
});
