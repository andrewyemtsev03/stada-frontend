// Enterogermina showcase (shared by the 2, 4 and 6 billion pages): the live 3D hero (vials among the pack's
// spore bubbles), the three-stage scroll story (spores fill the vial → between antibiotic doses → shake, open,
// drink), the dosage switch and the instructions tabs. Every word and number on the page comes from the
// product copy; this module only animates what the build rendered. Loaded only on products/enterogermina.html.

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, value) => { const t = clamp((value - a) / (b - a)); return t * t * (3 - 2 * t); };
const span = (a, b, value) => clamp((value - a) / (b - a));
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
const easeOutBack = t => { const c = 1.5; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
// A bump: 0 outside [a, b], 1 in the middle.
const bell = (a, b, value) => Math.sin(Math.PI * span(a, b, value));

const root = document.documentElement;
root.classList.add('eg-ready');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
// Light profile for phones, small machines and data saver: fewer pixels, fewer spores, idle motion at 30 fps.
const coarsePointer = matchMedia('(pointer: coarse)').matches;
const lowEnd = coarsePointer || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4 || Boolean(navigator.connection?.saveData);
const saveData = Boolean(navigator.connection?.saveData);
const QUALITY = { dprCap: coarsePointer ? 1.25 : lowEnd ? 1.5 : 2, pixelBudget: lowEnd ? 1.1e6 : 3e6, spores: lowEnd ? 700 : 1500 };

const PALETTE = {
  blue: 0x1d4fa0, pink: 0xe5007e, sky: 0x5db4e6, teal: 0x25a3c9, mint: 0x3fbf9f, ice: 0xcfeaf8,
  // One colour per strain (SIN, O/C, T, N/R), matching the caption chips.
  strains: [0x3a78d6, 0x22a6c8, 0x35b98f, 0xee5aa0],
};

/* ------------------------------------------------------------------ layout */
const siteNav = document.querySelector('body > nav');
const hero = $('#eg-hero');
const measureNav = () => { if (siteNav) root.style.setProperty('--nav-h', `${Math.round(siteNav.getBoundingClientRect().height)}px`); };
measureNav();

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-in');
    revealObserver.unobserve(entry.target);
  });
}, { rootMargin: '0px 0px -12% 0px' });
$$('.eg-reveal').forEach(node => revealObserver.observe(node));

/* ------------------------------------------------------------------ hero: the bubble loop behind the product */
{
  const group = $('[data-loop-dots]');
  const colors = ['#9fd4f1', '#5db4e6', '#7fd3bd', '#bfe4f7', '#3fbf9f', '#ffffff', '#f6a8cb'];
  $$('.eg-loop__line').forEach((path, line) => {
    const length = path.getTotalLength();
    const count = line ? 14 : 22;
    for (let i = 0; i < count; i += 1) {
      const at = path.getPointAtLength(((i + .5) / count) * length);
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      const seed = Math.sin((i + 1) * (line + 3) * 12.9898) * 43758.5453;
      const r = 5 + (seed - Math.floor(seed)) * (line ? 13 : 19);
      circle.setAttribute('cx', (at.x + Math.sin(i * 1.7) * 18).toFixed(1));
      circle.setAttribute('cy', (at.y + Math.cos(i * 2.3) * 18).toFixed(1));
      circle.setAttribute('r', r.toFixed(1));
      circle.setAttribute('fill', colors[(i + line * 3) % colors.length]);
      circle.setAttribute('opacity', (.45 + (i % 3) * .15).toFixed(2));
      circle.style.animationDelay = `${-(i * .7).toFixed(1)}s`;
      group.append(circle);
    }
  });
}

