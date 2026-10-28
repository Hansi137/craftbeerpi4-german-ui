// history.h
//
// Protokolliert periodisch Temperatur/Ziel/Relais-Status als CSV auf
// LittleFS - Grundlage für den "Gärungsverlauf"-Export im Dashboard. Rein
// additiv zur Regelkreis-Logik: liest appState nur lesend, beeinflusst keine
// Regelentscheidung.

#pragma once

#include <cstdint>

namespace history {

// Einmalig in setup() aufrufen - legt /history.csv mit Kopfzeile an, falls
// sie noch nicht existiert.
void begin();

// Aus dem Regelkreis heraus regelmäßig aufrufen (z.B. jeden Control-Loop-
// Tick) - schreibt intern nur dann tatsächlich einen Datenpunkt, wenn seit
// dem letzten das in den Einstellungen konfigurierte Intervall vergangen
// ist. historyIntervalSeconds == 0 schaltet die Aufzeichnung ab.
void recordIfDue(uint32_t nowMillis);

// Leert den Verlauf (Kopfzeile bleibt erhalten) - z.B. für einen neuen Sud.
void clear();

} // namespace history
