#include "persistence.h"
#include "config.h"

#include <LittleFS.h>
#include <ArduinoJson.h>
#include <string.h>

namespace {

const char* SCHEDULE_PATH = "/schedule.json";
const char* SETTINGS_PATH = "/settings.json";
const char* STATE_PATH = "/state.json";
const char* SCHEDULE_DEFAULT_PATH = "/schedule.default.json";
const char* SETTINGS_DEFAULT_PATH = "/settings.default.json";

bool fileReadableAndNonEmpty(const char* path) {
    if (!LittleFS.exists(path)) return false;
    File f = LittleFS.open(path, "r");
    if (!f) return false;
    bool ok = f.size() > 0;
    f.close();
    return ok;
}

// Kopiert src nach dst (byteweise), falls dst fehlt oder leer ist.
void ensureFromDefault(const char* dst, const char* src) {
    if (fileReadableAndNonEmpty(dst)) return;
    if (!LittleFS.exists(src)) return; // kein Default vorhanden - nichts zu tun
    File in = LittleFS.open(src, "r");
    if (!in) return;
    File out = LittleFS.open(dst, "w");
    if (!out) { in.close(); return; }
    uint8_t buf[128];
    size_t n;
    while ((n = in.read(buf, sizeof(buf))) > 0) {
        out.write(buf, n);
    }
    in.close();
    out.close();
}

void copyName(char* dst, size_t dstLen, const char* src) {
    strncpy(dst, src, dstLen - 1);
    dst[dstLen - 1] = '\0';
}

} // namespace

namespace persistence {

bool begin() {
    if (!LittleFS.begin(true)) { // true = beim ersten Mal automatisch formatieren
        return false;
    }
    ensureFromDefault(SCHEDULE_PATH, SCHEDULE_DEFAULT_PATH);
    ensureFromDefault(SETTINGS_PATH, SETTINGS_DEFAULT_PATH);
    return true;
}

bool loadSchedule(Schedule& out) {
    out.stepCount = 0;
    copyName(out.name, sizeof(out.name), "Gaerplan");

    File f = LittleFS.open(SCHEDULE_PATH, "r");
    if (!f) return false;

    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, f);
    f.close();
    if (err) return false;

    const char* name = doc["name"] | "Gaerplan";
    copyName(out.name, sizeof(out.name), name);

