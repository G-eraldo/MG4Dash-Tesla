(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const store = MG4PreferenceStore.create(window.MG4Preferences, window.localStorage);
  let viewMode = 'driving';
  let liveState = null;
  function render() {
    const state = liveState || MG4State.unknown;
    const parked = viewMode === 'parked';
    $('driveButton').classList.toggle('active', !parked);
    $('parkButton').classList.toggle('active', parked);
    const vehicleSource = liveState && liveState.source === 'vehicle';
    $('stageMode').textContent = (parked ? 'VUE STATIONNEMENT' : 'VUE CONDUITE') + (vehicleSource ? ' · DONNÉES MG4DASH' : ' · EN ATTENTE');
    $('stageTitle').textContent = parked ? 'Tout à portée de main' : 'Votre trajet, en un regard';
    $('speed').textContent = MG4State.displayValue(state.speedKmh);
    $('gear').textContent = state.gear || '—';
    $('battery').textContent = MG4State.displayValue(state.batteryPercent);
    $('range').textContent = MG4State.displayValue(state.rangeKm, ' km');
    $('consumption').textContent = MG4State.displayValue(state.consumption, ' kWh/100 km');
    $('power').textContent = MG4State.displayValue(state.powerKw, ' kW');
    $('onePedalStatus').textContent = MG4State.onePedalStatus(state);
    $('sourceLabel').textContent = vehicleSource ? (state.connected ? 'Source : MG4Dash · R45 non validé' : 'Véhicule déconnecté · données indisponibles') : (liveState ? 'Source : émulateur MG4Dash' : 'Données en attente');
    $('mediaTitle').textContent = state.mediaAvailable ? (state.mediaTitle || 'Média') : 'Média';
    $('mediaArtist').textContent = state.mediaAvailable ? (state.mediaArtist || 'Source active') : 'Aucune source';
    $('onePedalPreference').parentElement.classList.toggle('preferred', store.get());
  }
  window.MG4Live = { setState(state) {
    liveState = state;
    document.querySelector('.demo').textContent = state.source === 'vehicle' ? 'LECTURE BÊTA' : 'ÉMULATEUR';
    render();
  } };
  function openDrawer() { $('drawer').classList.remove('hidden'); }
  function closeDrawer() { $('drawer').classList.add('hidden'); }
  $('driveButton').addEventListener('click', () => { viewMode = 'driving'; render(); });
  $('parkButton').addEventListener('click', () => { viewMode = 'parked'; render(); });
  $('settingsButton').addEventListener('click', () => {
    if (window.MG4Preferences && typeof window.MG4Preferences.openSettings === 'function') window.MG4Preferences.openSettings();
    else openDrawer();
  });
  $('infoButton').addEventListener('click', openDrawer);
  $('closeDrawer').addEventListener('click', closeDrawer);
  $('drawer').addEventListener('click', e => { if (e.target === $('drawer')) closeDrawer(); });
  $('onePedalPreference').checked = store.get();
  $('onePedalPreference').addEventListener('change', e => store.set(e.target.checked));
  document.querySelectorAll('[data-page]').forEach(button => button.addEventListener('click', () => {
    if (window.MG4Preferences && typeof window.MG4Preferences.open === 'function') window.MG4Preferences.open(button.dataset.page);
  }));
  document.querySelectorAll('[data-media]').forEach(button => button.addEventListener('click', () => {
    if (window.MG4Preferences && typeof window.MG4Preferences.media === 'function') window.MG4Preferences.media(button.dataset.media);
  }));
  function tick() {
    const now = new Date();
    $('clock').textContent = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    $('date').textContent = now.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  }
  tick(); setInterval(tick, 30000); render();
})();
