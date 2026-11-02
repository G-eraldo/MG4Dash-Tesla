(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MG4State = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const unknown = Object.freeze({ connected: false, speedKmh: null, speedRawKmh: null, batteryPercent: null, rangeKm: null,
    consumption: null, powerKw: null, gear: null, onePedal: null, onePedalAvailable: null,
    haOnline: false, mediaAvailable: false });

  function onePedalStatus(state) {
    if (!state || state.onePedal === null || state.onePedal === undefined) return 'État inconnu';
    if (state.onePedal === 1) return 'Actif';
    if (state.onePedalAvailable === false) return 'Indisponible';
    if (state.onePedalAvailable === true) return 'Disponible mais inactif';
    return 'En attente';
  }

  function canUseDomesticControl(state) {
    return !!state && state.haOnline === true && state.speedKmh === 0 && state.gear === 'P' && state.source === 'vehicle';
  }

  function displayValue(value, suffix) {
    return value === null || value === undefined || Number.isNaN(value) ? '—' : String(value).replace('.', ',') + (suffix || '');
  }

  /** Le service amont n'expose pas le rapport P/D : la vitesse ne pilote que la présentation. */
  function nextViewMode(previous, speedKmh, connected, lastMotionAt, now) {
    if (!connected) return { mode: 'parked', lastMotionAt: null };
    if (typeof speedKmh === 'number' && speedKmh > 3) return { mode: 'driving', lastMotionAt: now };
    if (previous === 'driving' && speedKmh === 0 && lastMotionAt !== null && now - lastMotionAt > 120000)
      return { mode: 'parked', lastMotionAt: null };
    return { mode: previous, lastMotionAt };
  }

  return { unknown, onePedalStatus, canUseDomesticControl, displayValue, nextViewMode };
});