/* ------------------------------------------------------------------ story scene (captions, stages, HUD) */
const storySection = $('#eg-story');
const STAGES = [
  { id: 'a', from: 0, at: .16 },
  { id: 'b', from: .345, at: .5 },
  { id: 'c', from: .655, at: .86 },
];
const story = storySection && {
  section: storySection,
  caps: $$('.eg-cap', storySection),
  track: $('.eg-track i', storySection),
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

// Writes a style or attribute only when its value changes.
const written = new WeakMap();
function write(node, key, value, attribute = false) {
  let values = written.get(node);
  if (!values) { values = {}; written.set(node, values); }
  if (values[key] === value) return;
  values[key] = value;
  if (attribute) node.setAttribute(key, value); else node.style[key] = value;
}

function updateStory() {
  if (!story) return;
  const rect = story.section.getBoundingClientRect();
  if (rect.bottom < -innerHeight || rect.top > innerHeight * 2) return;
  const p = sectionProgress(story.section);
  story.target = p;
  story.enter = clamp(1 - rect.top / innerHeight);
  story.caps.forEach(cap => {
    const start = Number(cap.dataset.in);
    const end = Number(cap.dataset.out);
    const fade = .035;
    const fadeIn = start <= 0 ? 1 : smooth(start, start + fade, p);
    const fadeOut = end >= 1 ? 1 : 1 - smooth(end - fade, end, p);
    const opacity = fadeIn * fadeOut;
    write(cap, 'opacity', opacity.toFixed(3));
    write(cap, 'transform', `translate3d(0, ${((1 - opacity) * (p < start + fade ? 26 : -18)).toFixed(1)}px, 0)`);
    cap.classList.toggle('is-live', opacity > .5);
  });
  let stage = STAGES[0];
  STAGES.forEach(item => { if (p >= item.from) stage = item; });
  if (stage.id !== story.stage) {
    story.stage = stage.id;
    story.section.dataset.stage = stage.id;
  }
  story.steps.forEach(step => write(step, 'aria-current', String(STAGES[Number(step.dataset.step)].id === stage.id), true));
  if (story.track) write(story.track, 'transform', `scaleX(${p.toFixed(4)})`);
}

if (story) {
  story.steps.forEach(step => step.addEventListener('click', () => {
    const rect = story.section.getBoundingClientRect();
    const top = rect.top + scrollY + (rect.height - innerHeight) * STAGES[Number(step.dataset.step)].at;
    scrollTo({ top, behavior: reduceMotion ? 'instant' : 'smooth' });
  }));
}

/* ------------------------------------------------------------------ nav auto-hide and chapter rail */
const rail = $('.eg-rail');
const railLinks = rail ? $$('a', rail) : [];
const chapters = $$('[data-theme]', $('#eg-top'));
let lastScroll = scrollY;
function updateChrome() {
  const y = scrollY;
  const pastHero = hero.getBoundingClientRect().bottom < innerHeight * .35;
  if (siteNav) {
    if (!pastHero || $('.menu.open') || y < lastScroll - 6) siteNav.classList.remove('eg-nav-off');
    else if (y > lastScroll + 6) siteNav.classList.add('eg-nav-off');
  }
  lastScroll = y;
  const middle = innerHeight / 2;
  let current = null;
  chapters.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= middle && rect.bottom > middle) current = section;
  });
  if (!rail) return;
  rail.classList.toggle('is-on', pastHero && Boolean(current));
  railLinks.forEach(link => write(link, 'aria-current', String(current?.id === link.dataset.go), true));
}

let ticking = false;
function frame() { ticking = false; updateStory(); updateChrome(); }
const requestFrame = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
addEventListener('scroll', requestFrame, { passive: true });
addEventListener('resize', () => { measureNav(); requestFrame(); });
frame();

// Chapter links: straight to the section (sheets overlap the one before by their rounded top).
document.addEventListener('click', event => {
  const link = event.target.closest('a[data-go]');
  if (!link) return;
  const target = document.getElementById(link.dataset.go);
  if (!target) return;
  event.preventDefault();
  const top = target.getBoundingClientRect().top + scrollY + (target.classList.contains('eg-sheet') || target.classList.contains('eg-scene') ? 28 : 0);
  scrollTo({ top, behavior: reduceMotion ? 'instant' : 'smooth' });
  history.replaceState(null, '', `#${target.id}`);
  const heading = $('h2', target);
  if (heading && event.detail === 0) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
});

/* ------------------------------------------------------------------ dosage switch */
const dose = $('[data-dose]');
if (dose) {
  const vials = $('[data-vials]', dose);
  const minNode = $('[data-dose-min]', dose);
  const maxNode = $('[data-dose-max]', dose);
  const doseSwitch = $('.eg-switch', dose);
  const buttons = $$('button[data-who]', doseSwitch);
  const range = who => [Number(vials.dataset[`${who}Min`]), Number(vials.dataset[`${who}Max`])];
  const most = Math.max(range('adult')[1], range('child')[1]);
  for (let i = 0; i < most; i += 1) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 40 120');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#eg-vial');
    svg.append(use);
    svg.style.transitionDelay = `${i * 70}ms`;
    vials.append(svg);
  }
  const apply = who => {
    const [min, max] = range(who);
    dose.dataset.who = who;
    doseSwitch.classList.toggle('is-child', who === 'child');
    buttons.forEach(button => {
      const on = button.dataset.who === who;
      button.setAttribute('aria-checked', String(on));
      button.tabIndex = on ? 0 : -1;
    });
    minNode.textContent = String(min);
    maxNode.textContent = String(max);
    [...vials.children].forEach((svg, index) => {
      svg.classList.toggle('is-off', index >= max);
      svg.classList.toggle('is-max', index >= min && index < max);
    });
  };
  buttons.forEach(button => button.addEventListener('click', () => apply(button.dataset.who)));
  doseSwitch.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const next = dose.dataset.who === 'adult' ? 'child' : 'adult';
    apply(next);
    buttons.find(button => button.dataset.who === next).focus();
  });
  apply('adult');
}

