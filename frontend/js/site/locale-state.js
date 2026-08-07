function frontendLanguageFallbackOrder(lang) {
  const requested = String(lang || '').trim().toLowerCase();
  if (requested === 'ge') return ['ge', 'en'];
  if (requested === 'en') return ['en', 'ge'];
  if (requested === 'ro') return ['ro', 'en'];
  if (requested === 'uz') return ['uz', 'ru'];
  if (requested === 'hy') return ['hy', 'ru'];
  if (requested === 'kg') return ['kg'];
  const regionalFallbacks = [];
  return [...new Set([requested, ...regionalFallbacks, 'ru'].filter(Boolean))];
}

function getFrontendStaticText(lang, key) {
  if (!key) return '';

  // The site identity belongs to the active country, not to a language. This
  // prevents a shared language fallback (for example English) from showing
  // "STADA Georgia" on another country's site while page content is loading.
  if (key === 'site_name' || key === 'hero_kicker') {
    const country = STADA_COUNTRY_BY_CODE[currentCountry];
    if (country?.siteName) return country.siteName;
  }

  for (const candidateLang of frontendLanguageFallbackOrder(lang)) {
    const value = FRONTEND_STATIC_TEXT[candidateLang]?.[key];
    if (value) return value;
  }
  return '';
}

function applyFrontendStaticText(lang) {
  document.querySelectorAll('[data-static-i18n-key]').forEach(el => {
    const key = el.getAttribute('data-static-i18n-key');
    const value = getFrontendStaticText(lang, key);
    if (value) {
      el.textContent = value;
      el.hidden = false;
    }
  });

  document.querySelectorAll('[data-i18n-key]').forEach(el => {
    const key = el.getAttribute('data-i18n-key');
    const value = getFrontendStaticText(lang, key);
    if (value) {
      el.textContent = value;
      el.hidden = false;
    }
  });
}

function applyLocalizedBackendDomText(lang) {
  const localizedText = frontendLanguageFallbackOrder(lang)
    .map(candidateLang => LOCALIZED_BACKEND_DOM_TEXT[candidateLang])
    .find(Boolean);
  if (!localizedText) return;

  Object.entries(localizedText).forEach(([id, value]) => {
    document.querySelectorAll(`[data-backend-text-id="${escapeCssIdentifier(id)}"]`).forEach(el => {
      el.textContent = value;
      el.dataset.backendTextValue = value;
      delete el.dataset.animated;
    });
  });
}

const STADA_BACKEND_BASE_URL = window.STADA_BACKEND_BASE_URL || 'https://stada-content-backend.onrender.com';
let STADA_DOMAIN_COUNTRY = '';
let STADA_CONFIG_COUNTRY = '';
let STADA_DEFAULT_COUNTRY = 'kz';
const backendPageCache = {};
const backendProductCache = {};
let backendPagePayload = null;
let backendProductPayload = null;
const BACKEND_REQUEST_TIMEOUT_MS = 12000;
const CRITICAL_IMAGE_WAIT_MS = 2500;

async function fetchJsonWithTimeout(url) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), BACKEND_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }
    return response.json();
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function wait(ms) {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

function getDefaultCountryCode() {
  return STADA_COUNTRY_OPTIONS[0]?.code || '';
}

function codeFromBackendCountry(country) {
  const aliases = Array.isArray(country?.aliases) ? country.aliases : [];
  const aliasCode = aliases
    .map(alias => String(alias || '').trim().toLowerCase())
    .find(alias => /^[a-z]{2}$/.test(alias));
  const domainCode = String(country?.domain || '')
    .trim()
    .toLowerCase()
    .split('.')
    .pop();

  return aliasCode || (/^[a-z]{2}$/.test(domainCode) ? domainCode : '') || String(country?.id || '').slice(0, 2).toLowerCase();
}

function countryOptionFromBackend(country) {
  const code = String(country?.code || "").trim().toLowerCase() || codeFromBackendCountry(country);
  const domain = String(country?.domain || '').trim().toLowerCase();
  const aliases = [
    ...(Array.isArray(country?.aliases) ? country.aliases : []),
    domain,
    domain ? `www.${domain.replace(/^www\./, '')}` : '',
  ].filter(Boolean);

  return {
    code,
    label: code.toUpperCase(),
    name: country?.name || country?.id || code.toUpperCase(),
    siteName: country?.siteName || `STADA ${country?.name || country?.id || code.toUpperCase()}`,
    backendCountry: country?.id || code,
    domain,
    aliases: [...new Set(aliases)],
    defaultLanguage: String(country?.defaultLanguage || country?.supportedLanguages?.[0] || 'ru').toLowerCase(),
    supportedLanguages: Array.isArray(country?.supportedLanguages) && country.supportedLanguages.length
      ? country.supportedLanguages.map(language => String(language || '').trim().toLowerCase()).filter(Boolean)
      : ['ru'],
  };
}

function setCountryOptions(countries) {
  const options = (Array.isArray(countries) ? countries : [])
    .map(countryOptionFromBackend)
    .filter(country => country.code && country.backendCountry && country.supportedLanguages.length);

  if (!options.length) {
    throw new Error('Backend country registry did not include any usable countries.');
  }

  STADA_COUNTRY_OPTIONS = options;
  STADA_COUNTRY_BY_CODE = Object.fromEntries(options.map(country => [country.code, country]));
}

async function loadFrontendCountryOptions() {
  const url = new URL('/api/countries', STADA_BACKEND_BASE_URL);
  const payload = await fetchJsonWithTimeout(url.href);
  setCountryOptions(payload?.countries);
}

function refreshCountryDefaults() {
  STADA_DOMAIN_COUNTRY = getCountryCodeFromHostname(window.location.hostname);
  STADA_CONFIG_COUNTRY = getConfiguredCountryCode();
  STADA_DEFAULT_COUNTRY = STADA_DOMAIN_COUNTRY || STADA_CONFIG_COUNTRY || getDefaultCountryCode();
}

async function waitForCriticalImages() {
  const selectors = [
    'img[fetchpriority="high"]',
    '.catalog-hero img',
    '.product-hero img',
    '[data-product-image]',
    '[data-product-formula-image]'
  ];
  const images = Array.from(new Set(
    selectors.flatMap(selector => Array.from(document.querySelectorAll(selector)))
  )).filter(img => img instanceof HTMLImageElement && (img.currentSrc || img.src));

  if (!images.length) return;

  const imagePromises = images.map(img => {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();
    if (typeof img.decode === 'function') {
      return img.decode().catch(() => undefined);
    }
    return new Promise(resolve => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    });
  });

  await Promise.race([
    Promise.all(imagePromises),
    wait(CRITICAL_IMAGE_WAIT_MS)
  ]);
}

