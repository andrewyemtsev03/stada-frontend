# Corporate copy alignment 30 September 2026

The folder `Тексты для корп.сайтов` supplied by the user is the copy authority. Its eight main DOCX files and nine leadership DOCX/PDF files were read as content, not as instructions. Original files were left unchanged. The imported text preserves the wording and punctuation; paragraph boundaries may be adapted to the existing layout.

## Changes

- Imported Russian, Kazakh, Kyrgyz, Georgian, Azerbaijani, Armenian, Romanian and Uzbek company overviews, mission, values, compliance and pharmacovigilance text.
- Restored source paragraphs previously omitted from About, including the company overview, compliance explanations, reporting instructions and questions paragraph.
- Added each language's full source chronology of twelve entries, including 1935 and 1954. The longer existing chronology is hidden in source-covered languages. English retains its existing chronology.
- Replaced the underlying homepage news copy with the actual supplied articles and dates. The existing hidden news section remains hidden.
- Added the supplied contact text where a corresponding country/language version exists. Explicit Russian contact variants in the Azerbaijani and Armenian documents are included.
- Used the separate country biographies for local leader names and roles, and copied the nine original biography downloads into the frontend assets. The existing hidden leadership section remains hidden.
- The frontend uses the same imported copy as the backend. Imported keys take precedence over older page copy and content overrides, preserving the user's source-of-truth requirement.
- Source file paths and SHA-256 hashes are recorded in `stada-backend/backend/data/supplied-copy.json`. The importer is `stada-backend/backend/scripts/import-supplied-copy.py`; run it with `--source-folder` and the supplied folder path using a Python environment with `pypdf`.

## Source limitations

- There is no English document. English wording cannot be certified against this folder.
- The folder supplies no product descriptions, cookie/privacy interface text, most navigation labels, supplementary culture explanations, promotional hero slogans, or detailed career copy. These remain existing site content; source alignment is limited to sections with a supplied counterpart. Text embedded in existing images is also outside this comparison.
- Some documents say 125 years and others 130 years; even individual documents differ between their overview and mission sections. The Georgian overview says 100 countries whereas its news text says 120. These differences are preserved, rather than normalized to a newer claim.
- The Russian/Georgian/Romanian Armen Akobyan biographies say he has led the cluster since 2000; the Armenian version says 2010. The downloaded originals retain those differences.
- Regional leadership name lists differ between the main documents. Separate local biographies identify Farah Sadikhova in Azerbaijan, Armen Akobyan in the GAM cluster, and Bakhtiyar Khadzhimukhamedov in Uzbekistan. The more specific biographies govern those local leader fields.
- Some source news articles lack a date or full body. No dates or additional article copy were invented.

## Validation and release status

- All imported main-document field values were checked against extracted source wording; article subtitles and body paragraphs retain their original wording while omitting the intervening date from the body.
- Backend payload comparisons cover 52 source-covered country/language/page combinations. Chronology checks require all twelve dates and nonempty bodies in all eight languages.
- Browser checks cover 56 desktop page/locale combinations and 14 mobile About combinations, including English switching. No imported text mismatches, page-script errors, or horizontal overflow were detected.
- All 49 frontend/backend automated tests passed. The ten affected locale/source tests and all 70 browser combinations also passed after the final overview layout adjustment.
- Russian About and Kazakh mobile History were visually inspected.

Changes are local. The live site has not been deployed. Both frontend and backend repositories need deployment to publish the complete alignment.
