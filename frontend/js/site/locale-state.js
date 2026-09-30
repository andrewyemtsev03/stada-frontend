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
  const suppliedValue = getSuppliedText(lang, key);
  if (suppliedValue !== undefined) return suppliedValue;
  if (key === 'footer_brand_text') {
    const value = STADA_COUNTRY_BY_CODE[currentCountry]?.footerText?.[lang];
    if (value) return value;
  }

  // The site identity belongs to the active country, not to a language. This
  // prevents a shared language fallback (for example English) from showing
  // "STADA Georgia" on another country's site while page content is loading.
  if (key === 'site_name' || key === 'hero_kicker') {
    const country = STADA_COUNTRY_BY_CODE[currentCountry];
    if (country?.siteName) return country.siteName;
  }

  for (const candidateLang of frontendLanguageFallbackOrder(lang)) {
    const value = FRONTEND_STATIC_TEXT[candidateLang]?.[key];
    if (value) {
      if (candidateLang === 'en' && key !== 'about_list1' && key !== 'about_list2') {
        const country = STADA_COUNTRY_BY_CODE[currentCountry];
        return String(value)
          .replaceAll('STADA Georgia', country?.siteName || `STADA ${country?.name || 'Georgia'}`)
          .replaceAll('Georgia', country?.name || 'Georgia');
      }
      return value;
    }
  }
  return '';
}

function applyFrontendStaticText(lang) {
  document.querySelectorAll('[data-static-i18n-key]').forEach(el => {
    const key = el.getAttribute('data-static-i18n-key');
    const value = getFrontendStaticText(lang, key);
    el.textContent = value;
    if (value) {
      el.textContent = value;
      el.hidden = false;
    }
  });

  document.querySelectorAll('[data-i18n-key]').forEach(el => {
    const key = el.getAttribute('data-i18n-key');
    const value = getFrontendStaticText(lang, key);
    el.textContent = value;
    if (value) {
      el.textContent = value;
      el.hidden = false;
    }
  });
  applyLocalizedInterface(lang);
}

