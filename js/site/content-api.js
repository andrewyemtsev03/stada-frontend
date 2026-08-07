function isBackendDrivenPage() {
  return !!document.querySelector('[data-i18n-key], [data-backend-text-id], [data-backend-image-id]');
}

function isDynamicProductDetailPage() {
  return !!document.querySelector('[data-dynamic-product-page]');
}

function getCurrentBackendPagePath() {
  const pathname = decodeURIComponent(window.location.pathname || '').replace(/\\/g, '/');
  const mainMarker = '/main/';
  const mainIndex = pathname.lastIndexOf(mainMarker);
  let pagePath = mainIndex >= 0 ? pathname.slice(mainIndex + mainMarker.length) : pathname.replace(/^\/+/, '');

  pagePath = pagePath.replace(/^main\//, '');
  if (!pagePath || pagePath.endsWith('/')) pagePath = `${pagePath}index.html`;
  if (pagePath === 'main') pagePath = 'index.html';
  return pagePath || 'index.html';
}

function getSiteAssetPath(relativePath) {
  const depth = Math.max(0, getCurrentBackendPagePath().split('/').length - 1);
  return `${'../'.repeat(depth)}${String(relativePath || '').replace(/^\/+/, '')}`;
}

function getCurrentProductCategoryFromUrl() {
  const params = new URLSearchParams(window.location.search || '');
  const explicitCategory = params.get('category') || params.get('filter');
  if (explicitCategory) return explicitCategory.trim().toLowerCase();

  const hashMatch = String(window.location.hash || '').match(/^#category-([a-z0-9-]+)$/i);
  return hashMatch ? hashMatch[1].toLowerCase() : '';
}

function buildBackendPageUrl(lang) {
  const country = getCountryConfig();
  const url = new URL(`/api/page/${encodeURIComponent(country.backendCountry)}`, STADA_BACKEND_BASE_URL);
  url.searchParams.set('lang', lang);
  url.searchParams.set('page', getCurrentBackendPagePath());
  return url.href;
}

function getDynamicProductSlug() {
  const params = new URLSearchParams(window.location.search || '');
  const explicitSlug = params.get('slug') || params.get('product') || params.get('id');
  if (explicitSlug) return normalizeProductCardId(explicitSlug);

  const slugFromPath = normalizeProductCardId(window.location.pathname.split('/').pop() || '');
  return slugFromPath && slugFromPath !== 'product' ? slugFromPath : '';
}

function buildBackendProductUrl(lang) {
  const slug = getDynamicProductSlug();
  const country = getCountryConfig();
  const url = new URL(`/api/products/${encodeURIComponent(slug)}`, STADA_BACKEND_BASE_URL);
  url.searchParams.set('country', country.backendCountry);
  url.searchParams.set('lang', lang);
  return url.href;
}

async function fetchBackendProduct(lang) {
  const slug = getDynamicProductSlug();
  if (!slug) {
    throw new Error('Product slug is missing.');
  }

  const cacheKey = `${currentCountry}:${lang}:${slug}`;
  if (!backendProductCache[cacheKey]) {
    backendProductCache[cacheKey] = fetchJsonWithTimeout(buildBackendProductUrl(lang));
  }
  return backendProductCache[cacheKey];
}

async function fetchBackendPage(lang) {
  const cacheKey = `${currentCountry}:${lang}:${getCurrentBackendPagePath()}`;
  if (!backendPageCache[cacheKey]) {
    backendPageCache[cacheKey] = fetchJsonWithTimeout(buildBackendPageUrl(lang));
  }
  return backendPageCache[cacheKey];
}

function getBackendPageText(key) {
  if (!backendPagePayload?.content?.text) return '';
  return getBackendTextValue(backendPagePayload.content.text, key);
}

const BACKEND_TEXT_KEY_ALIASES = {
  footer_nav_about: 'nav_about',
  footer_nav_culture: 'nav_culture',
  footer_nav_history: 'nav_history',
  footer_nav_worldwide: 'nav_worldwide',
  footer_nav_news: 'nav_news',
  footer_nav_career: 'nav_career',
};

function getBackendTextValue(text, key) {
  if (!key) return '';
  return text?.[key] || text?.[BACKEND_TEXT_KEY_ALIASES[key]] || '';
}

function escapeCssIdentifier(value) {
  if (window.CSS?.escape) return window.CSS.escape(value);
  return String(value).replace(/["\\]/g, '\\$&');
}

function getTranslatedText(lang, key) {
  return getBackendPageText(key) || getFrontendStaticText(lang, key);
}

function setLanguageToggleState(lang) {
  renderLanguageOptions(currentCountry);
  document.querySelectorAll('.lang-toggle').forEach(langToggle => {
    const buttons = Array.from(langToggle.querySelectorAll('.lang-option:not([hidden])'));
    const activeIndex = Math.max(0, buttons.findIndex(button => button.dataset.lang === lang));
    langToggle.dataset.activeLang = lang;
    setToggleActiveIndex(langToggle, activeIndex);
    buttons.forEach(btn => {
      const isActive = btn.dataset.lang === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  });
}

function applyTextFromBackendPayload(payload) {
  const text = payload?.content?.text || {};
  const dynamicText = {
    hero_kicker: payload?.country?.siteName,
    site_name: payload?.country?.siteName,
  };

  applyFrontendStaticText(currentLang);

  document.querySelectorAll('[data-i18n-key]').forEach(el => {
    const key = el.getAttribute('data-i18n-key');
    const value = dynamicText[key] || getBackendTextValue(text, key) || getFrontendStaticText(currentLang, key);
    if (value) {
      el.textContent = value;
      el.hidden = false;
    } else if (el.closest('.benefits-list')) {
      el.textContent = '';
      el.hidden = true;
    }
  });

  document.querySelectorAll('[data-i18n-placeholder-key]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder-key');
    const value = getBackendTextValue(text, key) || getFrontendStaticText(currentLang, key);
    if (value) el.setAttribute('placeholder', value);
  });

  document.querySelectorAll('[data-i18n-aria-label-key]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria-label-key');
    const value = getBackendTextValue(text, key) || getFrontendStaticText(currentLang, key);
    if (value) el.setAttribute('aria-label', value);
  });

  (payload?.content?.dom?.text || []).forEach(item => {
    if (!item?.id) return;
    document.querySelectorAll(`[data-backend-text-id="${escapeCssIdentifier(item.id)}"]`).forEach(el => {
      const value = item.value || '';
      el.textContent = value;
      if (el.closest('.benefits-list')) {
        el.hidden = !value;
      }
      el.dataset.backendTextValue = value;
      delete el.dataset.animated;
    });
  });

  applyLocalizedBackendDomText(currentLang);
}

function normalizeImageLookupKey(value) {
  return String(value || '')
    .split('#')[0]
    .split('?')[0]
    .replace(/\\/g, '/')
    .replace(/^https?:\/\/[^/]+\/?/i, '')
    .replace(/^(\.\/)+/, '')
    .replace(/^\/+/, '')
    .replace(/^\.\.\//, '');
}

function isStableCloudinaryImageUrl(src) {
  return /^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(?!v\d+\/)/i.test(String(src || ''));
}

function resolveCountryCloudinaryHeroImageSrc(src, countryId = '') {
  const value = String(src || '');
  const targetCountry = String(countryId || getCountryConfig().backendCountry || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!targetCountry || targetCountry === 'kazakhstan') return value;

  return value.replace(
    /(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(?:v\d+\/)?stada\/hero\/)kazakhstan(\/)/gi,
    `$1${targetCountry}$2`
  );
}

function withRuntimeImageRefresh(src, cacheKey = '') {
  if (!isStableCloudinaryImageUrl(src)) return src;
  if (!cacheKey && !window.location.hostname.match(/^(localhost|127\.0\.0\.1)$/)) return src;

  try {
    const url = new URL(src);
    url.searchParams.set(cacheKey ? 'v' : 'fresh', cacheKey || String(Date.now()));
    return url.href;
  } catch (error) {
    const separator = String(src).includes('?') ? '&' : '?';
    return `${src}${separator}${cacheKey ? 'v' : 'fresh'}=${encodeURIComponent(cacheKey || String(Date.now()))}`;
  }
}

function getCloudinaryProductImageSrc(slug, filename = 'card') {
  const normalizedSlug = normalizeProductCardId(slug);
  if (!normalizedSlug) return '';
  const normalizedFilename = String(filename || 'card')
    .split(/[?#]/)[0]
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9-]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'card';
  const extension = normalizedSlug === 'cardiomagnil' ? 'jpg' : 'png';
  return `https://res.cloudinary.com/ds2aaznn7/image/upload/stada/products/${normalizedSlug}/${normalizedFilename}.${extension}`;
}

function resolveProductAssetImageSrc(src) {
  const value = String(src || '').trim();
  const normalized = value.replace(/\\/g, '/');
  const productAssetMatch = normalized.match(/(?:^|\/)assets\/products\/([^/?#]+)(?:\/([^?#]+))?/i);
  if (!productAssetMatch) return value;

  const slug = productAssetMatch[1];
  const filename = productAssetMatch[2]?.split('/').pop() || '';
  const cloudinaryName = /(?:packshot|capsules|flacon|spore|bacillus|product)/i.test(filename)
    ? 'card'
    : filename || 'card';
  return getCloudinaryProductImageSrc(slug, cloudinaryName);
}

function applyImagesFromBackendPayload(payload) {
  const overrideImageCacheKey = payload?.content?.overrides?.updatedAt || '';
  const payloadCountryId = payload?.country?.id || getCountryConfig().backendCountry;

  (payload?.content?.dom?.images || []).forEach(image => {
    if (!image?.id) return;
    document.querySelectorAll(`img[data-backend-image-id="${escapeCssIdentifier(image.id)}"]`).forEach(img => {
      const rawNextSrc = image.source === 'override'
        ? image.url || image.src || img.src
        : image.src || img.src;
      const nextSrc = resolveCountryCloudinaryHeroImageSrc(rawNextSrc, payloadCountryId);
      if (
        img.dataset.optimizedStaticSrc === 'true'
        && image.source !== 'override'
        && normalizeImageLookupKey(nextSrc) === normalizeImageLookupKey(img.getAttribute('src') || img.src)
      ) {
        return;
      }
      img.src = withRuntimeImageRefresh(resolveProductAssetImageSrc(nextSrc), image.source === 'override' ? overrideImageCacheKey : '');
      if (image.srcset) img.srcset = image.srcset;
      if (image.sizes) img.sizes = image.sizes;
      img.alt = image.alt || '';
      if (image.loading) img.loading = image.loading;
      img.dataset.backendImageApplied = 'true';
    });
  });

  const photosBySrc = new Map();
  (payload?.content?.photos || []).forEach(photo => {
    const keys = [photo.src, photo.url].map(normalizeImageLookupKey).filter(Boolean);
    keys.forEach(key => photosBySrc.set(key, photo));
  });

  document.querySelectorAll('img').forEach(img => {
    if (img.dataset.backendImageApplied === 'true') return;
    const originalSrc = img.getAttribute('data-backend-src') || img.getAttribute('src') || '';
    const photo = photosBySrc.get(normalizeImageLookupKey(originalSrc));
    if (!photo) return;
    img.src = resolveCountryCloudinaryHeroImageSrc(photo.src || photo.url || img.src, payloadCountryId);
    if (photo.alt) img.alt = photo.alt;
    if (photo.loading) img.loading = photo.loading;
  });
}

function renderManagedNewsCards(payload) {
  const newsCards = payload?.content?.settings?.newsCards;
  const carousel = document.querySelector('[data-news-carousel]');
  const track = carousel?.querySelector('[data-news-track]');
  if (!track || !Array.isArray(newsCards)) return;

  const countryId = payload?.country?.id || getCountryConfig().backendCountry;
  const refreshKey = payload?.content?.overrides?.updatedAt || '';
  const cards = document.createDocumentFragment();

  newsCards.forEach((story, index) => {
    const article = document.createElement('article');
    article.className = 'news-card';
    article.dataset.newsId = story.id || `news-${index + 1}`;

    const media = document.createElement('div');
    media.className = 'news-card__media';
    const imageSource = resolveCountryCloudinaryHeroImageSrc(story.image?.src || '', countryId);
    if (imageSource) {
      const image = document.createElement('img');
      image.src = withRuntimeImageRefresh(resolveProductAssetImageSrc(imageSource), refreshKey);
      image.alt = story.image?.alt || story.title || '';
      image.loading = index === 0 ? 'eager' : 'lazy';
      image.decoding = 'async';
      media.appendChild(image);
    }

    const body = document.createElement('div');
    body.className = 'news-card__body';
    if (story.date) {
      const date = document.createElement('span');
      date.className = 'news-card__date';
      date.textContent = story.date;
      body.appendChild(date);
    }
    const title = document.createElement('h3');
    title.textContent = story.title || '';
    const text = document.createElement('p');
    text.textContent = story.text || '';
    body.append(title, text);
    article.append(media, body);
    cards.appendChild(article);
  });

  track.replaceChildren(cards);
  track.scrollLeft = 0;
  track.dispatchEvent(new Event('scroll'));
}

function renderHomeProductPreview(payload) {
  const grid = document.querySelector('[data-home-products-grid]');
  if (!grid || !Array.isArray(payload?.content?.homeProducts)) return;

  const products = payload.content.homeProducts;
  grid.innerHTML = '';
  grid.hidden = !products.length;
  if (!products.length) return;

  products.slice(0, 4).forEach(product => {
    const card = document.createElement('a');
    const categoryClass = product.categoryClass ? ` product-preview-card--${product.categoryClass}` : '';
    card.className = `product-preview-card${categoryClass}`;
    const productHref = String(product.href || '');
    const productSlug = product.slug || product.id || normalizeProductCardId(productHref);
    card.href = productHref && !/^(?:products\/)?(?!index|product)[^/]+\.html(?:$|[?#])/i.test(productHref)
      ? productHref
      : `products/product.html?slug=${encodeURIComponent(productSlug)}`;
    if (product.accent) card.style.setProperty('--product-accent', product.accent);

    const category = document.createElement('span');
    category.className = 'product-preview-card__category';
    category.textContent = product.therapeuticArea || product.category || '';

    const image = document.createElement('img');
    image.src = product.image?.src || product.image?.url || '';
    image.alt = product.image?.alt || product.name || product.id || '';
    image.loading = 'lazy';

    const name = document.createElement('span');
    name.className = 'product-preview-card__name';
    name.textContent = product.name || product.id || '';

    card.append(category, image, name);
    grid.appendChild(card);
  });
}

function applyProductMetrics(payload) {
  if (!Array.isArray(payload?.content?.productCatalog)) return;

  const productCount = payload.content.productCatalog.length;

  ['index_text_026', 'products_index_text_002'].forEach(id => {
    document.querySelectorAll(`[data-backend-text-id="${escapeCssIdentifier(id)}"]`).forEach(el => {
      el.textContent = String(productCount);
      el.dataset.backendTextValue = String(productCount);
      delete el.dataset.animated;
    });
  });
}

function normalizeProductCardId(value) {
  const rawValue = String(value || '').trim();
  const slugMatch = rawValue.match(/[?&]slug=([^&#]+)/);
  if (slugMatch) {
    try {
      return decodeURIComponent(slugMatch[1]).trim();
    } catch (error) {
      return slugMatch[1].trim();
    }
  }

  return rawValue
    .split(/[?#]/)[0]
    .replace(/\\/g, '/')
    .replace(/^(\.\/)+/, '')
    .replace(/^(\.\.\/)+/, '')
    .replace(/^products\//, '')
    .replace(/\.html$/i, '')
    .replace(/\/index$/i, '')
    .trim();
}

function resolveProductCardHref(href) {
  const value = String(href || '').trim();
  if (!value || /^(?:https?:)?\/\//i.test(value) || value.startsWith('#')) return value;

  const normalized = value.replace(/\\/g, '/').replace(/^(\.\/)+/, '');
  if (getCurrentBackendPagePath().startsWith('products/') && normalized.startsWith('products/')) {
    return normalized.replace(/^products\//, '');
  }
  return normalized;
}

function getDynamicProductHref(product) {
  const slug = product?.slug || product?.id || normalizeProductCardId(product?.href || '');
  return `product.html?slug=${encodeURIComponent(slug)}`;
}

function createProductCatalogCard(product) {
  const card = document.createElement('a');
  const extraClassName = String(product.className || '')
    .split(/\s+/)
    .filter(className => className && className !== 'catalog-card')
    .join(' ');
  card.className = ['catalog-card', extraClassName].filter(Boolean).join(' ');
  card.dataset.productCard = '';
  card.dataset.dynamicProductCard = 'true';
  card.dataset.productId = product.id || '';
  card.dataset.category = product.category || '';
  card.href = resolveProductCardHref(getDynamicProductHref(product));
  if (product.accent) card.style.setProperty('--card-accent', product.accent);

  const media = document.createElement('div');
  media.className = 'catalog-card__media';

  const image = document.createElement('img');
  image.src = withRuntimeImageRefresh(product.image?.url || product.image?.src || '');
  image.alt = product.image?.alt || product.name || product.id || '';
  image.loading = 'lazy';
  media.appendChild(image);

  const body = document.createElement('div');
  body.className = 'catalog-card__body';

  const category = document.createElement('span');
  category.className = 'catalog-card__category';
  category.textContent = product.therapeuticArea || product.category || '';

  const title = document.createElement('h3');
  title.textContent = product.name || product.id || '';

  const description = document.createElement('p');
  description.textContent = product.shortDescription || '';

  const cta = document.createElement('span');
  cta.className = 'catalog-card__cta';
  cta.textContent = getTranslatedText(currentLang, 'cta_more') || '';

  body.append(category, title, description, cta);
  card.append(media, body);
  return card;
}

function getActiveProductCatalogFilter() {
  return document.querySelector('[data-product-filter].is-active')?.dataset.productFilter
    || getCurrentProductCategoryFromUrl()
    || 'all';
}

function shouldShowStaticPharmacyPartners(payload = backendPagePayload) {
  return currentCountry === 'kz' && payload?.country?.id === 'kazakhstan';
}

function setPharmacyPartnerLinksVisible(isVisible) {
  document.querySelectorAll('a[href="#pharmacy-partners"]').forEach(link => {
    link.hidden = !isVisible;
  });
}

function setProductCatalogChromeVisible(isVisible, payload = backendPagePayload) {
  document.querySelectorAll('.catalog-filters').forEach(container => {
    container.hidden = !isVisible;
  });

  const partners = document.querySelector('.catalog-partners');
  const showPartners = isVisible && shouldShowStaticPharmacyPartners(payload);
  if (partners) partners.hidden = !showPartners;
  setPharmacyPartnerLinksVisible(showPartners);
}

function applyProductCatalogFilter(activeFilter = 'all') {
  const filters = Array.from(document.querySelectorAll('[data-product-filter]'));
  const targetFilter = filters.find(button => button.dataset.productFilter === activeFilter)
    || filters.find(button => button.dataset.productFilter === 'all')
    || null;
  const filterValue = targetFilter?.dataset.productFilter || activeFilter || 'all';

  filters.forEach(button => {
    const isActive = button === targetFilter;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  const cards = Array.from(document.querySelectorAll('[data-product-card]'));
  cards.forEach(card => {
    const categories = (card.dataset.category || '').split(' ');
    const isVisible = filterValue === 'all' || categories.includes(filterValue);
    card.hidden = !isVisible;
    card.setAttribute('aria-hidden', String(!isVisible));
    if (isVisible && card.classList.contains('home-reveal')) {
      card.classList.remove('is-visible');
      requestAnimationFrame(() => card.classList.add('is-visible'));
    }
  });
}

function applyProductCatalogCards(payload) {
  if (!Array.isArray(payload?.content?.productCatalog)) return;

  const products = payload.content.productCatalog;
  setProductCatalogChromeVisible(Boolean(products.length), payload);
  const grid = document.querySelector('[data-product-grid]');
  if (!grid) return;

  grid.innerHTML = '';
  grid.hidden = !products.length;
  if (!products.length) return;

  products.forEach(product => {
    grid.appendChild(createProductCatalogCard(product));
  });
  applyProductCatalogFilter(getActiveProductCatalogFilter());
}

function getFooterProductHref(product) {
  const href = getDynamicProductHref(product);
  return getCurrentBackendPagePath().startsWith('products/') ? href : `products/${href}`;
}

function renderFooterProductLinks(payload) {
  if (!Array.isArray(payload?.content?.productCatalog)) return;

  const products = payload.content.productCatalog;
  const footer = document.querySelector('footer');
  if (!footer) return;

  footer.querySelectorAll('.footer-nav__group').forEach(group => {
    const productHeading = group.querySelector('[data-i18n-key="footer_products_title"], [data-static-i18n-key="footer_products_title"]');
    const categoryHeading = group.querySelector('[data-i18n-key="nav_categories"], [data-static-i18n-key="nav_categories"]');

    if (categoryHeading) {
      group.hidden = !products.length;
      return;
    }

    if (!productHeading) return;
    group.querySelectorAll('a').forEach(link => link.remove());
    group.hidden = !products.length;
    if (!products.length) return;

    products.slice(0, 6).forEach(product => {
      const link = document.createElement('a');
      link.href = getFooterProductHref(product);
      link.textContent = product.name || product.slug || product.id || '';
      group.appendChild(link);
    });
  });
}

function showBackendRequiredMessage(error) {
  backendPagePayload = null;
  delete backendPageCache[`${currentCountry}:${currentLang}:${getCurrentBackendPagePath()}`];
  hideStadaPageLoader();
  document.body.classList.add('backend-content-pending');

  let screen = document.querySelector('[data-backend-error-screen]');
  if (!screen) {
    screen = document.createElement('div');
    screen.setAttribute('data-backend-error-screen', '');
    screen.style.cssText = 'position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:24px;background:#f7f8fb;color:#141414;font:400 16px/1.5 Noto Sans,Arial,sans-serif;';
    document.body.appendChild(screen);
  }

  screen.innerHTML = `
    <section role="alert" aria-live="assertive" style="width:min(100%,560px);padding:44px 38px;border-radius:18px;background:#fff;box-shadow:0 24px 70px rgba(20,20,20,.14);text-align:center;">
      <img src="${getSiteAssetPath('assets/logos/stada_logo.png')}" alt="STADA logo" style="display:block;width:118px;height:auto;margin:0 auto 26px;">
      <p style="margin:0 0 10px;color:#c4002f;font-weight:700;text-transform:uppercase;font-size:13px;letter-spacing:.08em;">Service unavailable</p>
      <h1 style="margin:0 0 14px;font-size:clamp(28px,4vw,42px);line-height:1.12;color:#1d1d1f;">Sorry, our services are unavailable.</h1>
      <p style="margin:0 auto 28px;max-width:420px;color:#4b4b55;font-size:17px;">We're working on fixing it. Please try refreshing the page in a moment.</p>
      <button type="button" data-backend-retry style="appearance:none;border:0;border-radius:999px;background:#005db9;color:#fff;padding:13px 24px;font:700 15px/1 Noto Sans,Arial,sans-serif;cursor:pointer;">Refresh page</button>
    </section>
  `;
  screen.querySelector('[data-backend-retry]')?.addEventListener('click', () => window.location.reload());
  document.title = 'STADA - Service unavailable';
  console.warn('Page backend unavailable.', error);
}

function clearBackendRequiredMessage() {
  document.querySelector('[data-backend-error-screen]')?.remove();
}
