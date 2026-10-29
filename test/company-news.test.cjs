const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = vm.createContext({ document: { addEventListener() {} }, URL });
for (const file of ['news-data.js', 'company-news.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../frontend/js/site', file), 'utf8'), context);
}
const ids = (country, lang) => context.getCompanyNews(country, lang).map(item => item.id);
// Values created inside the VM sandbox belong to another realm; compare plain copies.
const plain = value => JSON.parse(JSON.stringify(value));

test('Moldova news is available in both supplied languages with four photos', () => {
  for (const lang of ['ru', 'ro']) {
    const items = context.getCompanyNews('md', lang).filter(item => item.id === 'ximluci-moldova');
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
  assert.ok(!ids('md', 'en').includes('ximluci-moldova'));
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
  assert.ok(!ids('kz', 'en').includes('health-report-2026-ai-kazakhstan'));
  assert.ok(!ids('md', 'kz').includes('health-report-2026-ai-kazakhstan'));
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
  assert.ok(!ids('uz', 'kz').includes('health-report-2026-digital-uzbekistan'));
  assert.ok(context.getCompanyNews('kz', 'ru').every(item => item.country === 'kz'));
});

test('Kazakhstan site lists its 2026 releases newest first, in Russian and Kazakh', () => {
  assert.ok(ids('kz', 'kz').includes('church-dwight-agreement-eurasia-2026'));
  for (const lang of ['ru', 'kz']) {
    assert.deepEqual(plain(ids('kz', lang).filter(id => id !== 'church-dwight-agreement-eurasia-2026')), [
      'health-report-2026-ai-kazakhstan', 'capvest-completes-acquisition-2026', 'annual-results-2025',
      'leadership-change-eurasia-2026', 'iqvia-otc-leader-2025-kazakhstan', 'top-employer-2026-kazakhstan',
    ]);
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
    assert.deepEqual(plain(ids('az', lang).filter(id => !['church-dwight-agreement-eurasia-2026', 'capvest-completes-acquisition-2026'].includes(id))),
      ['annual-results-2025', 'leadership-change-eurasia-2026', 'iqvia-otc-leader-2025-azerbaijan']);
    const items = context.getCompanyNews('az', lang).filter(item => item.id === 'iqvia-otc-leader-2025-azerbaijan');
    assert.equal(items[0].date, '2026-01-20');
    assert.equal(items[0].copy.paragraphs.length, 5);
    assert.match(items[0].copy.paragraphs[1], /Kardiomaqnil|Кардиомагнил/);
    assert.ok(fs.existsSync(path.join(__dirname, '../frontend', items[0].images[0])));
  }
  assert.ok(!ids('az', 'kz').includes('iqvia-otc-leader-2025-azerbaijan'));
});

const siteLanguages = { kz: ['ru', 'kz'], kg: ['ru', 'kg'], ge: ['ge', 'en'], az: ['az', 'ru'], am: ['hy', 'ru'], md: ['ro', 'ru'], uz: ['ru', 'uz'] };

test('2025 annual results appear on every site in every site language', () => {
  for (const [country, langs] of Object.entries(siteLanguages)) {
    for (const lang of langs) {
      const item = context.getCompanyNews(country, lang).find(entry => entry.id === 'annual-results-2025');
      assert.ok(item, `${country}/${lang}`);
      assert.equal(item.date, '2026-03-18');
      const { paragraphs, headingIndices, title } = item.copy;
      assert.match(title, /2025/);
      // Same outline in every language: 3 highlights, dateline, 6 section headings, About, 2 contact blocks.
      assert.equal(headingIndices.length, 9, `${country}/${lang}`);
      assert.equal(paragraphs.length, lang === 'kz' ? 34 : 33, `${country}/${lang}`);
      assert.match(paragraphs[3], /2026/);
      assert.ok(paragraphs.some(text => text.includes('press@stada.de')), `${country}/${lang}`);
      assert.ok(paragraphs.some(text => text.includes('ir@stada.de')), `${country}/${lang}`);
      assert.ok(paragraphs.join(' ').includes('961'), `${country}/${lang}`);
      for (const index of headingIndices) assert.ok(paragraphs[index].length < 200 && !paragraphs[index].includes('\n'));
    }
  }
  assert.ok(fs.existsSync(path.join(__dirname, '../frontend', vm.runInContext('STADA_COMPANY_NEWS', context).find(item => item.id === 'annual-results-2025').images[0])));
});

test('Leadership change is on every site except Georgia, in both languages of each site', () => {
  for (const [country, langs] of Object.entries(siteLanguages)) {
    for (const lang of langs) {
      const item = context.getCompanyNews(country, lang).find(entry => entry.id === 'leadership-change-eurasia-2026');
      if (country === 'ge') {
        assert.equal(item, undefined, 'no Georgian or English text was supplied');
        continue;
      }
      assert.ok(item, `${country}/${lang}`);
      assert.equal(item.date, '2026-02-16');
      assert.equal(item.copy.paragraphs.length, lang === 'kz' ? 9 : 7, `${country}/${lang}`);
      assert.ok(item.copy.paragraphs.join(' ').includes('Sanofi'));
      assert.ok(item.copy.paragraphs.join(' ').includes('Haleon'));
    }
  }
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

test('CapVest acquisition appears on every site in every site language', () => {
  for (const [country, langs] of Object.entries(siteLanguages)) {
    for (const lang of langs) {
      const item = context.getCompanyNews(country, lang).find(entry => entry.id === 'capvest-completes-acquisition-2026');
      assert.ok(item, `${country}/${lang}`);
      assert.equal(item.date, '2026-03-31');
      assert.match(item.copy.title, /CapVest/);
      assert.match(item.copy.excerpt, /2026/);
      assert.ok(item.copy.paragraphs.join(' ').includes('596/2014'), `${country}/${lang}: legal notice`);
      assert.ok(item.copy.headingIndices.length >= 3, `${country}/${lang}`);
      for (const index of item.copy.headingIndices) assert.ok(item.copy.paragraphs[index].length <= 70);
    }
  }
});

test('Church & Dwight agreement appears in every supplied language, newest first', () => {
  for (const [country, langs] of Object.entries(siteLanguages)) {
    for (const lang of langs) {
      const item = context.getCompanyNews(country, lang).find(entry => entry.id === 'church-dwight-agreement-eurasia-2026');
      if (lang === 'ru') {
        assert.equal(item, undefined, 'the Russian version has not been supplied yet');
        continue;
      }
      assert.ok(item, `${country}/${lang}`);
      assert.equal(ids(country, lang)[0] === 'church-dwight-agreement-eurasia-2026' || country === 'kz' || country === 'uz', true);
      assert.equal(item.date, '2026-04-20');
      assert.match(item.copy.title, /Church & Dwight/);
      assert.ok(item.copy.paragraphs.join(' ').includes('Batiste'));
      assert.equal(item.copy.headingIndices.length, 2, `${country}/${lang}: About STADA, About Church & Dwight`);
      const footnote = item.copy.paragraphs.find(text => text.startsWith('¹'));
      if (footnote) assert.ok(item.copy.paragraphs.indexOf(footnote) === item.copy.headingIndices[0] - 1);
    }
  }
});
