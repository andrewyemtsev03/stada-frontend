// Магне B6 Кидс showcase: the live 3D hero still life, scroll choreography, the
// three-stage 3D story (magnesium + B6 → the chewable panda tablet → watermelon),
// the interactive dose calculator, the in-page commercial and the phone "where to buy" bar.
// Loaded as an ES module only on products/magne-b6-kids.html.

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, value) => { const t = clamp((value - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeInOut = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutBack = t => { const c = 1.4; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

const root = document.documentElement;
root.classList.add('mg-ready');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const tier = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4 ? 1 : 2;
const assetBase = new URL('.', $('.mg-hero__jar')?.src || location.href).href;
const asset = name => new URL(name, assetBase).href;

/* ------------------------------------------------------------------ layout */
const siteNav = document.querySelector('body > nav');
const hero = $('#mg-hero');
function measureNav() {
  if (siteNav) root.style.setProperty('--nav-h', `${Math.round(siteNav.getBoundingClientRect().height)}px`);
}
measureNav();

/* ------------------------------------------------------------------ marquees */
$$('[data-marquee]').forEach(node => {
  const word = node.textContent.trim();
  node.textContent = '';
  for (let i = 0; i < 6; i += 1) {
    node.append(word);
    const dot = document.createElement('em');
    dot.textContent = ' · ';
    node.append(dot);
  }
});

/* ------------------------------------------------------------------ reveal */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-in');
    revealObserver.unobserve(entry.target);
  });
}, { rootMargin: '0px 0px -12% 0px' });
$$('.mg-reveal').forEach(node => revealObserver.observe(node));

/* ------------------------------------------------------------------ hero */
// The hero doesn't follow the cursor; the jar turns only when it is grabbed (see initHero).
const heroVisual = $('[data-hero-visual]');

// Loading screen: lifted once the hero scene has drawn (or fallen back to photos) and the fonts are in,
// never sooner than a short beat so it doesn't flash.
const shownAt = performance.now();
let heroSettled;
const heroReady = new Promise(resolve => { heroSettled = resolve; });
Promise.all([heroReady, document.fonts?.ready]).then(() => {
  setTimeout(() => root.classList.add('mg-loaded'), Math.max(0, 600 - (performance.now() - shownAt)));
});

/* ------------------------------------------------------------------ story scene (captions, stages, HUD) */
// One sticky chapter in three stages. The DOM side (captions, stage words, HUD) follows the scroll position
// directly; the 3D scene reads `story.target` and `story.enter` and eases towards them.
const storySection = $('#mg-story');
const STAGES = [
  { id: 'a', from: 0, at: .13 },
  { id: 'b', from: .31, at: .5 },
  { id: 'c', from: .66, at: .92 },
];
const story = storySection && {
  section: storySection,
  caps: $$('.mg-cap', storySection),
  track: $('.mg-track i', storySection),
  words: $$('[data-word]', storySection),
  steps: $$('[data-step]', storySection),
  target: 0,
  enter: 0,
  stage: 'a',
};

function sectionProgress(section) {
  const rect = section.getBoundingClientRect();
  const total = rect.height - innerHeight;
  return total > 0 ? clamp(-rect.top / total) : 0;
}

function updateStory() {
  if (!story) return;
  const rect = story.section.getBoundingClientRect();
  const p = sectionProgress(story.section);
  story.target = p;
  // 0 while the chapter is still below the fold, 1 once it is pinned: the atom forms as the chapter slides in.
  story.enter = clamp(1 - rect.top / innerHeight);
  story.caps.forEach(cap => {
    const start = Number(cap.dataset.in);
    const end = Number(cap.dataset.out);
    const fade = .035;
    const fadeIn = start <= 0 ? 1 : smooth(start, start + fade, p);
    const fadeOut = end >= 1 ? 1 : 1 - smooth(end - fade, end, p);
    const opacity = fadeIn * fadeOut;
    cap.style.opacity = opacity.toFixed(3);
    cap.style.transform = `translate3d(0, ${((1 - opacity) * (p < start + fade ? 26 : -18)).toFixed(1)}px, 0)`;
    cap.classList.toggle('is-live', opacity > .5);
  });
  let stage = STAGES[0];
  STAGES.forEach(item => { if (p >= item.from) stage = item; });
  if (stage.id !== story.stage) {
    story.stage = stage.id;
    story.section.dataset.stage = stage.id;
  }
  story.steps.forEach(step => step.setAttribute('aria-current', String(STAGES[Number(step.dataset.step)].id === stage.id)));
  if (story.track) story.track.style.transform = `scaleX(${p.toFixed(4)})`;
  if (!reduceMotion) {
    story.words.forEach(word => {
      const travel = Math.max(0, word.scrollWidth - innerWidth * 1.2);
      word.style.transform = `translate3d(${(-p * travel * .6).toFixed(1)}px, -50%, 0)`;
    });
  }
}

// HUD stage buttons scroll to the middle of their stage.
if (story) {
  story.steps.forEach(step => step.addEventListener('click', () => {
    const rect = story.section.getBoundingClientRect();
    const total = rect.height - innerHeight;
    const top = rect.top + scrollY + total * STAGES[Number(step.dataset.step)].at;
    scrollTo({ top, behavior: reduceMotion ? 'instant' : 'smooth' });
  }));
}

/* ------------------------------------------------------------------ film scroll effect */
const film = $('[data-film]');

function updateFilm() {
  if (film && !film.classList.contains('is-playing')) {
    const rect = film.getBoundingClientRect();
    const t = reduceMotion ? 0 : 1 - clamp((innerHeight - rect.top) / (innerHeight * .75));
    film.style.setProperty('--t', t.toFixed(3));
  }
}

/* ------------------------------------------------------------------ nav auto-hide, chapter rail, buy bar */
const rail = $('.mg-rail');
const chapters = $$('[data-theme]', $('#mg-top'));
const buyBar = $('[data-buy-bar]');
const heroActions = $('.mg-hero__actions');
const buySection = $('#mg-buy');
let lastScroll = scrollY;
let barOn = null;
function updateBuyBar(current) {
  if (!buyBar) return;
  // Shown once the hero buttons are gone, kept out of the immersive story scene and away from the partner list itself.
  const on = heroActions.getBoundingClientRect().bottom < 0
    && current?.id !== 'mg-story'
    && buySection.getBoundingClientRect().top > innerHeight * .9;
  if (on === barOn) return;
  barOn = on;
  buyBar.classList.toggle('is-on', on);
  buyBar.inert = !on;
}
function updateChrome() {
  const y = scrollY;
  const pastHero = hero.getBoundingClientRect().bottom < innerHeight * .35;
  const menuOpen = $('.menu.open');
  if (siteNav) {
    if (!pastHero || menuOpen || y < lastScroll - 6) siteNav.classList.remove('mg-nav-off');
    else if (y > lastScroll + 6) siteNav.classList.add('mg-nav-off');
  }
  lastScroll = y;
  const middle = innerHeight / 2;
  let current = null;
  chapters.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= middle && rect.bottom > middle) current = section;
  });
  updateBuyBar(current);
  if (!rail) return;
  rail.classList.toggle('is-on', pastHero && Boolean(current));
  rail.classList.toggle('is-dark', current?.dataset.theme === 'dark');
  $$('a', rail).forEach(link => link.setAttribute('aria-current', String(current?.id === link.dataset.go)));
}

/* ------------------------------------------------------------------ scroll loop */
let ticking = false;
function frame() {
  ticking = false;
  updateStory();
  updateFilm();
  updateChrome();
}
const requestFrame = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
addEventListener('scroll', requestFrame, { passive: true });
addEventListener('resize', () => { measureNav(); requestFrame(); });
frame();

/* ------------------------------------------------------------------ chapter jumps */
const veil = $('.mg-veil');
const tint = { 'mg-story': '#3fcdf7', 'mg-dose': '#f3f8fe', 'mg-film': '#070a2c', 'mg-facts': '#ffffff', 'mg-buy': '#262c8e' };
let jumping = false;
document.addEventListener('click', event => {
  const link = event.target.closest('a[data-go]');
  if (!link) return;
  const target = document.getElementById(link.dataset.go);
  if (!target) return;
  event.preventDefault();
  if (jumping) return;
  const go = () => {
    const top = target.getBoundingClientRect().top + scrollY + (target.classList.contains('mg-sheet') || target.classList.contains('mg-scene') ? 28 : 0);
    scrollTo({ top, behavior: 'instant' });
    history.replaceState(null, '', `#${target.id}`);
    const heading = $('h2', target);
    if (heading && event.detail === 0) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  };
  if (reduceMotion || !veil) { go(); return; }
  jumping = true;
  veil.style.background = tint[target.id] || '#fff';
  veil.classList.add('is-on');
  setTimeout(() => {
    go();
    requestAnimationFrame(() => requestAnimationFrame(() => { veil.classList.remove('is-on'); jumping = false; }));
  }, 260);
});

