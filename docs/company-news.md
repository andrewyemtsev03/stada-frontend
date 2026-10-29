# Company news

`frontend/news.html` lists news for the active site country. `frontend/news-article.html?id=...` opens a full article for that same country. Country selection uses the existing domain and locale system, including `new.stada.md`.

News entries live in `frontend/js/site/news-data.js`. Each entry has a unique `id`, a two-letter `country` code, local `images`, and `translations` containing a title and an array of paragraphs. An article is shown only when its country and language both match. No cross-country or cross-language article fallback is used.

The initial Moldova article is `ximluci-moldova`. Its Russian and Romanian titles and paragraphs are copied verbatim from the supplied `Conferința anuală a oftalmologilor din Moldova.docx`. All four supplied photographs are stored under `frontend/assets/news/moldova/ximluci/`. No event date or publication date was supplied, so none is invented. September 2026 remains in the article text as provided.

Navigation labels and empty states are localized in `frontend/js/site/news-labels.js`. Countries without supplied articles show an empty state. Adding a news article currently requires updating this repository and deploying the change; this change does not add news editing to the admin application.

The Kazakhstan article `health-report-2026-ai-kazakhstan`, dated 7 October 2026, contains the full supplied Kazakh and Russian STADA Health Report 2026 press releases as website text. Only spacing defects from the source documents are corrected. It includes section headings, the report link, media contact, and a generated conceptual hero illustration with a localized AI disclosure. Optional `headingIndices`, `excerpt`, `date`, `heroImage`, `imageAlt`, and `imageCaption` fields preserve compatibility with existing articles.

The Uzbekistan article `health-report-2026-digital-uzbekistan`, also dated 7 October 2026, uses the full supplied Uzbek and Russian press releases. Source spacing defects and the Russian job-title typo are corrected without changing the findings. It reuses the conceptual digital-health illustration with Uzbek and Russian disclosure captions. Neither country article appears on another country's site.

## January 2026 releases (added 29 October 2026)

- `top-employer-2026-kazakhstan` (Kazakhstan only, RU + KZ, 15 January 2026) — full Top Employer 2026 press release, including the "About STADA Arzneimittel AG" block and both contact blocks. Paragraphs may contain line breaks (`\n`); the article view keeps them, so multi-line contact blocks stay one paragraph. The card image `assets/news/kazakhstan/top-employer-2026.png` is the existing Top Employer Kazakhstan 2026 badge on a square canvas.
- `iqvia-otc-leader-2025-kazakhstan` (Kazakhstan only, RU + KZ, 20 January 2026) — IQVIA Leading Retail OTC Corporation 2025.
- `iqvia-otc-leader-2025-azerbaijan` (Azerbaijan only, AZ + RU, 20 January 2026) — IQVIA OTC market leader 2025 and Kardiomagnil.

No photos were supplied for the IQVIA releases, so they temporarily use the existing STADA office photos (`stada-headquarters-01.jpg`, `stada-headquarters-02.jpg`). Only spacing defects were corrected (for example `88% - ға`, `IQVIA - дан`), plus the missing closing `»` after Simona Berger's quote in the Kazakh Top Employer text. Wording is otherwise as supplied.

Article paragraphs now link e-mail addresses and `www.`/`https://` addresses automatically. Phrases that should link elsewhere go in the translation's optional `links` array, e.g. `{ "text": "@STADA Eurasia", "href": "https://www.linkedin.com/company/stada-eurasia/" }`.

## Media mentions ("Мы в СМИ")

Third-party coverage lives in `STADA_MEDIA_MENTIONS` at the end of `frontend/js/site/news-data.js` and is shown below the company news on `news.html`. Each entry has `id`, `country`, ISO `date`, `lang` (language of the supplied copy), `source` (host name), `url`, `title` and `text` (array of paragraphs). Entries are not translated: a country's mentions appear in every language of that site, newest first, and each card opens the original article in a new tab. The section is hidden on sites without mentions. The heading and link label are localized as `media_title` and `media_read` in `news-labels.js` and each country's content file.

The initial nine entries come from the supplied media spreadsheet (stada.kz: 5, stada.uz: 3, stada.az: 1). "Читать далее..." and a dangling footnote marker `[1]` were removed; the headline's trailing full stop is dropped.
