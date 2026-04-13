# CraftBeerPi 4.1 — German UI Edition 🍺

**Version 4.1.0+de1 „Braumeister"**

[![GitHub license](https://img.shields.io/github/license/craftbeerpi/craftbeerpi4)](https://github.com/Hansi137/craftbeerpi4-german-ui/blob/master/LICENSE)
![Happy Brewing](https://img.shields.io/badge/CraftBeerPi%204.1-Happy%20Brewing-%23FBB117)

<p align="center">
  <img src="https://github.com/craftbeerpi/craftbeerpi4-ui/blob/main/cbpi4ui/public/logo192.png?raw=true" alt="CraftBeerPi Logo"/>
</p>

Ein Fork von [CraftBeerPi 4](https://github.com/craftbeerpi/craftbeerpi4) (Manuel Fritsch) mit **komplett überarbeiteter, deutscher Oberfläche**, Dark Theme, Onboarding-Assistent und vielen Verbesserungen für den täglichen Braugebrauch.

---

## ✨ Was ist anders?

### 🇩🇪 Vollständige Deutsche Übersetzung
- Alle Menüs, Buttons, Tooltips und Fehlermeldungen auf Deutsch
- Umschaltbar zwischen DE/EN über Toggle in der Navigationsleiste

### 🎨 Modernes UI/UX
- **Dark Theme** mit modernem Design (Inter Font)
- **Cockpit-Ansicht** mit Live-Temperaturkurve und Schritt-Fortschritt
- **Onboarding-Assistent** — geführte Ersteinrichtung nach dem ersten Start
- **Einfach/Experten-Modus** — Anfänger sehen nur das Wesentliche
- **Statusleiste** mit Brau-Fortschritt, aktuellem Schritt und Timer
- **Interaktive Aktorsteuerung** — Heizung und Rührwerk direkt ein-/ausschalten
- **Kessel-Kalibrierung** — 21 vorkonfigurierte Einkocher/Brauanlagen mit berechneter Literskala
- **Rezept Import/Export** als JSON-Dateien
- **Toast-Benachrichtigungen** statt Browser-Alerts

### 🧪 Brauwasser-Aufbereitung
- **Integrierter Wasserrechner** — Salzberechnung (Braugips, CaCl₂, NaCl, Bittersalz, Natron, Milchsäure) auf Basis von Quell- und Zielprofil
- **9 Zielprofile** — Pilsner, Helles, Pale Ale, IPA, Stout, Weizen, Amber, Dortmunder, Eigenes Profil
- **Quellwasser-Profilverwaltung** — eigene Wasserprofile speichern, laden, bearbeiten und löschen (z.B. pro Wasserwerk/Jahr)
- Automatische Berechnung von Gesamthärte (°dH), Restalkalität und SO₄/Cl-Verhältnis
- Erreichbar über den Sidebar-Eintrag **„Brauwasser"**

### 📖 Rezeptquellen
- **Links zu externen Rezeptdatenbanken** direkt in der Rezept-Ansicht:
  Maische Malz und Mehr, Kleiner Brauhelfer, Brewfather, BeerXML-Standard

### 🔧 Technische Verbesserungen
- **PIDBoil-Support** im Frontend — PID-Parameter direkt in den Kesseleinstellungen, mit 3 Presets
- **Automatisches Rührwerk** — MashStep und MashInStep starten/stoppen den Agitator automatisch
- **NaN-Temperatur-Fix** — keine "NaN°C"-Anzeige mehr bei fehlenden Sensordaten
- **Flicker-freie Updates** — kein Flackern mehr bei Aktor-Buttons und Kessel-Panels
- **Professionelles Logging** statt print()-Ausgaben
- **Robuste Fehlerbehandlung** — keine stillen `except: pass` mehr

---

## 📋 Voraussetzungen

### Hardware
| Komponente | Empfehlung |
|---|---|
| Raspberry Pi | **3B+** oder **4B** (2 GB+ RAM) |
| SD-Karte | 16 GB+ (Class 10) |
| Temperatursensor | DS18B20 (1-Wire) an **GPIO 4** |
| Relais-Board | 1–4 Kanal, 5V/3.3V kompatibel |
| Netzteil | Original Raspberry Pi Netzteil empfohlen |

### Software
- **Raspberry Pi OS Bookworm (64-bit)** — frisch installiert
- SSH aktiviert (über `raspi-config` oder `/boot/firmware/ssh`-Datei)
- Internetverbindung (LAN oder WLAN)

> **Hinweis:** Das Installationsskript installiert alle Software-Abhängigkeiten automatisch. Du brauchst vorher nichts manuell zu installieren.

---

## 🚀 Installation (Neuinstallation)

### Schritt 1: Repository klonen

Per SSH auf den Raspberry Pi verbinden und das Repository klonen:

```bash
ssh pi@<IP-ADRESSE>
```

```bash
cd ~
git clone https://github.com/Hansi137/craftbeerpi4-german-ui.git
cd craftbeerpi4-german-ui
```

### Schritt 2: Installationsskript ausführen

```bash
sudo bash install_pi.sh
```

Das Skript erledigt automatisch folgende 8 Schritte:

| Schritt | Was passiert |
|---------|-------------|
| 1/8 | Systempakete installieren (python3, git, build-tools) |
| 2/8 | Python-Version prüfen (≥ 3.11 empfohlen) |
| 3/8 | 1-Wire für DS18B20-Sensoren konfigurieren (GPIO 4) |
| 4/8 | Python Virtual Environment erstellen (`~/cbpi4_venv`) |
| 5/8 | CraftBeerPi4 + alle Abhängigkeiten installieren |
| 6/8 | Custom UI deployen (Deutsche Übersetzung, Dark Theme, UX) |
| 7/8 | `cbpi setup` — Konfigurationsordner anlegen (`~/config/`) |
| 8/8 | Systemd-Service einrichten (Autostart beim Booten) |

Am Ende fragt das Skript optional, ob das **iSpindle-Plugin** installiert werden soll (j/n).

> **Dauer:** ca. 5–10 Minuten je nach Internetgeschwindigkeit.

### Schritt 3: Neustart

```bash
sudo reboot
```

### Schritt 4: Im Browser öffnen

Nach dem Reboot startet CraftBeerPi automatisch. Öffne im Browser:

```
http://<IP-ADRESSE>:8000
```

> **Wichtig:** Lade die Seite beim ersten Aufruf (und nach jedem Update) mit **`Strg+F5`** (Hard Reload), damit der Browser-Cache geleert wird. Sonst werden eventuell alte Dateien angezeigt und nicht alle Funktionen sind sichtbar.

Der **Onboarding-Assistent** führt dich durch die Ersteinrichtung.

---

## ⚙️ Ersteinrichtung

Nach dem ersten Start erscheint der Onboarding-Assistent. Falls nicht, klicke auf **Einstellungen → Hardware**.

### 1. Sensor anlegen (DS18B20)

1. Navigiere zu **Hardware → Sensoren → Neu**
2. Wähle Typ: `OneWireAdvanced`
3. Der DS18B20 wird automatisch erkannt (beginnt mit `28-...`)
4. Namen vergeben, z.B. „Maische-Temperatur"

> **Tipp:** Prüfe ob der Sensor erkannt wird:
> ```bash
> ls /sys/bus/w1/devices/
> ```
> Es sollte ein Ordner mit `28-...` erscheinen.

### 2. Aktor anlegen (Relais)

1. Navigiere zu **Hardware → Aktoren → Neu**
2. Wähle Typ: `GPIOActor`
3. GPIO-Pin angeben — den Pin, an dem dein Relais angeschlossen ist
4. Prüfe dein Relais-Board: **Inverted = Ja** falls Active-Low (die meisten 5V-Relais)

### 3. Kessel anlegen

1. Navigiere zu **Hardware → Kessel → Neu**
2. Name vergeben (z.B. „Hauptkessel")
3. Sensor zuweisen (den eben angelegten DS18B20)
4. Heizungs-Aktor zuweisen
5. Optional: Rührwerk-Aktor (Agitator) zuweisen
6. Logik: `PIDBoil` oder `PIDHerms` (je nach Setup)

### 4. Rezept erstellen & brauen

1. Navigiere zu **Rezepte → Neues Rezept**
2. Rastschritte mit Temperatur und Dauer anlegen
3. **Brauen starten** — die Cockpit-Ansicht zeigt den Live-Fortschritt

---

## 🎛️ Features im Detail

### Cockpit-Ansicht
Die Cockpit-Ansicht zeigt den aktuellen Braustatus auf einen Blick:
- Live-Temperaturkurve (letzte 10 Minuten)
- Aktueller Schritt mit Timer und Fortschrittsbalken
- Ist- und Soll-Temperatur
- Aktor-Status (Heizung, Rührwerk)

### Kessel-Kalibrierung
21 vorkonfigurierte Geräte inkl.:
- Klarstein Beerfest (29L)
- Profi Cook PC-EKA 1066 (27L)
- Klarstein Mundschenk (30L)
- GrainFather G30/G70
- Braumeister 10L/20L/50L
- Bielmeier BHG 410 (29L)
- ...und viele mehr

### PIDBoil-Konfiguration
Direkte Einstellung der PID-Parameter im Frontend:
| Parameter | Beschreibung | Konservativ | Ausgewogen | Aggressiv |
|-----------|-------------|-------------|------------|-----------|
| P | Proportional | 150 | 120 | 80 |
| I | Integral | 0.1 | 0.3 | 0.8 |
| D | Differenzial | 60 | 45 | 25 |

Voraussetzung: [cbpi4-PIDBoil](https://github.com/PiBrewing/cbpi4-PIDBoil) Plugin installiert.

### SVG-Widgets für das Dashboard
Für ein visuelles Dashboard (Anlagenbild) gibt es eine Community-Sammlung von SVG-Widgets:
➡️ [craftbeerpi-ui-widgets](https://github.com/craftbeerpi/craftbeerpi-ui-widgets) (von kalausr)

SVG-Dateien in `~/config/widgets/` ablegen, dann sind sie im Dashboard unter „Anlagenbild" verfügbar.

---

## 🔧 Service-Verwaltung

CraftBeerPi läuft als Systemd-Service und startet automatisch beim Booten.

> **Nach jedem Neustart/Update:** Browser-Cache leeren mit **`Strg+F5`** (Windows/Linux) oder **`Cmd+Shift+R`** (Mac).

```bash
# Status prüfen
sudo systemctl status craftbeerpi

# Manuell starten
sudo systemctl start craftbeerpi

# Stoppen
sudo systemctl stop craftbeerpi

# Neu starten
sudo systemctl restart craftbeerpi

# Autostart deaktivieren
sudo systemctl disable craftbeerpi

# Logs live verfolgen
sudo journalctl -u craftbeerpi -f
```

> **Hinweis:** Falls der Service nicht sauber stoppt, hilft:
> ```bash
> sudo pkill -9 -f "cbpi start"
> ```

---

## 🔄 Update

Um auf die neueste Version zu aktualisieren:

```bash
ssh pi@<IP-ADRESSE>
cd ~/craftbeerpi4-german-ui

# Service stoppen
sudo systemctl stop craftbeerpi

# Neueste Version holen
git pull

# Virtual Environment aktivieren
source ~/cbpi4_venv/bin/activate

# Aktualisieren
pip install -e .

# Custom UI neu deployen (wichtig nach pip install!)
sudo bash install_pi.sh
# → Bei erneutem Lauf überspringt das Skript bereits erledigte Schritte

# Service starten
sudo systemctl start craftbeerpi
```

> **Wichtig:** Nach jedem `pip install -e .` muss die Custom UI neu deployed werden, da pip die `index.html` überschreibt. Das Installationsskript erledigt das automatisch.

---

## 🐛 Fehlerbehebung

### Web-UI nicht erreichbar

```bash
# Läuft der Service?
sudo systemctl status craftbeerpi

# Logs prüfen
sudo journalctl -u craftbeerpi -n 50

# Manuell starten (für ausführliche Ausgabe)
source ~/cbpi4_venv/bin/activate
cbpi start
```

### DS18B20-Sensor wird nicht erkannt

```bash
# 1-Wire Kernelmodule geladen?
lsmod | grep w1

# Sensor-Geräte auflisten
ls /sys/bus/w1/devices/
# → Sollte "28-xxxx" Ordner zeigen

# Falls leer: /boot/firmware/config.txt prüfen
grep "w1-gpio" /boot/firmware/config.txt
# → Sollte "dtoverlay=w1-gpio,gpiopin=4,pullup=on" zeigen

# Nach Änderungen: Neustart erforderlich
sudo reboot
```

### Alte UI wird angezeigt (kein Dark Theme / kein Deutsch)

Die Custom UI-Dateien müssen in der `index.html` eingebunden sein:

```bash
# Prüfen
source ~/cbpi4_venv/bin/activate
INDEX=$(python3 -c "import cbpi4ui,os; print(os.path.join(os.path.dirname(cbpi4ui.__file__),'build','index.html'))")
grep "translate-de.js" "$INDEX" && echo "OK" || echo "FEHLT!"
grep "custom.css" "$INDEX" && echo "OK" || echo "FEHLT!"

# Falls es fehlt: Installationsskript erneut ausführen
cd ~/craftbeerpi4-german-ui
sudo bash install_pi.sh
```

### GPIO-Error / Permission Denied

```bash
# CraftBeerPi muss als normaler User (pi) laufen, NICHT als root
# Der systemd-Service ist bereits korrekt konfiguriert
sudo systemctl status craftbeerpi | grep "User="
# → Sollte "User=pi" zeigen
```

### Python-Modul fehlt (ModuleNotFoundError)

```bash
source ~/cbpi4_venv/bin/activate
pip install -e ~/craftbeerpi4-german-ui
```

---

## 📁 Projektstruktur

```
craftbeerpi4-german-ui/
├── install_pi.sh                  # ← Hauptinstallationsskript (sudo bash install_pi.sh)
├── cbpi/                          # CraftBeerPi4 Backend (Fork)
│   ├── __init__.py                # Version 4.1.0+de1 "Braumeister"
│   └── extension/mashstep/        # Agitator-Patch (autom. Rührwerk)
├── custom_ui/                     # UI-Customization Dateien
│   ├── translate-de.js            # Deutsche Übersetzung + alle UI-Features + Wasserrechner
│   ├── custom.css                 # Dark Theme + modernes Styling
│   └── install_ui.sh              # Manueller UI-Installer (alternativ)
├── requirements.txt               # Python-Abhängigkeiten
├── setup.py                       # Paket-Konfiguration
└── README.md                      # Diese Datei
```

---

## 🤝 Credits

- [CraftBeerPi 4](https://github.com/craftbeerpi/craftbeerpi4) — das Original von **Manuel Fritsch**
- [cbpi4-PIDBoil](https://github.com/PiBrewing/cbpi4-PIDBoil) — PID-Regler Plugin
- [cbpi4ui](https://github.com/craftbeerpi/craftbeerpi4-ui) — Original React-Frontend
- [craftbeerpi-ui-widgets](https://github.com/craftbeerpi/craftbeerpi-ui-widgets) — SVG-Widget-Sammlung von **kalausr**
- Fork-Maintainer: [Hansi137](https://github.com/Hansi137)

## 📜 Lizenz

GPL-3.0 — siehe [LICENSE](LICENSE)

Dieses Projekt ist ein Fork des Originals und steht unter derselben Open-Source-Lizenz.
