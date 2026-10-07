const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function globe(mobile) {
  const context = vm.createContext({
    window: { matchMedia: () => ({ matches: mobile }) },
    document: { documentElement: { lang: 'en' } },
    normalizeSiteLanguage: lang => lang,
  });
  const source = fs.readFileSync(path.join(__dirname, '../frontend/js/worldwide/globe-map.js'), 'utf8')
    .replace(/^import .*;\r?\n/gm, '').replace('export class GlobeMap', 'class GlobeMap');
  vm.runInContext(source + '\nthis.GlobeMap = GlobeMap;', context);
  const canvas = { style: {} };
  return new context.GlobeMap({ querySelector: () => canvas, querySelectorAll: () => [] }, []);
}

test('finger swipes and mobile pointers never rotate the globe', () => {
  for (const [mobile, pointerType] of [[true, 'touch'], [true, 'mouse'], [false, 'touch']]) {
    const map = globe(mobile);
    map.handlePointerDown({ pointerType, clientX: 10, clientY: 20 });
    map.handlePointerMove({ clientX: 150, clientY: 80 });
    map.handlePointerUp();
    assert.equal(map.isDragging, false);
    assert.equal(map.pointerStart, null);
    assert.equal(map.currentPhi, 0);
    assert.equal(map.velocity.phi, 0);
  }
});

test('desktop mouse dragging still rotates the globe', () => {
  const map = globe(false);
  map.handlePointerDown({ pointerType: 'mouse', clientX: 10, clientY: 20 });
  assert.equal(map.isDragging, true);
  map.handlePointerMove({ clientX: 140, clientY: 20 });
  map.handlePointerUp();
  assert.equal(map.currentPhi, 0.5);
  assert.equal(map.isDragging, false);
});

test('country selection still focuses the globe on mobile', () => {
  const map = globe(true);
  map.countries = [{ id: 'uzbekistan', lat: 41, lng: 64 }];
  let selected;
  map.onSelect = country => { selected = country.id; };
  map.focusCountry('uzbekistan', { immediate: true });
  assert.equal(selected, 'uzbekistan');
  assert.equal(map.selectedId, 'uzbekistan');
  assert.notEqual(map.currentPhi, 0);
});
