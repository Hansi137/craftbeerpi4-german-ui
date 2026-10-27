#include "wifi_setup.h"
#include "config.h"

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiManager.h>

namespace {
WiFiManager wm;
}

namespace wifi_setup {

bool connect() {
    wm.setConfigPortalTimeout(WIFI_SETUP_PORTAL_TIMEOUT_SECONDS);
    // autoConnect versucht zuerst die gespeicherten Zugangsdaten. Klappt das
    // nicht (keine gespeichert, oder das bekannte Netz ist nicht in
    // Reichweite), öffnet es automatisch den Einrichtungs-Access-Point mit
    // dem hier angegebenen Namen und kehrt erst zurück, wenn der Nutzer
    // etwas eingetragen hat oder das Portal-Timeout erreicht ist.
    bool connected = wm.autoConnect(WIFI_SETUP_AP_NAME);
    return connected;
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
