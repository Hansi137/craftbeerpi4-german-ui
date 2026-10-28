#include "web_server.h"
#include "app_state.h"
#include "persistence.h"
#include "wifi_setup.h"
#include "history.h"
#include "config.h"

#include <LittleFS.h>
#include <ESPAsyncWebServer.h>
#include <AsyncJson.h>
#include <ArduinoJson.h>
#include <Arduino.h>

namespace {

AsyncWebServer server(80);

const char* stateToString(ScheduleState s) {
    switch (s) {
        case ScheduleState::IDLE: return "IDLE";
        case ScheduleState::RUNNING: return "RUNNING";
        case ScheduleState::FINISHED: return "FINISHED";
        case ScheduleState::MANUAL: return "MANUAL";
    }
    return "IDLE";
}

void sendJson(AsyncWebServerRequest* request, int code, JsonDocument& doc) {
    String body;
    serializeJson(doc, body);
    request->send(code, "application/json", body);
}

void sendOk(AsyncWebServerRequest* request) {
    JsonDocument doc;
    doc["status"] = "ok";
    sendJson(request, 200, doc);
}

void sendError(AsyncWebServerRequest* request, int code, const char* message) {
    JsonDocument doc;
    doc["error"] = message;
    sendJson(request, code, doc);
}

void scheduleToJson(const Schedule& s, JsonDocument& doc) {
    doc["name"] = s.name;
    JsonArray steps = doc["steps"].to<JsonArray>();
    for (int i = 0; i < s.stepCount; i++) {
        JsonObject step = steps.add<JsonObject>();
        step["name"] = s.steps[i].name;
        step["targetTempC"] = s.steps[i].targetTempC;
        step["durationDays"] = s.steps[i].durationSeconds / 86400UL;
        step["durationHours"] = (s.steps[i].durationSeconds % 86400UL) / 3600UL;
        step["rampToNext"] = s.steps[i].rampToNext;
    }
}

// Liest ein Schedule-Objekt aus einem geparsten JsonVariant. Gibt false
// zurück, wenn die Struktur ungültig ist (kein "steps"-Array).
bool scheduleFromJson(JsonVariant json, Schedule& out) {
    if (!json.is<JsonObject>()) return false;
    JsonObject obj = json.as<JsonObject>();
    if (!obj["steps"].is<JsonArray>()) return false;

    const char* name = obj["name"] | "Gaerplan";
    strncpy(out.name, name, sizeof(out.name) - 1);
    out.name[sizeof(out.name) - 1] = '\0';

    JsonArray steps = obj["steps"].as<JsonArray>();
    int i = 0;
    for (JsonObject step : steps) {
        if (i >= MAX_SCHEDULE_STEPS) break;
        const char* stepName = step["name"] | "Schritt";
        strncpy(out.steps[i].name, stepName, sizeof(out.steps[i].name) - 1);
        out.steps[i].name[sizeof(out.steps[i].name) - 1] = '\0';
        out.steps[i].targetTempC = step["targetTempC"] | 20.0f;
        uint32_t days = step["durationDays"] | 0;
        uint32_t hours = step["durationHours"] | 0;
        out.steps[i].durationSeconds = (days * 24UL + hours) * 3600UL;
        out.steps[i].rampToNext = step["rampToNext"] | false;
        i++;
    }
    out.stepCount = i;
    return true;
}

void handleGetStatus(AsyncWebServerRequest* request) {
    JsonDocument doc;
    if (appState.sensorOk) {
        doc["currentTempC"] = appState.currentTempC;
    } else {
        doc["currentTempC"] = nullptr;
    }
    doc["sensorOk"] = appState.sensorOk;
    doc["effectiveTargetTempC"] = appState.effectiveTargetTempC;
    doc["relayOn"] = appState.relayOn;
    doc["guardActive"] = appState.guardActive;
    doc["guardSecondsRemaining"] = appState.guardSecondsRemaining;

    doc["scheduleState"] = stateToString(appState.progress.state);
    doc["currentStepIndex"] = appState.progress.currentStepIndex;
    if (appState.progress.currentStepIndex >= 0 &&
        appState.progress.currentStepIndex < appState.schedule.stepCount) {
        const ScheduleStep& step = appState.schedule.steps[appState.progress.currentStepIndex];
        doc["currentStepName"] = step.name;
        doc["stepDurationSeconds"] = step.durationSeconds;
    } else {
        doc["currentStepName"] = nullptr;
        doc["stepDurationSeconds"] = 0;
    }
    doc["stepElapsedSeconds"] = appState.progress.stepElapsedSeconds;
    doc["stepCount"] = appState.schedule.stepCount;

    doc["manualOverrideActive"] = appState.manualOverrideActive;
    doc["manualRequestOn"] = appState.manualRequestOn;

    doc["wifiConnected"] = appState.wifiConnected;
    doc["wifiRssi"] = appState.wifiRssi;
    doc["uptimeSeconds"] = (millis() - appState.bootMillis) / 1000;
    doc["firmwareVersion"] = FIRMWARE_VERSION;

    sendJson(request, 200, doc);
}

void handleGetSchedule(AsyncWebServerRequest* request) {
    JsonDocument doc;
    scheduleToJson(appState.schedule, doc);
    sendJson(request, 200, doc);
}

void handlePutSchedule(AsyncWebServerRequest* request, JsonVariant& json) {
    Schedule newSchedule{};
    if (!scheduleFromJson(json, newSchedule)) {
        sendError(request, 400, "Ungueltiges Gaerplan-Format");
        return;
    }
    appState.schedule = newSchedule;
    if (!persistence::saveSchedule(appState.schedule)) {
        sendError(request, 500, "Gaerplan konnte nicht gespeichert werden");
        return;
    }
    sendOk(request);
}

void handleGetSettings(AsyncWebServerRequest* request) {
    JsonDocument doc;
    const Settings& s = appState.settings;
    doc["onOffsetC"] = s.onOffsetC;
    doc["offOffsetC"] = s.offOffsetC;
    doc["minCompressorOffSeconds"] = s.minCompressorOffSeconds;
    doc["minCompressorOnSeconds"] = s.minCompressorOnSeconds;
    doc["cbpiReportEnabled"] = s.cbpiReportEnabled;
    doc["cbpiHost"] = s.cbpiHost;
    doc["cbpiPort"] = s.cbpiPort;
    doc["cbpiKey"] = s.cbpiKey;
    doc["cbpiReportIntervalSeconds"] = s.cbpiReportIntervalSeconds;
    doc["relayActiveHigh"] = s.relayActiveHigh;
    doc["historyIntervalSeconds"] = s.historyIntervalSeconds;
    sendJson(request, 200, doc);
}

void handlePutSettings(AsyncWebServerRequest* request, JsonVariant& json) {
    if (!json.is<JsonObject>()) {
        sendError(request, 400, "Ungueltiges Einstellungen-Format");
        return;
    }
    JsonObject obj = json.as<JsonObject>();
    Settings s = appState.settings; // mit aktuellen Werten vorbelegen
    s.onOffsetC = obj["onOffsetC"] | s.onOffsetC;
    s.offOffsetC = obj["offOffsetC"] | s.offOffsetC;

    // Sicherheitsgrenze: Mindest-Ausschaltzeit kann über die API NIE unter
    // MIN_COMPRESSOR_OFF_SECONDS_FLOOR gesetzt werden (siehe config.h bzw.
    // cooling_control.h - der Kompressorschutz ist nicht abschaltbar, nur
    // für Testzwecke ohne angeschlossenen Kompressor niedrig einstellbar).
    uint32_t requestedMinOff = obj["minCompressorOffSeconds"] | s.minCompressorOffSeconds;
    s.minCompressorOffSeconds = requestedMinOff < MIN_COMPRESSOR_OFF_SECONDS_FLOOR ? MIN_COMPRESSOR_OFF_SECONDS_FLOOR : requestedMinOff;

    s.minCompressorOnSeconds = obj["minCompressorOnSeconds"] | s.minCompressorOnSeconds;
    s.relayActiveHigh = obj["relayActiveHigh"] | s.relayActiveHigh;
    s.historyIntervalSeconds = obj["historyIntervalSeconds"] | s.historyIntervalSeconds;
    s.cbpiReportEnabled = obj["cbpiReportEnabled"] | s.cbpiReportEnabled;
    if (obj["cbpiHost"].is<const char*>()) {
        strncpy(s.cbpiHost, obj["cbpiHost"], sizeof(s.cbpiHost) - 1);
        s.cbpiHost[sizeof(s.cbpiHost) - 1] = '\0';
    }
    s.cbpiPort = obj["cbpiPort"] | s.cbpiPort;
    if (obj["cbpiKey"].is<const char*>()) {
        strncpy(s.cbpiKey, obj["cbpiKey"], sizeof(s.cbpiKey) - 1);
        s.cbpiKey[sizeof(s.cbpiKey) - 1] = '\0';
    }
    s.cbpiReportIntervalSeconds = obj["cbpiReportIntervalSeconds"] | s.cbpiReportIntervalSeconds;

    appState.settings = s;
    if (!persistence::saveSettings(appState.settings)) {
        sendError(request, 500, "Einstellungen konnten nicht gespeichert werden");
        return;
    }
    sendOk(request);
}

void handleControlStart(AsyncWebServerRequest* request) {
    appState.manualOverrideActive = false;
    appState.progress.state = ScheduleState::RUNNING;
    appState.progress.currentStepIndex = 0;
    appState.progress.stepElapsedSeconds = 0;
    persistence::saveState(appState.progress);
    sendOk(request);
}

void handleControlStop(AsyncWebServerRequest* request) {
    appState.manualOverrideActive = false;
    appState.progress.state = ScheduleState::IDLE;
    persistence::saveState(appState.progress);
    sendOk(request);
}

void handleControlReset(AsyncWebServerRequest* request) {
    appState.manualOverrideActive = false;
    appState.progress.state = ScheduleState::IDLE;
    appState.progress.currentStepIndex = -1;
    appState.progress.stepElapsedSeconds = 0;
    persistence::saveState(appState.progress);
    sendOk(request);
}

void handleControlManual(AsyncWebServerRequest* request, JsonVariant& json) {
    if (!json.is<JsonObject>()) {
        sendError(request, 400, "Ungueltige Anfrage");
        return;
    }
    JsonObject obj = json.as<JsonObject>();
    bool active = obj["active"] | false;
    bool requestOn = obj["relayOn"] | false;

    appState.manualOverrideActive = active;
    appState.manualRequestOn = requestOn;
    if (active) {
        appState.progress.state = ScheduleState::MANUAL;
    } else if (appState.progress.state == ScheduleState::MANUAL) {
        // Manuellen Modus verlassen -> zurueck in den Leerlauf, der Nutzer
        // muss den Gaerplan explizit per "start" wieder aufnehmen.
        appState.progress.state = ScheduleState::IDLE;
    }
    persistence::saveState(appState.progress);
    sendOk(request);
}

void handleWifiReset(AsyncWebServerRequest* request) {
    sendOk(request);
    // Antwort zuerst rausschicken, dann zurücksetzen+neustarten - sonst
    // bekommt der Browser nie eine Antwort auf diesen Request.
    delay(200);
    wifi_setup::resetAndRestart();
}

void handleGetHistoryCsv(AsyncWebServerRequest* request) {
    if (!LittleFS.exists("/history.csv")) {
        sendError(request, 404, "Kein Verlauf vorhanden");
        return;
    }
    AsyncWebServerResponse* response = request->beginResponse(LittleFS, "/history.csv", "text/csv");
    response->addHeader("Content-Disposition", "attachment; filename=\"gaerverlauf.csv\"");
    request->send(response);
}

void handleHistoryClear(AsyncWebServerRequest* request) {
    history::clear();
    sendOk(request);
}

void handleGetInfo(AsyncWebServerRequest* request) {
    JsonDocument doc;
    doc["firmwareVersion"] = FIRMWARE_VERSION;
    doc["chipModel"] = ESP.getChipModel();
    doc["freeHeap"] = ESP.getFreeHeap();
    sendJson(request, 200, doc);
}

} // namespace