const STADA_INTERFACE_COPY = {
  ru: ['Меню', 'Выбрать язык', 'Поиск страны', 'Интерактивный глобус STADA', 'Навигация по слайдам', 'Показать слайд', 'Предыдущая новость', 'Следующая новость', 'Сервис недоступен', 'Наши сервисы временно недоступны.', 'Мы работаем над устранением проблемы. Попробуйте обновить страницу позже.', 'Обновить страницу'],
  kz: ['Мәзір', 'Тілді таңдау', 'Елді іздеу', 'STADA интерактивті глобусы', 'Слайдтар арасында өту', 'Слайдты көрсету', 'Алдыңғы жаңалық', 'Келесі жаңалық', 'Қызмет қолжетімсіз', 'Қызметтеріміз уақытша қолжетімсіз.', 'Мәселені шешіп жатырмыз. Бетті кейінірек жаңартып көріңіз.', 'Бетті жаңарту'],
  kg: ['Меню', 'Тилди тандоо', 'Өлкөнү издөө', 'STADA интерактивдүү глобусу', 'Слайддар арасында өтүү', 'Слайдды көрсөтүү', 'Мурунку жаңылык', 'Кийинки жаңылык', 'Кызмат жеткиликсиз', 'Кызматтарыбыз убактылуу жеткиликсиз.', 'Көйгөйдү оңдоп жатабыз. Баракты кийинчерээк жаңыртып көрүңүз.', 'Баракты жаңыртуу'],
  ge: ['მენიუ', 'ენის არჩევა', 'ქვეყნის ძიება', 'STADA-ს ინტერაქტიული გლობუსი', 'სლაიდების ნავიგაცია', 'სლაიდის ჩვენება', 'წინა სიახლე', 'შემდეგი სიახლე', 'სერვისი მიუწვდომელია', 'ჩვენი სერვისები დროებით მიუწვდომელია.', 'ვმუშაობთ პრობლემის გამოსწორებაზე. სცადეთ გვერდის განახლება მოგვიანებით.', 'გვერდის განახლება'],
  en: ['Menu', 'Select language', 'Search country', 'Interactive STADA globe', 'Slide navigation', 'Show slide', 'Previous news', 'Next news', 'Service unavailable', 'Our services are temporarily unavailable.', 'We are working on fixing the problem. Please try refreshing the page later.', 'Refresh page'],
  az: ['Menyu', 'Dili seçin', 'Ölkə axtarışı', 'STADA interaktiv qlobusu', 'Slayd naviqasiyası', 'Slaydı göstər', 'Əvvəlki xəbər', 'Növbəti xəbər', 'Xidmət əlçatan deyil', 'Xidmətlərimiz müvəqqəti olaraq əlçatan deyil.', 'Problemi aradan qaldırırıq. Səhifəni daha sonra yeniləyin.', 'Səhifəni yenilə'],
  hy: ['Մենյու', 'Ընտրել լեզուն', 'Որոնել երկիրը', 'STADA-ի ինտերակտիվ գլոբուս', 'Սլայդների նավիգացիա', 'Ցուցադրել սլայդը', 'Նախորդ նորությունը', 'Հաջորդ նորությունը', 'Ծառայությունն անհասանելի է', 'Մեր ծառայությունները ժամանակավորապես անհասանելի են։', 'Մենք աշխատում ենք խնդիրը լուծելու ուղղությամբ։ Փորձեք ավելի ուշ թարմացնել էջը։', 'Թարմացնել էջը'],
  ro: ['Meniu', 'Selectează limba', 'Caută o țară', 'Globul interactiv STADA', 'Navigare între diapozitive', 'Afișează diapozitivul', 'Știrea anterioară', 'Știrea următoare', 'Serviciu indisponibil', 'Serviciile noastre sunt temporar indisponibile.', 'Lucrăm la remedierea problemei. Încearcă să reîncarci pagina mai târziu.', 'Reîncarcă pagina'],
  uz: ['Menyu', 'Tilni tanlash', 'Mamlakatni qidirish', 'STADA interaktiv globusi', 'Slaydlar navigatsiyasi', 'Slaydni ko‘rsatish', 'Oldingi yangilik', 'Keyingi yangilik', 'Xizmat mavjud emas', 'Xizmatlarimiz vaqtincha mavjud emas.', 'Muammoni bartaraf etmoqdamiz. Sahifani keyinroq yangilab ko‘ring.', 'Sahifani yangilash'],
};
Object.entries(STADA_INTERFACE_COPY).forEach(([lang, copy]) => {
  FRONTEND_STATIC_TEXT[lang].worldwide_country_search = copy[2];
  FRONTEND_STATIC_TEXT[lang].worldwide_globe_label = copy[3];
});

