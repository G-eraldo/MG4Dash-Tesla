(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const bridge = window.MG4Preferences;
  let live = null;
  let mode = 'parked';
  let lastMotionAt = null;
  let shortcutsKey = '';
  let shortcutPage = 0;
  let editingShortcuts = false;
  const periodNames = ['Depuis la recharge', 'Trajet en cours', '12 derniers mois'];

  function label(value, suffix, digits) {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) return '—';
    return Number(value).toLocaleString('fr-FR', { maximumFractionDigits: digits === undefined ? 0 : digits, minimumFractionDigits: digits || 0 }) + (suffix || '');
  }
  function navDistance(meters, unit) {
    if (meters === null || meters === undefined || !Number.isFinite(Number(meters))) return null;
    const value = Number(meters);
    if (unit === 'mi') return value >= 161 ? label(value / 1609.344, ' mi', 1) : label(value * 1.09361, ' yd');
    return value >= 1000 ? label(value / 1000, ' km', 1) : label(value, ' m');
  }
  function setText(ids, value) { ids.forEach(id => { $(id).textContent = value; }); }
  function setActive(action, active) {
    document.querySelectorAll('[data-climate="' + action + '"]').forEach(button => button.classList.toggle('active', active === true));
  }
  function renderShortcuts(slots) {
    const key = JSON.stringify(slots || []) + ':' + shortcutPage + ':' + editingShortcuts;
    if (key === shortcutsKey) return;
    shortcutsKey = key;
    ['parkShortcuts', 'driveShortcuts'].forEach(id => {
      const host = $(id);
      host.replaceChildren();
      for (let i = 0; i < 4; i++) {
        const index = shortcutPage * 4 + i;
        const slot = slots && slots[index] || { type: 'empty', label: 'Ajouter' };
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.shortcut = String(index);
        button.title = editingShortcuts || slot.type === 'empty' ? 'Configurer ce raccourci' : slot.label;
        const icon = document.createElement('span');
        icon.textContent = slot.type === 'ha' ? '⌂' : slot.type === 'app' ? '▦' : '+';
        const name = document.createElement('small');
        name.textContent = slot.label || 'Ajouter';
        button.append(icon, name);
        host.append(button);
      }
    });
    document.querySelectorAll('[data-edit-shortcuts]').forEach(button => { button.textContent = editingShortcuts ? 'Terminer' : 'Modifier'; });
    document.querySelectorAll('[data-next-shortcuts]').forEach(button => { button.title = 'Groupe ' + (shortcutPage + 1) + ' sur 2'; });
  }
  function renderCurve(curve) {
    const values = Array.isArray(curve) ? curve.filter(value => Number.isFinite(Number(value))).map(Number) : [];
    const line = $('chartLine');
    if (values.length < 2) { line.setAttribute('points', ''); $('chartEmpty').hidden = false; return; }
    const min = Math.max(0, Math.min(...values) - 2);
    const max = Math.max(min + 5, Math.max(...values) + 2);
    line.setAttribute('points', values.map((v, i) => (i * 340 / (values.length - 1)).toFixed(1) + ',' + (100 - (v - min) * 80 / (max - min)).toFixed(1)).join(' '));
    $('chartEmpty').hidden = true;
  }
  function syncMapBounds() {
    if (!bridge || !bridge.mapBounds) return;
    const target = document.querySelector(mode === 'parked' ? '.parked-view .map-art' : '.driving-view .mini-map');
    const rect = target.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    const bounds = [rect.x, rect.y, rect.width, rect.height].map(value => Math.round(value * scale));
    bridge.mapBounds(...bounds);
  }
  function render() {
    const s = live || MG4State.unknown;
    const now = Date.now();
    const next = MG4State.nextViewMode(mode, s.speedRawKmh, s.connected, lastMotionAt, now);
    mode = next.mode;
    lastMotionAt = next.lastMotionAt;
    document.querySelector('.parked-view').hidden = mode !== 'parked';
    document.querySelector('.driving-view').hidden = mode !== 'driving';
    setText(['parkSpeed', 'driveSpeed'], label(s.speedKmh));
    $('parkBattery').textContent = label(s.batteryPercent);
    $('driveBattery').textContent = label(s.batteryPercent, ' %');
    setText(['parkRange', 'driveRange'], label(s.rangeKm, ' ' + (s.distanceUnit || 'km')));
    setText(['parkAvg', 'driveAvg'], label(s.consumption, ' ' + (s.consumptionUnit || 'kWh/100 km'), 1));
    document.querySelectorAll('.speed-unit').forEach(el => { el.textContent = s.speedUnit || 'km/h'; });
    $('drivePower').textContent = label(s.powerKw, ' kW', 1);
    $('batteryFill').style.width = typeof s.batteryPercent === 'number' ? Math.max(0, Math.min(100, s.batteryPercent)) + '%' : '0%';
    $('outside').textContent = s.outsideTemp === null || s.outsideTemp === undefined ? 'Temp. ext. —' : '☁  ' + label(s.outsideTemp, ' °C', 1);
    $('connection').textContent = !live ? 'Données en attente' : !s.connected ? 'Véhicule déconnecté' : s.source === 'simulator' ? 'Simulation' : 'Données véhicule';
    $('driveSource').textContent = $('connection').textContent;
    setText(['parkTemp', 'driveTemp'], label(s.driverTemp, ' °C', 1));
    setActive('power', s.hvacOn);
    setActive('auto', s.autoOn);
    setActive('ac', s.acOn);
    setActive('recirc', s.recirc === 0);
    setActive('front', s.defrostFront);
    setActive('rear', s.defrostRear);
    document.querySelectorAll('[data-climate]').forEach(button => {
      const action = button.dataset.climate;
      button.disabled = !s.connected || s.hvacOn === null || s.hvacOn === undefined ||
        ((action === 'tempDown' || action === 'tempUp') && s.driverTemp == null) ||
        (action === 'fanUp' && s.fanSpeed == null);
    });
    setText(['parkMediaTitle', 'driveMediaTitle'], s.mediaAvailable && s.mediaTitle ? s.mediaTitle : 'Média');
    setText(['parkMediaArtist', 'driveMediaArtist'], s.mediaAvailable ? s.mediaArtist || 'Source active' : 'Aucune source');
    setText(['parkPlay', 'drivePlay'], s.mediaPlaying ? '❚❚' : '▶');
    document.querySelectorAll('.media-progress').forEach(bar => { bar.hidden = s.mediaProgress === null || s.mediaProgress === undefined; bar.style.setProperty('--progress', Math.max(0, Math.min(100, Number(s.mediaProgress) || 0)) + '%'); });
    const period = [0, 1, 2].includes(s.consumptionPeriod) ? s.consumptionPeriod : 1;
    document.querySelectorAll('[data-period]').forEach(button => button.classList.toggle('active', Number(button.dataset.period) === period));
    $('chartPeriod').textContent = periodNames[period];
    $('chartAverage').textContent = label(s.periodAverage, ' ' + (s.consumptionUnit || 'kWh/100 km'), 1);
    $('navDistance').textContent = navDistance(s.navDistanceMeters, s.distanceUnit) || 'Ouvrir l’itinéraire';
    $('navRoad').textContent = s.navRoad || 'Guidage dans votre application de navigation';
    $('navAction').textContent = s.navRoad ? (s.navSide === 1 ? '↖  Navigation' : s.navSide === 2 ? '↗  Navigation' : '➤  Navigation') : '➤  Navigation';
    renderCurve(s.consumptionCurve);
    renderShortcuts(s.shortcuts);
    requestAnimationFrame(syncMapBounds);
  }
  window.MG4Live = { setState(state) { live = state; render(); } };
  document.querySelectorAll('[data-page]').forEach(button => button.addEventListener('click', () => bridge && bridge.open && bridge.open(button.dataset.page)));
  document.querySelectorAll('[data-media]').forEach(button => button.addEventListener('click', () => bridge && bridge.media && bridge.media(button.dataset.media)));
  document.querySelectorAll('[data-climate]').forEach(button => button.addEventListener('click', () => { if (!button.disabled && bridge && bridge.climate) bridge.climate(button.dataset.climate); }));
  document.querySelectorAll('[data-period]').forEach(button => button.addEventListener('click', () => { if (bridge && bridge.setConsumptionPeriod) bridge.setConsumptionPeriod(Number(button.dataset.period)); }));
  document.querySelectorAll('[data-edit-shortcuts]').forEach(button => button.addEventListener('click', () => { editingShortcuts = !editingShortcuts; renderShortcuts(live && live.shortcuts); }));
  document.querySelectorAll('[data-next-shortcuts]').forEach(button => button.addEventListener('click', () => { shortcutPage = 1 - shortcutPage; renderShortcuts(live && live.shortcuts); }));
  document.querySelectorAll('.shortcut-grid').forEach(grid => grid.addEventListener('click', e => {
    const button = e.target.closest('[data-shortcut]');
    if (button && bridge) {
      if (editingShortcuts && bridge.editShortcut) bridge.editShortcut(Number(button.dataset.shortcut));
      else if (bridge.shortcut) bridge.shortcut(Number(button.dataset.shortcut));
    }
  }));
  document.querySelectorAll('[role="button"][data-page]').forEach(button => button.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); button.click(); }
  }));
  function tick() {
    const now = new Date();
    $('clock').textContent = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    $('date').textContent = now.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  }
  window.addEventListener('resize', () => requestAnimationFrame(syncMapBounds));
  tick(); setInterval(tick, 30000); render();
})();
