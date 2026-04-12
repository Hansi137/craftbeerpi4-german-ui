#!/bin/bash
# ================================================================
# CraftBeerPi4 German UI – Installationsskript für Raspberry Pi
# ================================================================
# Getestet mit: Raspberry Pi 4 Model B, Pi OS Bookworm (64-bit), Python 3.11
# Fork: https://github.com/Hansi137/craftbeerpi4-german-ui.git
#
# Ausführen als:
#   sudo bash install_pi.sh
#
# Was dieses Script macht:
#   1. Systempakete installieren (python3, git, etc.)
#   2. 1-Wire für DS18B20 Temperatursensoren konfigurieren
#   3. Python Virtual Environment erstellen
#   4. CraftBeerPi4 + Abhängigkeiten installieren
#   5. Custom UI (deutsche Übersetzung, Themes, UX) deployen
#   6. cbpi setup (Konfigurationsordner anlegen)
#   7. Systemd-Service einrichten (Autostart)
#   8. Optional: iSpindle-Plugin installieren
# ================================================================

set -e

# ──────────────────────────────────────────────
# FARBEN FÜR AUSGABE
# ──────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info()  { echo -e "${BLUE}[INFO]${NC}  $1"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
fail()  { echo -e "${RED}[FAIL]${NC}  $1"; }

# ──────────────────────────────────────────────
# 1. SYSTEM-CHECK
# ──────────────────────────────────────────────
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN} CraftBeerPi4 – German UI Edition${NC}"
echo -e "${GREEN} Installationsskript${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

if [ "$EUID" -ne 0 ]; then
    fail "Bitte als root ausführen: sudo bash install_pi.sh"
    exit 1
fi

REAL_USER=${SUDO_USER:-pi}
REAL_HOME=$(eval echo "~$REAL_USER")
CBPI_SOURCE_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_DIR="$REAL_HOME/cbpi4_venv"

info "Benutzer:     $REAL_USER"
info "Home:         $REAL_HOME"
info "Quelle:       $CBPI_SOURCE_DIR"
info "Virtual Env:  $VENV_DIR"
echo ""

# ──────────────────────────────────────────────
# 2. SYSTEMPAKETE
# ──────────────────────────────────────────────
echo -e "${BLUE}[1/8] Systempakete installieren...${NC}"

# needrestart-Dialog unterdrücken (blockiert sonst non-interaktive Installation)
export DEBIAN_FRONTEND=noninteractive
export NEEDRESTART_MODE=a
export NEEDRESTART_SUSPEND=1

apt-get update -y
apt-get -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" install \
    python3 python3-pip python3-venv python3-dev \
    git build-essential libssl-dev libffi-dev \
    libatlas-base-dev

ok "Systempakete installiert."
echo ""

# ──────────────────────────────────────────────
# 3. PYTHON VERSION PRÜFEN
# ──────────────────────────────────────────────
echo -e "${BLUE}[2/8] Python-Version prüfen...${NC}"

PYTHON_VERSION=$(python3 --version 2>&1 | grep -oP '\d+\.\d+')
if python3 -c "import sys; exit(0 if sys.version_info >= (3,11) else 1)"; then
    ok "Python $PYTHON_VERSION"
else
    warn "Python $PYTHON_VERSION gefunden. Python >= 3.11 empfohlen."
    warn "Fortfahren auf eigene Gefahr..."
    sleep 3
fi
echo ""

# ──────────────────────────────────────────────
# 4. 1-WIRE (DS18B20 TEMPERATURSENSOREN)
# ──────────────────────────────────────────────
echo -e "${BLUE}[3/8] 1-Wire konfigurieren (DS18B20)...${NC}"

# Raspberry Pi OS Bookworm: /boot/firmware/config.txt
# Älteres Pi OS: /boot/config.txt
if [ -f /boot/firmware/config.txt ]; then
    BOOT_CONFIG="/boot/firmware/config.txt"
else
    BOOT_CONFIG="/boot/config.txt"
fi

if grep -q "dtoverlay=w1-gpio" "$BOOT_CONFIG"; then
    ok "1-Wire bereits konfiguriert in $BOOT_CONFIG"
else
    echo "dtoverlay=w1-gpio,gpiopin=4,pullup=on" >> "$BOOT_CONFIG"
    ok "1-Wire Overlay hinzugefügt → Reboot nach Installation erforderlich!"
