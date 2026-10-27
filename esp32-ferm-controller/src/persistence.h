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

} // namespace persistence
