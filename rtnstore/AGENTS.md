# AGENTS.md

Read PLAN.md first; continue at the first unchecked milestone.

- Framework: Next.js 16 App Router (`app/`). Middleware file must be `proxy.ts` (Next 16). `auth()` is async; wrap Clerk `<Show>` in server components with `<Suspense>`. ClerkProvider goes inside `<body>`.
- Database: Netlify Database with `drizzle-orm@beta` / `drizzle-kit@beta`. Schema in `db/schema.ts`, client in `db/index.ts` (`drizzle` from `drizzle-orm/netlify-db`), migrations output to `netlify/database/migrations` via `drizzle.config.ts`. Never apply migrations manually.
- Admin access: real-time admins in DB `admins` table + default admin list (domauff757@gmail.com, rtnjerry27@gmail.com, rathanakny2006@gmail.com) + `ADMIN_EMAILS` env var; check server-side via `requireAdmin()` on every admin API.
- Stock changes on checkout must happen in a DB transaction (decrement, reject if insufficient).
- Checkout hands off to Telegram via `https://t.me/rtnstores?text=<encoded message with payment ID>`.
- Images live in `public/img/` (logo-512.png, hero.webp, account-*.webp, cape-*.webp) — use `next/image`. Product images must be site-relative paths (`/img/...`).
- DB client is lazy (`getDb()`) so builds work without a database connection.
- TypeScript pinned to 5.x. Package is ESM (`"type": "module"`).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
