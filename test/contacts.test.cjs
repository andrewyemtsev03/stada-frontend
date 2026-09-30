const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const root = path.join(__dirname, '../frontend');

test('contacts labels stay localized even when the API returns old location copy', () => {
  const context = vm.createContext({ document: { readyState: 'loading' }, window: { addEventListener() {}, location: { pathname: '/contacts.html' } } });
  for (const file of ['bootstrap.js', 'news-labels.js', 'content-api.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, 'js/site', file), 'utf8'), context);
  }
  for (const [lang, expected] of Object.entries({en:'Contacts',ru:'Контакты',kz:'Байланыс',kg:'Байланыш',ge:'კონტაქტები',az:'Əlaqə',hy:'Կոնտակտներ',ro:'Contacte',uz:'Aloqa'})) {
    vm.runInContext(`currentLang = '${lang}'`, context);
    for (const key of ['nav_worldwide', 'footer_nav_worldwide', 'worldwide_heading']) {
      assert.equal(vm.runInContext(`getBackendTextValue({${key}: 'Our locations'}, '${key}')`, context), expected);
    }
    assert.ok(vm.runInContext(`STADA_CONTACTS_COPY['${lang}'].worldwide_subtitle`, context));
  }
  assert.equal(vm.runInContext('getCurrentBackendPagePath()', context), 'worldwide.html');
});

test('all public company links use contacts and the old route redirects', () => {
  for (const page of ['index.html','about.html','culture.html','history.html','contacts.html','news.html','news-article.html','products/index.html','products/product.html']) {
    const html = fs.readFileSync(path.join(root,page), 'utf8');
    assert.ok(html.includes('contacts.html'), page);
    assert.ok(!html.includes('href="worldwide.html"') && !html.includes('href="../worldwide.html"'), page);
  }
  const config = JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));
  assert.deepEqual(config.redirects.find(r => r.source === '/worldwide.html'), {source:'/worldwide.html',destination:'/contacts.html',permanent:true});
});
