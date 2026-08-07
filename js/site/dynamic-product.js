function handleBackendPageFailure(error) {
  backendPagePayload = null;
  delete backendPageCache[`${currentCountry}:${currentLang}:${getCurrentBackendPagePath()}`];
  document.body.classList.remove('backend-content-pending');
  hideStadaPageLoader();
  showBackendRequiredMessage(error);
}

function normalizeDynamicProductImageSrc(src) {
  const value = String(src || '').trim();
  if (!value) {
    return resolveCountryCloudinaryHeroImageSrc(
      'https://res.cloudinary.com/ds2aaznn7/image/upload/stada/hero/kazakhstan/index/index_image_016.png'
    );
  }
  if (/^(?:https?:)?\/\//i.test(value) || /^data:/i.test(value)) return withRuntimeImageRefresh(value);
  const resolvedProductAsset = resolveProductAssetImageSrc(value);
  if (resolvedProductAsset !== value) return withRuntimeImageRefresh(resolvedProductAsset);
  return getSiteAssetPath(value.replace(/^(\.\/|\.\.\/)+/, ''));
}

function hexToRgbTriplet(hex) {
  const value = String(hex || '').trim().replace(/^#/, '');
  const normalized = value.length === 3
    ? value.split('').map(char => `${char}${char}`).join('')
    : value;
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return '';
  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16)
  ].join(', ');
}

function setText(selector, value, { hideEmpty = false } = {}) {
  const el = document.querySelector(selector);
  if (!el) return;
  const text = String(value || '').trim();
  el.textContent = text;
  if (hideEmpty) el.hidden = !text;
}

function replaceChildrenFromList(selector, items, renderItem, { hideEmpty = false } = {}) {
  const container = document.querySelector(selector);
  if (!container) return;
  container.innerHTML = '';
  const renderedItems = (items || []).map(renderItem).filter(Boolean);
  renderedItems.forEach(item => container.appendChild(item));
  if (hideEmpty) container.hidden = !renderedItems.length;
}