/* ------------------------------------------------------------------ dose calculator */
const dose = $('[data-dose]');
const doseSwitch = $('.mg-switch');
if (dose && doseSwitch) {
  const buttons = $$('button[data-age]', doseSwitch);
  const rings = $$('[data-ring]', dose);
  const perDay = $('[data-dose-perday]', dose);
  const days = $('[data-course-days]', dose);
  for (let i = 0; i < 30; i += 1) {
    const cell = document.createElement('i');
    cell.style.transitionDelay = `${i * 18}ms`;
    days.append(cell);
  }
  const format = (value, decimals) => value.toFixed(decimals).replace('.', ',');
  const animateNumber = (node, from, to, decimals, suffix = '') => {
    if (reduceMotion) { node.textContent = format(to, decimals) + suffix; return; }
    const start = performance.now();
    const step = now => {
      const t = clamp((now - start) / 900);
      node.textContent = format(lerp(from, to, 1 - Math.pow(1 - t, 3)), decimals) + suffix;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  let age = 'young';
  let shown = false;
  const apply = (next, first = false) => {
    const previous = age;
    age = next;
    dose.dataset.age = age;
    doseSwitch.classList.toggle('is-older', age === 'older');
    buttons.forEach(button => {
      const on = button.dataset.age === age;
      button.setAttribute('aria-checked', String(on));
      button.tabIndex = on ? 0 : -1;
    });
    perDay.textContent = age === 'older' ? '2' : '1';
    rings.forEach(ring => {
      const decimals = Number(ring.dataset.decimals);
      const from = first ? 0 : Number(ring.dataset[previous]);
      const fromPct = first ? 0 : Number(ring.dataset[`${previous}Pct`]);
      const to = Number(ring.dataset[age]);
      const pct = Number(ring.dataset[`${age}Pct`]);
      ring.style.setProperty('--p', String(pct / 100));
      animateNumber($('[data-ring-value]', ring), from, to, decimals);
      animateNumber($('[data-ring-pct]', ring), fromPct, pct, 0, '%');
    });
    [...days.children].forEach((cell, index) => cell.classList.toggle('is-second', age === 'older' && index >= 15));
    days.classList.add('is-anim');
    requestAnimationFrame(() => requestAnimationFrame(() => days.classList.remove('is-anim')));
  };
  buttons.forEach(button => button.addEventListener('click', () => apply(button.dataset.age)));
  doseSwitch.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const next = age === 'young' ? 'older' : 'young';
    apply(next);
    buttons.find(button => button.dataset.age === next).focus();
  });
  rings.forEach(ring => ring.style.setProperty('--p', '0'));
  new IntersectionObserver((entries, observer) => {
    if (!entries.some(entry => entry.isIntersecting) || shown) return;
    shown = true;
    observer.disconnect();
    apply('young', true);
  }, { threshold: .35 }).observe(dose);
}

/* ------------------------------------------------------------------ commercial: plays in place */
// The YouTube player (privacy-enhanced domain) is created only after the visitor presses play;
// without JavaScript, or with a modifier key, the link opens YouTube as before.
const filmScreen = $('[data-video]');
if (filmScreen && film) {
  filmScreen.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    const frame = filmScreen.parentElement;
    const player = document.createElement('iframe');
    const params = new URLSearchParams({ autoplay: '1', rel: '0', playsinline: '1', modestbranding: '1' });
    player.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(filmScreen.dataset.video)}?${params}`;
    player.title = filmScreen.getAttribute('aria-label') || 'YouTube';
    player.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    player.allowFullscreen = true;
    player.referrerPolicy = 'strict-origin-when-cross-origin';
    film.classList.add('is-playing');
    filmScreen.replaceWith(player);
    player.focus();
  });
}

/* ------------------------------------------------------------------ facts tabs */
const tabList = $('.mg-tabs__list');
if (tabList) {
  const tabs = $$('[role="tab"]', tabList);
  const select = tab => {
    tabs.forEach(item => {
      const on = item === tab;
      item.setAttribute('aria-selected', String(on));
      item.tabIndex = on ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !on;
    });
  };
  tabs.forEach(tab => tab.addEventListener('click', () => select(tab)));
  tabList.addEventListener('keydown', event => {
    const index = tabs.indexOf(document.activeElement);
    if (index < 0) return;
    let next = null;
    if (event.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
    if (event.key === 'ArrowLeft') next = tabs[(index - 1 + tabs.length) % tabs.length];
    if (event.key === 'Home') next = tabs[0];
    if (event.key === 'End') next = tabs[tabs.length - 1];
    if (!next) return;
    event.preventDefault();
    select(next);
    next.focus();
  });
  select(tabs[0]);
}

/* =====================================================================
   3D — three.js is vendored and loaded only when a 3D chapter approaches
   ===================================================================== */
let threePromise;
const loadThree = () => threePromise ||= Promise.all([
  import('../vendor/three/three.module.min.js'),
  import('../vendor/three/RoomEnvironment.js'),
]).then(([THREE, env]) => ({ THREE, RoomEnvironment: env.RoomEnvironment }));

function whenNear(element, callback) {
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    callback();
  }, { rootMargin: '120% 0px' });
  observer.observe(element);
}

function createRenderer(THREE, canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, tier === 2 ? 2 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  // Software rasterisers (no GPU) get a light mode: fewer pixels and frames only on change.
  const gl = renderer.getContext();
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const name = String((info && gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) || gl.getParameter(gl.RENDERER) || '');
  renderer.userData = { lite: /swiftshader|llvmpipe|softpipe|software|basic render/i.test(name) };
  if (renderer.userData.lite) renderer.setPixelRatio(.75);
  return renderer;
}

function addEnvironment(THREE, RoomEnvironment, renderer, scene) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), .04).texture;
  pmrem.dispose();
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 5, 6);
  const rim = new THREE.DirectionalLight(0x9cc8ff, 1.4);
  rim.position.set(-5, 3, -4);
  scene.add(key, rim, new THREE.AmbientLight(0xffffff, .25));
}

function keepSized(renderer, camera, canvas, onResize) {
  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    onResize?.(width, height);
  };
  new ResizeObserver(resize).observe(canvas);
  resize();
}

function runWhileVisible(element, renderer, tick) {
  new IntersectionObserver(entries => {
    renderer.setAnimationLoop(entries[0].isIntersecting ? tick : null);
  }, { rootMargin: '10% 0px' }).observe(element);
}

/* ---------- the panda tablet: sculpted sugar-coated gummy (panda.glb: mesh + colour/normal/roughness maps) ---------- */
const PANDA_HEIGHT = 1.5;
let gltfLoaderPromise;
// Each model is fetched and parsed once; scenes that get rearranged are cloned (geometry and textures stay shared).
const gltfCache = new Map();
const loadGltf = name => {
  if (!gltfCache.has(name)) {
    gltfCache.set(name, (gltfLoaderPromise ||= import('../vendor/three/GLTFLoader.js').then(({ GLTFLoader }) => new GLTFLoader()))
      .then(loader => loader.loadAsync(asset(name))));
  }
  return gltfCache.get(name);
};

let pandaPromise;
function loadPanda(THREE) {
  pandaPromise ||= loadGltf('panda.glb')
    .then(gltf => {
      const model = gltf.scene;
      model.traverse(node => {
        if (!node.isMesh) return;
        node.material.side = THREE.FrontSide;
        // A touch of warmth so the candy stays pink under ACES and the blue rim light.
        node.material.color.setRGB(1, .86, .88);
        node.material.envMapIntensity = 1;
      });
      // Normalise: centred on the origin, PANDA_HEIGHT tall, facing +Z.
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const centre = box.getCenter(new THREE.Vector3());
      const scale = PANDA_HEIGHT / size.y;
      model.scale.multiplyScalar(scale);
      model.position.sub(centre.multiplyScalar(scale));
      return model;
    });
  return pandaPromise;
}
// Each tablet is a cheap clone: geometry, textures and material are shared.
function makePanda(THREE, model) {
  const holder = new THREE.Group();
  holder.add(model.clone());
  return holder;
}

/* ---------- the jar: jar.glb (body + label + cap), scaled to radius 1 with its base at y = 0 ---------- */
function buildJar(THREE, gltf) {
  const jar = new THREE.Group();
  const body = new THREE.Group();
  jar.add(body);
  const nodes = {};
  gltf.scene.clone(true).traverse(node => { if (node.isMesh) nodes[node.name] = node; });
  const shell = nodes.body;
  const label = nodes.label;
  const lid = nodes.cap;

  const box = new THREE.Box3().setFromObject(shell);
  const scale = 1 / ((box.max.x - box.min.x) / 2);
  const lift = -box.min.y;
  const place = mesh => {
    mesh.removeFromParent();
    mesh.scale.multiplyScalar(scale);
    mesh.position.multiplyScalar(scale);
    mesh.position.y += lift * scale;
    return mesh;
  };
  const plastic = new THREE.MeshPhysicalMaterial({ color: 0xf5f7fc, roughness: .3, clearcoat: .6, clearcoatRoughness: .28 });
  shell.material = plastic;
  label.material = new THREE.MeshPhysicalMaterial({ map: label.material.map, roughness: .38, clearcoat: .7, clearcoatRoughness: .18, side: THREE.DoubleSide });
  label.material.map.anisotropy = 8;
  body.add(place(shell), place(label));

  // Where the cap sits on the shoulder ledge, in jar units.
  const capBox = new THREE.Box3().setFromObject(lid);
  const capBase = (capBox.min.y + lift) * scale;
  const capRadius = ((capBox.max.x - capBox.min.x) / 2) * scale;

  // The open neck under the cap (only seen once the cap lifts).
  const neck = [];
  const n = (x, y) => neck.push(new THREE.Vector2(x, capBase + y));
  n(capRadius + .01, -.004);
  n(.8, -.004);
  n(.8, .24);
  n(.78, .26);
  n(.72, .26);
  n(.72, .03);
  n(0, .01);
  body.add(new THREE.Mesh(new THREE.LatheGeometry(neck, 120), new THREE.MeshPhysicalMaterial({ color: 0xf5f7fc, roughness: .3, clearcoat: .6, clearcoatRoughness: .28, side: THREE.DoubleSide })));

  // Cap pivots around its own base so the existing open animation still works.
  const cap = new THREE.Group();
  lid.material = new THREE.MeshPhysicalMaterial({ color: 0xf8f9fd, roughness: .5, clearcoat: .3, clearcoatRoughness: .5 });
  place(lid).position.y -= capBase;
  const underside = new THREE.Mesh(new THREE.CircleGeometry(capRadius * .98, 96), new THREE.MeshStandardMaterial({ color: 0xe4e7ef, roughness: .7 }));
  underside.rotation.x = Math.PI / 2;
  underside.position.y = .004;
  cap.add(lid, underside);
  cap.position.y = capBase;
  jar.add(cap);
  return { jar, body, cap, capBase };
}

function makeDrag(element, onFirst) {
  const state = { offset: 0, velocity: 0, dragging: false, lastX: 0, releasedAt: 0, touched: false };
  element.addEventListener('pointerdown', event => {
    state.dragging = true;
    state.lastX = event.clientX;
    state.velocity = 0;
    element.setPointerCapture(event.pointerId);
    if (!state.touched) { state.touched = true; onFirst?.(); }
  });
  element.addEventListener('pointermove', event => {
    if (!state.dragging) return;
    const dx = event.clientX - state.lastX;
    state.lastX = event.clientX;
    state.offset += dx * .009;
    state.velocity = dx * .009;
  });
  const release = () => { state.dragging = false; state.releasedAt = performance.now(); };
  element.addEventListener('pointerup', release);
  element.addEventListener('pointercancel', release);
  return state;
}

/* Adaptive resolution: if frames get slow, render fewer pixels (never more than the start). */
function Q(renderer) {
  const state = renderer.__q || (renderer.__q = { last: performance.now(), samples: [], level: 1, base: renderer.getPixelRatio() });
  const now = performance.now();
  const delta = now - state.last;
  state.last = now;
  if (delta > 250) { state.samples.length = 0; return; }
  state.samples.push(delta);
  if (state.samples.length < 45) return;
  const sorted = state.samples.sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  state.samples = [];
  if (median > 24 && state.level > .55) {
    state.level = Math.max(.55, state.level * .8);
    renderer.setPixelRatio(Math.max(.75, state.base * state.level));
  }
}

/* ---------- watermelon wedge: a normalised clone, centred with its longest side = 1 ---------- */
function melonWedge(THREE, gltf) {
  const model = gltf.scene.clone(true);
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const unit = 1 / Math.max(size.x, size.y, size.z);
  model.scale.multiplyScalar(unit);
  model.position.sub(box.getCenter(new THREE.Vector3()).multiplyScalar(unit));
  return model;
}

function burstSparks(stage, x, y) {
  if (reduceMotion) return;
  const rect = stage.getBoundingClientRect();
  for (let i = 0; i < 14; i += 1) {
    const seed = i % 3 === 0;
    const node = seed ? document.createElementNS('http://www.w3.org/2000/svg', 'svg') : document.createElement('span');
    if (seed) {
      const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      use.setAttribute('href', '#mg-seed');
      node.append(use);
    }
    node.setAttribute('class', seed ? 'mg-spark' : 'mg-spark mg-spark--dot');
    node.style.left = `${x - rect.left}px`;
    node.style.top = `${y - rect.top}px`;
    stage.append(node);
    const angle = Math.random() * Math.PI * 2;
    const distance = 70 + Math.random() * 120;
    node.animate([
      { transform: 'translate(-50%, -50%) scale(.4) rotate(0deg)', opacity: 1 },
      { transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance + 40}px)) scale(1) rotate(${Math.random() * 360}deg)`, opacity: 0 },
    ], { duration: 900 + Math.random() * 400, easing: 'cubic-bezier(.2,.8,.2,1)' }).onfinish = () => node.remove();
  }
}

