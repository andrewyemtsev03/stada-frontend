function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.menu a');
  if (!sections.length || !navLinks.length) return;
  if (document.body.classList.contains('culture-page')) {
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === 'culture.html' || href === '../culture.html');
    });
    return;
  }
  if (document.body.classList.contains('history-page')) {
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === 'history.html');
    });
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const id = entry.target.getAttribute('id');
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          // Remove previous actives
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}` || link.getAttribute('href') === `${location.pathname}#${id}` || link.getAttribute('href') === `../index.html#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
  sections.forEach(section => observer.observe(section));
}

// Shrink the navigation bar on scroll and reveal back to top button
function initScrollEffects() {
  const navBar = document.querySelector('nav');
  if (!navBar) return;
  const backToTop = document.createElement('button');
  backToTop.id = 'backToTop';
  backToTop.setAttribute('aria-label', getBackToTopLabel(currentLang));
  backToTop.innerHTML = '↑';
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.body.appendChild(backToTop);
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 50;
    navBar.classList.toggle('scrolled', scrolled);
    if (backToTop) {
      if (window.scrollY > 400) {
        backToTop.classList.add('show');
      } else {
        backToTop.classList.remove('show');
      }
    }
  });
}

// Animate numerical counters when they become visible
function initCounters() {
  const counters = document.querySelectorAll('.career-fact .number');
  if (!counters.length) return;
  const animateCounter = (el, endVal, formatValue, finalText) => {
    const duration = 2000;
    const startTime = performance.now();
    const startVal = 0;
    const animate = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const value = Math.floor(progress * (endVal - startVal) + startVal);
      el.textContent = el.dataset.prefix + formatValue(value) + el.dataset.suffix;
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        el.textContent = finalText;
      }
    };
    requestAnimationFrame(animate);
  };
  const parseNumber = (text) => {
    // Extract digits and return numeric value; ignore thousands separators and symbols
    const match = text.replace(/[^0-9]/g, '');
    return parseInt(match, 10) || 0;
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (!el.dataset.animated) {
          // Store prefix and suffix so we can reassemble the original format
          const text = el.dataset.backendTextValue || el.textContent;
          if (!/[0-9]/.test(text)) {
            el.textContent = text;
            el.dataset.animated = 'true';
            return;
          }
          const prefixMatch = text.match(/^[^0-9]+/);
          const suffixMatch = text.match(/[^0-9]+$/);
          el.dataset.prefix = prefixMatch ? prefixMatch[0] : '';
          el.dataset.suffix = suffixMatch ? suffixMatch[0] : '';
          const endVal = parseNumber(text);
          const shouldGroup = endVal >= 1000 || /\d[\s\u00a0]\d/.test(text);
          const formatValue = shouldGroup
            ? value => value.toLocaleString('ru-RU').replace(/\s/g, '\u00a0')
            : value => String(value);
          animateCounter(el, endVal, formatValue, text);
          el.dataset.animated = 'true';
        }
      }
    });
  }, { threshold: 0.6 });
  counters.forEach(el => observer.observe(el));
}

// Set the current year in the footer
function setYear() {
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}

