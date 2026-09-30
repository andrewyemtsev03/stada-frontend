# Company news

`frontend/news.html` lists news for the active site country. `frontend/news-article.html?id=...` opens a full article for that same country. Country selection uses the existing domain and locale system, including `new.stada.md`.

News entries live in `frontend/js/site/news-data.js`. Each entry has a unique `id`, a two-letter `country` code, local `images`, and `translations` containing a title and an array of paragraphs. An article is shown only when its country and language both match. No cross-country or cross-language article fallback is used.

The initial Moldova article is `ximluci-moldova`. Its Russian and Romanian titles and paragraphs are copied verbatim from the supplied `Conferința anuală a oftalmologilor din Moldova.docx`. All four supplied photographs are stored under `frontend/assets/news/moldova/ximluci/`. No event date or publication date was supplied, so none is invented. September 2026 remains in the article text as provided.

Navigation labels and empty states are localized in `frontend/js/site/news-labels.js`. Countries without supplied articles show an empty state. Adding a news article currently requires updating this repository and deploying the change; this change does not add news editing to the admin application.
