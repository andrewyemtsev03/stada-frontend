// Generated pages own their locale. Public copy never waits for a content API.
const STADA_STATIC_PAGE = JSON.parse(document.getElementById('stada-static-page').textContent);
if (STADA_STATIC_PAGE.page === 'news-article.html') {
  const id = new URLSearchParams(location.search).get('id');
  if (id && /^[a-z0-9-]+$/.test(id)) {
    window.location.replace(`/${STADA_STATIC_PAGE.language}/news/${id}.html`);
  }
}

async function loadFrontendCountryOptions() {
  setCountryOptions(STADA_STATIC_PAGE.countries);
}

function initializeLocaleState() {
  currentCountry = STADA_STATIC_PAGE.country;
  currentLang = STADA_STATIC_PAGE.language;
  STADA_DOMAIN_COUNTRY = currentCountry;
  STADA_DEFAULT_COUNTRY = currentCountry;
  exposeCurrentCountry();
}

function getCurrentBackendPagePath() {
  return STADA_STATIC_PAGE.template;
}

function getSiteAssetPath(relativePath) {
  return `/${String(relativePath || '').replace(/^\/+/, '')}`;
}

function staticLanguageHref(lang) {
  const country = STADA_STATIC_PAGE.countries.find(item => item.code === currentCountry);
  const target = country.supportedLanguages.includes(lang) ? lang : country.defaultLanguage;
  // Local preview keeps the country in its path; published domains use /language/.
  const previewPrefix = location.pathname.startsWith('/sites/') ? `/sites/${currentCountry}` : '';
  return `${previewPrefix}/${target}/${STADA_STATIC_PAGE.page}${location.search}${location.hash}`;
}

function updateLanguage(lang) {
  if (lang !== currentLang) window.location.assign(staticLanguageHref(lang));
}

function updateCountry(countryCode) {
  const country = STADA_STATIC_PAGE.countries.find(item => item.code === countryCode);
  if (country && country.code !== currentCountry) {
    window.location.assign(`https://${country.domain}/${country.defaultLanguage}/index.html`);
  }
}

function renderLanguageOptions() {
  document.querySelectorAll('.lang-toggle').forEach(toggle => {
    toggle.querySelectorAll('[data-static-language]').forEach(link => {
      link.href = staticLanguageHref(link.dataset.staticLanguage);
    });
  });
}

// Homepage copy must also use the published country data when slides change.
function getTranslatedText(lang, key) {
  return STADA_STATIC_PAGE.text[key] ?? '';
}

function getFrontendStaticText(lang, key) {
  return STADA_STATIC_PAGE.text[key] ?? '';
}

function getSuppliedText(lang, key) {
  return STADA_STATIC_PAGE.text[key];
}

function getStaticNewsHref(id) {
  return `news/${encodeURIComponent(id)}.html`;
}
