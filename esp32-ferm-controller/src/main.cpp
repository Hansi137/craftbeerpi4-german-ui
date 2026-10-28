// main.cpp
//
// Verdrahtet alle Module zusammen: WLAN-Verbindung, Laden von Gärplan/
// Einstellungen/Zustand, periodische Temperaturmessung + Kühl-Regelung +
// Gärplan-Fortschritt, Web-Dashboard, optionales CraftBeerPi-Reporting.
//
// Die eigentliche Entscheidungslogik (Hysterese, Gärplan-Fortschritt) steckt
// bewusst NICHT hier, sondern in den reinen, hardware-unabhängigen Modulen
// cooling_control.cpp/schedule.cpp - main.cpp liefert ihnen nur die
// aktuellen Messwerte/Zeiten und wendet ihre Entscheidung auf die Hardware
// an.

#include <Arduino.h>
#include <WiFi.h>
#include <math.h>

#include "config.h"
#include "app_state.h"
#include "temp_sensor.h"
#include "relay_output.h"
#include "cooling_control.h"
#include "schedule.h"
#include "persistence.h"
#include "wifi_setup.h"
#include "web_server.h"
#include "cbpi_reporter.h"
#include "display.h"

AppState appState;

namespace {

TempSensor tempSensor;
RelayOutput relay;

uint32_t lastControlMillis = 0;
uint32_t lastStateSaveMillis = 0;
uint32_t lastOffMillis = 0; // für den Kompressorschutz-Timer

// Effektive Zieltemperatur für den aktuell aktiven Gärplan-Schritt
// (inkl. Rampe, falls konfiguriert). Nur sinnvoll, wenn ein Schritt aktiv
// ist (RUNNING oder FINISHED - FINISHED zeigt dann weiter den letzten
// Schritt als "aktiv" an, siehe advanceSchedule()).
float computeEffectiveTarget() {
    int idx = appState.progress.currentStepIndex;
    if (idx < 0 || idx >= appState.schedule.stepCount) {
        return appState.effectiveTargetTempC; // unverändert lassen
    }
    const ScheduleStep& step = appState.schedule.steps[idx];
    bool hasNext = (idx + 1) < appState.schedule.stepCount;
    const ScheduleStep& nextStep = hasNext ? appState.schedule.steps[idx + 1] : step;
    return effectiveTargetTempC(step, hasNext, nextStep, appState.progress.stepElapsedSeconds);
}

void applyRelayDecision(bool shouldBeOn) {
    bool wasOn = relay.isOn();
    relay.setOn(shouldBeOn);
    appState.relayOn = shouldBeOn;
    if (wasOn && !shouldBeOn) {
        lastOffMillis = millis();
    }
}

void runControlCycle(uint32_t deltaSeconds) {
    // 0. Relais-Polarität mit den (ggf. gerade per Dashboard geänderten)
    //    Einstellungen synchron halten - no-op, wenn unverändert.
    relay.setActiveHigh(appState.settings.relayActiveHigh);

    // 1. Temperatur messen.
    float temp = tempSensor.readTempC();
    appState.sensorOk = !isnan(temp);
    if (appState.sensorOk) {
        appState.currentTempC = temp;
    }

    // 2. Gärplan-Fortschritt weiterlaufen lassen (nur im Zustand RUNNING -
    //    advanceSchedule() selbst ignoriert alle anderen Zustände).
    appState.progress = advanceSchedule(appState.schedule, appState.progress, deltaSeconds);

    // 3. Effektive Zieltemperatur aus dem aktuellen Schritt ableiten.
    if (appState.progress.state == ScheduleState::RUNNING ||
        appState.progress.state == ScheduleState::FINISHED) {
        appState.effectiveTargetTempC = computeEffectiveTarget();
    }

    uint32_t secondsSinceOff = (millis() - lastOffMillis) / 1000;

    // 4. Kühl-Entscheidung treffen. Ohne gültigen Sensorwert wird die
    //    Kühlung sicherheitshalber ausgeschaltet, statt mit einem
    //    Fantasiewert weiterzurechnen (ein hängender/abgezogener Sensor darf
    //    niemals dazu führen, dass die Kühlung unkontrolliert weiterläuft).
    if (!appState.sensorOk && !appState.manualOverrideActive) {
        applyRelayDecision(false);
        appState.guardActive = false;
        appState.guardSecondsRemaining = 0;
        return;
    }

    if (appState.manualOverrideActive) {
        CoolingInputs in{};
        in.currentTempC = appState.currentTempC;
        in.targetTempC = appState.effectiveTargetTempC;
        in.onOffsetC = appState.settings.onOffsetC;
        in.offOffsetC = appState.settings.offOffsetC;
        in.relayCurrentlyOn = relay.isOn();
        in.secondsSinceLastOff = secondsSinceOff;
        in.minCompressorOffSeconds = appState.settings.minCompressorOffSeconds;
        in.manualOverrideActive = true;
        in.manualRequestOn = appState.manualRequestOn;

        CoolingDecision decision = evaluateCoolingRelay(in);
        applyRelayDecision(decision.relayShouldBeOn);
        appState.guardActive = decision.blockedByMinOffGuard;
        appState.guardSecondsRemaining = decision.guardSecondsRemaining;
        return;
    }

    if (appState.progress.state == ScheduleState::RUNNING ||
        appState.progress.state == ScheduleState::FINISHED) {
        CoolingInputs in{};
        in.currentTempC = appState.currentTempC;
        in.targetTempC = appState.effectiveTargetTempC;
        in.onOffsetC = appState.settings.onOffsetC;
        in.offOffsetC = appState.settings.offOffsetC;
        in.relayCurrentlyOn = relay.isOn();
        in.secondsSinceLastOff = secondsSinceOff;
        in.minCompressorOffSeconds = appState.settings.minCompressorOffSeconds;
        in.manualOverrideActive = false;
        in.manualRequestOn = false;

        CoolingDecision decision = evaluateCoolingRelay(in);
        applyRelayDecision(decision.relayShouldBeOn);
        appState.guardActive = decision.blockedByMinOffGuard;
        appState.guardSecondsRemaining = decision.guardSecondsRemaining;
        return;
    }

    // IDLE: kein Plan aktiv, kein manueller Modus -> Kühlung bleibt aus.
    applyRelayDecision(false);
    appState.guardActive = false;
    appState.guardSecondsRemaining = 0;
}

} // namespace

