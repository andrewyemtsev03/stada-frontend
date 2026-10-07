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
    for (const lang of ['ru', 'ro']) assert.ok(context.getCompanyNews(country, lang).every(item => item.country === country && item.id !== 'ximluci-moldova'));
  }
  assert.equal(context.getCompanyNews('md', 'en').length, 0);
});

test('Kazakhstan Health Report is complete in Russian and Kazakh and scoped to Kazakhstan', () => {
  for (const lang of ['ru', 'kz']) {
    const items = context.getCompanyNews('kz', lang);
    assert.equal(items.length, 1);
    const item = items[0];
    assert.match(item.copy.title, /71%/);
    assert.equal(item.date, '2026-10-07');
    assert.equal(item.copy.paragraphs.length, 23);
    assert.equal(item.copy.headingIndices.length, 5);
    assert.ok(item.copy.paragraphs.some(text => text.includes('19 514')));
    assert.ok(item.copy.paragraphs.some(text => text.includes('www.reportstada.net')));
    assert.ok(fs.existsSync(path.join(__dirname, '../frontend', item.images[0])));
  }
  assert.equal(context.getCompanyNews('kz', 'en').length, 0);
  assert.equal(context.getCompanyNews('md', 'kz').length, 0);
});

test('Uzbekistan Health Report keeps both complete supplied languages and stays country scoped', () => {
  for (const lang of ['ru', 'uz']) {
    const items = context.getCompanyNews('uz', lang);
    assert.equal(items.length, 1);
    const item = items[0];
    assert.match(item.copy.title, /52/);
    assert.equal(item.copy.paragraphs.length, lang === 'ru' ? 31 : 30);
    assert.equal(item.copy.headingIndices.length, 7);
    assert.ok(item.copy.paragraphs.some(text => text.includes('19 514')));
    assert.ok(item.copy.paragraphs.some(text => text.includes('www.reportstada.net')));
    assert.ok(fs.existsSync(path.join(__dirname, '../frontend', item.images[0])));
  }
  assert.equal(context.getCompanyNews('uz', 'kz').length, 0);
  assert.ok(context.getCompanyNews('kz', 'ru').every(item => item.country === 'kz'));
});
