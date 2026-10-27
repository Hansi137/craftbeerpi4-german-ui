// schedule.h
//
// Reine, hardware-unabhängige Gärplan-Logik (Fortschritt, Rampen-
// Interpolation). Keine Arduino-/ESP32-Includes, kein Dateizugriff - nur
// Datenstrukturen und reine Funktionen. JSON-(De-)Serialisierung und
// Dateizugriff passieren in persistence.cpp/web_server.cpp, nicht hier.
//
// Fortschritt wird in Sekunden seit Schrittbeginn gezählt (millis()-Delta),
// nicht als Wall-Clock-Zeitstempel - der ESP32 hat ohne Internet/NTP keine
// verlässliche Uhrzeit, und die Logik soll auch komplett offline korrekt
// funktionieren.

#pragma once

#include <cstdint>

// Großzügige Obergrenze für die Anzahl Gärplan-Schritte - reicht für jeden
// realistischen Gärplan und hält die Datenstruktur fix-größig (keine
// dynamische Allokation nötig).
static const int MAX_SCHEDULE_STEPS = 20;
static const int SCHEDULE_STEP_NAME_LEN = 32;

struct ScheduleStep {
    char name[SCHEDULE_STEP_NAME_LEN];
    float targetTempC;
    uint32_t durationSeconds;  // aus Tage+Stunden im UI berechnet
    bool rampToNext;           // lineare Rampe zur Zieltemperatur des nächsten Schritts
};

struct Schedule {
    char name[SCHEDULE_STEP_NAME_LEN];
    ScheduleStep steps[MAX_SCHEDULE_STEPS];
    int stepCount;
};

enum class ScheduleState : uint8_t {
    IDLE,      // kein Plan aktiv, Relais folgt keiner Zieltemperatur
    RUNNING,   // Plan läuft, aktueller Schritt zählt
    FINISHED,  // letzter Schritt abgeschlossen, hält dessen Zieltemperatur
    MANUAL     // manuelle Übersteuerung aktiv (Plan pausiert gedanklich)
};

struct ScheduleProgress {
    ScheduleState state;
    int currentStepIndex;        // -1, wenn kein Schritt aktiv (IDLE)
    uint32_t stepElapsedSeconds; // verstrichene Zeit im aktuellen Schritt
};

// Effektive Zieltemperatur für den aktuell aktiven Schritt - bei
// rampToNext==true linear von step.targetTempC zu nextStep.targetTempC über
// die Dauer des Schritts interpoliert, sonst einfach step.targetTempC.
float effectiveTargetTempC(const ScheduleStep& step, bool hasNextStep,
                            const ScheduleStep& nextStep, uint32_t elapsedSeconds);

// Lässt den Fortschritt um deltaSeconds weiterlaufen (nur im Zustand
// RUNNING - IDLE/FINISHED/MANUAL bleiben unverändert). Springt bei Bedarf
// über mehrere abgelaufene Schritte (z.B. nach langem Stromausfall).
// Nach dem letzten Schritt wechselt der Zustand zu FINISHED und
// currentStepIndex bleibt auf dem letzten Schritt stehen (für die
// Zieltemperatur-Anzeige), stepElapsedSeconds wird auf dessen Dauer geklemmt.
ScheduleProgress advanceSchedule(const Schedule& schedule, ScheduleProgress progress,
                                   uint32_t deltaSeconds);
