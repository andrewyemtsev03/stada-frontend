// Магне B6 Кидс showcase: scroll choreography, the 3D jar with its real label,
// the interactive dose calculator and the spinnable 3D panda tablet.
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

/* ------------------------------------------------------------------ hero parallax */
const heroVisual = $('[data-hero-visual]');
if (heroVisual && finePointer && !reduceMotion) {
  hero.addEventListener('pointermove', event => {
    const rect = hero.getBoundingClientRect();
    heroVisual.style.setProperty('--mx', ((event.clientX - rect.left) / rect.width * 2 - 1).toFixed(3));
    heroVisual.style.setProperty('--my', ((event.clientY - rect.top) / rect.height * 2 - 1).toFixed(3));
  });
  hero.addEventListener('pointerleave', () => {
    heroVisual.style.setProperty('--mx', '0');
    heroVisual.style.setProperty('--my', '0');
  });
}

/* ------------------------------------------------------------------ jar scene (captions, HUD) */
const jarSection = $('#mg-jar');
const jarScene = jarSection && {
  section: jarSection,
  caps: $$('.mg-cap', jarSection),
  track: $('.mg-track i', jarSection),
  label: $('.mg-hud__label', jarSection),
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
  const tone = active?.dataset.tone || '';
  if (tone !== jarScene.tone) {
    jarScene.tone = tone;
    if (tone) jarScene.section.dataset.tone = tone; else delete jarScene.section.dataset.tone;
  }
  if (jarScene.track) jarScene.track.style.transform = `scaleX(${p.toFixed(4)})`;
  const eyebrow = $('.mg-eyebrow', active)?.textContent.replace(/^\d+\s*—\s*/, '') || '';
  if (jarScene.label && jarScene.label.textContent !== eyebrow) jarScene.label.textContent = eyebrow;
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
  if (film) {
    const rect = film.getBoundingClientRect();
    const t = reduceMotion ? 0 : 1 - clamp((innerHeight - rect.top) / (innerHeight * .75));
    film.style.setProperty('--t', t.toFixed(3));
  }
  if (heroVisual) {
    heroVisual.style.setProperty('--hs', clamp(-hero.getBoundingClientRect().top / hero.offsetHeight).toFixed(3));
  }
}

/* ------------------------------------------------------------------ nav auto-hide + chapter rail */
const rail = $('.mg-rail');
const chapters = $$('[data-theme]', $('#mg-top'));
let lastScroll = scrollY;
function updateChrome() {
  const y = scrollY;
  const pastHero = hero.getBoundingClientRect().bottom < innerHeight * .35;
  const menuOpen = $('.menu.open');
  if (siteNav) {
    if (!pastHero || menuOpen || y < lastScroll - 6) siteNav.classList.remove('mg-nav-off');
    else if (y > lastScroll + 6) siteNav.classList.add('mg-nav-off');
  }
  lastScroll = y;
  if (!rail) return;
  rail.classList.toggle('is-on', pastHero);
  const middle = innerHeight / 2;
  let current = null;
  chapters.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= middle && rect.bottom > middle) current = section;
  });
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
  };
  if (reduceMotion || !veil) { go(); return; }
  jumping = true;
  veil.style.background = tint[target.id] || '#fff';
  veil.classList.add('is-on');
  setTimeout(() => {
    go();
    requestAnimationFrame(() => requestAnimationFrame(() => { veil.classList.remove('is-on'); jumping = false; }));
  }, 300);
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

/* ---------- the panda tablet: an extruded silhouette with a sugared, debossed face ---------- */
function pandaShape(THREE) {
  const s = new THREE.Shape();
  s.moveTo(-.34, -.66);
  s.lineTo(.34, -.66);
  s.quadraticCurveTo(.5, -.66, .5, -.5);
  s.lineTo(.5, -.04);
  s.quadraticCurveTo(.5, .06, .45, .1);
  s.quadraticCurveTo(.53, .16, .53, .3);
  s.lineTo(.53, .42);
  s.quadraticCurveTo(.53, .5, .48, .53);
  s.quadraticCurveTo(.52, .68, .38, .68);
  s.quadraticCurveTo(.29, .68, .26, .6);
  s.quadraticCurveTo(0, .65, -.26, .6);
  s.quadraticCurveTo(-.29, .68, -.38, .68);
  s.quadraticCurveTo(-.52, .68, -.48, .53);
  s.quadraticCurveTo(-.53, .5, -.53, .42);
  s.lineTo(-.53, .3);
  s.quadraticCurveTo(-.53, .16, -.45, .1);
  s.quadraticCurveTo(-.5, .06, -.5, -.04);
  s.lineTo(-.5, -.5);
  s.quadraticCurveTo(-.5, -.66, -.34, -.66);
  return s;
}

