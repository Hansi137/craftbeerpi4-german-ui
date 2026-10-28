#include "display.h"
#include "config.h"

#include <Arduino.h>
#include <WiFi.h>
#include <TFT_eSPI.h>
#include <math.h>

namespace {

TFT_eSPI tft = TFT_eSPI();

// Feste Bildschirmgröße statt tft.width()/tft.height(): für dieses Panel
// (ST7789 170x320, 8-Bit Parallel) liefern die Laufzeit-Abfragen nach
// setRotation() nicht zuverlässig die erwartete 320x170-Landschaftsgröße
// (live auf dem Gerät beobachtet - Text landete teilweise gedreht/am
// falschen Rand). Das bereits funktionierende esp32thermometer-
// Vorgängerprojekt auf demselben Board nutzt exakt dieselben festen Werte
// (SCREEN_W 320 / SCREEN_H 170), siehe github.com/Hansi137/esp32thermometer.
const int16_t SCREEN_W = 320;
const int16_t SCREEN_H = 170;

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

// Farbschema an das Web-Dashboard angelehnt (siehe data/style.css), damit
// Display und Browser optisch zusammenpassen: dunkler Hintergrund, Teal als
// Akzent, Grün/Orange/Rot für Status analog zur CraftBeerPi-Optik.
uint16_t COLOR_BG, COLOR_TEXT, COLOR_MUTED, COLOR_ACCENT;
uint16_t COLOR_COOLING_ON, COLOR_COOLING_OFF;
uint16_t COLOR_WARN, COLOR_RUNNING, COLOR_FINISHED;

void initColors() {
    COLOR_BG = TFT_BLACK;
    COLOR_TEXT = tft.color565(0xE8, 0xEA, 0xF0);       // --text
    COLOR_MUTED = tft.color565(0x8A, 0x93, 0xA8);      // --text-secondary
    COLOR_ACCENT = tft.color565(0x14, 0xC7, 0xB6);     // --accent-light (Teal)
    COLOR_COOLING_ON = tft.color565(0x14, 0xC7, 0xB6); // --accent-light: Kühlung aktiv
    COLOR_COOLING_OFF = tft.color565(0x2A, 0x3A, 0x5A);// --bg-elevated: inaktiv, dezent
    COLOR_WARN = tft.color565(0xE6, 0xA2, 0x3C);       // --warn
    COLOR_RUNNING = tft.color565(0x2E, 0xCC, 0x71);    // --success
    COLOR_FINISHED = tft.color565(0xE6, 0xA2, 0x3C);   // --warn
}

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

    // Kopfzeile
    tft.setTextColor(COLOR_ACCENT, COLOR_BG);
    tft.setTextSize(1);
    tft.setCursor(4, 4);
    tft.print("Gaerschrank-Controller");

    // Temperatur gross
    tft.setTextSize(4);
    tft.setTextColor(COLOR_TEXT, COLOR_BG);
    tft.setCursor(4, 22);
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
    tft.setCursor(4, 64);
    tft.print("Ziel: ");
    tft.print(s.targetTenths / 10);
    tft.print('.');
    tft.print(abs(s.targetTenths % 10));
    tft.print((char)247);
    tft.print('C');

    // Kuehl-Status als farbiger Balken (volle Bildschirmbreite)
    const int barY = 88;
    const int barH = 26;
    uint16_t barColor = s.relayOn ? COLOR_COOLING_ON : COLOR_COOLING_OFF;
    tft.fillRect(0, barY, SCREEN_W, barH, barColor);
    tft.setTextColor(s.relayOn ? TFT_BLACK : COLOR_TEXT, barColor);
    tft.setTextSize(2);
    tft.setCursor(6, barY + 5);
    tft.print(s.relayOn ? "KUEHLUNG AN" : "Kuehlung aus");

    int nextY = barY + barH + 4;
    if (s.guardActive) {
        tft.setTextSize(1);
        tft.setTextColor(COLOR_WARN, COLOR_BG);
        tft.setCursor(4, nextY);
        tft.print("Kompressorschutz: noch ");
        tft.print(fmtDuration(s.guardSecondsRemaining));
        nextY += 12;
    }

    // Gaerplan-Status
    tft.setTextSize(1);
    uint16_t planColor = COLOR_MUTED;
    if (s.scheduleState == ScheduleState::RUNNING) planColor = COLOR_RUNNING;
    else if (s.scheduleState == ScheduleState::FINISHED) planColor = COLOR_FINISHED;
    tft.setTextColor(planColor, COLOR_BG);
    tft.setCursor(4, nextY);
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
    tft.setCursor(4, SCREEN_H - 12);
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
    tft.setRotation(1); // Querformat, siehe SCREEN_W/SCREEN_H oben
    initColors();
    tft.fillScreen(COLOR_BG);
    pinMode(TFT_BL, OUTPUT);
    digitalWrite(TFT_BL, HIGH); // Hintergrundbeleuchtung an (siehe TFT_BACKLIGHT_ON in Setup206)

    // Sofort sichtbarer Hinweis, noch bevor update() zum ersten Mal läuft:
    // der WLAN-Verbindungsversuch in setup() (wifi_setup::connect()) kann
    // bis zu WIFI_CONNECT_TIMEOUT_SECONDS dauern, bevor loop() überhaupt
    // startet - ohne dieses Boot-Banner wäre der Bildschirm bis dahin
    // einfach schwarz (Hintergrundbeleuchtung an, aber ohne Inhalt sieht das
    // wie "Display kaputt" aus).
    tft.setTextColor(COLOR_TEXT, COLOR_BG);
    tft.setTextSize(2);
    tft.setCursor(4, 70);
    tft.print("Starte...");

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