function initHistoryTimelineMedia() {
  if (!document.body.classList.contains('history-page')) return;

  const periodImages = {
    'period-1895': 'assets/history/period-1895-1933.jpg',
    'period-1933': 'assets/history/period-1933-1948.jpg',
    'period-1948': 'assets/history/period-1948-1961.jpg',
    'period-1961': 'assets/history/period-1961-1975.jpg',
    'period-1975': 'assets/history/period-1975-1993.png',
    'period-1993': 'assets/history/period-1993-2000.jpg',
    'period-2000': 'assets/history/period-2000-2005.png',
    'period-2005': 'assets/history/period-2005-2010.jpg',
    'period-2010': 'assets/history/period-2010-2015.jpg',
    'period-2016': 'assets/history/2019.jpg'
  };

  const eventImages = {
    '1895': 'assets/history/1895.jpg',
    '1903': 'assets/history/1903.jpg',
    '1908': 'assets/history/1908.jpg',
    '1933': 'assets/history/1933.jpg',
    '1935': 'assets/history/1935.jpg',
    '1938': 'assets/history/1938.jpg',
    '1948': 'assets/history/1948.jpg',
    '1954': 'assets/history/1954.jpg',
    '1957': 'assets/history/1957.jpg',
    '1961': 'assets/history/1961.jpg',
    '1970': 'assets/history/1970.jpg',
    '1971': 'assets/history/1971.jpg',
    '1975': 'assets/history/1975.jpg',
    '1986': 'assets/history/1986.png',
    '1992': 'assets/history/1992.png',
    '1993': 'assets/history/1993.png',
    '1995': 'assets/history/1995.jpg',
    '1996': 'assets/history/1996.jpg',
    '1997': 'assets/history/1997.jpg',
    '1998': 'assets/history/1998.jpg',
    '1999': 'assets/history/1999.jpg',
    '2000': 'assets/history/2000.jpg',
    '2001': 'assets/history/2001.jpg',
    '2002': 'assets/history/2002.png',
    '2003': 'assets/history/2003.png',
    '2004': 'assets/history/2004.png',
    '2005': 'assets/history/2005.jpg',
    '2006': 'assets/history/2006.jpg',
    '2007': 'assets/history/2007.jpg',
    '2008': 'assets/history/2008.jpg',
    '2010': 'assets/history/2010.png',
    '2011': 'assets/history/2011.png',
    '2012': 'assets/history/2012.png',
    '2013': 'assets/history/2013.jpg',
    '2014': 'assets/history/2014.jpg',
    '2015': 'assets/history/2015.jpg',
    '2016': 'assets/history/2016.jpg',
    '2017': 'assets/history/2017.jpg',
    '2018': 'assets/history/2018.jpg',
    '2019': 'assets/history/2019.jpg',
    '2020': 'assets/history/2020.jpg',
    '2021': 'assets/history/2021.jpg',
    '2022': 'assets/history/2022.png'
  };

  const summaryImages = {
    '1895': 'assets/history/period-1895-1933.jpg',
    '1975': 'assets/history/period-1975-1993.png',
    '1997': 'assets/history/1997.jpg',
    '2022': 'assets/history/2022.png'
  };

  document.querySelectorAll('.history-summary-card').forEach(card => {
    const year = card.querySelector('span')?.textContent.trim();
    const src = summaryImages[year];
    if (!src || card.querySelector('.history-summary-card__media')) return;

    const title = card.querySelector('h2')?.textContent.trim() || `STADA ${year}`;
    const figure = document.createElement('figure');
    figure.className = 'history-summary-card__media';
    figure.innerHTML = `<img src="${src}" alt="${title}" loading="lazy">`;
    card.insertBefore(figure, card.firstElementChild);
  });

  document.querySelectorAll('.history-period').forEach(period => {
    const src = periodImages[period.id];
    const header = period.querySelector('.history-period__header');
    if (!src || !header || header.querySelector('.history-period__media')) return;

    const title = header.querySelector('h3')?.textContent.trim() || 'STADA company history';
    const figure = document.createElement('figure');
    figure.className = 'history-period__media';
    figure.innerHTML = `<img src="${src}" alt="${title}" loading="lazy">`;
    header.insertBefore(figure, header.firstElementChild);
  });

  document.querySelectorAll('.history-event').forEach(event => {
    const year = event.querySelector('time')?.textContent.trim();
    const src = eventImages[year];
    if (!src || event.querySelector('.history-event__media')) return;

    const title = event.querySelector('h4')?.textContent.trim() || `STADA ${year}`;
    const figure = document.createElement('figure');
    figure.className = 'history-event__media';
    figure.innerHTML = `<img src="${src}" alt="${title}" loading="lazy">`;
    event.insertBefore(figure, event.firstElementChild);
  });
}

