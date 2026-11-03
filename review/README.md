# STADA review site

A password-protected copy of the Kazakhstan site for approving new product pages with legal and
brand managers before they go public.

- Vercel project: `stada-review` (root directory `review/`, framework Other).
- Build: `npm run build` here runs the frontend build with `--review` into `review/dist`.
- Access: `middleware.js` (Vercel Routing Middleware) checks every request on the server. Without a
  session cookie only the password page is returned. Environment variables on the project:
  `REVIEW_PASSWORD` (the password), `REVIEW_SECRET` (random signing key), optional
  `REVIEW_SESSION_DAYS` (default 14). Changing `REVIEW_SECRET` logs everyone out.
- The public sites (`project-s`, `stada-dev`, PS.kz exports) do not use this folder.

## Workflow for a new product

1. Add the product to `frontend/content/countries/<code>.json` with `"review": true` and push it to
   `feature/products`. Public builds skip it entirely (no page, card, menu link or sitemap entry).
2. Share the review link and password with legal and brand. The page is at
   `/ru/products/<slug>.html` and `/kz/products/<slug>.html` on the review site.
3. After approval, remove `"review": true`; the product appears on the public sites with the next
   release (`dev` → `main`, and the PS.kz export for stada.kz).
