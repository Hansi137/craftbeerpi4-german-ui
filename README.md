# CraftBeerPi 4 — German UI Edition 🍺

[![GitHub license](https://img.shields.io/github/license/craftbeerpi/craftbeerpi4)](https://github.com/craftbeerpi/craftbeerpi4/blob/master/LICENSE)
![Happy Brewing](https://img.shields.io/badge/CraftBeerPi%204-Happy%20Brewing-%23FBB117)

<p align="center">
  <img src="https://github.com/craftbeerpi/craftbeerpi4-ui/blob/main/cbpi4ui/public/logo192.png?raw=true" alt="CraftBeerPi Logo"/>
</p>

Ein Fork von [CraftBeerPi 4](https://github.com/craftbeerpi/craftbeerpi4) mit **komplett überarbeiteter, deutscher Oberfläche** und vielen Verbesserungen für den täglichen Braugebrauch.

## ✨ Was ist anders?

### 🇩🇪 Vollständige Deutsche Übersetzung
- Alle Menüs, Buttons, Tooltips und Fehlermeldungen auf Deutsch
- Umschaltbar zwischen DE/EN über Toggle in der Navigationsleiste

### 🎨 Modernes UI/UX
- **Dark Theme** mit modernem Design (Inter Font)
- **Cockpit-Ansicht** mit Live-Temperaturkurve und Schritt-Fortschritt
- **Einfach/Experten-Modus** — Anfänger sehen nur das Wesentliche
- **Statusleiste** mit Brau-Fortschritt, aktuellem Schritt und Timer
- **Interaktive Aktorsteuerung** — Heizung und Rührwerk direkt ein-/ausschalten
- **Kessel-Kalibrierung** — 21 vorkonfigurierte Einkocher/Brauanlagen mit berechneter Literskala
- **Rezept Import/Export** als JSON-Dateien

### 🔧 Technische Verbesserungen
- **PIDBoil-Support** im Frontend — PID-Parameter (P, I, D, SampleTime etc.) direkt in den Kesseleinstellungen konfigurierbar, mit 3 Presets (Konservativ/Ausgewogen/Aggressiv)
- **Automatisches Rührwerk** — MashStep und MashInStep starten/stoppen den Agitator automatisch
- **NaN-Temperatur-Fix** — keine "NaN°C"-Anzeige mehr bei fehlenden Sensordaten
- **Flicker-freie Updates** — kein Flackern mehr bei Aktor-Buttons und Kessel-Panels

## 📋 Voraussetzungen

- Raspberry Pi (3B+ oder 4B empfohlen) mit Raspberry Pi OS (Bookworm)
- Python 3.11+
- CraftBeerPi 4 installiert ([Installationsanleitung](https://openbrewing.gitbook.io/craftbeerpi4_support/))

## 🚀 Installation

### Variante 1: Kompletter Fork (empfohlen für Neuinstallationen)

```bash
# Repository klonen
git clone https://github.com/Hansi137/craftbeerpi4-german-ui.git
cd craftbeerpi4-german-ui

# Virtuelle Umgebung erstellen & aktivieren
python3 -m venv ~/cbpi4_venv
source ~/cbpi4_venv/bin/activate

# CraftBeerPi4 installieren (mit dem Agitator-Patch)
pip install -e .

# CraftBeerPi4 Setup
cbpi setup

# UI-Customization installieren
cd custom_ui
chmod +x install_ui.sh
./install_ui.sh
```

### Variante 2: Nur UI-Upgrade (bestehendes CraftBeerPi4)

Falls du CraftBeerPi4 bereits installiert hast und nur die UI-Verbesserungen willst:

```bash
# Repository klonen
git clone https://github.com/Hansi137/craftbeerpi4-german-ui.git
cd craftbeerpi4-german-ui

# Virtuelle Umgebung aktivieren
source ~/cbpi4_venv/bin/activate

# MashStep mit Agitator-Support ersetzen
cp cbpi/extension/mashstep/__init__.py \
   $(python3 -c "import cbpi; print(cbpi.__path__[0])")/extension/mashstep/__init__.py

# UI-Customization installieren
cd custom_ui
chmod +x install_ui.sh
./install_ui.sh
```

### Nach der Installation

```bash
# CraftBeerPi starten
cbpi start

# Oder als systemd-Service:
sudo systemctl restart craftbeerpi
```

Dann im Browser öffnen: `http://<raspberry-pi-ip>:8000`

## 📁 Projektstruktur

```
craftbeerpi4-german-ui/
├── cbpi/                          # CraftBeerPi4 Backend (Fork)
│   └── extension/mashstep/        # ← Agitator-Patch hier
├── custom_ui/                     # UI-Customization Dateien
│   ├── translate-de.js            # Deutsche Übersetzung + alle UI-Features
│   ├── custom.css                 # Dark Theme + modernes Styling
│   └── install_ui.sh              # Installationsskript
└── README.md
```

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

## 🤝 Credits

- [CraftBeerPi 4](https://github.com/craftbeerpi/craftbeerpi4) — das Original von Manuel Fritsch
- [cbpi4-PIDBoil](https://github.com/PiBrewing/cbpi4-PIDBoil) — PID-Regler Plugin
- [cbpi4ui](https://github.com/craftbeerpi/craftbeerpi4-ui) — Original React-Frontend

## 📜 Lizenz

GPL-3.0 — siehe [LICENSE](LICENSE)