function sugarCanvas(width, height, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ee9db8';
  ctx.fillRect(0, 0, width, height);
  for (let i = 0; i < width * height / 26; i += 1) {
    const light = Math.random() > .42;
    ctx.fillStyle = light ? `rgba(255, 226, 236, ${.2 + Math.random() * .5})` : `rgba(206, 104, 140, ${.14 + Math.random() * .3})`;
    ctx.beginPath();
    ctx.arc(Math.random() * width, Math.random() * height, .5 + Math.random() * 1.7, 0, Math.PI * 2);
    ctx.fill();
  }
  draw?.(ctx);
  return canvas;
}

function pandaMaterials(THREE, renderer) {
  // Face texture maps shape coordinates x ∈ [-0.6, 0.6], y ∈ [-0.75, 0.75].
  const W = 512;
  const H = 640;
  const face = sugarCanvas(W, H, ctx => {
    const X = x => (x + .6) / 1.2 * W;
    const Y = y => (.75 - y) / 1.5 * H;
    const S = v => v / 1.2 * W;
    const outline = path => {
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(178, 70, 110, .6)';
      ctx.lineWidth = 8;
      path(); ctx.stroke();
      ctx.save(); ctx.translate(-1.8, -1.8);
      ctx.strokeStyle = 'rgba(255, 232, 240, .7)';
      ctx.lineWidth = 2.6;
      path(); ctx.stroke();
      ctx.restore();
    };
    const ellipse = (x, y, rx, ry, rotation) => () => { ctx.beginPath(); ctx.ellipse(X(x), Y(y), S(rx), S(ry), rotation, 0, Math.PI * 2); };
    [[-.19, .34, .12, .085, .55], [.19, .34, .12, .085, -.55],
      [-.22, -.07, .12, .155, .1], [.22, -.07, .12, .155, -.1],
      [-.25, -.43, .13, .165, 0], [.25, -.43, .13, .165, 0],
      [-.38, .58, .055, .05, 0], [.38, .58, .055, .05, 0]].forEach(args => outline(ellipse(...args)));
    outline(() => { ctx.beginPath(); ctx.moveTo(X(-.035), Y(.235)); ctx.quadraticCurveTo(X(0), Y(.19), X(.035), Y(.235)); ctx.closePath(); });
    outline(() => { ctx.beginPath(); ctx.moveTo(X(-.08), Y(.17)); ctx.quadraticCurveTo(X(-.04), Y(.12), X(0), Y(.165)); ctx.quadraticCurveTo(X(.04), Y(.12), X(.08), Y(.17)); });
  });
  const side = sugarCanvas(256, 256);
  const faceTexture = new THREE.CanvasTexture(face);
  faceTexture.colorSpace = THREE.SRGBColorSpace;
  faceTexture.repeat.set(1 / 1.2, 1 / 1.5);
  faceTexture.offset.set(.5, .5);
  faceTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const sideTexture = new THREE.CanvasTexture(side);
  sideTexture.colorSpace = THREE.SRGBColorSpace;
  sideTexture.wrapS = sideTexture.wrapT = THREE.RepeatWrapping;
  sideTexture.repeat.set(2.5, 2.5);
  const common = { color: 0xffffff, roughness: .86, sheen: .7, sheenRoughness: .55, sheenColor: new THREE.Color(0xffd3e1), bumpScale: 2.2 };
  return [
    new THREE.MeshPhysicalMaterial({ ...common, map: faceTexture, bumpMap: faceTexture }),
    new THREE.MeshPhysicalMaterial({ ...common, map: sideTexture, bumpMap: sideTexture }),
  ];
}

function pandaGeometry(THREE) {
  const geometry = new THREE.ExtrudeGeometry(pandaShape(THREE), {
    depth: .24, bevelEnabled: true, bevelThickness: .1, bevelSize: .075, bevelSegments: 6, curveSegments: 20,
  });
  geometry.center();
  return geometry;
}