/* ------------------------------------------------------------------ instructions tabs */
const tabList = $('.eg-tabs__list');
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
    const next = { ArrowRight: tabs[(index + 1) % tabs.length], ArrowLeft: tabs[(index - 1 + tabs.length) % tabs.length], Home: tabs[0], End: tabs[tabs.length - 1] }[event.key];
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
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !coarsePointer, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return null;
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const gl = renderer.getContext();
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const name = String((info && gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) || gl.getParameter(gl.RENDERER) || '');
  // Software rasterisers get fewer pixels and frames only when something changes.
  renderer.userData = { lite: /swiftshader|llvmpipe|softpipe|software|basic render/i.test(name) };
  return renderer;
}

function pixelRatioFor(renderer, width, height) {
  if (renderer.userData.lite) return .75;
  const byBudget = Math.sqrt(QUALITY.pixelBudget / Math.max(1, width * height));
  return Math.max(.6, Math.min(devicePixelRatio || 1, QUALITY.dprCap, byBudget));
}

function keepSized(renderer, camera, canvas, onResize) {
  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setPixelRatio(pixelRatioFor(renderer, width, height));
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

function addEnvironment(THREE, RoomEnvironment, renderer, scene) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), .04).texture;
  pmrem.dispose();
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(3, 6, 6);
  const rim = new THREE.DirectionalLight(0xa9d8ff, 1.3);
  rim.position.set(-5, 2, -4);
  const blush = new THREE.DirectionalLight(0xffd3e6, .5);
  blush.position.set(4, -2, 3);
  scene.add(key, rim, blush, new THREE.AmbientLight(0xffffff, .3));
}

// Glossy plastic: physical clearcoat where the machine can afford it, a standard material otherwise.
function glossy(THREE, params) {
  if (!lowEnd) return new THREE.MeshPhysicalMaterial(params);
  const { clearcoat = 0, clearcoatRoughness = 0, sheen, sheenColor, sheenRoughness, ...rest } = params;
  if (clearcoat) rest.roughness = lerp(rest.roughness ?? 1, clearcoatRoughness, clearcoat * .55);
  return new THREE.MeshStandardMaterial(rest);
}

/* ---------- the 5 ml vial: vial.glb (the supplied model, geometry only) ---------- */
// The model is scaled to 2.6 tall with its base at y = 0, then split in two: the body and the flat twist-off
// top, which breaks off just above the bulb (82% of the height) and can turn and lift away (`parts.tab`).
// Materials, the suspension inside and the printed label are added here. vial-lite.glb (a third of the
// triangles) is used on the light profile.
const VIAL_HEIGHT = 2.6;
const VIAL_SPLIT = .816;
const VIAL_MOUTH = VIAL_HEIGHT * VIAL_SPLIT;
let VIAL_RADIUS = .28;
const modelUrl = name => new URL(`/assets/georgia-products/enterogermina/${name}`, location.href).href;
let vialModelPromise;
function loadVialModel(THREE) {
  return vialModelPromise ||= Promise.all([
    import('../vendor/three/GLTFLoader.js').then(({ GLTFLoader }) => new GLTFLoader().loadAsync(modelUrl(lowEnd ? 'vial-lite.glb' : 'vial.glb'))),
    document.fonts?.load('700 120px "Noto Sans"').catch(() => {}),
  ]).then(([gltf]) => {
    gltf.scene.updateMatrixWorld(true);
    let source;
    gltf.scene.traverse(node => { if (node.isMesh && !source) source = node; });
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const scale = VIAL_HEIGHT / (box.max.y - box.min.y);
    VIAL_RADIUS = ((box.max.z - box.min.z) / 2) * scale;
    // Split the triangles at the break line, in the mesh's own (possibly quantised) coordinates.
    const geometry = source.geometry;
    geometry.computeBoundingBox();
    const local = geometry.boundingBox;
    const splitY = local.min.y + (local.max.y - local.min.y) * VIAL_SPLIT;
    const position = geometry.attributes.position;
    const index = geometry.index ? geometry.index.array : Array.from({ length: position.count }, (_, i) => i);
    const lower = [];
    const upper = [];
    for (let i = 0; i < index.length; i += 3) {
      const a = index[i]; const b = index[i + 1]; const c = index[i + 2];
      ((position.getY(a) + position.getY(b) + position.getY(c)) / 3 > splitY ? upper : lower).push(a, b, c);
    }
    const part = list => {
      const piece = new THREE.BufferGeometry();
      for (const [name, attribute] of Object.entries(geometry.attributes)) piece.setAttribute(name, attribute);
      piece.setIndex(list);
      return piece;
    };
    return {
      body: part(lower), top: part(upper), node: source.matrixWorld.clone(),
      scale, offset: new THREE.Vector3(-(box.min.x + box.max.x) / 2 * scale, -box.min.y * scale, -(box.min.z + box.max.z) / 2 * scale),
    };
  });
}

