// config.h
//
// Fest verdrahtete (kompilierzeit-feste) Einstellungen: Pin-Belegung und
// Firmware-Defaults. Die Pin-Werte sind Platzhalter - bitte an die eigene
// Verkabelung anpassen, bevor geflasht wird (siehe README.md, Abschnitt
// "Verkabelung").

#pragma once

// ---------------------------------------------------------------------
// PIN-BELEGUNG - UNBEDINGT an die eigene Verkabelung anpassen!
//
// Board: LilyGO T-Display S3 (ESP32-S3 mit eingebautem 1,9" 170x320
// ST7789-Display, siehe src/display.cpp). Die Pin-Wahl unten berücksichtigt,
// welche GPIOs auf diesem Board bereits für Onboard-Peripherie reserviert
// sind - bestätigt durch ein früheres, funktionierendes Projekt auf
// demselben Board (https://github.com/Hansi137/esp32thermometer) sowie
// TFT_eSPIs mitgelieferte Setup206_LilyGo_T_Display_S3.h:
//   GPIO0      - Boot-Taster
//   GPIO4      - Akku-Spannungsmessung (ADC, Spannungsteiler)
//   GPIO5/6/7  - Display Reset/CS/DC
//   GPIO8/9    - Display WR/RD (8-Bit Parallelbus)
//   GPIO14     - Taster 1
//   GPIO38     - Display-Hintergrundbeleuchtung (von display.cpp angesteuert)
//   GPIO39-42, 45-48 - Display-Datenleitungen D0-D7 (8-Bit Parallelbus)
//   GPIO43/44  - Standard-UART0 (hier von Serial.begin() in main.cpp genutzt)
// Alle oben genannten Pins bewusst NICHT für Sensor/Relais verwendet.
// ---------------------------------------------------------------------

// DS18B20-Datenleitung (OneWire). Braucht einen 4,7 kOhm Pull-Up-Widerstand
// zwischen Datenleitung und 3,3V. GPIO21 ist exakt der Pin, den auch das
// oben verlinkte Referenzprojekt für denselben Sensor auf diesem Board nutzt.
#define PIN_ONEWIRE_DATA 21

// Steuerleitung zum Relais-Modul. GPIO18 ist auf diesem Board frei
// (taucht in keiner der oben genannten Onboard-Belegungen auf), hat keine
// Boot-/Strapping-/USB-Funktion und eignet sich daher problemlos als
// einfacher digitaler Ausgang.
#define PIN_RELAY 18

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
// bleiben muss, bevor es wieder einschalten darf.
#define DEFAULT_MIN_COMPRESSOR_OFF_SECONDS 240

// Absolute Untergrenze für die Mindest-Ausschaltzeit - kann über die
// Einstellungen NICHT darunter (und erst recht nicht auf 0 bzw.
// "deaktiviert") gesetzt werden. Bewusst niedrig genug für zügiges Testen
// ohne angeschlossenen Kompressor, aber nie "kein Schutz". Vor dem Anschluss
// an einen echten Kühlschrank im Dashboard unbedingt wieder auf einen
// realistischen Wert (60-240s) hochsetzen.
#define MIN_COMPRESSOR_OFF_SECONDS_FLOOR 5

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
