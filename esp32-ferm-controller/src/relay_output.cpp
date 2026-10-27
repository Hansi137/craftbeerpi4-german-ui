#include "relay_output.h"
#include "config.h"
#include <Arduino.h>

namespace {
int pinLevelFor(bool on) {
    bool physicalHigh = RELAY_ACTIVE_HIGH ? on : !on;
    return physicalHigh ? HIGH : LOW;
}
}

void RelayOutput::begin() {
    pinMode(PIN_RELAY, OUTPUT);
    // Sicherer Start: Relais immer AUS, unabhängig davon, was vor dem
    // Neustart war (siehe cooling_control.h - der Mindest-Ausschaltzeit-
    // Timer beginnt bei jedem Boot bewusst neu, genau deshalb).
    relayOn = false;
    digitalWrite(PIN_RELAY, pinLevelFor(false));
}

void RelayOutput::setOn(bool on) {
    relayOn = on;
    digitalWrite(PIN_RELAY, pinLevelFor(on));
}
