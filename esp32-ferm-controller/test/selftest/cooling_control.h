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

// Fallback-Takt für den Fall, dass der Temperatursensor ausgefallen ist:
// ohne gültigen Messwert kann die normale Hysterese nicht mehr entscheiden.
// Statt die Kühlung komplett abzuschalten (und den Inhalt tagelang unbemerkt
// aufwärmen zu lassen, falls niemand vor Ort ist), schaltet das Relais nach
// einem festen An/Aus-Takt - typischerweise aus dem zuletzt beobachteten
// normalen Kühlzyklus abgeleitet (siehe main.cpp). Der Kompressorschutz
// (Mindest-Ein-/Ausschaltzeit) gilt hier genauso zwingend wie im Normalbetrieb.
struct FallbackInputs {
    bool  relayCurrentlyOn;
    uint32_t secondsSinceLastOn;       // Zeit seit dem letzten EIN-Schalten
    uint32_t secondsSinceLastOff;      // Zeit seit dem letzten AUS-Schalten
    uint32_t fallbackOnSeconds;        // Ziel-Einschaltdauer je Takt
    uint32_t fallbackOffSeconds;       // Ziel-Ausschaltdauer je Takt
    uint32_t minCompressorOffSeconds;  // Kompressorschutz - gilt auch im Fallback
    uint32_t minCompressorOnSeconds;
};

CoolingDecision evaluateFallbackRelay(const FallbackInputs& in);

// Rein kosmetische Einordnung der aktuellen Temperatur fuer die Anzeige
// (Dashboard/Display): nutzt dieselben Hysterese-Schwellen wie
// evaluateCoolingRelay(), damit die Farbe exakt zur echten Regel-Logik
// passt - WARM ab demselben Punkt, an dem die Kuehlung einschalten wuerde,
// COLD ab demselben Punkt, an dem sie ausschalten wuerde, dazwischen OK.
enum class TempZone { UNKNOWN, COLD, OK, WARM };

TempZone classifyTempZone(float currentTempC, float targetTempC,
                           float onOffsetC, float offOffsetC, bool sensorOk);
