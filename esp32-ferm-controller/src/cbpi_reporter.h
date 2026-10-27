// cbpi_reporter.h
//
// Optionales, periodisches Melden der Temperatur an CraftBeerPi über dessen
// bestehenden HTTPSensor-Endpunkt (GET /httpsensor/{key}/{value}, siehe
// cbpi/extension/httpsensor/__init__.py im Haupt-Repo - keine Änderung dort
// nötig). Rein ausgehend (push), CraftBeerPi sendet nichts an den ESP32
// zurück und hat keinerlei Kontrolle über das Relais.
//
// WICHTIG: Der Wert-Teil der URL darf laut CraftBeerPi-Validierung nur
// [a-zA-Z0-9,.] enthalten (kein Minuszeichen!). Negative Temperaturen
// können daher nicht übertragen werden - reportIfDue() überspringt das
// Melden in diesem Fall einfach (loggt eine Warnung), statt eine ungültige
// Anfrage zu schicken.

#pragma once

#include "persistence.h"

namespace cbpi_reporter {

// Meldet die Temperatur, falls das letzte Melden länger als
// settings.cbpiReportIntervalSeconds zurückliegt und cbpiReportEnabled
// gesetzt ist. nowMillis wird von main.cpp übergeben (testbar/kontrollierbar).
void reportIfDue(const Settings& settings, float currentTempC, uint32_t nowMillis);

} // namespace cbpi_reporter
