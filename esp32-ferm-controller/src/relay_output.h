// relay_output.h
//
// Dünner GPIO-Wrapper fürs Relais. Kennt "aktiv-high/low" (siehe config.h)
// und startet beim Booten immer im sicheren AUS-Zustand.

#pragma once

class RelayOutput {
public:
    void begin();
    void setOn(bool on);
    bool isOn() const { return relayOn; }

private:
    bool relayOn = false;
};
