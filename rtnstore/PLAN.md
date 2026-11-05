# RTNStore Plan

1. [x] Project foundation: Next.js 16, Clerk, Netlify Database (Drizzle beta), Tailwind 4, Lenis, lucide icons.
2. [x] Brand and art in `public/img/` (webp) plus `app/icon.png`.
3. [x] Clerk keys and `ADMIN_EMAILS` configured.
4. [x] Database schema + migration (products, orders, redeem_codes). Products auto-seed on first request.
5. [x] App shell: iOS-style layout, settings sheet on every page, sound effects, smooth scroll, Clerk controls, `proxy.ts`.
6. [x] Pages: home, accounts, capes (+ redeem), cart.
7. [x] Checkout API with transactional stock decrement and Telegram handoff.
8. [x] Admin panel (via settings): inventory, add/edit with live preview, stock up/down, redeem codes, orders.
9. [x] Vercel and Cloudflare DNS docs in README.

Ideas next: image uploads to Blobs, real payment provider, order history page for shoppers.
