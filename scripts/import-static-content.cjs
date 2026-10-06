// One-time migration of public copy. Regular builds only read frontend/content.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const root = path.resolve(__dirname, '../frontend');
const backend = path.resolve(__dirname, '../../stada-backend/backend');
const destination = path.join(root, 'content');
const pages = ['index.html', 'about.html', 'culture.html', 'history.html', 'contacts.html', 'news.html', 'news-article.html', 'products/index.html'];

async function main() {
  fs.mkdirSync(path.join(destination, 'countries'), { recursive: true });
  const apiIndex = process.argv.indexOf('--api');
  const api = apiIndex >= 0 ? process.argv[apiIndex + 1] : null;
  const dictionaryContext = vm.createContext({
    document: { readyState: 'loading', body: { classList: { add() {}, remove() {} } }, querySelector() {}, querySelectorAll() { return []; } },
    window: { addEventListener() {} }, console,
  });
  for (const file of ['bootstrap', 'news-labels', 'locale-state']) {
    vm.runInContext(fs.readFileSync(path.join(root, `js/site/${file}.js`), 'utf8'), dictionaryContext);
  }
  const dictionaries = vm.runInContext('JSON.parse(JSON.stringify(FRONTEND_STATIC_TEXT))', dictionaryContext);
  const readApi = async route => {
    const response = await fetch(new URL(route, api), { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`Content export failed: ${route} (${response.status})`);
    return response.json();
  };
  let countries, readPage;
  if (api) {
    countries = (await readApi('/api/countries')).countries;
    readPage = (country, lang, page) => {
      // Company news is authored locally, outside the content API.
      if (page === 'news.html' || page === 'news-article.html') {
        const previous = JSON.parse(fs.readFileSync(path.join(destination, 'countries', `${country.code}.json`)));
        const locale = previous.locales[lang];
        const payload = locale.pages[page];
        return { ...payload, country, content: { ...payload.content, text: { ...locale.text, ...payload.content.text } } };
      }
      return readApi(`/api/page/${country.id}?lang=${lang}&page=${page === 'contacts.html' ? 'worldwide.html' : page}`);
    };
  } else {
    // Evaluate the existing public dictionaries, without browser startup or API calls.
    const config = JSON.parse(fs.readFileSync(path.join(backend, 'data/site-config.json'), 'utf8'));
    for (const country of Object.values(config.countries)) {
      country.homepage.htmlPath = path.join(root, 'index.html');
      country.homepage.translationScriptPath = path.join(root, '__migration_translations.js');
    }
    const loaderPath = path.join(backend, 'src/content-loader.js');
    const localRequire = createRequire(loaderPath);
    const loaderModule = { exports: {} };
    const loaderContext = vm.createContext({
      __dirname: path.dirname(loaderPath), module: loaderModule, exports: loaderModule.exports, URL,
      require(name) {
        if (name === './content-overrides') return { getPageOverrides() { return null; } };
        if (name === 'node:fs') return { ...fs, readFileSync(file, ...args) {
          if (path.resolve(file) === path.join(backend, 'data/site-config.json')) return JSON.stringify(config);
          if (path.basename(file) === '__migration_translations.js') return `const translations = ${JSON.stringify(dictionaries)};`;
          return fs.readFileSync(file, ...args);
        } };
        return localRequire(name);
      },
    });
    vm.runInContext(fs.readFileSync(loaderPath, 'utf8'), loaderContext, { filename: loaderPath });
    countries = loaderModule.exports.listCountries();
    readPage = async (country, lang, page) => {
      const payload = loaderModule.exports.getPagePayload({ country: country.id, lang, page, applyOverrides: false });
      payload.content.text = { ...dictionaries[lang], ...payload.content.text };
      // Database products are deliberately not inferred from legacy sample cards.
      payload.content.productCatalog = [];
      return payload;
    };
    fs.copyFileSync(path.join(backend, 'data/worldwide-countries.json'), path.join(destination, 'worldwide.json'));
  }
  const exported = [];
  for (const country of countries) {
    // Canonical production domains; development hosts are deployment aliases.
    country.domain = `stada.${country.code}`;
    country.siteUrl = `https://${country.domain}/`;
    country.aliases = [...new Set([...(country.aliases || []), country.domain, `new.${country.domain}`])];
    const snapshot = { country, locales: {} };
    for (const lang of country.supportedLanguages) {
      const locale = { pages: {}, products: {} };
      for (const page of pages) {
        const payload = await readPage(country, lang, page);
        payload.content.text = { ...dictionaries[lang], ...payload.content.text };
        payload.country = { ...payload.country, domain: country.domain, siteUrl: country.siteUrl };
        locale.pages[page] = { country: payload.country, language: lang, page: { path: page }, content: {
          pageTitle: payload.content.pageTitle, text: payload.content.text,
          dom: payload.content.dom, photos: payload.content.photos,
          settings: payload.content.settings, productCatalog: payload.content.productCatalog || [],
        } };
      }
      if (api) {
        for (const product of locale.pages['products/index.html'].content.productCatalog) {
          const slug = product.slug || product.id;
          locale.products[slug] = await readApi(`/api/products/${encodeURIComponent(slug)}?country=${country.id}&lang=${lang}`);
        }
      }
      // Shared copy is edited once per locale. Pages keep only their differences.
      locale.text = { ...locale.pages['index.html'].content.text };
      for (const payload of Object.values(locale.pages)) {
        payload.content.text = Object.fromEntries(Object.entries(payload.content.text || {})
          .filter(([key, value]) => locale.text[key] !== value));
        delete payload.country;
      }
      snapshot.locales[lang] = locale;
    }
    exported.push(snapshot);
  }
  // Failed exports never leave a mixture of old and new country snapshots.
  for (const snapshot of exported) fs.writeFileSync(path.join(destination, 'countries', `${snapshot.country.code}.json`), `${JSON.stringify(snapshot, null, 2)}\n`);
  fs.writeFileSync(path.join(destination, 'countries.json'), `${JSON.stringify(countries, null, 2)}\n`);
  console.log(`Imported public content for ${countries.length} countries (${api ? 'live API, including published products' : 'local supplied copy; no database overrides or products'}).`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
