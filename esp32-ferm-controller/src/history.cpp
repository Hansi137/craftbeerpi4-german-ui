#include "history.h"
#include "app_state.h"
#include "config.h"
#include "time_sync.h"

#include <LittleFS.h>
#include <Arduino.h>

namespace {

const char* HISTORY_PATH = "/history.csv";
const char* HISTORY_TMP_PATH = "/history.tmp";
// "timestamp" bewusst als LETZTE Spalte angehaengt (nicht z.B. direkt hinter
// uptimeSeconds einsortiert): So bleiben bereits vorhandene Zeilen aus einer
// Zeit vor diesem Feature weiterhin korrekt lesbar (ihnen fehlt dann einfach
// das letzte Feld, alle anderen Spalten bleiben an derselben Position) -
// Excel/Sheets/pandas behandeln eine fehlende letzte Spalte klaglos als
// leer, statt die uebrigen Werte zu verschieben.
const char* CSV_HEADER = "uptimeSeconds,tempC,targetTempC,relayOn,scheduleState,stepIndex,stepElapsedSeconds,sensorFailFallbackActive,timestamp";

uint32_t lastRecordMillis = 0;
bool downloadInProgress = false;

const char* stateToString(ScheduleState s) {
    switch (s) {
        case ScheduleState::IDLE: return "IDLE";
        case ScheduleState::RUNNING: return "RUNNING";
        case ScheduleState::FINISHED: return "FINISHED";
        case ScheduleState::MANUAL: return "MANUAL";
    }
    return "IDLE";
}

void writeHeaderOnly() {
    File f = LittleFS.open(HISTORY_PATH, "w");
    if (!f) return;
    f.println(CSV_HEADER);
    f.close();
}

// Verdichtet die Verlaufsdatei, wenn sie HISTORY_MAX_BYTES überschreitet:
// verwirft die ältere Hälfte der Messpunkte. Arbeitet zeilenweise/streamend
// statt die Datei komplett in den (auf dem ESP32-S3 ohne PSRAM knappen) RAM
// zu laden - bei HISTORY_MAX_BYTES im mehreren 100-KB-Bereich würde ein
// kompletter In-Memory-Load den freien Heap sprengen.
void compactIfTooLarge() {
    // Siehe history.h (setDownloadInProgress): remove()+rename() der Datei
    // waehrend ein Download laeuft wuerde dessen offene Leseanfrage auf
    // genau diesen Pfad ins Leere laufen lassen - lieber einen Zyklus
    // warten, die naechste Verdichtung holt das nach.
    if (downloadInProgress) return;

    File f = LittleFS.open(HISTORY_PATH, "r");
    if (!f) return;
    if (f.size() <= HISTORY_MAX_BYTES) { f.close(); return; }

    // 1. Durchlauf: Datenzeilen zählen (Kopfzeile nicht mitgezählt).
    f.readStringUntil('\n');
    uint32_t totalLines = 0;
    while (f.available()) {
        f.readStringUntil('\n');
        totalLines++;
    }
    f.close();

    uint32_t linesToDrop = totalLines / 2;

    // 2. Durchlauf: Kopfzeile + jüngere Hälfte in eine Temp-Datei kopieren.
    f = LittleFS.open(HISTORY_PATH, "r");
    if (!f) return;
    File out = LittleFS.open(HISTORY_TMP_PATH, "w");
    if (!out) { f.close(); return; }

    out.println(f.readStringUntil('\n'));

    uint32_t skipped = 0;
    while (f.available()) {
        String line = f.readStringUntil('\n');
        if (skipped < linesToDrop) { skipped++; continue; }
        if (line.length() == 0) continue;
        out.println(line);
    }
    f.close();
    out.close();

    LittleFS.remove(HISTORY_PATH);
    LittleFS.rename(HISTORY_TMP_PATH, HISTORY_PATH);
}

// Einmalige Migration fuer den Fall, dass die Kopfzeile einer bereits
// bestehenden Datei (aus einer Firmware-Version vor einer Spaltenaenderung,
// z.B. dem Hinzufuegen von "timestamp") nicht mehr zu CSV_HEADER passt -
// reiner Firmware-Flash fasst /history.csv ja nicht an, die alte Kopfzeile
// bleibt sonst dauerhaft stehen, obwohl neue Zeilen schon mehr Spalten
// haben. Ersetzt NUR die erste Zeile, alle Datenzeilen bleiben unveraendert
// (alte Zeilen haben dann einfach weniger Felder als die neue Kopfzeile -
// siehe Kommentar bei CSV_HEADER).
void migrateHeaderIfNeeded() {
    File f = LittleFS.open(HISTORY_PATH, "r");
    if (!f) return;
    String firstLine = f.readStringUntil('\n');
    firstLine.trim();
    if (firstLine == CSV_HEADER) { f.close(); return; }

    File out = LittleFS.open(HISTORY_TMP_PATH, "w");
    if (!out) { f.close(); return; }
    out.println(CSV_HEADER);
    while (f.available()) {
        String line = f.readStringUntil('\n');
        if (line.length() == 0) continue;
        out.println(line);
    }
    f.close();
    out.close();

    LittleFS.remove(HISTORY_PATH);
    LittleFS.rename(HISTORY_TMP_PATH, HISTORY_PATH);
}

} // namespace

namespace history {

void begin() {
    if (!LittleFS.exists(HISTORY_PATH)) {
        writeHeaderOnly();
        return;
    }
    migrateHeaderIfNeeded();
}

void recordIfDue(uint32_t nowMillis) {
    uint32_t intervalMs = appState.settings.historyIntervalSeconds * 1000UL;
    if (intervalMs == 0) return; // 0 = Aufzeichnung deaktiviert
    if (lastRecordMillis != 0 && (uint32_t)(nowMillis - lastRecordMillis) < intervalMs) return;
    lastRecordMillis = nowMillis;

    File f = LittleFS.open(HISTORY_PATH, "a");
    if (!f) return;
    f.print((nowMillis - appState.bootMillis) / 1000);
    f.print(',');
    if (appState.sensorOk) f.print(appState.currentTempC, 2);
    f.print(',');
    f.print(appState.effectiveTargetTempC, 2);
    f.print(',');
    f.print(appState.relayOn ? 1 : 0);
    f.print(',');
    f.print(stateToString(appState.progress.state));
    f.print(',');
    f.print(appState.progress.currentStepIndex);
    f.print(',');
    f.print(appState.progress.stepElapsedSeconds);
    f.print(',');
    f.print(appState.sensorFailFallbackActive ? 1 : 0);
    f.print(',');
    f.println(time_sync::isoTimestamp()); // leer, falls Uhrzeit (noch) nicht per NTP synchronisiert
    f.close();

    compactIfTooLarge();
}

void clear() {
    writeHeaderOnly();
    lastRecordMillis = 0;
}

void setDownloadInProgress(bool inProgress) {
    downloadInProgress = inProgress;
}

} // namespace history
