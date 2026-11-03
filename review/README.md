# STADA review site

A password-protected copy of all seven country sites for approving new product pages with legal and
brand managers before they go public.

- Vercel project: `stada-review` (root directory `review/`, framework Other).
- Build: `npm run build` here runs the frontend build with `--review` into `review/dist`.
- Access: `middleware.js` (Vercel Routing Middleware) checks every request on the server. Without a
  session cookie only the password page is returned. Environment variables on the project:
  `REVIEW_PASSWORD` (the password), `REVIEW_SECRET` (random signing key), optional
  `REVIEW_SESSION_DAYS` (default 14). Changing `REVIEW_SECRET` logs everyone out.
- Addresses put the country first: `/<country>/<language>/...` (e.g. `/uz/ru/products/<slug>.html`,
  `/ge/ge/index.html`). The start page `/` lists every product on review with a link per language.
  Opening a country address remembers it in a cookie, so the site's own links (`/ru/about.html`,
  `/products/...`) stay on that country's site. Kazakhstan is the default.
- The public sites (`project-s`, `stada-dev`, PS.kz exports) do not use this folder.

## Workflow for a new product

1. Add the product to `frontend/content/countries/<code>.json` with `"review": true` and push it to
   `feature/products`. Public builds skip it entirely (no page, card, menu link or sitemap entry).
2. Share the review link and password with legal and brand. The page is at
   `/<country>/<language>/products/<slug>.html`, also linked from the start page.
3. After approval, remove `"review": true`; the product appears on the public sites with the next
   release (`dev` → `main` for the Vercel sites; stada.kz must stay on PS.kz under Kazakhstan law, so it
   gets a PS.kz export).