/* ---------- the jar: lathe body + real label artwork + two-tier cap ---------- */
function buildJar(THREE, labelTexture) {
  const jar = new THREE.Group();
  const body = new THREE.Group();
  jar.add(body);
  const plastic = new THREE.MeshPhysicalMaterial({ color: 0xf5f7fc, roughness: .3, clearcoat: .6, clearcoatRoughness: .28, side: THREE.DoubleSide });

  const profile = [];
  const point = (x, y) => profile.push(new THREE.Vector2(x, y));
  point(0, .005);
  point(.8, .005);
  for (let i = 0; i <= 10; i += 1) {
    const a = -Math.PI / 2 + (i / 10) * Math.PI / 2;
    point(.86 + .14 * Math.cos(a), .14 + .14 * Math.sin(a));
  }
  point(1, 1.9);
  for (let i = 1; i <= 8; i += 1) { const t = i / 8; point(1 - .07 * t * t, 1.9 + .1 * t); }
  point(.86, 2.04);
  point(.86, 2.3);
  point(.84, 2.33);
  point(.77, 2.33);
  point(.77, 2.05);
  point(0, 2.02);
  body.add(new THREE.Mesh(new THREE.LatheGeometry(profile, 160), plastic));

  const labelHeight = 2 * Math.PI * 1.006 * (39.8 / 150);
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(1.006, 1.006, labelHeight, 220, 1, true, -Math.PI, Math.PI * 2),
    new THREE.MeshPhysicalMaterial({ map: labelTexture, roughness: .38, clearcoat: .7, clearcoatRoughness: .18 }),
  );
  label.position.y = .17 + labelHeight / 2;
  body.add(label);

  const capProfile = [];
  const capPoint = (x, y) => capProfile.push(new THREE.Vector2(x, y));
  capPoint(.87, 0);
  capPoint(.915, 0);
  capPoint(.93, .02);
  capPoint(.93, .24);
  capPoint(.905, .265);
  capPoint(.905, .285);
  capPoint(.918, .3);
  capPoint(.918, .6);
  for (let i = 1; i <= 8; i += 1) { const a = (i / 8) * Math.PI / 2; capPoint(.868 + .05 * Math.cos(a), .6 + .05 * Math.sin(a)); }
  capPoint(.4, .662);
  capPoint(0, .668);
  const cap = new THREE.Mesh(
    new THREE.LatheGeometry(capProfile, 160),
    new THREE.MeshPhysicalMaterial({ color: 0xf8f9fd, roughness: .5, clearcoat: .3, clearcoatRoughness: .5, side: THREE.DoubleSide }),
  );
  cap.position.y = 2.0;
  jar.add(cap);
  return { jar, body, cap };
}

function contactShadow(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(0, 0, 20, .55)');
  gradient.addColorStop(1, 'rgba(0, 0, 20, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false }));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = .002;
  return mesh;
}

// Jar yaw keyframes (in turns of π) — bring each label panel to the front in turn:
// front logo (u .5), usage panel (u .2), gluten/lactose icons (u .86), front again.
const yawKeys = [[0, -.75], [.13, 0], [.2, 0], [.29, .6], [.39, .6], [.48, 1.34], [.59, 1.34], [.7, 2], [1, 2]];
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

  let labelTexture;
  try {
    labelTexture = await new THREE.TextureLoader().loadAsync(asset(tier === 2 && innerWidth > 700 ? 'label-4096.webp' : 'label-2048.webp'));
  } catch {
    renderer.dispose();
    section.classList.add('mg-nogl');
    return;
  }
  labelTexture.colorSpace = THREE.SRGBColorSpace;
  labelTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const { jar, body, cap } = buildJar(THREE, labelTexture);
  const rig = new THREE.Group();
  rig.add(jar, contactShadow(THREE));
  scene.add(rig);

  const geometry = pandaGeometry(THREE);
  const materials = pandaMaterials(THREE, renderer);
  const tablets = Array.from({ length: 14 }, (_, i) => {
    const mesh = new THREE.Mesh(geometry, materials);
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
    const burst = smooth(.79, .97, p);
    const open = smooth(.75, .86, p);

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
    side += ((jarScene.side * (1 - burst * .55)) - side) * (still ? 1 : .05);
    rig.position.x = side * shift;
    rig.position.y = lerp(-.5, 0, enter) + (still ? 0 : Math.sin(time * .9) * .035) - open * .25;
    rig.scale.setScalar(lerp(.9, 1, enter));

    cap.position.set(open * .9, 2.0 + open * 1.55, -open * .2);
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
  const panda = new THREE.Mesh(pandaGeometry(THREE), pandaMaterials(THREE, renderer));
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

if (jarScene) whenNear(jarScene.section, initJar);
if (tasteSection) whenNear(tasteSection, initPanda);
