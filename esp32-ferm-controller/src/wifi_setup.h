// wifi_setup.h
//
// Dünner Wrapper um WiFiManager: beim ersten Start (oder nach einem
// WLAN-Reset über das Dashboard) öffnet das Gerät einen eigenen Access
// Point ("FermControl-Setup"), über den man sich per Handy verbindet und
// die Zugangsdaten fürs Heim-WLAN einmalig einträgt. WiFiManager speichert
// sie danach selbst im Flash (NVS) - bei jedem weiteren Einschalten
// verbindet sich das Gerät automatisch, ganz ohne dieses Portal erneut zu
// zeigen.

#pragma once

namespace wifi_setup {

// Verbindet mit gespeicherten Zugangsdaten, oder öffnet bei Bedarf das
// Einrichtungs-Portal (blockiert, bis entweder eine Verbindung steht oder
// das Portal-Timeout abläuft). Gibt true zurück, wenn eine WLAN-Verbindung
// besteht.
bool connect();

// Löscht die gespeicherten WLAN-Zugangsdaten und startet neu - danach
// erscheint beim nächsten Boot wieder das Einrichtungs-Portal. Wird vom
// Dashboard-Button "WLAN zurücksetzen" aufgerufen.
void resetAndRestart();

bool isConnected();
int rssi();

} // namespace wifi_setup
