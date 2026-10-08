# STADA production and development

Both Vercel projects connect to `andrewyemtsev03/stada-frontend`.

| Setting | Production | Development |
| --- | --- | --- |
| Project | `project-s` | `stada-dev` |
| Production branch | `main` | `dev` |
| Root directory | `frontend` | `frontend` |
| Framework preset | Other | Other |
| Build command | `npm run build` | `npm run build` |
| Output directory | `dist` | `dist` |
| Custom domains | `stada.xx` | `new.stada.xx` |

The country domains are `stada.kz`, `stada.kg`, `stada.ge`, `stada.az`, `stada.am`, `stada.md`, and `stada.uz`. Development has six domains: `new.stada.kg`, `new.stada.ge`, `new.stada.az`, `new.stada.am`, `new.stada.md`, and `new.stada.uz`. `new.stada.kz` is intentionally excluded. The site selects the country from the hostname.

Push new work to `dev`. Review it on the development domains, then merge `dev` into `main` to release it. Do not push unfinished work to `main`. DNS changes should follow the exact values shown by Vercel for each domain.

Both branches build complete pages from checked-in public content snapshots.
The public sites do not use the backend or database to serve content. The backend
repository and its services have not been deleted or stopped.

The existing development project's root remains `frontend`. The repository's
`vercel.json` defines the install/build commands, output directory, and host
rewrites. Verify these settings on the next deployment if dashboard overrides
were previously enabled. See `frontend/README.md` for content editing, local
preview, and country exports for PS.kz.

Project creation, branch selection, and domain assignment are Vercel dashboard settings. On 2026-09-30, `stada-dev` was created, its Production environment branch tracking was saved as `dev`, and the six development domains were assigned to that environment. Vercel reported Valid Configuration for all six. No DNS records were changed. The initial deployment used frontend commit `737c039`.

