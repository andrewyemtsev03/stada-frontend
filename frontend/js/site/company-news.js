// News is scoped to the active site country. Never reuse another country's items.
function getCompanyNews(country, lang) {
  return STADA_COMPANY_NEWS.filter(item => item.country === country)
    .map(item => ({ ...item, copy: item.translations[lang] }))
    .filter(item => item.copy);
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
  image.alt = `${item.copy.title} — ${index + 1}`;
  image.width = 333;
  image.height = 250;
  image.loading = 'lazy';
  image.decoding = 'async';
  return image;
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
      copy.append(newsElement('p', '', item.copy.paragraphs[0]));
      copy.append(newsElement('span', 'company-news-read', `${label('news_read')} →`));
      link.append(copy);
      card.append(link);
      list.append(card);
    });
  }
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
    const body = newsElement('div', 'company-news-article__copy');
    item.copy.paragraphs.forEach(text => body.append(newsElement('p', '', text)));
    const gallery = newsElement('div', 'company-news-gallery');
    item.images.forEach((src, index) => gallery.append(newsPhoto(item, src, index)));
    article.append(heading, body, gallery);
  }
}

document.addEventListener('stada:languagechange', renderCompanyNews);
