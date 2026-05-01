# gospelarApp — Backend

Node.js + Express + PostgreSQL backend for the GOFAMINT Sunday School mobile app.

## What's in here

| File | Purpose |
|---|---|
| `server.js` | Express app — all routes (auth, lessons, units, quizzes, hymns, subscriptions, payments, teacher tools, translations, admin). Auto-creates the schema on boot. |
| `db.js` | Postgres pool wrapper. Reads connection details from environment variables. |
| `seed.js` | One-shot data seeder — categories, units, lessons, quizzes, hymns. Run when bootstrapping a new database. |
| `lessonsData.js` | Static lesson source content used by the seeder. |
| `.env.example` | Template for the required environment variables. Copy to `.env` and fill in. |

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# then edit .env with your real database credentials, admin secret, and Paystack key

# 3. Make sure PostgreSQL is running and the database exists
createdb gospeler   # or whatever DB_NAME you set in .env

# 4. (Optional) seed initial content
node seed.js

# 5. Run the server
node server.js
```

The server listens on `process.env.PORT` (default `5000`) and creates/migrates all tables on startup.

## Environment variables

See `.env.example`. Required:

- `PORT` — HTTP port
- `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_NAME`, `DB_PORT` — PostgreSQL connection
- `ADMIN_SECRET` — header value that protects every `/api/admin/*` route (sent as `x-admin-key`)
- `PAYSTACK_SECRET_KEY` — server-side key used to verify Paystack transactions

## API surface (high-level)

| Group | Routes |
|---|---|
| **Auth** | `POST /api/auth/register`, `/api/auth/login`, `/api/auth/validate-session` |
| **Content** | `GET /api/units`, `/api/units/:id/lessons`, `/api/lessons/:id`, `/api/lessons/preview`, `/api/quiz/:lessonId` |
| **Subscriptions** | `GET /api/subscription/plans`, `/api/subscription/status/:email`, `/api/subscription/can-access/:email/:catId`, `POST /api/verify-payment`, `POST /api/subscription/verify` |
| **Teacher tools** | `GET/POST /api/teacher/classes`, `/api/teacher/classes/:id/members`, `/api/teacher/classes/:id/add-student`, `/api/teacher/attendance`, `/api/teacher/marks`, `/api/teacher/progress` |
| **Translations** | `GET /api/translations/:lang`, `PUT /api/translations` (admin), `POST /api/admin/translations/seed` (admin) |
| **Admin** | All `/api/admin/*` — units, lessons, quizzes, hymns, banners, subscribers, pricing — protected by `x-admin-key` header |

## Notes

- This repo holds the backend only. The mobile client and admin dashboard live elsewhere.
- The schema is created idempotently on every boot via `CREATE TABLE IF NOT EXISTS …` blocks in `server.js`, so no separate migration step is needed for fresh installs.
