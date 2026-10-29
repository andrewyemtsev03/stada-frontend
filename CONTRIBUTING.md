# Working on the STADA sites

## Branches

| Branch | What it is | Deployed to |
| --- | --- | --- |
| `main` | What is live. Only changes merged through a pull request. | `stada.xx` (Vercel project `project-s`) |
| `dev` | Staging. A preview of `main` plus work under review. Nobody works on it directly. | `new.stada.xx` (Vercel project `stada-dev`) |
| `feature/…`, `content/…`, `fix/…` | One branch per piece of work, started from `main`. | Vercel preview URL only |

The rule that makes this work: **release features, not branches.** Each piece of
work goes to `main` on its own branch, so unfinished work in `dev` never blocks a
finished one.

## Everyday flow

1. Start from the latest `main`:

   ```sh
   git checkout main
   git pull
   git checkout -b content/press-releases-2026
   ```

   Name branches by purpose: `feature/products`, `content/media-mentions`,
   `fix/cookie-banner`.

2. Commit your work, then build and test locally from `frontend`:

   ```sh
   npm ci
   npm run build
   npm test
   ```

3. Push the branch. Preview it on staging by merging it into `dev`:

   ```sh
   git push -u origin content/press-releases-2026
   git checkout dev
   git pull
   git merge content/press-releases-2026
   git push
   ```

   Check it on `new.stada.xx`. If something needs fixing, fix it **on your
   branch** and merge the branch into `dev` again.

4. Release: open a pull request from **your branch** into `main` (not from `dev`).
   The "Build and test" check must be green and someone else should review it.
   Merging the pull request publishes it to `stada.xx`.

5. After a release, bring staging up to date: merge `main` into `dev`.

## Urgent changes

Same flow, just quicker: branch from `main`, pull request into `main`, then merge
`main` into `dev`. Do not copy commits between branches by hand
(`cherry-pick`); merging keeps one history and avoids duplicate commits.

## Long-running work (for example `feature/products`)

- Keep it on its own branch. Merge it into `dev` whenever you want to show it on
  staging.
- Every week or so, merge `main` into the feature branch so it does not drift
  far from what is live.
- When it is finished, open a pull request from the feature branch into `main`.

## Resetting staging

`dev` is disposable. If it collects abandoned experiments, rebuild it from `main`
and re-merge the branches that are still under review. Agree this with the team
first, because it rewrites `dev` for everyone:

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