const STADA_ACCESSIBLE_COPY = {
  ru: ['Логотип STADA', 'Команда STADA', 'Специалисты STADA рассматривают планшет', 'Главный офис STADA в Бад-Фильбеле', 'Навигация внизу страницы', 'Факты о STADA', 'Команды, производство, лаборатории и события STADA', 'Миссия и ценности STADA', 'Команда лаборатории STADA за работой', 'Историческая карта города STADA', 'Страны STADA', 'Информация о выбранной стране', 'Продукция STADA'],
  kz: ['STADA логотипі', 'STADA командасы', 'STADA мамандары планшетті қарап отыр', 'Бад-Фильбельдегі STADA бас кеңсесі', 'Беттің төменгі навигациясы', 'STADA туралы деректер', 'STADA командалары, өндірісі, зертханалары және іс-шаралары', 'STADA миссиясы мен құндылықтары', 'STADA зертхана тобы жұмыс үстінде', 'STADA қаласының тарихи картасы', 'STADA елдері', 'Таңдалған ел туралы ақпарат', 'STADA өнімдері'],
  kg: ['STADA логотиби', 'STADA командасы', 'STADA адистери планшетти карап жатышат', 'Бад-Фильбельдеги STADA башкы кеңсеси', 'Барактын төмөнкү навигациясы', 'STADA тууралуу маалымат', 'STADA командалары, өндүрүшү, лабораториялары жана иш-чаралары', 'STADAнын миссиясы жана баалуулуктары', 'STADA лабораториясынын командасы иш үстүндө', 'STADA шаарынын тарыхый картасы', 'STADA өлкөлөрү', 'Тандалган өлкө тууралуу маалымат', 'STADA өнүмдөрү'],
  ge: ['STADA-ს ლოგო', 'STADA-ს გუნდი', 'STADA-ს სპეციალისტები პლანშეტს ათვალიერებენ', 'STADA-ს სათავო ოფისი ბად-ვილბელში', 'გვერდის ქვედა ნავიგაცია', 'ფაქტები STADA-ს შესახებ', 'STADA-ს გუნდები, წარმოება, ლაბორატორიები და ღონისძიებები', 'STADA-ს მისია და ღირებულებები', 'STADA-ს ლაბორატორიის გუნდი მუშაობისას', 'STADA-ს ქალაქის ისტორიული რუკა', 'STADA-ს ქვეყნები', 'ინფორმაცია არჩეული ქვეყნის შესახებ', 'STADA-ს პროდუქტები'],
  en: ['STADA logo', 'STADA team', 'STADA specialists reviewing a tablet', 'STADA headquarters in Bad Vilbel', 'Footer navigation', 'STADA facts', 'STADA teams, production, laboratories and events', 'STADA purpose and values', 'STADA laboratory team at work', 'Historic STADA city map', 'STADA countries', 'Selected country information', 'STADA products'],
  az: ['STADA loqosu', 'STADA komandası', 'STADA mütəxəssisləri planşetə baxırlar', 'Bad Vilbeldə STADA baş ofisi', 'Səhifənin aşağı naviqasiyası', 'STADA haqqında faktlar', 'STADA komandaları, istehsal, laboratoriyalar və tədbirlər', 'STADA-nın məqsədi və dəyərləri', 'STADA laboratoriya komandası iş başında', 'STADA şəhərinin tarixi xəritəsi', 'STADA ölkələri', 'Seçilmiş ölkə haqqında məlumat', 'STADA məhsulları'],
  hy: ['STADA-ի լոգո', 'STADA-ի թիմ', 'STADA-ի մասնագետները դիտում են պլանշետը', 'STADA-ի գլխավոր գրասենյակը Բադ Վիլբելում', 'Էջի ստորին նավիգացիա', 'Փաստեր STADA-ի մասին', 'STADA-ի թիմեր, արտադրություն, լաբորատորիաներ և միջոցառումներ', 'STADA-ի առաքելությունն ու արժեքները', 'STADA-ի լաբորատորիայի թիմը աշխատանքի ընթացքում', 'STADA քաղաքի պատմական քարտեզ', 'STADA-ի երկրներ', 'Տեղեկություն ընտրված երկրի մասին', 'STADA-ի արտադրանք'],
  ro: ['Sigla STADA', 'Echipa STADA', 'Specialiștii STADA privesc o tabletă', 'Sediul central STADA din Bad Vilbel', 'Navigare în subsolul paginii', 'Date despre STADA', 'Echipele, producția, laboratoarele și evenimentele STADA', 'Misiunea și valorile STADA', 'Echipa laboratorului STADA la lucru', 'Harta istorică a orașului STADA', 'Țările STADA', 'Informații despre țara selectată', 'Produsele STADA'],
  uz: ['STADA logotipi', 'STADA jamoasi', 'STADA mutaxassislari planshetni ko‘rib chiqmoqda', 'Bad Vilbeldagi STADA bosh ofisi', 'Sahifa pastidagi navigatsiya', 'STADA haqida ma’lumot', 'STADA jamoalari, ishlab chiqarish, laboratoriyalar va tadbirlar', 'STADA maqsadi va qadriyatlari', 'STADA laboratoriya jamoasi ish jarayonida', 'STADA shahrining tarixiy xaritasi', 'STADA mamlakatlari', 'Tanlangan mamlakat haqida ma’lumot', 'STADA mahsulotlari'],
};

