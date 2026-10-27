// app_state.h
//
// Ein einziger globaler Zustands-Container, auf den main.cpp (Regelkreis)
// und web_server.cpp (Dashboard-API) gemeinsam zugreifen. Hält die
// Verantwortlichkeiten klar: main.cpp liest Schedule/Settings/manuelle
// Felder und schreibt die abgeleiteten Laufzeit-Werte (Temperatur,
// Relais-Status, Guard-Status); web_server.cpp liest alles für /api/status
// und schreibt Schedule/Settings/manuelle Felder, wenn der Nutzer etwas
// im Dashboard ändert. Persistiert wird ausschließlich über persistence.h,
// nie direkt hier.

#pragma once

#include "schedule.h"
#include "persistence.h"
#include <cstdint>

struct AppState {
    Schedule schedule;
    Settings settings;
    ScheduleProgress progress;

    // Von main.cpp jeden Regelzyklus aktualisiert:
    float currentTempC = 0.0f / 0.0f; // NAN
    bool sensorOk = false;
    float effectiveTargetTempC = 20.0f;
    bool relayOn = false;
    bool guardActive = false;
    uint32_t guardSecondsRemaining = 0;

    // Vom Dashboard gesetzt, von main.cpp gelesen:
    bool manualOverrideActive = false;
    bool manualRequestOn = false;

    // Nur fürs Status-Display:
    bool wifiConnected = false;
    int wifiRssi = 0;
    uint32_t bootMillis = 0;
};

extern AppState appState;
