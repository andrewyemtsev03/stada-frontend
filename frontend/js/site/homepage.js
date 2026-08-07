function setMenuOpen(isOpen) {
  const menu = document.querySelector('.menu');
  const hamburger = document.querySelector('.hamburger');
  if (!menu || !hamburger) return;

  menu.classList.toggle('open', isOpen);
  hamburger.classList.toggle('active', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
}

function toggleMenu() {
  const menu = document.querySelector('.menu');
  if (!menu) return;
  setMenuOpen(!menu.classList.contains('open'));
}

// Initialise Swiper carousel
function initSwiper() {
  // Only initialise the hero swiper if the element exists.  Product pages
  // do not include a hero carousel, so without this guard Swiper would
  // throw an error.  If a container with the `.hero-swiper` class is
  // found, configure it with the same settings used on the landing page.
  const swiperEl = document.querySelector('.hero-swiper');
  if (!swiperEl) return;
  new Swiper('.hero-swiper', {
    loop: false,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    // Use the default slide effect to avoid overlay glitches when the page loads.
    effect: 'slide'
  });
}

// Initialise AOS library
function initAOS() {
  // Only initialise AOS if the library is present.  In the redesigned
  // site the AOS script may be omitted to reduce external dependencies.
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      once: true
    });
  }
}

function initHomeHeroCopyFit() {
  const hero = document.querySelector('.stada-home-hero');
  const copy = hero?.querySelector('.stada-home-hero__copy');
  const title = copy?.querySelector('h1');
  if (!hero || !copy || !title) return;

  let fitFrame = null;

  function doesHeroCopyFit() {
    return copy.scrollHeight <= copy.clientHeight + 1
      && copy.scrollWidth <= copy.clientWidth + 1
      && title.scrollWidth <= title.clientWidth + 1;
  }

  function fitHeroCopy() {
    fitFrame = null;
    hero.classList.remove('is-hero-copy-dense');
    hero.style.removeProperty('height');
    hero.style.setProperty('--home-hero-title-scale', '1');

    if (!copy.clientHeight || doesHeroCopyFit()) return;

    hero.classList.add('is-hero-copy-dense');

    const minScale = window.innerWidth <= 420 ? 0.58 : window.innerWidth <= 760 ? 0.64 : 0.7;
    let low = minScale;
    let high = 1;

    for (let i = 0; i < 8; i += 1) {
      const mid = (low + high) / 2;
      hero.style.setProperty('--home-hero-title-scale', mid.toFixed(3));
      if (doesHeroCopyFit()) {
        low = mid;
      } else {
        high = mid;
      }
    }

    hero.style.setProperty('--home-hero-title-scale', low.toFixed(3));

    if (!doesHeroCopyFit()) {
      const extraHeight = Math.ceil(copy.scrollHeight - copy.clientHeight + 24);
      if (extraHeight > 0) {
        hero.style.height = `${hero.clientHeight + extraHeight}px`;
      }
    }
  }

  function scheduleHeroCopyFit() {
    if (fitFrame) window.cancelAnimationFrame(fitFrame);
    fitFrame = window.requestAnimationFrame(fitHeroCopy);
  }

  window.addEventListener('resize', scheduleHeroCopyFit);
  document.addEventListener('stada:languagechange', scheduleHeroCopyFit);

  if (document.fonts?.ready) {
    document.fonts.ready.then(scheduleHeroCopyFit).catch(() => {});
  }

  new MutationObserver(scheduleHeroCopyFit).observe(copy, {
    childList: true,
    characterData: true,
    subtree: true
  });

  scheduleHeroCopyFit();
}

