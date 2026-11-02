// Магне B6 Кидс showcase: the live 3D hero still life, scroll choreography, the
// 3D jar with its real label, the interactive dose calculator, the spinnable 3D
// panda tablet, the in-page commercial and the phone "where to buy" bar.
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

/* ------------------------------------------------------------------ jar scene (captions, HUD) */
const jarSection = $('#mg-jar');
const jarScene = jarSection && {
  section: jarSection,
  caps: $$('.mg-cap', jarSection),
  track: $('.mg-track i', jarSection),
  bigword: $('.mg-bigword', jarSection),
  target: 0,
  tone: '',
  side: 1,
};

function sectionProgress(section) {
  const rect = section.getBoundingClientRect();
  const total = rect.height - innerHeight;
  return total > 0 ? clamp(-rect.top / total) : 0;
}

function updateJarScene() {
  if (!jarScene) return;
  const p = sectionProgress(jarScene.section);
  jarScene.target = p;
  let active = jarScene.caps[0];
  let best = -1;
  jarScene.caps.forEach(cap => {
    const start = Number(cap.dataset.in);
    const end = Number(cap.dataset.out);
    const fade = .03;
    const fadeIn = start <= 0 ? 1 : smooth(start, start + fade, p);
    const fadeOut = end >= 1 ? 1 : 1 - smooth(end - fade, end, p);
    const opacity = fadeIn * fadeOut;
    cap.style.opacity = opacity.toFixed(3);
    cap.style.transform = `translate3d(0, ${((1 - opacity) * (p < start + fade ? 26 : -18)).toFixed(1)}px, 0)`;
    cap.classList.toggle('is-live', opacity > .5);
    if (opacity > best) { best = opacity; active = cap; }
  });
  jarScene.side = active?.classList.contains('mg-cap--right') ? -1 : 1;
  const sideName = jarScene.side < 0 ? 'right' : 'left';
  if (jarScene.section.dataset.side !== sideName) jarScene.section.dataset.side = sideName;
  const tone = active?.dataset.tone || '';
  if (tone !== jarScene.tone) {
    jarScene.tone = tone;
    if (tone) jarScene.section.dataset.tone = tone; else delete jarScene.section.dataset.tone;
  }
  if (jarScene.track) jarScene.track.style.transform = `scaleX(${p.toFixed(4)})`;
  if (jarScene.bigword && !reduceMotion) {
    const travel = Math.max(0, jarScene.bigword.scrollWidth - innerWidth * 1.2);
    jarScene.bigword.style.transform = `translate3d(${(-p * travel * .5).toFixed(1)}px, -50%, 0)`;
  }
}

/* ------------------------------------------------------------------ taste + film scroll effects */
const tasteSection = $('#mg-taste');
const tasteWord = tasteSection && $('.mg-bigword', tasteSection);
const film = $('[data-film]');

function passProgress(section) {
  const rect = section.getBoundingClientRect();
  return clamp((innerHeight - rect.top) / (innerHeight + rect.height));
}

function updatePassEffects() {
  if (tasteSection) {
    const q = passProgress(tasteSection);
    tasteSection.style.setProperty('--tp', (q - .5).toFixed(3));
    if (tasteWord && !reduceMotion) tasteWord.style.transform = `translate3d(${(-q * Math.max(0, tasteWord.scrollWidth - innerWidth) * .55).toFixed(1)}px, -50%, 0)`;
  }
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
  // Shown once the hero buttons are gone, kept out of the immersive jar scene and away from the partner list itself.
  const on = heroActions.getBoundingClientRect().bottom < 0
    && current?.id !== 'mg-jar'
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
  updateJarScene();
  updatePassEffects();
  updateChrome();
}
const requestFrame = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
addEventListener('scroll', requestFrame, { passive: true });
addEventListener('resize', () => { measureNav(); requestFrame(); });
frame();

/* ------------------------------------------------------------------ chapter jumps */
const veil = $('.mg-veil');
const tint = { 'mg-jar': '#0b0f4a', 'mg-dose': '#f3f8fe', 'mg-taste': '#3fcdf7', 'mg-film': '#070a2c', 'mg-facts': '#ffffff', 'mg-buy': '#262c8e' };
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