namespace web_server {

void begin() {
    // Dashboard-Dateien (einzeln registriert, statt den ganzen LittleFS-
    // Inhalt als statisches Verzeichnis freizugeben - so bleiben
    // schedule.json/settings.json/state.json nur über die strukturierte
    // JSON-API erreichbar, nicht als rohe Dateien).
    server.on("/", HTTP_GET, [](AsyncWebServerRequest* request) {
        request->send(LittleFS, "/index.html", "text/html");
    });
    server.on("/style.css", HTTP_GET, [](AsyncWebServerRequest* request) {
        request->send(LittleFS, "/style.css", "text/css");
    });
    server.on("/app.js", HTTP_GET, [](AsyncWebServerRequest* request) {
        request->send(LittleFS, "/app.js", "application/javascript");
    });

    server.on("/api/status", HTTP_GET, handleGetStatus);
    server.on("/api/schedule", HTTP_GET, handleGetSchedule);
    server.on("/api/settings", HTTP_GET, handleGetSettings);
    server.on("/api/control/start", HTTP_POST, handleControlStart);
    server.on("/api/control/stop", HTTP_POST, handleControlStop);
    server.on("/api/control/reset", HTTP_POST, handleControlReset);
    server.on("/api/wifi/reset", HTTP_POST, handleWifiReset);
    server.on("/api/history.csv", HTTP_GET, handleGetHistoryCsv);
    server.on("/api/history/clear", HTTP_POST, handleHistoryClear);
    server.on("/api/info", HTTP_GET, handleGetInfo);

    auto* scheduleHandler = new AsyncCallbackJsonWebHandler("/api/schedule", handlePutSchedule);
    scheduleHandler->setMethod(HTTP_PUT);
    server.addHandler(scheduleHandler);

    auto* settingsHandler = new AsyncCallbackJsonWebHandler("/api/settings", handlePutSettings);
    settingsHandler->setMethod(HTTP_PUT);
    server.addHandler(settingsHandler);

    auto* manualHandler = new AsyncCallbackJsonWebHandler("/api/control/manual", handleControlManual);
    manualHandler->setMethod(HTTP_POST);
    server.addHandler(manualHandler);

    server.onNotFound([](AsyncWebServerRequest* request) {
        request->send(404, "application/json", "{\"error\":\"not found\"}");
    });

    server.begin();
}

} // namespace web_server
