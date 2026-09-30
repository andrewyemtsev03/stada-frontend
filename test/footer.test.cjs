const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const root = path.join(__dirname, '../frontend');
const template = fs.readFileSync(path.join(root, 'partials/footer.html'), 'utf8').replaceAll('\r\n', '\n').trim();
const pages = ['index.html', 'about.html', 'culture.html', 'history.html', 'worldwide.html', 'news.html', 'news-article.html', 'products/index.html', 'products/product.html'];

test('every page uses the shared footer with correct relative company links', () => {
  for (const page of pages) {
    const html = fs.readFileSync(path.join(root, page), 'utf8').replaceAll('\r\n', '\n');
    const footer = html.match(/<footer\b[\s\S]*?<\/footer>/)?.[0];
    const prefix = '../'.repeat(page.split('/').length - 1);
    assert.equal(footer, template.replaceAll('{{root}}', prefix), page);
    assert.equal((footer.match(/class="footer-nav__group"/g) || []).length, 1, page);
    assert.ok(footer.includes(`href="${prefix}news.html"`), page);
    assert.ok(footer.includes(`href="${prefix}index.html#career"`), page);
    assert.ok(html.includes('js/site/news-labels.js'), page);
    assert.ok(html.includes('js/site/cookie-notice.js'), page);
  }
});

test('footer interface labels are available in every site language', () => {
  const context = vm.createContext({ document: { readyState: 'loading' }, window: { addEventListener() {} } });
  for (const file of ['bootstrap.js', 'news-labels.js', 'locale-state.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, 'js/site', file), 'utf8'), context);
  }
  const keys = [...template.matchAll(/data-static-i18n-key="([^"]+)"/g)].map(match => match[1]);
  for (const lang of ['ru', 'kz', 'kg', 'ge', 'en', 'az', 'hy', 'ro', 'uz']) {
    for (const key of keys.filter(key => !['site_name', 'footer_brand_text'].includes(key))) {
      assert.ok(vm.runInContext(`getFrontendStaticText('${lang}', '${key}')`, context), `${lang}: ${key}`);
    }
  }
  for (const country of ['kz', 'kg', 'ge', 'az', 'am', 'md', 'uz']) {
    vm.runInContext(`currentCountry = '${country}'; STADA_COUNTRY_BY_CODE[currentCountry] = {siteName: 'STADA ${country}', footerText: {ru: 'Country introduction ${country}'}}`, context);
    assert.equal(vm.runInContext("getFrontendStaticText('ru', 'site_name')", context), `STADA ${country}`);
    assert.equal(vm.runInContext("getFrontendStaticText('ru', 'footer_brand_text')", context), `Country introduction ${country}`);
  }
});
