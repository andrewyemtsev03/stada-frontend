# STADA production and development

Both Vercel projects connect to `andrewyemtsev03/stada-frontend`.

| Setting | Production | Development |
| --- | --- | --- |
| Project | Existing production project | `stada-dev` |
| Production branch | `main` | `dev` |
| Root directory | `frontend` | `frontend` |
| Framework preset | Other | Other |
| Build command | None | None |
| Output directory | Root directory | Root directory |
| Custom domains | `stada.xx` | `new.stada.xx` |

The country domains are `stada.kz`, `stada.kg`, `stada.ge`, `stada.az`, `stada.am`, `stada.md`, and `stada.uz`. Development uses the corresponding `new.` subdomains. The site selects the country from the hostname.

Push new work to `dev`. Review it on the development domains, then merge `dev` into `main` to release it. Do not push unfinished work to `main`. DNS changes should follow the exact values shown by Vercel for each domain.

The backend remains in the separate `andrewyemtsev03/stada-backend` repository and has a corresponding `dev` branch. A frontend branch does not create a separate backend or database: the current frontend still uses the configured Azure/Render public APIs. Backend deployment and database changes need their own environment configuration.

Project creation, branch selection, and domain assignment are Vercel dashboard settings. This file records the intended configuration; it is not confirmation that those settings have been applied.
