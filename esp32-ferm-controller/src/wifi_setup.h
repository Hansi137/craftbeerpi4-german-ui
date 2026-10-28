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

#include <cstdint>

namespace wifi_setup {

// Verbindet mit gespeicherten Zugangsdaten. Sind noch keine gespeichert (
// Ersteinrichtung bzw. nach "WLAN zurücksetzen"), öffnet sich das
// Einrichtungs-Portal und blockiert, bis entweder eine Verbindung steht oder
// das Portal-Timeout abläuft - das ist in diesem Fall in Ordnung, der Nutzer
// steht ja gerade direkt davor.
// Sind bereits Zugangsdaten gespeichert, aber das bekannte Netz gerade nicht
// erreichbar (z.B. Gerät steht im Keller), wird das Portal NICHT geöffnet -
// nach höchstens WIFI_CONNECT_TIMEOUT_SECONDS kehrt die Funktion zurück und
// das Gerät läuft offline weiter (Kühl-Logik/Display/Dashboard brauchen
// kein WLAN). Gibt true zurück, wenn eine WLAN-Verbindung besteht.
bool connect();

// Regelmäßig aus loop() aufrufen: stößt in großzügigem Abstand
// (WIFI_RECONNECT_INTERVAL_MS) einen erneuten Verbindungsversuch an,
// solange kein WLAN verbunden ist - rein nicht-blockierend (WiFi.reconnect()
// kehrt sofort zurück, die eigentliche Verbindung passiert asynchron im
// WLAN-Treiber).
void retryIfDisconnected(uint32_t nowMillis);

// Löscht die gespeicherten WLAN-Zugangsdaten und startet neu - danach
// erscheint beim nächsten Boot wieder das Einrichtungs-Portal. Wird vom
// Dashboard-Button "WLAN zurücksetzen" aufgerufen.
void resetAndRestart();

bool isConnected();
int rssi();

} // namespace wifi_setup