fi

# Kernelmodule laden (für aktuelle Session)
modprobe w1-gpio 2>/dev/null || true
modprobe w1-therm 2>/dev/null || true
echo ""

# ──────────────────────────────────────────────
# 5. VIRTUAL ENVIRONMENT ERSTELLEN
# ──────────────────────────────────────────────
echo -e "${BLUE}[4/8] Python Virtual Environment...${NC}"

if [ -d "$VENV_DIR" ]; then
    warn "Bestehende venv gefunden: $VENV_DIR"
    warn "Wird gelöscht und neu erstellt..."
    rm -rf "$VENV_DIR"
fi

sudo -u "$REAL_USER" python3 -m venv "$VENV_DIR"
ok "Virtual Environment erstellt: $VENV_DIR"
echo ""

# ──────────────────────────────────────────────
# 6. CRAFTBEERPI4 INSTALLIEREN
# ──────────────────────────────────────────────
echo -e "${BLUE}[5/8] CraftBeerPi4 installieren...${NC}"

sudo -u "$REAL_USER" "$VENV_DIR/bin/pip" install --upgrade pip setuptools wheel
info "pip + setuptools aktualisiert"

sudo -u "$REAL_USER" "$VENV_DIR/bin/pip" install -r "$CBPI_SOURCE_DIR/requirements.txt"
info "Abhängigkeiten installiert"

sudo -u "$REAL_USER" "$VENV_DIR/bin/pip" install -e "$CBPI_SOURCE_DIR"
ok "CraftBeerPi4 installiert (editable mode)"
echo ""

# ──────────────────────────────────────────────
# 7. CUSTOM UI DEPLOYEN
# ──────────────────────────────────────────────
echo -e "${BLUE}[6/8] Custom UI deployen (Deutsch, Themes, UX)...${NC}"

# Zielverzeichnis im site-packages der cbpi4ui finden
CBPI4UI_DIR=$(find "$VENV_DIR" -path "*/cbpi4ui/build/static" -type d 2>/dev/null | head -1)

if [ -z "$CBPI4UI_DIR" ]; then
    fail "cbpi4ui nicht gefunden! Wurde cbpi4ui korrekt installiert?"
    warn "Versuche manuellen Pfad..."
    CBPI4UI_DIR="$VENV_DIR/lib/python${PYTHON_VERSION}/site-packages/cbpi4ui/build/static"
fi

CUSTOM_UI_DIR="$CBPI_SOURCE_DIR/custom_ui"

if [ -f "$CUSTOM_UI_DIR/translate-de.js" ]; then
    cp "$CUSTOM_UI_DIR/translate-de.js" "$CBPI4UI_DIR/js/translate-de.js"
    chown "$REAL_USER:$REAL_USER" "$CBPI4UI_DIR/js/translate-de.js"
    ok "translate-de.js → $CBPI4UI_DIR/js/"
else
    fail "translate-de.js nicht gefunden in $CUSTOM_UI_DIR!"
fi

if [ -f "$CUSTOM_UI_DIR/custom.css" ]; then
    cp "$CUSTOM_UI_DIR/custom.css" "$CBPI4UI_DIR/css/custom.css"
    chown "$REAL_USER:$REAL_USER" "$CBPI4UI_DIR/css/custom.css"
    ok "custom.css → $CBPI4UI_DIR/css/"
else
    fail "custom.css nicht gefunden in $CUSTOM_UI_DIR!"
fi

# index.html patchen: Custom JS + CSS einbinden
INDEX_HTML="$(dirname "$CBPI4UI_DIR")/index.html"
if [ -f "$INDEX_HTML" ]; then
    # Nur patchen wenn noch nicht vorhanden
    if ! grep -q "translate-de.js" "$INDEX_HTML"; then
        sed -i 's|</body>|<script src="./static/js/translate-de.js"></script></body>|' "$INDEX_HTML"
        ok "index.html: translate-de.js eingebunden"
    else
        ok "index.html: translate-de.js bereits vorhanden"
    fi
    if ! grep -q "custom.css" "$INDEX_HTML"; then
        sed -i 's|</head>|<link href="./static/css/custom.css" rel="stylesheet"></head>|' "$INDEX_HTML"
        ok "index.html: custom.css eingebunden"
    else
        ok "index.html: custom.css bereits vorhanden"
    fi
