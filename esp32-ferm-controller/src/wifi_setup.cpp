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
    wm.setConfigPortalTimeout(WIFI_SETUP_PORTAL_TIMEOUT_SECONDS);

    if (wm.getWiFiIsSaved()) {
        // Schon mal eingerichtet (jeder Boot nach der Ersteinrichtung): NUR
        // kurz und FEST BEGRENZT versuchen, mit einer eigenen millis()-
        // Schleife statt über wm.autoConnect()/setConnectTimeout() - ein
        // früherer Versuch, das über WiFiManagers eigenes Timeout-Handling
        // zu lösen, blieb live auf dem Gerät hängen und brauchte einen
        // manuellen Reset, vermutlich abhängig von internem
        // WiFiManager-/IDF-Verhalten, das sich von hier aus nicht zuverlässig
        // nachvollziehen lässt. Diese Schleife hier hat eine garantierte
        // Obergrenze (WIFI_CONNECT_TIMEOUT_SECONDS) und hängt von nichts
        // anderem ab als WiFi.status(). KEIN automatisches Einrichtungs-
        // Portal, falls das bekannte Netz gerade nicht erreichbar ist (z.B.
        // Gerät im Keller) - Kühl-Logik/Display/Dashboard starten danach so
        // oder so.
        WiFi.mode(WIFI_STA);
        WiFi.begin(); // nutzt die zuletzt gespeicherten Zugangsdaten aus dem Flash
        uint32_t startMillis = millis();
        while (WiFi.status() != WL_CONNECTED &&
               (uint32_t)(millis() - startMillis) < (uint32_t)WIFI_CONNECT_TIMEOUT_SECONDS * 1000UL) {
            delay(100);
        }
        return WiFi.status() == WL_CONNECTED;
    }

    // Noch nie eingerichtet (bzw. nach einem "WLAN zurücksetzen") - jetzt
    // macht das Einrichtungs-Portal Sinn, der Nutzer steht ja gerade direkt
    // davor. Dieser Pfad ist unverändert der schon mehrfach live getestete.
    return wm.autoConnect(WIFI_SETUP_AP_NAME);
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
