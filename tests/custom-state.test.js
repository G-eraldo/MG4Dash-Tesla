const test = require('node:test');
const assert = require('node:assert/strict');
const { unknown, onePedalStatus, canUseDomesticControl, displayValue } = require('../app/src/main/assets/mg4custom/state.js');
const { create } = require('../app/src/main/assets/mg4custom/preferences.js');

test('One Pedal unavailable never implies a command', () => {
  assert.equal(onePedalStatus({ onePedal: 0, onePedalAvailable: false }), 'Indisponible');
  assert.equal(onePedalStatus({ onePedal: 0, onePedalAvailable: true }), 'Disponible mais inactif');
  assert.equal(onePedalStatus({ onePedal: 1, onePedalAvailable: true }), 'Actif');
  assert.equal(onePedalStatus(unknown), 'État inconnu');
});

test('domestic controls fail closed with demo or uncertain vehicle state', () => {
  assert.equal(canUseDomesticControl(unknown), false);
  assert.equal(canUseDomesticControl({ source: 'vehicle', haOnline: true, speedKmh: null, gear: 'P' }), false);
  assert.equal(canUseDomesticControl({ source: 'vehicle', haOnline: true, speedKmh: 62, gear: 'D' }), false);
  assert.equal(canUseDomesticControl({ source: 'vehicle', haOnline: true, speedKmh: 0, gear: 'P' }), true);
});

test('missing data remains visibly absent', () => {
  assert.equal(displayValue(null, ' km/h'), '—');
  assert.equal(displayValue(20.4, ' kWh/100 km'), '20,4 kWh/100 km');
});

test('One Pedal preference survives a new store instance', () => {
  const data = new Map();
  const storage = { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value) };
  create(null, storage).set(true);
  assert.equal(create(null, storage).get(), true);
  create(null, storage).set(false);
  assert.equal(create(null, storage).get(), false);
});
