# RTNStore

A Minecraft-themed store for accounts ($9.99–$49.99) and capes ($0.99–$1.99, all redeemable by code), with an iOS-style UI, Clerk authentication, a live admin panel and Telegram checkout to **@rtnstores**.

## Features
- **Pages:** Home, Accounts, Capes (with a code redemption box), Cart, Admin (opened from the Settings button), Sign in / Sign up.
- **Settings button on every page:** an iOS-style sheet with sound effects toggle, light/dark/system appearance, Telegram support, sign in/out and (for admins) the Admin Panel.
- **Live stock:** storefront polls every few seconds; the admin panel every 3 seconds.
- **Checkout:** stock is reserved in a database transaction (rejected if insufficient), an order with a unique payment ID (`RTN-…`) is saved, and Telegram opens with a prefilled message to @rtnstores containing the items, total and payment ID.
- **Admin panel:** add/edit/delete items with live preview, adjust stock up/down, hide items, create redeem codes for capes, update order status, and add/remove admins with real-time access. Default admins: `domauff757@gmail.com`, `rtnjerry27@gmail.com`, `rathanakny2006@gmail.com`.
- **UX:** iOS-like grouped lists, frosted glass bars, mobile tab bar, smooth scroll (Lenis), synthesized tap/pop/success sounds (Web Audio, no files).

## Tech
Next.js 16 (App Router), React 19, Clerk, Postgres via Drizzle ORM (Netlify Database adapter), Tailwind CSS 4, Lenis, lucide-react.

## Environment
See `.env.example`. Required: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `ADMIN_EMAILS`. On Netlify the database connection is provided automatically.

## Run locally
```
npm install
netlify dev --port 8889
```

## Deploying to Vercel
1. Import the repo in Vercel (framework preset: Next.js; build command `next build`).
2. Create a Postgres database (Neon, Supabase, Vercel Postgres, etc.) and add its connection string as `NETLIFY_DB_URL`.
3. Create the tables by running the SQL in `netlify/database/migrations/*/migration.sql` against that database once (e.g. `psql "$NETLIFY_DB_URL" -f netlify/database/migrations/<folder>/migration.sql`).
4. Add the Clerk keys and `ADMIN_EMAILS`. Products and admins are seeded automatically on the first request.

## Custom domain with Cloudflare DNS
1. Add your domain to Cloudflare and switch the registrar's nameservers to Cloudflare's.
2. In your host, add the custom domain (e.g. `rtnstore.com` and `www.rtnstore.com`).
3. In Cloudflare → DNS, create:
   - **Netlify:** `CNAME www → minecraft-store-2a07a3.netlify.app` and `CNAME @ → minecraft-store-2a07a3.netlify.app` (Cloudflare flattens the apex CNAME).
   - **Vercel:** `A @ → 76.76.21.21` and `CNAME www → cname.vercel-dns.com`.
4. Set the records to **DNS only** (grey cloud) until the host has issued the SSL certificate; you can enable the proxy afterwards with SSL mode **Full (strict)**.
5. For Clerk production, run `npx -y clerk@latest deploy --mode agent --domain <your-domain>` and add the DNS records it prints to Cloudflare.