    JsonArrayConst steps = doc["steps"].as<JsonArrayConst>();
    int i = 0;
    for (JsonObjectConst step : steps) {
        if (i >= MAX_SCHEDULE_STEPS) break;
        const char* stepName = step["name"] | "Schritt";
        copyName(out.steps[i].name, sizeof(out.steps[i].name), stepName);
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

bool saveSchedule(const Schedule& s) {
    JsonDocument doc;
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

    File f = LittleFS.open(SCHEDULE_PATH, "w");
    if (!f) return false;
    bool ok = serializeJson(doc, f) > 0;
    f.close();
    return ok;
}

bool loadSettings(Settings& out) {
    // Sichere Defaults zuerst setzen, falls die Datei nur teilweise gültig ist.
    out.onOffsetC = DEFAULT_ON_OFFSET_C;
    out.offOffsetC = DEFAULT_OFF_OFFSET_C;
    out.minCompressorOffSeconds = DEFAULT_MIN_COMPRESSOR_OFF_SECONDS;
    out.minCompressorOnSeconds = DEFAULT_MIN_COMPRESSOR_ON_SECONDS;
    out.cbpiReportEnabled = false;
    copyName(out.cbpiHost, sizeof(out.cbpiHost), "");
    out.cbpiPort = 8000;
    copyName(out.cbpiKey, sizeof(out.cbpiKey), "");
    out.cbpiReportIntervalSeconds = DEFAULT_CBPI_REPORT_INTERVAL_SECONDS;

    File f = LittleFS.open(SETTINGS_PATH, "r");
    if (!f) return false;

    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, f);
    f.close();
    if (err) return false;

    out.onOffsetC = doc["onOffsetC"] | DEFAULT_ON_OFFSET_C;
    out.offOffsetC = doc["offOffsetC"] | DEFAULT_OFF_OFFSET_C;

    // Sicherheitsgrenze: Mindest-Ausschaltzeit kann aus der Datei NIE unter
    // MIN_COMPRESSOR_OFF_SECONDS_FLOOR geladen werden, egal was dort steht
    // (z.B. durch manuelle Dateibearbeitung). Siehe auch die Klemmung beim
    // Speichern über die Web-API in web_server.cpp - diese Prüfung hier ist
    // die zweite, unabhängige Absicherung direkt an der Quelle.
    uint32_t minOff = doc["minCompressorOffSeconds"] | DEFAULT_MIN_COMPRESSOR_OFF_SECONDS;
    out.minCompressorOffSeconds = minOff < MIN_COMPRESSOR_OFF_SECONDS_FLOOR ? MIN_COMPRESSOR_OFF_SECONDS_FLOOR : minOff;

    out.minCompressorOnSeconds = doc["minCompressorOnSeconds"] | DEFAULT_MIN_COMPRESSOR_ON_SECONDS;
    out.cbpiReportEnabled = doc["cbpiReportEnabled"] | false;
    copyName(out.cbpiHost, sizeof(out.cbpiHost), doc["cbpiHost"] | "");
    out.cbpiPort = doc["cbpiPort"] | 8000;
    copyName(out.cbpiKey, sizeof(out.cbpiKey), doc["cbpiKey"] | "");
    out.cbpiReportIntervalSeconds = doc["cbpiReportIntervalSeconds"] | DEFAULT_CBPI_REPORT_INTERVAL_SECONDS;
    return true;
}

bool saveSettings(const Settings& s) {
    JsonDocument doc;
    doc["onOffsetC"] = s.onOffsetC;
    doc["offOffsetC"] = s.offOffsetC;
    // Dieselbe Mindestgrenze gilt beim Speichern (siehe loadSettings).
    doc["minCompressorOffSeconds"] = s.minCompressorOffSeconds < MIN_COMPRESSOR_OFF_SECONDS_FLOOR ? MIN_COMPRESSOR_OFF_SECONDS_FLOOR : s.minCompressorOffSeconds;
    doc["minCompressorOnSeconds"] = s.minCompressorOnSeconds;
    doc["cbpiReportEnabled"] = s.cbpiReportEnabled;
    doc["cbpiHost"] = s.cbpiHost;
    doc["cbpiPort"] = s.cbpiPort;
    doc["cbpiKey"] = s.cbpiKey;
    doc["cbpiReportIntervalSeconds"] = s.cbpiReportIntervalSeconds;

    File f = LittleFS.open(SETTINGS_PATH, "w");
    if (!f) return false;
    bool ok = serializeJson(doc, f) > 0;
    f.close();
    return ok;
}

bool loadState(ScheduleProgress& out) {
    out.state = ScheduleState::IDLE;
    out.currentStepIndex = -1;
    out.stepElapsedSeconds = 0;

    File f = LittleFS.open(STATE_PATH, "r");
    if (!f) return false;

    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, f);
    f.close();
    if (err) return false;

    uint8_t stateVal = doc["state"] | 0;
    out.state = static_cast<ScheduleState>(stateVal);
    out.currentStepIndex = doc["currentStepIndex"] | -1;
    out.stepElapsedSeconds = doc["stepElapsedSeconds"] | 0;
    return true;
}

bool saveState(const ScheduleProgress& s) {
    JsonDocument doc;
    doc["state"] = static_cast<uint8_t>(s.state);
    doc["currentStepIndex"] = s.currentStepIndex;
    doc["stepElapsedSeconds"] = s.stepElapsedSeconds;

    File f = LittleFS.open(STATE_PATH, "w");
    if (!f) return false;
    bool ok = serializeJson(doc, f) > 0;
    f.close();
    return ok;
}

} // namespace persistence