function applyLocalizedInterface(lang) {
  const copy = STADA_INTERFACE_COPY[lang] || STADA_INTERFACE_COPY.en;
  const accessible = STADA_ACCESSIBLE_COPY[lang] || STADA_ACCESSIBLE_COPY.en;
  const setLabel = (selector, value) => document.querySelectorAll(selector).forEach(el => el.setAttribute('aria-label', value));
  const setAlt = (selector, value) => document.querySelectorAll(selector).forEach(el => {
    const id = el.dataset.backendImageId;
    if (backendPagePayload?.content?.dom?.images?.some(item => item.id === id && item.source === 'override')) return;
    el.setAttribute('alt', value);
  });
  setLabel('.logo, .footer-logo', accessible[0]);
  setAlt('.logo img, .footer-logo img', accessible[0]);
  setLabel('.hero-carousel', copy[4]);
  setLabel('.footer-nav', accessible[4]);
  setLabel('.about-stats, .footer-trust, .culture-facts', accessible[5]);
  setLabel('.about-values, .culture-purpose, .culture-values-strip', accessible[7]);
  setLabel('.worldwide-hero__media, .culture-hero__media', accessible[6]);
  setLabel('.history-hero .worldwide-hero__media', accessible[9]);
  setLabel('.history-summary', getTranslatedText(lang, 'nav_history'));
  setLabel('.worldwide-shell, .worldwide-info-column, [data-country-list]', accessible[10]);
  setLabel('.worldwide-country-detail', accessible[11]);
  setLabel('[data-globe-canvas]', copy[3]);
  setLabel('[data-product-badges], [data-product-metrics], .products-highlights, .catalog-metrics, .formula-showcase', accessible[12]);
  setAlt('[data-backend-image-id="index_image_002"], [data-backend-image-id="index_image_004"], [data-backend-image-id="about_image_002"]', accessible[1]);
  setAlt('[data-backend-image-id="index_image_003"]', accessible[2]);
  setAlt('.about-visual img', accessible[3]);
  setAlt('.culture-hero__media img, .worldwide-hero__media img', accessible[6]);
  setAlt('.culture-purpose img', accessible[7]);
  setAlt('[data-backend-image-id="culture_image_012"]', accessible[8]);
  setAlt('.history-hero .worldwide-hero__media img', accessible[9]);
  setAlt('.products-stage img, .catalog-hero__media img, .catalog-hero__image img', accessible[12]);
  document.querySelectorAll('.about-leader-card').forEach(el => {
    const heading = el.querySelector('h3');
    const img = el.querySelector('img');
    if (heading && img) img.alt = heading.textContent.trim();
  });
  document.querySelectorAll('.history-summary-card, .history-period, .history-event').forEach(el => {
    const heading = el.querySelector('h2, h3, h4');
    const img = el.querySelector('.history-summary-card__media img, .history-period__media img, .history-event__media img');
    if (heading && img) img.alt = heading.textContent.trim();
  });
  document.querySelectorAll('.footer-top').forEach(el => el.setAttribute('aria-label', getBackToTopLabel(lang)));
  document.querySelectorAll('.hamburger').forEach(el => el.setAttribute('aria-label', copy[0]));
  document.querySelectorAll('.lang-option').forEach(el => el.setAttribute('aria-label', `${copy[1]}: ${getLanguageLabel(el.dataset.lang)}`));
  document.querySelectorAll('[data-i18n-placeholder-key]').forEach(el => {
    const key = el.dataset.i18nPlaceholderKey;
    const value = key === 'worldwide_country_search' ? copy[2] : getTranslatedText(lang, key);
    el.setAttribute('placeholder', value || '');
  });
  document.querySelectorAll('[data-i18n-aria-label-key]').forEach(el => {
    const key = el.dataset.i18nAriaLabelKey;
    const value = key === 'worldwide_globe_label' ? copy[3] : getTranslatedText(lang, key);
    el.setAttribute('aria-label', value || '');
  });
  document.querySelectorAll('.hero-carousel-dots').forEach(el => el.setAttribute('aria-label', copy[4]));
  document.querySelectorAll('.hero-carousel-dot').forEach((el, index) => el.setAttribute('aria-label', `${copy[5]} ${index + 1}`));
  document.querySelectorAll('[data-news-prev]').forEach(el => el.setAttribute('aria-label', copy[6]));
  document.querySelectorAll('[data-news-next]').forEach(el => el.setAttribute('aria-label', copy[7]));
  const backToTop = document.getElementById('backToTop');
  if (backToTop) backToTop.setAttribute('aria-label', getBackToTopLabel(lang));
}