void setup() {
    Serial.begin(115200);
    delay(200);
    Serial.println();
    Serial.println("=== ESP32 Gaerschrank-Controller ===");
    Serial.println("Firmware " FIRMWARE_VERSION);

    appState.bootMillis = millis();

    display::begin();

    if (!persistence::begin()) {
        Serial.println("[FEHLER] LittleFS konnte nicht gemountet werden!");
    }
    persistence::loadSchedule(appState.schedule);
    persistence::loadSettings(appState.settings);
    persistence::loadState(appState.progress);

    tempSensor.begin();
    if (!tempSensor.isSensorPresent()) {
        Serial.println("[WARNUNG] Kein DS18B20-Sensor gefunden - bitte Verkabelung pruefen (siehe README.md).");
    }

    relay.begin(appState.settings.relayActiveHigh);
    lastOffMillis = millis(); // Kompressorschutz-Timer beginnt bei jedem Boot neu (siehe cooling_control.h)

    Serial.println("Verbinde mit WLAN (oder oeffne Einrichtungs-Portal falls noch keins bekannt ist)...");
    bool connected = wifi_setup::connect();
    appState.wifiConnected = connected;
    if (connected) {
        Serial.print("WLAN verbunden, IP-Adresse: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println("[WARNUNG] Keine WLAN-Verbindung (Einrichtungs-Portal-Timeout). Dashboard ist nur ueber den Einrichtungs-AP erreichbar, bis ein WLAN konfiguriert ist.");
    }

    web_server::begin();
    Serial.println("Webserver gestartet.");

    lastControlMillis = millis();
    lastStateSaveMillis = millis();
}

void loop() {
    uint32_t now = millis();

    if ((uint32_t)(now - lastControlMillis) >= CONTROL_LOOP_INTERVAL_MS) {
        uint32_t deltaSeconds = (now - lastControlMillis) / 1000;
        lastControlMillis = now;
        runControlCycle(deltaSeconds);

        appState.wifiConnected = wifi_setup::isConnected();
        appState.wifiRssi = wifi_setup::rssi();

        cbpi_reporter::reportIfDue(appState.settings, appState.currentTempC, now);
    }

    if ((uint32_t)(now - lastStateSaveMillis) >= STATE_SAVE_INTERVAL_MS) {
        lastStateSaveMillis = now;
        persistence::saveState(appState.progress);
    }

    display::update(); // throttelt sich intern selbst auf max. 1x/Sekunde
}
