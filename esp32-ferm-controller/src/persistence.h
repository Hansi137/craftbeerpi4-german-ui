// persistence.h
//
// LittleFS-Persistenz für Gärplan, Einstellungen und Laufzeit-Zustand.
// WLAN-Zugangsdaten werden NICHT hier verwaltet - die übernimmt WiFiManager
// komplett eigenständig im NVS (siehe wifi_setup.h).

#pragma once

#include "schedule.h"
#include <cstdint>

struct Settings {
    float onOffsetC;
    float offOffsetC;
    uint32_t minCompressorOffSeconds;
    uint32_t minCompressorOnSeconds;
    bool cbpiReportEnabled;
    char cbpiHost[64];
    uint16_t cbpiPort;
    char cbpiKey[16];
    uint32_t cbpiReportIntervalSeconds;
    // Relais-Polarität zur Laufzeit umschaltbar (analog zur "Invertiert"-
    // Option bei CraftBeerPi-GPIO-Aktoren) - überschreibt den Default aus
    // config.h (RELAY_ACTIVE_HIGH), ohne dass neu geflasht werden muss.
    bool relayActiveHigh;
    // Intervall für den Gärungsverlauf-Logger (history.*), in Sekunden.
    // 0 schaltet die Aufzeichnung ab.
    uint32_t historyIntervalSeconds;
    // Bei Sensorausfall: fester An/Aus-Takt statt Komplettabschaltung der
    // Kühlung (siehe cooling_control.h evaluateFallbackRelay). false = altes
    // Verhalten (Kühlung bleibt sicherheitshalber ganz aus, bis der Sensor
    // wieder Werte liefert).
    bool sensorFailFallbackEnabled;
};

// Zuletzt beobachtete reale An-/Ausschaltdauer des Relais, während der
// Sensor noch gültige Werte lieferte - wird von main.cpp laufend aktualisiert
// und hier persistiert, damit sie einen Neustart während eines Sensorausfalls
// überlebt (sonst würde jeder Reboot während eines laufenden Ausfalls auf die
// generischen Bootstrap-Werte aus config.h zurückfallen).
struct FallbackCycle {
    uint32_t onSeconds;
    uint32_t offSeconds;
};

namespace persistence {

// Muss einmalig in setup() aufgerufen werden, bevor die anderen Funktionen
// benutzt werden. Mountet LittleFS und kopiert data/schedule.default.json
// bzw. data/settings.default.json, falls die eigentlichen Dateien fehlen
// oder nicht lesbar sind (Selbstheilung bei leerem/beschädigtem Dateisystem).
bool begin();

bool loadSchedule(Schedule& out);
bool saveSchedule(const Schedule& s);

bool loadSettings(Settings& out);
bool saveSettings(const Settings& s);

bool loadState(ScheduleProgress& out);
bool saveState(const ScheduleProgress& s);

bool loadFallbackCycle(FallbackCycle& out);
bool saveFallbackCycle(const FallbackCycle& c);

} // namespace persistence
