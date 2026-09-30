const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = vm.createContext({ document: { addEventListener() {} } });
for (const file of ['news-data.js', 'company-news.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../frontend/js/site', file), 'utf8'), context);
}

test('Moldova news is available in both supplied languages with four photos', () => {
  for (const lang of ['ru', 'ro']) {
    const items = context.getCompanyNews('md', lang);
    assert.equal(items.length, 1);
    assert.equal(items[0].copy.paragraphs.length, 3);
    assert.equal(items[0].images.length, 4);
    assert.match(items[0].copy.title, /Ximluci®/);
    for (const image of items[0].images) {
      assert.ok(fs.existsSync(path.join(__dirname, '../frontend', image)));
    }
  }
});

test('Moldova news never appears on another country site or in an unsupplied language', () => {
  for (const country of ['kz', 'kg', 'ge', 'az', 'am', 'uz']) {
    for (const lang of ['ru', 'ro']) assert.equal(context.getCompanyNews(country, lang).length, 0);
  }
  assert.equal(context.getCompanyNews('md', 'en').length, 0);
});
