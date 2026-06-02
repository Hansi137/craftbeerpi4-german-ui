#!/bin/bash
# Deploy translate-de.js + optionale Python-Patches auf den Pi
# Verwendung: bash deploy.sh [--restart]

PI="pi@192.168.178.93"
REPO="/home/pi/craftbeerpi4-german-ui"
CBPI4GUI="/home/pi/cbpi4_venv/lib/python3.11/site-packages/cbpi4gui/build/static/js"
CBPI4UI="/home/pi/cbpi4_venv/lib/python3.11/site-packages/cbpi4ui/build/static/js"

echo "==> Deploying translate-de.js..."
scp custom_ui/translate-de.js "$PI:$REPO/custom_ui/translate-de.js"
ssh "$PI" "cp $REPO/custom_ui/translate-de.js $CBPI4GUI/translate-de.js && cp $REPO/custom_ui/translate-de.js $CBPI4UI/translate-de.js"
echo "    OK: alle 3 Pfade aktualisiert"

echo "==> Deploying Python backend..."
scp cbpi/controller/notification_controller.py "$PI:$REPO/cbpi/controller/notification_controller.py"
scp cbpi/extension/hysteresis/__init__.py      "$PI:$REPO/cbpi/extension/hysteresis/__init__.py"
scp cbpi/extension/onewire/__init__.py         "$PI:$REPO/cbpi/extension/onewire/__init__.py"
echo "    OK: Python-Dateien aktualisiert"

if [[ "$1" == "--restart" ]]; then
  echo "==> Service neu starten..."
  ssh "$PI" "sudo systemctl restart craftbeerpi"
  sleep 5
  ssh "$PI" "sudo systemctl is-active craftbeerpi"
fi

echo "==> Fertig. Bitte Ctrl+Shift+R im Browser."