// The label, as on the real vial: white, with the name running up it in the pack's blue.
let labelTexture;
function vialLabel(THREE) {
  if (labelTexture) return labelTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 384; canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 384, 1024);
  ctx.save();
  ctx.translate(200, 512);
  ctx.rotate(-Math.PI / 2);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  let size = 150;
  ctx.font = `700 ${size}px "Noto Sans", Arial, sans-serif`;
  size = Math.min(150, size * (860 / ctx.measureText('Enterogermina').width));
  ctx.font = `700 ${size}px "Noto Sans", Arial, sans-serif`;
  ctx.fillStyle = '#163f99';
  ctx.fillText('Enterogermina', -size * .12, 0);
  const end = ctx.measureText('Enterogermina').width / 2 - size * .12;
  ctx.font = `600 ${size * .3}px "Noto Sans", Arial, sans-serif`;
  ctx.fillText('®', end + size * .2, -size * .36);
  ctx.restore();
  labelTexture = new THREE.CanvasTexture(canvas);
  labelTexture.colorSpace = THREE.SRGBColorSpace;
  labelTexture.anisotropy = 8;
  return labelTexture;
}

// `frosted`: the hero's see-through plastic (transmission where affordable); otherwise a plain material whose
// opacity the story animates.
function makeVial(THREE, model, { frosted = false } = {}) {
  const group = new THREE.Group();
  const plastic = frosted && !lowEnd
    ? new THREE.MeshPhysicalMaterial({
      color: 0xe6eef7, roughness: .4, metalness: 0, transmission: .62, thickness: .45, ior: 1.46,
      attenuationColor: new THREE.Color(0xd9e9f6), attenuationDistance: 1.4, clearcoat: .45, clearcoatRoughness: .28,
    })
    : glossy(THREE, { color: 0xe3ecf5, roughness: .38, metalness: 0, clearcoat: .5, clearcoatRoughness: .25, transparent: !frosted, opacity: 1 });
  const placed = (geometry, parent, lift = 0) => {
    const holder = new THREE.Group();
    holder.scale.setScalar(model.scale);
    holder.position.copy(model.offset).y -= lift;
    const mesh = new THREE.Mesh(geometry, plastic);
    mesh.applyMatrix4(model.node);
    holder.add(mesh);
    parent.add(holder);
    return mesh;
  };
  const body = placed(model.body, group);
  // The twist-off top turns about the vial's axis at the break line.
  const tab = new THREE.Group();
  tab.position.y = VIAL_MOUTH;
  placed(model.top, tab, VIAL_MOUTH);
  const R = VIAL_RADIUS;
  // The suspension inside: milky, seen through the plastic.
  const fill = new THREE.Mesh(
    new THREE.CylinderGeometry(R * .86, R * .86, 1.5, lowEnd ? 28 : 44),
    new THREE.MeshStandardMaterial({ color: 0xf2efe7, roughness: .7, transparent: !frosted, opacity: frosted ? 1 : .35, depthWrite: frosted }),
  );
  fill.position.y = .82;
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(R * 1.012, R * 1.012, 1.18, lowEnd ? 24 : 40, 1, true, -.82, 1.64),
    new THREE.MeshStandardMaterial({ map: vialLabel(THREE), roughness: .6, metalness: 0, envMapIntensity: .55, transparent: !frosted, opacity: 1 }),
  );
  label.position.y = .9;
  group.add(fill, label, tab);
  group.userData.parts = { body, tab, fill, label, plastic };
  return group;
}

