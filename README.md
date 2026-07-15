# ReliefLink

**AI-assisted disaster & crisis resource coordination platform.**
Built for the House of Edtech Fullstack Developer assignment.

## Why this idea (not a CRUD/task app)

Disaster response has a real, well-documented coordination problem: requests
for help and offers of help both flood in fast, and the bottleneck is
**triage and matching**, not data entry. ReliefLink treats that as the core
product problem:

- People in crisis post a **help request** in plain language.
- Volunteers/donors post **resource offers** (shelter, food, medical, etc).
- **AI triages every request's urgency** (1–10 score + LOW/MEDIUM/HIGH/CRITICAL)
  from the free-text description, so critical cases surface immediately
  instead of sitting in a first-come-first-served queue.
- **AI suggests ranked, explained matches** between a request and candidate
  offers (pre-filtered by category in SQL to control cost), but a human
  **coordinator always confirms** — AI assists judgment, it doesn't replace it.
- A **coordinator assistant chat** helps with prioritization and drafting
  messages, grounded to the platform's domain.

This is deliberately not a to-do list: the CRUD (requests/offers) is table
stakes, and the actual product value is in the AI-assisted triage/matching
layer and the role-based coordination workflow around it.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, Server Actions) + TypeScript |
| UI | Tailwind CSS, small hand-built shadcn-style primitives |
| Database | PostgreSQL via Prisma ORM |
| Auth | Auth.js (NextAuth v5), credentials provider, bcrypt password hashing, JWT sessions |
| AI | Vercel AI SDK (`ai` + `@ai-sdk/openai`), structured output via `generateObject` — swappable to Groq/Gemini by changing the model provider in `src/lib/ai.ts` |
| Validation | Zod on every mutating endpoint |
| Testing | Vitest (unit) + Playwright (e2e) |
| CI/CD | GitHub Actions → Vercel |

## Getting started locally

```bash
npm install
cp .env.example .env      # fill in DATABASE_URL, AUTH_SECRET, OPENAI_API_KEY
npx prisma migrate dev --name init
npm run seed               # optional: creates demo accounts, see below
npm run dev
```

Generate `AUTH_SECRET` with:

```bash
openssl rand -base64 32
```

### Seeded demo accounts (after `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Coordinator | coordinator@relieflink.org | Password123! |
| Requester | requester@example.com | Password123! |
| Volunteer | volunteer@example.com | Password123! |

## Project structure

```
src/
  app/
    (auth)/login, (auth)/register    # public auth pages + server action
    dashboard/                       # role-aware overview
    dashboard/requests/[id]          # request detail, coordinator actions
    dashboard/resources              # offers list/create
    dashboard/admin                  # coordinator-only overview
    api/requests, api/resources      # CRUD REST endpoints
    api/ai/summarize, match, assistant  # AI endpoints
  components/                        # forms, navbar, footer, AI chat widget
  lib/
    auth.ts        # NextAuth config
    ai.ts           # AI SDK calls: triage, matching, assistant
    validation.ts   # all Zod schemas
    rbac.ts         # role/ownership guards used by every API route
    ratelimit.ts    # per-IP rate limiting
  middleware.ts     # route-level auth/role gating
prisma/schema.prisma # data model
tests/               # Vitest unit tests
e2e/                 # Playwright end-to-end test
```

## Security & authorization

See [`SECURITY.md`](./SECURITY.md) for the full threat-model discussion
(auth, input validation, rate limiting, AI-specific risks like prompt
injection, and real-world contingencies). Summary: two-layer RBAC
(middleware + per-route ownership checks), Zod validation on every
mutation, bcrypt password hashing, parameterized queries via Prisma, and
AI output is always structured + human-reviewed before it changes real
state.

## Testing

```bash
npm run test          # Vitest unit tests (validation logic)
npm run test:e2e       # Playwright e2e (register → post request → verify)
```

CI runs both against a real Postgres service container on every PR (see
`.github/workflows/ci.yml`).

## Deployment

The GitHub Actions workflow lints, type-checks, tests, and builds on every
PR, then deploys to Vercel on merge to `main`. To wire this up yourself:

1. Create a project on [Vercel](https://vercel.com) linked to this repo.
2. Add a managed Postgres database (Vercel Postgres, Neon, or Supabase all
   work) and set `DATABASE_URL` in Vercel's environment variables.
3. Set `AUTH_SECRET`, `NEXTAUTH_URL` (your production URL), and
   `OPENAI_API_KEY` in Vercel's environment variables.
4. Add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` as GitHub repo
   secrets so the Actions workflow can deploy.
5. Run `npx prisma migrate deploy` against production (or let Vercel's
   build step do it — `vercel.json`'s build command already runs
   `prisma generate`; add a release-phase migration step for your chosen
   host if it supports one).

## Before you submit

- Fill in your real name, GitHub, and LinkedIn URLs in
  `src/components/Footer.tsx` (marked with a `TODO` comment).
- Update `.env` with your own AI provider key — this repo's demo prompts
  work with any OpenAI-compatible endpoint, including Groq (swap
  `baseURL`) or Gemini (swap the `@ai-sdk/openai` import for the Gemini
  provider package).
- Run `npm run build` once locally against a real database to confirm a
  clean production build before deploying.