/* =====================================================================
   01 — The story scene: one renderer, one scroll-scrubbed timeline.
   A  A magnesium atom (Mg-24: 12 protons, 12 neutrons, 2-8-2 electrons)
      and a vitamin B6 (pyridoxine, C8H11NO3) molecule that assembles
      atom by atom; both labelled with the label's amounts.
   ↓  The two spiral together and flash into…
   B  …the panda tablet. It turns once with the scroll, wobbles like a
      jelly when the page moves fast, and calls out all 30 tablets of
      the jar as a halo around itself.
   ↓  The halo scatters and a whole watermelon drops in behind it,
   C  splits open in a burst of juice and seeds, slices float in, and
      the tablet sits in front of the open fruit.
   Everything is driven by the chapter's scroll progress, so scrolling
   back plays it in reverse; idle motion stops for reduced motion.
   ===================================================================== */
const T = {
  assemble: [.015, .14],
  tags: [.085, .125, .2, .235],
  merge: [.215, .3],
  flash: [.27, .3, .345],
  burst: [.292, .39],
  wave: [.292, .37],
  pop: [.288, .362],
  turn: [.31, .445],
  halo: [.4, .555],
  scatter: [.59, .665],
  settle: [.6, .68],
  drop: [.635, .705],
  split: [.705, .785],
  juice: [.7, .87],
  wedges: [.735, .87],
};
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
const easeInCubic = t => t * t * t;
const easeOutBounce = t => {
  const n = 7.5625;
  const d = 2.75;
  if (t < 1 / d) return n * t * t;
  if (t < 2 / d) { t -= 1.5 / d; return n * t * t + .75; }
  if (t < 2.5 / d) { t -= 2.25 / d; return n * t * t + .9375; }
  t -= 2.625 / d;
  return n * t * t + .984375;
};
const span = ([a, b], p) => clamp((p - a) / (b - a));
const bell = ([a, peak, b], p) => (p < peak ? smooth(a, peak, p) : 1 - smooth(peak, b, p));
// Small deterministic random so every visit builds the same scene.
const seeded = seed => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/* ---------- soft round sprites in one draw call (electron trails, dust, sparkles) ---------- */
function softPoints(THREE, count, color, blending = THREE.AdditiveBlending) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(new Float32Array(count), 1));
  geometry.setAttribute('alpha', new THREE.BufferAttribute(new Float32Array(count), 1));
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color().setHex(color, THREE.LinearSRGBColorSpace) },
      uScale: { value: 400 },
      uOpacity: { value: 1 },
    },
    vertexShader: `attribute float size; attribute float alpha; uniform float uScale; varying float vAlpha;
      void main() { vAlpha = alpha; vec4 mv = modelViewMatrix * vec4(position, 1.); gl_PointSize = size * uScale / -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uColor; uniform float uOpacity; varying float vAlpha;
      void main() { float d = length(gl_PointCoord - .5) * 2.; float a = 1. - smoothstep(0., 1., d); gl_FragColor = vec4(uColor, a * a * vAlpha * uOpacity); }`,
    transparent: true,
    depthWrite: false,
    blending,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  return points;
}

function glowTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(.22, 'rgba(255, 255, 255, .5)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Richer colour without tinting (reds redder, greens stay green): used on every watermelon surface.
function saturate(material, amount) {
  material.onBeforeCompile = shader => {
    shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
      diffuseColor.rgb = mix(vec3(dot(diffuseColor.rgb, vec3(.2126, .7152, .0722))), diffuseColor.rgb, ${amount.toFixed(2)});`);
  };
  material.customProgramCacheKey = () => `mg-sat-${amount}`;
  return material;
}

/* ---------- magnesium atom ---------- */
function buildAtom(THREE, glow) {
  const random = seeded(12);
  const group = new THREE.Group();
  const core = new THREE.Group();
  group.add(core);
  // Nucleus: two packed shells of nucleons, half of them protons.
  const spots = [];
  const shell = (n, r, twist) => {
    for (let i = 0; i < n; i += 1) {
      const y = 1 - ((i + .5) / n) * 2;
      const ring = Math.sqrt(1 - y * y);
      const a = i * 2.39996 + twist;
      spots.push(new THREE.Vector3(Math.cos(a) * ring * r, y * r, Math.sin(a) * ring * r));
    }
  };
  shell(6, .14, 0);
  shell(18, .32, .7);
  const nucleons = new THREE.InstancedMesh(
    new THREE.SphereGeometry(.16, 28, 18),
    new THREE.MeshPhysicalMaterial({ roughness: .26, clearcoat: 1, clearcoatRoughness: .12 }),
    spots.length,
  );
  const proton = new THREE.Color('#ff2b86');
  const neutron = new THREE.Color('#f4f8ff');
  const kinds = spots.map((_, i) => i % 2).sort(() => random() - .5);
  kinds.forEach((kind, i) => nucleons.setColorAt(i, kind ? proton : neutron));
  const from = spots.map(() => new THREE.Vector3(random() - .5, random() - .5, random() - .5).normalize().multiplyScalar(2.4 + random() * 1.8));
  core.add(nucleons);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0xffc8e6, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  halo.scale.setScalar(1.6);
  core.add(halo);

  // Electron shells: 2, 8 and 2 electrons, each orbit drawn as a thin tube that can be drawn on.
  class Orbit extends THREE.Curve {
    constructor(r) { super(); this.r = r; }
    getPoint(t, target = new THREE.Vector3()) {
      const a = t * Math.PI * 2;
      return target.set(Math.cos(a) * this.r, Math.sin(a) * this.r, 0);
    }
  }
  const electronGeometry = new THREE.SphereGeometry(.06, 16, 12);
  const electronMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const electronGlow = new THREE.SpriteMaterial({ map: glow, color: 0xa8ecff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .85 });
  const trail = 18;
  const shells = [
    { r: .74, n: 2, tilt: [1.2, .35, .15], speed: 1.7 },
    { r: 1.14, n: 8, tilt: [1.42, -.6, -.45], speed: 1.05 },
    { r: 1.56, n: 2, tilt: [.9, .75, 1.1], speed: .72 },
  ].map((spec, s) => {
    const holder = new THREE.Group();
    holder.rotation.set(...spec.tilt);
    group.add(holder);
    const tube = new THREE.TubeGeometry(new Orbit(spec.r), 220, .011, 6, true);
    const ring = new THREE.Mesh(tube, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .62, depthWrite: false }));
    holder.add(ring);
    const electrons = Array.from({ length: spec.n }, () => {
      const electron = new THREE.Mesh(electronGeometry, electronMaterial);
      const shine = new THREE.Sprite(electronGlow);
      shine.scale.setScalar(.3);
      electron.add(shine);
      holder.add(electron);
      return electron;
    });
    const tail = softPoints(THREE, spec.n * trail, 0xeafcff);
    holder.add(tail);
    return { ...spec, holder, ring, tube, electrons, tail, phase: s * 1.3 };
  });
  return { group, core, nucleons, spots, from, halo, shells, trail };
}

function updateAtom(atom, form, swirl, time, scroll, dummy) {
  const count = atom.spots.length;
  atom.spots.forEach((spot, i) => {
    const k = easeOutCubic(clamp((form - (i / count) * .32) / .5));
    dummy.position.lerpVectors(atom.from[i], spot, k);
    dummy.quaternion.identity();
    dummy.scale.setScalar(Math.max(k, .001));
    dummy.updateMatrix();
    atom.nucleons.setMatrixAt(i, dummy.matrix);
  });
  atom.nucleons.instanceMatrix.needsUpdate = true;
  atom.core.rotation.set(time * .3 + scroll * 3, time * .42 + scroll * 5, 0);
  atom.halo.material.opacity = .8 * smooth(.35, .9, form);
  atom.shells.forEach((shell, s) => {
    const end = .72 + s * .1;
    const arc = smooth(.28 + s * .1, end, form);
    shell.tube.setDrawRange(0, Math.ceil(arc * 220) * 36);
    shell.ring.visible = arc > .002;
    const show = smooth(end - .12, end, form);
    const base = time * shell.speed + scroll * shell.speed * 9 + swirl * (3 - s) + shell.phase;
    const position = shell.tail.geometry.attributes.position;
    const size = shell.tail.geometry.attributes.size;
    const alpha = shell.tail.geometry.attributes.alpha;
    shell.electrons.forEach((electron, j) => {
      const a = base + (j / shell.n) * Math.PI * 2;
      electron.position.set(Math.cos(a) * shell.r, Math.sin(a) * shell.r, 0);
      electron.scale.setScalar(Math.max(show, .001));
      electron.visible = show > .01;
      for (let k = 0; k < atom.trail; k += 1) {
        const b = a - (k + 1) * .07;
        const index = j * atom.trail + k;
        const f = 1 - k / atom.trail;
        position.setXYZ(index, Math.cos(b) * shell.r, Math.sin(b) * shell.r, 0);
        size.setX(index, .16 * (.3 + .7 * f));
        alpha.setX(index, f * f * .8 * show);
      }
    });
    position.needsUpdate = true;
    size.needsUpdate = true;
    alpha.needsUpdate = true;
  });
}

/* ---------- vitamin B6 (pyridoxine) molecule, ball and stick ---------- */
const ELEMENTS = {
  C: { r: .34, color: '#3341ad' },
  N: { r: .34, color: '#4aa8ff' },
  O: { r: .32, color: '#ff3f55' },
  H: { r: .2, color: '#ffffff' },
};
// Pyridine ring with 2-methyl, 3-hydroxy, 4,5-bis(hydroxymethyl) groups; coordinates in ångström.
function pyridoxine() {
  const atoms = [];
  const bonds = [];
  const add = (el, p) => atoms.push({ el, p }) - 1;
  const bond = (a, b, order = 1) => bonds.push([a, b, order]);
  const dir = deg => [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180), 0];
  const from = (index, d, length) => atoms[index].p.map((v, i) => v + d[i] * length);
  // Tetrahedral neighbour of a carbon whose bond to the ring points along d.
  const tetra = (d, phi) => [d[0] * .334 - d[1] * .943 * Math.cos(phi), d[1] * .334 + d[0] * .943 * Math.cos(phi), .943 * Math.sin(phi)];
  const ring = [90, 30, -30, -90, -150, 150].map((deg, i) => add(i ? 'C' : 'N', dir(deg).map(v => v * 1.39)));
  ring.forEach((atom, i) => bond(atom, ring[(i + 1) % 6], i % 2 ? 1 : 2));
  // C2 — methyl
  const c7 = add('C', from(ring[1], dir(30), 1.5));
  bond(ring[1], c7);
  [Math.PI / 2, Math.PI / 2 + 2.094, Math.PI / 2 + 4.189].forEach(phi => bond(c7, add('H', from(c7, tetra(dir(30), phi), 1.09))));
  // C3 — hydroxyl
  const o8 = add('O', from(ring[2], dir(-30), 1.36));
  bond(ring[2], o8);
  bond(o8, add('H', from(o8, dir(-101), .96)));
  // C4 — hydroxymethyl
  const c9 = add('C', from(ring[3], dir(-90), 1.5));
  bond(ring[3], c9);
  const o10 = add('O', from(c9, tetra(dir(-90), 0), 1.43));
  bond(c9, o10);
  bond(o10, add('H', from(o10, dir(-90.5), .96)));
  [2.094, 4.189].forEach(phi => bond(c9, add('H', from(c9, tetra(dir(-90), phi), 1.09))));
  // C5 — hydroxymethyl
  const c11 = add('C', from(ring[4], dir(-150), 1.5));
  bond(ring[4], c11);
  const o12 = add('O', from(c11, tetra(dir(-150), Math.PI), 1.43));
  bond(c11, o12);
  bond(o12, add('H', from(o12, dir(-149.5), .96)));
  [Math.PI / 3, (5 * Math.PI) / 3].forEach(phi => bond(c11, add('H', from(c11, tetra(dir(-150), phi), 1.09))));
  // C6 — hydrogen
  bond(ring[5], add('H', from(ring[5], dir(150), 1.08)));
  return { atoms, bonds };
}

function buildMolecule(THREE) {
  const { atoms, bonds } = pyridoxine();
  const centre = atoms.reduce((sum, atom) => sum.map((v, i) => v + atom.p[i]), [0, 0, 0]).map(v => v / atoms.length);
  const pos = atoms.map(atom => new THREE.Vector3(...atom.p.map((v, i) => v - centre[i])));
  const random = seeded(6);
  const group = new THREE.Group();
  const balls = new THREE.InstancedMesh(
    new THREE.SphereGeometry(1, 28, 18),
    new THREE.MeshPhysicalMaterial({ roughness: .2, clearcoat: 1, clearcoatRoughness: .08 }),
    atoms.length,
  );
  atoms.forEach((atom, i) => balls.setColorAt(i, new THREE.Color(ELEMENTS[atom.el].color)));
  const sticks = [];
  bonds.forEach(([a, b, order]) => {
    if (order === 1) sticks.push({ a, b, r: .1, off: 0 });
    else sticks.push({ a, b, r: .07, off: .12 }, { a, b, r: .07, off: -.12 });
  });
  const rods = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(1, 1, 1, 14, 1),
    new THREE.MeshPhysicalMaterial({ color: 0xf4f7ff, roughness: .3, clearcoat: .8 }),
    sticks.length,
  );
  group.add(balls, rods);
  const from = pos.map(() => new THREE.Vector3(random() - .5, random() - .5, random() - .5).normalize().multiplyScalar(9 + random() * 6));
  // The ring lands first, then the groups around it.
  const delay = pos.map(p => clamp(p.length() / 4.6) * .5 + random() * .06);
  return { group, balls, rods, pos, from, sticks, atoms, delay };
}

function updateMolecule(mol, build, dummy, v) {
  const arrived = mol.pos.map((_, i) => easeOutCubic(clamp((build - mol.delay[i]) / .38)));
  mol.pos.forEach((p, i) => {
    const k = arrived[i];
    dummy.position.lerpVectors(mol.from[i], p, k);
    dummy.quaternion.identity();
    dummy.scale.setScalar(ELEMENTS[mol.atoms[i].el].r * Math.max(Math.min(1, k * 1.4), .001));
    dummy.updateMatrix();
    mol.balls.setMatrixAt(i, dummy.matrix);
  });
  mol.sticks.forEach((stick, i) => {
    const grow = smooth(.82, 1, Math.min(arrived[stick.a], arrived[stick.b]));
    const a = mol.pos[stick.a];
    const b = mol.pos[stick.b];
    v.dir.subVectors(b, a);
    const length = v.dir.length();
    v.dir.divideScalar(length);
    v.side.crossVectors(v.dir, v.z).normalize().multiplyScalar(stick.off);
    dummy.position.copy(a).add(v.side).addScaledVector(v.dir, (length * grow) / 2);
    dummy.quaternion.setFromUnitVectors(v.up, v.dir);
    dummy.scale.set(stick.r, Math.max(length * grow, .001), stick.r);
    dummy.updateMatrix();
    mol.rods.setMatrixAt(i, dummy.matrix);
  });
  mol.balls.instanceMatrix.needsUpdate = true;
  mol.rods.instanceMatrix.needsUpdate = true;
}

/* ---------- the whole watermelon: two hemispheres with a painted rind and a juicy cut face ---------- */
function rindTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const random = seeded(23);
  ctx.fillStyle = '#5da83f';
  ctx.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 2600; i += 1) {
    const r = 2 + random() * 9;
    ctx.fillStyle = `rgba(${(60 + random() * 70) | 0}, ${(140 + random() * 60) | 0}, ${(40 + random() * 40) | 0}, ${.06 + random() * .14})`;
    ctx.beginPath();
    ctx.ellipse(random() * 1024, random() * 512, r, r * (1 + random() * 2.5), 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Eight wavy dark stripes per tile (each half of the fruit shows one tile), with ragged edges.
  const stripes = 8;
  for (let s = 0; s < stripes; s += 1) {
    const cx = ((s + .5) / stripes) * 1024;
    const edge = (y, sign) => {
      const w = 24 + Math.sin(y * .045 + s * 1.7) * 8 + Math.sin(y * .13 + s) * 4;
      return cx + Math.sin(y * .02 + s * 2.3) * 11 + sign * (w + (random() - .5) * 6);
    };
    ctx.fillStyle = '#1d5520';
    ctx.beginPath();
    for (let y = 0; y <= 512; y += 6) ctx.lineTo(edge(y, -1), y);
    for (let y = 512; y >= 0; y -= 6) ctx.lineTo(edge(y, 1), y);
    ctx.closePath();
    ctx.fill();
    for (let i = 0; i < 260; i += 1) {
      const y = random() * 512;
      const sign = random() < .5 ? -1 : 1;
      const x = edge(y, sign);
      ctx.strokeStyle = `rgba(29, 85, 32, ${.5 + random() * .4})`;
      ctx.lineWidth = 1.5 + random() * 3;
      ctx.beginPath();
      ctx.moveTo(x - sign * 4, y);
      ctx.lineTo(x + sign * (4 + random() * 14), y + (random() - .5) * 10);
      ctx.stroke();
    }
  }
  for (let i = 0; i < 1800; i += 1) {
    ctx.fillStyle = `rgba(190, 230, 150, ${.05 + random() * .12})`;
    ctx.fillRect(random() * 1024, random() * 512, 1 + random() * 2, 1 + random() * 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  return texture;
}

function fleshTexture(THREE) {
  const size = 1024;
  const c = size / 2;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const random = seeded(31);
  const disc = (r, fill) => {
    ctx.beginPath();
    ctx.arc(c, c, r * c, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
  };
  disc(1, '#1c5220');
  disc(.972, '#3f8a31');
  disc(.953, '#93cc6c');
  disc(.932, '#e4f4c9');
  const flesh = ctx.createRadialGradient(c, c, 0, c, c, .908 * c);
  flesh.addColorStop(0, '#e3102b');
  flesh.addColorStop(.45, '#ee1d35');
  flesh.addColorStop(.78, '#fb3a4c');
  flesh.addColorStop(.92, '#ff7c7a');
  flesh.addColorStop(1, '#ffcfc2');
  disc(.908, flesh);
  ctx.save();
  ctx.beginPath();
  ctx.arc(c, c, .9 * c, 0, Math.PI * 2);
  ctx.clip();
  // Juicy fibres radiating from the heart, then a fine sugary sparkle.
  for (let i = 0; i < 1200; i += 1) {
    const a = random() * Math.PI * 2;
    const r0 = random() * .7;
    const r1 = Math.min(.89, r0 + .05 + random() * .25);
    const bend = (random() - .5) * .08;
    ctx.strokeStyle = random() < .35 ? `rgba(255, 200, 200, ${.03 + random() * .06})` : `rgba(150, 0, 24, ${.05 + random() * .09})`;
    ctx.lineWidth = .6 + random() * 1.8;
    ctx.beginPath();
    ctx.moveTo(c + Math.cos(a) * r0 * c, c + Math.sin(a) * r0 * c);
    ctx.quadraticCurveTo(c + Math.cos(a + bend) * ((r0 + r1) / 2) * c, c + Math.sin(a + bend) * ((r0 + r1) / 2) * c, c + Math.cos(a) * r1 * c, c + Math.sin(a) * r1 * c);
    ctx.stroke();
  }
  // Granular flesh: little cells, some darker, some catching the light.
  for (let i = 0; i < 5200; i += 1) {
    const a = random() * Math.PI * 2;
    const r = Math.sqrt(random()) * .88;
    const s = 1.5 + random() * 4.5;
    const light = random() < .45;
    ctx.fillStyle = light ? `rgba(255, ${(150 + random() * 80) | 0}, ${(150 + random() * 70) | 0}, ${.1 + random() * .22})` : `rgba(${(170 + random() * 50) | 0}, 0, ${(20 + random() * 20) | 0}, ${.08 + random() * .14})`;
    ctx.beginPath();
    ctx.ellipse(c + Math.cos(a) * r * c, c + Math.sin(a) * r * c, s, s * (.6 + random() * .5), a, 0, Math.PI * 2);
    ctx.fill();
  }
  // Seeds: dark teardrops in a ring, each in a paler pocket, tips towards the heart; a few pale young ones inside.
  const seed = (r, a, length, dark) => {
    ctx.save();
    ctx.translate(c + Math.cos(a) * r * c, c + Math.sin(a) * r * c);
    ctx.rotate(a - Math.PI / 2);
    ctx.fillStyle = 'rgba(255, 190, 186, .32)';
    ctx.beginPath();
    ctx.ellipse(0, length * .08, length * .55, length * .85, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -length * .55);
    ctx.bezierCurveTo(length * .42, -length * .2, length * .38, length * .5, 0, length * .5);
    ctx.bezierCurveTo(-length * .38, length * .5, -length * .42, -length * .2, 0, -length * .55);
    ctx.fillStyle = dark ? '#1a0d09' : '#f6e1cc';
    ctx.fill();
    if (dark) {
      ctx.strokeStyle = 'rgba(255, 255, 255, .38)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(-length * .1, length * .06, length * .07, length * .22, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  };
  for (let i = 0; i < 22; i += 1) seed(.5 + (random() - .5) * .1 + (i % 2) * .06, (i / 22) * Math.PI * 2 + (random() - .5) * .12, 30 + random() * 10, true);
  for (let i = 0; i < 9; i += 1) seed(.24 + random() * .12, random() * Math.PI * 2, 14 + random() * 6, false);
  ctx.restore();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

const MELON_R = 1.05;
const MELON_SQUASH = .92;
const MELON_Z = -.3;
function buildMelon(THREE) {
  const rind = saturate(new THREE.MeshPhysicalMaterial({ map: rindTexture(THREE), roughness: .4, clearcoat: .7, clearcoatRoughness: .28 }), 1.1);
  const fleshMap = fleshTexture(THREE);
  const flesh = saturate(new THREE.MeshPhysicalMaterial({
    map: fleshMap, roughness: .34, clearcoat: 1, clearcoatRoughness: .16, bumpMap: fleshMap, bumpScale: 1.6,
    emissive: 0xffffff, emissiveMap: fleshMap, emissiveIntensity: .12,
  }), 1.2);
  const half = sign => {
    const group = new THREE.Group();
    const shellGeometry = new THREE.SphereGeometry(MELON_R, 72, 48, sign > 0 ? Math.PI / 2 : -Math.PI / 2, Math.PI);
    shellGeometry.scale(1, MELON_SQUASH, 1);
    const capGeometry = new THREE.CircleGeometry(MELON_R * .997, 96);
    capGeometry.scale(1, MELON_SQUASH, 1);
    const cap = new THREE.Mesh(capGeometry, flesh);
    cap.rotation.y = sign > 0 ? -Math.PI / 2 : Math.PI / 2;
    group.add(new THREE.Mesh(shellGeometry, rind), cap);
    group.userData.cap = cap;
    return group;
  };
  const left = half(-1);
  const right = half(1);
  const group = new THREE.Group();
  group.add(left, right);
  return { group, left, right, caps: [left.userData.cap, right.userData.cap] };
}

function seedGeometry(THREE) {
  const profile = [[0, -.5], [.18, -.42], [.3, -.25], [.33, -.05], [.28, .15], [.18, .32], [.06, .46], [0, .5]].map(([x, y]) => new THREE.Vector2(x, y));
  const geometry = new THREE.LatheGeometry(profile, 16);
  geometry.scale(1, 1, .5);
  return geometry;
}

function tuneMelon(model, tone) {
  model.traverse(node => {
    if (!node.isMesh) return;
    node.material = node.material.clone();
    node.material.color.multiplyScalar(tone.light);
    node.material.envMapIntensity = tone.reflect;
    saturate(node.material, tone.saturation);
  });
  return model;
}

async function initStory() {
  const canvas = $('[data-story-canvas]');
  const section = story.section;
  let THREE;
  let RoomEnvironment;
  let pandaModel;
  let melonGltf;
  try {
    ({ THREE, RoomEnvironment } = await loadThree());
    [pandaModel, melonGltf] = await Promise.all([loadPanda(THREE), loadGltf('watermelon-slice.glb')]);
  } catch {
    section.classList.add('mg-nogl');
    return;
  }
  const renderer = createRenderer(THREE, canvas);
  if (!renderer) { section.classList.add('mg-nogl'); return; }
  renderer.toneMappingExposure = 1.06;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 200);
  addEnvironment(THREE, RoomEnvironment, renderer, scene);
  const glow = glowTexture(THREE);
  const dummy = new THREE.Object3D();
  const vectors = { dir: new THREE.Vector3(), side: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1) };
  const random = seeded(7);

  // world: slides sideways so the composition sits opposite the caption; spin: turned by dragging.
  const world = new THREE.Group();
  const spin = new THREE.Group();
  world.add(spin);
  scene.add(world);
  const GROUND = -1.45;

  /* A — atom and molecule */
  const atom = buildAtom(THREE, glow);
  const mol = buildMolecule(THREE);
  const ATOM_AT = new THREE.Vector3(-.75, .55, 0);
  const MOL_AT = new THREE.Vector3(1.3, -.95, .9);
  const MOL_SCALE = .36;
  spin.add(atom.group, mol.group);

  // The flash where they meet: a ring of light and a spray of sparks.
  const wave = new THREE.Mesh(new THREE.RingGeometry(.985, 1, 160), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  const sparks = softPoints(THREE, 110, 0xffffff);
  const sparkDirs = Array.from({ length: 110 }, () => new THREE.Vector3(random() - .5, random() - .5, random() - .5).normalize().multiplyScalar(2 + random() * 3.2));
  world.add(wave, sparks);

  /* B — the tablet, its glitter and the halo of thirty */
  const S_B = 1.55;
  const S_C = .8;
  const hero = new THREE.Group();
  const jelly = new THREE.Group();
  hero.add(jelly);
  jelly.add(makePanda(THREE, pandaModel));
  spin.add(hero);
  const glitter = softPoints(THREE, 36, 0xffffff);
  const glitterSpots = Array.from({ length: 36 }, () => ({
    at: new THREE.Vector3(random() - .5, random() - .5, random() - .5).normalize().multiplyScalar(1.5 + random() * 1.1),
    speed: 1.5 + random() * 3,
    phase: random() * 6.3,
    size: .05 + random() * .07,
  }));
  spin.add(glitter);
  const halo = Array.from({ length: 29 }, (_, i) => {
    const holder = makePanda(THREE, pandaModel);
    holder.visible = false;
    holder.userData = { phase: random() * 6.3, delay: (i / 29) * .55, angle: (i / 29) * Math.PI * 2 };
    spin.add(holder);
    return holder;
  });

  /* C — the watermelon, its juice and seeds, floating slices, ground shadows */
  const melon = buildMelon(THREE);
  spin.add(melon.group);
  const shadows = {
    left: softShadow(THREE, 2.3, 1.7, .5, .35),
    right: softShadow(THREE, 2.3, 1.7, .5, .35),
    panda: softShadow(THREE, .9, .5, .6, .3),
  };
  Object.values(shadows).forEach(mesh => { mesh.position.y = GROUND + .003; spin.add(mesh); });
  const juiceCount = 96;
  const juice = new THREE.InstancedMesh(
    new THREE.SphereGeometry(1, 16, 12),
    new THREE.MeshPhysicalMaterial({ color: 0xe8001f, roughness: .08, clearcoat: 1, clearcoatRoughness: .05, emissive: 0xd4001c, emissiveIntensity: .55, envMapIntensity: .45, transparent: true, opacity: .9 }),
    juiceCount,
  );
  const seedCount = 22;
  const seeds = new THREE.InstancedMesh(seedGeometry(THREE), new THREE.MeshPhysicalMaterial({ color: 0x24140e, roughness: .25, clearcoat: 1, clearcoatRoughness: .1 }), seedCount);
  const melonCentre = GROUND + MELON_R * MELON_SQUASH;
  const fling = (count, spread) => Array.from({ length: count }, (_, i) => {
    const side = i % 2 ? 1 : -1;
    return {
      from: new THREE.Vector3((random() - .5) * .16, melonCentre + (random() - .4) * MELON_R * .9, MELON_Z + (random() - .3) * MELON_R * .8),
      velocity: new THREE.Vector3(side * (.5 + random() * spread), 1.4 + random() * 3.4, -.3 + random() * 2),
      delay: random() * .03,
      r: .022 + random() * .045,
      spin: new THREE.Vector3(random() * 9, random() * 9, random() * 9),
    };
  });
  const drops = fling(juiceCount, 2.6);
  const pips = fling(seedCount, 2.1);
  spin.add(juice, seeds);
  const WEDGES = [
    { x: -1.75, y: 1.45, z: -1.1, rx: .5, ry: .9, rz: .45, s: 1.15 },
    { x: 2.35, y: 1.2, z: -1.1, rx: .3, ry: -.9, rz: -.5, s: 1.15 },
    { x: -2.2, y: -.9, z: 1.3, rx: -.15, ry: 2.3, rz: -.2, s: .85 },
  ];
  const wedges = WEDGES.map(() => {
    const holder = new THREE.Group();
    holder.add(tuneMelon(melonWedge(THREE, melonGltf), { light: .9, saturation: 1.3, reflect: .2 }));
    holder.visible = false;
    spin.add(holder);
    return holder;
  });

  /* ambient dust: slow motes of light across the whole chapter */
  const dust = softPoints(THREE, 150, 0xffffff);
  const motes = Array.from({ length: 150 }, () => ({
    x: (random() - .5) * 18, y: (random() - .5) * 10, z: -7 + random() * 8, size: .03 + random() * .06, a: .18 + random() * .34, speed: .04 + random() * .08,
  }));
  scene.add(dust);

  // Phones: the composition sits under the caption; desktop: beside it.
  const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  let distance = 12;
  let shift = 0;
  let lift = 0;
  // Phones pull the halo and the floating slices in so they stay on screen.
  let spread = 1;
  keepSized(renderer, camera, canvas, (width, height) => {
    const narrow = width < 900;
    spread = narrow ? clamp(width / height / .62, .72, .9) : 1;
    const aspect = width / height;
    distance = Math.max(4.9 / ((narrow ? .54 : .8) * 2 * tanHalf), 5 / ((narrow ? .96 : .5) * 2 * tanHalf * aspect));
    shift = narrow ? 0 : distance * tanHalf * aspect * .27;
    lift = narrow ? distance * tanHalf * .36 : 0;
  });

  // Everything is built: compile every material now so nothing stalls mid-scroll when it first appears.
  try { await renderer.compileAsync(scene, camera); } catch { renderer.compile(scene, camera); }

  const tags = { mg: $('[data-tag="mg"]', section), b6: $('[data-tag="b6"]', section) };
  const flash = $('.mg-flash', section);
  const counter = $('[data-count]', section);
  const counterBox = counter?.parentElement;
  const hint = $('.mg-drag', section);
  let shownCount = -1;

  const drag = makeDrag(canvas, () => hint?.classList.add('is-hidden'));
  let pressX = 0;
  let pressY = 0;
  canvas.addEventListener('pointerdown', event => { pressX = event.clientX; pressY = event.clientY; });
  const state = { p: story.target, enter: story.enter, side: 1, jelly: 0, jellyV: 0, last: story.target };
  canvas.addEventListener('click', event => {
    if (Math.hypot(event.clientX - pressX, event.clientY - pressY) > 6 || story.stage === 'a') return;
    state.jellyV += 7;
    burstSparks(section, event.clientX, event.clientY);
  });

  const clock = new THREE.Clock();
  const lite = renderer.userData.lite;
  const still = reduceMotion || lite;
  const anchor = new THREE.Vector3();
  const tagOffset = new THREE.Vector3();
  let lastKey = '';
  let firstFrame = true;
  const place = (element, point, opacity, ax = -50, ay = -100) => {
    if (!element) return;
    if (opacity < .01) { element.style.opacity = '0'; return; }
    anchor.copy(point).project(camera);
    const x = (anchor.x * .5 + .5) * canvas.clientWidth;
    const y = (-anchor.y * .5 + .5) * canvas.clientHeight;
    element.style.opacity = opacity.toFixed(3);
    element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(${ax}%, ${ay}%) scale(${(.85 + opacity * .15).toFixed(3)})`;
  };

  const tick = () => {
    const dt = Math.min(.05, clock.getDelta());
    const time = still ? 0 : clock.elapsedTime;
    state.p += (story.target - state.p) * (still ? 1 : .09);
    state.enter += (story.enter - state.enter) * (still ? 1 : .09);
    const p = state.p;

    // Grab to turn; after letting go it keeps turning a little, then settles back to the front.
    if (!drag.dragging) {
      drag.offset += drag.velocity;
      drag.velocity *= .93;
      if (Math.abs(drag.velocity) < 1e-4) drag.velocity = 0;
      if (performance.now() - drag.releasedAt > 1400) {
        const front = Math.round(drag.offset / (Math.PI * 2)) * Math.PI * 2;
        drag.offset += (front - drag.offset) * (still ? 1 : .05);
        if (Math.abs(front - drag.offset) < 1e-4) drag.offset = front;
      }
    }
    // Jelly: a spring pushed by scroll speed and by taps on the tablet.
    const speed = dt > 0 ? (p - state.last) / dt : 0;
    state.last = p;
    const push = still ? 0 : clamp(speed * 3.2, -.55, .55);
    state.jellyV += ((push - state.jelly) * 90 - state.jellyV * 8) * dt;
    state.jelly += state.jellyV * dt;
    if (still) { state.jelly = 0; state.jellyV = 0; }

    if (lite) {
      const key = `${p.toFixed(4)}|${state.enter.toFixed(3)}|${drag.offset.toFixed(4)}|${canvas.width}x${canvas.height}`;
      if (key === lastKey && !firstFrame) return;
      lastKey = key;
    }

    const sideTarget = p < .262 ? 1 : p < .628 ? -1 : 1;
    state.side += (sideTarget - state.side) * (still ? 1 : .055);
    world.position.x = state.side * shift;
    spin.rotation.y = drag.offset;

    /* ---- A: atom + molecule, then the merge ---- */
    const merge = span(T.merge, p);
    const gather = 1 - smooth(0, 1, merge);
    const swirl = merge * merge * 3.2;
    const showA = p < T.merge[1] + .01;
    atom.group.visible = showA;
    mol.group.visible = showA;
    if (showA) {
      const around = (base, sign, out) => {
        const c = Math.cos(swirl * sign);
        const s = Math.sin(swirl * sign);
        return out.set((base.x * c - base.y * s) * gather, (base.x * s + base.y * c) * gather, base.z * gather);
      };
      around(ATOM_AT, 1, atom.group.position);
      atom.group.scale.setScalar(Math.max(.001, (.96 + .16 * smooth(0, 1, state.enter)) * (1 - easeInCubic(merge))));
      atom.group.rotation.set(Math.sin(time * .4) * .1, time * .12 + p * 2.2, 0);
      updateAtom(atom, state.enter, swirl, time, p, dummy);
      around(MOL_AT, -1, mol.group.position);
      mol.group.scale.setScalar(Math.max(.001, MOL_SCALE * (1 - easeInCubic(merge))));
      mol.group.rotation.set(.25 + Math.sin(time * .5) * .25, time * .3 + p * 6 + swirl, Math.sin(time * .3) * .15);
      updateMolecule(mol, span(T.assemble, p), dummy, vectors);
    }
    const burst = span(T.burst, p);
    sparks.visible = burst > 0 && burst < 1;
    if (sparks.visible) {
      const position = sparks.geometry.attributes.position;
      const size = sparks.geometry.attributes.size;
      const alpha = sparks.geometry.attributes.alpha;
      const reach = easeOutCubic(burst);
      sparkDirs.forEach((d, i) => {
        position.setXYZ(i, d.x * reach, d.y * reach, d.z * reach);
        size.setX(i, .16 * (1 - burst * .6));
        alpha.setX(i, Math.pow(1 - burst, 1.4));
      });
      position.needsUpdate = true;
      size.needsUpdate = true;
      alpha.needsUpdate = true;
    }
    const ring = span(T.wave, p);
    wave.visible = ring > 0 && ring < 1;
    wave.scale.setScalar(.3 + easeOutCubic(ring) * 5.5);
    wave.material.opacity = Math.pow(1 - ring, 2) * .95;
    wave.quaternion.copy(camera.quaternion);

    /* ---- B: the tablet ---- */
    const pop = span(T.pop, p);
    const settle = easeInOut(span(T.settle, p));
    hero.visible = p > T.pop[0];
    if (hero.visible) {
      const landing = clamp((p - (T.drop[1] - .012)) / .02);
      const hop = Math.sin(landing * Math.PI) * .32;
      const bob = still ? 0 : Math.sin(time * 1.1) * .08 * (1 - settle * .6);
      hero.position.set(0, lerp(.05, GROUND + (PANDA_HEIGHT * S_C) / 2 + .02, settle) + bob + hop, lerp(0, 1.6, settle));
      hero.scale.setScalar(Math.max(.001, lerp(S_B, S_C, settle) * (pop < 1 ? easeOutBack(pop) : 1)));
      // One full turn as it arrives, then it faces the camera while the halo of thirty forms.
      const turn = easeInOut(span(T.turn, p));
      hero.rotation.set(.05 + (still ? 0 : Math.sin(time * .7) * .07), lerp(-.5 + turn * (Math.PI * 2 + .5), Math.PI * 2 - .3, settle) + (still ? 0 : Math.sin(time * .6) * .1), still ? 0 : Math.sin(time * .5) * .05);
      const j = state.jelly;
      jelly.scale.set(1 - j * .1, 1 + j * .18, 1 - j * .1);
    }
    const sparkle = smooth(.31, .38, p) * (1 - smooth(.6, .66, p));
    glitter.visible = sparkle > .01;
    if (glitter.visible) {
      const position = glitter.geometry.attributes.position;
      const size = glitter.geometry.attributes.size;
      const alpha = glitter.geometry.attributes.alpha;
      glitterSpots.forEach((spot, i) => {
        position.setXYZ(i, hero.position.x + spot.at.x, hero.position.y + spot.at.y, hero.position.z + spot.at.z);
        size.setX(i, spot.size);
        alpha.setX(i, sparkle * (still ? .6 : Math.pow(.5 + .5 * Math.sin(time * spot.speed + spot.phase), 3)));
      });
      position.needsUpdate = true;
      size.needsUpdate = true;
      alpha.needsUpdate = true;
    }
    const ringOut = span(T.halo, p);
    const scatter = span(T.scatter, p);
    halo.forEach((holder, i) => {
      const data = holder.userData;
      const k = clamp((ringOut - data.delay) / .45);
      holder.visible = k > 0 && scatter < 1;
      if (!holder.visible) return;
      const out = easeOutBack(k);
      const angle = data.angle + time * .22 + p * 7;
      // A tilted orbit around the tablet: the back half passes behind it, the front half in front of its feet.
      const r = lerp(.2, 2.65 * spread, out) * (1 + easeInCubic(scatter) * 2.6);
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      holder.position.set(
        hero.position.x + cos * r,
        hero.position.y - .1 - sin * r * .26 + cos * r * .14 + scatter * scatter * 2.4 + (still ? 0 : Math.sin(time * 1.2 + data.phase) * .05),
        hero.position.z + sin * r * .85,
      );
      holder.scale.setScalar(Math.max(.001, .27 * Math.min(out, 1.12) * (1 - scatter * .85)));
      holder.rotation.set(Math.sin(time * .8 + data.phase) * .3, Math.sin(time * .5 + data.phase) * .6 - cos * .35, Math.sin(time * .6 + data.phase) * .3 + scatter * (i % 2 ? 5 : -5));
    });

    /* ---- C: the watermelon ---- */
    const drop = span(T.drop, p);
    melon.group.visible = p > T.drop[0];
    const split = span(T.split, p);
    if (melon.group.visible) {
      const fall = (1 - easeOutBounce(drop)) * 7;
      melon.group.position.set(0, melonCentre + fall, MELON_Z);
      melon.group.rotation.set(0, (1 - easeOutCubic(drop)) * 2.4, Math.pow(1 - drop, 2) * .8);
      const open = split > 0 ? easeOutBack(split) : 0;
      const rock = still ? 0 : Math.sin(time * .9) * .025 * open;
      // Halves open to three-quarters, so both the dome of rind and the cut face read.
      melon.right.position.x = open * 1.12;
      melon.right.rotation.set(-.3 * open, open * .62, rock);
      melon.left.position.x = -open * 1.12;
      melon.left.rotation.set(-.3 * open, -open * .62, -rock);
      melon.caps.forEach(cap => { cap.visible = split > 0; });
      const grounded = clamp(1 - fall / 4);
      shadows.left.visible = shadows.right.visible = true;
      shadows.left.position.set(-open * 1.15, GROUND + .003, MELON_Z);
      shadows.right.position.set(open * 1.15, GROUND + .003, MELON_Z);
      shadows.left.material.opacity = shadows.right.material.opacity = .5 * grounded;
    } else {
      shadows.left.visible = shadows.right.visible = false;
    }
    shadows.panda.visible = settle > 0;
    shadows.panda.position.set(hero.position.x, GROUND + .004, hero.position.z);
    shadows.panda.material.opacity = .6 * settle * clamp(1 - (hero.position.y - (GROUND + (PANDA_HEIGHT * S_C) / 2)) / .8);
    const fly = (mesh, list, scale, stretchy) => {
      list.forEach((item, i) => {
        const j = clamp((p - T.juice[0] - item.delay) / (T.juice[1] - T.juice[0] - .03));
        const tau = j * 1.35;
        dummy.position.copy(item.from).addScaledVector(item.velocity, tau);
        dummy.position.y -= 2.7 * tau * tau;
        const alive = j > 0 && j < 1 && dummy.position.y > GROUND + item.r;
        const r = alive ? item.r * scale * (1 - smooth(.7, 1, j)) : 0;
        if (stretchy) {
          vectors.dir.copy(item.velocity);
          vectors.dir.y -= 5.4 * tau;
          const speed = vectors.dir.length();
          dummy.quaternion.setFromUnitVectors(vectors.up, vectors.dir.normalize());
          dummy.scale.set(r, r * (1 + Math.min(speed * .14, .9)), r);
        } else {
          dummy.rotation.set(item.spin.x * tau, item.spin.y * tau, item.spin.z * tau);
          dummy.scale.setScalar(r);
        }
        if (!alive) dummy.scale.setScalar(0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    };
    const juicy = p > T.juice[0] && p < T.juice[1] + .01;
    juice.visible = seeds.visible = juicy;
    if (juicy) {
      fly(juice, drops, 1, true);
      fly(seeds, pips, 2.2, false);
    }
    wedges.forEach((holder, i) => {
      const spot = WEDGES[i];
      const k = clamp((p - T.wedges[0] - i * .035) / .09);
      holder.visible = k > 0;
      if (!holder.visible) return;
      const e = easeOutBack(k);
      const float = still ? 0 : Math.sin(time * .8 + i * 2) * .08;
      holder.position.set(lerp(spot.x * 1.4, spot.x, e) * spread, lerp(spot.y + 5, spot.y, e) + float, lerp(spot.z - 1, spot.z, e));
      holder.rotation.set(spot.rx + (1 - e) * 2 + (still ? 0 : Math.sin(time * .5 + i) * .08), spot.ry + (1 - e) * 3 + (still ? 0 : time * .15), spot.rz + (1 - e));
      holder.scale.setScalar(spot.s * Math.max(.001, Math.min(e, 1.1)));
    });

    /* ---- dust and camera ---- */
    const position = dust.geometry.attributes.position;
    const size = dust.geometry.attributes.size;
    const alpha = dust.geometry.attributes.alpha;
    motes.forEach((mote, i) => {
      const y = ((((mote.y + time * mote.speed + p * 6) % 10) + 15) % 10) - 5;
      position.setXYZ(i, mote.x + world.position.x * .3, y, mote.z);
      size.setX(i, mote.size);
      alpha.setX(i, mote.a);
    });
    position.needsUpdate = true;
    size.needsUpdate = true;
    alpha.needsUpdate = true;

    const dolly = 1 - .05 * bell([.3, .46, .62], p) + .03 * smooth(.62, .74, p);
    camera.position.set(0, .45 + lift, distance * dolly);
    camera.lookAt(0, lift, 0);
    const pointScale = renderer.domElement.height / (2 * tanHalf);
    [dust, sparks, glitter, ...atom.shells.map(shell => shell.tail)].forEach(points => { points.material.uniforms.uScale.value = pointScale; });

    /* ---- the DOM overlays that follow the scene ---- */
    scene.updateMatrixWorld();
    const tagsOut = 1 - smooth(T.tags[2], T.tags[3], p);
    const scale = atom.group.scale.x;
    place(tags.mg, atom.group.getWorldPosition(anchor).add(tagOffset.set(1.15 * scale, 1.35 * scale, 0)).clone(), smooth(.6, .95, state.enter) * tagsOut, 0, -100);
    place(tags.b6, mol.group.getWorldPosition(anchor).add(tagOffset.set(-1.1, -.55, 0)).clone(), smooth(T.tags[0], T.tags[1], p) * tagsOut, -100, -50);
    if (flash) flash.style.opacity = bell(T.flash, p).toFixed(3);
    if (counter) {
      const count = 1 + Math.round(clamp(ringOut / .98) * 29);
      if (count !== shownCount) { shownCount = count; counter.textContent = String(count); }
      counterBox.style.opacity = smooth(0, .06, ringOut).toFixed(3);
    }

    renderer.render(scene, camera);
    Q(renderer);
    if (firstFrame) { firstFrame = false; section.classList.add('mg-gl-ready'); }
  };
  runWhileVisible(section, renderer, tick);
}

/* =====================================================================
   Hero still life — the same jar, watermelon wedge and panda tablets used
   further down, composed as one live 3D scene in front of the pack's petal
   flower (an SVG behind the canvas, centred where the jar is framed). Props
   stay at believable sizes next to the jar and move calmly: they settle in,
   breathe, and stay put when the page scrolls. Nothing follows the cursor; the jar
   turns when it is grabbed and settles back to its front afterwards.
   Until the first frame is drawn the visual shows only the 3D loader. The
   photographs are kept for no WebGL and data-saver mode only.
   ===================================================================== */
const JAR_HEIGHT = 2.7;
const MELON_TONE = { light: .86, saturation: 1.32, reflect: .15 };
// Soft ground shadow, tinted with the hero's navy. `core` keeps it dark out to that fraction of its radius,
// so the darkest part reaches the object's edge (where the camera can see it) and then fades out quickly.
function softShadow(THREE, width, depth, opacity, core = 0) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  const at = t => core + (1 - core) * t;
  gradient.addColorStop(0, 'rgba(18, 26, 86, .62)');
  if (core) gradient.addColorStop(core, 'rgba(18, 26, 86, .62)');
  gradient.addColorStop(at(.22), 'rgba(18, 26, 86, .36)');
  gradient.addColorStop(at(.55), 'rgba(18, 26, 86, .1)');
  gradient.addColorStop(1, 'rgba(18, 26, 86, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false, opacity }));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = .003;
  mesh.userData.opacity = opacity;
  return mesh;
}

async function initHero() {
  const canvas = $('[data-hero-canvas]');
  if (!canvas || !heroVisual) { heroSettled(); return; }
  const fallback = () => { heroVisual.classList.add('mg-hero--nogl'); heroSettled(); };
  if (navigator.connection?.saveData) { fallback(); return; }
  let THREE;
  let RoomEnvironment;
  let jarGltf;
  let melonGltf;
  let pandaModel;
  try {
    ({ THREE, RoomEnvironment } = await loadThree());
    [jarGltf, melonGltf, pandaModel] = await Promise.all([loadGltf('jar.glb'), loadGltf('watermelon-slice.glb'), loadPanda(THREE)]);
  } catch { fallback(); return; }
  const renderer = createRenderer(THREE, canvas);
  if (!renderer) { fallback(); return; }
  if (!renderer.userData.lite) renderer.setPixelRatio(Math.min(devicePixelRatio || 1, tier === 2 ? 1.75 : 1.25));
  renderer.toneMappingExposure = 1.02;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(24, 1, .1, 100);
  addEnvironment(THREE, RoomEnvironment, renderer, scene);

  const rig = new THREE.Group();
  scene.add(rig);
  // Every piece: a base pose (jar units, jar base at the origin).
  const pieces = [];
  const add = (object, base, depth, extra = {}) => {
    const holder = new THREE.Group();
    holder.add(object);
    rig.add(holder);
    const piece = { holder, object, base, depth, ...extra };
    pieces.push(piece);
    return piece;
  };

  const { jar } = buildJar(THREE, jarGltf);
  // A shade darker than in the jar chapter, so the white pack doesn't glare against the light hero.
  jar.traverse(node => {
    if (!node.isMesh) return;
    node.material.color.multiplyScalar(.8);
    node.material.envMapIntensity = .66;
  });
  const jarGroup = new THREE.Group();
  jarGroup.add(jar);
  // Wide soft falloff plus a tight contact core right under the base. Neither turns with the jar.
  const jarShadow = softShadow(THREE, 3.8, 3.4, .45, .45);
  const jarContact = softShadow(THREE, 2.5, 2.5, .9, .78);
  jarShadow.position.z = -.08;
  jarContact.position.y = .004;
  rig.add(jarShadow, jarContact);
  // Faces the camera square on: the logo front, centred.
  const jarPiece = add(jarGroup, { x: 0, y: 0, z: 0, ry: 0 }, .35, { kind: 'jar' });

  // The wedge model already stands on its rind with the tip up.
  // A prop next to the jar, not a second hero: the wedge stays under two thirds of the jar's height.
  const melon = new THREE.Group();
  const wedge = melonWedge(THREE, melonGltf);
  // Same model as the taste chapter's wedges. Here the front key light hits the cut face square on and washes
  // it out, so the hero copy takes a little less light and reflection and a saturation boost to land on the
  // same bright watermelon red.
  wedge.traverse(node => {
    if (!node.isMesh) return;
    node.material = node.material.clone();
    node.material.color.multiplyScalar(MELON_TONE.light);
    node.material.envMapIntensity = MELON_TONE.reflect;
    // Richer colour without tinting: reds get redder and the rind stays green.
    node.material.onBeforeCompile = shader => {
      shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
        diffuseColor.rgb = mix(vec3(dot(diffuseColor.rgb, vec3(.2126, .7152, .0722))), diffuseColor.rgb, ${MELON_TONE.saturation.toFixed(2)});`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        totalEmissiveRadiance = mix(vec3(dot(totalEmissiveRadiance, vec3(.2126, .7152, .0722))), totalEmissiveRadiance, ${MELON_TONE.saturation.toFixed(2)});`);
    };
  });
  melon.add(wedge);
  melon.scale.setScalar(2.5);
  // The wedge stands on its rind, so its shadow is a long thin ellipse along the rind.
  const melonShadow = softShadow(THREE, 2, .75, .6, .3);
  // Seated on the ground behind the jar, well over half of it hidden by the pack; rind flat, cut face to the camera.
  const melonPose = { x: -.9, y: 0, z: -1.2, rx: 0, ry: .3, rz: 0 };
  melon.rotation.set(melonPose.rx, melonPose.ry, melonPose.rz);
  melonPose.y = -new THREE.Box3().setFromObject(melon).min.y;
  melon.rotation.set(0, 0, 0);
  const melonPiece = add(melon, melonPose, -.5, { kind: 'melon', delay: .2 });
  melonShadow.position.set(melonPose.x, .004, melonPose.z);
  melonShadow.rotation.z = melonPose.ry;
  rig.add(melonShadow);

  // One tablet in front, about a quarter of the jar's height.
  const pandaHero = makePanda(THREE, pandaModel);
  pandaHero.scale.setScalar(.42);
  const pandaShadow = softShadow(THREE, .78, .42, .75, .3);
  pandaShadow.rotation.z = -.38;
  const pandaPiece = add(pandaHero, { x: 1.16, y: .32, z: 1, rx: -.04, ry: -.38, rz: .08 }, 1.2, { kind: 'panda', delay: .38 });
  pandaShadow.position.set(1.16, .004, 1);
  rig.add(pandaShadow);

  // Three small tablets hanging on the flower's ring, close enough to stay sharp.
  [
    { x: -1.6, y: 2.95, z: -.7, s: .3, ry: .55, rz: -.3 },
    { x: 1.78, y: 2.5, z: -.45, s: .34, ry: -.6, rz: .26 },
    { x: -2.05, y: 2.1, z: .3, s: .22, ry: .85, rz: .4 },
  ].forEach((spot, i) => {
    const tablet = makePanda(THREE, pandaModel);
    tablet.scale.setScalar(spot.s);
    add(tablet, { x: spot.x, y: spot.y, z: spot.z, rx: .1, ry: spot.ry, rz: spot.rz }, 2, { kind: 'float', delay: .5 + i * .1, phase: i * 2.1 });
  });

  // Frame the jar where the poster photo sits: centred on the flower in the visual.
  const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  let distance = 10;
  // Phones pull the side props in so the melon and tablets stay on screen.
  let spread = 1;
  const fit = (width, height) => {
    const box = canvas.getBoundingClientRect();
    const area = heroVisual.getBoundingClientRect();
    if (!area.height) return;
    const narrow = innerWidth <= 900;
    spread = narrow ? clamp(area.width / (area.height * 1.05), .78, 1) : 1;
    // The flower fills the visual's height; the jar takes 60% of it so the petals frame it.
    const jarPx = area.height * .6;
    distance = height * JAR_HEIGHT / (2 * tanHalf * jarPx);
    camera.position.set(0, JAR_HEIGHT / 2 + distance * .09, distance);
    camera.lookAt(0, JAR_HEIGHT / 2, 0);
    const targetX = area.left + area.width / 2 - box.left;
    const targetY = area.top + area.height * (narrow ? .5 : .53) - box.top;
    camera.setViewOffset(width, height, width / 2 - targetX, height / 2 - targetY, width, height);
  };
  keepSized(renderer, camera, canvas, fit);
  addEventListener('resize', () => fit(canvas.clientWidth, canvas.clientHeight));

  const lite = renderer.userData.lite;
  const still = reduceMotion || lite;
  const clock = new THREE.Clock();
  // Grab and turn the jar; it keeps spinning a little after release, then settles back to its front.
  const hint = $('.mg-hero__drag', heroVisual);
  const drag = makeDrag(heroVisual, () => hint?.classList.add('is-hidden'));
  heroVisual.addEventListener('pointerdown', () => heroVisual.classList.add('is-grabbing'));
  ['pointerup', 'pointercancel'].forEach(type => heroVisual.addEventListener(type, () => heroVisual.classList.remove('is-grabbing')));
  let startedAt = 0;
  let lastKey = '';
  let shown = false;

  const tick = () => {
    const time = still ? 0 : clock.getElapsedTime();
    if (!startedAt) startedAt = performance.now();
    const intro = still ? 1 : clamp((performance.now() - startedAt) / 1400);
    if (!drag.dragging) {
      drag.offset += drag.velocity;
      drag.velocity *= .93;
      if (Math.abs(drag.velocity) < 1e-4) drag.velocity = 0;
      if (performance.now() - drag.releasedAt > 1400) {
        // Back to the nearest front view, without unwinding the turns it was given.
        const front = Math.round(drag.offset / (Math.PI * 2)) * Math.PI * 2;
        drag.offset += (front - drag.offset) * (still ? 1 : .05);
        if (Math.abs(front - drag.offset) < 1e-4) drag.offset = front;
      }
    }

    if (still) {
      const key = `${drag.offset.toFixed(4)}|${drag.dragging}|${canvas.width}x${canvas.height}`;
      if (key === lastKey && shown) return;
      lastKey = key;
    }

    pieces.forEach(piece => {
      const { holder, base } = piece;
      const local = clamp((intro - (piece.delay || 0)) / (1 - (piece.delay || 0)));
      const k = still ? 1 : easeOutBack(local);
      const settle = still ? 1 : 1 - Math.pow(1 - local, 3);
      let x = base.x * spread;
      let y = base.y;
      let rx = base.rx || 0;
      let ry = base.ry || 0;
      let rz = base.rz || 0;
      let scale = 1;
      if (piece.kind === 'jar') {
        // Stands on the ground (no bob), so the contact shadow stays under it.
        y += lerp(-.25, 0, settle);
        scale = lerp(.92, 1, settle);
        ry += drag.offset;
      } else if (piece.kind === 'melon') {
        x += lerp(.9, 0, k);
        // A gentle rock on its rind, the same rhythm as the panda tablet in front.
        rz += lerp(.5, 0, k) + Math.sin(time * .95 + 1.3) * .035;
        ry += Math.sin(time * .5 + 2) * .07;
      } else if (piece.kind === 'panda') {
        y += lerp(1.8, 0, k);
        rz += lerp(-.5, 0, k) + Math.sin(time * 1.05) * .06;
        ry += Math.sin(time * .5) * .08;
      } else {
        // Bob and sway; no perpetual spin.
        scale = still ? 1 : clamp(k, 0, 1.2);
        y += Math.sin(time * .8 + piece.phase) * .08;
        rx += Math.sin(time * .5 + piece.phase) * .18;
        ry += Math.sin(time * .35 + piece.phase) * .45;
        rz += Math.sin(time * .45 + piece.phase) * .12;
      }
      holder.position.set(x, y, base.z);
      holder.rotation.set(rx, ry, rz);
      holder.scale.setScalar(Math.max(scale, .001));
    });
    // Ground shadows follow their piece sideways and fade as it lifts away.
    melonShadow.position.x = melonPiece.holder.position.x;
    pandaShadow.position.x = pandaPiece.holder.position.x;
    pandaShadow.material.opacity = pandaShadow.userData.opacity * clamp(1 - (pandaPiece.holder.position.y - pandaPiece.base.y) / .6);
    melonShadow.material.opacity = melonShadow.userData.opacity * clamp(1 - Math.abs(melonPiece.holder.position.x - melonPiece.base.x * spread) / .6);
    const grounded = 1 - Math.pow(1 - intro, 3);
    jarShadow.material.opacity = jarShadow.userData.opacity * grounded;
    jarContact.material.opacity = jarContact.userData.opacity * grounded;
    jarContact.position.x = jarPiece.holder.position.x;
    jarShadow.position.x = jarContact.position.x - .06;

    renderer.render(scene, camera);
    Q(renderer);
    if (!shown) { shown = true; heroVisual.classList.add('mg-hero--live'); heroSettled(); }
  };
  runWhileVisible(hero, renderer, tick);
}

if (heroVisual) initHero();
if (story) whenNear(story.section, initStory);