function decodeHtmlEntities(value) {
  const text = String(value ?? '');
  if (!/&(?:#\d+|#x[0-9a-f]+|[a-z][a-z0-9]*);/i.test(text)) return text;
  const doc = new DOMParser().parseFromString(text, 'text/html');
  return doc.documentElement.textContent || text;
}

function applyRevealStagger(element, index) {
  element.style.transitionDelay = `${Math.min(index * 70, 420)}ms`;
  element.addEventListener('transitionend', () => {
    element.style.transitionDelay = '';
  }, { once: true });
  return element;
}

function createDynamicProductMetric(item) {
  const article = document.createElement('div');
  article.className = 'product-hero-metric';
  const value = document.createElement('strong');
  value.textContent = decodeHtmlEntities(item.value || item.title || '');
  const label = document.createElement('span');
  label.textContent = decodeHtmlEntities(item.title && item.value ? item.title : item.text || '');
  article.append(value, label);
  return article;
}

function createDynamicProductFact(item, index) {
  const article = document.createElement('article');
  article.className = 'product-fact-card vitrum-animate';
  applyRevealStagger(article, index);
  const value = document.createElement('span');
  value.textContent = decodeHtmlEntities(item.value || '');
  const title = document.createElement('h3');
  title.textContent = decodeHtmlEntities(item.title || '');
  const text = document.createElement('p');
  text.textContent = decodeHtmlEntities(item.text || '');
  article.append(value, title, text);
  return article;
}

function createDynamicProductBenefit(text, index) {
  const item = document.createElement('li');
  item.className = 'vitrum-animate';
  applyRevealStagger(item, index);
  item.textContent = decodeHtmlEntities(text);
  return item;
}

function createDynamicPartnerCard(link, index) {
  const card = document.createElement('a');
  card.className = 'partner-card vitrum-animate';
  applyRevealStagger(card, index);
  card.href = link.url;
  card.target = '_blank';
  card.rel = 'noopener noreferrer';
  card.setAttribute('aria-label', link.ariaLabel || link.label || 'Pharmacy partner');

  const image = document.createElement('img');
  image.src = normalizeDynamicProductImageSrc(link.logoSrc);
  image.alt = link.logoAlt || link.label || '';
  image.loading = 'lazy';
  const label = document.createElement('p');
  label.textContent = link.label || '';
  card.append(image, label);
  return card;
}

function applyLegacyProductLayout(legacy) {
  if (!legacy) return;
  legacy.bodyClasses
    .filter(className => className.startsWith('product-') && className !== 'product-detail-page')
    .forEach(className => document.body.classList.add(className));

  const heroKicker = document.querySelector('[data-product-kicker]');
  if (heroKicker) heroKicker.hidden = !legacy.heroOptions.hasKicker || !heroKicker.textContent.trim();

  const actions = document.querySelector('.product-hero-actions');
  if (actions) actions.hidden = !legacy.heroOptions.hasActions;

  const badges = document.querySelector('[data-product-badges]');
  if (badges) badges.hidden = !legacy.heroOptions.hasBadges || !badges.children.length;

  document.querySelector('.snup-formula-system')?.classList.add('is-visible');
}

function getApiProductBlueprint(product, page) {
  const layout = page?.layout || {};
  const heroOptions = page?.heroOptions || {};
  const hasLayout = Object.values(layout).some(value => {
    return Array.isArray(value) ? value.length : String(value || '').trim();
  });
  const hasHeroOptions = Object.prototype.hasOwnProperty.call(heroOptions, 'hasKicker')
    || Object.prototype.hasOwnProperty.call(heroOptions, 'hasActions')
    || Object.prototype.hasOwnProperty.call(heroOptions, 'hasBadges');

  if (!hasLayout && !hasHeroOptions) return null;

  return {
    bodyClasses: Array.isArray(layout.bodyClasses) ? layout.bodyClasses : [],
    heroOptions: {
      hasKicker: heroOptions.hasKicker !== false,
      hasActions: heroOptions.hasActions !== false,
      hasBadges: heroOptions.hasBadges !== false,
    },
    badges: [],
    metrics: [],
    facts: [],
    benefits: [],
    formulaPoints: [],
    usageItems: [],
    purchaseLinks: [],
    heroImageSrc: '',
    heroImageAlt: product?.image?.alt || product?.name || '',
    formulaImageSrc: '',
    formulaLayoutClassName: layout.formulaLayoutClassName || '',
    formulaSystemClassName: layout.formulaSystemClassName || '',
    formulaLinesClassName: layout.formulaLinesClassName || '',
    formulaLineClassName: layout.formulaLineClassName || '',
    formulaDotClassName: layout.formulaDotClassName || '',
  };
}

function createDynamicFormulaPoint(item, index) {
  const article = document.createElement('article');
  article.className = 'formula-point vitrum-animate';
  applyRevealStagger(article, index);
  if (!item.title && !item.text) article.classList.add('formula-point--icon-only');

  const media = document.createElement('div');
  media.className = 'formula-point-media';
  if (item.imageSrc) {
    const image = document.createElement('img');
    image.src = normalizeDynamicProductImageSrc(item.imageSrc);
    image.alt = item.imageAlt || '';
    image.loading = 'lazy';
    media.appendChild(image);
  } else {
    const value = document.createElement('span');
    value.textContent = decodeHtmlEntities(item.value || String(index + 1));
    media.appendChild(value);
  }
  article.appendChild(media);

  if (item.title || item.text) {
    const body = document.createElement('div');
    body.className = 'formula-point-body';
    if (item.title) {
      const title = document.createElement('h3');
      title.textContent = decodeHtmlEntities(item.title);
      body.appendChild(title);
    }
    if (item.text) {
      const text = document.createElement('p');
      text.textContent = decodeHtmlEntities(item.text);
      body.appendChild(text);
    }
    article.appendChild(body);
  }
  return article;
}

let formulaConnectorFrame = 0;

function clampNumber(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function scheduleFormulaConnectorUpdate() {
  if (formulaConnectorFrame) window.cancelAnimationFrame(formulaConnectorFrame);
  formulaConnectorFrame = window.requestAnimationFrame(() => {
    formulaConnectorFrame = 0;
    updateFormulaConnectors();
  });
}

function getFormulaConnectorPoint(rect, anchor) {
  if (anchor === 'right') return { x: rect.right, y: rect.top + rect.height * 0.5 };
  if (anchor === 'left') return { x: rect.left, y: rect.top + rect.height * 0.5 };
  return { x: rect.left + rect.width * 0.5, y: rect.top };
}

function getRenderedFormulaImageRect(image) {
  const rect = image.getBoundingClientRect();
  const naturalWidth = image.naturalWidth || rect.width;
  const naturalHeight = image.naturalHeight || rect.height;
  if (!naturalWidth || !naturalHeight || !rect.width || !rect.height) return rect;

  const scale = Math.min(rect.width / naturalWidth, rect.height / naturalHeight);
  const renderedWidth = naturalWidth * scale;
  const renderedHeight = naturalHeight * scale;

  return {
    left: rect.left + (rect.width - renderedWidth) / 2,
    right: rect.left + (rect.width + renderedWidth) / 2,
    top: rect.top + (rect.height - renderedHeight) / 2,
    bottom: rect.top + (rect.height + renderedHeight) / 2,
    width: renderedWidth,
    height: renderedHeight
  };
}

function getFormulaProductConnectorPoint(productRect, cardAnchor, anchor) {
  const horizontalY = clampNumber(cardAnchor.y, productRect.top + productRect.height * 0.16, productRect.bottom - productRect.height * 0.2);
  if (anchor === 'right') {
    return { x: productRect.left - 10, y: horizontalY };
  }
  if (anchor === 'left') {
    return { x: productRect.right + 10, y: horizontalY };
  }
  const bottomOffset = Math.max(24, Math.min(46, productRect.height * 0.12));
  return {
    x: productRect.left + productRect.width * 0.5,
    y: productRect.bottom + bottomOffset
  };
}

function toFormulaSvgPoint(point, systemRect, viewBox) {
  return {
    x: ((point.x - systemRect.left) / systemRect.width) * viewBox.width,
    y: ((point.y - systemRect.top) / systemRect.height) * viewBox.height
  };
}

function createFormulaConnectorPath(start, end, anchor) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (anchor === 'top') {
    const direction = dy < 0 ? -1 : 1;
    const pull = Math.max(28, Math.min(86, Math.abs(dy) * 0.48));
    return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} C ${start.x.toFixed(1)} ${(start.y + direction * pull).toFixed(1)} ${end.x.toFixed(1)} ${(end.y - direction * pull).toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
  }
  const direction = dx < 0 ? -1 : 1;
  const horizontalPull = Math.max(48, Math.min(124, Math.abs(dx) * 0.72));
  const verticalEase = dy * 0.12;
  return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} C ${(start.x + direction * horizontalPull).toFixed(1)} ${(start.y + verticalEase).toFixed(1)} ${(end.x - direction * horizontalPull).toFixed(1)} ${(end.y - verticalEase).toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
}

function getFormulaSourceDots(svg, count) {
  const dots = Array.from(svg.querySelectorAll('.snup-formula-source-dot'));
  while (dots.length < count) {
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('class', 'snup-formula-source-dot');
    dot.setAttribute('r', '4');
    svg.appendChild(dot);
    dots.push(dot);
  }
  return dots;
}

function updateFormulaConnectors() {
  const system = document.querySelector('.snup-formula-system');
  const svg = system?.querySelector('.snup-formula-lines');
  const product = system?.querySelector('.snup-formula-product');
  if (!system || !svg || !product) return;

  const viewBox = svg.viewBox?.baseVal;
  const systemRect = system.getBoundingClientRect();
  const productRect = getRenderedFormulaImageRect(product);
  if (!viewBox || !systemRect.width || !systemRect.height || !productRect.width || !productRect.height) return;

  const connectors = [
    { point: system.querySelector('.snup-formula-point--active'), path: svg.querySelectorAll('.snup-formula-line')[0], dot: svg.querySelectorAll('.snup-formula-dot')[0], anchor: 'right' },
    { point: system.querySelector('.snup-formula-point--seawater'), path: svg.querySelectorAll('.snup-formula-line')[1], dot: svg.querySelectorAll('.snup-formula-dot')[1], anchor: 'left' },
    { point: system.querySelector('.snup-formula-point--format'), path: svg.querySelectorAll('.snup-formula-line')[2], dot: svg.querySelectorAll('.snup-formula-dot')[2], anchor: 'top' }
  ];
  const sourceDots = getFormulaSourceDots(svg, connectors.length);

  connectors.forEach((connector, index) => {
    if (!connector.path || !connector.dot) return;
    if (!connector.point) {
      connector.path.removeAttribute('d');
      connector.dot.setAttribute('r', '0');
      sourceDots[index]?.setAttribute('r', '0');
      return;
    }
    const cardAnchor = getFormulaConnectorPoint(connector.point.getBoundingClientRect(), connector.anchor);
    const productAnchor = getFormulaProductConnectorPoint(productRect, cardAnchor, connector.anchor);
    const start = toFormulaSvgPoint(productAnchor, systemRect, viewBox);
    const end = toFormulaSvgPoint(cardAnchor, systemRect, viewBox);
    connector.path.setAttribute('d', createFormulaConnectorPath(start, end, connector.anchor));
    connector.dot.setAttribute('cx', end.x.toFixed(1));
    connector.dot.setAttribute('cy', end.y.toFixed(1));
    connector.dot.setAttribute('r', '5.5');
    sourceDots[index]?.setAttribute('r', '4');
    sourceDots[index]?.setAttribute('cx', start.x.toFixed(1));
    sourceDots[index]?.setAttribute('cy', start.y.toFixed(1));
  });
}

function initFormulaShowcase() {
  const section = document.querySelector('.product-formula--v2');
  const stage = section?.querySelector('[data-formula-stage]');
  const svg = stage?.querySelector('.snup-formula-lines');
  if (!section || !stage || !svg || stage.dataset.fxReady) return;
  stage.dataset.fxReady = 'true';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopView = window.matchMedia('(min-width: 961px)');
  const pointer = { targetX: 0, targetY: 0, x: 0, y: 0 };
  let cards = [];
  let pulses = [];
  let frame = 0;
  let lastTick = 0;
  let revealedAt = 0;
  let stageVisible = false;

  const collectNodes = () => {
    cards = Array.from(stage.querySelectorAll('.snup-formula-point'));
    pulses = Array.from(svg.querySelectorAll('.snup-formula-line')).map((path, index) => {
      let dot = svg.querySelector(`.fx-pulse[data-fx-pulse="${index}"]`);
      if (!dot) {
        dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('class', 'fx-pulse');
        dot.setAttribute('data-fx-pulse', String(index));
        dot.setAttribute('r', '3.6');
        dot.setAttribute('opacity', '0');
        svg.appendChild(dot);
      }
      return { path, dot, progress: index * 0.27 };
    });
  };

  const hidePulses = () => pulses.forEach(pulse => pulse.dot.setAttribute('opacity', '0'));

  const focusIndexForCard = card => {
    if (card.classList.contains('snup-formula-point--active')) return 0;
    if (card.classList.contains('snup-formula-point--seawater')) return 1;
    return 2;
  };

  const updatePulses = (now, delta) => {
    if (!section.classList.contains('is-inview')) {
      hidePulses();
      return;
    }
    if (!revealedAt) revealedAt = now;
    const focused = stage.dataset.fxFocus;
    pulses.forEach((pulse, index) => {
      let length = 0;
      try { length = pulse.path.getTotalLength(); } catch (error) { length = 0; }
      if (!length || now - revealedAt < 1400 + index * 360) {
        pulse.dot.setAttribute('opacity', '0');
        return;
      }
      const isFocused = focused === String(index);
      pulse.progress = (pulse.progress + delta * (isFocused ? 0.00042 : 0.00019)) % 1;
      const point = pulse.path.getPointAtLength(pulse.progress * length);
      const fade = Math.max(0, Math.min(1, pulse.progress / 0.14, (1 - pulse.progress) / 0.14));
      const dim = focused && !isFocused ? 0.2 : 1;
      pulse.dot.setAttribute('cx', point.x.toFixed(1));
      pulse.dot.setAttribute('cy', point.y.toFixed(1));
      pulse.dot.setAttribute('r', isFocused ? '5' : '3.6');
      pulse.dot.setAttribute('opacity', (fade * dim * 0.95).toFixed(3));
    });
  };

  const shouldAnimate = () => stageVisible && !document.hidden && !reduceMotion.matches && desktopView.matches;

  const stopLoop = () => {
    if (frame) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    }
    lastTick = 0;
    hidePulses();
  };

  const tick = now => {
    frame = 0;
    if (!shouldAnimate()) {
      stopLoop();
      return;
    }
    const delta = lastTick ? Math.min(64, now - lastTick) : 16;
    lastTick = now;
    const t = now * 0.001;
    pointer.x += (pointer.targetX - pointer.x) * 0.075;
    pointer.y += (pointer.targetY - pointer.y) * 0.075;
    stage.style.setProperty('--fx-mx', pointer.x.toFixed(4));
    stage.style.setProperty('--fx-my', pointer.y.toFixed(4));
    stage.style.setProperty('--fx-bob', `${(Math.sin(t * 1.05) * 7).toFixed(2)}px`);
    cards.forEach((card, index) => {
      card.style.setProperty('--fx-float', `${(Math.sin(t * 0.85 + index * 2.1) * 6).toFixed(2)}px`);
    });
    updateFormulaConnectors();
    updatePulses(now, delta);
    frame = window.requestAnimationFrame(tick);
  };

  const syncLoop = () => {
    if (shouldAnimate()) {
      if (!frame) frame = window.requestAnimationFrame(tick);
    } else {
      stopLoop();
    }
  };

  if (reduceMotion.matches || typeof IntersectionObserver === 'undefined') {
    section.classList.add('is-inview');
    stageVisible = true;
    syncLoop();
  } else {
    const stageObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        stageVisible = entry.isIntersecting;
        if (entry.intersectionRatio >= 0.22) section.classList.add('is-inview');
        syncLoop();
      });
    }, { threshold: [0, 0.22] });
    stageObserver.observe(section);
  }

  document.addEventListener('visibilitychange', syncLoop);
  desktopView.addEventListener?.('change', () => {
    syncLoop();
    scheduleFormulaConnectorUpdate();
  });
  reduceMotion.addEventListener?.('change', () => {
    if (reduceMotion.matches) section.classList.add('is-inview');
    syncLoop();
  });

  stage.addEventListener('pointermove', event => {
    if (event.pointerType && event.pointerType !== 'mouse') return;
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    pointer.targetX = clampNumber(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
    pointer.targetY = clampNumber(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
  });
  stage.addEventListener('pointerleave', () => {
    pointer.targetX = 0;
    pointer.targetY = 0;
    delete stage.dataset.fxFocus;
  });
  stage.addEventListener('pointerover', event => {
    const card = event.target instanceof Element ? event.target.closest('.snup-formula-point') : null;
    if (card) {
      stage.dataset.fxFocus = String(focusIndexForCard(card));
    } else {
      delete stage.dataset.fxFocus;
    }
  });

  collectNodes();
  document.addEventListener('stada:dynamicproductrender', () => {
    collectNodes();
    syncLoop();
  });
}

function createDynamicUsageItem(item, index) {
  const article = document.createElement('article');
  article.className = item.className || `usage-item vitrum-animate${index === 0 ? ' is-active' : ''}`;
  if (item.isActive || index === 0) article.classList.add('is-active');
  if (article.classList.contains('vitrum-animate') && !article.classList.contains('is-visible')) {
    applyRevealStagger(article, index);
  }
  article.tabIndex = 0;
  const marker = document.createElement('span');
  const content = document.createElement('div');
  const title = document.createElement('h3');
  title.textContent = decodeHtmlEntities(item.title || '');
  const text = document.createElement('p');
  text.textContent = decodeHtmlEntities(item.text || '');
  content.append(title, text);
  article.append(marker, content);
  return article;
}

function renderDynamicProductPage(payload) {
  const product = payload?.product || {};
  const page = product.page || {};
  const blueprint = getApiProductBlueprint(product, page);
  const body = document.body;
  const accent = product.accent || '#005db9';
  const accentRgb = hexToRgbTriplet(accent);

  backendProductPayload = payload;
  clearBackendRequiredMessage();
  body.dataset.productSlug = product.slug || product.id || '';
  const productClass = `product-${String(product.slug || product.id || 'dynamic').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-page`;
  body.classList.add(productClass);
  body.style.setProperty('--product-accent', accent);
  body.style.setProperty('--product-accent-strong', accent);
  if (accentRgb) {
    body.style.setProperty('--product-accent-rgb', accentRgb);
    body.style.setProperty('--product-accent-strong-rgb', accentRgb);
  }

  setText('[data-product-kicker]', page.kicker || product.therapeuticArea);
  setText('[data-product-title]', product.name);
  setText('[data-product-lead]', page.lead || product.shortDescription);
  setText('[data-product-overview-label]', page.overviewLabel || product.therapeuticArea);
  setText('[data-product-overview-heading]', page.overviewHeading || product.name);
  setText('[data-product-overview-intro]', page.overviewIntro || product.shortDescription, { hideEmpty: true });
  setText('[data-product-formula-label]', page.formulaLabel);
  setText('[data-product-formula-heading]', page.formulaHeading || product.name);
  setText('[data-product-formula-intro]', page.formulaIntro, { hideEmpty: true });
  setText('[data-product-usage-label]', page.usageLabel);
  setText('[data-product-usage-heading]', page.usageHeading || product.name);
  setText('[data-product-note-title]', page.noteTitle);
  setText('[data-product-note-text]', page.noteText, { hideEmpty: true });
  setText('[data-product-buy-intro]', page.buyIntro, { hideEmpty: true });

  const image = document.querySelector('[data-product-image]');
  if (image) {
    image.src = blueprint?.heroImageSrc || normalizeDynamicProductImageSrc(product.image?.url || product.image?.src);
    image.alt = blueprint?.heroImageAlt || product.image?.alt || product.name || '';
  }
  const formulaImage = document.querySelector('[data-product-formula-image]');
  if (formulaImage) {
    formulaImage.src = blueprint?.formulaImageSrc || normalizeDynamicProductImageSrc(page.formulaImage || product.image?.url || product.image?.src);
    formulaImage.alt = '';
  }

  const badges = page.badges?.length ? page.badges : [product.therapeuticArea, product.shortDescription].filter(Boolean).slice(0, 3);
  replaceChildrenFromList('[data-product-badges]', badges, text => {
    const item = document.createElement('span');
    item.textContent = text;
    return item;
  }, { hideEmpty: true });

  const metrics = page.metrics?.length ? page.metrics : page.facts?.length ? page.facts.slice(0, 3) : [];
  const facts = page.facts || [];
  const formulaPoints = page.formulaPoints || [];
  const usageItems = page.usageItems || [];
  const benefits = page.benefits || [];
  const purchaseLinks = page.purchaseLinks || [];
  const hasPurchaseLinks = purchaseLinks.length > 0;
  const buySection = document.getElementById('pharmacy-partners');
  if (buySection) buySection.hidden = !hasPurchaseLinks;
  setPharmacyPartnerLinksVisible(hasPurchaseLinks);

  replaceChildrenFromList('[data-product-metrics]', metrics, createDynamicProductMetric, { hideEmpty: true });
  replaceChildrenFromList('[data-product-facts]', facts, createDynamicProductFact, { hideEmpty: true });
  replaceChildrenFromList('[data-product-benefits]', benefits, createDynamicProductBenefit, { hideEmpty: true });
  replaceChildrenFromList('[data-product-formula-points]', formulaPoints, createDynamicFormulaPoint, { hideEmpty: true });
  replaceChildrenFromList('[data-product-usage-items]', usageItems, createDynamicUsageItem, { hideEmpty: true });
  replaceChildrenFromList('[data-product-partners]', purchaseLinks, createDynamicPartnerCard, { hideEmpty: true });
  applyLegacyProductLayout(blueprint);

  document.title = page.title || `STADA - ${product.name || ''}`;
  document.dispatchEvent(new CustomEvent('stada:dynamicproductrender', { detail: { product, lang: currentLang, country: currentCountry } }));

  document.querySelectorAll('[data-vitrum-usage] .usage-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('[data-vitrum-usage] .usage-item').forEach(current => current.classList.toggle('is-active', current === item));
    });
    item.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      item.click();
    });
  });

}

