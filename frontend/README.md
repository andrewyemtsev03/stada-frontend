# STADA public website

Static, country-aware public website for STADA Kazakhstan, Georgia, Kyrgyzstan,
Armenia, Azerbaijan, Moldova, and Uzbekistan.

## Structure

- `index.html`, `culture.html`, `history.html`, and `contacts.html` are the main
  pages.
- `products/` contains the product catalogue and product detail page.
- `css/`, `js/`, and `assets/` contain the site styles, behavior, and media.
- `vercel.json` configures the existing Vercel deployment.
- `staticwebapp.config.json` configures the planned Azure Static Web Apps
  deployment.

The application lives in the repository's `frontend` folder. HTML files are
shared templates. A build fills them with country and language content before
publication, so visitors and crawlers receive complete pages immediately.

## Local development

Use Node.js 22 or newer, then run from `frontend`:

```sh
npm ci
npm run build
npm test
npm run preview -- --country kz
```

The preview opens at `http://127.0.0.1:4173`. Choose `kz`, `kg`, `ge`, `az`,
`am`, `md`, or `uz`. Language URLs are explicit, for example `/ru/index.html`
and `/kz/index.html`. Browser language preferences do not replace the URL locale.

Regular builds and public pages need no content API, database, or admin panel.
The original unbuilt templates still contain legacy scripts; publish the build
output, not the raw source folder.

## Editing

- Change layout in the shared HTML templates, styles in `css/`, and interactions
  in `js/`. Rebuild to apply the change to every country.
- Edit public text in `content/countries/<country-code>.json`. Each file contains
  `locales.<language>.text` for shared copy and `locales.<language>.pages` for
  page-specific text, images, and settings. Page overrides take precedence.
- Country/domain/language configuration lives in `content/countries.json`.
- Company news is in `js/site/news-data.js`; contact data used by the interactive
  globe and static contact card is in `js/worldwide/countries-data.js`.
- Product payloads live in `locales.<language>.products`. A nonempty collection
  enables that country's products navigation, homepage section, catalog, and
  individual static pages. Countries without products keep the section hidden.
- Georgia includes Essentiale Forte 300 mg, Essentiale Max 600 mg, Guttalax
  15 ml and 30 ml, Phosphalugel, Enterogermina 2 billion and Forte 4 billion
  suspensions, Enterogermina 6 billion oral powder, No-Spa 40 mg (24 and 100
  tablets), and No-Spa Forte 80 mg (24 tablets) in Georgian and English. Supplied packshots
  and unchanged Georgian leaflets live in `assets/georgia-products/`; both
  languages link to the original Georgian instructions. The packaging approval
  PDF and multi-side reference photo are not published as patient leaflets.

`npm run content:import -- --api <public-api-url>` is an optional migration tool,
not part of a build. It overwrites the country content files with public API
copy. Do not use it after making frontend content edits unless overwriting them
is intended. Without `--api`, it imports local supplied copy from the sibling
backend repository and omits database edits and products.

## Deployment

For Vercel, keep the project root at `frontend`. `vercel.json` configures
`npm ci`, `npm run build`, output `dist`, and host-based routing to the seven
generated sites. Development domains have `X-Robots-Tag: noindex, nofollow`.
Review updates on `dev`, then merge into `main` to publish the production sites.

For PS.kz or another static host, run:

```sh
npm run build
npm run export:country -- kz
```

Upload the **contents** of `export/kz` to the Kazakhstan domain's document root.
Repeat with each country code for the other domains. The export includes HTML,
CSS, JavaScript, and shared assets; the hosting server does not need Node.js or
a database. Configure the domain's HTTPS and `index.html` handling with the host.
The historic `worldwide.html` to `contacts.html` redirect must be configured on
hosts that do not read `vercel.json`.

Generated pages include per-language canonical URLs, language alternatives,
descriptions, structured page data, and country sitemaps. Generated folders,
dependencies, and exports are ignored by Git.
## Vercel Web Analytics

All public pages load `js/site/analytics.js`. The loader starts Vercel's
same-origin tracking script only when the visitor allows the analytics category
in the existing privacy preferences. Withdrawing that choice blocks subsequent
events. Localhost is excluded. The loader is included in the generated pages.

Enable Web Analytics for the project in Vercel, then redeploy the `frontend`
folder. Visit the deployed site, accept analytics, and check the Analytics tab.
Vercel provides `/_vercel/insights/script.js`; do not add that file to the repo.
This integration requires Vercel hosting and will not collect analytics on the
planned Azure deployment.
