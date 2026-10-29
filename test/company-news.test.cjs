const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = vm.createContext({ document: { addEventListener() {} }, URL });
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
    const item = context.getCompanyNews('kz', lang).find(entry => entry.id === 'health-report-2026-ai-kazakhstan');
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
    const item = context.getCompanyNews('uz', lang).find(entry => entry.id === 'health-report-2026-digital-uzbekistan');
    assert.match(item.copy.title, /52/);
    assert.equal(item.copy.paragraphs.length, lang === 'ru' ? 32 : 31);
    assert.equal(item.copy.headingIndices.length, 7);
    assert.ok(item.copy.paragraphs.some(text => text.includes('19 514')));
    assert.ok(item.copy.paragraphs.some(text => text.includes('www.reportstada.net')));
    assert.ok(fs.existsSync(path.join(__dirname, '../frontend', item.images[0])));
  }
  assert.equal(context.getCompanyNews('uz', 'kz').length, 0);
  assert.ok(context.getCompanyNews('kz', 'ru').every(item => item.country === 'kz'));
});

// Values created inside the VM sandbox belong to another realm; compare plain copies.
const plain = value => JSON.parse(JSON.stringify(value));

test('Kazakhstan site lists its January 2026 releases newest first, in Russian and Kazakh only', () => {
  for (const lang of ['ru', 'kz']) {
    const ids = context.getCompanyNews('kz', lang).map(item => item.id);
    assert.deepEqual(plain(ids), ['health-report-2026-ai-kazakhstan', 'iqvia-otc-leader-2025-kazakhstan', 'top-employer-2026-kazakhstan']);
  }
  for (const country of ['kg', 'ge', 'az', 'am', 'md', 'uz']) {
    for (const lang of ['ru', 'kz', 'az']) {
      assert.ok(context.getCompanyNews(country, lang).every(item => !['iqvia-otc-leader-2025-kazakhstan', 'top-employer-2026-kazakhstan'].includes(item.id)));
    }
  }
});

test('Top Employer release keeps every supplied section, quote and contact', () => {
  for (const lang of ['ru', 'kz']) {
    const item = context.getCompanyNews('kz', lang).find(entry => entry.id === 'top-employer-2026-kazakhstan');
    assert.equal(item.date, '2026-01-15');
    assert.equal(item.copy.paragraphs.length, 18);
    assert.deepEqual(plain(item.copy.headingIndices), [11, 13, 15]);
    assert.ok(item.copy.paragraphs.some(text => text.includes('Симона Бергер')));
    assert.ok(item.copy.paragraphs.some(text => text.includes('88%')));
    assert.ok(item.copy.paragraphs.some(text => text.includes('press@stada.kz')));
    assert.ok(item.copy.paragraphs.some(text => text.includes('ir@stada.de')));
    assert.ok(item.copy.paragraphs.some(text => text.includes(item.copy.links[0].text)));
    for (const text of item.copy.paragraphs) assert.equal((text.match(/«/g) || []).length, (text.match(/»/g) || []).length, text);
    assert.ok(fs.existsSync(path.join(__dirname, '../frontend', item.images[0])));
  }
});

test('IQVIA awards are published only on their own country site', () => {
  for (const lang of ['ru', 'kz']) {
    const item = context.getCompanyNews('kz', lang).find(entry => entry.id === 'iqvia-otc-leader-2025-kazakhstan');
    assert.equal(item.copy.paragraphs.length, 5);
    assert.ok(item.copy.paragraphs.join(' ').includes('Leading Retail OTC Corporation'));
  }
  for (const lang of ['az', 'ru']) {
    const items = context.getCompanyNews('az', lang);
    assert.deepEqual(plain(items.map(item => item.id)), ['iqvia-otc-leader-2025-azerbaijan']);
    assert.equal(items[0].date, '2026-01-20');
    assert.equal(items[0].copy.paragraphs.length, 5);
    assert.match(items[0].copy.paragraphs[1], /Kardiomaqnil|Кардиомагнил/);
    assert.ok(fs.existsSync(path.join(__dirname, '../frontend', items[0].images[0])));
  }
  assert.equal(context.getCompanyNews('az', 'kz').length, 0);
});

test('Media mentions are country scoped, untranslated, dated and link to https sources', () => {
  const mentions = vm.runInContext('STADA_MEDIA_MENTIONS', context);
  assert.equal(mentions.length, 9);
  assert.deepEqual(['kz', 'uz', 'az'].map(country => context.getMediaMentions(country).length), [5, 3, 1]);
  for (const country of ['kg', 'ge', 'am', 'md']) assert.equal(context.getMediaMentions(country).length, 0);
  for (const country of ['kz', 'uz', 'az']) {
    const dates = plain(context.getMediaMentions(country).map(item => item.date));
    assert.deepEqual(dates, [...dates].sort().reverse());
  }
  assert.equal(new Set(mentions.map(item => item.id)).size, mentions.length);
  for (const item of mentions) {
    assert.match(item.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(item.url, /^https:\/\//);
    assert.equal(new URL(item.url).hostname.replace(/^www\./, ''), item.source);
    assert.ok(item.title && item.text.length);
    assert.ok(!/Читать далее|\[1\]/.test([item.title, ...item.text].join(' ')));
  }
});