// Rod-shaped spores, one instanced mesh, each instance tinted by its strain.
function makeSpores(THREE, count) {
  const geometry = new THREE.CapsuleGeometry(.026, .07, 3, lowEnd ? 6 : 8);
  const material = new THREE.MeshStandardMaterial({ roughness: .35, metalness: 0, emissive: 0xffffff, emissiveIntensity: .08 });
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  const color = new THREE.Color();
  for (let i = 0; i < count; i += 1) mesh.setColorAt(i, color.setHex(PALETTE.strains[i % 4]));
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  return mesh;
}

function rand(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

/* ------------------------------------------------------------------ hero still life */
const heroVisual = $('[data-hero-visual]');
const heroCanvas = $('[data-hero-canvas]');

async function initHero() {
  if (!heroCanvas || saveData) return;
  const { THREE, RoomEnvironment } = await loadThree();
  const renderer = createRenderer(THREE, heroCanvas);
  if (!renderer) return;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, .1, 60);
  addEnvironment(THREE, RoomEnvironment, renderer, scene);

  const still = reduceMotion || renderer.userData.lite;
  const model = await loadVialModel(THREE);
  const main = makeVial(THREE, model, { frosted: true });
  const back = makeVial(THREE, model, { frosted: true });
  const side = makeVial(THREE, model, { frosted: true });
  const stage = new THREE.Group();
  stage.add(main, back, side);
  scene.add(stage);
  const vials = [
    { group: main, x: .1, y: -.05, z: 0, scale: 1, rz: .13, ry: .35, delay: 0 },
    { group: back, x: -1.25, y: .35, z: -1.4, scale: .78, rz: -.22, ry: -.5, delay: .12 },
    { group: side, x: 1.35, y: -.25, z: -.9, scale: .68, rz: .36, ry: .9, delay: .22 },
  ];

  // Spore bubbles, the pack's motif: glossy spheres in the pack colours, strung round the vials.
  const bubbleColors = [PALETTE.sky, PALETTE.teal, PALETTE.mint, PALETTE.ice, 0x9fd4f1, 0x7fd3bd, 0xf49ac1];
  const bubbleCount = lowEnd ? 22 : 34;
  const bubbles = new THREE.InstancedMesh(
    new THREE.SphereGeometry(1, lowEnd ? 20 : 32, lowEnd ? 14 : 24),
    glossy(THREE, { roughness: .25, clearcoat: 1, clearcoatRoughness: .08, transparent: true, opacity: .9 }),
    bubbleCount,
  );
  const random = rand(7);
  const bubbleData = [];
  const color = new THREE.Color();
  for (let i = 0; i < bubbleCount; i += 1) {
    const angle = (i / bubbleCount) * Math.PI * 2;
    const radius = 2.05 + random() * 1.05;
    bubbleData.push({
      x: Math.cos(angle) * radius * 1.15, y: 1.25 + Math.sin(angle * 2) * .55 + (random() - .5) * 1.6,
      z: Math.sin(angle) * radius * .6 - .4, size: .05 + Math.pow(random(), 2.2) * .2, phase: random() * 6.28, delay: .2 + random() * .5,
    });
    bubbles.setColorAt(i, color.setHex(bubbleColors[i % bubbleColors.length]));
  }
  stage.add(bubbles);

  const fit = (width, height) => {
    // Frame the vials' middle; narrow screens pull back a little so the side vials stay in view.
    const narrow = width / height < .95;
    camera.position.set(0, 1.55, narrow ? 13.4 : 11.6);
    camera.lookAt(0, 1.2, 0);
  };
  keepSized(renderer, camera, heroCanvas, fit);

  const lean = { x: 0, y: 0, tx: 0, ty: 0, on: finePointer && !still };
  if (lean.on) {
    addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      const area = heroVisual.getBoundingClientRect();
      lean.tx = clamp((event.clientX - (area.left + area.width / 2)) / (innerWidth / 2), -1, 1);
      lean.ty = clamp((event.clientY - (area.top + area.height / 2)) / (innerHeight / 2), -1, 1);
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', () => { lean.tx = 0; lean.ty = 0; });
  }

  const dummy = new THREE.Object3D();
  const clock = new THREE.Clock();
  let startedAt = 0;
  let shown = false;
  let frames = 0;
  let lastKey = '';
  const tick = () => {
    if (storySection && storySection.getBoundingClientRect().top < innerHeight * .45) return;
    const dt = Math.min(.05, clock.getDelta());
    if (!startedAt) startedAt = performance.now();
    const intro = still ? 1 : clamp((performance.now() - startedAt) / 1500);
    const time = still ? 0 : clock.elapsedTime;
    frames += 1;
    if (lowEnd && intro >= 1 && frames % 2) return;
    if (still) {
      const key = `${heroCanvas.width}x${heroCanvas.height}`;
      if (key === lastKey && shown) return;
      lastKey = key;
    }
    if (lean.on) {
      const ease = 1 - Math.pow(.02, dt);
      lean.x += (lean.tx - lean.x) * ease;
      lean.y += (lean.ty - lean.y) * ease;
    }
    vials.forEach((item, index) => {
      const local = clamp((intro - item.delay) / (1 - item.delay));
      const k = still ? 1 : easeOutBack(local);
      const settle = still ? 1 : easeOutCubic(local);
      const { group } = item;
      group.position.set(item.x, item.y + lerp(-1.6, 0, k) + Math.sin(time * .9 + index * 1.7) * .06, item.z);
      group.scale.setScalar(item.scale * lerp(.9, 1, settle));
      group.rotation.set(
        Math.sin(time * .5 + index) * .03,
        item.ry + Math.sin(time * .32 + index * 2) * .18 + (index === 0 ? lean.x * .07 : 0),
        item.rz + Math.sin(time * .6 + index) * .025,
      );
      if (index === 0) group.rotation.x += lean.y * .035;
    });
    bubbleData.forEach((bubble, i) => {
      const local = still ? 1 : easeOutBack(clamp((intro - bubble.delay) / (1 - bubble.delay)));
      dummy.position.set(bubble.x + Math.sin(time * .35 + bubble.phase) * .08, bubble.y + Math.sin(time * .6 + bubble.phase) * .12, bubble.z);
      dummy.scale.setScalar(Math.max(.0001, bubble.size * local));
      dummy.updateMatrix();
      bubbles.setMatrixAt(i, dummy.matrix);
    });
    bubbles.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
    if (!shown) { shown = true; heroVisual.classList.add('eg-hero--live'); }
  };
  renderer.compile(scene, camera);
  runWhileVisible(hero, renderer, tick);
}

