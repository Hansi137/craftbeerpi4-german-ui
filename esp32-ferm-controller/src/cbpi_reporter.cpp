#include "cbpi_reporter.h"
#include "wifi_setup.h"

#include <Arduino.h>
#include <HTTPClient.h>
#include <math.h>

namespace {
uint32_t lastReportMillis = 0;
bool everReported = false;
}

namespace cbpi_reporter {

void reportIfDue(const Settings& settings, float currentTempC, uint32_t nowMillis) {
    if (!settings.cbpiReportEnabled) return;
    if (strlen(settings.cbpiHost) == 0 || strlen(settings.cbpiKey) == 0) return;
    if (!wifi_setup::isConnected()) return;

    uint32_t intervalMs = settings.cbpiReportIntervalSeconds * 1000UL;
    // Unsigned-Subtraktion - überlaufsicher auch über den millis()-Wraparound
    // nach ca. 49 Tagen hinweg.
    if (everReported && (uint32_t)(nowMillis - lastReportMillis) < intervalMs) {
        return;
    }

    if (isnan(currentTempC)) {
        Serial.println("[CBPI-Reporter] Kein gueltiger Messwert - Meldung uebersprungen");
        return;
    }
    if (currentTempC < 0.0f) {
        // Negative Temperaturen passen nicht in das von CraftBeerPi erlaubte
        // Wertformat (kein '-' erlaubt) - bewusst überspringen statt eine
        // ungültige Anfrage zu senden.
        Serial.println("[CBPI-Reporter] Negative Temperatur kann nicht gemeldet werden (CraftBeerPi-Format erlaubt kein '-') - Meldung uebersprungen");
        return;
    }

    char valueStr[11];
    // Eine Nachkommastelle, max. 10 Zeichen laut CraftBeerPi-Validierung.
    snprintf(valueStr, sizeof(valueStr), "%.1f", currentTempC);

    String url = "http://" + String(settings.cbpiHost) + ":" + String(settings.cbpiPort) +
                 "/httpsensor/" + String(settings.cbpiKey) + "/" + String(valueStr);

    HTTPClient http;
    http.setTimeout(4000);
    if (http.begin(url)) {
        int code = http.GET();
        if (code != 204) {
            Serial.printf("[CBPI-Reporter] Unerwarteter Status %d beim Melden an %s\n", code, url.c_str());
        }
        http.end();
    } else {
        Serial.println("[CBPI-Reporter] HTTP-Verbindung konnte nicht aufgebaut werden");
    }

    lastReportMillis = nowMillis;
    everReported = true;
}

} // namespace cbpi_reporter
