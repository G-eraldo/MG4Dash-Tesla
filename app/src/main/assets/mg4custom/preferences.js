(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MG4PreferenceStore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function create(bridge, storage) {
    return {
      get() {
        if (bridge && typeof bridge.getOnePedalPreferred === 'function') {
          try { return !!bridge.getOnePedalPreferred(); } catch (_) {}
        }
        try { return storage.getItem('onePedalPreferred') === 'true'; } catch (_) { return false; }
      },
      set(value) {
        if (bridge && typeof bridge.setOnePedalPreferred === 'function') {
          try { bridge.setOnePedalPreferred(!!value); return; } catch (_) {}
        }
        try { storage.setItem('onePedalPreferred', String(!!value)); } catch (_) {}
      }
    };
  }
  return { create };
});
