(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MG4State = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const unknown = Object.freeze({ speedKmh: null, batteryPercent: null, rangeKm: null,
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

  return { unknown, onePedalStatus, canUseDomesticControl, displayValue };
});