// Bind event listeners
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadFrontendCountryOptions();
    initializeLocaleState();
    renderLanguageOptions(currentCountry);
  } catch (error) {
    showBackendRequiredMessage(error);
    return;
  }
  initHomeHeroCopyFit();
  // Initial language update
  updateLanguage(currentLang);
  // Initialise libraries
  initSwiper();
  initAOS();
  // Initialise custom scroll behaviours
  initScrollSpy();
  initScrollEffects();
  initHomeScrollReveal();
  initProductsScrollReveal();
  initCounters();
  initHistoryTimelineMedia();
  initHistoryScrollReveal();
  setYear();
  // Bind language switcher
  // Prefer the redesigned dual‑button toggle if present.  Each button
  // specifies its target language via the data‑lang attribute.  If
  // neither is found (e.g. on older pages) fall back to the single
  // toggle button and the toggleLanguage() helper.
  const langOptions = document.querySelectorAll('.lang-toggle .lang-option');
  if (langOptions.length) {
    langOptions.forEach(button => {
      button.addEventListener('click', () => updateLanguage(button.dataset.lang));
    });
  } else {
    const langBtn = document.getElementById('langBtn');
    if (langBtn) langBtn.addEventListener('click', toggleLanguage);
  }

  // Initialise homepage carousels
  initHeroCarousel();
  initHeroMetricCounters();
  initNewsCarousel();
  initProductsCarousel();
  initProductCatalogFilters();
  initProductDetailPage();
  initVitrumFizzyHeroLevitation();
  initMagneHeroLevitation();
  initEnterogerminaCapsulesHeroLevitation();
  initEnterogerminaForteHeroLevitation();
  initAqualorForteHeroLevitation();
  initAqualorBabyHeroLevitation();
  initAqualorGorloHeroLevitation();
  initAqualorSoftHeroLevitation();
  initAqualorSoftMiniHeroLevitation();
  initNizoralHeroLevitation();
  initFemilexHeroLevitation();
  initNoshpaForteLevitation();
  initGecsikonLevitation();
  initKlopidogrelTevaLevitation();
  // Bind hamburger menu
  const hamburger = document.querySelector('.hamburger');
  const menu = document.querySelector('.menu');
  if (hamburger && menu) {
    if (!menu.id) menu.id = 'site-menu';
    hamburger.setAttribute('type', 'button');
    hamburger.setAttribute('aria-controls', menu.id);
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.addEventListener('click', toggleMenu);
  }

  // Keep the language switcher in the main navigation on larger screens,
  // but make it part of the hamburger panel on mobile.
  const langToggle = document.querySelector('.nav-container > .lang-toggle');
  const langToggleDesktopMarker = langToggle ? document.createComment('language-toggle') : null;
  if (langToggle && langToggleDesktopMarker) {
    const mobileLanguageItem = document.createElement('li');
    mobileLanguageItem.className = 'menu-language';
    langToggle.parentNode.insertBefore(langToggleDesktopMarker, langToggle);

    const placeLanguageToggle = () => {
      if (window.innerWidth <= 768) {
        if (langToggle.parentNode !== mobileLanguageItem) {
          mobileLanguageItem.appendChild(langToggle);
          menu.appendChild(mobileLanguageItem);
        }
      } else if (langToggle.parentNode === mobileLanguageItem) {
        langToggleDesktopMarker.parentNode.insertBefore(langToggle, langToggleDesktopMarker.nextSibling);
        mobileLanguageItem.remove();
      }
    };

    placeLanguageToggle();
    window.addEventListener('resize', placeLanguageToggle);
  }
  // Close mobile menu when clicking a nav link
  document.querySelectorAll('.menu a').forEach(link => {
    link.addEventListener('click', () => {
      setMenuOpen(false);
    });
  });
  document.addEventListener('click', event => {
    const menu = document.querySelector('.menu');
    const hamburger = document.querySelector('.hamburger');
    if (!menu || !hamburger || !menu.classList.contains('open')) return;
    if (menu.contains(event.target) || hamburger.contains(event.target)) return;
    setMenuOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') setMenuOpen(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) setMenuOpen(false);
  });

  // After initialisation, reveal the hero section.  This prevents
  // unstyled content from flashing onscreen before the overlay and
  // backend content is ready. The class toggled here corresponds to
  // CSS rules that fade in the hero section.
  const heroSection = document.querySelector('.hero-section');
  if (heroSection) {
    // Mark all hero overlays as visible and remove inline hidden styles to prevent initial centered flash
    document.querySelectorAll('.hero-overlay').forEach(el => {
      el.classList.add('visible');
      // Unhide overlays if inline styles were set to hide them initially
      el.style.visibility = 'visible';
      el.style.opacity = '1';
    });
    heroSection.classList.add('loaded');
  }
});
