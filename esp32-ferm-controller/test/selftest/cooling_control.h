// cooling_control.h
//
// Reine, hardware-unabhängige Kühl-Hysterese-Logik mit zwingendem
// Kompressorschutz (Mindest-Ausschaltzeit). Keine Arduino-/ESP32-Includes -
// diese Datei lässt sich auf jedem Rechner mit einem normalen C++-Compiler
// kompilieren und testen, ganz ohne angeschlossene Hardware.
//
// WICHTIG (Sicherheit): Die Mindest-Ausschaltzeit (minCompressorOffSeconds)
// wird in evaluateCoolingRelay() IMMER geprüft, auch bei einer manuellen
// "AN"-Anfrage (requestOn=true im manuellen Modus). Es gibt absichtlich
// keinen Parameter und keinen Codepfad, der diese Prüfung umgehen kann -
// das schützt den Kompressor des Kühlschranks auch vor Fehlbedienung.

#pragma once

#include <cstdint>

struct CoolingInputs {
    float currentTempC;
    float targetTempC;
    float onOffsetC;              // Relais AN, wenn currentTemp >= target + onOffsetC
    float offOffsetC;             // Relais AUS, wenn currentTemp <= target - offOffsetC
    bool  relayCurrentlyOn;
    uint32_t secondsSinceLastOff;     // Zeit seit dem letzten AUS-Schalten
    uint32_t minCompressorOffSeconds; // Mindest-Pause, bevor erneut eingeschaltet werden darf
    bool  manualOverrideActive;       // true = manueller Modus
    bool  manualRequestOn;            // im manuellen Modus: gewünschter Zielzustand
};

// Ergebnis einer Auswertung - enthält nicht nur das Relais-Soll, sondern auch
// Zusatzinfos fürs Dashboard (z.B. "Schutz aktiv, noch X Sekunden").
struct CoolingDecision {
    bool relayShouldBeOn;
    bool blockedByMinOffGuard;  // true, wenn ein AN-Wunsch gerade durch die Mindestzeit verhindert wird
    uint32_t guardSecondsRemaining; // nur gültig, wenn blockedByMinOffGuard == true
};

// Wertet die aktuelle Situation aus und liefert, ob das Relais an- oder
// ausgeschaltet sein soll. Reine Funktion - kein Seiteneffekt, kein Zugriff
// auf echte Hardware oder globalen Zustand.
CoolingDecision evaluateCoolingRelay(const CoolingInputs& in);
