# ESP32 Gärschrank-Controller

Eigenständiger WLAN-Temperaturcontroller für einen Gär-/Kühlschrank: ein
ESP32-Board misst mit einem DS18B20-Sensor die Temperatur und schaltet über
ein Relais die Steckdose, an der der Kühlschrank hängt - gesteuert durch
einen selbst eingerichteten Gärplan (Zieltemperaturen über Tage/Stunden).

Läuft komplett unabhängig vom Raspberry Pi / CraftBeerPi. Ein eigenes,
Handy-taugliches Webdashboard läuft direkt auf dem ESP32. Optional kann die
Temperatur zusätzlich an CraftBeerPi gemeldet werden (siehe unten).

## ⚠️ Sicherheitshinweise - bitte unbedingt lesen

Dieses Projekt schaltet **Netzspannung** (230V) für ein Haushaltsgerät mit
Kompressor. Das ist kein Bereich für Trial-and-Error:

- Die Verkabelung (Netzstecker/Verlängerung auftrennen, Relais einschleifen)
  darf nur machen, wer sich mit Netzspannungsarbeiten wirklich auskennt.
  Im Zweifel eine Elektrofachkraft hinzuziehen.
- **Nur die Phase (L, "Live")** schalten, niemals den Neutralleiter (N).
  Keine teilisolierten oder offen liegenden Kontakte.
- Relais und Verkabelung müssen für den **tatsächlichen Dauerstrom UND den
  Anlaufstrom-Peak** des Kühlschrank-Kompressors ausgelegt sein (mit
  Reserve) - Kompressoren ziehen beim Start oft ein Vielfaches ihres
  Nennstroms.
- Eine passende Vorsicherung wird dringend empfohlen, ebenso eine
  FI/RCD-geschützte Steckdose als zusätzliche Absicherung.
- **Ich (die KI, die diese Firmware geschrieben hat) habe nur die
  Software-Logik entworfen und geprüft - ich kann die physische elektrische
  Sicherheit deines konkreten Aufbaus (Relais-Dimensionierung, Verkabelung,
  Gehäuse) nicht verifizieren. Das liegt vollständig in deiner
  Verantwortung.**

## Hardware

- **LilyGO T-Display S3** (ESP32-S3 mit eingebautem 1,9" 170x320
  ST7789-Display, natives USB) - diese Firmware nutzt das Display selbst
  nicht, es muss nur frei bleiben
- DS18B20-Temperatursensor (wasserdicht erhältlich - für den Kühlschrank
  empfehlenswert)
- 4,7 kΩ Pull-Up-Widerstand zwischen DS18B20-Datenleitung und 3,3V
- Relais-Modul, das die Phase einer durchtrennten Verlängerung/Steckdosenleiste schaltet

### Verkabelung (Default-Pins, siehe `src/config.h`)

| Signal | ESP32-Pin |
|---|---|
| DS18B20 Daten (mit Pull-Up) | GPIO 21 |
| Relais-Steuerleitung | GPIO 18 |