// Initialise the homepage hero image carousel.
function initHeroCarousel() {
  const carousel = document.querySelector('[data-hero-carousel]');
  if (!carousel) return;

  const hero = carousel.closest('.stada-home-hero');
  const slides = Array.from(carousel.querySelectorAll('.hero-carousel-slide'));
  const dots = Array.from(carousel.querySelectorAll('.hero-carousel-dot'));
  const caption = document.querySelector('[data-hero-caption]');
  const heroTitle = hero?.querySelector('.stada-home-hero__copy h1');
  const heroLead = hero?.querySelector('.stada-home-hero__lead');
  const prevButton = carousel.querySelector('[data-hero-prev]');
  const nextButton = carousel.querySelector('[data-hero-next]');
  if (slides.length < 2) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activeIndex = 0;
  let timerId = null;
  let transitionTimerId = null;
  let transitionEndTimerId = null;
  let isTransitioning = false;
  let queuedIndex = null;

  function clearHeroTransitionTimers() {
    if (transitionTimerId) {
      window.clearTimeout(transitionTimerId);
      transitionTimerId = null;
    }
    if (transitionEndTimerId) {
      window.clearTimeout(transitionEndTimerId);
      transitionEndTimerId = null;
    }
  }

  function setHeroTransitionState(state) {
    if (!hero) return;
    hero.classList.toggle('is-changing-out', state === 'out');
    hero.classList.toggle('is-changing-in', state === 'in');
  }

  function applySlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    if (hero) {
      hero.dataset.heroActiveSlide = String(activeIndex);
    }
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });
    carousel.classList.toggle('hero-carousel--awards-active', slides[activeIndex].classList.contains('hero-carousel-slide--awards'));
    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeIndex;
      dot.classList.toggle('is-active', isActive);
      if (isActive) {
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.removeAttribute('aria-current');
      }
    });

    const captionKey = slides[activeIndex].dataset.captionKey;
    if (caption && captionKey) {
      caption.setAttribute('data-i18n-key', captionKey);
      caption.textContent = getTranslatedText(currentLang, captionKey) || '';
    }

    const titleKey = slides[activeIndex].dataset.titleKey;
    if (heroTitle && titleKey) {
      heroTitle.setAttribute('data-i18n-key', titleKey);
      heroTitle.textContent = getTranslatedText(currentLang, titleKey) || '';
    }

    const leadKey = slides[activeIndex].dataset.leadKey;
    if (heroLead && leadKey) {
      heroLead.setAttribute('data-i18n-key', leadKey);
      heroLead.textContent = getTranslatedText(currentLang, leadKey) || '';
    }
  }

  function showSlide(index, options = {}) {
    const nextIndex = (index + slides.length) % slides.length;
    const animate = options.animate !== false && !reduceMotion && !!hero;

    if (nextIndex === activeIndex && !isTransitioning) return;

    if (!animate) {
      clearHeroTransitionTimers();
      isTransitioning = false;
      queuedIndex = null;
      setHeroTransitionState(null);
      applySlide(nextIndex);
      return;
    }

    if (isTransitioning) {
      queuedIndex = nextIndex;
      return;
    }

    isTransitioning = true;
    hero.classList.add('has-carousel-transitioned');
    setHeroTransitionState('out');

    transitionTimerId = window.setTimeout(() => {
      transitionTimerId = null;
      applySlide(nextIndex);
      setHeroTransitionState('in');

      transitionEndTimerId = window.setTimeout(() => {
        transitionEndTimerId = null;
        isTransitioning = false;
        setHeroTransitionState(null);

        if (queuedIndex !== null && queuedIndex !== activeIndex) {
          const queued = queuedIndex;
          queuedIndex = null;
          showSlide(queued);
        } else {
          queuedIndex = null;
        }
      }, 980);
    }, 560);
  }

  function stopAutoplay() {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  function startAutoplay() {
    if (reduceMotion) return;
    stopAutoplay();
    timerId = window.setInterval(() => {
      showSlide(activeIndex + 1);
    }, 5500);
  }

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      showSlide(activeIndex - 1);
      startAutoplay();
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      showSlide(activeIndex + 1);
      startAutoplay();
    });
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      showSlide(Number(dot.dataset.heroSlide));
      startAutoplay();
    });
  });

  carousel.addEventListener('pointerenter', stopAutoplay);
  carousel.addEventListener('pointerleave', startAutoplay);
  carousel.addEventListener('focusin', stopAutoplay);
  carousel.addEventListener('focusout', startAutoplay);

  applySlide(0);
  startAutoplay();
}

