// display.h
//
// Status-Anzeige auf dem eingebauten TFT-Display des LilyGO T-Display S3
// (ST7789, 170x320, 8-Bit Parallel über TFT_eSPI). Rein informativ - keine
// Touch-/Tasten-Bedienung, die eigentliche Steuerung läuft über das
// Web-Dashboard. Zeigt Temperatur, Zieltemperatur, Relais-Status,
// Gärplan-Fortschritt und WLAN-Status, aktualisiert sich periodisch aus
// app_state.h.

#pragma once

#include "app_state.h"

namespace display {

void begin();

// Zeichnet den aktuellen Zustand aus appState neu - aber nur, wenn sich
// seit dem letzten Aufruf tatsächlich etwas geändert hat (verglichen gegen
// intern gemerkte zuletzt gezeichnete Werte). Spart unnötiges Neuzeichnen
// und das damit verbundene Flackern, wenn sich z.B. nur die Sekunde im
// Fortschritt ändert, aber sonst alles gleich bleibt.
void update();

} // namespace display
