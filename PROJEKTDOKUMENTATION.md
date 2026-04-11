# CraftBeerPi 4 – German UI Edition
## Vollständige Projektdokumentation

**Version:** 4.0.5.a12 (Codename: "Spring Break")  
**Lizenz:** GNU General Public License v3.0  
**Zielplattform:** Raspberry Pi (3B+ oder neuer) mit Raspberry Pi OS  
**Python:** 3.9+  
**Dokumentationsstand:** April 2026

---

## Inhaltsverzeichnis

1. [Projektübersicht](#1-projektübersicht)
2. [Architektur](#2-architektur)
3. [Verzeichnisstruktur](#3-verzeichnisstruktur)
4. [Kern-Module im Detail](#4-kern-module-im-detail)
5. [API-Schicht (Plugin-Interfaces)](#5-api-schicht-plugin-interfaces)
6. [Controller-Schicht (Business-Logik)](#6-controller-schicht-business-logik)
7. [HTTP-Endpunkte (REST-API)](#7-http-endpunkte-rest-api)
8. [Eingebaute Plugins (Extensions)](#8-eingebaute-plugins-extensions)
9. [Deutsche UI-Anpassungen](#9-deutsche-ui-anpassungen)
10. [Konfiguration & Datenformate](#10-konfiguration--datenformate)
11. [MQTT & Satellite-System](#11-mqtt--satellite-system)
12. [Plugin-Entwicklung](#12-plugin-entwicklung)
13. [Deployment & Installation](#13-deployment--installation)
14. [Tests](#14-tests)
15. [Bekannte Probleme & Verbesserungspotenzial](#15-bekannte-probleme--verbesserungspotenzial)

---

## 1. Projektübersicht

### Was ist CraftBeerPi 4?

CraftBeerPi 4 ist eine **Open-Source Brausteuerungssoftware** für den Raspberry Pi. Sie ermöglicht die vollautomatische Steuerung des gesamten Brauprozesses – vom Einmaischen über das Kochen bis zur Gärung.

### Was macht diese Fork-Version besonders?

Dieses Repository ist ein **Fork mit erweiterten Features**:
- **Deutsche Benutzeroberfläche** (200+ Übersetzungen)
- **Dark Theme** mit modernem Design (Akzentfarbe: #34e89e)
- **Agitator-Unterstützung** in Maisch-Schritten
- **Verbesserte Rezept-Imports** (BeerXML, KBH, Brewfather, MMuM)
- **Spunding-Regelung** für die Gärung (Druck-Steuerung)
- **21 vorkonfigurierte Kessel-Kalibrierungen** (Klarstein, GrainFather, Braumeister etc.)

### Kernfunktionen

| Funktion | Beschreibung |
|----------|-------------|
| **Maischprozess** | Automatisierte Temperatur-Rasten mit Timer |
| **Kochprozess** | Bis zu 6 Hopfengabe-Alarme, First-Wort-Hop |
| **Gärung** | Mehrstufige Temperatur-/Druckprofile |
| **Sensoren** | 1-Wire (DS18B20), HTTP, MQTT |
| **Aktoren** | GPIO, MQTT, Tasmota |
| **Rezepte** | Import/Export (BeerXML, YAML) |
| **Dashboard** | Konfigurierbare Widgets (SVG) |
| **Fernsteuerung** | MQTT, WebSocket, REST-API |
| **Logging** | CSV + optional InfluxDB |

---

## 2. Architektur

### Schichtenmodell

```
┌─────────────────────────────────────────────────────┐
│                  Web-UI (React)                      │
│  cbpi4ui + translate-de.js + custom.css              │
│  (Dark Theme, Deutsche Übersetzung)                  │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP REST + WebSocket (:8000)
┌──────────────────▼──────────────────────────────────┐
│              aiohttp Web-Server                      │
│  ┌─────────────┬──────────────┬───────────────┐     │
│  │ HTTP REST   │  WebSocket   │  Swagger API  │     │
│  │ (15 Module) │  (/ws)       │  Docs         │     │
│  └──────┬──────┴──────┬───────┴───────────────┘     │
│         │             │                              │
│  ┌──────▼─────────────▼──────────────────────┐      │
│  │          Controller-Schicht               │      │
│  │  (17 Module für Business-Logik)           │      │
│  │  Actor, Sensor, Kettle, Step, Recipe,     │      │
│  │  Fermenter, Dashboard, Config, Plugin,    │      │
│  │  Notification, Log, System, Upload,       │      │
│  │  Satellite, Job                           │      │
│  └──────┬────────────────────────────────────┘      │
│         │                                            │
│  ┌──────▼────────────────────────────────────┐      │
│  │            Event-Bus (Pub/Sub)             │      │
│  │  Topic-basiertes Routing mit Baumstruktur │      │
│  └──────┬────────────────────────────────────┘      │
│         │                                            │
│  ┌──────▼────────────────────────────────────┐      │
│  │          Plugin-System                     │      │
│  │  13 eingebaute + externe pip-Pakete       │      │
│  └───────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────┘
         │
┌────────▼─────────────────────────────────────────────┐
│              Hardware / Externe Systeme                │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌───────┐ │
│  │ GPIO │  │1-Wire│  │ MQTT │  │HTTP  │  │Influx │ │
│  │Relais│  │DS18B20│ │Broker│  │Sensor│  │  DB   │ │
│  └──────┘  └──────┘  └──────┘  └──────┘  └───────┘ │
└──────────────────────────────────────────────────────┘
```

### Datenfluss (Beispiel: Maischprozess)

```
1. Benutzer lädt Rezept      →  RecipeController.brew()
2. Steps werden erstellt     →  StepController.load_recipe()
3. Brauen wird gestartet     →  StepController.start()
4. MashStep wird aktiv       →  CBPiStep.on_start()
5. Kessel-Logik startet     →  KettleController.toggle()
6. Sensor liest Temperatur   →  OneWire.run() → push_update()
7. Hysterese regelt Heizer  →  Hysteresis.run() → actor_on/off()
8. Timer läuft ab            →  Timer.on_done → StepResult.NEXT
9. Nächster Schritt          →  StepController.done() → start()
```

### Verwendete Design Patterns

| Pattern | Verwendung |
|---------|-----------|
| **MVC** | Controller → Model (Dataclasses) → View (REST/WS) |
| **Pub/Sub** | EventBus für lose gekoppelte Kommunikation |
| **Template Method** | CBPiActor._run() → on_start/run/on_stop |
| **State Machine** | StepState: INITIAL → ACTIVE → DONE |
| **Active Record** | BasicController: CRUD + Persistenz |
| **Observer** | WebSocket broadcast bei Zustandsänderungen |
| **Plugin/Strategy** | Austauschbare Sensor-/Aktor-/Logik-Implementierungen |
| **Decorator** | @request_mapping, @parameters, @action, @on_startup |

---

## 3. Verzeichnisstruktur

```
craftbeerpi4-german-ui/
│
├── cbpi/                          # === KERN-APPLIKATION ===
│   ├── __init__.py               # Version: 4.0.5.a12, Codename
│   ├── craftbeerpi.py            # Hauptklasse, Server-Initialisierung
│   ├── cli.py                    # CLI-Kommandos (cbpi setup/start/...)
│   ├── eventbus.py               # Internes Event-System (Pub/Sub)
│   ├── websocket.py              # WebSocket-Handler (/ws)
│   ├── satellite.py              # Satellite-WebSocket (/satellite)
│   ├── configFolder.py           # Konfigurationsordner-Verwaltung
│   │
│   ├── api/                      # === PLUGIN-INTERFACES ===
│   │   ├── __init__.py           # Zentrale API-Exports
│   │   ├── base.py               # Abstrakte Basisklasse (CBPiBase)
│   │   ├── actor.py              # Aktor-Basisklasse (CBPiActor)
│   │   ├── sensor.py             # Sensor-Basisklasse (CBPiSensor)
│   │   ├── step.py               # Step-Klassen (CBPiStep, CBPiFermentationStep)
│   │   ├── kettle_logic.py       # Kessel-Logik (CBPiKettleLogic)
│   │   ├── fermenter_logic.py    # Fermenter-Logik (CBPiFermenterLogic)
│   │   ├── extension.py          # Extension-Basisklasse (CBPiExtension)
│   │   ├── property.py           # Property-Typen (Number, Text, Select, ...)
│   │   ├── config.py             # ConfigType Enum
│   │   ├── dataclasses.py        # Datenmodelle (Actor, Sensor, Kettle, ...)
│   │   ├── decorator.py          # Dekoratoren (@request_mapping, @action, ...)
│   │   ├── timer.py              # Countdown-Timer mit Callbacks
│   │   └── exceptions.py         # Benutzerdefinierte Exceptions
│   │
│   ├── controller/               # === BUSINESS-LOGIK ===
│   │   ├── basic_controller2.py  # CRUD-Basisklasse für alle Controller
│   │   ├── actor_controller.py   # Aktor-Verwaltung (on/off/toggle/power)
│   │   ├── sensor_controller.py  # Sensor-Verwaltung und Messwert-Zugriff
│   │   ├── kettle_controller.py  # Kessel + Heizlogik-Steuerung
│   │   ├── step_controller.py    # Maischprozess-Orchestrierung
│   │   ├── recipe_controller.py  # Rezeptverwaltung (YAML)
│   │   ├── fermentation_controller.py  # Gärungsprozess-Steuerung
│   │   ├── fermenter_recipe_controller.py  # Gärrezept-Verwaltung
│   │   ├── config_controller.py  # Konfigurations-CRUD + Cache
│   │   ├── plugin_controller.py  # Plugin-Laden und -Registrierung
│   │   ├── dashboard_controller.py # Dashboard-Widget-Layouts
│   │   ├── notification_controller.py # Benachrichtigungen + Callbacks
│   │   ├── log_file_controller.py # Datalogging (CSV/InfluxDB)
│   │   ├── system_controller.py  # Backup, Systeminfo, Restart
│   │   ├── upload_controller.py  # Rezept-Import (BeerXML, KBH, ...)
│   │   ├── satellite_controller.py # MQTT-Verbindung
│   │   └── job_controller.py     # Hintergrund-Task-Scheduler
│   │
│   ├── http_endpoints/           # === REST-API ===
│   │   ├── http_actor.py         # /actor/ Routen
│   │   ├── http_sensor.py        # /sensor/ Routen
│   │   ├── http_kettle.py        # /kettle/ Routen
│   │   ├── http_step.py          # /step2/ Routen
│   │   ├── http_recipe.py        # /recipe/ Routen
│   │   ├── http_fermentation.py  # /fermenter/ Routen
│   │   ├── http_fermenterrecipe.py # /fermenterrecipe/ Routen
│   │   ├── http_config.py        # /config/ Routen
│   │   ├── http_dashboard.py     # /dashboard/ Routen
│   │   ├── http_plugin.py        # /plugin/ Routen
│   │   ├── http_system.py        # /system/ Routen
│   │   ├── http_login.py         # /login, /logout Routen
│   │   ├── http_log.py           # /log/ Routen
│   │   ├── http_notification.py  # /notification/ Routen
│   │   └── http_upload.py        # /upload/ Routen
│   │
│   ├── extension/                # === EINGEBAUTE PLUGINS ===
│   │   ├── mashstep/             # 8 Maisch-Schritttypen
│   │   ├── hysteresis/           # Kessel-Temperaturregelung
│   │   ├── onewire/              # DS18B20 Temperatursensor
│   │   ├── gpioactor/            # GPIO-Ausgänge + PWM
│   │   ├── dummysensor/          # Test-Sensoren (ohne Hardware)
│   │   ├── dummyactor/           # Test-Aktor (ohne Hardware)
│   │   ├── httpsensor/           # HTTP-Sensor-Schnittstelle
│   │   ├── FermentationStep/     # 5 Gärungs-Schritttypen
│   │   ├── FermenterHysteresis/  # Gär-Temperatur + Spunding-Regelung
│   │   ├── mqtt_actor/           # MQTT Aktoren (Generic, Tasmota)
│   │   ├── mqtt_sensor/          # MQTT Sensor-Integration
│   │   ├── mqtt_util/            # Periodisches MQTT-Update
│   │   └── ConfigUpdate/         # Konfigurations-Migration
│   │
│   ├── config/                   # Default-Konfigurationsdateien
│   ├── static/                   # SVG-Icons, Splash-Screen
│   ├── job/                      # Async Job-Scheduler
│   └── utils/                    # Hilfsfunktionen (JSON, YAML)
│
├── custom_ui/                    # === DEUTSCHE UI ===
│   ├── install_ui.sh            # Installations-Skript
│   ├── translate-de.js          # 200+ deutsche Übersetzungen
│   └── custom.css               # Dark Theme + Styling
│
├── tests/                        # === TESTSUITE ===
│   ├── test_actor.py            # Aktor-Tests
│   ├── test_sensor.py           # Sensor-Tests
│   ├── test_kettle.py           # Kessel-Tests
│   ├── test_step.py             # Step-Tests
│   ├── test_recipe.py           # Rezept-Tests
│   ├── test_dashboard.py        # Dashboard-Tests
│   ├── test_config.py           # Config-Tests
│   ├── test_ws.py               # WebSocket-Tests
│   └── ...                      # + 6 weitere Testmodule
│
├── .devcontainer/                # Docker-Entwicklungsumgebung
├── .github/workflows/            # CI/CD Pipeline
├── setup.py                      # Paket-Konfiguration
├── requirements.txt              # Python-Abhängigkeiten
├── Dockerfile                    # Docker-Build (Multi-Stage)
├── run.py                        # Einstiegspunkt
└── README.md                     # Projekt-README
```

---

## 4. Kern-Module im Detail

### 4.1 craftbeerpi.py – Hauptklasse

Die `CraftBeerPi`-Klasse ist das Herzstück der Anwendung:

```python
class CraftBeerPi:
    def __init__(self, configFolder):
        # 1. Event-Loop konfigurieren (Windows-Kompatibilität)
        # 2. aiohttp-App mit Middleware erstellen:
        #    - Pfad-Normalisierung
        #    - Encrypted Cookie Session
        #    - Authentifizierung (SessionTkt)
        #    - Fehlerbehandlung (error_middleware)
        # 3. Alle Controller instanzieren
        # 4. Alle HTTP-Endpoints registrieren
        # 5. Optional: MQTT/Satellite-Controller
```

**Initialisierungsreihenfolge:**
1. `job.init()` – Job-Scheduler starten
2. `config.init()` – Konfiguration laden
3. `satellite.init()` – MQTT-Verbindung (optional)
4. `plugin.load_plugins()` – Lokale Extensions laden
5. `plugin.load_plugins_from_evn()` – pip-Plugins laden
6. `fermenter.init()`, `sensor.init()`, `step.init()`, `actor.init()`, `kettle.init()`
7. `call_initializer()` – @on_startup Hooks
8. `dashboard.init()` – Dashboard laden

### 4.2 eventbus.py – Event-System

Implementiert Pub/Sub mit Baum-basiertem Topic-Routing:

```python
# Topic-Struktur
"kettle/update"        →  Node("kettle") → Node("update")
"sensor/temp/push"     →  Node("sensor") → Node("temp") → Node("push")
"#"                    →  Wildcard: empfängt ALLE Events

# Verwendung
bus.register("kettle/update", my_callback)       # Registrieren
await bus.fire("kettle/update", kettle_id="abc")  # Feuern
bus.unregister(my_callback)                       # Deregistrieren
```

### 4.3 websocket.py – Echtzeit-Updates

- WebSocket-Endpoint unter `/ws`
- Verwendet `WeakSet` für automatische Client-Bereinigung
- Registriert sich auf `#` (alle Events) → Broadcast an alle Clients
- Schema-Validierung eingehender Nachrichten via voluptuous
- JSON-Serialisierung mit `ComplexEncoder`

### 4.4 configFolder.py – Dateisystem

Verwaltet die Konfigurationsstruktur:
- `create_home_folder_structure()` – Erstellt alle Ordner
- `create_config_file()` – Kopiert Standarddateien
- `check_for_setup()` – Prüft ob Setup ausgeführt wurde
- **Auto-Restore:** Erkennt `restored_config.zip` und stellt Backup wieder her
- Plattformübergreifend: Owner/Group nur auf Linux gesetzt

### 4.5 cli.py – Kommandozeile

```bash
cbpi setup          # Konfigurationsordner erstellen
cbpi start          # Server starten (Port aus config.yaml)
cbpi plugins        # Installierte Plugins auflisten
cbpi create         # Neues Plugin-Template erstellen
cbpi autostart on   # systemd-Autostart aktivieren
cbpi onewire        # 1-Wire Bus konfigurieren
cbpi chromium       # Kiosk-Modus aktivieren
```

---

## 5. API-Schicht (Plugin-Interfaces)

### 5.1 Vererbungshierarchie

```
CBPiBase (Abstrakte Basis mit Utility-Methoden)
├── CBPiActor        – Basisklasse für Aktoren
├── CBPiSensor       – Basisklasse für Sensoren (erbt auch CBPiExtension)
├── CBPiStep         – Basisklasse für Maisch-Schritte
├── CBPiFermentationStep – Basisklasse für Gärungs-Schritte
├── CBPiKettleLogic  – Basisklasse für Kessel-Regelung
└── CBPiFermenterLogic – Basisklasse für Fermenter-Regelung

CBPiExtension – Basis für allgemeine Erweiterungen
```

### 5.2 CBPiBase – Gemeinsame API

Alle Plugin-Typen erben folgende Methoden:

| Methode | Beschreibung |
|---------|-------------|
| `get_config_value(key)` | Konfigurationswert lesen |
| `set_config_value(key, value)` | Konfigurationswert setzen |
| `get_sensor(id)` | Sensor-Objekt abrufen |
| `get_sensor_value(id)` | Aktuellen Messwert lesen |
| `actor_on(id, power)` | Aktor einschalten |
| `actor_off(id)` | Aktor ausschalten |
| `actor_set_power(id, power)` | Aktor-Leistung setzen (0-100%) |
| `get_kettle(id)` | Kessel-Objekt abrufen |
| `set_target_temp(id, temp)` | Kessel-Solltemperatur setzen |
| `get_fermenter(id)` | Fermenter-Objekt abrufen |
| `set_fermenter_target_temp(id, temp)` | Fermenter-Solltemperatur |
| `set_fermenter_target_pressure(id, p)` | Fermenter-Solldruck |

### 5.3 Property-System

Plugins definieren ihre Konfiguration über Property-Typen:

```python
@parameters([
    Property.Number("Temp", configurable=True, default_value=65, description="Zieltemperatur"),
    Property.Number("Timer", configurable=True, default_value=60, description="Timer in Minuten"),
    Property.Select("AutoMode", options=["Yes","No"], description="Auto Kettle Logic"),
    Property.Sensor("Sensor", description="Temperatursensor"),
    Property.Actor("Agitator", description="Rührwerk"),
    Property.Kettle("Kettle", description="Kessel")
])
class MeinMaischSchritt(CBPiStep):
    ...
```

### 5.4 Decorator-System

| Decorator | Verwendung |
|-----------|-----------|
| `@request_mapping(path, method)` | HTTP-Route registrieren |
| `@on_event(topic)` | Event-Bus Listener |
| `@action(key, parameters)` | UI-Button für Plugin |
| `@parameters([...])` | Step-Konfigurationsparameter |
| `@background_task(name, interval)` | Periodische Hintergrund-Aufgabe |
| `@on_startup(name, order)` | Startup-Hook (Reihenfolge konfigurierbar) |

### 5.5 Timer

```python
timer = Timer(duration_seconds, on_update=my_update, on_done=my_done)
timer.start()           # Starten
timer.stop()            # Pausieren (behält restliche Zeit)
timer.add(300)          # +5 Minuten
timer.format_time()     # "01:15:30" oder "2 01:15:30" (Tage)
timer.reset()           # Auf Originalwert zurücksetzen
```

### 5.6 Datenmodelle (dataclasses.py)

| Klasse | Felder |
|--------|--------|
| `Actor` | id, name, props, state, power, type, instance |
| `Sensor` | id, name, props, state, type, instance |
| `Kettle` | id, name, props, heater, agitator, sensor, target_temp, type, instance |
| `Fermenter` | id, name, props, sensor, pressure_sensor, heater, cooler, valve, target_temp, target_pressure, type, instance |
| `Step` | id, name, type, status, props, state_text, instance |
| `FermenterStep` | id, name, type, status, props, state_text, endtime, instance |
| `Config` | name, value, type, description, options |
| `Props` | Dynamisches Dictionary mit `get(key)` Zugriff |

---

## 6. Controller-Schicht (Business-Logik)

### 6.1 BasicController – CRUD-Basis

Alle Resource-Controller erben von `BasicController`:

```
BasicController
├── load()          → JSON von Festplatte lesen
├── save()          → JSON auf Festplatte schreiben
├── add(item)       → Neue Ressource erstellen + Auto-Save
├── update(item)    → Ressource aktualisieren + Auto-Save
├── delete(id)      → Ressource löschen + Auto-Save
├── start(id)       → Plugin-Instanz erstellen + async Task starten
├── stop(id)        → Running Task stoppen
├── call_action()   → Plugin-spezifische Methode aufrufen
└── push_udpate()   → WebSocket + MQTT Broadcasting
```

**Persistenz:** Jede Änderung wird sofort in JSON geschrieben.  
**Broadcasting:** Jede Änderung wird über WebSocket und MQTT verteilt.

### 6.2 StepController – Brauprozess-Orchestrierung

```
State Machine:
    ┌──────────┐     start()      ┌──────────┐
    │ INITIAL  │ ────────────────→ │  ACTIVE  │
    └──────────┘                   └────┬─────┘
                                        │
                          ┌─────────────┼─────────────┐
                          │             │             │
                     done(NEXT)    stop()       done(DONE)
                          │             │             │
                    ┌─────▼─────┐ ┌────▼─────┐ ┌────▼─────┐
                    │ Nächster  │ │   STOP   │ │   DONE   │
                    │  Step     │ │  (Pause) │ │          │
                    └───────────┘ └────┬─────┘ └──────────┘
                                       │
                                  start()
                                       │
                                  ┌────▼─────┐
                                  │  ACTIVE  │
                                  │ (Resume) │
                                  └──────────┘
```

### 6.3 Controller-Übersicht

| Controller | Datei | Funktion |
|------------|-------|----------|
| `ActorController` | actor_controller.py | on/off/toggle/set_power |
| `SensorController` | sensor_controller.py | Messwert-Zugriff |
| `KettleController` | kettle_controller.py | Heizlogik starten/stoppen |
| `StepController` | step_controller.py | Brauprozess orchestrieren |
| `RecipeController` | recipe_controller.py | Rezept CRUD (YAML) |
| `FermentationController` | fermentation_controller.py | Gärprozess |
| `FermenterRecipeController` | fermenter_recipe_controller.py | Gärrezepte |
| `ConfigController` | config_controller.py | Systemkonfiguration |
| `PluginController` | plugin_controller.py | Plugin-Laden |
| `DashboardController` | dashboard_controller.py | Widget-Layouts |
| `NotificationController` | notification_controller.py | Benachrichtigungen |
| `LogController` | log_file_controller.py | CSV/InfluxDB Logging |
| `SystemController` | system_controller.py | Backup/Restart |
| `UploadController` | upload_controller.py | Rezept-Import |
| `SatelliteController` | satellite_controller.py | MQTT-Verbindung |
| `JobController` | job_controller.py | Background Tasks |

---

## 7. HTTP-Endpunkte (REST-API)

### Komplette API-Übersicht

#### Aktoren `/actor/`
| Methode | Pfad | Beschreibung |
|---------|------|-------------|
| GET | `/actor/` | Alle Aktoren auflisten |
| GET | `/actor/{id}` | Einzelnen Aktor abrufen |
| POST | `/actor/` | Neuen Aktor erstellen |
| PUT | `/actor/{id}` | Aktor aktualisieren |
| DELETE | `/actor/{id}` | Aktor löschen |
| POST | `/actor/{id}/on` | Aktor einschalten |
| POST | `/actor/{id}/off` | Aktor ausschalten |
| POST | `/actor/{id}/action` | Benutzerdefinierte Aktion |

#### Sensoren `/sensor/`
| Methode | Pfad | Beschreibung |
|---------|------|-------------|
| GET | `/sensor/` | Alle Sensoren auflisten |
| GET | `/sensor/{id}` | Messwert eines Sensors |
| POST | `/sensor/` | Neuen Sensor erstellen |
| PUT | `/sensor/{id}` | Sensor aktualisieren |
| DELETE | `/sensor/{id}` | Sensor löschen |
| POST | `/sensor/{id}/action` | Sensor-Aktion |

#### Kessel `/kettle/`
| Methode | Pfad | Beschreibung |
|---------|------|-------------|
| GET | `/kettle/` | Alle Kessel auflisten |
| POST | `/kettle/` | Neuen Kessel erstellen |
| PUT | `/kettle/{id}` | Kessel aktualisieren |
| DELETE | `/kettle/{id}` | Kessel löschen |
| POST | `/kettle/{id}/target_temp` | Solltemperatur setzen |
| POST | `/kettle/{id}/toggle` | Heizlogik umschalten |

#### Maisch-Schritte `/step2/`
| Methode | Pfad | Beschreibung |
|---------|------|-------------|
| GET | `/step2/` | Alle Schritte auflisten |
| POST | `/step2/` | Neuen Schritt erstellen |
| POST | `/step2/start` | Brauprozess starten |
| POST | `/step2/next` | Nächster Schritt |
| POST | `/step2/stop` | Brauprozess pausieren |
| POST | `/step2/reset` | Alle Schritte zurücksetzen |
| PUT | `/step2/move` | Schritt-Reihenfolge ändern |
| POST | `/step2/action/{id}` | Schritt-Aktion (z.B. +5 Min) |
| POST | `/step2/savetobook` | Aktives Rezept speichern |

#### Rezepte `/recipe/`
| Methode | Pfad | Beschreibung |
|---------|------|-------------|
| GET | `/recipe/` | Alle Rezepte auflisten |
| GET | `/recipe/{name}` | Rezept-Details |
| POST | `/recipe/create` | Neues leeres Rezept |
| PUT | `/recipe/{name}` | Rezept speichern |
| DELETE | `/recipe/{name}` | Rezept löschen |
| POST | `/recipe/{name}/brew` | Rezept zum Brauen laden |
| POST | `/recipe/{id}/clone` | Rezept duplizieren |

#### Gärung `/fermenter/`
| Methode | Pfad | Beschreibung |
|---------|------|-------------|
| GET | `/fermenter/` | Alle Fermenter auflisten |
| POST | `/fermenter/` | Neuen Fermenter erstellen |
| PUT | `/fermenter/{id}` | Fermenter aktualisieren |
| DELETE | `/fermenter/{id}` | Fermenter löschen |
| POST | `/fermenter/{id}/toggle` | Fermenter-Logik umschalten |
| POST | `/fermenter/{id}/target_temp` | Zieltemperatur setzen |
| POST | `/fermenter/{id}/target_pressure` | Zieldruck setzen |

#### System `/system/`
| Methode | Pfad | Beschreibung |
|---------|------|-------------|
| GET | `/system/` | Gesamter Systemstatus |
| GET | `/system/backup` | Konfigurations-Backup (ZIP) |
| POST | `/system/restore` | Backup wiederherstellen |
| POST | `/system/restart` | System neustarten |
| POST | `/system/shutdown` | System herunterfahren |
| GET | `/system/logs` | Logdateien auflisten |
| GET | `/system/events` | Event-Bus Registry |
| GET | `/system/jobs` | Laufende Hintergrund-Jobs |

#### Weitere Endpunkte
| Pfad | Beschreibung |
|------|-------------|
| `/config/` | Systemkonfiguration lesen/schreiben |
| `/dashboard/` | Dashboard-Layouts verwalten |
| `/plugin/` | Plugins installieren/deinstallieren |
| `/log/` | Sensor-Logdaten abrufen/exportieren |
| `/notification/` | Benachrichtigungs-Callbacks |
| `/upload/` | Rezept-Import (BeerXML, KBH, Brewfather) |
| `/fermenterrecipe/` | Gärrezepte verwalten |
| `/login` | Authentifizierung |
| `/ws` | WebSocket für Echtzeit-Updates |

---

## 8. Eingebaute Plugins (Extensions)

### 8.1 Maisch-Schritte (mashstep)

| Schritt | Beschreibung | Parameter |
|---------|-------------|-----------|
| **MashInStep** | Aufheizen auf Einmaischtemperatur, optional Agitator | Temp, Kettle, AutoMode, Agitator |
| **MashStep** | Temperatur-Rast mit Timer | Temp, Timer, Kettle, AutoMode, Agitator |
| **BoilStep** | Kochen mit Hopfengabe-Alarmen (6 Slots) | Timer, Temp, Hop1-6, LidAlert, FirstWort |
| **CooldownStep** | Abkühlen mit Vorhersage (Polynomial Fitting) | Temp, Sensor, Actor, Cooldown-Sensor |
| **WaitStep** | Einfacher Countdown-Timer | Timer |
| **ToggleStep** | Aktor ein-/ausschalten | Actor, Toggle |
| **ActorStep** | Aktor für bestimmte Zeit aktivieren | Actor, Timer |
| **NotificationStep** | Benachrichtigung anzeigen | Title, Message, AutoNext |

**Besonderheit:** Alle Schritte unterstützen `AutoMode` – die Kessel-Heizlogik wird automatisch gestartet/gestoppt.

### 8.2 Gärungs-Schritte (FermentationStep)

| Schritt | Beschreibung |
|---------|-------------|
| **FermenterStep** | Haupt-Gärschritt (Tage + Stunden + Minuten Timer) |
| **FermenterTargetTempStep** | Aufheizen/Abkühlen bis Zieltemperatur |
| **FermenterRampTempStep** | Lineare Temperatur-Rampe (°C/Tag) |
| **FermenterNotificationStep** | Benachrichtigung während Gärung |

### 8.3 Regelungslogik

| Plugin | Typ | Beschreibung |
|--------|-----|-------------|
| **Hysteresis** | KettleLogic | Heizer ein/aus mit Offset-Schwellen |
| **FermenterHysteresis** | FermenterLogic | Heizer + Kühler Hysterese |
| **FermenterSpundingHysteresis** | FermenterLogic | Temperatur + Druck (Pulsventil) |
| **FermenterAutostart** | Extension | Auto-Start bei Boot |

### 8.4 Sensoren

| Plugin | Typ | Beschreibung |
|--------|-----|-------------|
| **OneWire** | Sensor | DS18B20 über 1-Wire Bus |
| **MQTTSensor** | Sensor | Werte über MQTT Topic (JSON-Parsing) |
| **HTTPSensor** | Sensor | Werte über REST-Endpunkt |
| **CustomSensor** | Sensor | Zufallswerte für Tests |
| **DummyPressure** | Sensor | Druck-Simulation |

### 8.5 Aktoren

| Plugin | Typ | Beschreibung |
|--------|-----|-------------|
| **GPIOActor** | Actor | Digital + Software-PWM |
| **GPIOPWMActor** | Actor | Hardware-PWM |
| **MQTTActor** | Actor | Standard MQTT (ON/OFF) |
| **GenericMqttActor** | Actor | Konfigurierbares Topic/Payload |
| **TasmotaMqttActor** | Actor | Tasmota-Geräte (cmnd/POWER) |
| **DummyActor** | Actor | Test ohne Hardware |

---

## 9. Deutsche UI-Anpassungen

### 9.1 Installation

```bash
cd custom_ui
chmod +x install_ui.sh
sudo ./install_ui.sh
```

Das Skript:
1. Findet das cbpi4ui-Build-Verzeichnis automatisch
2. Erstellt Backup der Original-`index.html`
3. Injiziert CSS, JavaScript und Google Fonts (Inter)
4. Setzt `<html lang="de">`
5. Startet CraftBeerPi neu

### 9.2 Übersetzungssystem (translate-de.js)

- **200+ Übersetzungen** in Key-Value Map
- **Sprachumschaltung** DE/EN über Button in der Navbar
- **Persistenz** via `localStorage` (`cbpi_language`)
- **DOM-Scanning:** Rekursive Textknotenersetzung
- **Dynamische Titel:** Seitentitel und Menübeschreibungen
- **SVG-Button-Labels:** Erkennt Aktoren über SVG-Pfadmuster

### 9.3 Theme-System (custom.css)

Drei Themes verfügbar:

| Theme | Akzentfarbe | Hintergrund |
|-------|-------------|-------------|
| **Dark** (Standard) | #34e89e (Türkis) | Tiefes Blau (#0a0e27) |
| **Light** | #34e89e (Türkis) | Weiß (#ffffff) |
| **Braumeister** | #9CCC65 (Hopfengrün) | Anthrazit (#1a1a2e) |

Features:
- 100+ CSS Custom Properties als zentrale Farbverwaltung
- Material-UI Komponenten-Overrides (Buttons, Cards, Tables, Inputs)
- Inter Font (Google Fonts) + JetBrains Mono für Code
- Gradient-Hintergründe, Box-Shadows, Custom Scrollbars
- Chart/SVG-Styling (Recharts-kompatibel)

---

## 10. Konfiguration & Datenformate

### 10.1 config.yaml (Statisch)

```yaml
name: CraftBeerPi           # Server-Name
port: 8000                   # HTTP-Port
index_url: /cbpi4ui/static/  # Frontend-URL
username: cbpi               # Login-Benutzername
password: cbpi               # Login-Passwort
mqtt: true                   # MQTT aktivieren
mqtt_host: localhost         # MQTT-Broker Adresse
mqtt_port: 1883              # MQTT-Broker Port
mqtt_username: ""            # MQTT-Benutzer
mqtt_password: ""            # MQTT-Passwort
```

### 10.2 config.json (Dynamisch)

Enthält alle zur Laufzeit änderbaren Parameter:
- Kessel-Kalibrierungen, Step-Typen, Sensor-Einheiten
- InfluxDB-Konfiguration, Dashboard-Anzahl
- Temperatureinheit (°C / °F), Autostart-Einstellungen

### 10.3 Rezept-Format (YAML)

```yaml
basic:
  name: Mein Pale Ale
  author: Max Mustermann
steps:
  - id: a7b3c2
    name: Einmaischen
    type: MashInStep
    props:
      Temp: 57
      Kettle: kettle-id-123
      AutoMode: "Yes"
      Agitator: actor-id-456
  - id: d4e5f6
    name: Maltoserast
    type: MashStep
    props:
      Temp: 63
      Timer: 30
      Kettle: kettle-id-123
  - id: g7h8i9
    name: Kochen
    type: BoilStep
    props:
      Timer: 60
      Temp: 99
      Hop_1: 15
      Hop_1_desc: "Bittering - Columbus"
```

### 10.4 Sensor-Logging (CSV)

Format: `./logs/sensor_{name}.log`
```csv
2026-04-11 14:30:00,65.3
2026-04-11 14:30:05,65.4
2026-04-11 14:30:10,65.5
```

---

## 11. MQTT & Satellite-System

### 11.1 MQTT-Topics (Senden)

| Topic | Beschreibung |
|-------|-------------|
| `cbpi/updateactor` | Aktor-Status Update |
| `cbpi/updatekettle` | Kessel-Status Update |
| `cbpi/updatesensor` | Sensor-Status Update |
| `cbpi/updatefermenter` | Fermenter-Status Update |
| `cbpi/actorupdate/{id}` | Einzelner Aktor-Status |
| `cbpi/kettleupdate/{id}` | Einzelner Kessel-Status |
| `cbpi/sensorupdate/{id}` | Einzelner Sensor-Status |
| `cbpi/fermenterupdate/{id}` | Einzelner Fermenter-Status |

### 11.2 MQTT-Topics (Empfangen)

| Topic | Payload | Beschreibung |
|-------|---------|-------------|
| `cbpi/actor/{id}/on` | `{}` | Aktor einschalten |
| `cbpi/actor/{id}/off` | `{}` | Aktor ausschalten |
| `cbpi/actor/{id}/power` | `{"power": 80}` | Leistung setzen |

### 11.3 Satellite-System

Satelliten sind entfernte Geräte (RPi, ESP32), die über WebSocket
unter `/satellite` mit dem Hauptserver kommunizieren. Sie verwenden
dasselbe Nachrichtenformat wie die reguläre WebSocket-Verbindung.

---

## 12. Plugin-Entwicklung

### 12.1 Plugin erstellen

```bash
cbpi create
# → Fragt nach Plugin-Name
# → Erstellt cbpi4_meinplugin/ Verzeichnis aus Template
```

### 12.2 Aktor-Plugin Beispiel

```python
from cbpi.api import *

@parameters([
    Property.Select("GPIO", options=list(range(1,28))),
    Property.Select("Inverted", options=["Yes", "No"])
])
class MeinAktor(CBPiActor):

    async def on_start(self):
        self.gpio = int(self.props.get("GPIO", 0))
        self.inverted = self.props.get("Inverted", "No") == "Yes"

    async def on(self, power=100):
        # Hardware einschalten
        self.state = True

    async def off(self):
        # Hardware ausschalten
        self.state = False

    async def run(self):
        while self.running:
            await asyncio.sleep(1)

    def get_state(self):
        return dict(state=self.state, power=self.power)

def setup(cbpi):
    cbpi.plugin.register("Mein Aktor", MeinAktor)
```

### 12.3 Sensor-Plugin Beispiel

```python
@parameters([
    Property.Number("Interval", default_value=5),
    Property.Number("Offset", default_value=0)
])
class MeinSensor(CBPiSensor):

    async def run(self):
        while self.running:
            value = await self.read_from_hardware()
            value += float(self.props.get("Offset", 0))
            self.push_update(value)
            await asyncio.sleep(int(self.props.get("Interval", 5)))

def setup(cbpi):
    cbpi.plugin.register("Mein Sensor", MeinSensor)
```

### 12.4 Plugin installieren

```bash
cd cbpi4_meinplugin/
pip install -e .
# Oder über die UI: /plugin/install/
```

---

## 13. Deployment & Installation

### 13.1 Raspberry Pi (Native)

```bash
# 1. System vorbereiten
sudo apt update && sudo apt upgrade
sudo apt install python3-pip python3-venv

# 2. CraftBeerPi installieren
pip3 install cbpi4
pip3 install cbpi4ui

# 3. Setup ausführen
cbpi setup

# 4. Deutsche UI installieren
cd custom_ui && sudo ./install_ui.sh

# 5. Server starten
cbpi start

# 6. Autostart aktivieren
cbpi autostart on
```

### 13.2 Docker

```bash
docker build -t craftbeerpi4 .
docker run -d \
  -p 8000:8000 \
  -v ./config:/craftbeerpi/config \
  --name cbpi \
  craftbeerpi4
```

### 13.3 Entwicklungsumgebung

```bash
# VS Code Dev Container
# .devcontainer/ enthält:
# - CraftBeerPi Container
# - Mosquitto MQTT-Broker
# - MQTT Explorer (Test-Tool)
```

### 13.4 systemd Service

```ini
[Unit]
Description=CraftBeerPi4 Brewing Controller
After=network.target

[Service]
ExecStart=/usr/local/bin/cbpi start
WorkingDirectory=/home/pi
Restart=always

[Install]
WantedBy=multi-user.target
```

---

## 14. Tests

### Teststruktur

Die Testsuite umfasst **15 Testmodule** unter `tests/`:

| Testdatei | Prüft |
|-----------|-------|
| test_actor.py | Aktor CRUD + on/off/toggle |
| test_sensor.py | Sensor CRUD + Messwerte |
| test_kettle.py | Kessel-Logik + Temperatursteuerung |
| test_step.py | Step-Ausführung + State Machine |
| test_recipe.py | Rezept CRUD + Brew/Clone |
| test_dashboard.py | Dashboard-Widgets |
| test_config.py | Konfigurationsverwaltung |
| test_gpio.py | GPIO-Aktor (mit Mock) |
| test_notification_controller.py | Benachrichtigungen |
| test_logger.py | Datalogging |
| test_cli.py | CLI-Kommandos |
| test_index.py | Index/Liste Tests |
| test_ws.py | WebSocket-Verbindung |
| test_system.py | System-Controller |

### Tests ausführen

```bash
cd tests/
pytest
# oder einzeln:
pytest test_actor.py -v
```

### E2E-Tests (Playwright)

Die Dateien `test-startpage*.mjs` testen die UI mit Playwright:
- Dashboard/Cockpit-Wechsel
- Spracheinstellungen
- Navigation und Routing

---

## 15. Bekannte Probleme & Verbesserungspotenzial

### Code-Qualität

| Problem | Datei(en) | Schwere |
|---------|-----------|---------|
| Typo `push_udpate` statt `push_update` | basic_controller2.py | Niedrig (konsistent) |
| `print()` Debug-Ausgaben in Produktion | Mehrere Dateien | Niedrig |
| Generisches Exception-Handling (`pass`) | base.py, sensor.py | Mittel |
| Duplizierter Code (kettle_logic ↔ fermenter_logic) | api/ | Niedrig |
| `toogle()` statt `toggle()` | actor_controller.py | Niedrig |

### Sicherheit

| Problem | Datei | Schwere |
|---------|-------|---------|
| Klartext-Passwort Vergleich | http_login.py | Hoch |
| Standard-Credentials (cbpi/cbpi) | config.yaml | Mittel |
| Keine Rate-Limiting bei Login | http_login.py | Mittel |
| `auth_required=False` global | http_endpoints/ | Mittel |
| Kein HTTPS erzwungen | craftbeerpi.py | Mittel |

### Architektur

| Problem | Beschreibung | Schwere |
|---------|-------------|---------|
| N+1 Sensor-Abfrage | translate-de.js macht einzelne API-Calls pro Sensor | Mittel |
| Kein Transaktionsschutz | Concurrent Step start/stop kann Race Condition erzeugen | Mittel |
| CSS !important-Kaskade | custom.css hat viele Spezifitätskonflikte | Niedrig |
| Hardcoded Pfade in Tests | test-startpage.mjs verwendet feste IP | Niedrig |
| Kein Rezept-Schema-Validation | Rezepte werden ohne Prüfung geladen | Mittel |

### Verbesserungsvorschläge

1. **Passwort-Hashing** mit bcrypt/argon2 statt Klartext-Vergleich
2. **Batch-API** für Sensorwerte `/sensor/values` statt N einzelner Calls
3. **Schema-Validierung** für Rezept-Import (JSON Schema oder Pydantic)
4. **Structured Logging** statt print()-Ausgaben
5. **Type Hints** durchgängig für bessere IDE-Unterstützung
6. **Rate Limiting** für Login und API-Endpunkte
7. **Unit-Tests** für Extensions (mashstep, hysteresis etc.)
8. **CSS-Refactoring** mit CSS Modules oder Tailwind

---

## Anhang: Abhängigkeiten

### Python-Pakete (requirements.txt)

| Paket | Version | Zweck |
|-------|---------|-------|
| aiohttp | 3.8.1 | Async HTTP-Server |
| asyncio-mqtt | latest | MQTT-Client |
| aiosqlite | 0.17.0 | Async SQLite |
| numpy | 1.22.2 | Numerische Berechnungen |
| pandas | 1.4.1 | Datenanalyse/Resampling |
| cryptography | 36.0.1 | Session-Verschlüsselung |
| cbpi4ui | latest | React-Frontend |
| RPi.GPIO | 0.7.1 | GPIO (nur auf RPi) |
| click | latest | CLI-Framework |
| PyInquirer | latest | Interaktive CLI-Prompts |
| pyfiglet | latest | ASCII-Art Logo |
| shortuuid | latest | UUID-Generierung |
| voluptuous | latest | Schema-Validierung |
| tabulate | latest | Tabellenformatierung |
| psutil | latest | Systeminfo |
| jinja2 | latest | Template-Engine |

---

*Generiert am 11. April 2026 durch vollständige Code-Analyse aller 80+ Quelldateien.*