function initHeroMetricCounters() {
  const counters = document.querySelectorAll('[data-hero-count]');
  if (!counters.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const formatNumber = value => Math.round(value).toLocaleString('ru-RU').replace(/\u00a0/g, ' ');

  counters.forEach(counter => {
    const target = Number(counter.dataset.heroCount);
    const suffix = counter.dataset.heroSuffix || '';
    if (!Number.isFinite(target)) return;

    if (reduceMotion) {
      counter.textContent = `${formatNumber(target)}${suffix}`;
      return;
    }

    const duration = target > 1000 ? 1700 : 1350;
    const startTime = performance.now();

    function animate(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = `${formatNumber(target * eased)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        counter.textContent = `${formatNumber(target)}${suffix}`;
      }
    }

    requestAnimationFrame(animate);
  });
}

function initNewsCarousel() {
  const carousel = document.querySelector('[data-news-carousel]');
  if (!carousel) return;

  const track = carousel.querySelector('[data-news-track]');
  const getCards = () => Array.from(track?.querySelectorAll('.news-card') || []);
  const prevButton = document.querySelector('[data-news-prev]');
  const nextButton = document.querySelector('[data-news-next]');
  const current = document.querySelector('[data-news-current]');
  const total = document.querySelector('[data-news-total]');
  const progress = carousel.querySelector('[data-news-progress]');
  if (!track || !getCards().length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  track.scrollLeft = 0;
  let autoplayId = null;
  let rafId = null;

  const formatIndex = value => String(value).padStart(2, '0');
  const getPositions = () => getCards().map(card => card.offsetLeft - track.offsetLeft);
  const getMaxStartIndex = () => {
    const cards = getCards();
    const positions = getPositions();
    if (!cards.length) return 0;
    const maxScroll = track.scrollWidth - track.clientWidth;
    const tolerance = Math.max(24, cards[0].getBoundingClientRect().width * 0.1);
    let maxIndex = positions.length - 1;
    while (maxIndex > 0 && positions[maxIndex] - maxScroll > tolerance) {
      maxIndex -= 1;
    }
    return maxIndex;
  };
  const getIndex = () => {
    const positions = getPositions();
    const closestIndex = positions.reduce((closest, position, index) => {
      const currentDistance = Math.abs(track.scrollLeft - positions[closest]);
      const nextDistance = Math.abs(track.scrollLeft - position);
      return nextDistance < currentDistance ? index : closest;
    }, 0);
    return Math.min(closestIndex, getMaxStartIndex());
  };

  function updateState() {
    const index = getIndex();
    const pageCount = getMaxStartIndex() + 1;
    if (current) current.textContent = formatIndex(index + 1);
    if (total) total.textContent = formatIndex(pageCount);
    if (progress) {
      progress.style.width = `${100 / pageCount}%`;
      progress.style.transform = `translateX(${index * 100}%)`;
    }
  }

  function scrollToIndex(index) {
    const maxStartIndex = getMaxStartIndex();
    const pageCount = maxStartIndex + 1;
    const normalized = (index + pageCount) % pageCount;
    const positions = getPositions();
    track.scrollTo({
      left: positions[normalized],
      behavior: reduceMotion ? 'auto' : 'smooth'
    });
  }

  function stopAutoplay() {
    if (autoplayId) {
      window.clearInterval(autoplayId);
      autoplayId = null;
    }
  }

  function startAutoplay() {
    if (reduceMotion) return;
    stopAutoplay();
    autoplayId = window.setInterval(() => {
      scrollToIndex(getIndex() + 1);
    }, 6500);
  }

  prevButton?.addEventListener('click', () => {
    scrollToIndex(getIndex() - 1);
    startAutoplay();
  });

  nextButton?.addEventListener('click', () => {
    scrollToIndex(getIndex() + 1);
    startAutoplay();
  });

  carousel.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollToIndex(getIndex() - 1);
      startAutoplay();
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollToIndex(getIndex() + 1);
      startAutoplay();
    }
  });

  track.addEventListener('scroll', () => {
    if (rafId) window.cancelAnimationFrame(rafId);
    rafId = window.requestAnimationFrame(updateState);
  });

  carousel.addEventListener('pointerenter', stopAutoplay);
  carousel.addEventListener('pointerleave', startAutoplay);
  carousel.addEventListener('focusin', stopAutoplay);
  carousel.addEventListener('focusout', startAutoplay);
  window.addEventListener('resize', updateState);

  updateState();
  startAutoplay();
}

// Initialise the auto-scrolling products carousel.
function initProductsCarousel() {
  const carousel = document.querySelector('.products-carousel');
  if (!carousel) return;
  // Duplicate the current children to allow seamless looping.  Append
  // the existing inner HTML once so that the original set of products
  // appears twice in sequence.  This allows us to translate the
  // container continuously across the viewport without exposing a gap.
  carousel.innerHTML += carousel.innerHTML;
  let isPaused = false;
  let offset = 0;
  // Increase the speed slightly compared to the previous iteration to
  // achieve a brisker scroll.  This value represents the number of
  // pixels moved per animation frame.
  const speed = 0.5;
  // Record the total width of the original (pre‑duplicated) content.
  const originalWidth = carousel.scrollWidth / 2;
  // Enable hardware acceleration for smoother animations.
  carousel.style.willChange = 'transform';
  function animate() {
    if (!isPaused) {
      offset += speed;
      if (offset >= originalWidth) {
        // Loop back by subtracting the original width rather than
        // resetting to zero.  This prevents any visible jump.
        offset -= originalWidth;
      }
      carousel.style.transform = `translateX(-${offset}px)`;
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
  // Pause scrolling when the pointer enters the carousel and resume
  // when it leaves.  Using pointer events captures mouse and touch
  // interactions uniformly.
  carousel.addEventListener('pointerenter', () => { isPaused = true; });
  carousel.addEventListener('pointerleave', () => { isPaused = false; });
}

function initProductCatalogFilters() {
  const filters = Array.from(document.querySelectorAll('[data-product-filter]'));
  if (!filters.length) return;

  filters.forEach(filterButton => {
    filterButton.addEventListener('click', () => {
      applyProductCatalogFilter(filterButton.dataset.productFilter);
    });
  });

  const linkedCategory = getCurrentProductCategoryFromUrl();
  if (linkedCategory) applyProductCatalogFilter(linkedCategory);
}

function animateProductMetricValue(element) {
  if (element.dataset.countupDone) return;
  element.dataset.countupDone = 'true';
  const original = element.textContent.trim();
  const match = original.match(/^([^\d]*)(\d{1,6})([.,]\d+)?(.*)$/);
  if (!match) return;
  const target = parseInt(match[2], 10);
  if (!isFinite(target) || target <= 1) return;

  const begin = () => {
    const duration = 900;
    const start = performance.now();
    const step = now => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = `${match[1]}${Math.round(target * eased)}${match[3] || ''}${match[4] || ''}`;
      if (progress < 1) window.requestAnimationFrame(step);
      else element.textContent = original;
    };
    element.textContent = `${match[1]}0${match[3] || ''}${match[4] || ''}`;
    window.requestAnimationFrame(step);
  };

  if (document.body.classList.contains('stada-page-loaded') || typeof MutationObserver === 'undefined') {
    begin();
    return;
  }
  const waiter = new MutationObserver(() => {
    if (!document.body.classList.contains('stada-page-loaded')) return;
    waiter.disconnect();
    begin();
  });
  waiter.observe(document.body, { attributes: true, attributeFilter: ['class'] });
}

let productMetricCountupObserver = null;

function initProductMetricCountups(page) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof IntersectionObserver === 'undefined') return;

  if (!productMetricCountupObserver) {
    productMetricCountupObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        productMetricCountupObserver.unobserve(entry.target);
        animateProductMetricValue(entry.target);
      });
    }, { threshold: 0.6 });
  }

  page.querySelectorAll('.product-hero-metric strong, .product-fact-card > span').forEach(element => {
    if (element.dataset.countupBound) return;
    element.dataset.countupBound = 'true';
    productMetricCountupObserver.observe(element);
  });
}

function attachProductTilt(container, target, maxTilt) {
  if (!container || !target || container.dataset.tiltBound) return;
  container.dataset.tiltBound = 'true';
  let frame = 0;

  container.addEventListener('pointermove', event => {
    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    if (frame) window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      target.style.transform = `perspective(900px) rotateX(${(-py * maxTilt).toFixed(2)}deg) rotateY(${(px * maxTilt).toFixed(2)}deg)`;
    });
  });

  container.addEventListener('pointerleave', () => {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    target.style.transform = '';
  });
}

function initProductTiltEffects(page) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const heroImage = page.querySelector('.product-hero-image');
  attachProductTilt(heroImage, heroImage, 5);

  const formulaStage = page.querySelector('.formula-showcase-stage');
  attachProductTilt(formulaStage, formulaStage?.querySelector('.formula-showcase-pack'), 7);
}

function initProductScrollProgress() {
  if (document.querySelector('.product-scroll-progress')) return;
  const bar = document.createElement('div');
  bar.className = 'product-scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  let frame = 0;
  const update = () => {
    frame = 0;
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    bar.style.transform = `scaleX(${ratio.toFixed(4)})`;
  };
  const requestUpdate = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  update();
}