function applyLocalizedBackendDomText(lang) {
  const localizedText = frontendLanguageFallbackOrder(lang)
    .map(candidateLang => LOCALIZED_BACKEND_DOM_TEXT[candidateLang])
    .find(Boolean);
  if (!localizedText) { applySuppliedDocumentContent(lang); return; }

  Object.entries(localizedText).forEach(([id, value]) => {
    if (backendPagePayload?.content?.dom?.text?.some(item => item.id === id && item.source === 'override')) return;
    document.querySelectorAll(`[data-backend-text-id="${escapeCssIdentifier(id)}"]`).forEach(el => {
      el.textContent = value;
      el.dataset.backendTextValue = value;
      delete el.dataset.animated;
    });
  });
  applySuppliedDocumentContent(lang);
}

function getSuppliedText(lang, key) {
  const country = STADA_COUNTRY_BY_CODE[currentCountry]?.backendCountry;
  const localText = STADA_SUPPLIED_COPY.countries[country]?.[lang]?.text;
  if (localText && Object.hasOwn(localText, key)) return localText[key];
  return STADA_SUPPLIED_COPY.languages[lang]?.text?.[key]
    ?? STADA_SUPPLIED_COPY.translations?.[lang]?.text?.[key];
}

function applySuppliedDocumentContent(lang) {
  const supplied = STADA_SUPPLIED_COPY.languages[lang];
  document.querySelectorAll('.about-values li, .about-region-copy p').forEach(el => {
    const text = el.matches('p') ? el : el.querySelector('[data-i18n-key], [data-static-i18n-key]');
    const key = text?.dataset.i18nKey || text?.dataset.staticI18nKey;
    el.hidden = getSuppliedText(lang, key) === '';
  });
  const country = STADA_COUNTRY_BY_CODE[currentCountry]?.backendCountry;
  const leader = STADA_SUPPLIED_COPY.countries[country]?.[lang]?.leadership;
  document.querySelectorAll('[data-supplied-optional]').forEach(el => {
    el.hidden = getSuppliedText(lang, el.dataset.i18nKey) === undefined;
  });
  // Keep the existing English chronology: no English source was supplied.
  if (document.body.classList.contains('history-page')) {
    document.querySelectorAll('main > section:not(.history-hero):not([data-supplied-history])').forEach(el => {
      el.hidden = !!supplied;
    });
    document.querySelectorAll('[data-supplied-history]').forEach(el => { el.hidden = !supplied; });
    if (supplied) {
      document.querySelector('[data-backend-text-id="history_text_003"]').textContent = supplied.text.supplied_history_heading;
      document.querySelector('[data-backend-text-id="history_text_004"]').textContent = supplied.text.supplied_history_text_0;
    }
    const timelineLink = document.querySelector('.history-hero__actions a');
    if (timelineLink) timelineLink.href = supplied ? '#supplied-history-timeline' : '#history-timeline';
  }
  if (leader) {
    const link = document.querySelector('.about-leader-card a');
    if (link) link.href = getSiteAssetPath(leader.href);
  }
}

const STADA_AZURE_BACKEND_BASE_URL = 'https://api.stada.kz';
const STADA_RENDER_BACKEND_BASE_URL = 'https://stada-content-backend.onrender.com';
const STADA_BACKEND_HEALTH_PATH = '/health/db';
const STADA_BACKEND_HEALTH_TIMEOUT_MS = 3000;
const STADA_BACKEND_SELECTION_CACHE_KEY = 'stada-backend-selection-v1';
const STADA_BACKEND_SELECTION_CACHE_MS = 2 * 60 * 1000;
let STADA_BACKEND_BASE_URL = window.STADA_BACKEND_BASE_URL || STADA_RENDER_BACKEND_BASE_URL;
let STADA_DOMAIN_COUNTRY = '';
let STADA_CONFIG_COUNTRY = '';
let STADA_DEFAULT_COUNTRY = 'kz';
const backendPageCache = {};
const backendProductCache = {};
let backendPagePayload = null;
let backendProductPayload = null;
let localeRequestId = 0;

