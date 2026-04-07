#!/bin/bash
# CraftBeerPi4 UI Customization Installer
# Installiert modernes Design + deutsche Übersetzung
#
# Verwendung:
#   cd craftbeerpi4-german-ui/custom_ui
#   chmod +x install_ui.sh
#   ./install_ui.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# cbpi4ui Build-Verzeichnis automatisch finden
UI_DIR=$(python3 -c "import cbpi4ui, os; print(os.path.join(os.path.dirname(cbpi4ui.__file__), 'build'))" 2>/dev/null)
if [ -z "$UI_DIR" ] || [ ! -d "$UI_DIR" ]; then
    echo "FEHLER: cbpi4ui Build-Verzeichnis nicht gefunden!"
    echo "Stelle sicher, dass CraftBeerPi4 installiert ist und die venv aktiviert ist."
    echo "  source ~/cbpi4_venv/bin/activate"
    exit 1
fi

echo "=== CraftBeerPi4 UI Modernisierung ==="
echo "UI-Verzeichnis: $UI_DIR"

# Backup der Original-Dateien
if [ ! -f "$UI_DIR/index.html.bak" ]; then
    echo "Erstelle Backup von index.html..."
    cp "$UI_DIR/index.html" "$UI_DIR/index.html.bak"
fi

# Custom-Dateien kopieren
echo "Kopiere custom.css..."
cp "$SCRIPT_DIR/custom.css" "$UI_DIR/static/css/custom.css"

echo "Kopiere translate-de.js..."
cp "$SCRIPT_DIR/translate-de.js" "$UI_DIR/static/js/translate-de.js"

# index.html patchen: Inter Font laden + Custom CSS + Übersetzungs-Script
echo "Patche index.html..."
# Die neue index.html wird aus dem Backup erstellt
cp "$UI_DIR/index.html.bak" "$UI_DIR/index.html"

# Inter Font hinzufügen (vor </head>)
sed -i 's|</head>|<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700\&display=swap" rel="stylesheet"><link href="./static/css/custom.css" rel="stylesheet"></head>|' "$UI_DIR/index.html"

# Übersetzungs-Script hinzufügen (vor </body>)
sed -i 's|</body>|<script src="./static/js/translate-de.js"></script></body>|' "$UI_DIR/index.html"

# HTML lang auf de setzen
sed -i 's|<html lang="en">|<html lang="de">|' "$UI_DIR/index.html"

echo "=== Installation abgeschlossen ==="
echo "Starte CraftBeerPi neu..."
sudo systemctl restart craftbeerpi
sleep 3
sudo systemctl status craftbeerpi --no-pager -l | head -15
echo ""
echo "Oeffne http://$(hostname -I | awk '{print $1}'):8000 im Browser"