/* ------------------------------------------------------------------ the story scene */
async function initStory() {
  const canvas = $('[data-story-canvas]');
  if (!canvas || !story) return;
  const { THREE, RoomEnvironment } = await loadThree();
  const renderer = createRenderer(THREE, canvas);
  if (!renderer) { storySection.classList.add('eg-nogl'); return; }
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 80);
  camera.position.set(0, 1.4, 11);
  camera.lookAt(0, 1.15, 0);
  addEnvironment(THREE, RoomEnvironment, renderer, scene);
  const still = reduceMotion || renderer.userData.lite;

  const world = new THREE.Group();
  scene.add(world);
  const model = await loadVialModel(THREE);
  const vial = makeVial(THREE, model);
  const { tab, fill, label, plastic } = vial.userData.parts;
  world.add(vial);

  // A: the spores. Each has a place in the cloud and a place inside the vial.
  const count = QUALITY.spores;
  const spores = makeSpores(THREE, count);
  world.add(spores);
  const random = rand(11);
  const cloud = [];
  const inside = [];
  const spin = [];
  for (let i = 0; i < count; i += 1) {
    const angle = random() * Math.PI * 2;
    const radius = 1 + Math.pow(random(), .7) * 1.9;
    cloud.push(new THREE.Vector3(Math.cos(angle) * radius, 1.25 + (random() - .5) * 2.6 * (1 - radius / 5), Math.sin(angle) * radius * .7));
    const a2 = random() * Math.PI * 2;
    const r2 = Math.sqrt(random()) * (VIAL_RADIUS - .07);
    inside.push(new THREE.Vector3(Math.cos(a2) * r2, .18 + random() * 1.38, Math.sin(a2) * r2));
    spin.push([random() * 6.28, random() * 6.28, .3 + random() * .8, (random() - .5) * 1.4]);
  }

  // B: an antibiotic course: two-tone capsules circling the vial on a faint ring.
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.75, .006, 8, 160), new THREE.MeshBasicMaterial({ color: 0x1d4fa0, transparent: true, opacity: 0 }));
  ring.rotation.x = Math.PI / 2 - .32;
  ring.position.y = 1.2;
  world.add(ring);
  const capsuleGeometry = new THREE.CapsuleGeometry(.1, .24, 6, 16);
  {
    const position = capsuleGeometry.attributes.position;
    const colors = new Float32Array(position.count * 3);
    const a = new THREE.Color(0xffffff);
    const b = new THREE.Color(0x5f8fd6);
    for (let i = 0; i < position.count; i += 1) (position.getY(i) > 0 ? a : b).toArray(colors, i * 3);
    capsuleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  }
  const capsuleMaterial = glossy(THREE, { vertexColors: true, roughness: .3, clearcoat: .8, clearcoatRoughness: .1 });
  const capsules = [];
  for (let i = 0; i < 6; i += 1) {
    const mesh = new THREE.Mesh(capsuleGeometry, capsuleMaterial);
    world.add(mesh);
    capsules.push({ mesh, angle: (i / 6) * Math.PI * 2 });
  }

  // C: a glass, a stream and the liquid rising in the glass.
  const glass = new THREE.Group();
  const glassMaterial = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .05, metalness: 0, transparent: true, opacity: .26, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false });
  const GLASS_H = 1.15;
  const glassProfile = [[0, 0], [.46, 0], [.49, .04], [.55, GLASS_H], [.565, GLASS_H + .015]].map(([x, y]) => new THREE.Vector2(x, y));
  const cup = new THREE.Mesh(new THREE.LatheGeometry(glassProfile, 48), glassMaterial);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(.56, .011, 8, 64), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .1, transparent: true, opacity: .6 }));
  rim.rotation.x = Math.PI / 2;
  rim.position.y = GLASS_H + .015;
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(.52, .46, 1, 48), new THREE.MeshStandardMaterial({ color: 0xe2f1fb, roughness: .2, transparent: true, opacity: .85 }));
  glass.add(cup, rim, liquid);
  world.add(glass);
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(.035, .05, 1, 12), new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: .3, transparent: true, opacity: .9 }));
  world.add(stream);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(1, 48),
    new THREE.MeshBasicMaterial({ color: 0x1d4fa0, transparent: true, opacity: .1, depthWrite: false }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.scale.set(1.3, .45, 1);
  world.add(ground);

  let shift = { x: 1.6, y: 0, scale: 1 };
  keepSized(renderer, camera, canvas, (width, height) => {
    // Desktop: the scene sits to the right of the caption. Phones: below it, a little smaller.
    const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const visibleWidth = visibleHeight * camera.aspect;
    if (width <= 900) shift = { x: 0, y: -visibleHeight * .17, scale: clamp(visibleWidth / 7.2, .62, .9) };
    else shift = { x: visibleWidth * .19, y: 0, scale: 1 };
  });

  const dummy = new THREE.Object3D();
  const clock = new THREE.Clock();
  const state = { p: story.target, enter: story.enter };
  const tip = new THREE.Vector3();
  const POUR_X = .95 - VIAL_MOUTH * Math.sin(2.05);
  const POUR_Y = 1.5 - VIAL_MOUTH * Math.cos(2.05);
  const direction = new THREE.Vector3();
  const UP = new THREE.Vector3(0, 1, 0);
  const capsuleAxis = new THREE.Vector3(1, 0, 0);
  const local = new THREE.Vector3();
  let lastKey = '';
  const tick = () => {
    const dt = Math.min(.05, clock.getDelta());
    const time = still ? 0 : clock.elapsedTime;
    state.p += (story.target - state.p) * (still ? 1 : .1);
    state.enter += (story.enter - state.enter) * (still ? 1 : .1);
    const p = state.p;
    if (still) {
      const key = `${p.toFixed(4)}|${state.enter.toFixed(3)}|${canvas.width}x${canvas.height}`;
      if (key === lastKey) return;
      lastKey = key;
    }

    world.position.set(shift.x, shift.y, 0);
    world.scale.setScalar(shift.scale);

    /* ---- A: the cloud of spores gathers into the vial ---- */
    const gather = easeOutCubic(span(.1, .3, p));
    const sporesOn = 1 - span(.33, .37, p);
    // The plastic is see-through while the spores pour in, then closes over them.
    const see = 1 - smooth(.27, .34, p);
    plastic.opacity = lerp(.96, .28, see);
    plastic.depthWrite = see < .05;
    fill.material.opacity = .55 * (1 - see);
    label.material.opacity = lerp(1, .35, see);
    const swirl = time * .18 + p * 4;
    for (let i = 0; i < count; i += 1) {
      const [rx, ry, speed, drift] = spin[i];
      const from = cloud[i];
      const to = inside[i];
      const angle = swirl * (1 - gather) * speed + drift * (1 - gather);
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const cx = from.x * cos - from.z * sin;
      const cz = from.x * sin + from.z * cos;
      // Each spore streams to a point above the open neck, then drops into its place inside; they go in turn.
      const t = clamp(gather * 1.4 - ((i * 7) % 23) / 23 * .4);
      const toNeck = smooth(0, 1, t / .62);
      const drop = clamp((t - .62) / .38);
      const nx = to.x * .25;
      const nz = to.z * .25;
      const ny = VIAL_MOUTH + .45 + (to.y / 1.6) * .5;
      dummy.position.set(
        lerp(lerp(cx, nx, toNeck), to.x, drop),
        lerp(lerp(from.y, ny, toNeck), to.y, drop * drop),
        lerp(lerp(cz, nz, toNeck), to.z, drop),
      );
      dummy.rotation.set(rx + time * speed, ry + time * .7, 0);
      const s = Math.max(.0001, sporesOn * lerp(1, .6, drop) * clamp(state.enter * 1.4));
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      spores.setMatrixAt(i, dummy.matrix);
    }
    spores.instanceMatrix.needsUpdate = true;
    spores.visible = sporesOn > .001;

    /* ---- B: the vial between antibiotic doses ---- */
    const bIn = smooth(.34, .42, p);
    const bOut = 1 - smooth(.6, .67, p);
    const b = bIn * bOut;
    ring.material.opacity = .22 * b;
    capsules.forEach((capsule, i) => {
      const angle = capsule.angle + time * .35 + p * 3;
      const radius = lerp(4.6, 1.75, bIn) + (1 - bOut) * 3;
      local.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius).applyAxisAngle(capsuleAxis, .32);
      capsule.mesh.position.set(local.x, 1.2 + local.y, local.z);
      capsule.mesh.rotation.set(time * .6 + i, angle, Math.PI / 2.4);
      capsule.mesh.scale.setScalar(Math.max(.0001, b));
      capsule.mesh.visible = b > .001;
    });

    /* ---- C: shake, open, drink ---- */
    const shake = bell(.69, .76, p);
    const twist = span(.765, .83, p);
    const pour = span(.84, .97, p);
    const glassIn = smooth(.66, .73, p);
    // Upright in A and B; in C it steps left to make room for the glass, then rises and tips over it so its
    // mouth sits just above the middle of the glass (.95, 1.5) at a tilt of 2.05 rad.
    const tilt = easeOutCubic(span(.835, .885, p));
    const baseX = lerp(0, -.75, glassIn);
    const intro = easeOutCubic(clamp(state.enter * 1.2));
    vial.position.set(lerp(baseX, POUR_X, tilt), lerp(lerp(-1.2, 0, intro) + Math.sin(time * .9) * .04 * (1 - glassIn), POUR_Y, tilt), 0);
    vial.rotation.set(0, lerp(.35 + Math.sin(time * .3) * .15 * (1 - glassIn) + p * .8, 0, tilt), -tilt * 2.05 + (still ? 0 : Math.sin(time * 38) * .16 * shake));
    tab.rotation.y = twist * Math.PI * 2.5;
    tab.position.set(twist > .55 ? (twist - .55) * 1.4 : 0, VIAL_MOUTH + Math.max(0, twist - .4) * 1.6, 0);
    tab.scale.setScalar(Math.max(.0001, 1 - span(.8, .84, p)));
    tab.visible = p < .84;

    glass.position.set(.95, 0, 0);
    glass.scale.setScalar(Math.max(.0001, glassIn));
    glass.visible = glassIn > .001;
    const level = .06 + pour * .42;
    liquid.scale.set(1, level, 1);
    liquid.position.y = .04 + level / 2;
    liquid.visible = pour > .001;

    // The stream runs from the vial's mouth to the liquid in the glass while it pours.
    const pouring = smooth(.885, .9, p) * (1 - smooth(.95, .975, p));
    vial.updateMatrixWorld();
    tip.set(0, VIAL_MOUTH, 0).applyMatrix4(vial.matrixWorld);
    world.worldToLocal(tip);
    const surface = new THREE.Vector3(.95, .04 + level, 0);
    stream.visible = pouring > .02;
    if (stream.visible) {
      const length = Math.max(.01, tip.distanceTo(surface));
      stream.position.copy(tip).add(surface).multiplyScalar(.5);
      stream.scale.set(pouring, length, pouring);
      stream.quaternion.setFromUnitVectors(UP, direction.subVectors(surface, tip).normalize());
    }

    ground.position.set(vial.position.x * .6 + glassIn * .5, .005, 0);
    ground.material.opacity = .1 * intro;
    renderer.render(scene, camera);
  };
  renderer.compile(scene, camera);
  runWhileVisible(storySection, renderer, tick);
}

if (heroCanvas) initHero().catch(() => {});
if (storySection) whenNear(storySection, () => initStory().catch(() => storySection.classList.add('eg-nogl')));