function normalizeCountryCode(countryInput) {
  const requested = String(countryInput || '').trim().toLowerCase();
  const matched = STADA_COUNTRY_OPTIONS.find(country => {
    return [
      country.code,
      country.label,
      country.backendCountry,
      country.name,
      country.domain,
      ...(country.aliases || []),
    ].some(value => String(value || '').toLowerCase() === requested);
  });
  return matched?.code || getDefaultCountryCode();
}

function getConfiguredCountryCode() {
  const configuredCountry = window.STADA_BACKEND_COUNTRY || window.STADA_COUNTRY || '';
  return configuredCountry ? normalizeCountryCode(configuredCountry) : '';
}

function getCountryCodeFromHostname(hostname) {
  const normalizedHostname = String(hostname || '')
    .trim()
    .toLowerCase()
    .replace(/^www\./, '')
    .split(':')[0];

  const matchedDomainCountry = STADA_COUNTRY_OPTIONS.find(country => {
    return [
      country.domain,
      ...(country.aliases || []),
    ]
      .map(value => String(value || '').trim().toLowerCase().replace(/^www\./, ''))
      .includes(normalizedHostname);
  });

  if (matchedDomainCountry) return matchedDomainCountry.code;

  const topLevelDomain = normalizedHostname.split('.').pop();
  const matchedTldCountry = STADA_COUNTRY_OPTIONS.find(country => country.code === topLevelDomain);
  return matchedTldCountry?.code || '';
}

function getCountryConfig(countryCode = currentCountry) {
  const country = STADA_COUNTRY_BY_CODE[normalizeCountryCode(countryCode)] || STADA_COUNTRY_OPTIONS[0];
  if (!country) throw new Error('Country registry is unavailable.');
  return country;
}

function getSupportedLanguages(countryCode = currentCountry) {
  return getCountryConfig(countryCode).supportedLanguages;
}

function getLanguageLabel(lang) {
  return STADA_LANGUAGE_LABELS[lang] || String(lang || '').toUpperCase();
}

function resolveLanguageForCountry(lang, countryCode = currentCountry) {
  const country = getCountryConfig(countryCode);
  const requested = String(lang || '').trim().toLowerCase();
  if (country.supportedLanguages.includes(requested)) return requested;
  return country.defaultLanguage || country.supportedLanguages[0] || 'ru';
}

function persistLocaleState() {
  try {
    localStorage.setItem('stada-country', currentCountry);
    localStorage.setItem('stada-lang', currentLang);
  } catch (e) {
    // Ignore storage failures.
  }
}

function exposeCurrentCountry() {
  const country = getCountryConfig(currentCountry);
  window.STADA_CURRENT_COUNTRY = currentCountry;
  window.STADA_CURRENT_BACKEND_COUNTRY = country.backendCountry;
  document.documentElement.dataset.stadaCountry = currentCountry;
  document.documentElement.dataset.stadaCountryId = country.backendCountry;
}

function initializeLocaleState() {
  refreshCountryDefaults();
  currentCountry = STADA_DEFAULT_COUNTRY;
  try {
    const savedCountry = localStorage.getItem('stada-country');
    if (savedCountry && !STADA_DOMAIN_COUNTRY) {
      currentCountry = normalizeCountryCode(savedCountry);
    }
    const savedLang = localStorage.getItem('stada-lang');
    if (savedLang) {
      currentLang = resolveLanguageForCountry(savedLang, currentCountry);
    } else {
      currentLang = resolveLanguageForCountry(getCountryConfig(currentCountry).defaultLanguage, currentCountry);
    }
  } catch (e) {
    currentLang = resolveLanguageForCountry(getCountryConfig(currentCountry).defaultLanguage, currentCountry);
  }
  exposeCurrentCountry();
}

function setToggleActiveIndex(toggle, index) {
  if (!toggle) return;
  toggle.dataset.activeIndex = String(index);
  toggle.style.setProperty('--toggle-active-x', index === 0 ? '0%' : 'calc(100% + 4px)');
  toggle.style.setProperty('--lang-active-x', index === 0 ? '0%' : 'calc(100% + 4px)');
}

function renderLanguageOptions(countryCode = currentCountry) {
  const supportedLanguages = getSupportedLanguages(countryCode);
  document.querySelectorAll('.lang-toggle').forEach(toggle => {
    const buttons = Array.from(toggle.querySelectorAll('.lang-option'));
    buttons.forEach((button, index) => {
      const lang = supportedLanguages[index];
      if (!lang) {
        button.hidden = true;
        return;
      }
      button.hidden = false;
      button.dataset.lang = lang;
      button.id = `lang-${lang}`;
      button.textContent = getLanguageLabel(lang);
      button.setAttribute('aria-label', `Switch language to ${getLanguageLabel(lang)}`);
    });
  });
}