function contactShadow(THREE, strength = 1) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(0, 0, 20, .55)');
  gradient.addColorStop(1, 'rgba(0, 0, 20, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false, opacity: strength }));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = .002;
  return mesh;
}

// Jar yaw keyframes (in turns of π), one hold per caption beat:
// front logo for the formula, the gluten/lactose icon panel, then front again as the cap pops.
const yawKeys = [[0, -.75], [.12, 0], [.27, 0], [.42, 1.34], [.6, 1.34], [.7, 2], [1, 2]];
function keyframe(keys, p) {
  for (let i = 1; i < keys.length; i += 1) {
    const [p1, v1] = keys[i];
    const [p0, v0] = keys[i - 1];
    if (p <= p1) return lerp(v0, v1, easeInOut(clamp((p - p0) / (p1 - p0))));
  }
  return keys[keys.length - 1][1];
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

async function initJar() {
  const canvas = $('[data-jar-canvas]');
  const section = jarScene.section;
  let THREE;
  let RoomEnvironment;
  try {
    ({ THREE, RoomEnvironment } = await loadThree());
  } catch {
    section.classList.add('mg-nogl');
    return;
  }
  const renderer = createRenderer(THREE, canvas);
  if (!renderer) { section.classList.add('mg-nogl'); return; }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, .1, 100);
  addEnvironment(THREE, RoomEnvironment, renderer, scene);

  let jarModel;
  try {
    jarModel = await loadGltf('jar.glb');
  } catch {
    renderer.dispose();
    section.classList.add('mg-nogl');
    return;
  }
  const { jar, body, cap, capBase } = buildJar(THREE, jarModel);
  const rig = new THREE.Group();
  rig.add(jar, contactShadow(THREE));
  scene.add(rig);

  const pandaModel = await loadPanda(THREE).catch(() => null);
  const tablets = Array.from({ length: pandaModel ? 14 : 0 }, (_, i) => {
    const mesh = makePanda(THREE, pandaModel);
    mesh.visible = false;
    mesh.userData = {
      angle: i * 2.39996,
      radius: 2 + (i % 3) * .45,
      height: .15 + (i / 13) * 2.9,
      delay: (i / 14) * .5,
      spin: new THREE.Vector3(Math.random() - .5, Math.random() - .5, Math.random() - .5).normalize(),
      size: .4 + (i % 4) * .045,
    };
    jar.add(mesh);
    return mesh;
  });

  let fit = 10;
  let shift = 0;
  let lift = 0;
  keepSized(renderer, camera, canvas, (width, height) => {
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const narrow = width < 900;
    const byHeight = 2.75 / ((narrow ? .5 : .56) * 2 * tanHalf);
    const byWidth = 2.1 / ((narrow ? .62 : .3) * 2 * tanHalf * (width / height));
    fit = Math.max(byHeight, byWidth);
    // Desktop: the jar steps aside for the caption. Phones: captions sit on top, the jar below.
    shift = narrow ? 0 : fit * tanHalf * (width / height) * .3;
    lift = narrow ? fit * tanHalf * .32 : 0;
  });
  let side = 0;

  const drag = makeDrag(canvas, () => $('.mg-drag', section)?.classList.add('is-hidden'));
  const clock = new THREE.Clock();
  let p = 0;
  let firstFrame = true;
  let lastKey = '';
  const lite = renderer.userData.lite;
  const still = reduceMotion || lite;
  const target = new THREE.Vector3();

  const tick = () => {
    const time = still ? 0 : clock.getElapsedTime();
    p += (jarScene.target - p) * (still ? 1 : .085);
    const enter = smooth(0, .12, p);
    const burst = smooth(.74, .95, p);
    const open = smooth(.7, .81, p);

    if (!drag.dragging) {
      drag.offset += drag.velocity;
      drag.velocity *= .92;
      if (performance.now() - drag.releasedAt > 900) drag.offset *= .94;
    }
    if (Math.abs(drag.offset) < 1e-4) drag.offset = 0;
    if (Math.abs(drag.velocity) < 1e-4) drag.velocity = 0;
    if (lite) {
      const key = `${p.toFixed(4)}|${drag.offset.toFixed(4)}|${drag.dragging}|${canvas.width}x${canvas.height}`;
      if (key === lastKey && !firstFrame) return;
      lastKey = key;
    }
    const sway = still ? 0 : Math.sin(time * .6) * .05;
    jar.rotation.y = keyframe(yawKeys, p) * Math.PI + drag.offset + sway;
    jar.rotation.x = .06 + open * .12;
    jar.rotation.z = Math.sin(time * .5) * .012;
    // The jar stays beside the caption while it bursts, so the flying tablets never cover the copy.
    side += ((jarScene.side * (1 - burst * .08)) - side) * (still ? 1 : .05);
    rig.position.x = side * shift;
    rig.position.y = lerp(-.5, 0, enter) + (still ? 0 : Math.sin(time * .9) * .035) - open * .25;
    rig.scale.setScalar(lerp(.9, 1, enter));

    cap.position.set(open * .9, capBase + open * 1.55, -open * .2);
    cap.rotation.set(-open * .35, open * 2.6, -open * .45);

    tablets.forEach(mesh => {
      const data = mesh.userData;
      const t = clamp((burst - data.delay) / .5);
      mesh.visible = t > .001;
      if (!mesh.visible) return;
      const k = easeOutBack(t);
      const angle = data.angle + time * .18 * t;
      target.set(Math.sin(angle) * data.radius, data.height, Math.cos(angle) * data.radius);
      mesh.position.set(lerp(0, target.x, k), lerp(2.15, target.y, k) + Math.sin(t * Math.PI) * 1.1 + Math.sin(time * 1.3 + data.angle) * .06 * t, lerp(0, target.z, k));
      mesh.scale.setScalar(lerp(.12, data.size, clamp(t * 1.6)));
      // Mostly face the camera so the debossed panda reads, with a gentle tumble.
      mesh.rotation.set(Math.sin(time * .8 + data.angle) * .55 * data.spin.x + .15, -jar.rotation.y + Math.sin(time * .6 + data.angle * 2) * .9 * data.spin.y, Math.sin(time * .7 + data.angle) * .35 * data.spin.z);
    });

    const distance = fit * (1 + burst * .42);
    camera.position.set(0, 1.55 + lift + burst * .55, distance);
    camera.lookAt(0, 1.22 + lift + burst * .35, 0);
    renderer.render(scene, camera);
    Q(renderer);
    if (firstFrame) { firstFrame = false; section.classList.add('mg-gl-ready'); }
  };
  runWhileVisible(section, renderer, tick);
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

async function initPanda() {
  const stage = $('[data-taste-stage]');
  const canvas = $('[data-panda-canvas]');
  let THREE;
  let RoomEnvironment;
  try {
    ({ THREE, RoomEnvironment } = await loadThree());
  } catch { return; }
  const renderer = createRenderer(THREE, canvas);
  if (!renderer) return;
  renderer.toneMappingExposure = 1;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 50);
  camera.position.set(0, 0, 6.2);
  addEnvironment(THREE, RoomEnvironment, renderer, scene);
  let pandaModel;
  try {
    pandaModel = await loadPanda(THREE);
  } catch {
    renderer.dispose();
    return;
  }
  const panda = makePanda(THREE, pandaModel);
  const holder = new THREE.Group();
  holder.add(panda);
  scene.add(holder);
  keepSized(renderer, camera, canvas, (width, height) => {
    const size = Math.min(1, (width / height) * .95);
    holder.scale.setScalar(1.5 * size);
  });

  const drag = makeDrag(canvas, () => $('.mg-drag', stage)?.classList.add('is-hidden'));
  let squash = 0;
  canvas.addEventListener('click', event => {
    squash = 1;
    burstSparks(stage, event.clientX, event.clientY);
  });
  const clock = new THREE.Clock();
  const still = reduceMotion || renderer.userData.lite;
  let lastKey = '';
  const tick = () => {
    const time = still ? 0 : clock.getElapsedTime();
    if (!drag.dragging) {
      drag.offset += drag.velocity;
      drag.velocity *= .95;
      if (Math.abs(drag.velocity) < 1e-4) drag.velocity = 0;
      if (!still) drag.offset += .006;
    }
    if (still) {
      const key = `${drag.offset.toFixed(4)}|${squash > .01}|${canvas.width}x${canvas.height}`;
      if (key === lastKey) return;
      lastKey = key;
    }
    holder.rotation.y = drag.offset - .35;
    holder.rotation.x = Math.sin(time * .7) * .12;
    holder.rotation.z = Math.sin(time * .5) * .06;
    holder.position.y = still ? 0 : Math.sin(time * 1.1) * .08;
    squash *= .9;
    panda.scale.set(1 + squash * .12 * Math.sin(time * 30), 1 - squash * .14 * Math.sin(time * 30), 1);
    renderer.render(scene, camera);
    Q(renderer);
    if (!tasteSection.classList.contains('mg-gl-ready')) tasteSection.classList.add('mg-gl-ready');
  };
  runWhileVisible(stage, renderer, tick);
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

/* ---------- watermelon slices: 3D wedges that take over from the two flat images in the taste section ---------- */
async function initMelons() {
  const canvas = $('[data-melon-canvas]', tasteSection);
  const anchors = $$('.mg-taste__melon', tasteSection);
  if (!canvas || !anchors.length) return;
  let THREE;
  let RoomEnvironment;
  let gltf;
  try {
    ({ THREE, RoomEnvironment } = await loadThree());
    gltf = await loadGltf('watermelon-slice.glb');
  } catch { return; }
  const renderer = createRenderer(THREE, canvas);
  if (!renderer) return;
  renderer.toneMappingExposure = 1;
  const scene = new THREE.Scene();
  addEnvironment(THREE, RoomEnvironment, renderer, scene);

  const model = melonWedge(THREE, gltf);

  // Pixel-space orthographic camera over the whole section, so each slice can sit exactly on its image.
  const camera = new THREE.OrthographicCamera(0, 1, 0, -1, 1, 4000);
  camera.position.z = 2000;
  keepSized(renderer, camera, canvas, (width, height) => {
    camera.left = 0; camera.right = width; camera.top = 0; camera.bottom = -height;
    camera.updateProjectionMatrix();
  });
  const slices = anchors.map((img, i) => {
    const holder = new THREE.Group();
    holder.add(model.clone());
    scene.add(holder);
    return { img, holder, phase: i * 2.1, tilt: i ? -.32 : .28, flip: i ? 1 : -1 };
  });

  const clock = new THREE.Clock();
  const still = reduceMotion || renderer.userData.lite;
  let lastKey = '';
  const tick = () => {
    const time = still ? 0 : clock.getElapsedTime();
    const base = canvas.getBoundingClientRect();
    let key = '';
    slices.forEach(slice => {
      const rect = slice.img.getBoundingClientRect();
      slice.holder.visible = rect.width > 0 && rect.height > 0;
      if (!slice.holder.visible) return;
      const cx = rect.left + rect.width / 2 - base.left;
      const cy = rect.top + rect.height / 2 - base.top;
      // The flat images are tall wedges; the 3D one fills about the same height.
      const px = Math.max(rect.width, rect.height) * .72;
      slice.holder.position.set(cx, -cy, 0);
      slice.holder.scale.setScalar(px);
      slice.holder.rotation.set(
        .35 + Math.sin(time * .7 + slice.phase) * .12,
        slice.flip * .5 + time * .35 * slice.flip + slice.phase,
        slice.tilt + Math.sin(time * .5 + slice.phase) * .06,
      );
      key += `${cx.toFixed(1)},${cy.toFixed(1)},${px.toFixed(1)}|`;
    });
    if (still) {
      key += `${canvas.width}x${canvas.height}`;
      if (key === lastKey) return;
      lastKey = key;
    }
    renderer.render(scene, camera);
    Q(renderer);
    if (!tasteSection.classList.contains('mg-melons-ready')) tasteSection.classList.add('mg-melons-ready');
  };
  runWhileVisible(tasteSection, renderer, tick);
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
  melon.add(wedge);
  melon.scale.setScalar(2);
  // The wedge stands on its rind, so its shadow is a long thin ellipse along the rind.
  const melonShadow = softShadow(THREE, 1.6, .6, .6, .3);
  // Seated on the ground behind the jar, about half of it hidden by the pack; rind flat, cut face to the camera.
  const melonPose = { x: -1.12, y: 0, z: -.9, rx: 0, ry: .3, rz: 0 };
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
        rz += lerp(.5, 0, k);
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
if (jarScene) whenNear(jarScene.section, initJar);
if (tasteSection) whenNear(tasteSection, initPanda);
if (tasteSection) whenNear(tasteSection, initMelons);
