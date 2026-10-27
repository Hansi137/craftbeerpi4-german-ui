// config.h
//
// Fest verdrahtete (kompilierzeit-feste) Einstellungen: Pin-Belegung und
// Firmware-Defaults. Die Pin-Werte sind Platzhalter - bitte an die eigene
// Verkabelung anpassen, bevor geflasht wird (siehe README.md, Abschnitt
// "Verkabelung").

#pragma once

// ---------------------------------------------------------------------
// PIN-BELEGUNG - UNBEDINGT an die eigene Verkabelung anpassen!
// ---------------------------------------------------------------------

// DS18B20-Datenleitung (OneWire). Braucht einen 4,7 kOhm Pull-Up-Widerstand
// zwischen Datenleitung und 3,3V.
#define PIN_ONEWIRE_DATA 4

// Steuerleitung zum Relais-Modul.
#define PIN_RELAY 5

// true, wenn das Relais-Modul bei HIGH schaltet (die meisten einfachen
// Module), false bei "active low"-Modulen (schaltet bei LOW - häufig bei
// fertigen Relais-Platinen mit Optokoppler, auf dem Modul meist aufgedruckt
// oder im Datenblatt nachzulesen).
#define RELAY_ACTIVE_HIGH true

// ---------------------------------------------------------------------
// FIRMWARE-DEFAULTS (über das Dashboard unter "Einstellungen" änderbar,
// diese Werte gelten nur beim allerersten Start bzw. wenn settings.json
// fehlt/beschädigt ist)
// ---------------------------------------------------------------------

#define DEFAULT_ON_OFFSET_C 0.5f
#define DEFAULT_OFF_OFFSET_C 0.2f

// Kompressorschutz: Mindestzeit, die das Relais nach dem Ausschalten AUS
// bleiben muss, bevor es wieder einschalten darf. Serverseitig (siehe
// web_server.cpp) auf minimal 60s geklemmt - kann über die Einstellungen
// NICHT auf 0 oder deaktiviert gesetzt werden.
#define DEFAULT_MIN_COMPRESSOR_OFF_SECONDS 240

// Empfohlene Mindest-Einschaltzeit gegen Flattern bei verrauschten Werten.
#define DEFAULT_MIN_COMPRESSOR_ON_SECONDS 90

#define DEFAULT_CBPI_REPORT_INTERVAL_SECONDS 60

// Name des WiFiManager-Einrichtungs-Access-Points beim allerersten Start
// bzw. nach einem WLAN-Reset.
#define WIFI_SETUP_AP_NAME "FermControl-Setup"

// Wie lange das Einrichtungs-Portal offen bleibt, bevor das Gerät es
// automatisch wieder schließt und einen erneuten Boot-Versuch macht.
#define WIFI_SETUP_PORTAL_TIMEOUT_SECONDS 180

// Wie oft Temperatur gemessen und die Kühl-Logik ausgewertet wird.
#define CONTROL_LOOP_INTERVAL_MS 5000

// Wie oft der Gärplan-Fortschritt auf LittleFS gesichert wird (zusätzlich
// zu jedem Schrittwechsel/Start/Stop/Reset, die sofort gesichert werden).
#define STATE_SAVE_INTERVAL_MS 30000

#define FIRMWARE_VERSION "1.0.0"
