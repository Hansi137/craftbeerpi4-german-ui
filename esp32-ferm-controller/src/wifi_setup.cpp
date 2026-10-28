#include "wifi_setup.h"
#include "config.h"

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiManager.h>

namespace {
WiFiManager wm;
uint32_t lastRetryMillis = 0;
}

namespace wifi_setup {

bool connect() {
    wm.setConnectTimeout(WIFI_CONNECT_TIMEOUT_SECONDS);
    wm.setConfigPortalTimeout(WIFI_SETUP_PORTAL_TIMEOUT_SECONDS);

    // Ist bereits ein WLAN gespeichert (jeder Boot nach der Ersteinrichtung),
    // wird der automatische Portal-Fallback bewusst deaktiviert: steht das
    // bekannte Netz gerade nicht zur Verfügung (z.B. Gerät im Keller ohne
    // Empfang), würde autoConnect() sonst bis zu WIFI_SETUP_PORTAL_TIMEOUT_
    // SECONDS (Default 3 Minuten) lang blockieren, bevor Kühl-Logik, Display
    // und Dashboard überhaupt starten - für ein Gerät, das genau für so
    // einen Standort gedacht ist, inakzeptabel. Ohne Portal-Fallback kehrt
    // autoConnect() nach höchstens WIFI_CONNECT_TIMEOUT_SECONDS zurück.
    // Das Portal bleibt nur für die echte Ersteinrichtung (noch kein WLAN
    // gespeichert) bzw. nach einem expliziten "WLAN zurücksetzen" aktiv -
    // dort steht der Nutzer ja gerade direkt davor.
    wm.setEnableConfigPortal(!wm.getWiFiIsSaved());

    bool connected = wm.autoConnect(WIFI_SETUP_AP_NAME);
    return connected;
}

void retryIfDisconnected(uint32_t nowMillis) {
    if (isConnected()) { lastRetryMillis = nowMillis; return; }
    if (lastRetryMillis != 0 && (uint32_t)(nowMillis - lastRetryMillis) < WIFI_RECONNECT_INTERVAL_MS) return;
    lastRetryMillis = nowMillis;
    WiFi.reconnect();
}

void resetAndRestart() {
    wm.resetSettings();
    delay(500);
    ESP.restart();
}

bool isConnected() {
    return WiFi.status() == WL_CONNECTED;
}

int rssi() {
    if (!isConnected()) return 0;
    return WiFi.RSSI();
}

} // namespace wifi_setup
