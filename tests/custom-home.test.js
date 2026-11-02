const test = require('node:test');
const assert = require('node:assert/strict');
const { nextViewMode } = require('../app/src/main/assets/mg4custom/state.js');

test('the home opens parked and changes to driving only after real motion', () => {
  assert.deepEqual(nextViewMode('parked', 0, true, null, 1000), { mode: 'parked', lastMotionAt: null });
  assert.deepEqual(nextViewMode('parked', 3, true, null, 1000), { mode: 'parked', lastMotionAt: null });
  assert.deepEqual(nextViewMode('parked', 4, true, null, 1000), { mode: 'driving', lastMotionAt: 1000 });
});

test('a short traffic stop keeps the driving layout, then a long stop returns parked', () => {
  assert.deepEqual(nextViewMode('driving', 0, true, 1000, 120000), { mode: 'driving', lastMotionAt: 1000 });
  assert.deepEqual(nextViewMode('driving', 0, true, 1000, 121001), { mode: 'parked', lastMotionAt: null });
});

test('disconnecting the vehicle resets the visual state without inventing a gear', () => {
  assert.deepEqual(nextViewMode('driving', null, false, 1000, 1100), { mode: 'parked', lastMotionAt: null });
  assert.deepEqual(nextViewMode('driving', null, true, 1000, 1100), { mode: 'driving', lastMotionAt: 1000 });
});
