/**
 * CraftBeerPi 4 - Verbesserte UI mit Sprachumschalter
 * Enthält: Übersetzungen DE/EN, Menübeschreibungen, Hilfe-Tooltips, Onboarding
 */
(function () {
  'use strict';

  // ============================================================
  // SPRACH-SYSTEM
  // ============================================================
  var LANG_KEY = 'cbpi_language';
  var currentLang = localStorage.getItem(LANG_KEY) || 'de';

  // ============================================================
  // ZENTRALE SENSOR-WERT-ABFRAGE
  // /sensor/ Liste liefert nur state:false, echte Werte kommen von /sensor/{id}
  // ============================================================
  function fetchSensorValues(sensorIds) {
    // Gibt Promise zurück: { sensorId: numericValue, ... }
    var unique = [];
    sensorIds.forEach(function (id) { if (id && unique.indexOf(id) === -1) unique.push(id); });
    if (unique.length === 0) return Promise.resolve({});
    return Promise.all(unique.map(function (id) {
      return fetch('/sensor/' + encodeURIComponent(id))
        .then(function (r) { return r.json(); })
        .then(function (d) { return { id: id, value: d.value }; })
        .catch(function () { return { id: id, value: null }; });
    })).then(function (results) {
      var map = {};
      results.forEach(function (r) { map[r.id] = r.value; });
      return map;
    });
  }

  var translations = {
    'Settings': { de: 'Einstellungen', en: 'Settings' },
    'Dashboard': { de: 'Anlagenbild', en: 'Dashboard' },
    'Hardware': { de: 'Hardware', en: 'Hardware' },
    'Plugins': { de: 'Erweiterungen', en: 'Plugins' },
    'System': { de: 'System', en: 'System' },
    'About': { de: 'Über', en: 'About' },
    'Analytics': { de: 'Statistiken', en: 'Analytics' },
    'Recipe Book': { de: 'Rezeptbuch', en: 'Recipe Book' },
    'Recipes': { de: 'Rezepte', en: 'Recipes' },
    'Profile': { de: 'Profil', en: 'Profile' },
    'Mash Profile': { de: 'Brauplan', en: 'Brew Plan' },
    'Mash Steps': { de: 'Maisch-Schritte', en: 'Mash Steps' },
    'Brew Steps': { de: 'Brau-Schritte', en: 'Brew Steps' },
    'Steps': { de: 'Schritte', en: 'Steps' },
    'Step Config': { de: 'Schritt-Konfiguration', en: 'Step Config' },
    'Step Saved': { de: 'Schritt gespeichert', en: 'Step Saved' },
    'Step added': { de: 'Schritt hinzugefügt', en: 'Step added' },
    'Active Recipe': { de: 'Aktives Rezept', en: 'Active Recipe' },
    'New Recipe': { de: 'Neues Rezept', en: 'New Recipe' },
    'Clone Recipe': { de: 'Rezept klonen', en: 'Clone Recipe' },
    'Delete Recipe': { de: 'Rezept löschen', en: 'Delete Recipe' },
    'Target Temp': { de: 'Zieltemperatur', en: 'Target Temp' },
    'Volume Calculator': { de: 'Volumenrechner', en: 'Volume Calculator' },
    'Calculator': { de: 'Rechner', en: 'Calculator' },
    'Sensor': { de: 'Sensor', en: 'Sensor' },
    'Sensor Config': { de: 'Sensor-Konfiguration', en: 'Sensor Config' },
    'Sensor Data': { de: 'Sensor-Daten', en: 'Sensor Data' },
    'Sensor Type': { de: 'Sensor-Typ', en: 'Sensor Type' },
    'Delete Sensor': { de: 'Sensor löschen', en: 'Delete Sensor' },
    'Sensor not Found': { de: 'Sensor nicht gefunden', en: 'Sensor not Found' },
    'Actor': { de: 'Aktor', en: 'Actor' },
    'Actor Config': { de: 'Aktor-Konfiguration', en: 'Actor Config' },
    'Delete Actir': { de: 'Aktor löschen', en: 'Delete Actor' },
    'Actor not found': { de: 'Aktor nicht gefunden', en: 'Actor not found' },
    'Actor not Found': { de: 'Aktor nicht gefunden', en: 'Actor not Found' },
    'Kettle': { de: 'Kessel', en: 'Kettle' },
    'Kettle Config': { de: 'Kessel-Konfiguration', en: 'Kettle Config' },
    'Delete Kettle': { de: 'Kessel löschen', en: 'Delete Kettle' },
    'Kettle not Found': { de: 'Kessel nicht gefunden', en: 'Kettle not Found' },
    'Heater': { de: 'Heizung', en: 'Heater' },
    'Agitator': { de: 'Rührwerk', en: 'Agitator' },
    'Fermenter': { de: 'Gärbehälter', en: 'Fermenter' },
    'Tank': { de: 'Tank', en: 'Tank' },
    'Led': { de: 'LED', en: 'Led' },
    'Temp': { de: 'Temperatur', en: 'Temp' },
    'Timer': { de: 'Timer', en: 'Timer' },
    'AutoMode': { de: 'Automatik', en: 'AutoMode' },
    'AutoNext': { de: 'Auto-Weiter', en: 'AutoNext' },
    'LidAlert': { de: 'Deckel-Warnung', en: 'LidAlert' },
    'First_Wort': { de: 'Vorderwürze', en: 'First_Wort' },
    'Hop_1': { de: 'Hopfen 1', en: 'Hop_1' },
    'Hop_2': { de: 'Hopfen 2', en: 'Hop_2' },
    'Hop_3': { de: 'Hopfen 3', en: 'Hop_3' },
    'Hop_4': { de: 'Hopfen 4', en: 'Hop_4' },
    'Hop_5': { de: 'Hopfen 5', en: 'Hop_5' },
    'Hop_6': { de: 'Hopfen 6', en: 'Hop_6' },
    'Pressure': { de: 'Druck', en: 'Pressure' },
    'RampRate': { de: 'Anstiegsrate', en: 'RampRate' },
    'TimerD': { de: 'Timer Tage', en: 'TimerD' },
    'TimerH': { de: 'Timer Std.', en: 'TimerH' },
    'TimerM': { de: 'Timer Min.', en: 'TimerM' },
    'toggle_type': { de: 'Schalttyp', en: 'toggle_type' },
    'Name': { de: 'Name', en: 'Name' },
    'Type': { de: 'Typ', en: 'Type' },
    'Value': { de: 'Wert', en: 'Value' },
    'Parameter': { de: 'Parameter', en: 'Parameter' },
    'Description': { de: 'Beschreibung', en: 'Description' },
    'Properties': { de: 'Eigenschaften', en: 'Properties' },
    'State': { de: 'Status', en: 'State' },
    'Logic': { de: 'Logik', en: 'Logic' },
    'Filter': { de: 'Filter', en: 'Filter' },
    'Layer': { de: 'Ebene', en: 'Layer' },
    'Author': { de: 'Autor', en: 'Author' },
    'Basic Data': { de: 'Grunddaten', en: 'Basic Data' },
    'New Name': { de: 'Neuer Name', en: 'New Name' },
    'No Name': { de: 'Kein Name', en: 'No Name' },
    'Save': { de: 'Speichern', en: 'Save' },
    'Delete': { de: 'Löschen', en: 'Delete' },
    'Cancel': { de: 'Abbrechen', en: 'Cancel' },
    'Close': { de: 'Schließen', en: 'Close' },
    'Create': { de: 'Erstellen', en: 'Create' },
    'Submit': { de: 'Absenden', en: 'Submit' },
    'Refresh': { de: 'Aktualisieren', en: 'Refresh' },
    'Download': { de: 'Herunterladen', en: 'Download' },
    'Upload': { de: 'Hochladen', en: 'Upload' },
    'Start': { de: 'Starten', en: 'Start' },
    'Stop': { de: 'Stoppen', en: 'Stop' },
    'Pause': { de: 'Pause', en: 'Pause' },
    'Done': { de: 'Fertig', en: 'Done' },
    'Set': { de: 'Setzen', en: 'Set' },
    'Clear': { de: 'Leeren', en: 'Clear' },
    'Clear Dashboard': { de: 'Übersicht leeren', en: 'Clear Dashboard' },
    'Edit': { de: 'Bearbeiten', en: 'Edit' },
    'Add': { de: 'Hinzufügen', en: 'Add' },
    'ADD': { de: 'HINZUFÜGEN', en: 'ADD' },
    'Remove': { de: 'Entfernen', en: 'Remove' },
    'Next': { de: 'Weiter', en: 'Next' },
    'Actions': { de: 'Aktionen', en: 'Actions' },
    'Active': { de: 'Aktiv', en: 'Active' },
    'Inactive': { de: 'Inaktiv', en: 'Inactive' },
    'Yes': { de: 'Ja', en: 'Yes' },
    'No': { de: 'Nein', en: 'No' },
    'Error': { de: 'Fehler', en: 'Error' },
    'ERROR': { de: 'FEHLER', en: 'ERROR' },
    'Summary': { de: 'Zusammenfassung', en: 'Summary' },
    'Log': { de: 'Protokoll', en: 'Log' },
    'Dashboard Saved': { de: 'Übersicht gespeichert', en: 'Dashboard Saved' },
    'Widget': { de: 'Widget', en: 'Widget' },
    'Clock': { de: 'Uhr', en: 'Clock' },
    'Text': { de: 'Text', en: 'Text' },
    'Liquid': { de: 'Flüssigkeit', en: 'Liquid' },
    'Logo': { de: 'Logo', en: 'Logo' },
    'Diameter': { de: 'Durchmesser', en: 'Diameter' },
    'Height': { de: 'Höhe', en: 'Height' },
    'From Top': { de: 'Von oben', en: 'From Top' },
    'Flow Left': { de: 'Fluss links', en: 'Flow Left' },
    'Flow Right': { de: 'Fluss rechts', en: 'Flow Right' },
    'Brewery Name': { de: 'Brauerei-Name', en: 'Brewery Name' },
    'Config Missing': { de: 'Konfiguration fehlt', en: 'Config Missing' },
    'Missing Config': { de: 'Fehlende Konfiguration', en: 'Missing Config' },
    'MISSING CONFIG': { de: 'FEHLENDE KONFIGURATION', en: 'MISSING CONFIG' },
    'Config saved': { de: 'Konfiguration gespeichert', en: 'Config saved' },
    'Changes resetted': { de: 'Änderungen zurückgesetzt', en: 'Changes resetted' },
    'Chart': { de: 'Diagramm', en: 'Chart' },
    'Primary': { de: 'Primär', en: 'Primary' },
    'Learn More': { de: 'Mehr erfahren', en: 'Learn More' },
    'Notification': { de: 'Benachrichtigung', en: 'Notification' },
    'NO NAME': { de: 'KEIN NAME', en: 'NO NAME' },
    'NO TYPE': { de: 'KEIN TYP', en: 'NO TYPE' },
    'Do you want to clear the Dashboard': { de: 'Möchtest du die Übersicht leeren?', en: 'Do you want to clear the Dashboard?' },
    'Do you want to clear the Mash Profile': { de: 'Möchtest du den Brauplan leeren?', en: 'Do you want to clear the Brew Plan?' },
    'Do you want to delete': { de: 'Möchtest du löschen', en: 'Do you want to delete' },
    'Do you want to delete the Actor': { de: 'Möchtest du den Aktor löschen?', en: 'Do you want to delete the Actor?' },
    'Do you want to delete the Recipe': { de: 'Möchtest du das Rezept löschen?', en: 'Do you want to delete the Recipe?' },
    'Do you want to delete the Sensor': { de: 'Möchtest du den Sensor löschen?', en: 'Do you want to delete the Sensor?' },
    'Do you want to delete the step': { de: 'Möchtest du den Schritt löschen?', en: 'Do you want to delete the step?' },
    'Please select a Recipe': { de: 'Bitte wähle ein Rezept aus', en: 'Please select a Recipe' },
    'Please wait': { de: 'Bitte warten...', en: 'Please wait' },
    'Delete Step': { de: 'Schritt löschen', en: 'Delete Step' },
    'MashInStep': { de: 'Einmaischen', en: 'MashInStep' },
    'MashStep': { de: 'Maisch-Schritt', en: 'MashStep' },
    'BoilStep': { de: 'Kochschritt', en: 'BoilStep' },
    'CooldownStep': { de: 'Abkühlschritt', en: 'CooldownStep' },
    'WaitStep': { de: 'Warteschritt', en: 'WaitStep' },
    'ToggleStep': { de: 'Umschaltschritt', en: 'ToggleStep' },
    'ActorStep': { de: 'Aktor-Schritt', en: 'ActorStep' },
    'NotificationStep': { de: 'Benachrichtigungs-Schritt', en: 'NotificationStep' },
    'Cheers,': { de: 'Prost,', en: 'Cheers,' },
    'PayPal Donation': { de: 'PayPal Spende', en: 'PayPal Donation' },
    'Donate with PayPal button': { de: 'Über PayPal spenden', en: 'Donate with PayPal button' },
    'Search CBPi Plugins': { de: 'CBPi Erweiterungen suchen', en: 'Search CBPi Plugins' },
    'Licnese': { de: 'Lizenz', en: 'License' },
    'License': { de: 'Lizenz', en: 'License' },
    'Contemplative Reptile': { de: 'CraftBeerPi', en: 'CraftBeerPi' },
    'SVG NOT FOUND': { de: 'SVG NICHT GEFUNDEN', en: 'SVG NOT FOUND' },
    'SELECT': { de: 'AUSWAHL', en: 'SELECT' },
    'COLOR': { de: 'FARBE', en: 'COLOR' },
    'INPUT': { de: 'EINGABE', en: 'INPUT' },
    'TEXTAREA': { de: 'TEXTFELD', en: 'TEXTAREA' }
  };

  var longTranslations = {
    'Add Mashin Step automatically if not defined in recipe': {
      de: 'Einmaisch-Schritt automatisch hinzufügen, wenn nicht im Rezept definiert',
      en: 'Add Mashin Step automatically if not defined in recipe'
    },
    'Use AutoMode in steps': {
      de: 'AutoModus in Schritten verwenden',
      en: 'Use AutoMode in steps'
    },
    'Define Kettle that is used for Boil, Whirlpool and Cooldown. If not selected, MASH_TUN will be used': {
      de: 'Kessel für Kochen, Whirlpool und Abkühlen festlegen. Falls nicht gewählt, wird der Maisch-Kessel verwendet.',
      en: 'Define Kettle that is used for Boil, Whirlpool and Cooldown. If not selected, MASH_TUN will be used'
    },
    'Write sensor data to csv logfiles': {
      de: 'Sensordaten in CSV-Logdateien speichern',
      en: 'Write sensor data to csv logfiles'
    },
    'Write sensor data to influxdb': {
      de: 'Sensordaten in InfluxDB speichern',
      en: 'Write sensor data to influxdb'
    },
    'IP Address of your influxdb server (If INFLUXDBCLOUD set to Yes use URL Address of your influxdb cloud server)': {
      de: 'IP-Adresse deines InfluxDB-Servers (bei Cloud-Nutzung die URL eingeben)',
      en: 'IP Address of your influxdb server (If INFLUXDBCLOUD set to Yes use URL Address of your influxdb cloud server)'
    },
    'Write sensor data to influxdb cloud (INFLUXDB must set to Yes)': {
      de: 'Sensordaten in InfluxDB Cloud speichern (INFLUXDB muss auf Ja stehen)',
      en: 'Write sensor data to influxdb cloud (INFLUXDB must set to Yes)'
    },
    "It's an Open Source Project founded in 2015. More than 7,000 passioned Homebrewers and commercial Craft Brewerys are using CraftBeerPi. It's an open Eco System.": {
      de: 'Ein Open-Source-Projekt, gegründet 2015. Über 7.000 Hobbybrauer und Craft-Brauereien nutzen CraftBeerPi weltweit.',
      en: "It's an Open Source Project founded in 2015. More than 7,000 passioned Homebrewers and commercial Craft Brewerys are using CraftBeerPi. It's an open Eco System."
    },
    'CraftBeerPi is an free an open source project. If you like this software support this project with a donation. The donation is used to buy hardware and software to build this product.': {
      de: 'CraftBeerPi ist ein kostenloses Open-Source-Projekt. Unterstütze die Entwicklung mit einer Spende!',
      en: 'CraftBeerPi is a free and open source project. If you like this software, support this project with a donation.'
    },
    'Name of your influxdb database name (If INFLUXDBCLOUD set to Yes use bucket of your influxdb cloud database)': {
      de: 'Name deiner InfluxDB-Datenbank (bei Cloud-Nutzung den Bucket-Namen eingeben)',
      en: 'Name of your influxdb database name (If INFLUXDBCLOUD set to Yes use bucket of your influxdb cloud database)'
    },
    'Port of your influxdb server': {
      de: 'Port deines InfluxDB-Servers',
      en: 'Port of your influxdb server'
    },
    'Password for your influxdb database (only if required)(If INFLUXDBCLOUD set to Yes use token of your influxdb cloud database)': {
      de: 'Passwort deiner InfluxDB-Datenbank (nur falls nötig). Bei Cloud-Nutzung: Token eingeben.',
      en: 'Password for your influxdb database (only if required)(If INFLUXDBCLOUD set to Yes use token of your influxdb cloud database)'
    },
    'Password for your influxdb database (only if required)(if INFLUXDBCLOUD set to Yes use token of your influxdb cloud database)': {
      de: 'Passwort deiner InfluxDB-Datenbank (nur falls nötig). Bei Cloud-Nutzung: Token eingeben.',
      en: 'Password for your influxdb database (only if required)(if INFLUXDBCLOUD set to Yes use token of your influxdb cloud database)'
    },
    'User name for your influxdb database (only if required)(If INFLUXDBCLOUD set to Yes use organisation of your influxdb cloud database)': {
      de: 'Benutzername deiner InfluxDB-Datenbank (nur falls nötig). Bei Cloud-Nutzung: Organisation eingeben.',
      en: 'User name for your influxdb database (only if required)(If INFLUXDBCLOUD set to Yes use organisation of your influxdb cloud database)'
    },
    'User name for your influxdb database (only if required)(if INFLUXDBCLOUD set to Yes use organisation of your influxdb cloud database)': {
      de: 'Benutzername deiner InfluxDB-Datenbank (nur falls nötig). Bei Cloud-Nutzung: Organisation eingeben.',
      en: 'User name for your influxdb database (only if required)(if INFLUXDBCLOUD set to Yes use organisation of your influxdb cloud database)'
    },
    'Default Mash Tun': {
      de: 'Standard-Maischkessel',
      en: 'Default Mash Tun'
    },
    'Forced MQTT Update frequency in s for Kettle and Fermenter (no changes in payload required). Restart required after change': {
      de: 'MQTT-Update-Intervall in Sekunden für Kessel und Gärbehälter. Neustart nach Änderung erforderlich.',
      en: 'Forced MQTT Update frequency in s for Kettle and Fermenter (no changes in payload required). Restart required after change'
    },
    'Set unit for pressure': {
      de: 'Druckeinheit festlegen',
      en: 'Set unit for pressure'
    },
    'API path to creation plugin. Default: upload . CHANGE ONLY IF USING A RECIPE CREATION PLUGIN': {
      de: 'API-Pfad zum Rezept-Plugin. Standard: upload. NUR ÄNDERN BEI NUTZUNG EINES REZEPT-PLUGINS!',
      en: 'API path to creation plugin. Default: upload . CHANGE ONLY IF USING A RECIPE CREATION PLUGIN'
    },
    'Temperature Unit': {
      de: 'Temperatureinheit',
      en: 'Temperature Unit'
    },
    'Brewfather API Key': {
      de: 'Brewfather API-Schlüssel',
      en: 'Brewfather API Key'
    },
    'Brewfather User ID': {
      de: 'Brewfather Benutzer-ID',
      en: 'Brewfather User ID'
    },
    'Default Boil Temperature for Recipe Creation': {
      de: 'Standard-Kochtemperatur für die Rezepterstellung',
      en: 'Default Boil Temperature for Recipe Creation'
    },
    'Alternative Sensor to monitor temperature durring cooldown (if not selected, Kettle Sensor will be used)': {
      de: 'Alternativer Sensor zur Temperaturüberwachung beim Abkühlen (falls leer, wird der Kessel-Sensor verwendet)',
      en: 'Alternative Sensor to monitor temperature during cooldown (if not selected, Kettle Sensor will be used)'
    },
    'Actor to trigger cooldown water on and off (default: None)': {
      de: 'Aktor zum Ein-/Ausschalten des Kühlwassers (Standard: keiner)',
      en: 'Actor to trigger cooldown water on and off (default: None)'
    },
    'Cooldown temp will send notification when this temeprature is reached': {
      de: 'Benachrichtigung senden, wenn diese Abkühltemperatur erreicht wird',
      en: 'Cooldown temp will send notification when this temperature is reached'
    },
    'Cooldown step type': {
      de: 'Abkühlschritt-Typ',
      en: 'Cooldown step type'
    },
    'MashIn step type': {
      de: 'Einmaisch-Schritttyp',
      en: 'MashIn step type'
    },
    'Mash step type': {
      de: 'Maisch-Schritttyp',
      en: 'Mash step type'
    },
    'MashOut step type': {
      de: 'Abmaisch-Schritttyp',
      en: 'MashOut step type'
    },
    'Boil step type': {
      de: 'Koch-Schritttyp',
      en: 'Boil step type'
    },
    'Max Number of Dashboards': {
      de: 'Maximale Anzahl von Dashboards',
      en: 'Max Number of Dashboards'
    },
    'Number of current Dashboard': {
      de: 'Nummer des aktuellen Dashboards',
      en: 'Number of current Dashboard'
    },
    'Add MashIn Step automatically if not defined in recipe': {
      de: 'Einmaisch-Schritt automatisch hinzufügen, wenn nicht im Rezept definiert',
      en: 'Add MashIn Step automatically if not defined in recipe'
    },
    'You need to enable JavaScript to run this app.': {
      de: 'JavaScript muss aktiviert sein um diese App zu nutzen.',
      en: 'You need to enable JavaScript to run this app.'
    },
    // --- Step-Parameter-Beschreibungen ---
    'Text for notification when Temp is reached': {
      de: 'Benachrichtigungstext wenn Temperatur erreicht',
      en: 'Text for notification when Temp is reached'
    },
    'Text for notification': {
      de: 'Benachrichtigungstext',
      en: 'Text for notification'
    },
    'Switch Kettlelogic automatically on and off -> Yes': {
      de: 'Kesselsteuerung automatisch ein-/ausschalten → Ja',
      en: 'Switch Kettlelogic automatically on and off -> Yes'
    },
    'Switch Fermenterlogic automatically on and off -> Yes': {
      de: 'Gärsteuerung automatisch ein-/ausschalten → Ja',
      en: 'Switch Fermenterlogic automatically on and off -> Yes'
    },
    'Time in Minutes': {
      de: 'Zeit in Minuten',
      en: 'Time in Minutes'
    },
    'Boil temperature': {
      de: 'Kochtemperatur',
      en: 'Boil temperature'
    },
    'Trigger Alert to remove lid if temp is close to boil': {
      de: 'Warnung zum Deckel abnehmen, wenn Temperatur nahe am Kochen',
      en: 'Trigger Alert to remove lid if temp is close to boil'
    },
    'First Wort Hop alert if set to Yes': {
      de: 'Vorderwürze-Hopfen-Warnung wenn auf Ja',
      en: 'First Wort Hop alert if set to Yes'
    },
    'First Hop alert (minutes before finish)': {
      de: '1. Hopfengabe (Minuten vor Ende)',
      en: 'First Hop alert (minutes before finish)'
    },
    'Second Hop alert (minutes before finish)': {
      de: '2. Hopfengabe (Minuten vor Ende)',
      en: 'Second Hop alert (minutes before finish)'
    },
    'Third Hop alert (minutes before finish)': {
      de: '3. Hopfengabe (Minuten vor Ende)',
      en: 'Third Hop alert (minutes before finish)'
    },
    'Fourth Hop alert (minutes before finish)': {
      de: '4. Hopfengabe (Minuten vor Ende)',
      en: 'Fourth Hop alert (minutes before finish)'
    },
    'Fifth Hop alert (minutes before finish)': {
      de: '5. Hopfengabe (Minuten vor Ende)',
      en: 'Fifth Hop alert (minutes before finish)'
    },
    'Sixth Hop alert (minutes before finish)': {
      de: '6. Hopfengabe (Minuten vor Ende)',
      en: 'Sixth Hop alert (minutes before finish)'
    },
    'Target temperature for cooldown. Notification will be send when temp is reached and Actor can be triggered': {
      de: 'Zieltemperatur Abkühlung. Benachrichtigung bei Erreichen, Aktor kann ausgelöst werden.',
      en: 'Target temperature for cooldown. Notification will be sent when temp is reached and Actor can be triggered'
    },
    'Sensor that is used during cooldown': {
      de: 'Sensor für die Abkühlung',
      en: 'Sensor that is used during cooldown'
    },
    'Actor can trigger a valve for the cooldwon to target temperature': {
      de: 'Aktor zum Auslösen eines Ventils für die Abkühlung',
      en: 'Actor can trigger a valve for the cooldown to target temperature'
    },
    'Automatically move to next step (Yes) or pause after Notification (No)': {
      de: 'Automatisch zum nächsten Schritt (Ja) oder Pause nach Benachrichtigung (Nein)',
      en: 'Automatically move to next step (Yes) or pause after Notification (No)'
    },
    'Choose if Actor should be switched on or off in this step': {
      de: 'Aktor in diesem Schritt ein- oder ausschalten',
      en: 'Choose if Actor should be switched on or off in this step'
    },
    'Actor that should be toggled during this step': {
      de: 'Aktor der in diesem Schritt geschaltet wird',
      en: 'Actor that should be toggled during this step'
    },
    'Timer Days': {
      de: 'Timer Tage',
      en: 'Timer Days'
    },
    'Timer Hours': {
      de: 'Timer Stunden',
      en: 'Timer Hours'
    },
    'Timer Minutes': {
      de: 'Timer Minuten',
      en: 'Timer Minutes'
    },
    'Step Temperature': {
      de: 'Schritt-Temperatur',
      en: 'Step Temperature'
    },
    'Step Pressure': {
      de: 'Schritt-Druck',
      en: 'Step Pressure'
    },
    'Temperature Sensor': {
      de: 'Temperatursensor',
      en: 'Temperature Sensor'
    },
    'Ramp to this temp': {
      de: 'Aufheizen bis zu dieser Temperatur',
      en: 'Ramp to this temp'
    }
  };

  // ============================================================
  // DOM ÜBERSETZUNG
  // ============================================================
  function translateNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      var text = node.textContent.trim();
      if (!text) return;
      if (translations[text]) {
        node.textContent = node.textContent.replace(text, translations[text][currentLang]);
      }
      for (var eng in longTranslations) {
        if (text.indexOf(eng) !== -1) {
          node.textContent = node.textContent.replace(eng, longTranslations[eng][currentLang]);
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.placeholder) {
        var pt = node.placeholder.trim();
        if (translations[pt]) node.placeholder = translations[pt][currentLang];
      }
      if (node.title) {
        var tt = node.title.trim();
        if (translations[tt]) node.title = translations[tt][currentLang];
      }
      for (var i = 0; i < node.childNodes.length; i++) {
        translateNode(node.childNodes[i]);
      }
    }
  }

  function translatePage() {
    translateNode(document.body);
    document.title = 'CraftBeerPi 4.0 - ' + (currentLang === 'de' ? 'Brausteuerung' : 'Brew Controller');
    addMenuDescriptions();
    addIconLabels();
    addMashControlLabels();
    addPageTitle();
    addPageHeaders();
    addLiveTempDisplay();
  }

  // ============================================================
  // MASH-CONTROL LABELS (Play/Next/Stop/Reset Buttons)
  // ============================================================
  var mashControlLabels = {
    'M10 16.5l6-4': { de: '▶ Start', en: '▶ Start' },
    'M6 18l8.5-6L': { de: '⏭ Weiter', en: '⏭ Next' },
    'M6 6h12v12H6': { de: '⏹ Stopp', en: '⏹ Stop' },
    'M7.11 8.53L5': { de: '↺ Reset', en: '↺ Reset' }
  };

  function addMashControlLabels() {
    // Nur auf der Maischprofil-Seite
    var hash = window.location.hash.replace('#', '');
    if (hash.indexOf('/mashprofile') === -1) return;

    var buttons = document.querySelectorAll('.MuiIconButton-root, .MuiFab-root, button');
    buttons.forEach(function (btn) {
      if (btn.closest('.MuiAppBar-root')) return;
      if (btn.querySelector('.cbpi-ctrl-label')) return;
      // Nur die runden Steuerungs-Buttons (Fab-Style)
      var svg = btn.querySelector('svg');
      if (!svg) return;
      var paths = svg.querySelectorAll('path');
      if (!paths.length) return;
      var d = '';
      paths.forEach(function (p) {
        var pd = p.getAttribute('d') || '';
        if (pd.length > d.length) d = pd;
      });
      if (!d) return;
      var label = null;
      for (var frag in mashControlLabels) {
        if (d.substring(0, frag.length) === frag) {
          label = mashControlLabels[frag];
          break;
        }
      }
      if (!label) return;
      btn.title = label[currentLang];
      // Nur für Fab-Buttons (die runden) ein sichtbares Label
      if (btn.classList.contains('MuiFab-root') || btn.querySelector('.MuiFab-label')) {
        var existing = btn.querySelector('.cbpi-ctrl-label');
        if (existing) return;
        var span = document.createElement('span');
        span.className = 'cbpi-ctrl-label';
        span.textContent = label[currentLang];
        btn.parentNode.insertBefore(span, btn.nextSibling);
      }
    });
  }

  // ============================================================
  // ICON-LABELS (sichtbare Beschriftung unter MUI-IconButtons)
  // ============================================================
  var iconLabels = {
    // SVG-Pfad-Anfangsfragmente → Label
    'M20 11H7.83': { de: 'Zurück', en: 'Back' },
    'M16 1H4c-1.': { de: 'Klonen', en: 'Clone' },
    'M3 17.25V21': { de: 'Bearbeiten', en: 'Edit' },
    'M17 3H5c-1.': { de: 'Speichern', en: 'Save' },
    'M6 19c0 1.1': { de: 'Löschen', en: 'Delete' },
    'M19 13h-6v6': { de: 'Hinzufügen', en: 'Add' },
    'M12 8l-6 6 ': { de: 'Zuklappen', en: 'Collapse' },
    'M16.59 8.59': { de: 'Details', en: 'Details' },
    'M7.41 8.59L': { de: 'Details', en: 'Details' },
    'M7.41 15.41': { de: 'Zuklappen', en: 'Collapse' },
    'M4 12l1.41 ': { de: 'Hoch', en: 'Up' },
    'M20 12l-1.4': { de: 'Runter', en: 'Down' },
    'M15.5 14h-.': { de: 'Suchen', en: 'Search' },
    'M12 2C6.48 ': { de: 'Info', en: 'Info' },
    'M19.35 10.0': { de: 'Download', en: 'Download' },
    'M9 16.17L4.': { de: 'OK', en: 'OK' },
    'M12 4l-1.41': { de: 'Weiter', en: 'Next' },
    'M10 6L8.59 ': { de: 'Weiter', en: 'Next' },
    // Visibility (Auge) = Anzeigen
    'M12 4.5C7 4': { de: 'Anzeigen', en: 'View' },
    // MenuBook = Rezeptbuch
    'M21 5c-1.11': { de: 'Rezeptbuch', en: 'Recipes' }
  };

  // Fallback: Teilstring-Matching für Icons die per Prefix nicht erkannt werden
  var iconLabelsFallback = {
    '17.81 9.94': { de: 'Bearbeiten', en: 'Edit' },
    '17.25V21h3.75': { de: 'Bearbeiten', en: 'Edit' },
    'M14.06 9.02': { de: 'Bearbeiten', en: 'Edit' },
    'M18.37 3.29': { de: 'Bearbeiten', en: 'Edit' },
    // CBPi Paddle (Brauen-Icon, Custom SVG)
    'M19.261,0.595': { de: 'Brauen', en: 'Brew' },
    '19.261,0.595': { de: 'Brauen', en: 'Brew' }
  };

  function addIconLabels() {
    var buttons = document.querySelectorAll('.MuiIconButton-root');
    buttons.forEach(function (btn) {
      // Nicht in der AppBar/Toolbar (dort soll kein Label hin)
      if (btn.closest('.MuiAppBar-root')) return;
      // Schon Label vorhanden?
      if (btn.querySelector('.cbpi-icon-label')) return;

      var paths = btn.querySelectorAll('svg path');
      if (!paths.length) return;
      // Nimm den längsten Pfad (der ist das eigentliche Icon)
      var d = '';
      paths.forEach(function (p) {
        var pd = p.getAttribute('d') || '';
        if (pd.length > d.length) d = pd;
      });
      if (!d) return;

      var label = null;
      // 1. Prefix-Match
      for (var fragment in iconLabels) {
        if (d.substring(0, fragment.length) === fragment) {
          label = iconLabels[fragment];
          break;
        }
      }
      // 2. Fallback: Teilstring-Match
      if (!label) {
        for (var sub in iconLabelsFallback) {
          if (d.indexOf(sub) !== -1) {
            label = iconLabelsFallback[sub];
            break;
          }
        }
      }
      if (!label) {
        // Debug: unbekannte Icons in Console loggen
        console.log('[CBPI] Unbekanntes Icon-SVG:', d.substring(0, 40));
        return;
      }

      btn.title = label[currentLang];
      var span = document.createElement('span');
      span.className = 'cbpi-icon-label';
      span.textContent = label[currentLang];
      btn.appendChild(span);
    });
  }

  // ============================================================
  // MENÜ-BESCHREIBUNGEN (Sidebar-Untertitel)
  // ============================================================
  var menuDesc = {
    de: {
      'Anlagenbild': 'Brauanlage visuell gestalten',
      'Brau-Cockpit': 'Dein Brau-Cockpit',
      'Dashboard': 'Brauanlage visuell gestalten',
      'Hardware': 'Sensoren, Aktoren & Kessel',
      'Brauplan': 'Aktueller Brauvorgang & Schritte',
      'Maischprofil': 'Aktueller Brauvorgang & Schritte',
      'Mash Profile': 'Aktueller Brauvorgang & Schritte',
      'Brew Plan': 'Aktueller Brauvorgang & Schritte',
      'Rezeptbuch': 'Rezepte verwalten & laden',
      'Recipe Book': 'Rezepte verwalten & laden',
      'Erweiterungen': 'Plugins suchen & installieren',
      'Plugins': 'Plugins suchen & installieren',
      'Einstellungen': 'Brauanlage konfigurieren',
      'Settings': 'Brauanlage konfigurieren',
      'System': 'Logs, Neustart & Info',
      'Über': 'Lizenz & Projekt-Info',
      'About': 'Lizenz & Projekt-Info',
      'Statistiken': 'Sensor-Verlauf & Diagramme',
      'Analytics': 'Sensor-Verlauf & Diagramme'
    },
    en: {
      'Dashboard': 'Visual brewery layout',
      'Brew Cockpit': 'Your brew cockpit',
      'Hardware': 'Sensors, actors & kettles',
      'Brew Plan': 'Active brew process & steps',
      'Mash Profile': 'Active brew process & steps',
      'Recipe Book': 'Manage & load recipes',
      'Plugins': 'Search & install plugins',
      'Settings': 'Configure your brewery',
      'System': 'Logs, restart & info',
      'About': 'License & project info',
      'Analytics': 'Sensor history & charts'
    }
  };

  function addMenuDescriptions() {
    var items = document.querySelectorAll('.MuiListItemText-root');
    items.forEach(function (item) {
      if (item.querySelector('.cbpi-menu-desc')) return;
      if (!item.closest('.MuiDrawer-paper') && !item.closest('nav')) return;
      var primary = item.querySelector('.MuiTypography-root');
      if (!primary) return;
      var text = primary.textContent.trim();
      var descs = menuDesc[currentLang] || menuDesc.en;
      if (!descs[text]) return;
      var sub = document.createElement('span');
      sub.className = 'cbpi-menu-desc';
      sub.textContent = descs[text];
      item.appendChild(sub);
    });
  }

  // ============================================================
  // SEITENTITEL (permanente Überschrift pro Route)
  // ============================================================
  var pageTitles = {
    '/dashboard':    { de: function() { return _cockpitMode ? 'Brau-Cockpit' : 'Anlagenbild'; }, en: function() { return _cockpitMode ? 'Brew Cockpit' : 'Dashboard'; } },
    '/hardware':     { de: 'Hardware',               en: 'Hardware' },
    '/settings':     { de: 'Einstellungen',           en: 'Settings' },
    '/mashprofile':  { de: 'Brauplan',               en: 'Brew Plan' },
    '/recipes':      { de: 'Rezeptbuch',             en: 'Recipe Book' },
    '/plugins':      { de: 'Erweiterungen',           en: 'Plugins' },
    '/system':       { de: 'System',                 en: 'System' },
    '/about':        { de: 'Über CraftBeerPi',       en: 'About CraftBeerPi' },
    '/actor':        { de: 'Aktoren',                en: 'Actors' },
    '/sensor':       { de: 'Sensoren',               en: 'Sensors' },
    '/kettle':       { de: 'Kessel',                 en: 'Kettles' },
    '/analytics':    { de: 'Statistiken',             en: 'Analytics' },
    '/fermenter':    { de: 'Gärbehälter',            en: 'Fermenter' },
    '/recipe':       { de: 'Rezept bearbeiten',       en: 'Edit Recipe' }
  };

  // ============================================================
  // SEITEN-HILFETEXT (kontextuell pro Route)
  // ============================================================
  var pageHelp = {
    '/dashboard': {
      de: function() { return _cockpitMode
        ? '<b>Dein Brau-Cockpit</b> – Hier siehst du Temperatur, aktuelle Schritte und Aktoren auf einen Blick. Wenn ein Rezept geladen ist, kannst du hier direkt starten, stoppen und den Fortschritt verfolgen.'
        : '<b>Anlagenbild</b> – Hier kannst du deine Brauanlage visuell gestalten. Ziehe Sensoren, Aktoren, Kessel und Verbindungen auf die Arbeitsfläche.'; },
      en: function() { return _cockpitMode
        ? '<b>Your Brew Cockpit</b> – See temperature, current steps and actors at a glance. When a recipe is loaded, you can start, stop and track progress right here.'
        : '<b>Dashboard</b> – Design your brewery layout visually. Drag sensors, actors, kettles and connections onto the canvas.'; }
    },
    '/hardware': {
      de: '<b>Hardware einrichten</b> – Hier konfigurierst du deine physischen Geräte in 3 Schritten:<br>' +
        '&nbsp;&nbsp;1. <b>Sensor</b> → Temperatursensor hinzufügen (Typ: OneWire für DS18B20)<br>' +
        '&nbsp;&nbsp;2. <b>Aktor</b> → Schaltausgänge anlegen (Typ: GPIOActor, z.B. GPIO 17 = Heizung, GPIO 27 = Rührwerk)<br>' +
        '&nbsp;&nbsp;3. <b>Kessel</b> → Sensor + Heizung + Rührwerk zu einer Einheit verknüpfen',
      en: '<b>Hardware Setup</b> – Configure your physical devices in 3 steps:<br>' +
        '&nbsp;&nbsp;1. <b>Sensor</b> → Add temperature sensor (Type: OneWire for DS18B20)<br>' +
        '&nbsp;&nbsp;2. <b>Actor</b> → Create switching outputs (Type: GPIOActor, e.g. GPIO 17 = Heater, GPIO 27 = Agitator)<br>' +
        '&nbsp;&nbsp;3. <b>Kettle</b> → Link sensor + heater + agitator into one unit'
    },
    '/settings': {
      de: '<b>Einstellungen</b> – Hier konfigurierst du deine Brauanlage. Die wichtigsten Punkte:<br>' +
        '&nbsp;&nbsp;• <b>BREWERY_NAME</b> – Name deiner Brauerei<br>' +
        '&nbsp;&nbsp;• <b>AutoMode</b> – Brau-Schritte automatisch weiterschalten<br>' +
        '&nbsp;&nbsp;• <b>BoilKettle</b> – Welcher Kessel zum Kochen genutzt wird<br>' +
        '&nbsp;&nbsp;• <b>CSVLOGFILES</b> – Temperatur-Messwerte als CSV aufzeichnen',
      en: '<b>Settings</b> – Configure your brewery. Most important options:<br>' +
        '&nbsp;&nbsp;• <b>BREWERY_NAME</b> – Your brewery name<br>' +
        '&nbsp;&nbsp;• <b>AutoMode</b> – Auto-advance brew steps<br>' +
        '&nbsp;&nbsp;• <b>BoilKettle</b> – Which kettle to use for boiling<br>' +
        '&nbsp;&nbsp;• <b>CSVLOGFILES</b> – Log temperature readings to CSV'
    },
    '/mashprofile': {
      de: '<b>Brauplan</b> – Dein aktueller Brauvorgang.<br><br>' +
        '<b>So kommst du hierher:</b> Im <b>Rezeptbuch</b> ein Rezept öffnen → dort auf <b>"Aktives Rezept"</b> klicken → das Rezept wird hierher geladen.<br><br>' +
        '<b>Die Schritte deines Brautags:</b><br>' +
        '&nbsp;&nbsp;1. <b>Einmaischen</b> – Wasser auf Starttemperatur bringen<br>' +
        '&nbsp;&nbsp;2. <b>Maisch-Schritt</b> – Halten bei Rasttemperatur (z.B. 63°C, 72°C)<br>' +
        '&nbsp;&nbsp;3. <b>Kochschritt</b> – Würze kochen (z.B. 60 Minuten)<br>' +
        '&nbsp;&nbsp;4. <b>Abkühlschritt</b> – Abkühlen auf Anstelltemperatur<br><br>' +
        'Wenn alles passt: <b>Start</b>-Button drücken und CraftBeerPi steuert automatisch!',
      en: '<b>Brew Plan</b> – Your active brew process.<br><br>' +
        '<b>How to get here:</b> Open a recipe in the <b>Recipe Book</b> → click <b>"Active Recipe"</b> → the recipe is loaded here.<br><br>' +
        '<b>Your brew day steps:</b><br>' +
        '&nbsp;&nbsp;1. <b>MashIn</b> – Heat water to start temperature<br>' +
        '&nbsp;&nbsp;2. <b>MashStep</b> – Rest at mash temperature (e.g. 63°C, 72°C)<br>' +
        '&nbsp;&nbsp;3. <b>BoilStep</b> – Boil wort (e.g. 60 minutes)<br>' +
        '&nbsp;&nbsp;4. <b>CooldownStep</b> – Cool to pitching temperature<br><br>' +
        'When ready: Press <b>Start</b> and CraftBeerPi takes over!'
    },
    '/recipes': {
      de: '<b>Rezeptbuch</b> – Hier verwaltest du deine Bierrezepte.<br><br>' +
        '<b>So erstellst du ein Rezept & startest das Brauen:</b><br>' +
        '&nbsp;&nbsp;1. Klicke <b>+</b> um ein neues Rezept zu erstellen<br>' +
        '&nbsp;&nbsp;2. Gib <b>Name</b>, <b>Autor</b> und <b>Beschreibung</b> ein<br>' +
        '&nbsp;&nbsp;3. Füge <b>Brau-Schritte</b> hinzu (Einmaischen → Maisch-Schritt → Kochschritt → Abkühlen)<br>' +
        '&nbsp;&nbsp;4. Klicke oben auf den Breadcrumb <b>"Aktives Rezept"</b> – das lädt das Rezept in den Brauplan<br>' +
        '&nbsp;&nbsp;5. Wechsle zum <b>Brauplan</b> und drücke <b>Start</b>!<br><br>' +
        'Du kannst Rezepte auch <b>klonen</b> um Varianten zu erstellen.',
      en: '<b>Recipe Book</b> – Manage your beer recipes here.<br><br>' +
        '<b>How to create a recipe & start brewing:</b><br>' +
        '&nbsp;&nbsp;1. Click <b>+</b> to create a new recipe<br>' +
        '&nbsp;&nbsp;2. Enter <b>name</b>, <b>author</b> and <b>description</b><br>' +
        '&nbsp;&nbsp;3. Add <b>brew steps</b> (MashIn → MashStep → BoilStep → Cooldown)<br>' +
        '&nbsp;&nbsp;4. Click the breadcrumb <b>"Active Recipe"</b> at the top – this loads the recipe into the Brew Plan<br>' +
        '&nbsp;&nbsp;5. Switch to <b>Brew Plan</b> and press <b>Start</b>!<br><br>' +
        'You can also <b>clone</b> recipes to create variations.'
    },
    '/plugins': {
      de: '<b>Erweiterungen</b> – Hier findest du zusätzliche Plugins:<br>' +
        '&nbsp;&nbsp;• Neue Sensor-Typen & Regler<br>' +
        '&nbsp;&nbsp;• Zusätzliche Brau-Schritte<br>' +
        '&nbsp;&nbsp;• Dashboard-Widgets<br><br>' +
        'Nach Installation muss CraftBeerPi neu gestartet werden.',
      en: '<b>Plugins</b> – Find additional extensions:<br>' +
        '&nbsp;&nbsp;• New sensor types & controllers<br>' +
        '&nbsp;&nbsp;• Additional brew steps<br>' +
        '&nbsp;&nbsp;• Dashboard widgets<br><br>' +
        'CraftBeerPi restart required after installation.'
    },
    '/system': {
      de: '<b>System</b> – Systemverwaltung & Wartung:<br>' +
        '&nbsp;&nbsp;• Sensor-Logs herunterladen & löschen<br>' +
        '&nbsp;&nbsp;• CraftBeerPi neu starten<br>' +
        '&nbsp;&nbsp;• System-Backup erstellen',
      en: '<b>System</b> – System management & maintenance:<br>' +
        '&nbsp;&nbsp;• Download & delete sensor logs<br>' +
        '&nbsp;&nbsp;• Restart CraftBeerPi<br>' +
        '&nbsp;&nbsp;• Create system backup'
    },
    '/about': {
      de: 'CraftBeerPi – Open-Source Brausteuerung, gegründet 2015 von Manuel Fritsch. Verwendet von über 7.000 Brauern weltweit.',
      en: 'CraftBeerPi – Open source brew controller, founded in 2015 by Manuel Fritsch. Used by over 7,000 brewers worldwide.'
    },
    '/actor': {
      de: '<b>Aktor anlegen</b> – Aktoren sind Schaltausgänge (Relais):<br>' +
        '&nbsp;&nbsp;• Typ: <b>GPIOActor</b> wählen<br>' +
        '&nbsp;&nbsp;• GPIO-Pin angeben (z.B. 17 für Heizung, 27 für Rührwerk)<br><br>' +
        'Bei LOW-Trigger-Relais (z.B. Songle): <b>Inverted = Yes</b> setzen!',
      en: '<b>Create Actor</b> – Actors are switching outputs (relays):<br>' +
        '&nbsp;&nbsp;• Select type: <b>GPIOActor</b><br>' +
        '&nbsp;&nbsp;• Set GPIO pin (e.g. 17 for heater, 27 for agitator)<br><br>' +
        'For LOW-trigger relays (e.g. Songle): set <b>Inverted = Yes</b>!'
    },
    '/sensor': {
      de: '<b>Sensor anlegen</b> – Temperatursensoren einrichten:<br>' +
        '&nbsp;&nbsp;• Typ: <b>OneWire</b> für DS18B20-Sensoren<br>' +
        '&nbsp;&nbsp;• Der Sensor wird automatisch erkannt (GPIO 4)<br>' +
        '&nbsp;&nbsp;• Wähle die erkannte Sensor-ID aus der Liste',
      en: '<b>Create Sensor</b> – Set up temperature sensors:<br>' +
        '&nbsp;&nbsp;• Type: <b>OneWire</b> for DS18B20 sensors<br>' +
        '&nbsp;&nbsp;• Sensor is auto-detected (GPIO 4)<br>' +
        '&nbsp;&nbsp;• Select the detected sensor ID from the list'
    },
    '/kettle': {
      de: '<b>Kessel anlegen</b> – Verknüpft deine Geräte:<br>' +
        '&nbsp;&nbsp;• <b>Sensor</b> → Welcher Temperatursensor misst<br>' +
        '&nbsp;&nbsp;• <b>Heizung</b> → Welcher Aktor heizt<br>' +
        '&nbsp;&nbsp;• <b>Rührwerk</b> → Welcher Aktor rührt<br>' +
        '&nbsp;&nbsp;• <b>Logik</b> → Regelungsart (z.B. PIDBoil)<br><br>' +
        'Du brauchst mindestens einen Kessel um brauen zu können!',
      en: '<b>Create Kettle</b> – Links your devices:<br>' +
        '&nbsp;&nbsp;• <b>Sensor</b> → Which temperature sensor<br>' +
        '&nbsp;&nbsp;• <b>Heater</b> → Which actor heats<br>' +
        '&nbsp;&nbsp;• <b>Agitator</b> → Which actor stirs<br>' +
        '&nbsp;&nbsp;• <b>Logic</b> → Control type (e.g. PIDBoil)<br><br>' +
        'You need at least one kettle to start brewing!'
    },
    '/recipe': {
      de: '<b>Rezept bearbeiten</b> – Hier baust du deinen Brauplan zusammen:<br><br>' +
        '<b>Oben:</b> Name, Autor & Beschreibung ändern (klicke den Bearbeiten-Button)<br>' +
        '<b>Unten:</b> Brau-Schritte hinzufügen mit dem <b>+</b> Button<br><br>' +
        '<b>Rezept zum Brauen laden:</b><br>' +
        '&nbsp;&nbsp;Klicke oben im Breadcrumb auf <b>"Aktives Rezept"</b> → das lädt alle Schritte ins Maischprofil.<br>' +
        '&nbsp;&nbsp;Dann wechsle zum <b>Maischprofil</b> im Seitenmenü und drücke <b>Start</b>!',
      en: '<b>Edit Recipe</b> – Build your brew plan here:<br><br>' +
        '<b>Top:</b> Change name, author & description (click the Edit button)<br>' +
        '<b>Bottom:</b> Add brew steps with the <b>+</b> button<br><br>' +
        '<b>Load recipe for brewing:</b><br>' +
        '&nbsp;&nbsp;Click <b>"Active Recipe"</b> in the breadcrumb above → this loads all steps into the Mash Profile.<br>' +
        '&nbsp;&nbsp;Then switch to <b>Mash Profile</b> in the sidebar and press <b>Start</b>!'
    }
  };

  // Guards gegen MutationObserver-Loop
  var _isOurDomChange = false;

  function findContentTarget() {
    var root = document.getElementById('root');
    if (!root) return null;
    var target = null;
    var selectors = ['.MuiContainer-root', 'main', '[role="main"]'];
    for (var s = 0; s < selectors.length; s++) {
      target = root.querySelector(selectors[s]);
      if (target) break;
    }
    if (!target) {
      var kids = root.querySelectorAll(':scope > div > div');
      if (kids.length > 1) target = kids[kids.length - 1];
    }
    return target;
  }

  function addPageTitle() {
    var hash = window.location.hash.replace('#', '');
    var path = '/' + (hash.split('/')[1] || '');
    var titleObj = pageTitles[path];

    // Titel können Funktionen sein (z.B. cockpit/dashboard Umschaltung)
    function resolveTitle(t, lang) {
      var val = t[lang];
      return typeof val === 'function' ? val() : val;
    }

    var existing = document.getElementById('cbpi-page-title');
    // Bei /dashboard immer neu rendern (Modus kann gewechselt haben)
    if (existing && existing.getAttribute('data-path') === path && path !== '/dashboard') {
      if (titleObj && existing.textContent !== resolveTitle(titleObj, currentLang)) {
        existing.textContent = resolveTitle(titleObj, currentLang);
      }
      return;
    }

    // Falscher Pfad oder noch nicht vorhanden → neu erstellen
    _isOurDomChange = true;
    if (existing) existing.remove();

    if (!titleObj) { _isOurDomChange = false; return; }

    var target = findContentTarget();
    if (!target) { _isOurDomChange = false; return; }

    var h = document.createElement('h1');
    h.id = 'cbpi-page-title';
    h.className = 'cbpi-page-title';
    h.setAttribute('data-path', path);
    h.textContent = resolveTitle(titleObj, currentLang);
    target.insertBefore(h, target.firstChild);
    _isOurDomChange = false;
  }

  function addPageHeaders() {
    var hash = window.location.hash.replace('#', '');
    var path = '/' + (hash.split('/')[1] || '');
    var help = pageHelp[path];

    var existing = document.getElementById('cbpi-help-banner');

    // Hilfetexte können Funktionen sein (z.B. cockpit/dashboard-Umschaltung)
    function resolveHelp(h, lang) {
      var val = h[lang];
      return typeof val === 'function' ? val() : val;
    }

    // Banner schon korrekt vorhanden → nur Sprache updaten
    if (existing && existing.getAttribute('data-path') === path) {
      var content = existing.querySelector('.cbpi-help-content');
      if (help && content) content.innerHTML = resolveHelp(help, currentLang);
      // Toggle-Text updaten
      var toggleText = existing.querySelector('.cbpi-help-toggle-text');
      if (toggleText) {
        var collapsed = existing.classList.contains('collapsed');
        toggleText.textContent = collapsed
          ? (currentLang === 'de' ? 'Info anzeigen' : 'Show info')
          : (currentLang === 'de' ? 'Info ausblenden' : 'Hide info');
      }
      return;
    }

    // Falscher Pfad oder kein Banner → aufräumen
    _isOurDomChange = true;
    if (existing) existing.remove();

    if (!help) { _isOurDomChange = false; return; }

    var target = findContentTarget();
    if (!target) { _isOurDomChange = false; return; }

    // Zustand aus localStorage laden (persistent über Sessions)
    var isCollapsed = localStorage.getItem('cbpi_help_collapsed_' + path) === '1';

    var banner = document.createElement('div');
    banner.id = 'cbpi-help-banner';
    banner.setAttribute('data-path', path);
    if (isCollapsed) banner.classList.add('collapsed');

    // Toggle-Header (immer sichtbar)
    var toggle = document.createElement('div');
    toggle.className = 'cbpi-help-toggle';
    var toggleText = document.createElement('span');
    toggleText.className = 'cbpi-help-toggle-text';
    toggleText.textContent = isCollapsed
      ? (currentLang === 'de' ? 'Info anzeigen' : 'Show info')
      : (currentLang === 'de' ? 'Info ausblenden' : 'Hide info');
    var toggleArrow = document.createElement('span');
    toggleArrow.className = 'cbpi-help-toggle-arrow';
    toggleArrow.textContent = isCollapsed ? '▶' : '▼';
    toggle.appendChild(toggleText);
    toggle.appendChild(toggleArrow);
    toggle.onclick = function () {
      var nowCollapsed = !banner.classList.contains('collapsed');
      banner.classList.toggle('collapsed');
      toggleArrow.textContent = nowCollapsed ? '▶' : '▼';
      toggleText.textContent = nowCollapsed
        ? (currentLang === 'de' ? 'Info anzeigen' : 'Show info')
        : (currentLang === 'de' ? 'Info ausblenden' : 'Hide info');
      localStorage.setItem('cbpi_help_collapsed_' + path, nowCollapsed ? '1' : '0');
    };
    banner.appendChild(toggle);

    // Content (einklappbar)
    var contentDiv = document.createElement('div');
    contentDiv.className = 'cbpi-help-content';
    contentDiv.innerHTML = resolveHelp(help, currentLang);
    banner.appendChild(contentDiv);

    // Banner nach dem Seitentitel einfügen (falls vorhanden)
    var titleEl = target.querySelector('#cbpi-page-title');
    if (titleEl && titleEl.nextSibling) {
      target.insertBefore(banner, titleEl.nextSibling);
    } else if (titleEl) {
      target.appendChild(banner);
    } else {
      target.insertBefore(banner, target.firstChild);
    }
    _isOurDomChange = false;
  }

  // ============================================================
  // LIVE-TEMPERATURANZEIGE (Soll/Ist pro Schritt)
  // ============================================================
  var _tempInterval = null;
  var _lastTempData = null;

  function addLiveTempDisplay() {
    var hash = window.location.hash.replace('#', '');
    if (hash.indexOf('/mashprofile') === -1) {
      // Nicht auf der Maischprofil-Seite → Interval stoppen
      if (_tempInterval) { clearInterval(_tempInterval); _tempInterval = null; }
      return;
    }
    // Nur einmal starten
    if (!_tempInterval) {
      fetchAndDisplayTemp();
      _tempInterval = setInterval(fetchAndDisplayTemp, 3000);
    }
  }

  function fetchAndDisplayTemp() {
    // Step-Daten holen
    fetch('/step2/')
      .then(function (r) { return r.json(); })
      .then(function (stepData) {
        var steps = stepData.steps || [];
        // Alle Sensor-IDs aus den Steps sammeln
        var sensorIds = [];
        steps.forEach(function (s) { if (s.props && s.props.Sensor) sensorIds.push(s.props.Sensor); });
        return fetchSensorValues(sensorIds).then(function (sensorValues) {
          return { steps: steps, sensorValues: sensorValues };
        });
      })
      .then(function (data) {
        _lastTempData = data;
        renderTempBadges(data);
      })
      .catch(function () { /* still ok */ });
  }

  function renderTempBadges(data) {
    if (!data || !data.steps) return;

    var sensorValues = data.sensorValues || {};

    // Alle Step-Zeilen in der Tabelle finden
    var rows = document.querySelectorAll('tr, .MuiTableRow-root');
    var stepIdx = 0;

    data.steps.forEach(function (step, idx) {
      // Ziel-Temperatur aus Step-Props
      var targetTemp = null;
      var sensorId = null;
      if (step.props) {
        if (step.props.Temp !== undefined && step.props.Temp !== '') targetTemp = parseFloat(step.props.Temp);
        if (step.props.Sensor) sensorId = step.props.Sensor;
        if (!sensorId && step.props.Kettle) {
          // Kessel → Sensor-Zuordnung müsste man extra holen, übersprungen
        }
      }

      // Ist-Temperatur
      var currentTemp = sensorId && sensorValues[sensorId] !== undefined ? parseFloat(sensorValues[sensorId]) : null;

      // Badge-ID
      var badgeId = 'cbpi-temp-badge-' + idx;
      var existing = document.getElementById(badgeId);

      // Finde die Tabellenzeile für diesen Step (per Name-Match)
      var targetRow = null;
      rows.forEach(function (row) {
        var cells = row.querySelectorAll('td, .MuiTableCell-root');
        if (cells.length >= 2) {
          var nameCell = cells[1] || cells[0];
          if (nameCell && nameCell.textContent && nameCell.textContent.trim() === (step.name || '').trim()) {
            targetRow = row;
          }
        }
      });

      if (!targetRow) {
        if (existing) existing.remove();
        return;
      }

      // Badge-Text erstellen
      var isActive = step.status === 'A';
      var isDone = step.status === 'D';
      var badgeText = '';

      if (targetTemp !== null) {
        var sollLabel = currentLang === 'de' ? 'Soll' : 'Target';
        var istLabel = currentLang === 'de' ? 'Ist' : 'Actual';
        badgeText = sollLabel + ': ' + targetTemp.toFixed(1) + '°C';
        if (currentTemp !== null && (isActive || isDone)) {
          badgeText += '  |  ' + istLabel + ': ' + currentTemp.toFixed(1) + '°C';
        }
      }

      if (!badgeText) {
        if (existing) existing.remove();
        return;
      }

      // Badge rendern
      _isOurDomChange = true;
      if (existing) {
        existing.textContent = badgeText;
        existing.className = 'cbpi-temp-badge' + (isActive ? ' active' : '') + (isDone ? ' done' : '');
      } else {
        var badge = document.createElement('div');
        badge.id = badgeId;
        badge.className = 'cbpi-temp-badge' + (isActive ? ' active' : '') + (isDone ? ' done' : '');
        badge.textContent = badgeText;
        // In die Zusammenfassung-Spalte einfügen (4. Spalte)
        var cells = targetRow.querySelectorAll('td, .MuiTableCell-root');
        var summaryCell = cells.length >= 4 ? cells[3] : cells[cells.length - 1];
        if (summaryCell) summaryCell.appendChild(badge);
      }
      _isOurDomChange = false;
    });
  }

  // ============================================================
  // SPRACHUMSCHALTER
  // ============================================================
  function createLanguageToggle() {
    if (document.getElementById('cbpi-lang-toggle')) return;
    var toolbar = document.querySelector('.MuiToolbar-root');
    if (!toolbar) return;

    var btn = document.createElement('button');
    btn.id = 'cbpi-lang-toggle';
    btn.innerHTML = currentLang === 'de' ? 'EN' : 'DE';
    btn.title = currentLang === 'de' ? 'Switch to English' : 'Auf Deutsch umschalten';
    btn.onclick = function () {
      currentLang = currentLang === 'de' ? 'en' : 'de';
      localStorage.setItem(LANG_KEY, currentLang);
      btn.innerHTML = currentLang === 'de' ? 'EN' : 'DE';
      btn.title = currentLang === 'de' ? 'Switch to English' : 'Auf Deutsch umschalten';
      // Alle Hilfe-Banner resetten
      Object.keys(pageHelp).forEach(function (k) { sessionStorage.removeItem('cbpi_help_' + k); });
      // Menübeschreibungen + Titel + Icon-Labels entfernen für Neuzeichnung
      _isOurDomChange = true;
      document.querySelectorAll('.cbpi-menu-desc').forEach(function (el) { el.remove(); });
      document.querySelectorAll('.cbpi-icon-label').forEach(function (el) { el.remove(); });
      document.querySelectorAll('.cbpi-ctrl-label').forEach(function (el) { el.remove(); });
      document.querySelectorAll('.cbpi-temp-badge').forEach(function (el) { el.remove(); });
      if (_tempInterval) { clearInterval(_tempInterval); _tempInterval = null; }
      var oldBanner = document.getElementById('cbpi-help-banner');
      if (oldBanner) oldBanner.remove();
      var oldTitle = document.getElementById('cbpi-page-title');
      if (oldTitle) oldTitle.remove();
      var oldCockpit = document.getElementById('cbpi-cockpit');
      if (oldCockpit) oldCockpit.remove();
      stopCockpit();
      // Expert-Toggle + Theme-Toggle Text updaten
      var expBtn = document.getElementById('cbpi-expert-toggle');
      if (expBtn) expBtn.remove();
      var thBtn = document.getElementById('cbpi-theme-toggle');
      if (thBtn) thBtn.remove();
      _isOurDomChange = false;
      translatePage();
      createThemeToggle();
      createExpertToggle();
      applyExpertMode();
      buildCockpit();
    };
    toolbar.insertBefore(btn, toolbar.lastChild);
  }

  // ============================================================
  // HILFE-BUTTON (?) – zeigt Onboarding erneut
  // ============================================================
  function createHelpButton() {
    if (document.getElementById('cbpi-help-btn')) return;
    var toolbar = document.querySelector('.MuiToolbar-root');
    if (!toolbar) return;

    var btn = document.createElement('button');
    btn.id = 'cbpi-help-btn';
    btn.innerHTML = '?';
    btn.title = currentLang === 'de' ? 'Hilfe & Einführung anzeigen' : 'Show help & tour';
    btn.onclick = function () {
      localStorage.removeItem(ONBOARDING_KEY);
      Object.keys(pageHelp).forEach(function (k) { sessionStorage.removeItem('cbpi_help_' + k); });
      showOnboarding();
      addPageHeaders();
    };

    var langToggle = document.getElementById('cbpi-lang-toggle');
    if (langToggle) {
      toolbar.insertBefore(btn, langToggle);
    } else {
      toolbar.insertBefore(btn, toolbar.lastChild);
    }
  }

  // ============================================================
  // ERSTEINRICHTUNGS-ASSISTENT (Onboarding)
  // ============================================================
  var ONBOARDING_KEY = 'cbpi_onboarding_done';

  function showOnboarding() {
    var old = document.getElementById('cbpi-onboarding');
    if (old) old.remove();

    var steps = {
      de: [
        { icon: '', title: 'Willkommen bei CraftBeerPi!', text: 'Dieser kurze Assistent zeigt dir in 4 Schritten, wie du deine Brauanlage einrichtest und dein erstes Bier braust.' },
        { icon: '', title: 'Schritt 1: Hardware einrichten', text: 'Öffne <b>Hardware</b> im Seitenmenü:<br><br>1. <b>Sensor anlegen</b> – Wähle „OneWire" als Typ. Dein DS18B20 wird automatisch erkannt.<br><br>2. <b>Aktoren anlegen</b> – Wähle „GPIOActor". Erstelle einen für die <b>Heizung</b> (GPIO 17) und einen für das <b>Rührwerk</b> (GPIO 27). Setze <b>Inverted = Yes</b>!<br><br>3. <b>Kessel anlegen</b> – Verknüpfe den Sensor mit Heizung und Rührwerk.' },
        { icon: '', title: 'Schritt 2: Rezept erstellen', text: 'Öffne das <b>Rezeptbuch</b>:<br><br>• Erstelle ein neues Rezept (+ Button)<br>• Gib Name und Autor ein<br>• Füge Brau-Schritte hinzu:<br>&nbsp;&nbsp;– <b>Einmaischen</b> (z.B. 52°C)<br>&nbsp;&nbsp;– <b>Maisch-Schritt</b> (z.B. 63°C für 45 Min)<br>&nbsp;&nbsp;– <b>Kochschritt</b> (z.B. 100°C für 60 Min)<br>&nbsp;&nbsp;– <b>Abkühlschritt</b> (z.B. 20°C)' },
        { icon: '', title: 'Schritt 3: Brauen!', text: 'Lade dein Rezept ins <b>Maischprofil</b> und drücke <b>Start</b>!<br><br>CraftBeerPi regelt automatisch:<br>• Temperatur hochheizen<br>• Rasten einhalten<br>• Rührwerk steuern<br>• Benachrichtigungen bei jedem Schritt<br><br>Auf dem <b>Dashboard</b> siehst du alles live.' },
        { icon: '', title: 'Fertig! Viel Spass!', text: 'Deine Brauanlage ist bereit!<br><br><b>Tipps:</b><br>• Im <b>Dashboard</b> kannst du Widgets anordnen<br>• Unter <b>Einstellungen</b> kannst du CSV-Logging aktivieren<br>• Unter <b>System</b> findest du Logs und Neustart<br>• Klicke <b>?</b> oben rechts um diese Hilfe erneut anzuzeigen<br><br>Prost!' }
      ],
      en: [
        { icon: '', title: 'Welcome to CraftBeerPi!', text: 'This quick guide shows you how to set up your brewery and brew your first beer in 4 steps.' },
        { icon: '', title: 'Step 1: Set up Hardware', text: 'Open <b>Hardware</b> in the sidebar:<br><br>1. <b>Add Sensor</b> – Select "OneWire" type. Your DS18B20 will be auto-detected.<br><br>2. <b>Add Actors</b> – Select "GPIOActor". Create one for <b>Heater</b> (GPIO 17) and one for <b>Agitator</b> (GPIO 27). Set <b>Inverted = Yes</b>!<br><br>3. <b>Add Kettle</b> – Link sensor with heater and agitator.' },
        { icon: '', title: 'Step 2: Create a Recipe', text: 'Open the <b>Recipe Book</b>:<br><br>• Create a new recipe (+ button)<br>• Enter name and author<br>• Add brew steps:<br>&nbsp;&nbsp;– <b>MashIn</b> (e.g. 52°C)<br>&nbsp;&nbsp;– <b>MashStep</b> (e.g. 63°C for 45 min)<br>&nbsp;&nbsp;– <b>BoilStep</b> (e.g. 100°C for 60 min)<br>&nbsp;&nbsp;– <b>CooldownStep</b> (e.g. 20°C)' },
        { icon: '', title: 'Step 3: Start Brewing!', text: 'Load your recipe into the <b>Mash Profile</b> and press <b>Start</b>!<br><br>CraftBeerPi automatically controls:<br>• Heating to target temperature<br>• Holding rest temperatures<br>• Agitator control<br>• Notifications at each step<br><br>Watch everything live on the <b>Dashboard</b>.' },
        { icon: '', title: 'All set! Enjoy!', text: 'Your brewery is ready!<br><br><b>Tips:</b><br>• Arrange widgets on the <b>Dashboard</b><br>• Enable CSV logging in <b>Settings</b><br>• Find logs & restart in <b>System</b><br>• Click <b>?</b> in the top bar to show this guide again<br><br>Cheers!' }
      ]
    };

    var s = steps[currentLang] || steps.en;
    var idx = 0;

    var overlay = document.createElement('div');
    overlay.id = 'cbpi-onboarding';

    function render() {
      var step = s[idx];
      var isFirst = idx === 0;
      var isLast = idx === s.length - 1;

      overlay.innerHTML =
        '<div class="cbpi-ob-backdrop"></div>' +
        '<div class="cbpi-ob-card">' +
        '<div class="cbpi-ob-icon">' + step.icon + '</div>' +
        '<h2 class="cbpi-ob-title">' + step.title + '</h2>' +
        '<div class="cbpi-ob-text">' + step.text + '</div>' +
        '<div class="cbpi-ob-dots">' +
        s.map(function (_, i) { return '<span class="cbpi-ob-dot' + (i === idx ? ' active' : '') + '"></span>'; }).join('') +
        '</div>' +
        '<div class="cbpi-ob-buttons">' +
        (isFirst
          ? '<button class="cbpi-ob-btn secondary" id="ob-skip">' + (currentLang === 'de' ? 'Überspringen' : 'Skip') + '</button>'
          : '<button class="cbpi-ob-btn secondary" id="ob-prev">← ' + (currentLang === 'de' ? 'Zurück' : 'Back') + '</button>') +
        '<button class="cbpi-ob-btn primary" id="ob-next">' +
        (isLast ? (currentLang === 'de' ? 'Los geht\'s! 🚀' : 'Let\'s go! 🚀') : (currentLang === 'de' ? 'Weiter →' : 'Next →')) +
        '</button>' +
        '</div></div>';
    }

    render();
    document.body.appendChild(overlay);

    // Event-Delegation auf dem Overlay (innerHTML zerstört direkte onclick-Handler)
    overlay.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      if (btn.id === 'ob-next') {
        if (idx === s.length - 1) { localStorage.setItem(ONBOARDING_KEY, '1'); overlay.remove(); }
        else { idx++; render(); }
      } else if (btn.id === 'ob-skip') {
        localStorage.setItem(ONBOARDING_KEY, '1'); overlay.remove();
      } else if (btn.id === 'ob-prev') {
        idx--; render();
      }
    });
  }

  function checkOnboarding() {
    if (!localStorage.getItem(ONBOARDING_KEY)) showOnboarding();
  }

  // ============================================================
  // THEME-SYSTEM (Dark / Light / Braumeister)
  // ============================================================
  var THEME_KEY = 'cbpi_theme';
  var THEMES = ['dark', 'light', 'braumeister'];
  var THEME_ICONS = { dark: '◐', light: '◑', braumeister: '◒' };
  var THEME_TITLES_DE = { dark: 'Helles Design', light: 'Braumeister Design', braumeister: 'Dunkles Design' };
  var THEME_TITLES_EN = { dark: 'Light theme', light: 'Braumeister theme', braumeister: 'Dark theme' };
  var currentTheme = localStorage.getItem(THEME_KEY) || 'dark';
  if (THEMES.indexOf(currentTheme) === -1) currentTheme = 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);

  function getThemeIcon() { return THEME_ICONS[currentTheme] || '☀️'; }
  function getThemeTitle() {
    var titles = currentLang === 'de' ? THEME_TITLES_DE : THEME_TITLES_EN;
    return titles[currentTheme] || '';
  }

  function createThemeToggle() {
    if (document.getElementById('cbpi-theme-toggle')) return;
    var toolbar = document.querySelector('.MuiToolbar-root');
    if (!toolbar) return;

    var btn = document.createElement('button');
    btn.id = 'cbpi-theme-toggle';
    btn.className = 'cbpi-toolbar-btn round';
    btn.innerHTML = getThemeIcon();
    btn.title = getThemeTitle();
    btn.onclick = function () {
      var idx = THEMES.indexOf(currentTheme);
      currentTheme = THEMES[(idx + 1) % THEMES.length];
      localStorage.setItem(THEME_KEY, currentTheme);
      document.documentElement.setAttribute('data-theme', currentTheme);
      btn.innerHTML = getThemeIcon();
      btn.title = getThemeTitle();
    };

    var helpBtn = document.getElementById('cbpi-help-btn');
    if (helpBtn) {
      toolbar.insertBefore(btn, helpBtn);
    } else {
      toolbar.insertBefore(btn, toolbar.lastChild);
    }
  }

  // ============================================================
  // EXPERTEN-MODUS (Vereinfachte vs. Experten-Navigation)
  // ============================================================
  var EXPERT_KEY = 'cbpi_expert_mode';
  var expertMode = localStorage.getItem(EXPERT_KEY) === '1';

  // Routen im Anfänger-Modus (nur das Wesentliche)
  var beginnerRoutes = ['cockpit', 'dashboard', 'mashprofile', 'recipes', 'hardware', 'settings', 'system'];
  // Zusätzliche Routen im Experten-Modus
  var expertRoutes = ['actor', 'sensor', 'kettle', 'fermenter', 'analytics', 'plugins', 'about'];

  var navGroups = {
    de: [
      { label: 'Brauen', routes: ['cockpit', 'dashboard', 'mashprofile', 'recipes'] },
      { label: 'Einrichtung', routes: ['hardware', 'settings'] },
      { label: 'Extras', routes: ['analytics', 'fermenter', 'plugins'] },
      { label: 'System', routes: ['system', 'about'] }
    ],
    en: [
      { label: 'Brewing', routes: ['cockpit', 'dashboard', 'mashprofile', 'recipes'] },
      { label: 'Setup', routes: ['hardware', 'settings'] },
      { label: 'Extras', routes: ['analytics', 'fermenter', 'plugins'] },
      { label: 'System', routes: ['system', 'about'] }
    ]
  };

  // Cockpit-Menüpunkt in die Sidebar injizieren
  function injectCockpitNavItem(drawer) {
    if (drawer.querySelector('#cbpi-nav-cockpit')) return;
    var list = drawer.querySelector('.MuiList-root');
    if (!list) return;
    // Ersten existierenden MuiListItem als Template nehmen
    var firstItem = list.querySelector('.MuiListItem-root');
    if (!firstItem) return;

    _isOurDomChange = true;
    var li = firstItem.cloneNode(true);
    li.id = 'cbpi-nav-cockpit';
    li.style.cursor = 'pointer';

    // Click-Handler direkt auf das Element (MUI-Items sind divs, keine <a>-Tags)
    li.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      _cockpitMode = true;
      _cockpitRenderLock = 0; // Lock aufheben bei Navigation
      // Alten Titel/Banner entfernen
      var oldTitle = document.getElementById('cbpi-page-title');
      if (oldTitle) { _isOurDomChange = true; oldTitle.remove(); _isOurDomChange = false; }
      var oldBanner = document.getElementById('cbpi-help-banner');
      if (oldBanner) { _isOurDomChange = true; oldBanner.remove(); _isOurDomChange = false; }
      if (window.location.hash !== '#/dashboard') {
        // Von anderer Seite: navigieren → hashchange → buildCockpit
        window.location.hash = '#/dashboard';
        // Retry: React braucht Zeit zum Rendern des Containers
        var retries = 0;
        var retryBuild = setInterval(function () {
          retries++;
          if (document.getElementById('cbpi-cockpit') || retries > 20) {
            clearInterval(retryBuild);
            return;
          }
          var t = findContentTarget();
          if (t) {
            clearInterval(retryBuild);
            buildCockpit();
            addPageTitle();
            addPageHeaders();
          }
        }, 200);
      } else {
        // Schon auf Dashboard: nur Cockpit starten
        buildCockpit();
        addPageTitle();
        addPageHeaders();
      }
    });
    // Icon: SVG durch Cockpit-Icon ersetzen
    var svg = li.querySelector('svg');
    if (svg) {
      svg.innerHTML = '<path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>';
    }
    // Text
    var textEl = li.querySelector('.MuiListItemText-primary');
    if (textEl) textEl.textContent = currentLang === 'de' ? 'Brau-Cockpit' : 'Brew Cockpit';
    // Beschreibung
    var descEl = li.querySelector('.cbpi-menu-desc');
    if (descEl) descEl.textContent = currentLang === 'de' ? 'Dein Brau-Cockpit' : 'Your brew cockpit';

    // Vor dem ersten Item einfügen
    list.insertBefore(li, firstItem);
    _isOurDomChange = false;
  }

  function applyExpertMode() {
    var drawer = document.querySelector('.MuiDrawer-paper');
    if (!drawer) return;

    // Cockpit-Menüpunkt einfügen (vor dem Dashboard-Link)
    injectCockpitNavItem(drawer);

    var items = drawer.querySelectorAll('.MuiListItem-root');
    items.forEach(function (item) {
      var link = item.querySelector('a');
      var text = item.querySelector('.MuiListItemText-primary');
      var href = link ? link.getAttribute('href') : '';
      // Kein <a>? Dann href aus dem Item selbst lesen (MUI ListItem als Link)
      if (!href) {
        href = item.getAttribute('href') || '';
      }
      var label = text ? text.textContent.trim().toLowerCase() : '';

      // Route aus href oder Text ermitteln
      var route = '';
      // Cockpit-Nav-Item per ID erkennen (hat auch href=#/dashboard)
      if (item.id === 'cbpi-nav-cockpit') {
        route = 'cockpit';
      } else if (href) {
        var m = href.match(/#\/(\w+)/);
        if (m) route = m[1];
      }
      if (!route) {
        // Per Text matchen
        var routeMap = {
          'dashboard': 'dashboard', 'anlagenbild': 'dashboard', 'übersicht': 'dashboard',
          'brau-cockpit': 'cockpit', 'brew cockpit': 'cockpit',
          'hardware': 'hardware',
          'mash profile': 'mashprofile', 'maischprofil': 'mashprofile',
          'recipe book': 'recipes', 'rezeptbuch': 'recipes',
          'actors': 'actor', 'aktoren': 'actor',
          'sensors': 'sensor', 'sensoren': 'sensor',
          'kettles': 'kettle', 'kessel': 'kettle',
          'fermenter': 'fermenter', 'gärbehälter': 'fermenter',
          'analytics': 'analytics', 'statistiken': 'analytics',
          'plugins': 'plugins', 'erweiterungen': 'plugins',
          'settings': 'settings', 'einstellungen': 'settings',
          'system': 'system',
          'about': 'about', 'über': 'about', 'über craftbeerpi': 'about'
        };
        route = routeMap[label] || '';
      }

      if (!route) return;

      // Dashboard-Link (Anlagenbild): Cockpit-Modus deaktivieren bei Klick
      if (route === 'dashboard' && !item._cbpiDashboardHandler) {
        item._cbpiDashboardHandler = true;
        item.addEventListener('click', function () {
          _cockpitMode = false;
          stopCockpit();
          // Titel/Banner aktualisieren falls schon auf /dashboard
          if (window.location.hash === '#/dashboard') {
            var oldTitle = document.getElementById('cbpi-page-title');
            if (oldTitle) { _isOurDomChange = true; oldTitle.remove(); _isOurDomChange = false; }
            var oldBanner = document.getElementById('cbpi-help-banner');
            if (oldBanner) { _isOurDomChange = true; oldBanner.remove(); _isOurDomChange = false; }
            setTimeout(function () { addPageTitle(); addPageHeaders(); }, 100);
          }
        });
      }

      if (!expertMode && expertRoutes.indexOf(route) !== -1) {
        item.classList.add('cbpi-nav-hidden');
      } else {
        item.classList.remove('cbpi-nav-hidden');
      }
    });

    // Gruppen-Labels hinzufügen
    addNavGroupLabels(drawer, items);
  }

  function addNavGroupLabels(drawer, items) {
    // Entferne alte Labels
    drawer.querySelectorAll('.cbpi-nav-group-label').forEach(function (el) { el.remove(); });

    if (!expertMode) return; // Im Anfänger-Modus keine Gruppen-Labels

    var groups = navGroups[currentLang] || navGroups.en;
    var list = drawer.querySelector('.MuiList-root');
    if (!list) return;

    // Wir fügen Gruppen-Header basierend auf der Reihenfolge der sichtbaren Items ein
    var visibleItems = [];
    items.forEach(function (item) {
      if (!item.classList.contains('cbpi-nav-hidden')) {
        var link = item.querySelector('a');
        var text = item.querySelector('.MuiListItemText-primary');
        var href = link ? link.getAttribute('href') : '';
        var label = text ? text.textContent.trim().toLowerCase() : '';
        var route = '';
        if (item.id === 'cbpi-nav-cockpit') { route = 'cockpit'; }
        else if (href) { var m = href.match(/#\/(\w+)/); if (m) route = m[1]; }
        visibleItems.push({ el: item, route: route, label: label });
      }
    });

    _isOurDomChange = true;
    groups.forEach(function (group) {
      // Finde das erste Item dieser Gruppe
      for (var i = 0; i < visibleItems.length; i++) {
        var vi = visibleItems[i];
        if (group.routes.indexOf(vi.route) !== -1) {
          var lbl = document.createElement('div');
          lbl.className = 'cbpi-nav-group-label';
          lbl.textContent = group.label;
          vi.el.parentNode.insertBefore(lbl, vi.el);
          break;
        }
      }
    });
    _isOurDomChange = false;
  }

  function createExpertToggle() {
    if (document.getElementById('cbpi-expert-toggle')) return;
    var toolbar = document.querySelector('.MuiToolbar-root');
    if (!toolbar) return;

    var btn = document.createElement('button');
    btn.id = 'cbpi-expert-toggle';
    btn.className = 'cbpi-toolbar-btn';
    btn.innerHTML = expertMode
      ? (currentLang === 'de' ? '✎ Experte' : '✎ Expert')
      : (currentLang === 'de' ? '✎ Einfach' : '✎ Simple');
    btn.title = expertMode
      ? (currentLang === 'de' ? 'Zum einfachen Modus wechseln' : 'Switch to simple mode')
      : (currentLang === 'de' ? 'Experten-Modus aktivieren' : 'Enable expert mode');
    btn.onclick = function () {
      expertMode = !expertMode;
      localStorage.setItem(EXPERT_KEY, expertMode ? '1' : '0');
      btn.innerHTML = expertMode
        ? (currentLang === 'de' ? '✎ Experte' : '✎ Expert')
        : (currentLang === 'de' ? '✎ Einfach' : '✎ Simple');
      btn.title = expertMode
        ? (currentLang === 'de' ? 'Zum einfachen Modus wechseln' : 'Switch to simple mode')
        : (currentLang === 'de' ? 'Experten-Modus aktivieren' : 'Enable expert mode');
      applyExpertMode();
    };

    var themeBtn = document.getElementById('cbpi-theme-toggle');
    if (themeBtn) {
      toolbar.insertBefore(btn, themeBtn);
    } else {
      toolbar.insertBefore(btn, toolbar.lastChild);
    }
  }

  // ============================================================
  // PERSISTENTE STATUS-LEISTE (unten, zeigt Brew-Status)
  // ============================================================
  var _statusInterval = null;

  function createStatusBar() {
    if (document.getElementById('cbpi-status-bar')) return;
    var bar = document.createElement('div');
    bar.id = 'cbpi-status-bar';
    bar.className = 'hidden';
    document.body.appendChild(bar);
    updateStatusBar();
    if (!_statusInterval) {
      _statusInterval = setInterval(updateStatusBar, 4000);
    }
  }

  function updateStatusBar() {
    var bar = document.getElementById('cbpi-status-bar');
    if (!bar) return;

    Promise.all([
      fetch('/step2/').then(function (r) { return r.json(); }).catch(function () { return null; })
    ]).then(function (results) {
      var stepData = results[0];

      if (!stepData || !stepData.steps || stepData.steps.length === 0) {
        bar.className = 'hidden';
        bar.id = 'cbpi-status-bar';
        return;
      }

      var steps = stepData.steps;
      var activeStep = null;
      var activeIdx = -1;
      for (var i = 0; i < steps.length; i++) {
        if (steps[i].status === 'A') { activeStep = steps[i]; activeIdx = i; break; }
      }

      if (!activeStep) {
        // Schritte vorhanden aber keiner aktiv → "Bereit"
        _isOurDomChange = true;
        bar.className = '';
        bar.id = 'cbpi-status-bar';
        bar.innerHTML =
          '<div class="cbpi-status-item"><div class="cbpi-status-dot idle"></div></div>' +
          '<div class="cbpi-status-item"><span class="label">' + (currentLang === 'de' ? 'Status' : 'Status') + '</span>' +
          '<span class="value">' + (currentLang === 'de' ? 'Bereit' : 'Ready') + '</span></div>' +
          '<div class="cbpi-status-item"><span class="label">' + (currentLang === 'de' ? 'Schritte' : 'Steps') + '</span>' +
          '<span class="value">' + steps.length + '</span></div>';
        _isOurDomChange = false;
        return;
      }

      // Aktiver Schritt vorhanden — Sensorwert über Einzel-Endpunkt holen
      var sensorId = (activeStep.props && activeStep.props.Sensor) ? activeStep.props.Sensor : null;
      var sensorPromise = sensorId ? fetchSensorValues([sensorId]) : Promise.resolve({});
      var targetTemp = activeStep.props && activeStep.props.Temp ? parseFloat(activeStep.props.Temp).toFixed(1) + '°C' : '—';
      sensorPromise.then(function (valMap) {
        var sensorVal = sensorId ? getSensorValue(valMap, sensorId) : null;
        sensorVal = (sensorVal !== null && !isNaN(sensorVal)) ? parseFloat(sensorVal).toFixed(1) + '°C' : '—';
        var timerText = activeStep.state_text || '';
        var stepName = activeStep.name || ('Schritt ' + (activeIdx + 1));

        _isOurDomChange = true;
        bar.className = '';
        bar.id = 'cbpi-status-bar';
        bar.innerHTML =
          '<div class="cbpi-status-item"><div class="cbpi-status-dot"></div></div>' +
          '<div class="cbpi-status-item"><span class="label">🌡️ ' + (currentLang === 'de' ? 'Ist' : 'Actual') + '</span><span class="value accent">' + sensorVal + '</span></div>' +
          '<div class="cbpi-status-item"><span class="label">🎯 ' + (currentLang === 'de' ? 'Soll' : 'Target') + '</span><span class="value">' + targetTemp + '</span></div>' +
          '<div class="cbpi-status-item"><span class="label">▶</span><span class="value">' + stepName + '</span></div>' +
          (timerText ? '<div class="cbpi-status-item"><span class="label">⏱</span><span class="value">' + timerText + '</span></div>' : '') +
          '<div class="cbpi-status-item"><span class="label">' + (currentLang === 'de' ? 'Schritt' : 'Step') + '</span><span class="value">' + (activeIdx + 1) + '/' + steps.length + '</span></div>';
        _isOurDomChange = false;
      });
    });
  }

  // ============================================================
  // BRAU-COCKPIT (ersetzt das leere Dashboard)
  // ============================================================
  var _cockpitInterval = null;
  var _cockpitRenderLock = 0; // Timestamp bis wann Intervall-Render blockiert
  var _kettleSettingsOpen = false; // Panel-Zustand überlebt Re-Renders
  var _actorBusy = {}; // Debounce pro Actor-ID

  // ============================================================
  // TEMPERATURVERLAUF — Daten-Store + Canvas-Chart
  // ============================================================
  var TEMP_HISTORY_MAX = 600; // max ~30 Min bei 3s-Intervall
  var _tempHistory = []; // [{t: timestamp, actual: number|null, target: number|null, step: string}]
  var _tempStepChanges = []; // [{t: timestamp, label: string}] — vertikale Marker
  var _lastStepName = '';

  function recordTempPoint(actual, target, stepName) {
    var now = Date.now();
    _tempHistory.push({ t: now, actual: actual, target: target, step: stepName || '' });
    if (_tempHistory.length > TEMP_HISTORY_MAX) _tempHistory.shift();
    // Schrittwechsel erkennen
    if (stepName && stepName !== _lastStepName) {
      _tempStepChanges.push({ t: now, label: stepName });
      _lastStepName = stepName;
    }
  }

  function clearTempHistory() {
    _tempHistory = [];
    _tempStepChanges = [];
    _lastStepName = '';
  }

  function drawTempChart() {
    var canvas = document.getElementById('cockpit-temp-chart');
    if (!canvas || _tempHistory.length < 2) return;
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.parentElement.getBoundingClientRect();
    var W = rect.width;
    var H = 200;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    var pad = { top: 20, right: 16, bottom: 30, left: 48 };
    var plotW = W - pad.left - pad.right;
    var plotH = H - pad.top - pad.bottom;

    // Bereich berechnen
    var tMin = _tempHistory[0].t;
    var tMax = _tempHistory[_tempHistory.length - 1].t;
    var tRange = Math.max(tMax - tMin, 1000); // mind. 1s

    var temps = [];
    _tempHistory.forEach(function (p) {
      if (p.actual !== null) temps.push(p.actual);
      if (p.target !== null) temps.push(p.target);
    });
    if (temps.length === 0) return;
    var vMin = Math.floor(Math.min.apply(null, temps) - 2);
    var vMax = Math.ceil(Math.max.apply(null, temps) + 2);
    if (vMax - vMin < 5) { vMin -= 2; vMax += 2; }
    var vRange = vMax - vMin;

    function tx(t) { return pad.left + ((t - tMin) / tRange) * plotW; }
    function ty(v) { return pad.top + plotH - ((v - vMin) / vRange) * plotH; }

    // Hintergrund
    ctx.clearRect(0, 0, W, H);

    // Raster-Linien
    var style = getComputedStyle(document.documentElement);
    var gridColor = style.getPropertyValue('--border').trim() || 'rgba(255,255,255,0.06)';
    var textColor = style.getPropertyValue('--text-muted').trim() || 'rgba(255,255,255,0.45)';
    var accentColor = style.getPropertyValue('--accent').trim() || '#34e89e';
    var dangerColor = style.getPropertyValue('--danger').trim() || '#e74c3c';

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    // Y-Raster (Temperatur-Stufen alle 5°C)
    var yStep = vRange > 40 ? 10 : (vRange > 15 ? 5 : 2);
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'right';
    for (var yv = Math.ceil(vMin / yStep) * yStep; yv <= vMax; yv += yStep) {
      var yy = ty(yv);
      ctx.beginPath(); ctx.moveTo(pad.left, yy); ctx.lineTo(W - pad.right, yy); ctx.stroke();
      ctx.fillText(yv + '°', pad.left - 6, yy + 3);
    }

    // X-Raster (Zeit alle 5 Min)
    ctx.textAlign = 'center';
    var xStep = tRange > 20 * 60000 ? 5 * 60000 : (tRange > 5 * 60000 ? 2 * 60000 : 60000);
    var firstMark = Math.ceil(tMin / xStep) * xStep;
    for (var xt = firstMark; xt <= tMax; xt += xStep) {
      var xx = tx(xt);
      ctx.beginPath(); ctx.moveTo(xx, pad.top); ctx.lineTo(xx, H - pad.bottom); ctx.stroke();
      var mins = Math.round((xt - tMin) / 60000);
      ctx.fillText(mins + ' min', xx, H - pad.bottom + 14);
    }

    // Schrittwechsel-Markierungen
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = style.getPropertyValue('--warning').trim() || '#f39c12';
    ctx.lineWidth = 1.5;
    _tempStepChanges.forEach(function (sc) {
      if (sc.t >= tMin && sc.t <= tMax) {
        var sx = tx(sc.t);
        ctx.beginPath(); ctx.moveTo(sx, pad.top); ctx.lineTo(sx, H - pad.bottom); ctx.stroke();
        ctx.save();
        ctx.fillStyle = ctx.strokeStyle;
        ctx.font = '9px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(sc.label, sx + 3, pad.top + 10);
        ctx.restore();
      }
    });
    ctx.setLineDash([]);

    // Soll-Linie (gestrichelt)
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    var started = false;
    _tempHistory.forEach(function (p) {
      if (p.target !== null) {
        var x = tx(p.t), y = ty(p.target);
        if (!started) { ctx.moveTo(x, y); started = true; } else { ctx.lineTo(x, y); }
      }
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Ist-Linie (durchgezogen, farbig)
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    started = false;
    _tempHistory.forEach(function (p) {
      if (p.actual !== null) {
        var x = tx(p.t), y = ty(p.actual);
        if (!started) { ctx.moveTo(x, y); started = true; } else { ctx.lineTo(x, y); }
      }
    });
    ctx.stroke();

    // Aktueller Punkt (Kreis am Ende)
    var last = _tempHistory[_tempHistory.length - 1];
    if (last.actual !== null) {
      ctx.beginPath();
      ctx.arc(tx(last.t), ty(last.actual), 4, 0, 2 * Math.PI);
      ctx.fillStyle = accentColor;
      ctx.fill();
      ctx.strokeStyle = style.getPropertyValue('--bg-surface').trim() || '#16213e';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Legende
    ctx.font = '10px Inter, sans-serif';
    var legendY = pad.top - 6;
    // Ist
    ctx.strokeStyle = accentColor; ctx.lineWidth = 2.5; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(W - pad.right - 160, legendY); ctx.lineTo(W - pad.right - 140, legendY); ctx.stroke();
    ctx.fillStyle = textColor; ctx.textAlign = 'left';
    ctx.fillText('Ist', W - pad.right - 136, legendY + 3);
    // Soll
    ctx.strokeStyle = textColor; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(W - pad.right - 100, legendY); ctx.lineTo(W - pad.right - 80, legendY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillText('Soll', W - pad.right - 76, legendY + 3);
    // Schritt
    ctx.strokeStyle = style.getPropertyValue('--warning').trim() || '#f39c12'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(W - pad.right - 42, legendY); ctx.lineTo(W - pad.right - 28, legendY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fillText('Schritt', W - pad.right - 24, legendY + 3);
  }

  function buildCockpit() {
    var hash = window.location.hash.replace('#', '');
    // Cockpit nur auf /dashboard UND wenn Cockpit-Modus aktiv
    if (hash !== '/dashboard' || !_cockpitMode) return;

    // Nur starten, kein Doppel-Interval
    if (!_cockpitInterval) {
      renderCockpit();
      _cockpitInterval = setInterval(renderCockpit, 3000);
    } else {
      renderCockpit();
    }
  }

  function stopCockpit() {
    if (_cockpitInterval) { clearInterval(_cockpitInterval); _cockpitInterval = null; }
    _kettleSettingsOpen = false;
    // Cockpit-DOM entfernen und versteckte Original-Inhalte wieder zeigen
    var cockpit = document.getElementById('cbpi-cockpit');
    if (cockpit) {
      var parent = cockpit.parentNode;
      if (parent) {
        _isOurDomChange = true;
        var children = parent.children;
        for (var i = 0; i < children.length; i++) {
          if (children[i].style && children[i].style.display === 'none') {
            children[i].style.display = '';
          }
        }
        parent.removeChild(cockpit);
        _isOurDomChange = false;
      }
    }
  }

  function renderCockpit(force) {
    var hash = window.location.hash.replace('#', '');
    // Cockpit nur auf /dashboard im Cockpit-Modus
    if (hash !== '/dashboard' || !_cockpitMode) {
      stopCockpit();
      return;
    }
    // Render-Lock: Intervall-Renders blockieren nach User-Interaktion
    // ABER: Wenn noch kein Cockpit-DOM existiert, immer rendern (initialer Aufbau)
    var cockpitExists = !!document.getElementById('cbpi-cockpit');
    if (!force && cockpitExists && _cockpitRenderLock > Date.now()) return;
    // Bei offenem Kessel-Panel: nur Temperaturen aktualisieren, kein voller Re-Render
    if (!force && _kettleSettingsOpen) {
      updateCockpitTempsOnly();
      return;
    }

    Promise.all([
      fetch('/step2/').then(function (r) { return r.json(); }).catch(function () { return null; }),
      fetch('/sensor/').then(function (r) { return r.json(); }).catch(function () { return null; }),
      fetch('/actor/').then(function (r) { return r.json(); }).catch(function () { return null; }),
      fetch('/kettle/').then(function (r) { return r.json(); }).catch(function () { return null; })
    ]).then(function (results) {
      var stepData = results[0];
      var sensorListData = results[1];
      var actorData = results[2];
      var kettleData = results[3];

      // Sensor-Infos (Name etc.) aus der Liste
      var sensorList = sensorListData ? (Array.isArray(sensorListData) ? sensorListData : (sensorListData.data || [])) : [];

      // Alle Sensor-IDs sammeln (aus Steps + Sensor-Liste)
      var sensorIds = [];
      sensorList.forEach(function (s) { if (s.id) sensorIds.push(s.id); });
      var steps = (stepData && stepData.steps) ? stepData.steps : [];
      steps.forEach(function (s) { if (s.props && s.props.Sensor) sensorIds.push(s.props.Sensor); });

      // Echte Sensor-Werte über Einzel-Endpunkte holen
      return fetchSensorValues(sensorIds).then(function (sensorValueMap) {
        return {
          steps: steps, sensorList: sensorList, sensorValueMap: sensorValueMap,
          recipeName: (stepData && stepData.basic && stepData.basic.name) ? stepData.basic.name : null,
          recipeAuthor: (stepData && stepData.basic && stepData.basic.author) ? stepData.basic.author : null,
          actors: actorData ? (Array.isArray(actorData) ? actorData : (actorData.data || [])) : [],
          kettles: kettleData ? (Array.isArray(kettleData) ? kettleData : (kettleData.data || [])) : []
        };
      });
    }).then(function (data) {
      var target = findContentTarget();
      if (!target) return;

      var steps = data.steps;
      var sensorValueMap = data.sensorValueMap;
      var actors = data.actors;
      var kettles = data.kettles;
      var sensorList = data.sensorList;
      var recipeName = data.recipeName;

      var activeStep = null;
      var activeIdx = -1;
      for (var i = 0; i < steps.length; i++) {
        if (steps[i].status === 'A') { activeStep = steps[i]; activeIdx = i; break; }
      }

      var isBrewing = !!activeStep;

      // Cockpit-Modus bestimmen: brewing, ready, idle
      var cockpitState = isBrewing ? 'brewing' : (steps.length > 0 ? 'ready' : 'idle');

      var cockpit = document.getElementById('cbpi-cockpit');
      var needsFullRender = force || !cockpit || cockpit.getAttribute('data-state') !== cockpitState;

      if (!cockpit) {
        // Original-Dashboard-Content verstecken
        _isOurDomChange = true;
        var origChildren = target.children;
        for (var c = 0; c < origChildren.length; c++) {
          if (origChildren[c].id !== 'cbpi-page-title' && origChildren[c].id !== 'cbpi-help-banner' && origChildren[c].id !== 'cbpi-cockpit') {
            origChildren[c].style.display = 'none';
          }
        }
        cockpit = document.createElement('div');
        cockpit.id = 'cbpi-cockpit';
        target.appendChild(cockpit);
        // Event Delegation: einmal anhängen, überlebt innerHTML-Updates
        cockpit.addEventListener('click', cockpitClickHandler);
        // Input-Events für Slider + Select (Delegation)
        cockpit.addEventListener('input', cockpitInputHandler);
        cockpit.addEventListener('change', cockpitChangeHandler);
        _isOurDomChange = false;
      }

      if (needsFullRender) {
        // Voll-Render: Modus hat sich geändert oder erster Render
        var html = '';
        if (isBrewing) {
          html = renderBrewingCockpit(steps, activeStep, activeIdx, sensorValueMap, actors, kettles, recipeName);
        } else if (steps.length > 0) {
          html = renderReadyCockpit(steps, sensorValueMap, actors, kettles, recipeName);
        } else {
          html = renderIdleCockpit(sensorList, actors, kettles, sensorValueMap);
        }
        _isOurDomChange = true;
        cockpit.innerHTML = html;
        cockpit.setAttribute('data-state', cockpitState);
        _isOurDomChange = false;
      } else {
        // Smart-Update: nur Werte im DOM aktualisieren, Buttons nicht anfassen
        smartUpdateCockpit(cockpit, steps, activeStep, activeIdx, sensorValueMap, actors, kettles, recipeName);
      }

      // Temperaturverlauf: Datenpunkt aufzeichnen + Chart zeichnen
      if (isBrewing && activeStep) {
        var _sensorId = activeStep.props ? activeStep.props.Sensor : null;
        var _curTemp = _sensorId ? getSensorValue(sensorValueMap, _sensorId) : null;
        var _tarTemp = (activeStep.props && activeStep.props.Temp) ? parseFloat(activeStep.props.Temp) : null;
        recordTempPoint(_curTemp, _tarTemp, activeStep.name || '');
        drawTempChart();
      } else {
        // Nicht brewing → History leeren
        if (_tempHistory.length > 0) clearTempHistory();
      }
    });
  }

  // Smart-Update: Nur geänderte Werte im DOM aktualisieren, kein innerHTML-Replace
  // Buttons und Click-Targets bleiben intakt
  function smartUpdateCockpit(cockpit, steps, activeStep, activeIdx, sensorValueMap, actors, kettles, recipeName) {
    // 1. Temperaturen aktualisieren
    cockpit.querySelectorAll('[data-sensor-id]').forEach(function(el) {
      var sid = el.getAttribute('data-sensor-id');
      var val = getSensorValue(sensorValueMap, sid);
      var newText = formatTemp(val);
      if (el.textContent !== newText) el.textContent = newText;
    });

    // 2. Delta aktualisieren
    var deltaEl = cockpit.querySelector('.cockpit-temp-delta');
    if (deltaEl && activeStep) {
      var sensorId = activeStep.props ? activeStep.props.Sensor : null;
      var curTemp = getSensorValue(sensorValueMap, sensorId);
      var tarTemp = (activeStep.props && activeStep.props.Temp) ? parseFloat(activeStep.props.Temp) : null;
      if (curTemp !== null && tarTemp !== null) {
        var delta = curTemp - tarTemp;
        var deltaClass = 'cockpit-temp-delta ' + (Math.abs(delta) < 1 ? 'close' : (delta > 0 ? 'positive' : 'negative'));
        deltaEl.className = deltaClass;
        var newDelta = '\u0394 ' + (delta > 0 ? '+' : '') + delta.toFixed(1) + '\u00b0C';
        if (deltaEl.textContent !== newDelta) deltaEl.textContent = newDelta;
      }
    }

    // 3. Soll-Temperatur aktualisieren
    var targetEl = cockpit.querySelector('.cockpit-target-temp');
    if (targetEl && activeStep && activeStep.props && activeStep.props.Temp) {
      var newTarget = (currentLang === 'de' ? 'Ziel: ' : 'Target: ') + parseFloat(activeStep.props.Temp).toFixed(1) + '\u00b0C';
      if (targetEl.textContent !== newTarget) targetEl.textContent = newTarget;
    }

    // 4. Timer/Status aktualisieren
    var timerEl = cockpit.querySelector('.cockpit-timer-text');
    if (timerEl && activeStep) {
      var timerText = formatTimer(activeStep.state_text);
      if (timerEl.textContent !== timerText) timerEl.textContent = timerText;
    }

    // 5. Progress-Bar aktualisieren
    var progressFill = cockpit.querySelector('.cockpit-progress-fill');
    if (progressFill && activeStep && activeStep.state_text) {
      var parts = activeStep.state_text.split('/');
      if (parts.length === 2) {
        var elapsed = parseTimerParts(parts[0].trim());
        var total = parseTimerParts(parts[1].trim());
        if (total > 0) {
          var pct = Math.min(100, Math.round((elapsed / total) * 100));
          progressFill.style.width = pct + '%';
        }
      }
    }

    // 6. Aktor-States aktualisieren (ohne Buttons zu ersetzen)
    actors.forEach(function(actor) {
      var btn = cockpit.querySelector('.cockpit-actor-toggle[data-actor-id="' + actor.id + '"]');
      if (!btn) return;
      // Nicht aktualisieren wenn gerade beschäftigt (optimistic UI)
      if (_actorBusy[actor.id]) return;
      var serverState = actor.state ? '1' : '0';
      var domState = btn.getAttribute('data-actor-state');
      if (serverState !== domState) {
        btn.setAttribute('data-actor-state', serverState);
        if (serverState === '1') {
          btn.classList.remove('off'); btn.classList.add('on');
          btn.innerHTML = '<span class="cockpit-actor-led on"></span> EIN';
        } else {
          btn.classList.remove('on'); btn.classList.add('off');
          btn.innerHTML = '<span class="cockpit-actor-led off"></span> AUS';
        }
      }
    });
  }

  // Lightgewicht-Update: Nur Temperaturwerte im DOM aktualisieren (kein innerHTML-Replace)
  function updateCockpitTempsOnly() {
    var cockpit = document.getElementById('cbpi-cockpit');
    if (!cockpit) return;
    // Sensor-IDs aus den DOM-Elementen sammeln
    var sensorIds = [];
    cockpit.querySelectorAll('[data-sensor-id]').forEach(function(el) {
      var sid = el.getAttribute('data-sensor-id');
      if (sid && sensorIds.indexOf(sid) === -1) sensorIds.push(sid);
    });
    if (sensorIds.length === 0) return;
    fetchSensorValues(sensorIds).then(function(sensorMap) {
      cockpit.querySelectorAll('[data-sensor-id]').forEach(function(el) {
        var sid = el.getAttribute('data-sensor-id');
        var val = getSensorValue(sensorMap, sid);
        el.textContent = formatTemp(val);
      });
    });
  }

  function getSensorValue(sensorMap, sensorId) {
    if (!sensorId || sensorMap[sensorId] === undefined || sensorMap[sensorId] === null) return null;
    return parseFloat(sensorMap[sensorId]);
  }

  function formatTemp(val) {
    return val !== null ? val.toFixed(1) + '°C' : '—';
  }

  function formatTimer(stateText) {
    if (!stateText) return '';
    return stateText;
  }

  function renderBrewingCockpit(steps, activeStep, activeIdx, sensorMap, actors, kettles, recipeName) {
    var sensorId = activeStep.props ? activeStep.props.Sensor : null;
    var currentTemp = getSensorValue(sensorMap, sensorId);
    var targetTemp = (activeStep.props && activeStep.props.Temp) ? parseFloat(activeStep.props.Temp) : null;
    var stepName = activeStep.name || ('Schritt ' + (activeIdx + 1));
    var timerText = formatTimer(activeStep.state_text);
    var nextStep = (activeIdx + 1 < steps.length) ? steps[activeIdx + 1] : null;

    // Delta
    var deltaHtml = '';
    if (currentTemp !== null && targetTemp !== null) {
      var delta = currentTemp - targetTemp;
      var deltaClass = Math.abs(delta) < 1 ? 'close' : (delta > 0 ? 'positive' : 'negative');
      deltaHtml = '<div class="cockpit-temp-delta ' + deltaClass + '">Δ ' + (delta > 0 ? '+' : '') + delta.toFixed(1) + '°C</div>';
    }

    // Progress (grob: wenn Timer-Text wie "12:34 / 60:00" formatiert ist)
    var progressPct = 0;
    if (timerText) {
      var parts = timerText.split('/');
      if (parts.length === 2) {
        var elapsed = parseTimerParts(parts[0].trim());
        var total = parseTimerParts(parts[1].trim());
        if (total > 0) progressPct = Math.min(100, Math.round((elapsed / total) * 100));
      }
    }

    var de = currentLang === 'de';

    var html = '';
    // Status-Banner
    html += '<div class="cockpit-status-banner">';
    html += '<div class="cockpit-status-dot brewing"></div>';
    html += '<div class="cockpit-status-text">';
    if (recipeName) html += '<span class="cockpit-recipe-name">📝 ' + recipeName + '</span> — ';
    html += (de ? 'Brauen aktiv' : 'Brewing active') + ' — <span>' + stepName + '</span> (' + (de ? 'Schritt' : 'Step') + ' ' + (activeIdx + 1) + '/' + steps.length + ')</div>';
    html += '</div>';

    // Grid: Temperatur + Aktueller Schritt
    html += '<div class="cockpit-grid">';

    // Temperatur-Karte
    html += '<div class="cockpit-card">';
    html += '<div class="cockpit-card-title">' + (de ? 'Temperatur' : 'Temperature') + '</div>';
    html += '<div class="cockpit-temp-big" data-sensor-id="' + (sensorId || '') + '">' + formatTemp(currentTemp) + '</div>';
    html += '<div class="cockpit-temp-target">' + (de ? 'Soll' : 'Target') + ': <span>' + formatTemp(targetTemp) + '</span></div>';
    html += deltaHtml;
    html += '</div>';

    // Aktueller Schritt
    html += '<div class="cockpit-card">';
    html += '<div class="cockpit-card-title">' + (de ? 'Aktueller Schritt' : 'Current Step') + '</div>';
    html += '<div class="cockpit-step-name">' + stepName + '</div>';
    html += '<div class="cockpit-step-info">' + (de ? 'Ziel' : 'Target') + ': <span>' + formatTemp(targetTemp) + '</span>';
    if (activeStep.props && activeStep.props.Timer) html += ' · ' + activeStep.props.Timer + ' min';
    html += '</div>';
    if (progressPct > 0 || timerText) {
      html += '<div class="cockpit-progress-bar"><div class="cockpit-progress-fill" style="width:' + progressPct + '%"></div></div>';
    }
    if (timerText) html += '<div class="cockpit-step-timer">⏱ ' + timerText + '</div>';

    // Warte-auf-Benutzer-Hinweis: Temp erreicht bei MashInStep → Malz zugeben
    var waitingForUser = false;
    var stepType = (activeStep.type || '').toLowerCase();
    if (stepType === 'mashinstep' && currentTemp !== null && targetTemp !== null && currentTemp >= targetTemp) {
      waitingForUser = true;
      var notifText = activeStep.props.Notification || (de ? 'Zieltemperatur erreicht' : 'Target temp reached');
      html += '<div class="cockpit-user-action">';
      html += '<div class="cockpit-user-action-icon">⚠️</div>';
      html += '<div class="cockpit-user-action-text">';
      html += '<strong>' + notifText + '</strong><br>';
      html += (de ? 'Malz zugeben und dann <b>⏭ Weiter</b> klicken' : 'Add malt, then click <b>⏭ Next</b>');
      html += '</div></div>';
    }

    if (nextStep) html += '<div class="cockpit-step-next">→ ' + (de ? 'Nächster' : 'Next') + ': ' + (nextStep.name || '') + '</div>';
    html += '</div>';

    html += '</div>'; // /cockpit-grid

    // Grid: Steuerung + Aktoren
    html += '<div class="cockpit-grid">';

    // Steuerung
    html += '<div class="cockpit-card">';
    html += '<div class="cockpit-card-title">' + (de ? 'Steuerung' : 'Controls') + '</div>';
    html += '<div class="cockpit-controls">';
    // Weiter-Button hervorheben wenn auf Benutzer gewartet wird
    html += '<button class="cockpit-ctrl-btn next' + (waitingForUser ? ' pulse' : '') + '" data-action="next">⏭ ' + (de ? 'Weiter' : 'Next') + '</button>';
    html += '<button class="cockpit-ctrl-btn stop" data-action="stop">⏹ ' + (de ? 'Stop' : 'Stop') + '</button>';
    html += '<button class="cockpit-ctrl-btn reset" data-action="reset">🔄 ' + (de ? 'Reset' : 'Reset') + '</button>';
    html += '</div></div>';

    // Aktoren (interaktive Schalter)
    html += '<div class="cockpit-card">';
    html += '<div class="cockpit-card-title">' + (de ? 'Aktoren' : 'Actors') + '</div>';
    actors.forEach(function (actor) {
      var isOn = actor.state === true || actor.state === 1;
      var hint = getActorHint(actor, activeStep, de);
      html += '<div class="cockpit-actor-row">';
      html += '<span class="cockpit-actor-name">' + (actor.name || actor.id) + '</span>';
      if (hint) html += '<span class="cockpit-actor-hint">' + hint + '</span>';
      html += '<button class="cockpit-actor-toggle ' + (isOn ? 'on' : 'off') + '" data-actor-id="' + actor.id + '" data-actor-state="' + (isOn ? '1' : '0') + '">';
      html += '<span class="cockpit-actor-led ' + (isOn ? 'on' : 'off') + '"></span> ';
      html += isOn ? (de ? 'EIN' : 'ON') : (de ? 'AUS' : 'OFF');
      html += '</button></div>';
    });
    html += '</div>';

    html += '</div>'; // /cockpit-grid

    // Temperaturverlauf-Chart
    html += '<div class="cockpit-card cockpit-card-full cockpit-chart-card">';
    html += '<div class="cockpit-card-title">📈 ' + (de ? 'Temperaturverlauf' : 'Temperature History') + '</div>';
    if (_tempHistory.length < 2) {
      html += '<div class="cockpit-chart-hint">' + (de ? 'Daten werden gesammelt…' : 'Collecting data…') + '</div>';
    }
    html += '<div class="cockpit-chart-wrap"><canvas id="cockpit-temp-chart"></canvas></div>';
    html += '</div>';

    // Alle Schritte
    html += renderStepsList(steps, activeIdx);

    // Kessel-Einstellungen
    html += renderKettleSettings(kettles);

    return html;
  }

  function renderReadyCockpit(steps, sensorMap, actors, kettles, recipeName) {
    var de = currentLang === 'de';

    // Ersten Sensor-Wert finden
    var firstSensorVal = null;
    if (steps[0] && steps[0].props && steps[0].props.Sensor) {
      firstSensorVal = getSensorValue(sensorMap, steps[0].props.Sensor);
    }
    if (firstSensorVal === null) {
      // Fallback: ersten Wert aus der Value-Map nehmen
      for (var sid in sensorMap) {
        var v = sensorMap[sid];
        if (v !== undefined && v !== null) { firstSensorVal = parseFloat(v); break; }
      }
    }

    var html = '';
    html += '<div class="cockpit-status-banner">';
    html += '<div class="cockpit-status-dot idle"></div>';
    html += '<div class="cockpit-status-text">';
    if (recipeName) html += '<span class="cockpit-recipe-name">📝 ' + recipeName + '</span> — ';
    html += (de ? 'Bereit zum Brauen' : 'Ready to brew') + ' — <span>' + steps.length + ' ' + (de ? 'Schritte geladen' : 'steps loaded') + '</span></div>';
    html += '</div>';

    html += '<div class="cockpit-grid">';

    // Temperatur
    html += '<div class="cockpit-card">';
    html += '<div class="cockpit-card-title">' + (de ? 'Temperatur' : 'Temperature') + '</div>';
    var readySensorId = (steps[0] && steps[0].props && steps[0].props.Sensor) ? steps[0].props.Sensor : '';
    html += '<div class="cockpit-temp-big" data-sensor-id="' + readySensorId + '">' + formatTemp(firstSensorVal) + '</div>';
    html += '<div class="cockpit-temp-target">' + (de ? 'Aktuell (Raumtemperatur)' : 'Current (room temp)') + '</div>';
    html += '</div>';

    // Start-Karte
    html += '<div class="cockpit-card">';
    html += '<div class="cockpit-card-title">' + (de ? 'Brauvorgang starten' : 'Start Brewing') + '</div>';
    html += '<div class="cockpit-controls">';
    html += '<button class="cockpit-ctrl-btn start" data-action="start">▶️ ' + (de ? 'Start' : 'Start') + '</button>';
    html += '<button class="cockpit-ctrl-btn reset" data-action="reset">🔄 ' + (de ? 'Reset' : 'Reset') + '</button>';
    html += '</div></div>';

    html += '</div>';

    // Aktoren-Karte (auch im Ready-State schaltbar)
    html += '<div class="cockpit-card cockpit-card-full">';
    html += '<div class="cockpit-card-title">' + (de ? 'Aktoren' : 'Actors') + '</div>';
    html += '<div class="cockpit-actors-row">';
    actors.forEach(function (actor) {
      var isOn = actor.state === true || actor.state === 1;
      html += '<div class="cockpit-actor-item">';
      html += '<span class="cockpit-actor-name">' + (actor.name || actor.id) + '</span>';
      html += '<button class="cockpit-actor-toggle ' + (isOn ? 'on' : 'off') + '" data-actor-id="' + actor.id + '" data-actor-state="' + (isOn ? '1' : '0') + '">';
      html += '<span class="cockpit-actor-led ' + (isOn ? 'on' : 'off') + '"></span> ';
      html += isOn ? (de ? 'EIN' : 'ON') : (de ? 'AUS' : 'OFF');
      html += '</button></div>';
    });
    html += '</div></div>';

    // Schritte
    html += renderStepsList(steps, -1);

    // Kessel-Einstellungen
    html += renderKettleSettings(kettles);

    return html;
  }

  function renderIdleCockpit(sensors, actors, kettles, sensorValueMap) {
    var de = currentLang === 'de';

    // Aktuellen Sensorwert finden
    var sensorVal = null;
    var sensorName = '';
    if (sensors.length > 0) {
      var s = sensors[0];
      sensorVal = getSensorValue(sensorValueMap || {}, s.id);
      sensorName = s.name || s.id || '';
    }

    var html = '';

    // Hero
    html += '<div class="cockpit-card">';
    html += '<div class="cockpit-idle-hero">';
    html += '<div class="icon">🍺</div>';
    html += '<h2>' + (de ? 'Bereit für den nächsten Brautag!' : 'Ready for your next brew day!') + '</h2>';
    html += '<p>' + (de ? 'Lade ein Rezept aus dem Rezeptbuch, um loszulegen.' : 'Load a recipe from the recipe book to get started.') + '</p>';
    html += '<button class="cockpit-idle-btn" onclick="window.location.hash=\'#/recipes\'">📖 ' + (de ? 'Rezeptbuch öffnen' : 'Open Recipe Book') + '</button>';
    html += '</div></div>';

    html += '<div class="cockpit-grid">';

    // Temperatur
    html += '<div class="cockpit-card">';
    html += '<div class="cockpit-card-title">' + (de ? 'Temperatur' : 'Temperature') + '</div>';
    var idleSensorId = (sensors.length > 0 && sensors[0].id) ? sensors[0].id : '';
    html += '<div class="cockpit-temp-big" data-sensor-id="' + idleSensorId + '">' + formatTemp(sensorVal) + '</div>';
    if (sensorName) html += '<div class="cockpit-temp-target">' + sensorName + '</div>';
    html += '</div>';

    // Setup Info
    html += '<div class="cockpit-card">';
    html += '<div class="cockpit-card-title">' + (de ? 'Dein Setup' : 'Your Setup') + '</div>';
    html += '<div class="cockpit-setup-grid">';
    if (kettles.length > 0) {
      kettles.forEach(function (k) {
        html += '<div class="cockpit-setup-item"><span class="icon">🍺</span><div class="info"><span class="label">' + (de ? 'Kessel' : 'Kettle') + '</span><span class="value">' + (k.name || k.id) + '</span></div></div>';
      });
    }
    sensors.forEach(function (s) {
      html += '<div class="cockpit-setup-item"><span class="icon">🌡️</span><div class="info"><span class="label">' + (de ? 'Sensor' : 'Sensor') + '</span><span class="value">' + (s.name || s.id) + '</span></div></div>';
    });
    actors.forEach(function (a) {
      html += '<div class="cockpit-setup-item"><span class="icon">⚡</span><div class="info"><span class="label">' + (de ? 'Aktor' : 'Actor') + '</span><span class="value">' + (a.name || a.id) + '</span></div></div>';
    });
    if (sensors.length === 0 && actors.length === 0 && kettles.length === 0) {
      html += '<div class="cockpit-setup-item"><span class="icon">⚠️</span><div class="info"><span class="label">' + (de ? 'Hinweis' : 'Note') + '</span><span class="value">' + (de ? 'Noch keine Hardware eingerichtet' : 'No hardware configured yet') + '</span></div></div>';
    }
    html += '</div></div>';

    html += '</div>';

    // Kessel-Einstellungen (auch im Idle-Modus)
    html += renderKettleSettings(kettles);

    return html;
  }

  // ── Kessel-Schnelleinstellungen (Hysterese / Volumen) ──
  // Bekannte Einkochautomaten / Braukessel Datenbank
  var KETTLE_PRESETS = [
    { name: '⭐ Profi Cook PC-EKA 1066 (27L)', d: 35, h: 29, maxVol: 27, watt: 1800 },
    { name: 'Bielmeier BHG 411 (29L)', d: 36, h: 40, maxVol: 29, watt: 1800 },
    { name: 'Bielmeier BHG 480 (29L)', d: 36, h: 40, maxVol: 29, watt: 2000 },
    { name: 'Klarstein Biggie (27L)', d: 35, h: 38, maxVol: 27, watt: 2000 },
    { name: 'Klarstein Biggie Digital (27L)', d: 35, h: 38, maxVol: 27, watt: 2000 },
    { name: 'Weck WAT 14 (25L)', d: 34, h: 38, maxVol: 25, watt: 1800 },
    { name: 'Weck WAT 15 (29L)', d: 36, h: 40, maxVol: 29, watt: 1800 },
    { name: 'Weck WAT 35 (29L)', d: 36, h: 40, maxVol: 29, watt: 2000 },
    { name: 'Severin EA 3653 (29L)', d: 36, h: 40, maxVol: 29, watt: 1800 },
    { name: 'Stagecaptain GK-27 (27L)', d: 35, h: 38, maxVol: 27, watt: 2000 },
    { name: 'Rommelsbacher KA 2004/E (27L)', d: 35, h: 37, maxVol: 27, watt: 2000 },
    { name: 'Steba ER 2 (27L)', d: 35, h: 38, maxVol: 27, watt: 1800 },
    { name: 'Grainfather G30 (30L)', d: 32, h: 50, maxVol: 30, watt: 1600 },
    { name: 'Grainfather G70 (70L)', d: 40, h: 68, maxVol: 70, watt: 2200 },
    { name: 'Brewzilla 35L', d: 33, h: 56, maxVol: 35, watt: 2500 },
    { name: 'Brewzilla 65L', d: 40, h: 68, maxVol: 65, watt: 2500 },
    { name: 'Speidel Braumeister 20L', d: 30, h: 44, maxVol: 20, watt: 2000 },
    { name: 'Speidel Braumeister 50L', d: 38, h: 60, maxVol: 50, watt: 3000 },
    { name: 'Klarstein Brauheld 15L', d: 30, h: 35, maxVol: 15, watt: 1500 },
    { name: 'Klarstein Brauheld 25L', d: 35, h: 38, maxVol: 25, watt: 1800 },
    { name: 'Kochtopf / Sonstig', d: 0, h: 0, maxVol: 0, watt: 0 }
  ];

  // Offset-Berechnung aus Füllvolumen (Liter)
  // Formel: Weniger Wasser = höherer OffsetOff (früheres Abschalten)
  function calcOffsets(volumeL, watt) {
    if (!volumeL || volumeL <= 0) return { off: 2, on: 0.5 };
    // Heizleistung-Faktor: mehr Watt = mehr Nachhitze
    var wattFactor = watt ? Math.max(0.8, Math.min(1.4, watt / 2000)) : 1.0;
    // Grundkurve: OffsetOff = 12 / sqrt(volume) * wattFactor
    var offOff = Math.round((12 / Math.sqrt(volumeL)) * wattFactor * 2) / 2; // auf 0.5 runden
    offOff = Math.max(1, Math.min(15, offOff));
    var offOn = volumeL <= 10 ? 1.0 : 0.5;
    return { off: offOff, on: offOn };
  }

  // Volumen aus Durchmesser + Füllhöhe berechnen (Zylinder, cm → Liter)
  function calcVolume(diameterCm, fillHeightCm) {
    if (!diameterCm || !fillHeightCm || diameterCm <= 0 || fillHeightCm <= 0) return 0;
    var r = diameterCm / 2;
    return Math.round(Math.PI * r * r * fillHeightCm / 1000 * 10) / 10;
  }

  function renderKettleSettings(kettles) {
    if (!kettles || kettles.length === 0) return '';
    var de = currentLang === 'de';
    var k = kettles[0];
    var kettleType = k.type || 'Hysteresis';
    var isPID = kettleType === 'PIDBoil';

    var html = '';
    html += '<div class="cockpit-kettle-settings" id="cockpit-kettle-settings">';
    html += '<button class="cockpit-kettle-toggle" data-kettle-toggle="1">';
    html += '⚙️ ' + (de ? 'Kessel-Einstellungen & Kalibrierung' : 'Kettle Settings & Calibration');
    html += ' <span class="cockpit-kettle-arrow">' + (_kettleSettingsOpen ? '▼' : '▶') + '</span>';
    html += '</button>';
    html += '<div class="cockpit-kettle-panel" style="display:' + (_kettleSettingsOpen ? 'block' : 'none') + '">';

    // ─── Aktuelle Regelung ───
    html += '<div class="cockpit-kettle-section">';
    html += '<div class="cockpit-kettle-section-title">📍 ' + (de ? 'Aktuelle Regelung' : 'Current Control') + ': <strong>' + kettleType + '</strong></div>';

    if (isPID) {
      var pidP = (k.props && k.props.P !== undefined) ? parseFloat(k.props.P) : 120;
      var pidI = (k.props && k.props.I !== undefined) ? parseFloat(k.props.I) : 0.3;
      var pidD = (k.props && k.props.D !== undefined) ? parseFloat(k.props.D) : 45;
      var pidSample = (k.props && k.props.SampleTime !== undefined) ? parseInt(k.props.SampleTime) : 5;
      var pidMaxOut = (k.props && k.props.Max_Output !== undefined) ? parseInt(k.props.Max_Output) : 100;
      var pidBoilThr = (k.props && k.props.Boil_Threshold !== undefined) ? parseFloat(k.props.Boil_Threshold) : 98;
      var pidMaxBoil = (k.props && k.props.Max_Boil_Output !== undefined) ? parseInt(k.props.Max_Boil_Output) : 85;

      html += '<div class="cockpit-kettle-current cockpit-pid-overview">';
      html += '<div class="cockpit-kettle-val"><span class="label">P</span><span class="value">' + pidP + '</span></div>';
      html += '<div class="cockpit-kettle-val"><span class="label">I</span><span class="value">' + pidI + '</span></div>';
      html += '<div class="cockpit-kettle-val"><span class="label">D</span><span class="value">' + pidD + '</span></div>';
      html += '<div class="cockpit-kettle-val"><span class="label">' + (de ? 'Max. Leistung' : 'Max Power') + '</span><span class="value">' + pidMaxOut + '%</span></div>';
      html += '<div class="cockpit-kettle-val"><span class="label">' + (de ? 'Koch-Schwelle' : 'Boil Threshold') + '</span><span class="value">' + pidBoilThr + '°C</span></div>';
      html += '<div class="cockpit-kettle-val"><span class="label">' + (de ? 'Koch-Leistung' : 'Boil Power') + '</span><span class="value">' + pidMaxBoil + '%</span></div>';
      html += '</div>';

      html += '<p class="cockpit-kettle-desc">' + (de
        ? '💡 PID regelt die Heizleistung stufenlos (0–100%). Je näher am Ziel, desto weniger Power — kaum Überschuss!'
        : '💡 PID controls heater power smoothly (0–100%). Closer to target = less power — minimal overshoot!') + '</p>';
    } else {
      var offsetOff = (k.props && k.props.OffsetOff !== undefined) ? parseFloat(k.props.OffsetOff) : 0;
      var offsetOn = (k.props && k.props.OffsetOn !== undefined) ? parseFloat(k.props.OffsetOn) : 0;
      html += '<div class="cockpit-kettle-current">';
      html += '<div class="cockpit-kettle-val"><span class="label">' + (de ? 'Heizung AUS bei Ziel minus' : 'Heater OFF at target minus') + '</span>';
      html += '<span class="value">' + offsetOff.toFixed(1) + '°C</span></div>';
      html += '<div class="cockpit-kettle-val"><span class="label">' + (de ? 'Heizung AN bei Ziel minus' : 'Heater ON at target minus') + '</span>';
      html += '<span class="value">' + offsetOn.toFixed(1) + '°C</span></div>';
      html += '</div>';
    }
    html += '</div>';

    // ─── PID-Tuning (nur bei PIDBoil) ───
    if (isPID) {
      html += '<div class="cockpit-kettle-section">';
      html += '<div class="cockpit-kettle-section-title">🎛️ ' + (de ? 'PID-Tuning' : 'PID Tuning') + '</div>';
      html += '<p class="cockpit-kettle-desc">' + (de
        ? 'P = Reaktionsstärke, I = Langzeitkorrektur, D = Bremswirkung. Höheres P = aggressiver, höheres D = weniger Überschwinger.'
        : 'P = reaction strength, I = long-term correction, D = braking effect. Higher P = more aggressive, higher D = less overshoot.') + '</p>';

      html += '<div class="cockpit-kettle-inputs cockpit-pid-inputs">';
      html += '<div class="cockpit-kettle-field"><label>P (' + (de ? 'Proportional' : 'Proportional') + ')</label>';
      html += '<input type="number" id="pid-p" class="cockpit-kettle-input" min="0" max="500" step="1" value="' + pidP + '" /></div>';
      html += '<div class="cockpit-kettle-field"><label>I (' + (de ? 'Integral' : 'Integral') + ')</label>';
      html += '<input type="number" id="pid-i" class="cockpit-kettle-input" min="0" max="10" step="0.01" value="' + pidI + '" /></div>';
      html += '<div class="cockpit-kettle-field"><label>D (' + (de ? 'Derivat' : 'Derivative') + ')</label>';
      html += '<input type="number" id="pid-d" class="cockpit-kettle-input" min="0" max="200" step="1" value="' + pidD + '" /></div>';
      html += '<div class="cockpit-kettle-field"><label>' + (de ? 'Abtastzeit (s)' : 'Sample Time (s)') + '</label>';
      html += '<select id="pid-sample" class="cockpit-kettle-select"><option value="2"' + (pidSample === 2 ? ' selected' : '') + '>2s</option><option value="5"' + (pidSample === 5 ? ' selected' : '') + '>5s</option></select></div>';
      html += '<div class="cockpit-kettle-field"><label>' + (de ? 'Max. Leistung (%)' : 'Max Output (%)') + '</label>';
      html += '<input type="number" id="pid-maxout" class="cockpit-kettle-input" min="10" max="100" step="5" value="' + pidMaxOut + '" /></div>';
      html += '<div class="cockpit-kettle-field"><label>' + (de ? 'Koch-Schwelle (°C)' : 'Boil Threshold (°C)') + '</label>';
      html += '<input type="number" id="pid-boiltemp" class="cockpit-kettle-input" min="90" max="105" step="1" value="' + pidBoilThr + '" /></div>';
      html += '<div class="cockpit-kettle-field"><label>' + (de ? 'Koch-Leistung (%)' : 'Boil Power (%)') + '</label>';
      html += '<input type="number" id="pid-boilout" class="cockpit-kettle-input" min="10" max="100" step="5" value="' + pidMaxBoil + '" /></div>';
      html += '</div>';

      // PID Presets
      html += '<div class="cockpit-kettle-presets">';
      html += '<div class="cockpit-kettle-presets-title">' + (de ? 'PID-Voreinstellungen' : 'PID Presets') + '</div>';
      html += '<div class="cockpit-kettle-preset-btns">';
      html += '<button class="cockpit-kettle-preset" data-pid-preset="conservative">🐢 ' + (de ? 'Vorsichtig' : 'Conservative') + '</button>';
      html += '<button class="cockpit-kettle-preset" data-pid-preset="balanced">⚖️ ' + (de ? 'Ausgewogen' : 'Balanced') + '</button>';
      html += '<button class="cockpit-kettle-preset" data-pid-preset="aggressive">🔥 ' + (de ? 'Aggressiv' : 'Aggressive') + '</button>';
      html += '</div></div>';

      html += '</div>'; // /pid tuning section
    }

    // ─── Kessel-Kalibrierung (nur bei Hysterese) ───
    if (!isPID) {
      html += '<div class="cockpit-kettle-section">';
      html += '<div class="cockpit-kettle-section-title">' + (de ? '🔧 Kessel-Kalibrierung' : '🔧 Kettle Calibration') + '</div>';
      html += '<p class="cockpit-kettle-desc">' + (de
        ? 'Wähle deinen Kessel oder gib Maße + Füllmenge ein. Die Offsets werden automatisch berechnet.'
        : 'Select your kettle or enter dimensions + fill level. Offsets are calculated automatically.') + '</p>';

      // Geräte-Auswahl
      html += '<div class="cockpit-kettle-field">';
      html += '<label>' + (de ? 'Bekannte Geräte' : 'Known Devices') + '</label>';
      html += '<select id="kettle-preset-select" class="cockpit-kettle-select">';
      html += '<option value="">' + (de ? '— Gerät wählen —' : '— Select device —') + '</option>';
      KETTLE_PRESETS.forEach(function (p, idx) {
        html += '<option value="' + idx + '">' + p.name + '</option>';
      });
      html += '</select></div>';

      // Manuelle Eingabe
      html += '<div class="cockpit-kettle-inputs">';
      html += '<div class="cockpit-kettle-field"><label>' + (de ? 'Durchmesser (cm)' : 'Diameter (cm)') + '</label>';
      html += '<input type="number" id="kettle-diameter" class="cockpit-kettle-input" min="10" max="80" step="1" placeholder="z.B. 36" /></div>';
      html += '<div class="cockpit-kettle-field"><label>' + (de ? 'Kesselhöhe (cm)' : 'Kettle Height (cm)') + '</label>';
      html += '<input type="number" id="kettle-height" class="cockpit-kettle-input" min="10" max="100" step="1" placeholder="z.B. 40" /></div>';
      html += '<div class="cockpit-kettle-field"><label>' + (de ? 'Füllmenge (Liter)' : 'Fill Volume (L)') + '</label>';
      html += '<input type="number" id="kettle-fill" class="cockpit-kettle-input" min="1" max="100" step="0.5" placeholder="z.B. 20" /></div>';
      html += '<div class="cockpit-kettle-field"><label>' + (de ? 'Heizleistung (Watt)' : 'Heater Power (W)') + '</label>';
      html += '<input type="number" id="kettle-watt" class="cockpit-kettle-input" min="500" max="5000" step="100" placeholder="z.B. 2000" /></div>';
      html += '</div>';

      // Berechnung
      html += '<div class="cockpit-kettle-calc-row">';
      html += '<button class="cockpit-kettle-calc-btn" data-kettle-calc="1">';
      html += '🧮 ' + (de ? 'Offsets berechnen' : 'Calculate Offsets');
      html += '</button>';
      html += '<div class="cockpit-kettle-calc-result" id="kettle-calc-result"></div>';
      html += '</div>';
      html += '<div class="cockpit-kettle-fill-hint" id="kettle-fill-hint" style="display:none"></div>';
      html += '</div>'; // /calibration section

      // ─── Manuelle Feineinstellung ───
      html += '<div class="cockpit-kettle-section">';
      html += '<div class="cockpit-kettle-section-title">' + (de ? '🎚️ Feineinstellung' : '🎚️ Fine Tuning') + '</div>';
      html += '<div class="cockpit-kettle-sliders">';
      html += '<div class="cockpit-kettle-slider-group">';
      html += '<label>OffsetOff: <strong id="kettle-off-val">' + offsetOff.toFixed(1) + '</strong>°C</label>';
      html += '<input type="range" min="0" max="15" step="0.5" value="' + offsetOff + '" class="cockpit-kettle-range" data-kettle-slider="off" />';
      html += '<div class="cockpit-kettle-range-hint">' + (de ? 'Höher = früher abschalten = weniger Überschuss' : 'Higher = turn off earlier = less overshoot') + '</div>';
      html += '</div>';
      html += '<div class="cockpit-kettle-slider-group">';
      html += '<label>OffsetOn: <strong id="kettle-on-val">' + offsetOn.toFixed(1) + '</strong>°C</label>';
      html += '<input type="range" min="0" max="5" step="0.5" value="' + offsetOn + '" class="cockpit-kettle-range" data-kettle-slider="on" />';
      html += '<div class="cockpit-kettle-range-hint">' + (de ? 'Wann Heizung wieder angeht unter Ziel' : 'When heater turns back on below target') + '</div>';
      html += '</div>';
      html += '</div>';

      // Schnell-Presets
      html += '<div class="cockpit-kettle-presets">';
      html += '<div class="cockpit-kettle-presets-title">' + (de ? 'Schnellwahl nach Volumen' : 'Quick presets by volume') + '</div>';
      html += '<div class="cockpit-kettle-preset-btns">';
      html += '<button class="cockpit-kettle-preset" data-preset-off="8" data-preset-on="1">🧪 2–5L</button>';
      html += '<button class="cockpit-kettle-preset" data-preset-off="5" data-preset-on="1">🪣 5–10L</button>';
      html += '<button class="cockpit-kettle-preset" data-preset-off="3" data-preset-on="0.5">🛢️ 10–20L</button>';
      html += '<button class="cockpit-kettle-preset" data-preset-off="2" data-preset-on="0.5">🏭 20–30L</button>';
      html += '<button class="cockpit-kettle-preset" data-preset-off="1" data-preset-on="0.5">🏗️ 30L+</button>';
      html += '</div></div>';
      html += '</div>'; // /fine tuning section

      // Referenz-Tabelle
      html += '<details class="cockpit-kettle-ref">';
      html += '<summary>' + (de ? '📊 Referenz: Offset-Werte nach Volumen' : '📊 Reference: Offset values by volume') + '</summary>';
      html += '<table class="cockpit-kettle-table">';
      html += '<thead><tr><th>' + (de ? 'Volumen' : 'Volume') + '</th><th>OffsetOff</th><th>OffsetOn</th><th>' + (de ? 'Erklärung' : 'Explanation') + '</th></tr></thead><tbody>';
      html += '<tr><td>2–5 L</td><td><b>8–10°C</b></td><td>1°C</td><td>' + (de ? 'Wenig Wasser = viel Nachhitze' : 'Low water = lots of residual heat') + '</td></tr>';
      html += '<tr><td>5–10 L</td><td><b>5–7°C</b></td><td>1°C</td><td>' + (de ? 'Kleine Chargen, moderate Nachhitze' : 'Small batches, moderate residual heat') + '</td></tr>';
      html += '<tr><td>10–20 L</td><td><b>3–4°C</b></td><td>0.5°C</td><td>' + (de ? 'Standard-Heimbrauen' : 'Standard homebrewing') + '</td></tr>';
      html += '<tr><td>20–30 L</td><td><b>2–3°C</b></td><td>0.5°C</td><td>' + (de ? 'Große Chargen' : 'Large batches') + '</td></tr>';
      html += '<tr><td>30+ L</td><td><b>1–2°C</b></td><td>0.5°C</td><td>' + (de ? 'Große Anlage' : 'Large system') + '</td></tr>';
      html += '</tbody></table>';
      html += '</details>';
    }

    // Speichern-Button
    html += '<div class="cockpit-kettle-save-row">';
    html += '<button class="cockpit-kettle-save" data-kettle-save="' + k.id + '">';
    html += '💾 ' + (de ? 'Einstellungen speichern' : 'Save Settings');
    html += '</button>';
    html += '<span class="cockpit-kettle-save-status" id="kettle-save-status"></span>';
    html += '</div>';

    html += '</div>'; // /panel
    html += '</div>'; // /kettle-settings
    return html;
  }

  function renderStepsList(steps, activeIdx) {
    var de = currentLang === 'de';
    var html = '<div class="cockpit-steps-card">';
    html += '<div class="cockpit-card-title">' + (de ? 'Alle Schritte' : 'All Steps') + '</div>';

    steps.forEach(function (step, idx) {
      var isActive = idx === activeIdx;
      var isDone = step.status === 'D';
      var rowClass = isActive ? 'active' : (isDone ? 'done' : '');
      var icon = isDone ? '✅' : (isActive ? '▶️' : '⬜');
      var statusText = isDone ? (de ? 'erledigt' : 'done') : (isActive ? (de ? 'aktiv' : 'active') : (de ? 'ausstehend' : 'pending'));
      var statusClass = isDone ? 'done' : (isActive ? 'active' : 'pending');
      var temp = (step.props && step.props.Temp) ? parseFloat(step.props.Temp).toFixed(0) + '°C' : '';
      var timer = (step.props && step.props.Timer) ? step.props.Timer + ' min' : '';

      html += '<div class="cockpit-step-row ' + rowClass + '">';
      html += '<span class="cockpit-step-icon">' + icon + '</span>';
      html += '<span class="cockpit-step-row-name">' + (step.name || 'Schritt ' + (idx + 1)) + '</span>';
      html += '<span class="cockpit-step-row-temp">' + temp + '</span>';
      html += '<span class="cockpit-step-row-time">' + timer + '</span>';
      html += '<span class="cockpit-step-row-status ' + statusClass + '">' + statusText + '</span>';
      html += '</div>';
    });

    html += '</div>';
    return html;
  }

  function parseTimerParts(str) {
    // "12:34" → Sekunden
    var parts = str.split(':');
    if (parts.length === 2) return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    if (parts.length === 3) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    return 0;
  }

  // Event Delegation Handler – wird einmal auf #cbpi-cockpit registriert
  // und bleibt aktiv auch wenn innerHTML aktualisiert wird.
  function cockpitClickHandler(e) {
    // Jeder Klick im Cockpit: kurzes Render-Lock gegen Flackern
    _cockpitRenderLock = Date.now() + 3500;

    // Brau-Steuerung (Start/Stop/Next/Reset)
    var ctrlBtn = e.target.closest('.cockpit-ctrl-btn[data-action]');
    if (ctrlBtn) {
      e.stopPropagation();
      _cockpitRenderLock = Date.now() + 2000; // 2s Lock gegen Flackern
      ctrlBtn.style.opacity = '0.5';
      ctrlBtn.style.pointerEvents = 'none';
      var action = ctrlBtn.getAttribute('data-action');
      fetch('/step2/' + action, { method: 'POST' })
        .then(function () { _cockpitRenderLock = 0; renderCockpit(true); })
        .catch(function (err) {
          console.error('[CBPI Cockpit] Action failed:', err);
          _cockpitRenderLock = 0; renderCockpit(true);
        });
      return;
    }

    // Kessel-Settings: Toggle Panel
    var kettleToggle = e.target.closest('[data-kettle-toggle]');
    if (kettleToggle) {
      e.stopPropagation();
      _kettleSettingsOpen = !_kettleSettingsOpen;
      if (_kettleSettingsOpen) {
        _cockpitRenderLock = Date.now() + 60000; // Lock solange Panel offen
      } else {
        _cockpitRenderLock = 0; // Lock aufheben beim Schließen
      }
      var panel = kettleToggle.nextElementSibling;
      var arrow = kettleToggle.querySelector('.cockpit-kettle-arrow');
      if (panel) {
        panel.style.display = _kettleSettingsOpen ? 'block' : 'none';
        if (arrow) arrow.textContent = _kettleSettingsOpen ? '▼' : '▶';
      }
      return;
    }

    // Kessel-Settings: Slider live update
    // (handled via input event in cockpitInputHandler)

    // Kessel-Kalibrierung: Berechnen-Button
    var calcBtn = e.target.closest('[data-kettle-calc]');
    if (calcBtn) {
      e.stopPropagation();
      _cockpitRenderLock = Date.now() + 10000; // 10s Lock während Kalibrierung
      var fill = parseFloat(document.getElementById('kettle-fill').value) || 0;
      var watt = parseFloat(document.getElementById('kettle-watt').value) || 2000;
      var diam = parseFloat(document.getElementById('kettle-diameter').value) || 0;
      var height = parseFloat(document.getElementById('kettle-height').value) || 0;
      var resultEl = document.getElementById('kettle-calc-result');
      if (fill <= 0 && diam > 0 && height > 0) {
        fill = calcVolume(diam, height);
        document.getElementById('kettle-fill').value = fill;
      }
      if (fill <= 0) {
        if (resultEl) resultEl.innerHTML = '<span class="error">' + (currentLang === 'de' ? '❌ Bitte Füllmenge oder Maße eingeben' : '❌ Please enter fill volume or dimensions') + '</span>';
        return;
      }
      var offsets = calcOffsets(fill, watt);
      // Slider aktualisieren
      var offSlider = document.querySelector('[data-kettle-slider="off"]');
      var onSlider = document.querySelector('[data-kettle-slider="on"]');
      if (offSlider) offSlider.value = offsets.off;
      if (onSlider) onSlider.value = offsets.on;
      var offLabel = document.getElementById('kettle-off-val');
      var onLabel = document.getElementById('kettle-on-val');
      if (offLabel) offLabel.textContent = offsets.off.toFixed(1);
      if (onLabel) onLabel.textContent = offsets.on.toFixed(1);
      if (resultEl) {
        resultEl.innerHTML = '<span class="success">✅ ' + (currentLang === 'de'
          ? fill.toFixed(1) + 'L bei ' + watt + 'W → OffsetOff: <b>' + offsets.off.toFixed(1) + '°C</b>, OffsetOn: <b>' + offsets.on.toFixed(1) + '°C</b>'
          : fill.toFixed(1) + 'L at ' + watt + 'W → OffsetOff: <b>' + offsets.off.toFixed(1) + '°C</b>, OffsetOn: <b>' + offsets.on.toFixed(1) + '°C</b>')
        + '</span>';
      }
      return;
    }

    // Kessel-Settings: Preset-Buttons
    var presetBtn = e.target.closest('.cockpit-kettle-preset');
    if (presetBtn) {
      e.stopPropagation();
      var offVal = parseFloat(presetBtn.getAttribute('data-preset-off'));
      var onVal = parseFloat(presetBtn.getAttribute('data-preset-on'));
      var offSlider = document.querySelector('[data-kettle-slider="off"]');
      var onSlider = document.querySelector('[data-kettle-slider="on"]');
      if (offSlider) { offSlider.value = offVal; }
      if (onSlider) { onSlider.value = onVal; }
      var offLabel = document.getElementById('kettle-off-val');
      var onLabel = document.getElementById('kettle-on-val');
      if (offLabel) offLabel.textContent = offVal.toFixed(1);
      if (onLabel) onLabel.textContent = onVal.toFixed(1);
      // Preset-Buttons: aktiven markieren
      document.querySelectorAll('.cockpit-kettle-preset').forEach(function(b) { b.classList.remove('active'); });
      presetBtn.classList.add('active');
      return;
    }

    // PID Presets
    var pidPresetBtn = e.target.closest('[data-pid-preset]');
    if (pidPresetBtn) {
      e.stopPropagation();
      var preset = pidPresetBtn.getAttribute('data-pid-preset');
      var vals = { conservative: {P:60,I:0.1,D:60,maxOut:80,boilThr:98,boilOut:70},
                   balanced:     {P:120,I:0.3,D:45,maxOut:100,boilThr:98,boilOut:85},
                   aggressive:   {P:200,I:0.5,D:30,maxOut:100,boilThr:98,boilOut:100} };
      var v = vals[preset];
      if (v) {
        var pEl=document.getElementById('pid-p'), iEl=document.getElementById('pid-i'),
            dEl=document.getElementById('pid-d'), moEl=document.getElementById('pid-maxout'),
            btEl=document.getElementById('pid-boiltemp'), boEl=document.getElementById('pid-boilout');
        if(pEl) pEl.value=v.P; if(iEl) iEl.value=v.I; if(dEl) dEl.value=v.D;
        if(moEl) moEl.value=v.maxOut; if(btEl) btEl.value=v.boilThr; if(boEl) boEl.value=v.boilOut;
      }
      document.querySelectorAll('[data-pid-preset]').forEach(function(b){b.classList.remove('active');});
      pidPresetBtn.classList.add('active');
      return;
    }

    // Kessel-Settings: Speichern
    var saveBtn = e.target.closest('[data-kettle-save]');
    if (saveBtn) {
      e.stopPropagation();
      _cockpitRenderLock = Date.now() + 3000;
      var kettleId = saveBtn.getAttribute('data-kettle-save');
      saveBtn.style.opacity = '0.5';
      saveBtn.textContent = '⏳ ...';
      // Alle Kettles holen (GET /kettle/{id} existiert nicht), dann passendes finden
      fetch('/kettle/')
        .then(function(r) { return r.json(); })
        .then(function(resp) {
          var kettles = resp.data || resp || [];
          var kettle = null;
          for (var i = 0; i < kettles.length; i++) {
            if (kettles[i].id === kettleId) { kettle = kettles[i]; break; }
          }
          if (!kettle) throw new Error('Kettle not found: ' + kettleId);
          // Type-aware: PIDBoil oder Hysteresis Props setzen
          if (kettle.type === 'PIDBoil') {
            var pEl=document.getElementById('pid-p'), iEl=document.getElementById('pid-i'),
                dEl=document.getElementById('pid-d'), sEl=document.getElementById('pid-sample'),
                moEl=document.getElementById('pid-maxout'), btEl=document.getElementById('pid-boiltemp'),
                boEl=document.getElementById('pid-boilout');
            kettle.props.P = pEl ? parseFloat(pEl.value) : 120;
            kettle.props.I = iEl ? parseFloat(iEl.value) : 0.3;
            kettle.props.D = dEl ? parseFloat(dEl.value) : 45;
            kettle.props.SampleTime = sEl ? parseInt(sEl.value) : 5;
            kettle.props.Max_Output = moEl ? parseInt(moEl.value) : 100;
            kettle.props.Boil_Threshold = btEl ? parseFloat(btEl.value) : 98;
            kettle.props.Max_Boil_Output = boEl ? parseInt(boEl.value) : 85;
          } else {
            var offSlider = document.querySelector('[data-kettle-slider="off"]');
            var onSlider = document.querySelector('[data-kettle-slider="on"]');
            kettle.props.OffsetOff = offSlider ? parseFloat(offSlider.value) : 0;
            kettle.props.OffsetOn = onSlider ? parseFloat(onSlider.value) : 0;
          }
          return fetch('/kettle/' + kettleId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(kettle)
          });
        })
        .then(function(r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          var status = document.getElementById('kettle-save-status');
          if (status) { status.textContent = '✅ ' + (currentLang === 'de' ? 'Gespeichert!' : 'Saved!'); }
          saveBtn.style.opacity = '1';
          saveBtn.textContent = '💾 ' + (currentLang === 'de' ? 'Einstellungen speichern' : 'Save Settings');
          _cockpitRenderLock = 0;
          setTimeout(function() { renderCockpit(true); }, 1000);
        })
        .catch(function(err) {
          console.error('[CBPI] Kettle save failed:', err);
          var status = document.getElementById('kettle-save-status');
          if (status) { status.textContent = '❌ Fehler!'; }
          saveBtn.style.opacity = '1';
          saveBtn.textContent = '💾 ' + (currentLang === 'de' ? 'Einstellungen speichern' : 'Save Settings');
          _cockpitRenderLock = 0;
        });
      return;
    }

    // Aktor-Schalter (Rührwerk, Heizung etc.)
    var actorBtn = e.target.closest('.cockpit-actor-toggle[data-actor-id]');
    if (actorBtn) {
      e.preventDefault();
      e.stopPropagation();
      var actorId = actorBtn.getAttribute('data-actor-id');
      // Debounce: Wenn dieser Actor noch beschäftigt ist, ignorieren
      if (_actorBusy[actorId]) return;
      _actorBusy[actorId] = true;
      var isOn = actorBtn.getAttribute('data-actor-state') === '1';
      // Optimistisches UI-Update: sofort visuell umschalten
      if (isOn) {
        actorBtn.classList.remove('on');
        actorBtn.classList.add('off');
        actorBtn.setAttribute('data-actor-state', '0');
        actorBtn.innerHTML = '<span class="cockpit-actor-led off"></span> AUS';
      } else {
        actorBtn.classList.remove('off');
        actorBtn.classList.add('on');
        actorBtn.setAttribute('data-actor-state', '1');
        actorBtn.innerHTML = '<span class="cockpit-actor-led on"></span> EIN';
      }
      fetch('/actor/' + actorId + '/' + (isOn ? 'off' : 'on'), { method: 'POST' })
        .then(function () {
          // Kein sofortiges renderCockpit — nächster 3s-Zyklus holt neuen State
          setTimeout(function () { _actorBusy[actorId] = false; }, 800);
        })
        .catch(function (err) {
          console.error('[CBPI Cockpit] Actor toggle failed:', err);
          _actorBusy[actorId] = false;
          // Revert visuell
          if (isOn) {
            actorBtn.classList.remove('off');
            actorBtn.classList.add('on');
            actorBtn.setAttribute('data-actor-state', '1');
            actorBtn.innerHTML = '<span class="cockpit-actor-led on"></span> EIN';
          } else {
            actorBtn.classList.remove('on');
            actorBtn.classList.add('off');
            actorBtn.setAttribute('data-actor-state', '0');
            actorBtn.innerHTML = '<span class="cockpit-actor-led off"></span> AUS';
          }
        });
      return;
    }
  }

  // Input-Event-Delegation (Slider live update)
  function cockpitInputHandler(e) {
    var slider = e.target.closest('[data-kettle-slider]');
    if (slider) {
      _cockpitRenderLock = Date.now() + 10000;
      var which = slider.getAttribute('data-kettle-slider');
      var val = parseFloat(slider.value);
      if (which === 'off') {
        var label = document.getElementById('kettle-off-val');
        if (label) label.textContent = val.toFixed(1);
      } else if (which === 'on') {
        var label = document.getElementById('kettle-on-val');
        if (label) label.textContent = val.toFixed(1);
      }
    }
  }

  // Change-Event-Delegation (Geräte-Select)
  function cockpitChangeHandler(e) {
    var select = e.target.closest('#kettle-preset-select');
    if (select) {
      _cockpitRenderLock = Date.now() + 10000;
      var idx = parseInt(select.value);
      if (isNaN(idx) || !KETTLE_PRESETS[idx]) return;
      var preset = KETTLE_PRESETS[idx];
      var diamEl = document.getElementById('kettle-diameter');
      var heightEl = document.getElementById('kettle-height');
      var wattEl = document.getElementById('kettle-watt');
      var fillEl = document.getElementById('kettle-fill');
      var hintEl = document.getElementById('kettle-fill-hint');
      if (preset.d > 0 && diamEl) diamEl.value = preset.d;
      if (preset.h > 0 && heightEl) heightEl.value = preset.h;
      if (preset.watt > 0 && wattEl) wattEl.value = preset.watt;
      if (preset.maxVol > 0) {
        if (hintEl) {
          hintEl.style.display = 'block';
          hintEl.innerHTML = (currentLang === 'de'
            ? 'ℹ️ <b>' + preset.name + '</b>: Max. ' + preset.maxVol + 'L, Ø ' + preset.d + 'cm, Höhe ' + preset.h + 'cm, ' + preset.watt + 'W. <br>Trage deine <b>tatsächliche Füllmenge</b> ein und klicke "Berechnen".'
            : 'ℹ️ <b>' + preset.name + '</b>: Max ' + preset.maxVol + 'L, Ø ' + preset.d + 'cm, Height ' + preset.h + 'cm, ' + preset.watt + 'W. <br>Enter your <b>actual fill volume</b> and click "Calculate".');
        }
      } else {
        // "Kochtopf / Sonstig"
        if (diamEl) diamEl.value = '';
        if (heightEl) heightEl.value = '';
        if (wattEl) wattEl.value = '';
        if (hintEl) hintEl.style.display = 'none';
      }
    }
  }

  // Kontext-Hinweis: Wann sollte welcher Aktor an/aus sein?
  function getActorHint(actor, activeStep, de) {
    if (!activeStep) return null;
    var name = (actor.name || '').toLowerCase();
    var stepType = (activeStep.type || '').toLowerCase();
    var stepName = (activeStep.name || '').toLowerCase();

    var isAgitator = name.indexOf('rühr') !== -1 || name.indexOf('agitat') !== -1 || name.indexOf('stir') !== -1 || name.indexOf('pump') !== -1;

    if (isAgitator) {
      // Läutern: Rührwerk aus
      if (stepType.indexOf('wait') !== -1 && (stepName.indexOf('läut') !== -1 || stepName.indexOf('lauter') !== -1)) {
        return de ? '💡 Beim Läutern AUS lassen' : '💡 Keep OFF during lautering';
      }
      // Kochen: nicht nötig
      if (stepType.indexOf('boil') !== -1) {
        return de ? '💡 Beim Kochen nicht nötig' : '💡 Not needed during boil';
      }
      // Maischen: Rührwerk sollte an
      if (stepType.indexOf('mash') !== -1) {
        return de ? '💡 Zum Maischen einschalten' : '💡 Turn on for mashing';
      }
    }
    return null;
  }

  // ============================================================
  // REZEPT IMPORT / EXPORT (auf der Rezeptbuch-Seite)
  // ============================================================
  function addRecipeTools() {
    var hash = window.location.hash.replace('#', '');
    // Auf anderen Seiten: Recipe-Tools entfernen falls noch vorhanden
    if (hash !== '/recipes') {
      var stale = document.getElementById('cbpi-recipe-tools');
      if (stale) stale.parentNode.removeChild(stale);
      return;
    }
    if (document.getElementById('cbpi-recipe-tools')) return;

    var target = findContentTarget();
    if (!target) return;

    var de = currentLang === 'de';
    var toolbar = document.createElement('div');
    toolbar.id = 'cbpi-recipe-tools';
    toolbar.className = 'cbpi-recipe-tools';

    toolbar.innerHTML =
      '<button class="cbpi-recipe-btn export-all" id="cbpi-export-all">' +
      '📤 ' + (de ? 'Alle Rezepte exportieren' : 'Export All Recipes') + '</button>' +
      '<button class="cbpi-recipe-btn import" id="cbpi-import-recipe">' +
      '📥 ' + (de ? 'Rezept importieren' : 'Import Recipe') + '</button>' +
      '<input type="file" id="cbpi-recipe-file" accept=".json,.xml,.beerxml" style="display:none">';

    // Vor dem Content einfügen (nach Help-Banner falls vorhanden)
    var helpBanner = document.getElementById('cbpi-help-banner');
    var pageTitle = document.getElementById('cbpi-page-title');
    var refNode = helpBanner || pageTitle;
    if (refNode && refNode.nextSibling) {
      target.insertBefore(toolbar, refNode.nextSibling);
    } else {
      target.insertBefore(toolbar, target.firstChild);
    }

    _isOurDomChange = true;

    // Export All
    document.getElementById('cbpi-export-all').onclick = function () {
      fetch('/recipe/')
        .then(function (r) { return r.json(); })
        .then(function (recipes) {
          if (!recipes || recipes.length === 0) {
            alert(de ? 'Keine Rezepte vorhanden.' : 'No recipes found.');
            return;
          }
          // Alle Rezept-Details laden
          var promises = recipes.map(function (r) {
            return fetch('/recipe/' + r.file)
              .then(function (resp) { return resp.json(); })
              .then(function (detail) {
                return { id: r.file, name: r.name, author: r.author, desc: r.desc, detail: detail };
              });
          });
          return Promise.all(promises);
        })
        .then(function (fullRecipes) {
          if (!fullRecipes) return;
          var exportData = {
            app: 'CraftBeerPi4',
            version: '1.0',
            exported: new Date().toISOString(),
            recipes: fullRecipes
          };
          var blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = 'cbpi4_rezepte_' + new Date().toISOString().slice(0, 10) + '.json';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        })
        .catch(function (err) { console.error('[CBPI] Export error:', err); alert((de ? 'Export fehlgeschlagen: ' : 'Export failed: ') + err.message); });
    };

    // Import
    document.getElementById('cbpi-import-recipe').onclick = function () {
      document.getElementById('cbpi-recipe-file').click();
    };
    document.getElementById('cbpi-recipe-file').onchange = function (e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (ev) {
        try {
          var data = JSON.parse(ev.target.result);
          var recipes = [];

          // Format erkennen
          if (data.recipes && Array.isArray(data.recipes)) {
            // Unser eigenes Export-Format
            recipes = data.recipes;
          } else if (data.basic && data.steps) {
            // Einzelnes Rezept (CBPi4-Format)
            recipes = [{ name: data.basic.name || 'Import', detail: data }];
          } else {
            alert(de ? 'Unbekanntes Dateiformat. Nutze CBPi4 JSON-Exporte.' : 'Unknown file format. Use CBPi4 JSON exports.');
            return;
          }

          var imported = 0;
          var total = recipes.length;

          recipes.forEach(function (r) {
            var detail = r.detail || r;
            var recipeName = (detail.basic && detail.basic.name) || r.name || 'Import';
            var body = {
              name: recipeName,
              author: (detail.basic && detail.basic.author) || r.author || '',
              desc: (detail.basic && detail.basic.desc) || r.desc || '',
              steps: detail.steps || []
            };

            // Neues Rezept erstellen via API
            fetch('/recipe/', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body)
            })
              .then(function () {
                imported++;
                if (imported === total) {
                  alert((de ? 'Erfolgreich importiert: ' : 'Successfully imported: ') + imported + (de ? ' Rezept(e)' : ' recipe(s)'));
                  // Seite neu laden um Rezepte anzuzeigen
                  window.location.hash = '#/';
                  setTimeout(function () { window.location.hash = '#/recipes'; }, 100);
                }
              })
              .catch(function (err) { console.error('[CBPI] Import error:', err); });
          });
        } catch (err) {
          alert((de ? 'Fehler beim Lesen der Datei: ' : 'Error reading file: ') + err.message);
        }
      };
      reader.readAsText(file);
      // Input zurücksetzen
      e.target.value = '';
    };

    _isOurDomChange = false;
  }

  // ============================================================
  // INIT
  // ============================================================
  var lastHash = '';

  // Styles die NACH MUI's JSS injection geladen werden muessen
  function injectLateStyles() {
    if (document.getElementById('cbpi-late-styles')) return;
    var style = document.createElement('style');
    style.id = 'cbpi-late-styles';
    style.textContent = [
      '/* ButtonGroup HINZUFUEGEN Fix */',
      '.MuiButtonGroup-root { width: auto !important; flex-shrink: 0 !important; }',
      '.MuiButtonGroup-root .MuiButton-label { white-space: nowrap !important; overflow: visible !important; }',
      '.MuiButtonGroup-root .MuiButton-root { white-space: nowrap !important; overflow: visible !important; min-width: auto !important; }',
      '/* FAB extended Fix */',
      '.MuiFab-extended, .MuiFab-root.MuiFab-extended { padding: 0 24px !important; width: auto !important; max-width: none !important; white-space: nowrap !important; }',
      '.MuiFab-extended .MuiFab-label { white-space: nowrap !important; overflow: visible !important; width: auto !important; }',
      '/* Global font override fuer Advent Pro */',
      '.MuiButton-root, .MuiButton-label, .MuiButtonGroup-root .MuiButton-root {',
      '  font-family: "Inter", sans-serif !important;',
      '}',
    ].join('\n');
    document.head.appendChild(style);
  }

  // Cockpit-Modus: true = Cockpit anzeigen, false = Anlagenbild (Dashboard-Editor)
  var _cockpitMode = true;

  function init() {
    // Auto-Redirect: Dashboard als Startseite (Cockpit-Modus aktiv)
    var hash = window.location.hash.replace('#', '');
    if (!hash || hash === '/' || hash === '') {
      _cockpitMode = true;
      window.location.hash = '#/dashboard';
    }
    injectLateStyles();
    translatePage();
    createLanguageToggle();
    createHelpButton();
    createThemeToggle();
    createExpertToggle();
    applyExpertMode();
    createStatusBar();
    buildCockpit();
    addRecipeTools();
    checkOnboarding();
  }

  function onRouteChange() {
    var h = window.location.hash;
    if (h !== lastHash) {
      lastHash = h;
      // Cockpit stoppen wenn weg von /dashboard oder Cockpit-Modus aus
      var path = h.replace('#', '');
      if (path !== '/dashboard') {
        _cockpitMode = false;
        stopCockpit();
      }
      setTimeout(function () {
        translatePage();
        buildCockpit();
        addRecipeTools();
      }, 300);
    }
  }

  var debounce = null;
  var observer = new MutationObserver(function (mutations) {
    if (_isOurDomChange) return;
    var dominated = false;
    for (var i = 0; i < mutations.length; i++) {
      var m = mutations[i];
      // Eigene Elemente ignorieren
      if (m.target && m.target.id && /^cbpi-/.test(m.target.id)) continue;
      if (m.addedNodes.length > 0) { dominated = true; break; }
    }
    if (!dominated) return;
    clearTimeout(debounce);
    debounce = setTimeout(function () {
      translatePage();
      createLanguageToggle();
      createHelpButton();
      createThemeToggle();
      createExpertToggle();
      applyExpertMode();
      buildCockpit();
      addRecipeTools();
    }, 250);
  });

  window.addEventListener('hashchange', onRouteChange);
  setInterval(onRouteChange, 1000);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 800); observer.observe(document.body, { childList: true, subtree: true }); });
  } else {
    setTimeout(init, 800);
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
