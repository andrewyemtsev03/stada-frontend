# STADA language audit — 30 September 2026

Language selection and text coverage were checked across the seven configured countries and all their supported languages.

| Country | Languages checked |
| --- | --- |
| Kazakhstan | Russian, Kazakh |
| Kyrgyzstan | Russian, Kyrgyz |
| Georgia | Georgian, English |
| Azerbaijan | Azerbaijani, Russian |
| Armenia | Armenian, Russian |
| Moldova | Romanian, Russian |
| Uzbekistan | Russian, Uzbek |

The pages checked were the homepage, About, Culture, History, Worldwide, product catalog, and dynamic product template. The homepage statistics removal and temporarily hidden product section remain in place.

## Issues fixed locally

- Slow language requests could finish out of order and overwrite the user's latest selection. Both page and product requests now ignore obsolete results and failures.
- Carousels could read text from a previous language's payload.
- English cookie preferences and explanations were missing and fell back to Russian. Product-page switches now notify the cookie interface of language changes.
- The worldwide map lacked Kyrgyz, Georgian, Armenian, and Uzbek interface strings. Country names and region labels were incomplete in several languages. The map now also recognizes standard HTML language codes and initializes the country selection correctly after the country registry loads.
- Kyrgyz culture, history, and worldwide content fell back to Russian. Missing copy was added, and several inaccurate Uzbek history headings were corrected.
- Website footers could mention Kazakhstan on another country's site. The country registry now supplies the corresponding footer copy in each supported language.
- Patient safety labels and notices were missing in seven languages. Romanian and Uzbek product brand labels were incomplete.
- Product catalog cards could prefer Russian over an available Kazakh, Uzbek, or Armenian translation. Product section defaults and category labels could also inject Russian into other languages.
- The product information heading was hardcoded in Russian.
- Search placeholders, menu and carousel labels, footer navigation, common image descriptions, and history image descriptions could retain another language after switching. These now update with the selected language. Explicit administrator image/text overrides are preserved.
- HTML language metadata now uses `kk`, `ky`, and `ka` for Kazakh, Kyrgyz, and Georgian, while internal API language identifiers remain compatible.
- Changed script URLs have new cache versions so deployment does not keep old language code in a browser cache.

## Verification

- 98 country/language/page combinations checked for translation-key coverage: no missing required keys detected.
- 84 local desktop browser page/language combinations checked: no missing visible translation labels, unexpected Russian text in the Latin/Georgian/Armenian language selections, or page-script errors detected.
- Mobile history and worldwide pages checked across all 14 country/language combinations. Product templates checked with sample content across all 14 combinations, including a repeat after the hardcoded heading fix. No horizontal page overflow or page-script errors was detected in these checks.
- 45 automated frontend/backend tests passed, including delayed-response switching, obsolete request failures, country-specific footer identity, and selected-language product preference.
- JavaScript syntax and Git whitespace checks passed.
- All 84 read-only requests to the active public content API returned successfully. It returned no published products for the seven countries.

Browser checks used the edited local frontend and generated local API payloads. The live API was inspected separately. Actual published product descriptions could not be audited because the public catalog was empty; sample products verified rendering and language handling. Missing product translations may still use the existing content fallback policy when products are published.

This audit verifies language selection, coverage, and detectable language mismatches; the added translations have not had an independent native-speaker proofread. Text embedded in pictures and linked biography PDFs was not translated.

## Deployment

Changes are local and have not been pushed or deployed. Both `stada-frontend` and `stada-backend` must be deployed for the complete correction, including the new country-registry footer field and backend translations.

The persistent regression tests are in `stada-frontend/test/locale.test.cjs` and `stada-backend/backend/test/product-content-country.test.js`.
