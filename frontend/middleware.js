// Password lock for products awaiting approval (Vercel Routing Middleware, runs on the server).
//
// A product marked `"locked": true` in content/countries/<code>.json is deployed with the site, but its
// page (and, unless the slug is public somewhere else, its own assets, CSS and JS) is only sent after
// the password is entered. Everything else on the site passes straight through. The list comes from
// content/locked.json, which the build regenerates.
//
// Environment variables (Vercel project settings, never in the repository):
//   LOCK_PASSWORD  the password given to legal and product managers
//   LOCK_SECRET    random signing key for the session cookie (changing it logs everyone out)
//   LOCK_SESSION_DAYS  optional, default 14
// Without them, locked pages answer 503 and stay closed; the rest of the site keeps working.
//
// stada.kz is not served by Vercel; its export gets the same lock as a PHP gate (tools/export-country.cjs).

export const config = { matcher: '/:path*' };

export { default } from './tools/lock/lock.mjs';
