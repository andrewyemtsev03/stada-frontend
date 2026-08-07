function getBackToTopLabel(lang) {
  if (lang === 'ge') return 'ზემოთ დაბრუნება';
  if (lang === 'en') return 'Back to top';
  if (lang === 'kg') return 'Жогору кайтуу';
  if (lang === 'kz') return 'Жоғарыға қайту';
  return 'Вернуться наверх';
}

function updateStaticLanguage(lang) {
  lang = resolveLanguageForCountry(lang);
  currentLang = lang;
  persistLocaleState();
  document.documentElement.lang = lang;
  applyFrontendStaticText(lang);

  document.querySelectorAll('[data-i18n-key]').forEach(el => {
    const key = el.getAttribute('data-i18n-key');
    const translation = getTranslatedText(lang, key);
    if (translation) {
      el.textContent = translation;
      el.hidden = false;
    } else if (el.closest('.benefits-list')) {
      el.textContent = '';
      el.hidden = true;
    }
  });

  document.querySelectorAll('[data-i18n-placeholder-key]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder-key');
    const translation = getTranslatedText(lang, key);
    if (translation) el.setAttribute('placeholder', translation);
  });

  document.querySelectorAll('[data-i18n-aria-label-key]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria-label-key');
    const translation = getTranslatedText(lang, key);
    if (translation) el.setAttribute('aria-label', translation);
  });

  setLanguageToggleState(lang);

  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.setAttribute('aria-label', getBackToTopLabel(lang));
  }

  updateDocumentTitle(lang);
  document.dispatchEvent(new CustomEvent('stada:languagechange', { detail: { lang, country: currentCountry } }));
  document.querySelectorAll('.hero-overlay').forEach(overlay => {
    overlay.classList.add('visible');
  });
}

// Helper to update all elements with data-i18n-key
function updateLanguage(lang) {
  lang = resolveLanguageForCountry(lang);
  if (isDynamicProductDetailPage()) {
    updateDynamicProductPage(lang).catch(error => {
      showBackendRequiredMessage(error);
    });
    return;
  }
  if (isBackendDrivenPage()) {
    updateBackendDrivenPage(lang).catch(error => {
      handleBackendPageFailure(error);
    });
    return;
  }
  updateStaticLanguage(lang);
}

function updateCountry(countryCode) {
  const nextCountry = normalizeCountryCode(countryCode);
  if (nextCountry === currentCountry) return;
  currentCountry = nextCountry;
  exposeCurrentCountry();
  backendPagePayload = null;
  updateLanguage(resolveLanguageForCountry(currentLang, nextCountry));
}

// Toggle languages on button click
function toggleLanguage() {
  const supportedLanguages = getSupportedLanguages();
  const currentIndex = supportedLanguages.indexOf(currentLang);
  updateLanguage(supportedLanguages[(currentIndex + 1) % supportedLanguages.length] || supportedLanguages[0]);
}

function updateDocumentTitle(lang) {
  const explicitTitle = document.querySelector('title[data-i18n-key]');
  if (explicitTitle) {
    const titleKey = explicitTitle.getAttribute('data-i18n-key');
    const title = getTranslatedText(lang, titleKey);
    if (title) {
      explicitTitle.textContent = title;
      return;
    }
  }

  const productHeading = document.querySelector('.product-detail-page h1[data-i18n-key]');
  if (productHeading?.textContent.trim()) {
    document.title = `STADA - ${productHeading.textContent.trim()}`;
    return;
  }

  const pageTitleMap = [
    ['worldwide-page', 'worldwide_page_title'],
    ['products-page', 'products_heading'],
    ['history-page', 'nav_history'],
    ['culture-page', 'culture_page_title']
  ];
  const bodyClass = document.body?.classList;
  const matched = pageTitleMap.find(([className]) => bodyClass?.contains(className));
  if (matched) {
    const title = getTranslatedText(lang, matched[1]);
    if (title) {
      document.title = matched[1] === 'worldwide_page_title' ? title : `STADA - ${title}`;
      return;
    }
  }

  const homeTitle = getTranslatedText(lang, 'nav_about');
  if (homeTitle) document.title = `STADA - ${homeTitle}`;
}

// Mobile menu toggle
