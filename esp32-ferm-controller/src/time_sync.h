// time_sync.h
//
// Optionale Wanduhrzeit fuer /history.csv-Zeitstempel: das Geraet hat keine
// eigene Echtzeituhr (RTC) und laeuft ja bewusst auch komplett ohne WLAN
// (siehe wifi_setup.h) - uptimeSeconds allein sagt aber nichts darueber
// aus, an welchem Kalendertag/welcher Uhrzeit ein Messpunkt aufgenommen
// wurde, sobald das Geraet mal neu gestartet ist.
//
// Realistischer Ablauf (siehe README.md): Geraet zuhause im WLAN
// einschalten -> hier synchronisiert sich die Uhrzeit per NTP einmalig im
// Hintergrund -> danach zum Kuehlschrank tragen, auch ganz ohne weiteres
// WLAN. Die einmal gesetzte Systemzeit laeuft ab da intern per Hardware-
// Timer weiter (voellig unabhaengig von WLAN), bleibt also fuer die ganze
// Laufzeit bis zum naechsten Neustart korrekt (nur minimale Drift).
//
// Ohne jemals erfolgreiche Synchronisierung (z.B. Geraet noch nie im WLAN
// gestartet) bleibt isoTimestamp() bewusst leer statt eine falsche Uhrzeit
// vorzutaeuschen - /history.csv zeigt dann fuer diese Zeilen nur die
// uptimeSeconds-Spalte.

#pragma once

#include <Arduino.h>

namespace time_sync {

// Einmalig in setup() aufrufen - stoesst die Hintergrund-Synchronisierung
// per NTP an (nicht blockierend, versucht intern von selbst erneut, sobald
// irgendwann eine Internetverbindung besteht).
void begin();

// true, sobald die Systemzeit mindestens einmal erfolgreich per NTP gesetzt
// wurde (grobe Plausibilitaetspruefung: alles vor ca. 2023 gilt als
// "noch nie synchronisiert", siehe time_sync.cpp).
bool isSynced();

// ISO-8601-Zeitstempel in lokaler Zeitzone (siehe TIME_ZONE_POSIX in
// config.h), z.B. "2026-11-08T19:20:05". Leerer String, falls isSynced()
// false ist.
String isoTimestamp();

} // namespace time_sync
