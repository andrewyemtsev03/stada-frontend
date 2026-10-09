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
        const analytics = document.querySelectorAll('script[src*="/site/analytics.js"]');
        assert.equal(analytics.length, 1, `${file}: missing or duplicate analytics loader`);
        assert.ok(fs.existsSync(path.join(output, analytics[0].getAttribute('src').split('?')[0])));
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
  const newsContext = vm.createContext({});
  vm.runInContext(fs.readFileSync(path.join(frontend, 'js/site/news-data.js'), 'utf8'), newsContext);
  const news = vm.runInContext('STADA_COMPANY_NEWS', newsContext);
  for (const country of countries) {
    for (const lang of country.supportedLanguages) {
      const list = new JSDOM(fs.readFileSync(path.join(output, 'sites', country.code, lang, 'news.html'), 'utf8'));
      const expected = news.filter(item => item.country === country.code && item.translations[lang]);
      const links = [...list.window.document.querySelectorAll('.company-news-card__link')];
      assert.equal(links.length, expected.length, `${country.code}/${lang}`);
      for (const item of expected) {
        const href = `/${lang}/news/${item.id}.html`;
        assert.ok(links.some(link => link.getAttribute('href') === href), href);
        const article = new JSDOM(fs.readFileSync(path.join(output, 'sites', country.code, href), 'utf8'));
        assert.equal(article.window.document.querySelector('h1').textContent, item.translations[lang].title);
        assert.equal(article.window.document.querySelector('.company-news-article__copy').children.length, item.translations[lang].paragraphs.length);
        if (item.heroImage) {
          const image = article.window.document.querySelector('.company-news-hero img');
          assert.ok(fs.existsSync(path.join(output, image.getAttribute('src'))));
          assert.equal(article.window.document.querySelector('time').dateTime, item.date);
        }
        article.window.close();
      }
      list.window.close();
    }
  }
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


test('history timeline photographs are present without JavaScript for every country and language', () => {
  for (const country of countries) for (const lang of country.supportedLanguages) {
    const file = path.join(output, 'sites', country.code, lang, 'history.html');
    const dom = new JSDOM(fs.readFileSync(file, 'utf8'));
    const document = dom.window.document;
    const timeline = [...document.querySelectorAll('.history-timeline')].find(section => !section.hidden);
    assert.ok(timeline, file);
    const events = [...timeline.querySelectorAll('.history-event')];
    assert.ok(events.length >= 12, file);
    for (const event of events) {
      const image = event.querySelector('.history-event__media img');
      assert.ok(image, file + ': missing chronology photo');
      assert.ok(image.alt.trim(), file + ': missing photo description');
      assert.ok(fs.existsSync(path.join(output, image.getAttribute('src'))), file + ': missing image asset');
    }
    dom.window.close();
  }
});