function getDocumentLanguage(lang) {
  return { kz: 'kk', kg: 'ky', ge: 'ka' }[lang] || lang;
}

function isCurrentLocaleRequest(id, country, lang) {
  return id === localeRequestId && country === currentCountry && lang === currentLang;
}
const BACKEND_REQUEST_TIMEOUT_MS = 12000;
const CRITICAL_IMAGE_WAIT_MS = 2500;

function readCachedBackendSelection() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(STADA_BACKEND_SELECTION_CACHE_KEY) || 'null');
    const allowedBases = new Set([STADA_AZURE_BACKEND_BASE_URL, STADA_RENDER_BACKEND_BASE_URL]);
    if (
      allowedBases.has(cached?.baseUrl)
      && Number.isFinite(cached?.checkedAt)
      && Date.now() - cached.checkedAt < STADA_BACKEND_SELECTION_CACHE_MS
    ) {
      return cached.baseUrl;
    }
  } catch (error) {
    // Storage can be unavailable in privacy modes; health selection still works.
  }
  return '';
}

function cacheBackendSelection(baseUrl) {
  try {
    sessionStorage.setItem(STADA_BACKEND_SELECTION_CACHE_KEY, JSON.stringify({
      baseUrl,
      checkedAt: Date.now(),
    }));
  } catch (error) {
    // Ignore storage failures.
  }
}

async function isBackendDatabaseHealthy(baseUrl) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), STADA_BACKEND_HEALTH_TIMEOUT_MS);

  try {
    const response = await fetch(new URL(STADA_BACKEND_HEALTH_PATH, baseUrl), {
      cache: 'no-store',
      credentials: 'omit',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) return false;
    const payload = await response.json();
    return payload?.status === 'ok' && payload?.database?.connected === true;
  } catch (error) {
    return false;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function selectFrontendBackendBaseUrl() {
  if (window.STADA_BACKEND_BASE_URL) {
    STADA_BACKEND_BASE_URL = window.STADA_BACKEND_BASE_URL;
    window.STADA_ACTIVE_BACKEND_BASE_URL = STADA_BACKEND_BASE_URL;
    return STADA_BACKEND_BASE_URL;
  }

  const cachedBaseUrl = readCachedBackendSelection();
  if (cachedBaseUrl) {
    STADA_BACKEND_BASE_URL = cachedBaseUrl;
  } else {
    STADA_BACKEND_BASE_URL = await isBackendDatabaseHealthy(STADA_AZURE_BACKEND_BASE_URL)
      ? STADA_AZURE_BACKEND_BASE_URL
      : STADA_RENDER_BACKEND_BASE_URL;
    cacheBackendSelection(STADA_BACKEND_BASE_URL);
  }

  window.STADA_ACTIVE_BACKEND_BASE_URL = STADA_BACKEND_BASE_URL;
  return STADA_BACKEND_BASE_URL;
}

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
    footerText: country?.footerText || {},
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
  const activeIndex = Math.max(0, Number(index) || 0);
  toggle.dataset.activeIndex = String(activeIndex);
  toggle.style.setProperty('--toggle-active-x', `${activeIndex * 100}%`);
  toggle.style.setProperty('--lang-active-x', `${activeIndex * 100}%`);
}

function renderLanguageOptions(countryCode = currentCountry) {
  const supportedLanguages = getSupportedLanguages(countryCode);
  document.querySelectorAll('.lang-toggle').forEach(toggle => {
    const buttons = Array.from(toggle.querySelectorAll('.lang-option'));
    while (buttons.length < supportedLanguages.length) {
      const button = document.createElement('button');
      button.className = 'lang-option';
      button.type = 'button';
      toggle.appendChild(button);
      buttons.push(button);
    }
    toggle.dataset.languageCount = String(supportedLanguages.length);
    toggle.style.setProperty('--lang-count', String(Math.max(1, supportedLanguages.length)));
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
      const copy = STADA_INTERFACE_COPY[currentLang] || STADA_INTERFACE_COPY.en;
      button.setAttribute('aria-label', `${copy[1]}: ${getLanguageLabel(lang)}`);
    });
  });
}
