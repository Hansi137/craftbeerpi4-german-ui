#include "display.h"
#include "config.h"

#include <Arduino.h>
#include <WiFi.h>
#include <TFT_eSPI.h>
#include <math.h>

namespace {

TFT_eSPI tft = TFT_eSPI();

// Zuletzt gezeichneter Stand - update() zeichnet nur neu, wenn sich
// mindestens einer dieser Werte seit dem letzten Aufruf geändert hat.
struct DrawnState {
    bool valid = false; // false = es wurde noch nie gezeichnet
    int tempTenths = -10000;    // currentTempC * 10, gerundet
    int targetTenths = -10000;  // effectiveTargetTempC * 10, gerundet
    bool sensorOk = false;
    bool relayOn = false;
    bool guardActive = false;
    uint32_t guardSecondsRemaining = 0;
    ScheduleState scheduleState = ScheduleState::IDLE;
    int currentStepIndex = -2;
    uint32_t stepElapsedSeconds = 0;
    bool wifiConnected = false;
    uint32_t ip = 0;
};

DrawnState lastDrawn;
uint32_t lastCheckMillis = 0;

const uint16_t COLOR_BG = TFT_BLACK;
const uint16_t COLOR_TEXT = TFT_WHITE;
const uint16_t COLOR_MUTED = 0x7BEF; // mittleres Grau (RGB565)
const uint16_t COLOR_COOLING_ON = TFT_CYAN;
const uint16_t COLOR_COOLING_OFF = 0x4208; // dunkles Grau
const uint16_t COLOR_WARN = TFT_ORANGE;
const uint16_t COLOR_RUNNING = TFT_GREEN;

const char* stateLabel(ScheduleState s) {
    switch (s) {
        case ScheduleState::IDLE: return "Bereit";
        case ScheduleState::RUNNING: return "Laeuft";
        case ScheduleState::FINISHED: return "Fertig";
        case ScheduleState::MANUAL: return "Manuell";
    }
    return "?";
}

String fmtDuration(uint32_t sec) {
    uint32_t d = sec / 86400;
    uint32_t h = (sec % 86400) / 3600;
    uint32_t m = (sec % 3600) / 60;
    uint32_t s = sec % 60;
    char buf[24];
    if (d > 0) snprintf(buf, sizeof(buf), "%uT %uh", (unsigned)d, (unsigned)h);
    else if (h > 0) snprintf(buf, sizeof(buf), "%uh %um", (unsigned)h, (unsigned)m);
    else snprintf(buf, sizeof(buf), "%um %us", (unsigned)m, (unsigned)s);
    return String(buf);
}

// Baut den aktuellen Zustand als Vergleichs-Snapshot. Rein lesend, keine
// Bildschirm-Seiteneffekte.
DrawnState captureState() {
    DrawnState s;
    s.valid = true;
    s.tempTenths = (int)round(appState.currentTempC * 10.0f);
    s.targetTenths = (int)round(appState.effectiveTargetTempC * 10.0f);
    s.sensorOk = appState.sensorOk;
    s.relayOn = appState.relayOn;
    s.guardActive = appState.guardActive;
    s.guardSecondsRemaining = appState.guardSecondsRemaining;
    s.scheduleState = appState.progress.state;
    s.currentStepIndex = appState.progress.currentStepIndex;
    s.stepElapsedSeconds = appState.progress.stepElapsedSeconds;
    s.wifiConnected = WiFi.status() == WL_CONNECTED;
    s.ip = s.wifiConnected ? (uint32_t)WiFi.localIP() : 0;
    return s;
}

bool stateChanged(const DrawnState& a, const DrawnState& b) {
    if (!a.valid || !b.valid) return true;
    return a.tempTenths != b.tempTenths ||
           a.targetTenths != b.targetTenths ||
           a.sensorOk != b.sensorOk ||
           a.relayOn != b.relayOn ||
           a.guardActive != b.guardActive ||
           a.guardSecondsRemaining != b.guardSecondsRemaining ||
           a.scheduleState != b.scheduleState ||
           a.currentStepIndex != b.currentStepIndex ||
           a.stepElapsedSeconds != b.stepElapsedSeconds ||
           a.wifiConnected != b.wifiConnected ||
           a.ip != b.ip;
}

void draw(const DrawnState& s) {
    tft.fillScreen(COLOR_BG);
    int w = tft.width();

    // Kopfzeile
    tft.setTextColor(COLOR_MUTED, COLOR_BG);
    tft.setTextSize(1);
    tft.setCursor(4, 4);
    tft.print("Gaerschrank-Controller");

    // Temperatur gross
    tft.setTextSize(4);
    tft.setTextColor(COLOR_TEXT, COLOR_BG);
    tft.setCursor(4, 24);
    if (s.sensorOk) {
        tft.print(s.tempTenths / 10);
        tft.print('.');
        tft.print(abs(s.tempTenths % 10));
        tft.print((char)247); // Grad-Zeichen (Standard-Font Symbol)
        tft.print('C');
    } else {
        tft.print("--.-");
    }

    // Zieltemperatur
    tft.setTextSize(2);
    tft.setTextColor(COLOR_MUTED, COLOR_BG);
    tft.setCursor(4, 70);
    tft.print("Ziel: ");
    tft.print(s.targetTenths / 10);
    tft.print('.');
    tft.print(abs(s.targetTenths % 10));
    tft.print((char)247);
    tft.print('C');

    // Kuehl-Status als farbiger Balken
    int barY = 95;
    int barH = 28;
    uint16_t barColor = s.relayOn ? COLOR_COOLING_ON : COLOR_COOLING_OFF;
    tft.fillRect(0, barY, w, barH, barColor);
    tft.setTextColor(s.relayOn ? TFT_BLACK : COLOR_TEXT, barColor);
    tft.setTextSize(2);
    tft.setCursor(6, barY + 6);
    tft.print(s.relayOn ? "KUEHLUNG AN" : "Kuehlung aus");

    if (s.guardActive) {
        tft.setTextSize(1);
        tft.setTextColor(COLOR_WARN, COLOR_BG);
        tft.setCursor(4, barY + barH + 4);
        tft.print("Kompressorschutz: noch ");
        tft.print(fmtDuration(s.guardSecondsRemaining));
    }

    // Gaerplan-Status
    int planY = 130;
    tft.setTextSize(1);
    tft.setTextColor(s.scheduleState == ScheduleState::RUNNING ? COLOR_RUNNING : COLOR_MUTED, COLOR_BG);
    tft.setCursor(4, planY);
    tft.print("Plan: ");
    tft.print(stateLabel(s.scheduleState));
    if (s.scheduleState == ScheduleState::RUNNING || s.scheduleState == ScheduleState::FINISHED) {
        tft.print("  Schritt ");
        tft.print(s.currentStepIndex + 1);
        tft.print("  (");
        tft.print(fmtDuration(s.stepElapsedSeconds));
        tft.print(")");
    }

    // Fusszeile: WLAN-Status
    tft.setTextColor(COLOR_MUTED, COLOR_BG);
    tft.setCursor(4, tft.height() - 12);
    if (s.wifiConnected) {
        IPAddress ip(s.ip);
        tft.print("WLAN: ");
        tft.print(ip);
    } else {
        tft.print("WLAN: Setup-Portal \"" WIFI_SETUP_AP_NAME "\"");
    }
}

} // namespace

namespace display {

void begin() {
    tft.init();
    tft.setRotation(1); // Querformat: 320x170
    tft.fillScreen(COLOR_BG);
    pinMode(TFT_BL, OUTPUT);
    digitalWrite(TFT_BL, HIGH); // Hintergrundbeleuchtung an (siehe TFT_BACKLIGHT_ON in Setup206)
    lastDrawn = DrawnState{}; // valid=false erzwingt den allerersten Redraw
}

void update() {
    uint32_t now = millis();
    // Höchstens einmal pro Sekunde prüfen/neuzeichnen - reicht für eine
    // Statusanzeige völlig aus und spart unnötige SPI/Parallel-Bus-Last.
    if (lastDrawn.valid && (uint32_t)(now - lastCheckMillis) < 1000) return;
    lastCheckMillis = now;

    DrawnState current = captureState();
    if (!stateChanged(current, lastDrawn)) return;

    draw(current);
    lastDrawn = current;
}

} // namespace display
