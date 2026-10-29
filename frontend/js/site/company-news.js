// The sites an item is published on: one `country`, or a `countries` list for group-wide releases.
function getNewsCountries(item) {
  return item.countries || [item.country];
}

// News is scoped to the active site country and language, newest first. Never reuse another country's items.
function getCompanyNews(country, lang) {
  return STADA_COMPANY_NEWS.filter(item => getNewsCountries(item).includes(country))
    .map(item => ({ ...item, country, copy: item.translations[lang] }))
    .filter(item => item.copy)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

function newsElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function newsPhoto(item, src, index) {
  const image = newsElement('img');
  image.src = src;
  image.alt = item.copy.imageAlt || `${item.copy.title} — ${index + 1}`;
  image.width = 333;
  image.height = 250;
  image.loading = 'lazy';
  image.decoding = 'async';
  return image;
}

// Third-party coverage ("Мы в СМИ") is country scoped but shown on every language of that site.
function getMediaMentions(country) {
  if (typeof STADA_MEDIA_MENTIONS === 'undefined') return [];
  return STADA_MEDIA_MENTIONS.filter(item => item.country === country);
}

// Turns e-mail addresses, web addresses and named phrases (copy.links) into links.
function appendLinkedText(element, text, links = []) {
  const named = links.map(link => link.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp([...named, '[\\w.+-]+@[\\w-]+(?:\\.[\\w-]+)+', '(?:https?:\\/\\/|www\\.)[^\\s,;«»"]+[^\\s,;.:!?«»")]'].join('|'), 'g');
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const value = match[0];
    const link = newsElement('a', '', value);
    const namedLink = links.find(item => item.text === value);
    if (namedLink) link.href = namedLink.href;
    else if (value.includes('@') && !/^(https?:|www\.)/.test(value)) link.href = `mailto:${value}`;
    else {
      const url = new URL(value.startsWith('www.') ? `https://${value}` : value);
      link.href = url.href;
    }
    if (!link.href.startsWith('mailto:')) link.rel = 'noopener';
    element.append(document.createTextNode(text.slice(last, match.index)), link);
    last = match.index + value.length;
  }
  if (last === 0) return;
  element.append(document.createTextNode(text.slice(last)));
}

function formatNewsNumericDate(isoDate) {
  const [year, month, day] = isoDate.split('-');
  return `${day}.${month}.${year}`;
}

function renderMediaMentions(section, label) {
  if (!section) return;
  const items = getMediaMentions(currentCountry);
  section.replaceChildren();
  section.hidden = !items.length;
  if (!items.length) return;
  const title = newsElement('h2', 'media-mentions__title', label('media_title'));
  title.id = 'media-mentions-title';
  section.setAttribute('aria-labelledby', title.id);
  const list = newsElement('ul', 'media-mentions__list');
  items.forEach(item => {
    const entry = newsElement('li', 'media-mention');
    entry.lang = item.lang;
    const link = newsElement('a', 'media-mention__link');
    link.href = item.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    const meta = newsElement('p', 'media-mention__meta');
    const date = newsElement('time', '', formatNewsNumericDate(item.date));
    date.dateTime = item.date;
    meta.append(date, document.createTextNode(' · '), newsElement('span', 'media-mention__source', item.source));
    link.append(meta, newsElement('h3', '', item.title));
    item.text.forEach(text => link.append(newsElement('p', '', text)));
    const read = newsElement('span', 'company-news-read', `${label('media_read')} ↗`);
    read.lang = { kz: 'kk', kg: 'ky', ge: 'ka' }[currentLang] || currentLang;
    link.append(read);
    entry.append(link);
    list.append(entry);
  });
  section.append(title, list);
}

function renderCompanyNews() {
  if (!document.body.classList.contains('company-news-page')) return;
  const items = getCompanyNews(currentCountry, currentLang);
  const label = key => getFrontendStaticText(currentLang, key);
  const list = document.querySelector('[data-company-news-list]');
  const article = document.querySelector('[data-company-news-article]');
  document.title = `STADA – ${label('nav_news')}`;
  const navLink = document.querySelector('.menu a[href="news.html"]');
  navLink?.setAttribute('aria-current', 'page');
  navLink?.classList.add('active');
  if (list) {
    list.replaceChildren();
    if (!items.length) list.append(newsElement('p', 'company-news-empty', label('news_empty')));
    items.forEach(item => {
      const card = newsElement('article', 'company-news-card');
      const link = newsElement('a', 'company-news-card__link');
      link.href = typeof getStaticNewsHref === 'function'
        ? getStaticNewsHref(item.id)
        : `news-article.html?id=${encodeURIComponent(item.id)}`;
      link.append(newsPhoto(item, item.images[0], 0));
      const copy = newsElement('div', 'company-news-card__copy');
      copy.append(newsElement('h2', '', item.copy.title));
      copy.append(newsElement('p', '', item.copy.excerpt || item.copy.paragraphs[0]));
      copy.append(newsElement('span', 'company-news-read', `${label('news_read')} →`));
      link.append(copy);
      card.append(link);
      list.append(card);
    });
  }
  renderMediaMentions(document.querySelector('[data-media-mentions]'), label);
  if (article) {
    article.replaceChildren();
    const id = document.documentElement.dataset.staticNewsId || new URLSearchParams(location.search).get('id');
    const item = items.find(item => item.id === id);
    if (!item) {
      article.append(newsElement('h1', '', label('nav_news')));
      article.append(newsElement('p', 'company-news-empty', label('news_unavailable')));
      return;
    }
    document.title = `${item.copy.title} | STADA`;
    const heading = newsElement('header', 'company-news-article__header');
    heading.append(newsElement('p', 'section-kicker', getFrontendStaticText(currentLang, 'site_name')));
    heading.append(newsElement('h1', '', item.copy.title));
    if (item.date) {
      const date = newsElement('time', 'company-news-date', item.copy.dateLabel || new Intl.DateTimeFormat(currentLang === 'kz' ? 'kk-KZ' : currentLang, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${item.date}T00:00:00Z`)));
      date.dateTime = item.date;
      heading.append(date);
    }
    const body = newsElement('div', 'company-news-article__copy');
    item.copy.paragraphs.forEach((text, index) => {
      const tag = item.copy.headingIndices?.includes(index) ? 'h2' : 'p';
      const paragraph = newsElement(tag, '', text);
      if (tag === 'p') {
        const linked = newsElement('p');
        appendLinkedText(linked, text, item.copy.links);
        if (linked.childNodes.length) paragraph.replaceChildren(...linked.childNodes);
      }
      body.append(paragraph);
    });
    if (item.heroImage) {
      const figure = newsElement('figure', 'company-news-hero');
      const image = newsPhoto(item, item.images[0], 0);
      image.loading = 'eager';
      figure.append(image);
      if (item.copy.imageCaption) figure.append(newsElement('figcaption', '', item.copy.imageCaption));
      article.append(heading, figure, body);
      return;
    }
    const gallery = newsElement('div', 'company-news-gallery');
    item.images.forEach((src, index) => gallery.append(newsPhoto(item, src, index)));
    article.append(heading, body, gallery);
  }
}

document.addEventListener('stada:languagechange', renderCompanyNews);