Diese Pin-Wahl ist durch ein früheres, funktionierendes Projekt auf
demselben Board bestätigt ([esp32thermometer](https://github.com/Hansi137/esp32thermometer)):
GPIO21 ist dort exakt derselbe DS18B20-Pin, GPIO18 taucht in dessen
Pin-Belegung gar nicht auf (also frei). Auf diesem Board bereits durch
Onboard-Peripherie belegt und deshalb bewusst nicht für Sensor/Relais
verwendet: GPIO0 (Boot-Taster), GPIO4 (Akku-Spannungsmessung), GPIO14
(Taster), GPIO15 (LCD-Power), GPIO38 (Display-Hintergrundbeleuchtung),
GPIO43/44 (Standard-UART0, von `Serial.begin()` genutzt).

Die Pins sowie "aktiv-high/low" für dein konkretes Relais-Modul stehen als
klar kommentierte Konstanten in `src/config.h` - vor dem Flashen an die
eigene Verkabelung anpassen, falls du ein anderes Board verwendest.

## Firmware flashen

Zwei gleichwertige Wege - beide nutzen dieselben Dateien in `src/`.

⚠️ **Wichtige Board-Einstellung (live verifiziert, siehe "Verifikation" unten):**
Dieses Board hat natives USB - der USB-C-Port liegt direkt am Chip, nicht an
einem separaten UART-Brücken-Chip. Ohne **"USB CDC On Boot: Enabled"**
bleibt `Serial.print()` (Debug-Ausgabe im seriellen Monitor) komplett stumm,
obwohl die Firmware ganz normal läuft - das kostet sonst viel Verwirrung
beim ersten Flashen.

### Weg A: Arduino CLI / Arduino IDE

1. Boards-Verwalter-URL hinzufügen: `https://espressif.github.io/arduino-esp32/package_esp32_index.json`, ESP32-Board-Paket installieren.
2. Folgende Bibliotheken über den Bibliotheksverwalter installieren: `WiFiManager` (tzapu), `ESPAsyncWebServer` (lacamera), `ArduinoJson`, `DallasTemperature`, `OneWire`.
3. Sketch `src/` öffnen (Arduino IDE erkennt `main.cpp` als Teil des Sketches, solange alle Dateien im selben Ordner liegen - bei Bedarf den Ordner in `esp32-ferm-controller` umbenennen und `main.cpp` zu `esp32-ferm-controller.ino` umbenennen, oder per `arduino-cli compile` wie unten bauen).
4. Dashboard-Dateien auf LittleFS hochladen: mit dem Plugin "ESP32 Sketch Data Upload" (Arduino IDE) bzw. `arduino-cli` + `mklittlefs` den Inhalt von `data/` flashen.
5. Board **"ESP32S3 Dev Module"** auswählen, unter **Tools → USB CDC On Boot → "Enabled"** setzen (siehe Hinweis oben), flashen, seriellen Monitor bei 115200 Baud öffnen.

Mit `arduino-cli` entspricht das dem FQBN-Zusatz `:CDCOnBoot=cdc`, z.B.:
```sh
arduino-cli compile --fqbn "esp32:esp32:esp32s3:CDCOnBoot=cdc" --upload -p COM3 esp32-ferm-controller/src
```

### Weg B: PlatformIO

`platformio.ini` setzt die nötigen Build-Flags (`ARDUINO_USB_CDC_ON_BOOT=1`) für dieses Board bereits automatisch:

```sh
cd esp32-ferm-controller
pio run -e esp32s3 -t upload      # Firmware flashen
pio run -e esp32s3 -t uploadfs    # Dashboard-Dateien (data/) auf LittleFS flashen
pio device monitor                 # serielle Ausgabe ansehen
```

## Ersteinrichtung (Plug-and-Play-Ablauf)

1. Board per USB-Netzteil einschalten (noch **nicht** am Kühlschrank, erst
   mal zum Einrichten in Reichweite deines Handys/WLANs bleiben).
2. Beim allerersten Start (keine WLAN-Zugangsdaten gespeichert) öffnet das
   Gerät einen eigenen Access Point namens **"FermControl-Setup"**. Mit dem
   Handy damit verbinden, das Portal öffnet sich meist automatisch
   (captive portal), sonst `192.168.4.1` im Browser aufrufen.
3. Dein Heim-WLAN auswählen, Passwort eintragen, speichern. Das Gerät
   verbindet sich und merkt sich die Zugangsdaten dauerhaft.
4. Die IP-Adresse steht im seriellen Monitor, oder im Router nachschauen.
   Diese IP im Handy-Browser öffnen → Dashboard.
5. Unter **Gärplan** die gewünschten Schritte (Name, Zieltemperatur, Dauer
   in Tagen/Stunden) eintragen, **Speichern**, dann **Start**.
6. Gerät ausschalten, zum Kühlschrank tragen, Sensor + Relais anschließen,
   wieder einschalten - es verbindet sich automatisch mit dem bekannten
   WLAN und macht dort weiter, ganz ohne das Setup-Portal erneut zu zeigen.

Zum erneuten Einrichten eines anderen WLANs: im Dashboard unter
**Einstellungen → WLAN zurücksetzen**.

## Kühl-Logik (Hysterese + Kompressorschutz)

- Kühlung schaltet **ein**, wenn die Temperatur über *Zieltemp + Einschalt-Offset* steigt.
- Kühlung schaltet **aus**, wenn die Temperatur unter *Zieltemp − Ausschalt-Offset* fällt.
- **Kompressorschutz (nicht abschaltbar):** Nach dem Ausschalten muss eine
  Mindestzeit (Default 4 Minuten, minimal einstellbar 5 Sekunden) vergehen,
  bevor erneut eingeschaltet werden darf - schützt den Kompressor vor
  schädlichem schnellem Takten. Gilt auch im manuellen Modus; das Dashboard
  zeigt dann einen Countdown. Die 5-Sekunden-Untergrenze ist bewusst niedrig
  gehalten, um ohne angeschlossenen Kompressor zügig testen zu können -
  **vor dem Anschluss an einen echten Kühlschrank im Dashboard unbedingt
  wieder auf einen realistischen Wert (60-240s) hochsetzen.**
- Nach dem letzten Gärplan-Schritt hält das Gerät dessen Zieltemperatur
  dauerhaft (Status "Abgeschlossen"), statt die Kühlung abzuschalten - so
  wärmt sich das Bier nicht unbemerkt auf.
- Fällt der Sensor aus (ungültiger Messwert), wird die Kühlung
  sicherheitshalber ausgeschaltet, statt mit einem Fantasiewert
  weiterzuregeln.

## Optionales CraftBeerPi-Reporting

Meldet die Temperatur periodisch an CraftBeerPi, über dessen bereits
vorhandenen HTTPSensor-Endpunkt (keine Änderung an CraftBeerPi nötig):

1. In CraftBeerPi unter **Hardware** einen neuen Sensor vom Typ
   `HTTPSensor` anlegen und als `Key` einen kurzen Wert vergeben (max. 10
   Zeichen, nur Buchstaben/Zahlen/`,`/`.`) - genau diesen Key auch im
   Gärschrank-Dashboard unter **Einstellungen → CraftBeerPi-Reporting**
   eintragen, zusammen mit der Pi-IP und Port 8000.
2. Reporting aktivieren, Intervall festlegen, speichern.

**Einschränkung:** Negative Temperaturen (°C) können nicht gemeldet werden
(CraftBeerPis Endpunkt erlaubt kein Minuszeichen im Wert) - wird intern
abgefangen und einfach übersprungen, nicht als Fehler angezeigt.

Diese Anbindung ist rein lesend: CraftBeerPi hat keinerlei Kontrolle über
das Relais, nur Einblick in die gemeldete Temperatur.

## REST-API (vom ESP32 selbst ausgeliefert)

| Methode | Pfad | Zweck |
|---|---|---|
| GET | `/api/status` | Temperatur, Ziel, Relais-/Schutz-Status, Gärplan-Fortschritt, WLAN |
| GET/PUT | `/api/schedule` | Gärplan lesen/ersetzen |
| GET/PUT | `/api/settings` | Hysterese, Mindestzeiten, CraftBeerPi-Reporting |
| POST | `/api/control/start` | Gärplan ab Schritt 1 starten |
| POST | `/api/control/stop` | Gärplan pausieren (Kühlung folgt keinem Ziel mehr) |
| POST | `/api/control/reset` | Fortschritt zurücksetzen |
| POST | `/api/control/manual` | `{"active":bool,"relayOn":bool}` - manuelle Übersteuerung |
| POST | `/api/wifi/reset` | WLAN-Zugangsdaten löschen + Neustart ins Setup-Portal |
| GET | `/api/info` | Firmware-Version, Chip-Info |

Kein Login/Auth (wie CraftBeerPis eigene HTTP-Endpunkte auch) - nur im
eigenen, vertrauenswürdigen Heimnetz verwenden.

## Projektstruktur

```
esp32-ferm-controller/
├── platformio.ini           PlatformIO-Projekt (env:esp32s3 + env:native für Logik-Tests)
├── src/                      Firmware-Quellcode
│   ├── main.cpp               Regelkreis (Setup/Loop), verdrahtet alle Module
│   ├── config.h                Pin-Belegung + Defaults (anpassen!)
│   ├── app_state.h             Gemeinsamer Zustand zwischen Regelkreis und Web-API
│   ├── cooling_control.*       Reine Hysterese-/Kompressorschutz-Logik (hardware-unabhängig)
│   ├── schedule.*               Reine Gärplan-Fortschritts-/Rampen-Logik (hardware-unabhängig)
│   ├── temp_sensor.*            DS18B20-Wrapper
│   ├── relay_output.*           Relais-GPIO-Wrapper
│   ├── persistence.*            LittleFS-JSON (Gärplan/Einstellungen/Zustand)
│   ├── wifi_setup.*             WiFiManager-Wrapper
│   ├── web_server.*             Dashboard + REST-API
│   └── cbpi_reporter.*          Optionales CraftBeerPi-Reporting
├── data/                      Dashboard (auf LittleFS geflasht)
└── test/
    ├── test_cooling_control/    PlatformIO-Unity-Tests (pio test -e native)
    ├── test_schedule/           dito
    └── selftest/                Eigenständiges Arduino-Sketch für Logik-Tests AUF dem ESP32
                                  (Serial-Ausgabe, kein Sensor/Relais/WLAN nötig)
```

`cooling_control.*` und `schedule.*` enthalten bewusst keine
Arduino-/ESP32-Includes - diese Logik lässt sich unabhängig von echter
Hardware testen.

## Verifikation

- **Vollständige Firmware kompiliert sauber** gegen den echten ESP32-S3-Toolchain
  (`arduino-cli compile --fqbn esp32:esp32:esp32s3`) inklusive aller
  Bibliotheken (WiFiManager, ESPAsyncWebServer, ArduinoJson, DallasTemperature,
  OneWire) - 0 Warnungen im eigenen Code.
- **`test/selftest/` tatsächlich auf echter Hardware geflasht und ausgeführt**
  (über COM3, mit aktiviertem `USB CDC On Boot` - siehe Hinweis oben): alle
  **28 von 28 Tests bestanden**, inklusive Hysterese-Schwellwerte,
  Kompressorschutz-Grenzfälle (0s/239s/240s), manueller Modus (Mindestzeit
  wird auch dort respektiert), Gärplan-Schritt-Übergänge mit Überhang,
  Plan-Ende hält letzte Temperatur, Rampen-Interpolation bei 0/50/100%. Das
  ist dieselbe Logik, die auch in der Haupt-Firmware läuft (`src/cooling_control.*`,
  `src/schedule.*`) - kein separater Testpfad.
- Dabei live zwei reale Probleme gefunden und behoben, die reines
  Code-Lesen nicht aufgedeckt hätte: das Board ist tatsächlich ein ESP32-S3
  (erste Kompilierung lief versehentlich gegen klassisches ESP32), und ohne
  `USB CDC On Boot: Enabled` kam über das USB-Kabel keinerlei
  Serial-Ausgabe an, obwohl die Firmware normal lief.

**Was damit noch nicht abgedeckt ist:** Sensor, Relais, WLAN-Verbindung und
das Web-Dashboard liefen nicht in diesem Testlauf mit (der Selbsttest
braucht bewusst keine Peripherie). Bitte vor dem Anschluss an den echten
Kühlschrank folgende Checkliste durchgehen:

1. ✅ `test/selftest/` flashen, seriellen Monitor öffnen, **"ALLE TESTS BESTANDEN"** prüfen - bereits erledigt, siehe oben.
2. Haupt-Firmware flashen (mit `USB CDC On Boot: Enabled`!), Ersteinrichtung durchlaufen (siehe oben).
3. Stromzyklus **fernab vom Kühlschrank** testen: Gerät aus- und wieder
   einschalten, prüfen dass es sich ohne erneutes Setup-Portal automatisch
   mit dem WLAN verbindet.
4. Prüfen, dass eine plausible Raumtemperatur angezeigt wird.
5. Relais-Klicken hören und im Dashboard den Status-Wechsel sehen (z.B.
   über die Einstellungen kurzzeitig eine sehr niedrige Zieltemperatur
   setzen oder den manuellen Modus nutzen).
6. Kompressorschutz bewusst testen: im manuellen Modus zweimal schnell
   hintereinander ein-/ausschalten und den Countdown im Dashboard
   beobachten.
7. **Erst danach** an Netzspannung und den echten Kühlschrank anschließen.

## Offene Anpassungen

- `src/config.h`: GPIO21 (Sensor) und GPIO18 (Relais) passen zum oben
  beschriebenen ESP32-S3-Board - bei einem anderen Board das tatsächliche
  Pinout prüfen und ggf. anpassen. Relais-Polarität (`RELAY_ACTIVE_HIGH`)
  je nach konkretem Relais-Modul kontrollieren.
