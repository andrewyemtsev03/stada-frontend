# Working on the STADA sites

## Branches

The repository has exactly these five branches. Do not create others unless the
site owner explicitly asks.

| Branch | What goes on it | Deployed to |
| --- | --- | --- |
| `main` | What is live. Changes arrive only through pull requests. | `stada.xx` (Vercel project `project-s`) |
| `dev` | Staging, for the site owner to review. Never committed to directly; branches are merged into it. | `new.stada.xx` (Vercel project `stada-dev`) |
| `feature/products` | Everything about products: catalog, product pages, showcases, and their fixes. | Vercel preview URL only |
| `feature/news` | Company news and press content. | Vercel preview URL only |
| `smallfix` | Small fixes anywhere else: typos, styling, bugs, docs. | Vercel preview URL only |

## Rules for everyone (people and AI assistants)

- Pick the branch from the table above. Product work, including fixes to a
  product page, always goes on `feature/products`.
- **Never create a new branch.** If it is unclear which branch fits, ask.
- Never commit to `dev` or `main` directly.
- Pull the latest version of the branch before committing (`git pull`), and never
  `cherry-pick` between branches; merging keeps one history.

## Everyday flow

1. Switch to the right branch and bring it up to date:

   ```sh
   git checkout feature/products
   git pull
   ```

2. Commit your work, then build and test from `frontend`:

   ```sh
   npm ci
   npm run build
   npm test
   ```

3. Push, then merge the branch into `dev` so the site owner can see it on staging:

   ```sh
   git push
   git checkout dev
   git pull
   git merge feature/products
   git push
   ```

   If something needs changing, change it **on the same branch** and merge it
   into `dev` again.

4. Release (site owner): open a pull request from the branch into `main`. The
   "Build and test" check must be green. Merging the pull request publishes it.

5. After a release, merge `main` back into `dev` and into the other working
   branches so they stay close to what is live:

   ```sh
   git checkout dev && git pull && git merge origin/main && git push
   git checkout smallfix && git pull && git merge origin/main && git push
   ```

## Resetting staging

`dev` is disposable. If it collects abandoned experiments, rebuild it from `main`
and re-merge the branches still under review. This rewrites `dev` for everyone:

```sh
git checkout dev
git reset --hard origin/main
git merge feature/products     # each branch still under review
git push --force-with-lease
```

## Notes

- The site chooses the country from the domain. `new.stada.kz` is not set up
  (see `docs/vercel-environments.md`), so preview Kazakhstan changes locally with
  `npm run preview -- --country kz`. Per-branch Vercel preview URLs are not tied
  to a country, so use the staging domains or the local preview to check pages.
- Content editing rules are in `frontend/README.md` and `docs/company-news.md`.
