#include "relay_output.h"
#include "config.h"
#include <Arduino.h>

namespace {
int pinLevelFor(bool on, bool activeHigh) {
    bool physicalHigh = activeHigh ? on : !on;
    return physicalHigh ? HIGH : LOW;
}
}

void RelayOutput::begin(bool initialActiveHigh) {
    activeHigh = initialActiveHigh;
    pinMode(PIN_RELAY, OUTPUT);
    // Sicherer Start: Relais immer AUS, unabhängig davon, was vor dem
    // Neustart war (siehe cooling_control.h - der Mindest-Ausschaltzeit-
    // Timer beginnt bei jedem Boot bewusst neu, genau deshalb).
    relayOn = false;
    digitalWrite(PIN_RELAY, pinLevelFor(false, activeHigh));
}

void RelayOutput::setOn(bool on) {
    relayOn = on;
    digitalWrite(PIN_RELAY, pinLevelFor(on, activeHigh));
}

void RelayOutput::setActiveHigh(bool newActiveHigh) {
    if (activeHigh == newActiveHigh) return;
    activeHigh = newActiveHigh;
    // Aktuellen logischen Zustand sofort mit der neuen Polarität neu auf
    // den physischen Pin anwenden, statt auf das nächste setOn() zu warten -
    // sonst könnte der Pin kurzzeitig den falschen physischen Pegel für den
    // aktuellen logischen Zustand zeigen.
    digitalWrite(PIN_RELAY, pinLevelFor(relayOn, activeHigh));
}
