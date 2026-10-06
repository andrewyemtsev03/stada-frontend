const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const frontend = path.resolve(__dirname, '../frontend');
const { JSDOM } = createRequire(path.join(frontend, 'package.json'))('jsdom');
const countries = JSON.parse(fs.readFileSync(path.join(frontend, 'content/countries.json')));
const output = path.join(frontend, 'dist');
const templates = ['index.html', 'about.html', 'culture.html', 'history.html', 'contacts.html', 'news.html', 'products/index.html'];
const tag = lang => ({ kz: 'kk', kg: 'ky', ge: 'ka' }[lang] || lang);

test('all countries and languages deliver meaningful text without executing JavaScript', () => {
  for (const country of countries) {
    for (const lang of country.supportedLanguages) {
      for (const page of templates) {
        const file = path.join(output, 'sites', country.code, lang, page);
        assert.ok(fs.existsSync(file), `Build missing: ${country.code}/${lang}/${page}. Run npm run build first.`);
        const dom = new JSDOM(fs.readFileSync(file, 'utf8'));
        const document = dom.window.document;
        assert.equal(document.documentElement.lang, tag(lang));
        assert.equal(document.documentElement.dataset.stadaCountry, country.code);
        assert.ok(document.querySelector('h1')?.textContent.trim(), `${file}: empty main heading`);
        assert.ok(document.querySelector('main').textContent.trim().length > (page === 'news.html' ? 30 : 100), `${file}: missing body copy`);
        for (const link of document.querySelectorAll('.menu a')) assert.ok(link.textContent.trim(), `${file}: empty navigation`);
        assert.equal(document.querySelector('link[rel="canonical"]').href, `https://${country.domain}/${lang}/${page}`);
        assert.equal(document.querySelectorAll('.lang-toggle a').length, country.supportedLanguages.length);
        for (const link of document.querySelectorAll('.lang-toggle a')) {
          assert.ok(fs.existsSync(path.join(output, 'sites', country.code, link.getAttribute('href'))));
        }
        assert.ok(document.querySelector('meta[name="description"]').content.trim());
        assert.ok(!document.body.classList.contains('backend-content-pending'));
        assert.ok(!document.querySelector('script[src*="product-live-editor"]'));
        dom.window.close();
      }
    }
  }
});

test('contact addresses are readable before the interactive globe runs', () => {
  for (const country of countries) {
    const file = path.join(output, 'sites', country.code, country.defaultLanguage, 'contacts.html');
    const dom = new JSDOM(fs.readFileSync(file, 'utf8'));
    assert.ok(dom.window.document.querySelector('#country-info-card dl')?.textContent.trim().length > 30, country.code);
    const supplied = JSON.parse(fs.readFileSync(path.join(frontend, 'content/worldwide.json'))).countries.find(item => item.id === country.id);
    if (supplied?.email) assert.ok(dom.window.document.querySelector('#country-info-card a[href^="mailto:"]'), country.code);
    dom.window.close();
  }
});

test('country sitemaps reference only existing localized pages and preserve country separation', () => {
  for (const country of countries) {
    const xml = fs.readFileSync(path.join(output, 'sites', country.code, 'sitemap.xml'), 'utf8');
    for (const [, value] of xml.matchAll(/<loc>(.*?)<\/loc>/g)) {
      const url = new URL(value);
      assert.equal(url.hostname, country.domain);
      assert.ok(fs.existsSync(path.join(output, 'sites', country.code, url.pathname)));
      assert.ok(!url.pathname.endsWith('/news-article.html'));
    }
    assert.match(fs.readFileSync(path.join(output, 'sites', country.code, 'robots.txt'), 'utf8'), /Allow: \//);
  }
  const moldova = new JSDOM(fs.readFileSync(path.join(output, 'sites/md/ro/news.html'), 'utf8'));
  const links = [...moldova.window.document.querySelectorAll('.company-news-card a')];
  assert.ok(links.length);
  for (const link of links) assert.ok(fs.existsSync(path.join(output, 'sites/md', link.getAttribute('href'))));
  moldova.window.close();
  assert.ok(!fs.readFileSync(path.join(output, 'sites/kz/ru/news.html'), 'utf8').includes('company-news-card__link'));
});

test('static browser startup cannot request the content API or override the URL language', async () => {
  const country = countries.find(item => item.code === 'ge');
  const dom = new JSDOM(fs.readFileSync(path.join(output, 'sites/ge/en/index.html'), 'utf8'), {
    url: 'https://new.stada.ge/en/index.html', runScripts: 'outside-only',
  });
  const window = dom.window;
  window.fetch = () => { assert.fail('Static startup requested a backend'); };
  window.localStorage.setItem('stada-lang', 'ge');
  for (const name of ['bootstrap', 'locale-state', 'content-api', 'locale-controls', 'static-runtime']) {
    vm.runInContext(fs.readFileSync(path.join(output, 'js/site', `${name}.js`), 'utf8'), dom.getInternalVMContext());
  }
  await window.loadFrontendCountryOptions();
  window.initializeLocaleState();
  assert.equal(window.STADA_CURRENT_COUNTRY, country.code);
  assert.equal(window.staticLanguageHref('ge'), '/ge/index.html');
  assert.equal(window.getTranslatedText('en', 'site_name'), 'STADA Georgia');
  window.updateLanguage('en');
  dom.window.close();
});
