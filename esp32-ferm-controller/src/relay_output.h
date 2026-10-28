// relay_output.h
//
// Dünner GPIO-Wrapper fürs Relais. Startet beim Booten immer im sicheren
// AUS-Zustand. Die Polarität (aktiv-high/low) ist zur Laufzeit umschaltbar
// (analog zur "Invertiert"-Option bei CraftBeerPi-GPIO-Aktoren) - der Wert
// aus config.h (RELAY_ACTIVE_HIGH) ist nur der Startwert, über
// setActiveHigh() kann main.cpp ihn aus den gespeicherten Einstellungen
// überschreiben, ohne neu zu flashen.

#pragma once

class RelayOutput {
public:
    // initialActiveHigh sollte der bereits aus den Einstellungen geladene
    // Wert sein (siehe main.cpp) - vermeidet ein kurzes Zeitfenster direkt
    // nach dem Boot, in dem der feste Compile-Time-Default aus config.h
    // gilt, statt der tatsächlich gespeicherten Polarität.
    void begin(bool initialActiveHigh);
    void setOn(bool on);
    void setActiveHigh(bool activeHigh);
    bool isOn() const { return relayOn; }

private:
    bool relayOn = false;
    bool activeHigh = true; // wird in begin() auf RELAY_ACTIVE_HIGH gesetzt
};