else
    fail "index.html nicht gefunden: $INDEX_HTML"
fi

# Auch in den Source-Ordner kopieren (für Backup)
if [ "$CBPI_SOURCE_DIR" != "$REAL_HOME/Craftbeerpi4" ] && [ -d "$REAL_HOME/Craftbeerpi4/custom_ui" ]; then
    cp "$CUSTOM_UI_DIR/translate-de.js" "$REAL_HOME/Craftbeerpi4/custom_ui/translate-de.js" 2>/dev/null || true
    cp "$CUSTOM_UI_DIR/custom.css" "$REAL_HOME/Craftbeerpi4/custom_ui/custom.css" 2>/dev/null || true
fi
echo ""

# ──────────────────────────────────────────────
# 8. CBPI SETUP (KONFIGURATION ANLEGEN)
# ──────────────────────────────────────────────
echo -e "${BLUE}[7/8] CraftBeerPi4 Konfiguration anlegen...${NC}"

sudo -u "$REAL_USER" bash -c "
    export PATH=\"$VENV_DIR/bin:\$PATH\"
    cd \"$REAL_HOME\"
    cbpi setup
"
ok "Konfiguration erstellt in $REAL_HOME/config/"
echo ""

# ──────────────────────────────────────────────
# 9. SYSTEMD SERVICE EINRICHTEN
# ──────────────────────────────────────────────
echo -e "${BLUE}[8/8] Systemd-Service einrichten...${NC}"

SERVICE_FILE="/etc/systemd/system/craftbeerpi.service"
cat > "$SERVICE_FILE" << EOF
[Unit]
Description=CraftBeerPi 4
After=network.target

[Service]
User=$REAL_USER
WorkingDirectory=$REAL_HOME
ExecStart=$VENV_DIR/bin/cbpi start
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable craftbeerpi.service
ok "Service aktiviert (Autostart beim Booten)"
echo ""

# ──────────────────────────────────────────────
# 10. ISPINDLE PLUGIN (OPTIONAL)
# ──────────────────────────────────────────────
echo ""
read -p "iSpindle-Plugin installieren? (j/n): " INSTALL_ISPINDLE
if [ "$INSTALL_ISPINDLE" = "j" ] || [ "$INSTALL_ISPINDLE" = "J" ] || [ "$INSTALL_ISPINDLE" = "y" ]; then
    info "Installiere cbpi4-iSpindle..."
    sudo -u "$REAL_USER" "$VENV_DIR/bin/pip" install cbpi4-iSpindle
    ok "iSpindle-Plugin installiert"
else
    info "iSpindle-Plugin übersprungen."
fi

# ──────────────────────────────────────────────
# ABSCHLUSS
# ──────────────────────────────────────────────
IP_ADDR=$(hostname -I 2>/dev/null | awk '{print $1}')
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN} Installation abgeschlossen!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "  Nächste Schritte:"
echo ""
echo "  1. Raspberry Pi neu starten:"
echo -e "     ${YELLOW}sudo reboot${NC}"
echo ""
echo "  2. Nach dem Reboot startet CraftBeerPi automatisch."
echo "     Manuell starten/stoppen:"
echo -e "     ${YELLOW}sudo systemctl start craftbeerpi${NC}"
echo -e "     ${YELLOW}sudo systemctl stop craftbeerpi${NC}"
echo ""
echo "  3. Web-UI im Browser öffnen:"
echo -e "     ${GREEN}http://${IP_ADDR}:8000${NC}"
echo ""
echo -e "  ${YELLOW}⚠  WICHTIG: Beim ersten Aufruf Strg+F5 drücken (Hard Reload)!${NC}"
echo "     Sonst zeigt der Browser-Cache alte Dateien an."
echo ""
echo "  Logs prüfen:"
echo -e "     ${YELLOW}sudo journalctl -u craftbeerpi -f${NC}"
echo ""
echo "  DS18B20 Sensoren testen:"
echo -e "     ${YELLOW}ls /sys/bus/w1/devices/${NC}"
echo "     (Geräte beginnen mit '28-')"
echo ""
echo -e "${GREEN}========================================${NC}"