async function updateDynamicProductPage(lang) {
  lang = resolveLanguageForCountry(lang);
  currentLang = lang;
  persistLocaleState();
  document.documentElement.lang = lang;
  document.body.classList.add('backend-content-pending');
  showStadaPageLoader();
  setLanguageToggleState(lang);
  applyFrontendStaticText(lang);
  const payload = await fetchBackendProduct(lang);
  renderDynamicProductPage(payload);
  await waitForCriticalImages();
  document.body.classList.remove('backend-content-pending');
  hideStadaPageLoader();
}

async function updateBackendDrivenPage(lang) {
  lang = resolveLanguageForCountry(lang);
  currentLang = lang;
  persistLocaleState();
  document.documentElement.lang = lang;
  document.body.classList.add('backend-content-pending');
  showStadaPageLoader();
  setLanguageToggleState(lang);
  applyFrontendStaticText(lang);

  const payload = await fetchBackendPage(lang);
  backendPagePayload = payload;
  clearBackendRequiredMessage();
  applyTextFromBackendPayload(payload);
  applyImagesFromBackendPayload(payload);
  renderManagedNewsCards(payload);
  initHistoryTimelineMedia();
  applyProductCatalogCards(payload);
  renderHomeProductPreview(payload);
  renderFooterProductLinks(payload);
  applyProductMetrics(payload);
  await waitForCriticalImages();
  document.body.classList.remove('backend-content-pending');
  hideStadaPageLoader();

  updateDocumentTitle(lang);
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.setAttribute('aria-label', getBackendPageText('footer_back_top') || getBackToTopLabel(lang));
  }

  document.dispatchEvent(new CustomEvent('stada:languagechange', { detail: { lang, country: currentCountry } }));
  document.querySelectorAll('.hero-overlay').forEach(overlay => {
    overlay.classList.add('visible');
  });
}
