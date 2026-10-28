(function () {
  'use strict';

  // ============================================================
  // Hilfsfunktionen
  // ============================================================
  function $(id) { return document.getElementById(id); }

  function showToast(msg, isError) {
    var t = $('toast');
    t.textContent = msg;
    t.className = 'toast' + (isError ? ' error' : '');
    t.hidden = false;
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(function () { t.hidden = true; }, 3000);
  }

  function fmtDuration(sec) {
    sec = Math.max(0, Math.floor(sec));
    var d = Math.floor(sec / 86400);
    var h = Math.floor((sec % 86400) / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var s = sec % 60;
    if (d > 0) return d + 'T ' + h + 'h';
    if (h > 0) return h + 'h ' + m + 'min';
    if (m > 0) return m + 'min ' + s + 's';
    return s + 's';
  }

  function api(path, options) {
    options = options || {};
    return fetch(path, options).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  // ============================================================
  // Tabs
  // ============================================================
  document.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
      document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      $('tab-' + btn.dataset.tab).classList.add('active');
    });
  });

  // ============================================================
  // Status-Polling
  // ============================================================
  var STATE_LABELS = { IDLE: 'Bereit', RUNNING: 'Läuft', FINISHED: 'Abgeschlossen', MANUAL: 'Manuell' };

  function renderStatus(s) {
    $('status-temp').textContent = s.sensorOk && s.currentTempC !== null
      ? s.currentTempC.toFixed(1) + '°C'
      : '– Sensor –';
    $('status-target').textContent = 'Ziel: ' + s.effectiveTargetTempC.toFixed(1) + '°C';

    var relayBadge = $('status-relay');
    relayBadge.textContent = s.relayOn ? 'AN' : 'AUS';
    relayBadge.className = 'badge ' + (s.relayOn ? 'on' : 'off');

    var guardRow = $('guard-row');
    if (s.guardActive) {
      guardRow.hidden = false;
      $('status-guard').textContent = 'noch ' + fmtDuration(s.guardSecondsRemaining);
    } else {
      guardRow.hidden = true;
    }

    var stateBadge = $('status-state');
    stateBadge.textContent = STATE_LABELS[s.scheduleState] || s.scheduleState;
    stateBadge.className = 'badge ' + (s.scheduleState === 'RUNNING' ? 'on' : (s.scheduleState === 'FINISHED' ? 'warn' : 'off'));

    if (s.currentStepName) {
      $('status-step').textContent = s.currentStepName + ' (' + (s.currentStepIndex + 1) + '/' + s.stepCount + ')';
      var pct = s.stepDurationSeconds > 0 ? Math.min(100, Math.round((s.stepElapsedSeconds / s.stepDurationSeconds) * 100)) : 0;
      $('status-progress').textContent = fmtDuration(s.stepElapsedSeconds) + ' / ' + fmtDuration(s.stepDurationSeconds);
      $('status-progress-fill').style.width = pct + '%';
    } else {
      $('status-step').textContent = '–';
      $('status-progress').textContent = '–';
      $('status-progress-fill').style.width = '0%';
    }

    $('status-wifi').textContent = s.wifiConnected ? ('verbunden (' + s.wifiRssi + ' dBm)') : 'getrennt';
    $('status-uptime').textContent = fmtDuration(s.uptimeSeconds);
    $('status-version').textContent = s.firmwareVersion;

    // Manuellen Tab immer mit dem Server-Stand synchron halten.
    $('manual-active').checked = s.manualOverrideActive;
    $('manual-relay').disabled = !s.manualOverrideActive;
    $('manual-relay').checked = s.manualRequestOn;

    // Live-Anzeige, was das Relais TATSÄCHLICH gerade tut (kann vom
    // "angefordert"-Schalter abweichen, z.B. während der Kompressorschutz
    // ein Einschalten noch verzögert).
    var actualBadge = $('manual-relay-actual');
    actualBadge.textContent = s.relayOn ? 'AN' : 'AUS';
    actualBadge.className = 'badge ' + (s.relayOn ? 'on' : 'off');

    var manualGuardRow = $('manual-guard-row');
    if (s.guardActive) {
      manualGuardRow.hidden = false;
      $('manual-guard-remaining').textContent = 'noch ' + fmtDuration(s.guardSecondsRemaining);
    } else {
      manualGuardRow.hidden = true;
    }
  }

  function pollStatus() {
    api('/api/status').then(renderStatus).catch(function () { /* naechster Versuch folgt */ });
  }

  setInterval(pollStatus, 4000);
  pollStatus();

  // ============================================================
  // Gärplan-Editor
  // ============================================================
  var currentSchedule = { name: 'Gaerplan', steps: [] };

  function renderSteps() {
    var container = $('plan-steps');
    container.innerHTML = '';
    currentSchedule.steps.forEach(function (step, i) {
      var card = document.createElement('div');
      card.className = 'step-card';
      card.innerHTML =
        '<div class="step-card-header">' +
          '<span class="step-index">Schritt ' + (i + 1) + '</span>' +
          '<button class="step-remove" data-i="' + i + '">✕</button>' +
        '</div>' +
        '<div class="step-fields">' +
          '<input type="text" class="full" data-f="name" data-i="' + i + '" placeholder="Name" value="' + (step.name || '').replace(/"/g, '&quot;') + '">' +
          '<div><label class="field-label">Zieltemp (°C)</label><input type="number" step="0.1" data-f="targetTempC" data-i="' + i + '" value="' + step.targetTempC + '"></div>' +
          '<div><label class="field-label">Tage</label><input type="number" min="0" data-f="durationDays" data-i="' + i + '" value="' + step.durationDays + '"></div>' +
          '<div><label class="field-label">Stunden</label><input type="number" min="0" max="23" data-f="durationHours" data-i="' + i + '" value="' + step.durationHours + '"></div>' +
        '</div>' +
        '<div class="step-ramp-row">' +
          '<input type="checkbox" data-f="rampToNext" data-i="' + i + '" ' + (step.rampToNext ? 'checked' : '') + '>' +
          '<span>Rampe zur Zieltemperatur des nächsten Schritts</span>' +
        '</div>';
      container.appendChild(card);
    });

    container.querySelectorAll('[data-f]').forEach(function (el) {
      el.addEventListener('input', function () {
        var i = parseInt(el.dataset.i, 10);
        var field = el.dataset.f;
        if (field === 'rampToNext') {
          currentSchedule.steps[i][field] = el.checked;
        } else if (field === 'name') {
          currentSchedule.steps[i][field] = el.value;
        } else {
          currentSchedule.steps[i][field] = parseFloat(el.value) || 0;
        }
      });
    });
    container.querySelectorAll('.step-remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        currentSchedule.steps.splice(parseInt(btn.dataset.i, 10), 1);
        renderSteps();
      });
    });
  }

  function loadSchedule() {
    api('/api/schedule').then(function (s) {
      currentSchedule = s;
      $('plan-name').value = s.name || '';
      renderSteps();
    }).catch(function () { showToast('Gärplan konnte nicht geladen werden', true); });
  }

  $('plan-add-step').addEventListener('click', function () {
    currentSchedule.steps.push({ name: 'Neuer Schritt', targetTempC: 18, durationDays: 1, durationHours: 0, rampToNext: false });
    renderSteps();
  });

  $('plan-save').addEventListener('click', function () {
    currentSchedule.name = $('plan-name').value;
    api('/api/schedule', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentSchedule)
    }).then(function () { showToast('Gärplan gespeichert'); })
      .catch(function () { showToast('Speichern fehlgeschlagen', true); });
  });

  $('plan-start').addEventListener('click', function () {
    api('/api/control/start', { method: 'POST' })
      .then(function () { showToast('Gärplan gestartet'); pollStatus(); })
      .catch(function () { showToast('Start fehlgeschlagen', true); });
  });
  $('plan-stop').addEventListener('click', function () {
    api('/api/control/stop', { method: 'POST' })
      .then(function () { showToast('Gestoppt'); pollStatus(); })
      .catch(function () { showToast('Stop fehlgeschlagen', true); });
  });
  $('plan-reset').addEventListener('click', function () {
    if (!confirm('Gärplan-Fortschritt wirklich zurücksetzen?')) return;
    api('/api/control/reset', { method: 'POST' })
      .then(function () { showToast('Zurückgesetzt'); pollStatus(); })
      .catch(function () { showToast('Reset fehlgeschlagen', true); });
  });

  // ============================================================
  // Manueller Modus
  // ============================================================
  // Jeder Klick auf einen der beiden Schalter löst sofort sendManual() aus
  // (kein "tippt der Nutzer gerade"-Zustand wie bei einem Textfeld, der vor
  // dem nächsten Status-Poll geschützt werden müsste) - renderStatus()
  // synchronisiert die Schalter deshalb bei jedem Poll bedingungslos mit dem
  // Server. (Eine frühere Fokus/Blur-basierte Sperre hat genau das
  // verhindert und dafür gesorgt, dass der "Kühlung"-Schalter nach dem
  // Aktivieren von "Manueller Modus" per Touch oft dauerhaft deaktiviert
  // blieb, weil der Blur auf Touch-Geräten nicht zuverlässig feuert.)
  function sendManual() {
    var active = $('manual-active').checked;
    var relayOn = $('manual-relay').checked;
    $('manual-relay').disabled = !active;
    api('/api/control/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: active, relayOn: relayOn })
    }).then(function () { showToast('Manueller Modus aktualisiert'); pollStatus(); })
      .catch(function () { showToast('Fehlgeschlagen', true); });
  }

  ['manual-active', 'manual-relay'].forEach(function (id) {
    $(id).addEventListener('change', sendManual);
  });

  // ============================================================
  // Einstellungen
  // ============================================================
  function loadSettings() {
    api('/api/settings').then(function (s) {
      $('set-onoffset').value = s.onOffsetC;
      $('set-offoffset').value = s.offOffsetC;
      $('set-minoff').value = s.minCompressorOffSeconds;
      $('set-minon').value = s.minCompressorOnSeconds;
      $('set-relay-inverted').checked = !s.relayActiveHigh;
      $('set-cbpi-enabled').checked = s.cbpiReportEnabled;
      $('set-cbpi-host').value = s.cbpiHost;
      $('set-cbpi-port').value = s.cbpiPort;
      $('set-cbpi-key').value = s.cbpiKey;
      $('set-cbpi-interval').value = s.cbpiReportIntervalSeconds;
    }).catch(function () { showToast('Einstellungen konnten nicht geladen werden', true); });
  }

  $('settings-save').addEventListener('click', function () {
    var payload = {
      onOffsetC: parseFloat($('set-onoffset').value) || 0,
      offOffsetC: parseFloat($('set-offoffset').value) || 0,
      minCompressorOffSeconds: parseInt($('set-minoff').value, 10) || 240,
      minCompressorOnSeconds: parseInt($('set-minon').value, 10) || 0,
      relayActiveHigh: !$('set-relay-inverted').checked,
      cbpiReportEnabled: $('set-cbpi-enabled').checked,
      cbpiHost: $('set-cbpi-host').value,
      cbpiPort: parseInt($('set-cbpi-port').value, 10) || 8000,
      cbpiKey: $('set-cbpi-key').value,
      cbpiReportIntervalSeconds: parseInt($('set-cbpi-interval').value, 10) || 60
    };
    api('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function () { showToast('Einstellungen gespeichert'); loadSettings(); })
      .catch(function () { showToast('Speichern fehlgeschlagen', true); });
  });

  $('wifi-reset').addEventListener('click', function () {
    if (!confirm('WLAN-Zugangsdaten wirklich löschen? Das Gerät startet neu und öffnet das Einrichtungs-Portal.')) return;
    api('/api/wifi/reset', { method: 'POST' })
      .then(function () { showToast('WLAN zurückgesetzt, Gerät startet neu...'); })
      .catch(function () { showToast('Fehlgeschlagen', true); });
  });

  // ============================================================
  // Initial laden
  // ============================================================
  loadSchedule();
  loadSettings();
})();
