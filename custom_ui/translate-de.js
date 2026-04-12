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
      // Eigene Overlays/Formulare überspringen
      if (node.id === 'cbpi-fermenter-page' || node.id === 'cbpi-fermenter-overlay' || node.id === 'cbpi-fermenter-hardware' || node.id === 'cbpi-fermenter-config-form' || node.id === 'cbpi-help-page') return;
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
    document.title = 'CraftBeerPi 4.1 – ' + (currentLang === 'de' ? 'Brausteuerung' : 'Brew Controller');
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
    '/':             { de: function() { return _cockpitMode ? 'Brau-Cockpit' : 'Anlagenbild'; }, en: function() { return _cockpitMode ? 'Brew Cockpit' : 'Dashboard'; } },
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
    '/recipe':       { de: 'Rezept bearbeiten',       en: 'Edit Recipe' },
    '/help':         { de: 'Hilfe & Dokumentation',   en: 'Help & Documentation' }
  };

  // ============================================================
  // SEITEN-HILFETEXT (kontextuell pro Route)
  // ============================================================
  var pageHelp = {
    '/': {
      de: function() { return _cockpitMode
        ? '<b>Dein Brau-Cockpit</b> – Hier siehst du Temperatur, aktuelle Schritte und Aktoren auf einen Blick. Wenn ein Rezept geladen ist, kannst du hier direkt starten, stoppen und den Fortschritt verfolgen.'
        : '<b>Anlagenbild</b> – Hier kannst du deine Brauanlage visuell gestalten. Ziehe Sensoren, Aktoren, Kessel und Verbindungen auf die Arbeitsfläche.<br><br><b>Tipp:</b> Kostenlose SVG-Grafiken (Kessel, Rohre, Ventile, Flaschen) gibt es auf <a href="https://github.com/craftbeerpi/craftbeerpi-ui-widgets" target="_blank" style="color:#f0a030;">GitHub</a>. ZIP herunterladen → Inhalt nach <code>~/config/widgets</code> kopieren.'; },
      en: function() { return _cockpitMode
        ? '<b>Your Brew Cockpit</b> – See temperature, current steps and actors at a glance. When a recipe is loaded, you can start, stop and track progress right here.'
        : '<b>Dashboard</b> – Design your brewery layout visually. Drag sensors, actors, kettles and connections onto the canvas.<br><br><b>Tip:</b> Free SVG graphics (kettles, pipes, valves, bottles) available at <a href="https://github.com/craftbeerpi/craftbeerpi-ui-widgets" target="_blank" style="color:#f0a030;">GitHub</a>. Download ZIP → copy contents to <code>~/config/widgets</code>.'; }
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
      de: '<b>CraftBeerPi4 – German UI Edition</b> v' + (window.__cbpi_version || '4.1.0') + ' „Braumeister"<br><br>' +
        'Fork von <a href="https://github.com/Hansi137/craftbeerpi4-german-ui" target="_blank" style="color:#f0a030;">Hansi137</a> – Deutsche Oberfläche, Themes, Onboarding-Assistent, UX-Verbesserungen & Bugfixes.<br><br>' +
        'Basiert auf <b>CraftBeerPi</b> – Open-Source Brausteuerung, gegründet 2015 von <b>Manuel Fritsch</b>.<br>' +
        'Verwendet von über 7.000 Hobbybrauern weltweit.<br><br>' +
        'Lizenz: <b>GPL v3</b> – Quellcode frei verfügbar.',
      en: '<b>CraftBeerPi4 – German UI Edition</b> v' + (window.__cbpi_version || '4.1.0') + ' "Braumeister"<br><br>' +
        'Fork by <a href="https://github.com/Hansi137/craftbeerpi4-german-ui" target="_blank" style="color:#f0a030;">Hansi137</a> – German UI, themes, onboarding wizard, UX improvements & bugfixes.<br><br>' +
        'Based on <b>CraftBeerPi</b> – Open source brew controller, founded in 2015 by <b>Manuel Fritsch</b>.<br>' +
        'Used by over 7,000 home brewers worldwide.<br><br>' +
        'License: <b>GPL v3</b> – Source code freely available.'
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

  // ============================================================
  // TOAST-NOTIFICATION SYSTEM
  // ============================================================
  var _toastContainer = null;
  var _toastId = 0;

  function showToast(message, type, duration) {
    // type: 'success' | 'error' | 'warning' | 'info'
    type = type || 'info';
    duration = duration || 3500;
    if (!_toastContainer) {
      _toastContainer = document.createElement('div');
      _toastContainer.id = 'cbpi-toast-container';
      document.body.appendChild(_toastContainer);
    }
    var id = ++_toastId;
    var icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    var toast = document.createElement('div');
    toast.className = 'cbpi-toast cbpi-toast-' + type;
    toast.setAttribute('data-toast-id', id);
    toast.innerHTML = '<span class="cbpi-toast-icon">' + (icons[type] || '') + '</span>' +
      '<span class="cbpi-toast-msg">' + message + '</span>' +
      '<button class="cbpi-toast-close" data-toast-dismiss="' + id + '">✕</button>';
    _toastContainer.appendChild(toast);
    // Animate in
    requestAnimationFrame(function() { toast.classList.add('show'); });
    // Auto-dismiss
    var timer = setTimeout(function() { dismissToast(id); }, duration);
    toast.querySelector('[data-toast-dismiss]').addEventListener('click', function() {
      clearTimeout(timer);
      dismissToast(id);
    });
  }

  function dismissToast(id) {
    if (!_toastContainer) return;
    var el = _toastContainer.querySelector('[data-toast-id="' + id + '"]');
    if (!el) return;
    el.classList.remove('show');
    el.classList.add('hide');
    setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
  }

  // ============================================================
  // BESTÄTIGUNGS-DIALOG (ersetzt native confirm())
  // ============================================================
  function showConfirm(title, message, onConfirm, opts) {
    opts = opts || {};
    var de = currentLang === 'de';
    var confirmText = opts.confirmText || (de ? 'Ja, fortfahren' : 'Yes, continue');
    var cancelText = opts.cancelText || (de ? 'Abbrechen' : 'Cancel');
    var danger = opts.danger || false;

    var existing = document.getElementById('cbpi-confirm-overlay');
    if (existing) existing.remove();

    _isOurDomChange = true;
    var overlay = document.createElement('div');
    overlay.id = 'cbpi-confirm-overlay';
    overlay.innerHTML =
      '<div class="cbpi-confirm-backdrop"></div>' +
      '<div class="cbpi-confirm-card">' +
        '<div class="cbpi-confirm-icon">' + (danger ? '⚠️' : '❓') + '</div>' +
        '<h3 class="cbpi-confirm-title">' + title + '</h3>' +
        '<p class="cbpi-confirm-msg">' + message + '</p>' +
        '<div class="cbpi-confirm-buttons">' +
          '<button class="cbpi-confirm-btn secondary" id="cbpi-confirm-cancel">' + cancelText + '</button>' +
          '<button class="cbpi-confirm-btn ' + (danger ? 'danger' : 'primary') + '" id="cbpi-confirm-ok">' + confirmText + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    _isOurDomChange = false;

    document.getElementById('cbpi-confirm-cancel').addEventListener('click', function() { overlay.remove(); });
    document.getElementById('cbpi-confirm-ok').addEventListener('click', function() { overlay.remove(); onConfirm(); });
    overlay.querySelector('.cbpi-confirm-backdrop').addEventListener('click', function() { overlay.remove(); });
  }

  // ============================================================
  // HARDWARE-VALIDIERUNG
  // ============================================================
  function validateHardwareConfig() {
    var de = currentLang === 'de';
    return Promise.all([
      fetch('/kettle/').then(function(r) { return r.json(); }),
      fetch('/sensor/').then(function(r) { return r.json(); }),
      fetch('/actor/').then(function(r) { return r.json(); })
    ]).then(function(results) {
      var kettles = results[0].data || [];
      var sensors = results[1].data || [];
      var actors = results[2].data || [];
      var warnings = [];

      if (sensors.length === 0) {
        warnings.push({
          icon: '🌡️',
          text: de ? 'Kein Temperatursensor angelegt. Ohne Sensor kann nicht gebraut werden!'
                   : 'No temperature sensor configured. Cannot brew without a sensor!',
          severity: 'error'
        });
      }
      if (actors.length === 0) {
        warnings.push({
          icon: '🔌',
          text: de ? 'Kein Aktor (Heizung/Rührwerk) angelegt. Lege zuerst einen Aktor an.'
                   : 'No actor (heater/agitator) configured. Add an actor first.',
          severity: 'error'
        });
      }
      if (kettles.length === 0) {
        warnings.push({
          icon: '🫗',
          text: de ? 'Kein Kessel angelegt. Erstelle einen Kessel und verknüpfe Sensor + Heizung.'
                   : 'No kettle configured. Create a kettle and link sensor + heater.',
          severity: 'error'
        });
      }
      kettles.forEach(function(k) {
        if (!k.sensor) {
          warnings.push({
            icon: '⚠️',
            text: de ? 'Kessel "' + k.name + '" hat keinen Temperatursensor zugewiesen!'
                     : 'Kettle "' + k.name + '" has no temperature sensor assigned!',
            severity: 'warning'
          });
        }
        if (!k.heater) {
          warnings.push({
            icon: '⚠️',
            text: de ? 'Kessel "' + k.name + '" hat keine Heizung zugewiesen.'
                     : 'Kettle "' + k.name + '" has no heater assigned.',
            severity: 'warning'
          });
        }
      });

      return warnings;
    }).catch(function() { return []; });
  }

  function renderHardwareWarnings(container) {
    validateHardwareConfig().then(function(warnings) {
      var existing = document.getElementById('cbpi-hw-warnings');
      if (existing) existing.remove();
      if (warnings.length === 0) return;

      _isOurDomChange = true;
      var panel = document.createElement('div');
      panel.id = 'cbpi-hw-warnings';
      panel.className = 'cbpi-hw-warnings';
      var html = '';
      warnings.forEach(function(w) {
        html += '<div class="cbpi-hw-warning cbpi-hw-' + w.severity + '">' +
          '<span class="cbpi-hw-warning-icon">' + w.icon + '</span>' +
          '<span class="cbpi-hw-warning-text">' + w.text + '</span>' +
          '</div>';
      });
      panel.innerHTML = html;
      if (container && container.firstChild) {
        container.insertBefore(panel, container.firstChild);
      } else if (container) {
        container.appendChild(panel);
      }
      _isOurDomChange = false;
    });
  }

  // ============================================================
  // OFFLINE-INDIKATOR
  // ============================================================
  var _onlineCheckInterval = null;
  var _isOffline = false;

  function startOnlineCheck() {
    if (_onlineCheckInterval) return;
    _onlineCheckInterval = setInterval(checkOnlineStatus, 10000);
    checkOnlineStatus();
  }

  function checkOnlineStatus() {
    fetch('/system/', { method: 'GET', cache: 'no-store' })
      .then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        if (_isOffline) {
          _isOffline = false;
          updateOfflineBanner();
          showToast(currentLang === 'de' ? 'Verbindung wiederhergestellt' : 'Connection restored', 'success');
        }
      })
      .catch(function() {
        if (!_isOffline) {
          _isOffline = true;
          updateOfflineBanner();
        }
      });
  }

  function updateOfflineBanner() {
    var existing = document.getElementById('cbpi-offline-banner');
    if (_isOffline) {
      if (!existing) {
        _isOurDomChange = true;
        var banner = document.createElement('div');
        banner.id = 'cbpi-offline-banner';
        var de = currentLang === 'de';
        banner.innerHTML = '<span class="cbpi-offline-icon">📡</span> ' +
          (de ? 'Keine Verbindung zum Brau-Server – Daten könnten veraltet sein'
              : 'No connection to brew server – data may be outdated');
        document.body.appendChild(banner);
        _isOurDomChange = false;
      }
    } else {
      if (existing) existing.remove();
    }
  }

  // ============================================================
  // SETTINGS-BESCHREIBUNGEN
  // ============================================================
  var settingsDescriptions = {
    'BREWERY_NAME': {
      de: 'Der Name deiner Brauerei. Wird im UI und in Exporten angezeigt.',
      en: 'Your brewery name. Displayed in UI and exports.'
    },
    'AutoMode': {
      de: 'Wenn aktiviert, werden Brau-Schritte automatisch weitergeschaltet sobald Zieltemperatur/Zeit erreicht ist.',
      en: 'When enabled, brew steps advance automatically when target temp/time is reached.'
    },
    'BoilKettle': {
      de: 'Welcher Kessel für den Kochschritt verwendet wird. Nur relevant bei Multi-Kessel-Setups.',
      en: 'Which kettle is used for the boil step. Only relevant for multi-kettle setups.'
    },
    'MashTun': {
      de: 'Der Hauptkessel (Maischebottich) für Maisch-Schritte.',
      en: 'The main mash tun kettle for mash steps.'
    },
    'CSVLOGFILES': {
      de: 'Temperatur- und Sensordaten als CSV-Dateien aufzeichnen. Dateien findest du unter System → Logs.',
      en: 'Record temperature and sensor data as CSV files. Find files under System → Logs.'
    },
    'TEMP_UNIT': {
      de: 'Temperatureinheit: Celsius (°C) oder Fahrenheit (°F).',
      en: 'Temperature unit: Celsius (°C) or Fahrenheit (°F).'
    },
    'BoilTemp': {
      de: 'Kochtemperatur in deiner Einheit (Standard: 99°C). Wird für den Kochschritt verwendet.',
      en: 'Boil temperature in your unit (default: 99°C). Used for the boil step.'
    },
    'max_dashboard_number': {
      de: 'Maximale Anzahl Dashboard-Seiten. Standard ist 4.',
      en: 'Maximum number of dashboard pages. Default is 4.'
    },
    'current_dashboard_number': {
      de: 'Aktuell angezeigte Dashboard-Seite (1 bis max).',
      en: 'Currently displayed dashboard page (1 to max).'
    },
    'steps_cooldown_sensor': {
      de: 'Welcher Sensor die Temperatur beim Abkühlschritt misst (kann ein anderer Sensor sein als im Kessel).',
      en: 'Which sensor measures temperature during cooldown (can differ from kettle sensor).'
    },
    'steps_cooldown_actor': {
      de: 'Aktor der beim Abkühlschritt aktiv ist (z.B. Pumpe für Gegenstromkühler).',
      en: 'Actor active during cooldown (e.g. pump for counterflow chiller).'
    },
    'steps_cooldown_temp': {
      de: 'Zieltemperatur beim Abkühlen (Anstelltemperatur). Standard: 20°C.',
      en: 'Target cooldown temperature (pitching temp). Default: 20°C.'
    },
    'AddMashInStep': {
      de: 'Automatisch einen Einmaisch-Schritt am Anfang jedes Rezepts einfügen. Empfohlen: Ja.',
      en: 'Auto-add a MashIn step at the beginning of each recipe. Recommended: Yes.'
    },
    'MQTT_UPDATE': {
      de: 'MQTT Updates für Sensor-Werte aktivieren. Nur nötig, wenn MQTT-Sensoren verwendet werden.',
      en: 'Enable MQTT updates for sensor values. Only needed for MQTT sensors.'
    },
    'MQTT_HOST': {
      de: 'Hostname/IP des MQTT Brokers (z.B. localhost oder 192.168.1.100).',
      en: 'Hostname/IP of MQTT broker (e.g. localhost or 192.168.1.100).'
    },
    'MQTT_PORT': {
      de: 'Port des MQTT Brokers. Standard: 1883.',
      en: 'Port of MQTT broker. Default: 1883.'
    },
    'MQTT_USERNAME': {
      de: 'Benutzername für MQTT-Authentifizierung (leer lassen wenn nicht nötig).',
      en: 'Username for MQTT authentication (leave empty if not needed).'
    },
    'MQTT_PASSWORD': {
      de: 'Passwort für MQTT-Authentifizierung.',
      en: 'Password for MQTT authentication.'
    }
  };

  function enhanceSettingsPage() {
    var hash = window.location.hash.replace('#', '');
    if (hash !== '/settings') return;
    if (document.getElementById('cbpi-settings-enhanced')) return;

    var de = currentLang === 'de';
    // Finde alle Settings-Rows
    var inputs = document.querySelectorAll('.MuiTableCell-root');
    if (!inputs.length) return;

    _isOurDomChange = true;
    // Markiere als enhanced
    var marker = document.createElement('span');
    marker.id = 'cbpi-settings-enhanced';
    marker.style.display = 'none';
    document.body.appendChild(marker);

    // Durchlaufe alle Tabellenzeilen und suche nach bekannten Setting-Namen
    var rows = document.querySelectorAll('.MuiTableRow-root');
    rows.forEach(function(row) {
      var cells = row.querySelectorAll('.MuiTableCell-root');
      if (cells.length < 2) return;
      var label = (cells[0].textContent || '').trim();
      var desc = settingsDescriptions[label];
      if (!desc) return;
      // Prüfe ob schon ein Hinweis existiert
      if (cells[0].querySelector('.cbpi-setting-hint')) return;
      var hint = document.createElement('div');
      hint.className = 'cbpi-setting-hint';
      hint.textContent = de ? desc.de : desc.en;
      cells[0].appendChild(hint);
    });
    _isOurDomChange = false;
  }

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
    // Bei / immer neu rendern (Modus kann gewechselt haben)
    if (existing && existing.getAttribute('data-path') === path && path !== '/') {
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
      // Expert-Toggle + Theme-Toggle + Home-Button + Settings-Button entfernen
      var expBtn = document.getElementById('cbpi-expert-toggle');
      if (expBtn) expBtn.remove();
      var thBtn = document.getElementById('cbpi-theme-toggle');
      if (thBtn) thBtn.remove();
      var homeBtn = document.getElementById('cbpi-home-btn');
      if (homeBtn) homeBtn.remove();
      var settingsBtn = document.getElementById('cbpi-settings-btn');
      if (settingsBtn) settingsBtn.remove();
      var settingsPanel = document.getElementById('cbpi-settings-panel');
      if (settingsPanel) settingsPanel.remove();
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
        { icon: '', title: 'Fertig! Viel Spass!', text: 'Deine Brauanlage ist bereit!<br><br><b>Tipps:</b><br>• Im <b>Dashboard</b> kannst du Widgets anordnen<br>• Unter <b>Einstellungen</b> kannst du CSV-Logging aktivieren<br>• Unter <b>System</b> findest du Logs und Neustart<br>• Klicke <b>?</b> oben rechts um diese Hilfe erneut anzuzeigen<br><br><b>Dashboard-Grafiken:</b> Auf <a href="https://github.com/craftbeerpi/craftbeerpi-ui-widgets" target="_blank" style="color:#f0a030;">github.com/craftbeerpi/craftbeerpi-ui-widgets</a> findest du eine umfangreiche SVG-Sammlung (Kessel, Rohre, Ventile, Flaschen u.v.m.) von kalausr. ZIP herunterladen und den Inhalt nach <code>~/config/widgets</code> kopieren.<br><br>Prost!' }
      ],
      en: [
        { icon: '', title: 'Welcome to CraftBeerPi!', text: 'This quick guide shows you how to set up your brewery and brew your first beer in 4 steps.' },
        { icon: '', title: 'Step 1: Set up Hardware', text: 'Open <b>Hardware</b> in the sidebar:<br><br>1. <b>Add Sensor</b> – Select "OneWire" type. Your DS18B20 will be auto-detected.<br><br>2. <b>Add Actors</b> – Select "GPIOActor". Create one for <b>Heater</b> (GPIO 17) and one for <b>Agitator</b> (GPIO 27). Set <b>Inverted = Yes</b>!<br><br>3. <b>Add Kettle</b> – Link sensor with heater and agitator.' },
        { icon: '', title: 'Step 2: Create a Recipe', text: 'Open the <b>Recipe Book</b>:<br><br>• Create a new recipe (+ button)<br>• Enter name and author<br>• Add brew steps:<br>&nbsp;&nbsp;– <b>MashIn</b> (e.g. 52°C)<br>&nbsp;&nbsp;– <b>MashStep</b> (e.g. 63°C for 45 min)<br>&nbsp;&nbsp;– <b>BoilStep</b> (e.g. 100°C for 60 min)<br>&nbsp;&nbsp;– <b>CooldownStep</b> (e.g. 20°C)' },
        { icon: '', title: 'Step 3: Start Brewing!', text: 'Load your recipe into the <b>Mash Profile</b> and press <b>Start</b>!<br><br>CraftBeerPi automatically controls:<br>• Heating to target temperature<br>• Holding rest temperatures<br>• Agitator control<br>• Notifications at each step<br><br>Watch everything live on the <b>Dashboard</b>.' },
        { icon: '', title: 'All set! Enjoy!', text: 'Your brewery is ready!<br><br><b>Tips:</b><br>• Arrange widgets on the <b>Dashboard</b><br>• Enable CSV logging in <b>Settings</b><br>• Find logs & restart in <b>System</b><br>• Click <b>?</b> in the top bar to show this guide again<br><br><b>Dashboard Graphics:</b> Find a comprehensive SVG collection (kettles, pipes, valves, bottles and more) by kalausr at <a href="https://github.com/craftbeerpi/craftbeerpi-ui-widgets" target="_blank" style="color:#f0a030;">github.com/craftbeerpi/craftbeerpi-ui-widgets</a>. Download the ZIP and copy contents to <code>~/config/widgets</code>.<br><br>Cheers!' }
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

    // Home-Button (vor dem Theme-Toggle)
    if (!document.getElementById('cbpi-home-btn')) {
      var homeBtn = document.createElement('button');
      homeBtn.id = 'cbpi-home-btn';
      homeBtn.className = 'cbpi-toolbar-btn round';
      homeBtn.innerHTML = '⌂';
      homeBtn.title = currentLang === 'de' ? 'Zur Startseite' : 'Go to home';
      homeBtn.onclick = function () {
        var pref = localStorage.getItem('cbpi_start_page') || 'cockpit';
        if (pref === 'dashboard') {
          _cockpitMode = false;
          stopCockpit();
        } else {
          _cockpitMode = true;
          _cockpitRenderLock = 0;
        }
        // Altes Cockpit/Titel aufräumen
        _isOurDomChange = true;
        var oldCock = document.getElementById('cbpi-cockpit');
        if (oldCock) oldCock.remove();
        var oldTitle = document.getElementById('cbpi-page-title');
        if (oldTitle) oldTitle.remove();
        var oldBanner = document.getElementById('cbpi-help-banner');
        if (oldBanner) oldBanner.remove();
        _isOurDomChange = false;
        // Immer zu #/ navigieren (dort liegt beides)
        if (window.location.hash === '#/') {
          // Schon auf #/ → manuell rendern
          addPageTitle();
          addPageHeaders();
          buildCockpit();
        } else {
          window.location.hash = '#/';
        }
      };
      var helpBtn = document.getElementById('cbpi-help-btn');
      if (helpBtn) {
        toolbar.insertBefore(homeBtn, helpBtn);
      } else {
        toolbar.insertBefore(homeBtn, toolbar.lastChild);
      }
    }

    // Settings-Button (Zahnrad) — öffnet Einstellungs-Panel
    if (!document.getElementById('cbpi-settings-btn')) {
      var settingsBtn = document.createElement('button');
      settingsBtn.id = 'cbpi-settings-btn';
      settingsBtn.className = 'cbpi-toolbar-btn round';
      settingsBtn.innerHTML = '⚙';
      settingsBtn.title = currentLang === 'de' ? 'Einstellungen' : 'Settings';
      settingsBtn.onclick = function (ev) {
        ev.stopPropagation();
        toggleSettingsPanel();
      };
      var helpBtn2 = document.getElementById('cbpi-help-btn');
      if (helpBtn2) {
        toolbar.insertBefore(settingsBtn, helpBtn2);
      } else {
        toolbar.insertBefore(settingsBtn, toolbar.lastChild);
      }
    }

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
  var beginnerRoutes = ['cockpit', 'dashboard', 'mashprofile', 'recipes', 'brewlog', 'water', 'hardware', 'settings', 'system'];
  // Zusätzliche Routen im Experten-Modus
  var expertRoutes = ['actor', 'sensor', 'kettle', 'fermenter', 'analytics', 'plugins', 'about'];

  var navGroups = {
    de: [
      { label: 'Brauen', routes: ['cockpit', 'dashboard', 'mashprofile', 'recipes', 'brewlog', 'water'] },
      { label: 'Einrichtung', routes: ['hardware', 'settings'] },
      { label: 'Extras', routes: ['analytics', 'fermenter', 'plugins'] },
      { label: 'System', routes: ['system', 'about'] }
    ],
    en: [
      { label: 'Brewing', routes: ['cockpit', 'dashboard', 'mashprofile', 'recipes', 'brewlog', 'water'] },
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
      if (window.location.hash !== '#/') {
        // Von anderer Seite: navigieren → hashchange → buildCockpit
        window.location.hash = '#/';
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

    // Brauwasser-Rechner Menüpunkt (nach Rezeptbuch)
    injectWaterNavItem(drawer);

    // Brau-Logbuch Menüpunkt
    injectBrewLogNavItem(drawer);

    // Gärungs-Dashboard Menüpunkt
    injectFermenterNavItem(drawer);

    // Hilfe-Seite Menüpunkt
    injectHelpNavItem(drawer);

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
          'brau-logbuch': 'brewlog', 'brew log': 'brewlog',
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
          'about': 'about', 'über': 'about', 'über craftbeerpi': 'about',
          'brauwasser': 'water', 'water chemistry': 'water'
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
          if (window.location.hash === '#/') {
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

    // Zoom: nur den letzten Teil der Daten anzeigen
    var visibleData = _tempHistory;
    var visibleChanges = _tempStepChanges;
    if (_tempChartZoom > 1) {
      var startIdx = Math.max(0, _tempHistory.length - Math.floor(_tempHistory.length / _tempChartZoom));
      visibleData = _tempHistory.slice(startIdx);
      if (visibleData.length > 0) {
        var zoomStart = visibleData[0].t;
        visibleChanges = _tempStepChanges.filter(function(sc) { return sc.t >= zoomStart; });
      }
    }

    // Bereich berechnen
    var tMin = visibleData[0].t;
    var tMax = visibleData[visibleData.length - 1].t;
    var tRange = Math.max(tMax - tMin, 1000); // mind. 1s

    var temps = [];
    visibleData.forEach(function (p) {
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
    visibleChanges.forEach(function (sc) {
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
    visibleData.forEach(function (p) {
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
    visibleData.forEach(function (p) {
      if (p.actual !== null) {
        var x = tx(p.t), y = ty(p.actual);
        if (!started) { ctx.moveTo(x, y); started = true; } else { ctx.lineTo(x, y); }
      }
    });
    ctx.stroke();

    // Aktueller Punkt (Kreis am Ende)
    var last = visibleData[visibleData.length - 1];
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
    // Dashboard-Seite markieren (für CSS: bleibt immer dunkel)
    if (hash === '/' && !_cockpitMode) {
      document.body.setAttribute('data-cbpi-page', 'dashboard');
    } else {
      document.body.removeAttribute('data-cbpi-page');
    }
    // Dashboard-Ansicht (kein Cockpit): nichts weiter tun
    if (hash === '/' && !_cockpitMode) return;
    // Cockpit nur auf / UND wenn Cockpit-Modus aktiv
    if (hash !== '/' || !_cockpitMode) return;

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
    // Cockpit nur auf / im Cockpit-Modus
    if (hash !== '/' || !_cockpitMode) {
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
        // Rezeptliste im Idle-State laden
        if (!isBrewing && steps.length === 0) {
          loadCockpitRecipes();
        }
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
        // Hopfen-Timer aktualisieren
        updateHopTimers(activeStep);
        // Schritt-Wechsel-Benachrichtigung
        if (activeStep.id && cockpit._lastActiveStepId && cockpit._lastActiveStepId !== activeStep.id) {
          var de = currentLang === 'de';
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('🍺 ' + (de ? 'Neuer Schritt' : 'New Step'), {
              body: activeStep.name + (activeStep.props && activeStep.props.Temp ? ' (' + activeStep.props.Temp + '°C)' : ''),
              icon: '/static/cbpi_icon.svg'
            });
          }
        }
        cockpit._lastActiveStepId = activeStep.id;
        // Periodisch speichern (alle 30s)
        if (!cockpit._lastTempSave || Date.now() - cockpit._lastTempSave > 30000) {
          saveTempHistory();
          cockpit._lastTempSave = Date.now();
        }
        // Auto-Logbuch-Check
        checkAutoBrewLog(steps);
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

    // Geschätzte Gesamtbrauzeit berechnen
    var totalBrewMin = 0;
    var elapsedBrewMin = 0;
    steps.forEach(function(s, idx) {
      var sMin = (s.props && s.props.Timer) ? parseInt(s.props.Timer) || 0 : 0;
      totalBrewMin += sMin;
      if (idx < activeIdx) elapsedBrewMin += sMin;
      else if (idx === activeIdx && timerText) {
        var tp = timerText.split('/');
        if (tp.length === 2) elapsedBrewMin += Math.floor(parseTimerParts(tp[0].trim()) / 60);
      }
    });
    var remainBrewMin = totalBrewMin - elapsedBrewMin;
    var etaStr = '';
    if (totalBrewMin > 0) {
      var etaDate = new Date(Date.now() + remainBrewMin * 60000);
      etaStr = ' · ~' + (remainBrewMin > 60 ? Math.floor(remainBrewMin / 60) + 'h ' + (remainBrewMin % 60) + 'min' : remainBrewMin + ' min') +
               ' ' + (de ? 'verbleibend' : 'remaining') +
               ' (≈' + etaDate.getHours() + ':' + (etaDate.getMinutes() < 10 ? '0' : '') + etaDate.getMinutes() + ')';
    }

    var html = '';
    // Status-Banner
    html += '<div class="cockpit-status-banner">';
    html += '<div class="cockpit-status-dot brewing"></div>';
    html += '<div class="cockpit-status-text">';
    if (recipeName) html += '<span class="cockpit-recipe-name">📝 ' + recipeName + '</span> — ';
    html += (de ? 'Brauen aktiv' : 'Brewing active') + ' — <span>' + stepName + '</span> (' + (de ? 'Schritt' : 'Step') + ' ' + (activeIdx + 1) + '/' + steps.length + ')';
    if (etaStr) html += '<span class="cockpit-eta">' + etaStr + '</span>';
    html += '</div>';
    html += '</div>';

    // Multi-Kessel-Hinweis (direkt nach Banner)
    html += renderMultiKettleHint(kettles);

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
    html += '<button class="cockpit-ctrl-btn secondary" onclick="window.location.hash=\'#/recipes\'">📖 ' + (de ? 'Rezepte' : 'Recipes') + '</button>';
    html += '</div></div>';

    // Aktoren (interaktive Schalter) — 2-spaltig
    html += '<div class="cockpit-card cockpit-card-full">';
    html += '<div class="cockpit-card-title">' + (de ? 'Aktoren' : 'Actors') + '</div>';
    html += '<div class="cockpit-actors-grid">';
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
    html += '</div></div>';

    html += '</div>'; // /cockpit-grid

    // Temperaturverlauf-Chart
    html += '<div class="cockpit-card cockpit-card-full cockpit-chart-card">';
    html += '<div class="cockpit-card-title">📈 ' + (de ? 'Temperaturverlauf' : 'Temperature History') + renderChartControls() + '</div>';
    if (_tempHistory.length < 2) {
      html += '<div class="cockpit-chart-hint">' + (de ? 'Daten werden gesammelt…' : 'Collecting data…') + '</div>';
    }
    html += '<div class="cockpit-chart-wrap"><canvas id="cockpit-temp-chart"></canvas></div>';
    html += '</div>';

    // Hopfen-Timer (nur bei BoilStep)
    updateHopTimers(activeStep);
    html += renderHopTimerPanel();

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
      for (var sid in sensorMap) {
        var v = sensorMap[sid];
        if (v !== undefined && v !== null) { firstSensorVal = parseFloat(v); break; }
      }
    }

    // ── Schritte analysieren ──
    var mashSteps = [];
    var boilSteps = [];
    var otherSteps = [];
    var totalMinutes = 0;
    var hopAdditions = [];

    steps.forEach(function(s) {
      var type = (s.type || '').toLowerCase();
      var mins = (s.props && s.props.Timer) ? parseInt(s.props.Timer) || 0 : 0;
      totalMinutes += mins;
      var info = {
        name: s.name || '',
        temp: (s.props && s.props.Temp) ? parseFloat(s.props.Temp) : null,
        timer: mins,
        type: type
      };

      if (type.indexOf('mash') !== -1) {
        mashSteps.push(info);
      } else if (type.indexOf('boil') !== -1) {
        boilSteps.push(info);
        // Hopfengaben aus BoilStep-Props extrahieren
        if (s.props) {
          ['First_Wort', 'Hop_1', 'Hop_2', 'Hop_3', 'Hop_4', 'Hop_5', 'Hop_6'].forEach(function(key) {
            if (s.props[key] && s.props[key] !== '0' && s.props[key] !== '') {
              var label = key === 'First_Wort' ? (de ? 'Vorderw\u00fcrze' : 'First Wort') : s.props[key] + ' min';
              hopAdditions.push(label);
            }
          });
        }
      } else {
        otherSteps.push(info);
      }
    });

    var totalHours = Math.floor(totalMinutes / 60);
    var totalMins = totalMinutes % 60;
    var timeStr = totalHours > 0 ? totalHours + 'h ' + totalMins + 'min' : totalMins + ' min';
    var etaDate = new Date(Date.now() + totalMinutes * 60000);
    var etaStr = etaDate.getHours() + ':' + (etaDate.getMinutes() < 10 ? '0' : '') + etaDate.getMinutes();

    var html = '';
    html += '<div class="cockpit-status-banner">';
    html += '<div class="cockpit-status-dot idle"></div>';
    html += '<div class="cockpit-status-text">';
    if (recipeName) html += '<span class="cockpit-recipe-name">\ud83d\udcdd ' + recipeName + '</span> \u2014 ';
    html += (de ? 'Bereit zum Brauen' : 'Ready to brew') + ' \u2014 <span>' + steps.length + ' ' + (de ? 'Schritte' : 'steps') + ' \u00b7 \u2248' + timeStr + '</span>';
    html += '</div>';
    html += '<button class="cockpit-recipe-change-btn" id="cockpit-recipe-change">\ud83d\udd04 ' + (de ? 'Rezept wechseln' : 'Change Recipe') + '</button>';
    html += '</div>';

    // Rezept-Wechsler (initial eingeklappt)
    html += '<div class="cockpit-recipe-changer collapsed" id="cockpit-recipe-changer">';
    html += '<div class="cockpit-card-title">\ud83d\udcd6 ' + (de ? 'Anderes Rezept laden' : 'Load Different Recipe') + '</div>';
    html += '<div class="cockpit-recipe-list" id="cockpit-recipe-change-list">';
    html += '<div class="cockpit-recipe-loading">' + (de ? 'Rezepte werden geladen\u2026' : 'Loading recipes\u2026') + '</div>';
    html += '</div></div>';

    // Multi-Kessel-Hinweis
    html += renderMultiKettleHint(kettles);

    html += '<div class="cockpit-grid">';

    // Temperatur + Start
    html += '<div class="cockpit-card">';
    html += '<div class="cockpit-card-title">\ud83c\udf21\ufe0f ' + (de ? 'Temperatur' : 'Temperature') + '</div>';
    var readySensorId = (steps[0] && steps[0].props && steps[0].props.Sensor) ? steps[0].props.Sensor : '';
    html += '<div class="cockpit-temp-big" data-sensor-id="' + readySensorId + '">' + formatTemp(firstSensorVal) + '</div>';
    html += '<div class="cockpit-temp-target">' + (de ? 'Aktuell (Raumtemperatur)' : 'Current (room temp)') + '</div>';
    html += '<div class="cockpit-controls" style="margin-top:12px">';
    html += '<button class="cockpit-ctrl-btn start" data-action="start">\u25b6\ufe0f ' + (de ? 'Start' : 'Start') + '</button>';
    html += '<button class="cockpit-ctrl-btn reset" data-action="reset">\ud83d\udd04 ' + (de ? 'Reset' : 'Reset') + '</button>';
    html += '</div></div>';

    // Brau-\u00dcbersicht Karte
    html += '<div class="cockpit-card">';
    html += '<div class="cockpit-card-title">\ud83d\udccb ' + (de ? 'Brau-\u00dcbersicht' : 'Brew Overview') + '</div>';
    html += '<div class="ready-overview">';

    // Zeitsch\u00e4tzung
    html += '<div class="ready-overview-row">';
    html += '<span class="ready-overview-icon">\u23f1</span>';
    html += '<span class="ready-overview-label">' + (de ? 'Gesch\u00e4tzte Dauer' : 'Estimated duration') + '</span>';
    html += '<span class="ready-overview-value">' + timeStr + '</span>';
    html += '</div>';
    html += '<div class="ready-overview-row">';
    html += '<span class="ready-overview-icon">\ud83c\udfc1</span>';
    html += '<span class="ready-overview-label">' + (de ? 'Fertig ca.' : 'Done approx.') + '</span>';
    html += '<span class="ready-overview-value">' + etaStr + ' ' + (de ? 'Uhr' : '') + '</span>';
    html += '</div>';

    // Maisch-Info
    if (mashSteps.length > 0) {
      var temps = mashSteps.map(function(s) { return s.temp ? s.temp + '\u00b0' : ''; }).filter(Boolean).join(' \u2192 ');
      html += '<div class="ready-overview-row">';
      html += '<span class="ready-overview-icon">\ud83c\udf3e</span>';
      html += '<span class="ready-overview-label">' + (de ? 'Maischen' : 'Mashing') + ' (' + mashSteps.length + ')</span>';
      html += '<span class="ready-overview-value">' + temps + '</span>';
      html += '</div>';
    }
    // Koch-Info
    if (boilSteps.length > 0) {
      var boilMin = boilSteps.reduce(function(a, s) { return a + s.timer; }, 0);
      html += '<div class="ready-overview-row">';
      html += '<span class="ready-overview-icon">\ud83d\udd25</span>';
      html += '<span class="ready-overview-label">' + (de ? 'Kochen' : 'Boiling') + '</span>';
      html += '<span class="ready-overview-value">' + boilMin + ' min</span>';
      html += '</div>';
    }
    // Hopfengaben
    if (hopAdditions.length > 0) {
      html += '<div class="ready-overview-row">';
      html += '<span class="ready-overview-icon">\ud83c\udf3f</span>';
      html += '<span class="ready-overview-label">' + (de ? 'Hopfengaben' : 'Hop additions') + '</span>';
      html += '<span class="ready-overview-value">' + hopAdditions.join(', ') + '</span>';
      html += '</div>';
    }
    html += '</div></div>';

    html += '</div>'; // /grid

    // ── Visuelle Brau-Timeline ──
    html += '<div class="cockpit-card cockpit-card-full">';
    html += '<div class="cockpit-card-title">\ud83d\uddfa ' + (de ? 'Brau-Fahrplan' : 'Brew Timeline') + '</div>';
    html += '<div class="ready-timeline">';
    steps.forEach(function(s, idx) {
      var type = (s.type || '').toLowerCase();
      var iconType = '\u2b1c';
      var colorClass = 'other';
      if (type.indexOf('mash') !== -1) { iconType = '\ud83c\udf3e'; colorClass = 'mash'; }
      else if (type.indexOf('boil') !== -1) { iconType = '\ud83d\udd25'; colorClass = 'boil'; }
      else if (type.indexOf('cool') !== -1) { iconType = '\u2744\ufe0f'; colorClass = 'cool'; }
      var temp = (s.props && s.props.Temp) ? parseFloat(s.props.Temp).toFixed(0) + '\u00b0C' : '';
      var timer = (s.props && s.props.Timer) ? s.props.Timer + ' min' : '';
      var widthPct = totalMinutes > 0 ? Math.max(8, Math.round(((s.props && s.props.Timer ? parseInt(s.props.Timer) : 5) / totalMinutes) * 100)) : Math.round(100 / steps.length);

      html += '<div class="ready-timeline-step ' + colorClass + '" style="flex:' + widthPct + '">';
      html += '<div class="ready-timeline-icon">' + iconType + '</div>';
      html += '<div class="ready-timeline-name">' + (s.name || (de ? 'Schritt ' : 'Step ') + (idx + 1)) + '</div>';
      html += '<div class="ready-timeline-detail">' + [temp, timer].filter(Boolean).join(' \u00b7 ') + '</div>';
      html += '</div>';
    });
    html += '</div></div>';

    // Aktoren-Karte
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

    // Multi-Kessel-Hinweis (ganz oben)
    html += renderMultiKettleHint(kettles);

    // Hero
    html += '<div class="cockpit-card">';
    html += '<div class="cockpit-idle-hero">';
    html += '<div class="icon">🍺</div>';
    html += '<h2>' + (de ? 'Bereit für den nächsten Brautag!' : 'Ready for your next brew day!') + '</h2>';
    html += '<p>' + (de ? 'Lade ein Rezept aus dem Rezeptbuch, um loszulegen.' : 'Load a recipe from the recipe book to get started.') + '</p>';
    html += '<button class="cockpit-idle-btn" onclick="window.location.hash=\'#/recipes\'">📖 ' + (de ? 'Rezeptbuch öffnen' : 'Open Recipe Book') + '</button>';
    html += '</div></div>';

    // Rezept-Schnellauswahl direkt im Cockpit
    html += '<div class="cockpit-card cockpit-card-full cockpit-recipe-quick">';
    html += '<div class="cockpit-card-title">📋 ' + (de ? 'Rezept laden' : 'Load Recipe') + '</div>';
    html += '<div class="cockpit-recipe-list" id="cockpit-recipe-list">';
    html += '<div class="cockpit-recipe-loading">' + (de ? 'Rezepte werden geladen…' : 'Loading recipes…') + '</div>';
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

  // ── Rezept-Schnellauswahl im Cockpit ──
  function loadCockpitRecipes() {
    var listEl = document.getElementById('cockpit-recipe-list');
    if (!listEl) return;
    var de = currentLang === 'de';
    fetch('/recipe/')
      .then(function(r) { return r.json(); })
      .then(function(recipes) {
        if (!recipes || recipes.length === 0) {
          listEl.innerHTML = '<div class="cockpit-recipe-empty">' + (de ? 'Keine Rezepte vorhanden. Erstelle eins im Rezeptbuch!' : 'No recipes found. Create one in the recipe book!') + '</div>';
          return;
        }
        // Favoriten oben sortieren
        var favs = {};
        try { favs = JSON.parse(localStorage.getItem(RECIPE_FAVORITES_KEY)) || {}; } catch(e) {}
        recipes.sort(function(a, b) {
          var af = favs[a.file] ? 1 : 0;
          var bf = favs[b.file] ? 1 : 0;
          if (af !== bf) return bf - af;
          return (a.name || '').localeCompare(b.name || '');
        });
        var html = '';
        recipes.forEach(function(r) {
          var isFav = favs[r.file];
          html += '<div class="cockpit-recipe-item' + (isFav ? ' fav' : '') + '">';
          html += '<div class="cockpit-recipe-item-info">';
          html += '<span class="cockpit-recipe-item-name">' + (isFav ? '⭐ ' : '') + (r.name || r.file) + '</span>';
          if (r.author) html += '<span class="cockpit-recipe-item-author">' + r.author + '</span>';
          html += '</div>';
          html += '<button class="cockpit-recipe-brew-btn" data-recipe-brew="' + r.file + '">' + (de ? '▶ Laden' : '▶ Load') + '</button>';
          html += '</div>';
        });
        listEl.innerHTML = html;
      })
      .catch(function() {
        listEl.innerHTML = '<div class="cockpit-recipe-empty">' + (de ? 'Fehler beim Laden der Rezepte' : 'Error loading recipes') + '</div>';
      });
  }

  // ── Rezeptwechsler im Ready-Cockpit ──
  function loadCockpitRecipeChanger() {
    var listEl = document.getElementById('cockpit-recipe-change-list');
    if (!listEl) return;
    var de = currentLang === 'de';
    fetch('/recipe/')
      .then(function(r) { return r.json(); })
      .then(function(recipes) {
        if (!recipes || recipes.length === 0) {
          listEl.innerHTML = '<div class="cockpit-recipe-empty">' + (de ? 'Keine Rezepte vorhanden.' : 'No recipes found.') + '</div>';
          return;
        }
        var favs = {};
        try { favs = JSON.parse(localStorage.getItem(RECIPE_FAVORITES_KEY)) || {}; } catch(e) {}
        recipes.sort(function(a, b) {
          var af = favs[a.file] ? 1 : 0;
          var bf = favs[b.file] ? 1 : 0;
          if (af !== bf) return bf - af;
          return (a.name || '').localeCompare(b.name || '');
        });
        var html = '';
        recipes.forEach(function(r) {
          var isFav = favs[r.file];
          html += '<div class="cockpit-recipe-item' + (isFav ? ' fav' : '') + '">';
          html += '<div class="cockpit-recipe-item-info">';
          html += '<span class="cockpit-recipe-item-name">' + (isFav ? '\u2b50 ' : '') + (r.name || r.file) + '</span>';
          if (r.author) html += '<span class="cockpit-recipe-item-author">' + r.author + '</span>';
          html += '</div>';
          html += '<button class="cockpit-recipe-brew-btn" data-recipe-brew="' + r.file + '">\u25b6 ' + (de ? 'Laden' : 'Load') + '</button>';
          html += '</div>';
        });
        listEl.innerHTML = html;
      })
      .catch(function() {
        listEl.innerHTML = '<div class="cockpit-recipe-empty">' + (de ? 'Fehler beim Laden der Rezepte' : 'Error loading recipes') + '</div>';
      });
  }

  // ── Startseiten-Einstellung ──
  function renderStartPageSetting() {
    var de = currentLang === 'de';
    var pref = localStorage.getItem('cbpi_start_page') || 'cockpit';
    var html = '<div class="cockpit-card cockpit-startpage-setting">';
    html += '<div class="cockpit-card-title">' + (de ? 'Startseite' : 'Start Page') + '</div>';
    html += '<p class="cockpit-startpage-desc">' + (de
      ? 'Welche Ansicht soll beim Öffnen von CraftBeerPi angezeigt werden?'
      : 'Which view should be shown when CraftBeerPi opens?') + '</p>';
    html += '<div class="cockpit-startpage-options">';
    html += '<label class="cockpit-startpage-opt' + (pref === 'cockpit' ? ' active' : '') + '">';
    html += '<input type="radio" name="cbpi_start_page" value="cockpit"' + (pref === 'cockpit' ? ' checked' : '') + '>';
    html += '<span class="cockpit-startpage-icon">◐</span>';
    html += '<span class="cockpit-startpage-label">' + (de ? 'Brau-Cockpit' : 'Brew Cockpit') + '</span>';
    html += '<span class="cockpit-startpage-info">' + (de ? 'Kompakte Brauansicht mit Schritten und Steuerung' : 'Compact brew view with steps and controls') + '</span>';
    html += '</label>';
    html += '<label class="cockpit-startpage-opt' + (pref === 'dashboard' ? ' active' : '') + '">';
    html += '<input type="radio" name="cbpi_start_page" value="dashboard"' + (pref === 'dashboard' ? ' checked' : '') + '>';
    html += '<span class="cockpit-startpage-icon">▦</span>';
    html += '<span class="cockpit-startpage-label">' + (de ? 'Anlagenbild' : 'Dashboard') + '</span>';
    html += '<span class="cockpit-startpage-info">' + (de ? 'Visuelles Dashboard mit frei platzierbaren Elementen' : 'Visual dashboard with freely positioned elements') + '</span>';
    html += '</label>';
    html += '</div></div>';
    return html;
  }

  // ── Settings-Panel (Toolbar-Zahnrad) ──
  function toggleSettingsPanel() {
    var existing = document.getElementById('cbpi-settings-panel');
    if (existing) {
      existing.remove();
      var ov = document.getElementById('cbpi-settings-overlay');
      if (ov) ov.remove();
      return;
    }
    var de = currentLang === 'de';
    var panel = document.createElement('div');
    panel.id = 'cbpi-settings-panel';
    panel.className = 'cbpi-settings-panel';

    var html = '<div class="cbpi-settings-inner">';
    html += '<div class="cbpi-settings-header">';
    html += '<span>⚙ ' + (de ? 'Einstellungen' : 'Settings') + '</span>';
    html += '<button class="cbpi-settings-close" id="cbpi-settings-close">&times;</button>';
    html += '</div>';

    // Startseite
    var pref = localStorage.getItem('cbpi_start_page') || 'cockpit';
    html += '<div class="cbpi-settings-section">';
    html += '<div class="cbpi-settings-section-title">' + (de ? 'Startseite' : 'Start Page') + '</div>';
    html += '<div class="cockpit-startpage-options">';
    html += '<label class="cockpit-startpage-opt' + (pref === 'cockpit' ? ' active' : '') + '">';
    html += '<input type="radio" name="cbpi_start_page_s" value="cockpit"' + (pref === 'cockpit' ? ' checked' : '') + '>';
    html += '<span class="cockpit-startpage-icon">◐</span>';
    html += '<span class="cockpit-startpage-label">' + (de ? 'Brau-Cockpit' : 'Brew Cockpit') + '</span>';
    html += '</label>';
    html += '<label class="cockpit-startpage-opt' + (pref === 'dashboard' ? ' active' : '') + '">';
    html += '<input type="radio" name="cbpi_start_page_s" value="dashboard"' + (pref === 'dashboard' ? ' checked' : '') + '>';
    html += '<span class="cockpit-startpage-icon">▦</span>';
    html += '<span class="cockpit-startpage-label">' + (de ? 'Anlagenbild' : 'Dashboard') + '</span>';
    html += '</label>';
    html += '</div></div>';

    // Cockpit-Intervall
    var interval = parseInt(localStorage.getItem('cbpi_refresh_interval') || '3000');
    html += '<div class="cbpi-settings-section">';
    html += '<div class="cbpi-settings-section-title">' + (de ? 'Aktualisierungsintervall' : 'Refresh Interval') + '</div>';
    html += '<div class="cbpi-settings-row">';
    html += '<select id="cbpi-settings-interval" class="cbpi-settings-select">';
    [1000, 2000, 3000, 5000, 10000].forEach(function(ms) {
      var label = (ms / 1000) + (de ? ' Sekunden' : ' seconds');
      html += '<option value="' + ms + '"' + (interval === ms ? ' selected' : '') + '>' + label + '</option>';
    });
    html += '</select>';
    html += '<span class="cbpi-settings-hint">' + (de ? 'Wie oft Sensordaten aktualisiert werden' : 'How often sensor data refreshes') + '</span>';
    html += '</div></div>';

    // Benachrichtigungen
    var notifEnabled = localStorage.getItem('cbpi_notifications') !== '0';
    html += '<div class="cbpi-settings-section">';
    html += '<div class="cbpi-settings-section-title">' + (de ? 'Benachrichtigungen' : 'Notifications') + '</div>';
    html += '<div class="cbpi-settings-row">';
    html += '<label class="cbpi-settings-toggle-label">';
    html += '<input type="checkbox" id="cbpi-settings-notif"' + (notifEnabled ? ' checked' : '') + '>';
    html += '<span>' + (de ? 'Browser-Benachrichtigungen bei Schrittwechsel' : 'Browser notifications on step change') + '</span>';
    html += '</label></div></div>';

    // Temperatur-Einheit
    var unit = localStorage.getItem('cbpi_temp_unit') || 'C';
    html += '<div class="cbpi-settings-section">';
    html += '<div class="cbpi-settings-section-title">' + (de ? 'Temperatur-Einheit' : 'Temperature Unit') + '</div>';
    html += '<div class="cbpi-settings-row">';
    html += '<select id="cbpi-settings-unit" class="cbpi-settings-select">';
    html += '<option value="C"' + (unit === 'C' ? ' selected' : '') + '>°C (Celsius)</option>';
    html += '<option value="F"' + (unit === 'F' ? ' selected' : '') + '>°F (Fahrenheit)</option>';
    html += '</select></div></div>';

    html += '</div>'; // /inner

    panel.innerHTML = html;

    // Overlay: fängt Klicks außerhalb des Panels ab, ohne dass sie durchfallen
    var overlay = document.createElement('div');
    overlay.id = 'cbpi-settings-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:9998;';
    overlay.onclick = function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      panel.remove();
      overlay.remove();
    };
    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    // Event-Handler
    document.getElementById('cbpi-settings-close').onclick = function() {
      panel.remove();
      var ov = document.getElementById('cbpi-settings-overlay');
      if (ov) ov.remove();
    };

    // Startseite Radio
    panel.querySelectorAll('input[name="cbpi_start_page_s"]').forEach(function(radio) {
      radio.addEventListener('change', function() {
        localStorage.setItem('cbpi_start_page', this.value);
        panel.querySelectorAll('.cockpit-startpage-opt').forEach(function(o) { o.classList.remove('active'); });
        this.closest('.cockpit-startpage-opt').classList.add('active');
      });
    });

    // Intervall
    document.getElementById('cbpi-settings-interval').onchange = function() {
      var ms = parseInt(this.value);
      localStorage.setItem('cbpi_refresh_interval', ms);
      if (_cockpitTimer) { clearInterval(_cockpitTimer); _cockpitTimer = setInterval(function() { renderCockpit(false); }, ms); }
    };

    // Benachrichtigungen
    document.getElementById('cbpi-settings-notif').onchange = function() {
      localStorage.setItem('cbpi_notifications', this.checked ? '1' : '0');
      if (this.checked) requestNotificationPermission();
    };

    // Temperatur-Einheit
    document.getElementById('cbpi-settings-unit').onchange = function() {
      localStorage.setItem('cbpi_temp_unit', this.value);
    };
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

  function renderMultiKettleHint(kettles) {
    if (!kettles || kettles.length <= 1) return '';
    var de = currentLang === 'de';
    return '<div class="cockpit-multi-kettle-hint">' +
      '<span class="cockpit-hint-icon">i</span> ' +
      (de
        ? 'Du hast <b>' + kettles.length + ' Kessel</b> konfiguriert. F\u00fcr komplexe Multi-Kessel-Anlagen bietet das <a href="#/" data-switch-dashboard="1">Anlagenbild</a> eine bessere \u00dcbersicht.'
        : 'You have <b>' + kettles.length + ' kettles</b> configured. For complex multi-vessel setups, the <a href="#/" data-switch-dashboard="1">Dashboard</a> provides a better overview.') +
      '</div>';
  }

  function renderStepsList(steps, activeIdx) {
    var de = currentLang === 'de';
    var VISIBLE_AROUND = 2; // Anzahl Schritte vor/nach dem aktiven die immer sichtbar sind
    var totalSteps = steps.length;
    var needsCollapse = totalSteps > 5;

    var html = '<div class="cockpit-steps-card">';
    html += '<div class="cockpit-card-title">' + (de ? 'Alle Schritte' : 'All Steps') + ' <span class="cockpit-steps-count">(' + totalSteps + ')</span></div>';

    steps.forEach(function (step, idx) {
      var isActive = idx === activeIdx;
      var isDone = step.status === 'D';
      var rowClass = isActive ? 'active' : (isDone ? 'done' : '');
      var icon = isDone ? '✅' : (isActive ? '▶️' : '⬜');
      var statusText = isDone ? (de ? 'erledigt' : 'done') : (isActive ? (de ? 'aktiv' : 'active') : (de ? 'ausstehend' : 'pending'));
      var statusClass = isDone ? 'done' : (isActive ? 'active' : 'pending');
      var temp = (step.props && step.props.Temp) ? parseFloat(step.props.Temp).toFixed(0) + '°C' : '';
      var timer = (step.props && step.props.Timer) ? step.props.Timer + ' min' : '';

      // Bei vielen Schritten: nur aktiven + Nachbarn zeigen, Rest verstecken
      var isVisible = !needsCollapse || isActive || isDone ||
        (activeIdx >= 0 && idx >= activeIdx - 1 && idx <= activeIdx + VISIBLE_AROUND) ||
        (activeIdx < 0 && idx < 3); // Kein aktiver Schritt → erste 3 zeigen
      var hiddenClass = isVisible ? '' : ' cockpit-step-collapsed';

      html += '<div class="cockpit-step-row ' + rowClass + hiddenClass + '">';
      html += '<span class="cockpit-step-icon">' + icon + '</span>';
      html += '<span class="cockpit-step-row-name">' + (step.name || 'Schritt ' + (idx + 1)) + '</span>';
      html += '<span class="cockpit-step-row-temp">' + temp + '</span>';
      html += '<span class="cockpit-step-row-time">' + timer + '</span>';
      html += '<span class="cockpit-step-row-status ' + statusClass + '">' + statusText + '</span>';
      html += '</div>';
    });

    if (needsCollapse) {
      var hiddenCount = steps.filter(function(s, i) {
        var isActive = i === activeIdx;
        var isDone = s.status === 'D';
        return !(isActive || isDone ||
          (activeIdx >= 0 && i >= activeIdx - 1 && i <= activeIdx + VISIBLE_AROUND) ||
          (activeIdx < 0 && i < 3));
      }).length;
      if (hiddenCount > 0) {
        html += '<button class="cockpit-steps-expand" data-steps-expand="1">';
        html += (de ? 'Alle ' + totalSteps + ' Schritte anzeigen' : 'Show all ' + totalSteps + ' steps');
        html += '</button>';
      }
    }

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

  function executeCockpitAction(action) {
    var de = currentLang === 'de';
    _cockpitRenderLock = Date.now() + 2000;
    fetch('/step2/' + action, { method: 'POST' })
      .then(function () {
        var msgs = {
          start: de ? 'Brauprozess gestartet' : 'Brew process started',
          stop: de ? 'Brauprozess gestoppt' : 'Brew process stopped',
          next: de ? 'Nächster Schritt' : 'Next step',
          reset: de ? 'Schritte zurückgesetzt' : 'Steps reset'
        };
        showToast(msgs[action] || action, action === 'start' || action === 'next' ? 'success' : 'info');
        _cockpitRenderLock = 0; renderCockpit(true);
      })
      .catch(function (err) {
        console.error('[CBPI Cockpit] Action failed:', err);
        showToast((de ? 'Fehler: ' : 'Error: ') + err.message, 'error');
        _cockpitRenderLock = 0; renderCockpit(true);
      });
  }

  // Event Delegation Handler – wird einmal auf #cbpi-cockpit registriert
  // und bleibt aktiv auch wenn innerHTML aktualisiert wird.
  function cockpitClickHandler(e) {
    // Jeder Klick im Cockpit: kurzes Render-Lock gegen Flackern
    _cockpitRenderLock = Date.now() + 3500;

    // Rezept wechseln – Toggle
    var changeBtn = e.target.closest('#cockpit-recipe-change');
    if (changeBtn) {
      e.stopPropagation();
      var changer = document.getElementById('cockpit-recipe-changer');
      if (changer) {
        var wasCollapsed = changer.classList.contains('collapsed');
        changer.classList.toggle('collapsed');
        if (wasCollapsed) {
          // Rezeptliste laden
          loadCockpitRecipeChanger();
        }
      }
      _cockpitRenderLock = Date.now() + 8000; // Länger offen lassen
      return;
    }

    // Rezept direkt aus dem Cockpit laden
    var brewBtn = e.target.closest('[data-recipe-brew]');
    if (brewBtn) {
      e.stopPropagation();
      var recipeId = brewBtn.getAttribute('data-recipe-brew');
      var de = currentLang === 'de';
      brewBtn.textContent = de ? '⏳ Wird geladen…' : '⏳ Loading…';
      brewBtn.disabled = true;
      fetch('/recipe/' + encodeURIComponent(recipeId) + '/brew', { method: 'POST' })
        .then(function() {
          _cockpitRenderLock = 0;
          renderCockpit(true);
        })
        .catch(function(err) {
          console.error('[CBPI Cockpit] Brew failed:', err);
          brewBtn.textContent = de ? '❌ Fehler' : '❌ Error';
          setTimeout(function() { _cockpitRenderLock = 0; renderCockpit(true); }, 2000);
        });
      return;
    }

    // Chart Zoom-Controls
    var zoomBtn = e.target.closest('[data-chart-zoom]');
    if (zoomBtn) {
      e.stopPropagation();
      var action = zoomBtn.getAttribute('data-chart-zoom');
      if (action === 'in') _tempChartZoom = Math.min(8, _tempChartZoom * 2);
      else if (action === 'out') _tempChartZoom = Math.max(1, _tempChartZoom / 2);
      else _tempChartZoom = 1;
      drawTempChart();
      return;
    }

    // Chart CSV-Export
    var exportBtn = e.target.closest('[data-chart-export]');
    if (exportBtn) {
      e.stopPropagation();
      exportTempHistory();
      return;
    }

    // Schrittliste aufklappen
    var expandBtn = e.target.closest('[data-steps-expand]');
    if (expandBtn) {
      e.stopPropagation();
      var card = expandBtn.closest('.cockpit-steps-card');
      if (card) {
        card.querySelectorAll('.cockpit-step-collapsed').forEach(function(el) {
          el.classList.remove('cockpit-step-collapsed');
        });
        expandBtn.remove();
      }
      return;
    }

    // Multi-Kessel: Link zum Anlagenbild
    var dashLink = e.target.closest('[data-switch-dashboard]');
    if (dashLink) {
      e.preventDefault();
      e.stopPropagation();
      _cockpitMode = false;
      stopCockpit();
      // Direkt Anlagenbild zeigen – bleiben auf #/dashboard
      _isOurDomChange = true;
      var oldTitle = document.getElementById('cbpi-page-title');
      if (oldTitle) oldTitle.remove();
      var oldBanner = document.getElementById('cbpi-help-banner');
      if (oldBanner) oldBanner.remove();
      _isOurDomChange = false;
      addPageTitle();
      addPageHeaders();
      return;
    }

    // Startseiten-Einstellung
    var startRadio = e.target.closest('input[name="cbpi_start_page"]');
    if (startRadio) {
      var val = startRadio.value;
      localStorage.setItem('cbpi_start_page', val);
      // Aktive Klasse umschalten
      var opts = document.querySelectorAll('.cockpit-startpage-opt');
      opts.forEach(function (o) { o.classList.remove('active'); });
      startRadio.closest('.cockpit-startpage-opt').classList.add('active');
      return;
    }

    // Brau-Steuerung (Start/Stop/Next/Reset)
    var ctrlBtn = e.target.closest('.cockpit-ctrl-btn[data-action]');
    if (ctrlBtn) {
      e.stopPropagation();
      var action = ctrlBtn.getAttribute('data-action');
      var de = currentLang === 'de';

      // Stop und Reset brauchen Bestätigung
      if (action === 'stop') {
        showConfirm(
          de ? 'Brauprozess stoppen?' : 'Stop brew process?',
          de ? 'Der aktuelle Brau-Schritt wird angehalten. Du kannst ihn später fortsetzen.' : 'The current brew step will be paused. You can resume later.',
          function() { executeCockpitAction(action); },
          { danger: true, confirmText: de ? '⏹ Stoppen' : '⏹ Stop' }
        );
        return;
      }
      if (action === 'reset') {
        showConfirm(
          de ? 'Alle Schritte zurücksetzen?' : 'Reset all steps?',
          de ? 'ACHTUNG: Alle Brau-Schritte werden auf Anfang zurückgesetzt. Dein aktueller Fortschritt geht verloren!' : 'WARNING: All brew steps will be reset to the beginning. Your current progress will be lost!',
          function() { executeCockpitAction(action); },
          { danger: true, confirmText: de ? '🔄 Ja, zurücksetzen' : '🔄 Yes, reset' }
        );
        return;
      }

      // Start/Next direkt ausführen
      executeCockpitAction(action);
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
      '/* Dropdown/Select + Input Styles — theme-aware */',
      '#cbpi-fermenter-config-form select,',
      '#cbpi-fermenter-config-form input[type="text"],',
      '#cbpi-fermenter-config-form input[type="number"],',
      '#cbpi-fermenter-detail select,',
      '#cbpi-fermenter-detail input {',
      '  background: var(--bg-surface, #16213e) !important;',
      '  color: var(--text, #e0e0e0) !important;',
      '  border: none !important;',
      '  border-bottom: 1px solid var(--border, rgba(255,255,255,0.06)) !important;',
      '  padding: 8px 4px !important;',
      '  font-size: 1rem !important;',
      '  outline: none !important;',
      '  font-family: inherit !important;',
      '}',
      '#cbpi-fermenter-config-form select {',
      '  -webkit-appearance: none;',
      '  appearance: none;',
      '  background-image: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath fill=\'%23888\' d=\'M1.41 0L6 4.58 10.59 0 12 1.41l-6 6-6-6z\'/%3E%3C/svg%3E") !important;',
      '  background-repeat: no-repeat !important;',
      '  background-position: right 4px center !important;',
      '  padding-right: 24px !important;',
      '}',
      '#cbpi-fermenter-config-form select option,',
      '#cbpi-fermenter-detail select option {',
      '  background: var(--bg-surface, #16213e) !important;',
      '  color: var(--text, #e0e0e0) !important;',
      '}',
      '/* Labels im Config-Form */',
      '#cbpi-fermenter-config-form label,',
      '#cbpi-fermenter-config-form .MuiPaper-root label {',
      '  color: var(--text-secondary, rgba(255,255,255,0.7)) !important;',
      '}',
      '#cbpi-fermenter-config-form h2,',
      '#cbpi-fermenter-config-form h3 {',
      '  color: var(--text, #e0e0e0) !important;',
      '}',
      '#cbpi-fermenter-config-form span[style*="font-size:0.7rem"] {',
      '  color: var(--text-muted, rgba(255,255,255,0.45)) !important;',
      '}',
    ].join('\n');
    document.head.appendChild(style);
  }

  // Cockpit-Modus: true = Cockpit anzeigen, false = Anlagenbild (Dashboard-Editor)
  var _startPagePref = localStorage.getItem('cbpi_start_page') || 'cockpit';
  var _cockpitMode = (_startPagePref === 'cockpit');

  // ============================================================
  // BRAUWASSER-AUFBEREITUNGSRECHNER
  // ============================================================
  var WATER_KEY = 'cbpi_water_source';
  var WATER_VOL_KEY = 'cbpi_water_volume';
  var WATER_PROFILE_KEY = 'cbpi_water_profile';

  // Salz-Beiträge pro Gramm pro Liter (mg/L)
  var SALTS = {
    gypsum:  { de: 'Braugips (CaSO\u2084\u00b72H\u2082O)',   en: 'Gypsum (CaSO\u2084\u00b72H\u2082O)',    Ca: 232.8, SO4: 558.0 },
    cacl2:   { de: 'Calciumchlorid (CaCl\u2082\u00b72H\u2082O)', en: 'Calcium Chloride (CaCl\u2082\u00b72H\u2082O)', Ca: 272.6, Cl: 482.3 },
    nacl:    { de: 'Kochsalz (NaCl)',               en: 'Table Salt (NaCl)',             Na: 393.4, Cl: 606.6 },
    epsom:   { de: 'Bittersalz (MgSO\u2084\u00b77H\u2082O)',  en: 'Epsom Salt (MgSO\u2084\u00b77H\u2082O)',  Mg: 98.6,  SO4: 389.7 },
    nahco3:  { de: 'Natron (NaHCO\u2083)',            en: 'Baking Soda (NaHCO\u2083)',       Na: 273.7, HCO3: 726.1 },
    caco3:   { de: 'Brauerkalk (CaCO\u2083)',          en: 'Chalk (CaCO\u2083)',              Ca: 400.4, HCO3: 1219.0 }
  };

  var WATER_PROFILES = {
    pilsner:   { de: 'Pilsner (sehr weich)',  en: 'Pilsner (very soft)',  Ca: 10,  Mg: 3,  Na: 3,   SO4: 10,  Cl: 10,  HCO3: 20 },
    helles:    { de: 'Helles / Lager',        en: 'Helles / Lager',      Ca: 75,  Mg: 5,  Na: 5,   SO4: 60,  Cl: 35,  HCO3: 75 },
    pale_ale:  { de: 'Pale Ale / Bitter',     en: 'Pale Ale / Bitter',   Ca: 75,  Mg: 5,  Na: 15,  SO4: 150, Cl: 50,  HCO3: 75 },
    ipa:       { de: 'IPA (hopfenbetont)',     en: 'IPA (hop-forward)',   Ca: 100, Mg: 10, Na: 15,  SO4: 275, Cl: 75,  HCO3: 50 },
    stout:     { de: 'Stout / Porter',        en: 'Stout / Porter',      Ca: 100, Mg: 15, Na: 50,  SO4: 50,  Cl: 75,  HCO3: 200 },
    weizen:    { de: 'Weizenbier',            en: 'Wheat Beer',          Ca: 60,  Mg: 10, Na: 10,  SO4: 50,  Cl: 50,  HCO3: 150 },
    amber:     { de: 'Amber / M\u00e4rzen',   en: 'Amber / M\u00e4rzen', Ca: 75,  Mg: 10, Na: 10,  SO4: 80,  Cl: 60,  HCO3: 120 },
    dortmund:  { de: 'Dortmunder Export',     en: 'Dortmunder Export',   Ca: 225, Mg: 40, Na: 60,  SO4: 220, Cl: 60,  HCO3: 220 },
    custom:    { de: 'Eigenes Profil',        en: 'Custom Profile',      Ca: 0,   Mg: 0,  Na: 0,   SO4: 0,   Cl: 0,   HCO3: 0 }
  };

  var ION_LABELS = ['Ca', 'Mg', 'Na', 'SO4', 'Cl', 'HCO3'];
  var ION_DISPLAY = { Ca: 'Ca\u00b2\u207a', Mg: 'Mg\u00b2\u207a', Na: 'Na\u207a', SO4: 'SO\u2084\u00b2\u207b', Cl: 'Cl\u207b', HCO3: 'HCO\u2083\u207b' };

  function loadWaterSource() {
    try { return JSON.parse(localStorage.getItem(WATER_KEY)) || {}; } catch(e) { return {}; }
  }

  function saveWaterSource(vals) {
    localStorage.setItem(WATER_KEY, JSON.stringify(vals));
  }

  function calcResidualAlkalinity(Ca, Mg, HCO3) {
    // Kolbach: RA (°dH) = Alkalität - Ca-Härte/3.5 - Mg-Härte/7
    var alk = HCO3 / 21.8;
    var caH = Ca / 7.14;
    var mgH = Mg / 4.33;
    return alk - caH / 3.5 - mgH / 7;
  }

  function calcTotalHardness(Ca, Mg) {
    return Ca / 7.14 + Mg / 4.33;
  }

  function calculateWaterAdditions(source, target, volumeL) {
    var delta = {};
    ION_LABELS.forEach(function(ion) {
      delta[ion] = (target[ion] || 0) - (source[ion] || 0);
    });

    var additions = { gypsum: 0, cacl2: 0, nacl: 0, epsom: 0, nahco3: 0, caco3: 0, lactic: 0 };
    var contrib = { Ca: 0, Mg: 0, Na: 0, SO4: 0, Cl: 0, HCO3: 0 };

    // 1. SO4 erhöhen → Braugips
    if (delta.SO4 > 0) {
      var gPerL = delta.SO4 / SALTS.gypsum.SO4;
      additions.gypsum = gPerL * volumeL;
      contrib.Ca += gPerL * SALTS.gypsum.Ca;
      contrib.SO4 += delta.SO4;
    }

    // 2. Mg erhöhen → Bittersalz
    if (delta.Mg > 0) {
      var gPerL = delta.Mg / SALTS.epsom.Mg;
      additions.epsom = gPerL * volumeL;
      contrib.Mg += delta.Mg;
      contrib.SO4 += gPerL * SALTS.epsom.SO4;
    }

    // 3. Verbleibender Ca-Bedarf → CaCl2
    var remainCa = delta.Ca - contrib.Ca;
    if (remainCa > 0) {
      var gPerL = remainCa / SALTS.cacl2.Ca;
      additions.cacl2 = gPerL * volumeL;
      contrib.Ca += remainCa;
      contrib.Cl += gPerL * SALTS.cacl2.Cl;
    }

    // 4. Na erhöhen → NaCl
    if (delta.Na > 0) {
      var gPerL = delta.Na / SALTS.nacl.Na;
      additions.nacl = gPerL * volumeL;
      contrib.Na += delta.Na;
      contrib.Cl += gPerL * SALTS.nacl.Cl;
    }

    // 5. HCO3 senken → Milchsäure (80%)
    if (delta.HCO3 < 0) {
      var excessHCO3 = Math.abs(delta.HCO3); // mg/L
      var meqPerL = excessHCO3 / 61.02;
      // 1 mL 80% Milchsäure neutralisiert ~8.73 mEq
      var mlPerL = meqPerL / 8.73;
      additions.lactic = mlPerL * volumeL;
    }

    // 6. HCO3 erhöhen → Natron
    if (delta.HCO3 > 0) {
      var gPerL = delta.HCO3 / SALTS.nahco3.HCO3;
      additions.nahco3 = gPerL * volumeL;
      contrib.Na += gPerL * SALTS.nahco3.Na;
      contrib.HCO3 += delta.HCO3;
    }

    // Resultierendes Wasser berechnen
    var result = {};
    ION_LABELS.forEach(function(ion) {
      result[ion] = Math.max(0, (source[ion] || 0) + (contrib[ion] || 0));
    });

    return { additions: additions, result: result, contrib: contrib };
  }

  function buildWaterCalculator() {
    var existing = document.getElementById('cbpi-water-calc');
    if (existing) existing.remove();

    var saved = loadWaterSource();
    var savedVol = parseFloat(localStorage.getItem(WATER_VOL_KEY)) || 20;
    var savedProfile = localStorage.getItem(WATER_PROFILE_KEY) || 'helles';
    var lang = currentLang;

    // Overlay erstellen
    var overlay = document.createElement('div');
    overlay.id = 'cbpi-water-calc';
    overlay.className = 'water-calc-overlay';

    var profileOptions = Object.keys(WATER_PROFILES).map(function(key) {
      var p = WATER_PROFILES[key];
      var sel = key === savedProfile ? ' selected' : '';
      return '<option value="' + key + '"' + sel + '>' + p[lang] + '</option>';
    }).join('');

    var ionInputs = ION_LABELS.map(function(ion) {
      var val = saved[ion] !== undefined ? saved[ion] : '';
      return '<div class="water-ion-input">' +
        '<label>' + ION_DISPLAY[ion] + '</label>' +
        '<input type="number" id="water-src-' + ion + '" value="' + val + '" min="0" step="0.1" placeholder="0">' +
        '<span class="water-unit">mg/L</span>' +
      '</div>';
    }).join('');

    var targetIonInputs = ION_LABELS.map(function(ion) {
      return '<div class="water-ion-input">' +
        '<label>' + ION_DISPLAY[ion] + '</label>' +
        '<input type="number" id="water-tgt-' + ion + '" value="" min="0" step="0.1" placeholder="0" disabled>' +
        '<span class="water-unit">mg/L</span>' +
      '</div>';
    }).join('');

    overlay.innerHTML =
      '<div class="water-calc-container">' +
        '<div class="water-calc-header">' +
          '<h2>' + (lang === 'de' ? 'Brauwasser-Aufbereitung' : 'Brewing Water Calculator') + '</h2>' +
          '<button class="water-close-btn" id="water-close">\u00d7</button>' +
        '</div>' +
        '<div class="water-calc-body">' +
          // Zeile 1: Quellwasser + Zielprofil
          '<div class="water-row">' +
            '<div class="water-card">' +
              '<h3>' + (lang === 'de' ? 'Dein Leitungswasser' : 'Your Tap Water') + '</h3>' +
              '<p class="water-hint">' + (lang === 'de' ? 'Werte vom Wasserwerk oder eigener Messung' : 'Values from water utility or own measurement') + '</p>' +
              '<div class="water-ion-grid">' + ionInputs + '</div>' +
              '<div class="water-ion-input water-ph-input">' +
                '<label>pH</label>' +
                '<input type="number" id="water-src-ph" value="' + (saved.pH || '') + '" min="0" max="14" step="0.1" placeholder="7.0">' +
              '</div>' +
              '<div class="water-info-row" id="water-src-info"></div>' +
              '<div class="water-actions">' +
                '<button class="water-btn water-btn-primary" id="water-save">' + (lang === 'de' ? 'Speichern' : 'Save') + '</button>' +
                '<button class="water-btn water-btn-secondary" id="water-reset">' + (lang === 'de' ? 'Zur\u00fccksetzen' : 'Reset') + '</button>' +
              '</div>' +
            '</div>' +
            '<div class="water-card">' +
              '<h3>' + (lang === 'de' ? 'Zielprofil' : 'Target Profile') + '</h3>' +
              '<div class="water-profile-select">' +
                '<select id="water-profile">' + profileOptions + '</select>' +
              '</div>' +
              '<div class="water-ion-grid water-target-grid" id="water-target-ions">' + targetIonInputs + '</div>' +
              '<div class="water-info-row" id="water-tgt-info"></div>' +
              '<div class="water-volume-row">' +
                '<label>' + (lang === 'de' ? 'Wassermenge' : 'Water Volume') + '</label>' +
                '<input type="number" id="water-volume" value="' + savedVol + '" min="1" max="500" step="0.5">' +
                '<span class="water-unit">Liter</span>' +
              '</div>' +
              '<button class="water-btn water-btn-accent" id="water-calc-btn">' + (lang === 'de' ? 'Berechnen' : 'Calculate') + '</button>' +
            '</div>' +
          '</div>' +
          // Zeile 2: Ergebnis
          '<div class="water-card water-result-card" id="water-result" style="display:none;">' +
            '<h3 id="water-result-title"></h3>' +
            '<div class="water-result-content" id="water-result-content"></div>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    // Event-Handler
    document.getElementById('water-close').onclick = function() {
      overlay.remove();
    };
    overlay.onclick = function(e) {
      if (e.target === overlay) overlay.remove();
    };

    document.getElementById('water-save').onclick = function() {
      var vals = {};
      ION_LABELS.forEach(function(ion) {
        vals[ion] = parseFloat(document.getElementById('water-src-' + ion).value) || 0;
      });
      vals.pH = parseFloat(document.getElementById('water-src-ph').value) || 7.0;
      saveWaterSource(vals);
      var btn = document.getElementById('water-save');
      btn.textContent = lang === 'de' ? 'Gespeichert!' : 'Saved!';
      setTimeout(function() { btn.textContent = lang === 'de' ? 'Speichern' : 'Save'; }, 1500);
    };

    document.getElementById('water-reset').onclick = function() {
      ION_LABELS.forEach(function(ion) {
        document.getElementById('water-src-' + ion).value = '';
      });
      document.getElementById('water-src-ph').value = '';
      localStorage.removeItem(WATER_KEY);
      updateSourceInfo();
    };

    var profileSelect = document.getElementById('water-profile');
    profileSelect.onchange = function() {
      updateTargetIons();
      localStorage.setItem(WATER_PROFILE_KEY, profileSelect.value);
    };

    document.getElementById('water-calc-btn').onclick = runWaterCalc;

    // Quellwasser-Info (Gesamthärte, RA) aktualisieren
    function updateSourceInfo() {
      var ca = parseFloat(document.getElementById('water-src-Ca').value) || 0;
      var mg = parseFloat(document.getElementById('water-src-Mg').value) || 0;
      var hco3 = parseFloat(document.getElementById('water-src-HCO3').value) || 0;
      var gh = calcTotalHardness(ca, mg);
      var ra = calcResidualAlkalinity(ca, mg, hco3);
      var el = document.getElementById('water-src-info');
      el.innerHTML = (lang === 'de' ? 'Gesamth\u00e4rte' : 'Total Hardness') + ': <b>' + gh.toFixed(1) + ' \u00b0dH</b> &nbsp; ' +
        (lang === 'de' ? 'Restalkalit\u00e4t' : 'Residual Alkalinity') + ': <b>' + ra.toFixed(1) + ' \u00b0dH</b>';
    }

    function updateTargetIons() {
      var key = profileSelect.value;
      var profile = WATER_PROFILES[key];
      var isCustom = key === 'custom';
      ION_LABELS.forEach(function(ion) {
        var inp = document.getElementById('water-tgt-' + ion);
        inp.value = profile[ion];
        inp.disabled = !isCustom;
      });
      // Ziel-Info
      var ca = profile.Ca, mg = profile.Mg, hco3 = profile.HCO3;
      var so4 = profile.SO4, cl = profile.Cl;
      var gh = calcTotalHardness(ca, mg);
      var ra = calcResidualAlkalinity(ca, mg, hco3);
      var ratio = cl > 0 ? (so4 / cl).toFixed(1) : '-';
      var el = document.getElementById('water-tgt-info');
      el.innerHTML = 'SO\u2084/Cl: <b>' + ratio + '</b> &nbsp; ' +
        (lang === 'de' ? 'Restalkalit\u00e4t' : 'RA') + ': <b>' + ra.toFixed(1) + ' \u00b0dH</b>';
    }

    function runWaterCalc() {
      var source = {};
      ION_LABELS.forEach(function(ion) {
        source[ion] = parseFloat(document.getElementById('water-src-' + ion).value) || 0;
      });
      source.pH = parseFloat(document.getElementById('water-src-ph').value) || 7.0;

      var target = {};
      var key = profileSelect.value;
      if (key === 'custom') {
        ION_LABELS.forEach(function(ion) {
          target[ion] = parseFloat(document.getElementById('water-tgt-' + ion).value) || 0;
        });
      } else {
        var p = WATER_PROFILES[key];
        ION_LABELS.forEach(function(ion) { target[ion] = p[ion]; });
      }

      var vol = parseFloat(document.getElementById('water-volume').value) || 20;
      localStorage.setItem(WATER_VOL_KEY, vol);

      var calc = calculateWaterAdditions(source, target, vol);
      var a = calc.additions;
      var r = calc.result;

      var resultDiv = document.getElementById('water-result');
      resultDiv.style.display = '';
      document.getElementById('water-result-title').textContent =
        lang === 'de' ? 'Zugabe f\u00fcr ' + vol + ' Liter' : 'Additions for ' + vol + ' Liters';

      // Salzliste (nur >0)
      var saltRows = '';
      var saltKeys = ['gypsum', 'cacl2', 'nacl', 'epsom', 'nahco3'];
      saltKeys.forEach(function(sk) {
        if (a[sk] > 0.01) {
          saltRows += '<tr><td>' + SALTS[sk][lang] + '</td><td class="water-val">' + a[sk].toFixed(1) + ' g</td></tr>';
        }
      });
      if (a.lactic > 0.01) {
        saltRows += '<tr><td>' + (lang === 'de' ? 'Milchs\u00e4ure (80%)' : 'Lactic Acid (80%)') + '</td><td class="water-val">' + a.lactic.toFixed(1) + ' mL</td></tr>';
      }
      if (!saltRows) {
        saltRows = '<tr><td colspan="2">' + (lang === 'de' ? 'Keine Aufbereitung n\u00f6tig' : 'No treatment needed') + '</td></tr>';
      }

      // Resultierendes Wasser
      var resRow = ION_LABELS.map(function(ion) {
        var orig = source[ion] || 0;
        var final = r[ion];
        var tgt = target[ion] || 0;
        var diff = final - tgt;
        var cls = Math.abs(diff) < 5 ? 'water-ok' : (diff > 0 ? 'water-over' : 'water-under');
        return '<td class="' + cls + '">' + Math.round(final) + '</td>';
      }).join('');

      var tgtRow = ION_LABELS.map(function(ion) {
        return '<td>' + (target[ion] || 0) + '</td>';
      }).join('');

      var srcRow = ION_LABELS.map(function(ion) {
        return '<td>' + (source[ion] || 0) + '</td>';
      }).join('');

      var ionHeaders = ION_LABELS.map(function(ion) { return '<th>' + ION_DISPLAY[ion] + '</th>'; }).join('');

      // Kennzahlen
      var finalGH = calcTotalHardness(r.Ca, r.Mg);
      var finalRA = calcResidualAlkalinity(r.Ca, r.Mg, r.HCO3);
      var finalRatio = r.Cl > 0 ? (r.SO4 / r.Cl) : 0;

      var ratioText = '';
      if (finalRatio > 2) ratioText = lang === 'de' ? 'hopfenbetont/trocken' : 'hop-forward/dry';
      else if (finalRatio > 0.8) ratioText = lang === 'de' ? 'ausgewogen' : 'balanced';
      else ratioText = lang === 'de' ? 'malzbetont/vollmundig' : 'malt-forward/full';

      document.getElementById('water-result-content').innerHTML =
        '<table class="water-salt-table"><tbody>' + saltRows + '</tbody></table>' +
        '<h4>' + (lang === 'de' ? 'Resultierendes Wasser' : 'Resulting Water') + '</h4>' +
        '<table class="water-result-table">' +
          '<thead><tr><th></th>' + ionHeaders + '</tr></thead>' +
          '<tbody>' +
            '<tr class="water-row-src"><td>' + (lang === 'de' ? 'Quelle' : 'Source') + '</td>' + srcRow + '</tr>' +
            '<tr class="water-row-tgt"><td>' + (lang === 'de' ? 'Ziel' : 'Target') + '</td>' + tgtRow + '</tr>' +
            '<tr class="water-row-res"><td><b>' + (lang === 'de' ? 'Ergebnis' : 'Result') + '</b></td>' + resRow + '</tr>' +
          '</tbody>' +
        '</table>' +
        '<div class="water-metrics">' +
          '<div class="water-metric"><span>' + (lang === 'de' ? 'Gesamth\u00e4rte' : 'Total Hardness') + '</span><b>' + finalGH.toFixed(1) + ' \u00b0dH</b></div>' +
          '<div class="water-metric"><span>' + (lang === 'de' ? 'Restalkalit\u00e4t' : 'Residual Alk.') + '</span><b>' + finalRA.toFixed(1) + ' \u00b0dH</b></div>' +
          '<div class="water-metric"><span>SO\u2084/Cl</span><b>' + finalRatio.toFixed(1) + '</b><small>' + ratioText + '</small></div>' +
        '</div>';

      // Scroll zum Ergebnis
      resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Quellwasser-Inputs: Live-Update der Info
    ION_LABELS.concat(['ph']).forEach(function(f) {
      var el = document.getElementById('water-src-' + (f === 'ph' ? 'ph' : f));
      if (el) el.addEventListener('input', updateSourceInfo);
    });

    // Initial
    updateTargetIons();
    updateSourceInfo();
  }

  // Brauwasser-Nav-Item in Sidebar injizieren
  function injectWaterNavItem(drawer) {
    if (drawer.querySelector('#cbpi-nav-water')) return;
    var list = drawer.querySelector('.MuiList-root');
    if (!list) return;
    var firstItem = list.querySelector('.MuiListItem-root');
    if (!firstItem) return;

    _isOurDomChange = true;
    var li = firstItem.cloneNode(true);
    li.id = 'cbpi-nav-water';
    li.style.cursor = 'pointer';
    li.classList.remove('cbpi-nav-hidden');

    li.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      buildWaterCalculator();
    });

    // Icon: Wassertropfen
    var svg = li.querySelector('svg');
    if (svg) {
      svg.innerHTML = '<path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2C20 10.48 17.33 6.55 12 2zm0 18c-3.35 0-6-2.57-6-6.2 0-2.34 1.95-5.44 6-9.14 4.05 3.7 6 6.79 6 9.14 0 3.63-2.65 6.2-6 6.2z"/>';
    }

    var textEl = li.querySelector('.MuiListItemText-primary');
    if (textEl) textEl.textContent = currentLang === 'de' ? 'Brauwasser' : 'Water Chemistry';
    var descEl = li.querySelector('.cbpi-menu-desc');
    if (descEl) descEl.textContent = currentLang === 'de' ? 'Wasseraufbereitung berechnen' : 'Calculate water treatment';

    // Nach dem Rezeptbuch-Item einfügen (in der Brauen-Gruppe)
    var items = list.querySelectorAll('.MuiListItem-root');
    var insertAfter = null;
    var hardwareItem = null;
    items.forEach(function(item) {
      var t = item.querySelector('.MuiListItemText-primary');
      if (t) {
        var txt = t.textContent.trim().toLowerCase();
        if (txt === 'rezeptbuch' || txt === 'recipe book' || txt === 'recipes') insertAfter = item;
        if (txt === 'brauplan' || txt === 'brew plan' || txt === 'mash profile') { if (!insertAfter) insertAfter = item; }
        if (txt === 'hardware') hardwareItem = item;
      }
    });
    if (insertAfter && insertAfter.nextSibling) {
      list.insertBefore(li, insertAfter.nextSibling);
    } else if (hardwareItem) {
      list.insertBefore(li, hardwareItem);
    } else {
      list.appendChild(li);
    }
    _isOurDomChange = false;
  }

  // ============================================================
  // BRAU-LOGBUCH — Brauprotokolle/Notizen speichern und abrufen
  // ============================================================
  var BREWLOG_KEY = 'cbpi_brewlog';

  function loadBrewLogs() {
    try { return JSON.parse(localStorage.getItem(BREWLOG_KEY)) || []; } catch(e) { return []; }
  }

  function saveBrewLogs(logs) {
    localStorage.setItem(BREWLOG_KEY, JSON.stringify(logs));
  }

  function addBrewLogEntry(entry) {
    var logs = loadBrewLogs();
    entry.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    entry.created = new Date().toISOString();
    logs.unshift(entry);
    // Max 200 Einträge
    if (logs.length > 200) logs = logs.slice(0, 200);
    saveBrewLogs(logs);
    return entry;
  }

  function deleteBrewLogEntry(id) {
    var logs = loadBrewLogs();
    logs = logs.filter(function(l) { return l.id !== id; });
    saveBrewLogs(logs);
  }

  function updateBrewLogEntry(id, updates) {
    var logs = loadBrewLogs();
    for (var i = 0; i < logs.length; i++) {
      if (logs[i].id === id) {
        for (var k in updates) { logs[i][k] = updates[k]; }
        logs[i].modified = new Date().toISOString();
        break;
      }
    }
    saveBrewLogs(logs);
  }

  function injectBrewLogNavItem(drawer) {
    if (drawer.querySelector('#cbpi-nav-brewlog')) return;
    var list = drawer.querySelector('.MuiList-root');
    if (!list) return;
    var firstItem = list.querySelector('.MuiListItem-root');
    if (!firstItem) return;

    _isOurDomChange = true;
    var li = firstItem.cloneNode(true);
    li.id = 'cbpi-nav-brewlog';
    li.style.cursor = 'pointer';

    li.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      showBrewLogOverlay();
    });

    var svg = li.querySelector('svg');
    if (svg) {
      svg.innerHTML = '<path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>';
    }
    var textEl = li.querySelector('.MuiListItemText-primary');
    if (textEl) textEl.textContent = currentLang === 'de' ? 'Brau-Logbuch' : 'Brew Log';
    var descEl = li.querySelector('.cbpi-menu-desc');
    if (descEl) descEl.textContent = currentLang === 'de' ? 'Brauprotokolle & Notizen' : 'Brew protocols & notes';

    // Nach Rezeptbuch einfügen
    var items = list.querySelectorAll('.MuiListItem-root');
    var insertAfter = null;
    items.forEach(function(item) {
      var t = item.querySelector('.MuiListItemText-primary');
      if (t) {
        var txt = t.textContent.trim().toLowerCase();
        if (txt === 'brauwasser' || txt === 'water chemistry') insertAfter = item;
        if (!insertAfter && (txt === 'rezeptbuch' || txt === 'recipe book')) insertAfter = item;
      }
    });
    if (insertAfter && insertAfter.nextSibling) {
      list.insertBefore(li, insertAfter.nextSibling);
    } else {
      list.appendChild(li);
    }
    _isOurDomChange = false;
  }

  function showBrewLogOverlay() {
    var existing = document.getElementById('cbpi-brewlog-overlay');
    if (existing) existing.remove();

    var de = currentLang === 'de';
    var logs = loadBrewLogs();

    var overlay = document.createElement('div');
    overlay.id = 'cbpi-brewlog-overlay';
    overlay.className = 'brewlog-overlay';

    function renderLogList(filter) {
      var filtered = logs;
      if (filter) {
        var f = filter.toLowerCase();
        filtered = logs.filter(function(l) {
          return (l.recipe || '').toLowerCase().indexOf(f) !== -1 ||
                 (l.notes || '').toLowerCase().indexOf(f) !== -1 ||
                 (l.tags || []).join(' ').toLowerCase().indexOf(f) !== -1;
        });
      }
      if (filtered.length === 0) {
        return '<div class="brewlog-empty">' +
          '<div class="brewlog-empty-icon">📝</div>' +
          '<p>' + (de ? 'Noch keine Einträge. Starte dein erstes Brauprotokoll!' : 'No entries yet. Start your first brew log!') + '</p></div>';
      }
      return filtered.map(function(log) {
        var date = new Date(log.created);
        var dateStr = date.toLocaleDateString(de ? 'de-DE' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        var ratingStars = '';
        for (var s = 1; s <= 5; s++) {
          ratingStars += '<span class="brewlog-star' + (s <= (log.rating || 0) ? ' filled' : '') + '" data-log-id="' + log.id + '" data-rating="' + s + '">★</span>';
        }
        var tagsHtml = (log.tags || []).map(function(t) { return '<span class="brewlog-tag">' + t + '</span>'; }).join('');
        return '<div class="brewlog-entry" data-log-entry="' + log.id + '">' +
          '<div class="brewlog-entry-header">' +
            '<div class="brewlog-entry-title">🍺 ' + (log.recipe || (de ? 'Unbenannt' : 'Untitled')) + '</div>' +
            '<div class="brewlog-entry-date">' + dateStr + '</div>' +
          '</div>' +
          '<div class="brewlog-entry-meta">' +
            '<span class="brewlog-rating">' + ratingStars + '</span>' +
            (log.og ? '<span class="brewlog-meta-item">OG: ' + log.og + '</span>' : '') +
            (log.fg ? '<span class="brewlog-meta-item">FG: ' + log.fg + '</span>' : '') +
            (log.abv ? '<span class="brewlog-meta-item">ABV: ' + log.abv + '%</span>' : '') +
            (log.ibu ? '<span class="brewlog-meta-item">IBU: ' + log.ibu + '</span>' : '') +
          '</div>' +
          (tagsHtml ? '<div class="brewlog-entry-tags">' + tagsHtml + '</div>' : '') +
          '<div class="brewlog-entry-notes">' + (log.notes || (de ? 'Keine Notizen' : 'No notes')) + '</div>' +
          '<div class="brewlog-entry-actions">' +
            '<button class="brewlog-btn-sm" data-brewlog-edit="' + log.id + '">✏️ ' + (de ? 'Bearbeiten' : 'Edit') + '</button>' +
            '<button class="brewlog-btn-sm danger" data-brewlog-delete="' + log.id + '">🗑️ ' + (de ? 'Löschen' : 'Delete') + '</button>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    function renderOverlay() {
      overlay.innerHTML =
        '<div class="brewlog-container">' +
          '<div class="brewlog-header">' +
            '<h2>📖 ' + (de ? 'Brau-Logbuch' : 'Brew Log') + '</h2>' +
            '<div class="brewlog-header-actions">' +
              '<button class="brewlog-btn primary" id="brewlog-export">📤 ' + (de ? 'Export' : 'Export') + '</button>' +
              '<button class="brewlog-btn primary" id="brewlog-import">📥 ' + (de ? 'Import' : 'Import') + '</button>' +
              '<input type="file" id="brewlog-import-file" accept=".json" style="display:none">' +
              '<button class="brewlog-close" id="brewlog-close">×</button>' +
            '</div>' +
          '</div>' +
          '<div class="brewlog-toolbar">' +
            '<input type="text" class="brewlog-search" id="brewlog-search" placeholder="' + (de ? 'Suche nach Rezept, Notizen, Tags...' : 'Search recipe, notes, tags...') + '">' +
            '<button class="brewlog-btn primary" id="brewlog-new">+ ' + (de ? 'Neuer Eintrag' : 'New Entry') + '</button>' +
          '</div>' +
          '<div class="brewlog-list" id="brewlog-list">' + renderLogList() + '</div>' +
        '</div>';
    }

    renderOverlay();
    document.body.appendChild(overlay);

    // Event Delegation
    overlay.addEventListener('click', function(e) {
      if (e.target.id === 'brewlog-close' || e.target === overlay) {
        overlay.remove(); return;
      }
      if (e.target.id === 'brewlog-new' || e.target.closest('#brewlog-new')) {
        showBrewLogEditor(null, function() { logs = loadBrewLogs(); document.getElementById('brewlog-list').innerHTML = renderLogList(); });
        return;
      }
      if (e.target.id === 'brewlog-export') {
        var blob = new Blob([JSON.stringify({app:'CraftBeerPi4',type:'brewlog',exported:new Date().toISOString(),logs:logs}, null, 2)], {type:'application/json'});
        var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
        a.download = 'cbpi4_brewlog_' + new Date().toISOString().slice(0,10) + '.json';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        return;
      }
      if (e.target.id === 'brewlog-import') {
        document.getElementById('brewlog-import-file').click(); return;
      }
      var editBtn = e.target.closest('[data-brewlog-edit]');
      if (editBtn) {
        var id = editBtn.getAttribute('data-brewlog-edit');
        var log = logs.find(function(l) { return l.id === id; });
        if (log) showBrewLogEditor(log, function() { logs = loadBrewLogs(); document.getElementById('brewlog-list').innerHTML = renderLogList(); });
        return;
      }
      var delBtn = e.target.closest('[data-brewlog-delete]');
      if (delBtn) {
        var id = delBtn.getAttribute('data-brewlog-delete');
        if (confirm(de ? 'Eintrag wirklich löschen?' : 'Really delete this entry?')) {
          deleteBrewLogEntry(id);
          logs = loadBrewLogs();
          document.getElementById('brewlog-list').innerHTML = renderLogList();
        }
        return;
      }
      var star = e.target.closest('.brewlog-star');
      if (star) {
        var logId = star.getAttribute('data-log-id');
        var rating = parseInt(star.getAttribute('data-rating'));
        updateBrewLogEntry(logId, { rating: rating });
        logs = loadBrewLogs();
        document.getElementById('brewlog-list').innerHTML = renderLogList(document.getElementById('brewlog-search').value);
        return;
      }
    });

    overlay.addEventListener('input', function(e) {
      if (e.target.id === 'brewlog-search') {
        document.getElementById('brewlog-list').innerHTML = renderLogList(e.target.value);
      }
    });

    overlay.addEventListener('change', function(e) {
      if (e.target.id === 'brewlog-import-file') {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          try {
            var data = JSON.parse(ev.target.result);
            var imported = data.logs || [];
            if (imported.length === 0) { alert(de ? 'Keine Einträge gefunden.' : 'No entries found.'); return; }
            var existing = loadBrewLogs();
            var existingIds = existing.map(function(l) { return l.id; });
            var added = 0;
            imported.forEach(function(l) {
              if (existingIds.indexOf(l.id) === -1) { existing.unshift(l); added++; }
            });
            saveBrewLogs(existing);
            logs = loadBrewLogs();
            document.getElementById('brewlog-list').innerHTML = renderLogList();
            alert((de ? 'Importiert: ' : 'Imported: ') + added + (de ? ' Einträge' : ' entries'));
          } catch(err) { alert((de ? 'Import-Fehler: ' : 'Import error: ') + err.message); }
        };
        reader.readAsText(file);
        e.target.value = '';
      }
    });
  }

  function showBrewLogEditor(existingLog, onSave) {
    var de = currentLang === 'de';
    var isEdit = !!existingLog;
    var log = existingLog || { recipe: '', notes: '', og: '', fg: '', abv: '', ibu: '', tags: [], rating: 0 };

    var modal = document.createElement('div');
    modal.className = 'brewlog-editor-overlay';
    modal.innerHTML =
      '<div class="brewlog-editor">' +
        '<h3>' + (isEdit ? (de ? 'Eintrag bearbeiten' : 'Edit Entry') : (de ? 'Neuer Brau-Eintrag' : 'New Brew Entry')) + '</h3>' +
        '<div class="brewlog-editor-grid">' +
          '<div class="brewlog-field"><label>' + (de ? 'Rezeptname' : 'Recipe') + '</label>' +
            '<input type="text" id="bl-recipe" value="' + (log.recipe || '') + '" placeholder="' + (de ? 'z.B. Märzen, IPA...' : 'e.g. Märzen, IPA...') + '"></div>' +
          '<div class="brewlog-field"><label>OG</label><input type="text" id="bl-og" value="' + (log.og || '') + '" placeholder="1.050"></div>' +
          '<div class="brewlog-field"><label>FG</label><input type="text" id="bl-fg" value="' + (log.fg || '') + '" placeholder="1.012"></div>' +
          '<div class="brewlog-field"><label>ABV %</label><input type="text" id="bl-abv" value="' + (log.abv || '') + '" placeholder="5.0"></div>' +
          '<div class="brewlog-field"><label>IBU</label><input type="text" id="bl-ibu" value="' + (log.ibu || '') + '" placeholder="35"></div>' +
          '<div class="brewlog-field full"><label>' + (de ? 'Tags (kommasepariert)' : 'Tags (comma-separated)') + '</label>' +
            '<input type="text" id="bl-tags" value="' + (log.tags || []).join(', ') + '" placeholder="' + (de ? 'z.B. Sommerbier, hopfig' : 'e.g. summer, hoppy') + '"></div>' +
          '<div class="brewlog-field full"><label>' + (de ? 'Notizen / Protokoll' : 'Notes / Protocol') + '</label>' +
            '<textarea id="bl-notes" rows="8" placeholder="' + (de ? 'Brauprotokoll, Beobachtungen, Temperaturverläufe...' : 'Brew protocol, observations, temperature curves...') + '">' + (log.notes || '') + '</textarea></div>' +
        '</div>' +
        '<div class="brewlog-editor-actions">' +
          '<button class="brewlog-btn secondary" id="bl-cancel">' + (de ? 'Abbrechen' : 'Cancel') + '</button>' +
          '<button class="brewlog-btn primary" id="bl-save">💾 ' + (de ? 'Speichern' : 'Save') + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    modal.addEventListener('click', function(e) {
      if (e.target.id === 'bl-cancel' || e.target === modal) { modal.remove(); return; }
      if (e.target.id === 'bl-save' || e.target.closest('#bl-save')) {
        var entry = {
          recipe: document.getElementById('bl-recipe').value.trim(),
          og: document.getElementById('bl-og').value.trim(),
          fg: document.getElementById('bl-fg').value.trim(),
          abv: document.getElementById('bl-abv').value.trim(),
          ibu: document.getElementById('bl-ibu').value.trim(),
          tags: document.getElementById('bl-tags').value.split(',').map(function(t) { return t.trim(); }).filter(Boolean),
          notes: document.getElementById('bl-notes').value.trim(),
          rating: log.rating || 0
        };
        if (isEdit) {
          updateBrewLogEntry(log.id, entry);
        } else {
          addBrewLogEntry(entry);
        }
        modal.remove();
        if (onSave) onSave();
      }
    });
  }

  // Auto-Log: Eintrag vorschlagen wenn Brauvorgang beendet wird
  function checkAutoBrewLog(steps) {
    if (!steps || steps.length === 0) return;
    var allDone = steps.every(function(s) { return s.status === 'D'; });
    if (!allDone) return;
    var lastLogCheck = localStorage.getItem('cbpi_last_brewlog_check');
    var now = Date.now();
    if (lastLogCheck && (now - parseInt(lastLogCheck)) < 3600000) return; // Max 1x pro Stunde
    localStorage.setItem('cbpi_last_brewlog_check', now.toString());
    var de = currentLang === 'de';
    // Rezeptname aus Steps erraten
    var recipeName = '';
    if (steps[0] && steps[0].props && steps[0].props.Notification) {
      recipeName = steps[0].props.Notification;
    }
    if (confirm(de
      ? 'Brauvorgang abgeschlossen! Möchtest du einen Logbuch-Eintrag erstellen?'
      : 'Brew process completed! Would you like to create a log entry?')) {
      showBrewLogEditor({ recipe: recipeName, notes: '', tags: [], rating: 0 }, function() {});
    }
  }

  // ============================================================
  // HOPFEN-TIMER — Countdown-Timer für Hopfengaben während des Kochens
  // ============================================================
  var _hopTimers = [];       // [{id, label, totalSec, remainSec, fired}]
  var _hopTimerInterval = null;
  var _hopTimerAudio = null;

  function initHopTimerAudio() {
    if (_hopTimerAudio) return;
    try {
      var ac = new (window.AudioContext || window.webkitAudioContext)();
      _hopTimerAudio = ac;
    } catch(e) { /* no audio */ }
  }

  function playHopAlarm() {
    if (!_hopTimerAudio) return;
    try {
      var ac = _hopTimerAudio;
      // Drei aufsteigende Pieptöne
      [0, 0.3, 0.6].forEach(function(delay, i) {
        var osc = ac.createOscillator();
        var gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.frequency.value = 800 + i * 200;
        gain.gain.value = 0.3;
        osc.start(ac.currentTime + delay);
        osc.stop(ac.currentTime + delay + 0.2);
      });
    } catch(e) { /* silent */ }
  }

  function parseHopTimersFromStep(step) {
    if (!step || !step.props) return [];
    var timers = [];
    var totalMin = parseInt(step.props.Timer) || 0;
    if (totalMin <= 0) return [];

    // Hop_1 bis Hop_6: "Minuten vor Ende"
    for (var i = 1; i <= 6; i++) {
      var key = 'Hop_' + i;
      var minBefore = parseInt(step.props[key]);
      if (minBefore > 0) {
        timers.push({
          id: 'hop_' + i,
          label: (currentLang === 'de' ? 'Hopfen ' : 'Hop ') + i,
          minBefore: minBefore,
          totalSec: minBefore * 60,
          remainSec: minBefore * 60,
          fired: false
        });
      }
    }
    // First_Wort
    if (step.props.First_Wort === 'Yes') {
      timers.unshift({
        id: 'first_wort',
        label: currentLang === 'de' ? 'Vorderwürze' : 'First Wort',
        minBefore: totalMin,
        totalSec: 0,
        remainSec: 0,
        fired: false
      });
    }
    // nach minBefore absteigend sortieren (größte zuerst = früheste Zugabe)
    timers.sort(function(a, b) { return b.minBefore - a.minBefore; });
    return timers;
  }

  function updateHopTimers(activeStep) {
    if (!activeStep) { _hopTimers = []; return; }
    var stepType = (activeStep.type || '').toLowerCase();
    if (stepType.indexOf('boil') === -1) { _hopTimers = []; return; }

    // Timer nur einmal parsen (beim Wechsel des Schritts)
    if (_hopTimers.length === 0 || _hopTimers._stepId !== activeStep.id) {
      _hopTimers = parseHopTimersFromStep(activeStep);
      _hopTimers._stepId = activeStep.id;
    }

    // Verbleibende Zeit aus state_text berechnen
    var stateText = activeStep.state_text || '';
    var parts = stateText.split('/');
    var elapsedSec = 0;
    var totalSec = 0;
    if (parts.length === 2) {
      elapsedSec = parseTimerParts(parts[0].trim());
      totalSec = parseTimerParts(parts[1].trim());
    }
    var remainingSec = Math.max(0, totalSec - elapsedSec);

    _hopTimers.forEach(function(ht) {
      // remainSec = wann die Hopfengabe fällig ist (Sekunden bis Alarm)
      // Hopfengabe bei "minBefore Minuten vor Ende" → Alarm wenn remainingSec <= minBefore * 60
      ht.remainSec = Math.max(0, remainingSec - ht.minBefore * 60);

      // Alarm auslösen wenn es soweit ist
      if (!ht.fired && remainingSec <= ht.minBefore * 60 && elapsedSec > 0) {
        ht.fired = true;
        initHopTimerAudio();
        playHopAlarm();
        // Browser-Notification (falls erlaubt)
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('🌿 ' + ht.label, {
            body: currentLang === 'de' ? 'Hopfengabe jetzt!' : 'Add hops now!',
            icon: '/static/hops_icon.svg'
          });
        }
      }
    });
  }

  function renderHopTimerPanel() {
    if (_hopTimers.length === 0) return '';
    var de = currentLang === 'de';
    var html = '<div class="cockpit-card cockpit-card-full cockpit-hop-timer">';
    html += '<div class="cockpit-card-title">🌿 ' + (de ? 'Hopfen-Timer' : 'Hop Timer') + '</div>';
    html += '<div class="hop-timer-grid">';
    _hopTimers.forEach(function(ht) {
      var mins = Math.floor(ht.remainSec / 60);
      var secs = ht.remainSec % 60;
      var timeStr = mins + ':' + (secs < 10 ? '0' : '') + secs;
      var statusClass = ht.fired ? 'fired' : (ht.remainSec < 60 ? 'soon' : '');
      html += '<div class="hop-timer-item ' + statusClass + '">';
      html += '<div class="hop-timer-label">' + ht.label + '</div>';
      html += '<div class="hop-timer-time">' + (ht.fired ? '✅ ' + (de ? 'Zugabe!' : 'Add!') : timeStr) + '</div>';
      html += '<div class="hop-timer-info">' + ht.minBefore + ' min ' + (de ? 'vor Ende' : 'before end') + '</div>';
      var pct = ht.totalSec > 0 ? Math.min(100, Math.round(((ht.totalSec - ht.remainSec) / ht.totalSec) * 100)) : (ht.fired ? 100 : 0);
      html += '<div class="hop-timer-progress"><div class="hop-timer-fill" style="width:' + pct + '%"></div></div>';
      html += '</div>';
    });
    html += '</div></div>';
    return html;
  }

  // Notification-Berechtigung beim ersten Mal anfragen
  function requestNotificationPermission() {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  // ============================================================
  // REZEPT-BIBLIOTHEK — Erweiterte Rezeptverwaltung
  // ============================================================
  var RECIPE_FAVORITES_KEY = 'cbpi_recipe_favorites';
  var RECIPE_TAGS_KEY = 'cbpi_recipe_tags';
  var RECIPE_NOTES_KEY = 'cbpi_recipe_notes';

  function loadRecipeMeta(key) {
    try { return JSON.parse(localStorage.getItem(key)) || {}; } catch(e) { return {}; }
  }
  function saveRecipeMeta(key, data) { localStorage.setItem(key, JSON.stringify(data)); }

  function toggleRecipeFavorite(recipeId) {
    var favs = loadRecipeMeta(RECIPE_FAVORITES_KEY);
    if (favs[recipeId]) { delete favs[recipeId]; } else { favs[recipeId] = true; }
    saveRecipeMeta(RECIPE_FAVORITES_KEY, favs);
    return !!favs[recipeId];
  }

  function setRecipeTags(recipeId, tags) {
    var meta = loadRecipeMeta(RECIPE_TAGS_KEY);
    meta[recipeId] = tags;
    saveRecipeMeta(RECIPE_TAGS_KEY, meta);
  }

  function setRecipeNotes(recipeId, notes) {
    var meta = loadRecipeMeta(RECIPE_NOTES_KEY);
    meta[recipeId] = notes;
    saveRecipeMeta(RECIPE_NOTES_KEY, meta);
  }

  function enhanceRecipePage() {
    var hash = window.location.hash.replace('#', '');
    // Auf anderen Seiten: Rezept-Enhancements entfernen
    if (hash !== '/recipes') {
      var staleSearch = document.querySelector('.recipe-lib-search');
      if (staleSearch) staleSearch.remove();
      var staleMarker = document.getElementById('cbpi-recipe-enhance');
      if (staleMarker) staleMarker.remove();
      return;
    }
    if (document.getElementById('cbpi-recipe-enhance')) return;

    var target = findContentTarget();
    if (!target) return;

    var de = currentLang === 'de';
    var favs = loadRecipeMeta(RECIPE_FAVORITES_KEY);
    var tags = loadRecipeMeta(RECIPE_TAGS_KEY);

    // Suchleiste und Filter hinzufügen
    var toolbar = document.getElementById('cbpi-recipe-tools');
    if (!toolbar) return;

    // Marker setzen
    var marker = document.createElement('div');
    marker.id = 'cbpi-recipe-enhance';
    marker.style.display = 'none';
    target.appendChild(marker);

    // Suchfeld
    var searchDiv = document.createElement('div');
    searchDiv.className = 'recipe-lib-search';
    searchDiv.innerHTML =
      '<input type="text" id="recipe-lib-filter" class="recipe-lib-input" placeholder="' +
      (de ? '🔍 Rezepte durchsuchen...' : '🔍 Search recipes...') + '">' +
      '<div class="recipe-lib-filter-btns">' +
        '<button class="recipe-lib-filter-btn active" data-recipe-filter="all">' + (de ? 'Alle' : 'All') + '</button>' +
        '<button class="recipe-lib-filter-btn" data-recipe-filter="favorites">⭐ ' + (de ? 'Favoriten' : 'Favorites') + '</button>' +
      '</div>';
    toolbar.after(searchDiv);

    // Event: Suche
    document.getElementById('recipe-lib-filter').addEventListener('input', function() {
      filterRecipeCards(this.value, null);
    });

    // Event: Filter-Buttons
    searchDiv.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-recipe-filter]');
      if (!btn) return;
      searchDiv.querySelectorAll('.recipe-lib-filter-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.getAttribute('data-recipe-filter');
      filterRecipeCards(document.getElementById('recipe-lib-filter').value, filter === 'favorites' ? 'favorites' : null);
    });

    // Favorit-Icons zu bestehenden Rezeptkarten hinzufügen
    addFavoriteStarsToRecipes();

    // Rezept-Details nachladen und Karten anreichern
    enrichRecipeCards();
  }

  function enrichRecipeCards() {
    var cards = document.querySelectorAll('.MuiCard-root, .MuiPaper-root');
    cards.forEach(function(card) {
      if (card.querySelector('.recipe-card-detail')) return;
      var link = card.querySelector('a[href*="/recipe/"]');
      if (!link) return;
      var m = link.getAttribute('href').match(/recipe\/(.+)/);
      if (!m) return;
      var recipeId = m[1];

      // Detail-Container vorbereiten
      var detailDiv = document.createElement('div');
      detailDiv.className = 'recipe-card-detail';
      detailDiv.innerHTML = '<span class="recipe-card-loading">\u2026</span>';
      // Vor dem Fav-Star einf\u00fcgen oder ans Ende
      var starBtn = card.querySelector('.recipe-fav-star');
      if (starBtn) {
        card.insertBefore(detailDiv, starBtn);
      } else {
        card.appendChild(detailDiv);
      }

      // Details laden
      fetch('/recipe/' + encodeURIComponent(recipeId))
        .then(function(r) { return r.json(); })
        .then(function(detail) {
          var de = currentLang === 'de';
          var steps = (detail && detail.steps) ? detail.steps : [];
          if (steps.length === 0) {
            detailDiv.innerHTML = '<span class="recipe-card-empty">' + (de ? 'Keine Schritte' : 'No steps') + '</span>';
            return;
          }

          var mashCount = 0, boilCount = 0, totalMin = 0;
          var temps = [];
          var hops = 0;
          steps.forEach(function(s) {
            var type = (s.type || s.name || '').toLowerCase();
            var mins = (s.props && s.props.Timer) ? parseInt(s.props.Timer) || 0 : 0;
            totalMin += mins;
            if (s.props && s.props.Temp) temps.push(parseFloat(s.props.Temp));
            if (type.indexOf('mash') !== -1) mashCount++;
            else if (type.indexOf('boil') !== -1) {
              boilCount++;
              if (s.props) {
                for (var i = 1; i <= 6; i++) {
                  if (s.props['Hop_' + i] && s.props['Hop_' + i] !== '0' && s.props['Hop_' + i] !== '') hops++;
                }
                if (s.props.First_Wort && s.props.First_Wort !== '0' && s.props.First_Wort !== '') hops++;
              }
            }
          });

          var html = '<div class="recipe-card-badges">';
          html += '<span class="recipe-badge">' + steps.length + ' ' + (de ? 'Schritte' : 'steps') + '</span>';
          if (totalMin > 0) {
            var h = Math.floor(totalMin / 60);
            var mins = totalMin % 60;
            html += '<span class="recipe-badge time">\u23f1 ' + (h > 0 ? h + 'h ' : '') + mins + 'min</span>';
          }
          if (mashCount > 0) html += '<span class="recipe-badge mash">\ud83c\udf3e ' + mashCount + 'x</span>';
          if (boilCount > 0) html += '<span class="recipe-badge boil">\ud83d\udd25 ' + boilCount + 'x</span>';
          if (hops > 0) html += '<span class="recipe-badge hop">\ud83c\udf3f ' + hops + 'x</span>';
          html += '</div>';

          if (temps.length > 0) {
            html += '<div class="recipe-card-temps">' + temps.map(function(t) { return t.toFixed(0) + '\u00b0'; }).join(' \u2192 ') + '</div>';
          }

          detailDiv.innerHTML = html;
        })
        .catch(function() {
          detailDiv.innerHTML = '';
        });
    });
  }

  function addFavoriteStarsToRecipes() {
    var favs = loadRecipeMeta(RECIPE_FAVORITES_KEY);
    // MUI-Cards oder Liste finden
    var cards = document.querySelectorAll('.MuiCard-root, .MuiPaper-root');
    cards.forEach(function(card) {
      if (card.querySelector('.recipe-fav-star')) return;
      // Rezept-ID aus dem Link oder Button ermitteln
      var link = card.querySelector('a[href*="/recipe/"]');
      var recipeId = '';
      if (link) {
        var m = link.getAttribute('href').match(/recipe\/(.+)/);
        if (m) recipeId = m[1];
      }
      if (!recipeId) return;

      var star = document.createElement('button');
      star.className = 'recipe-fav-star' + (favs[recipeId] ? ' active' : '');
      star.setAttribute('data-recipe-id', recipeId);
      star.innerHTML = favs[recipeId] ? '⭐' : '☆';
      star.title = currentLang === 'de' ? 'Favorit' : 'Favorite';
      star.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var isFav = toggleRecipeFavorite(recipeId);
        star.innerHTML = isFav ? '⭐' : '☆';
        star.classList.toggle('active', isFav);
      });
      card.style.position = 'relative';
      card.appendChild(star);
    });
  }

  function filterRecipeCards(searchText, mode) {
    var favs = loadRecipeMeta(RECIPE_FAVORITES_KEY);
    var search = (searchText || '').toLowerCase();
    var cards = document.querySelectorAll('.MuiCard-root, .MuiPaper-root');
    cards.forEach(function(card) {
      var star = card.querySelector('.recipe-fav-star');
      if (!star) return; // Kein Rezept-Card
      var recipeId = star.getAttribute('data-recipe-id');
      var text = card.textContent.toLowerCase();
      var matchSearch = !search || text.indexOf(search) !== -1;
      var matchMode = !mode || (mode === 'favorites' && favs[recipeId]);
      card.style.display = (matchSearch && matchMode) ? '' : 'none';
    });
  }

  // ============================================================
  // TEMPERATUR-GRAPH — Erweitert (Zoom, Export, Persistenz)
  // ============================================================
  var TEMP_PERSIST_KEY = 'cbpi_temp_history';
  var _tempChartZoom = 1;   // 1 = voll, 2 = letzte Hälfte, etc.

  function saveTempHistory() {
    // Nur die letzten 300 Punkte speichern (Performance)
    var toSave = _tempHistory.slice(-300);
    try { localStorage.setItem(TEMP_PERSIST_KEY, JSON.stringify({ data: toSave, changes: _tempStepChanges })); } catch(e) { /* quota */ }
  }

  function loadTempHistory() {
    try {
      var saved = JSON.parse(localStorage.getItem(TEMP_PERSIST_KEY));
      if (saved && saved.data && saved.data.length > 0) {
        _tempHistory = saved.data;
        _tempStepChanges = saved.changes || [];
        if (_tempHistory.length > 0) {
          _lastStepName = _tempHistory[_tempHistory.length - 1].step || '';
        }
        return true;
      }
    } catch(e) { /* ignore */ }
    return false;
  }

  function exportTempHistory() {
    if (_tempHistory.length === 0) return;
    var de = currentLang === 'de';
    // CSV Export
    var csv = 'Zeitstempel;Ist (°C);Soll (°C);Schritt\n';
    _tempHistory.forEach(function(p) {
      var d = new Date(p.t);
      csv += d.toLocaleTimeString() + ';' + (p.actual !== null ? p.actual.toFixed(1) : '') + ';' + (p.target !== null ? p.target.toFixed(1) : '') + ';' + (p.step || '') + '\n';
    });
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'cbpi4_temperatur_' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  // Zoom-Controls für den Chart rendern
  function renderChartControls() {
    var de = currentLang === 'de';
    return '<div class="cockpit-chart-controls">' +
      '<button class="chart-ctrl-btn" data-chart-zoom="out" title="' + (de ? 'Herauszoomen' : 'Zoom out') + '">−</button>' +
      '<button class="chart-ctrl-btn" data-chart-zoom="reset" title="' + (de ? 'Ganzer Verlauf' : 'Full range') + '">⊙</button>' +
      '<button class="chart-ctrl-btn" data-chart-zoom="in" title="' + (de ? 'Hineinzoomen' : 'Zoom in') + '">+</button>' +
      '<button class="chart-ctrl-btn" data-chart-export="csv" title="' + (de ? 'CSV exportieren' : 'Export CSV') + '">📊</button>' +
      '</div>';
  }

  // ============================================================
  // GÄRUNGS-DASHBOARD — Fermenter-Steuerung & Monitoring
  // ============================================================

  var _fermenterRefreshInterval = null;
  var _fermenterLastGraphDraw = 0;
  var _fermenterGraphInterval = 60000; // Graph nur alle 60s neu zeichnen

  function injectFermenterNavItem(drawer) {
    if (drawer.querySelector('#cbpi-nav-fermenter')) return;
    var list = drawer.querySelector('.MuiList-root');
    if (!list) return;
    var firstItem = list.querySelector('.MuiListItem-root');
    if (!firstItem) return;

    _isOurDomChange = true;
    var li = firstItem.cloneNode(true);
    li.id = 'cbpi-nav-fermenter';
    li.style.cursor = 'pointer';

    li.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      window.location.hash = '#/fermenter';
    });

    var svg = li.querySelector('svg');
    if (svg) {
      // Fermenter/Tank SVG Icon
      svg.innerHTML = '<path d="M5 2v4h1v2.17C3.84 9.41 2.56 11.2 2.1 13.39c-.24 1.14-.1 2.32.39 3.36.49 1.04 1.3 1.87 2.31 2.39V22h14.4v-2.86c1.01-.52 1.82-1.35 2.31-2.39.49-1.04.63-2.22.39-3.36-.46-2.19-1.74-3.98-3.9-5.22V6h1V2H5zm12 4H7V4h10v2zm-1 2v2.02c-.24.1-.47.22-.69.35-.66.38-1.22.87-1.68 1.46A5.97 5.97 0 0 0 12 15c0 1.42.5 2.73 1.33 3.76H10.67A5.97 5.97 0 0 0 12 15c0-1.23-.38-2.38-1.03-3.34-.46-.59-1.02-1.08-1.68-1.46A4.3 4.3 0 0 0 8.6 9.85V8h6.8z"/>';
    }
    var textEl = li.querySelector('.MuiListItemText-primary');
    if (textEl) textEl.textContent = currentLang === 'de' ? 'Gärung' : 'Fermentation';
    var descEl = li.querySelector('.cbpi-menu-desc');
    if (descEl) descEl.textContent = currentLang === 'de' ? 'Gärbehälter steuern & überwachen' : 'Control & monitor fermenters';

    // Nach Brau-Logbuch einfügen
    var items = list.querySelectorAll('.MuiListItem-root');
    var insertAfter = null;
    items.forEach(function(item) {
      var t = item.querySelector('.MuiListItemText-primary');
      if (t) {
        var txt = t.textContent.trim().toLowerCase();
        if (txt === 'brau-logbuch' || txt === 'brew log') insertAfter = item;
      }
    });
    if (insertAfter && insertAfter.nextSibling) {
      list.insertBefore(li, insertAfter.nextSibling);
    } else {
      list.appendChild(li);
    }
    _isOurDomChange = false;
  }

  function injectHelpNavItem(drawer) {
    if (drawer.querySelector('#cbpi-nav-help')) return;
    var list = drawer.querySelector('.MuiList-root');
    if (!list) return;
    var firstItem = list.querySelector('.MuiListItem-root');
    if (!firstItem) return;

    _isOurDomChange = true;
    var li = firstItem.cloneNode(true);
    li.id = 'cbpi-nav-help';
    li.style.cursor = 'pointer';

    li.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      window.location.hash = '#/help';
    });

    var svg = li.querySelector('svg');
    if (svg) {
      svg.innerHTML = '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>';
    }
    var textEl = li.querySelector('.MuiListItemText-primary');
    if (textEl) textEl.textContent = currentLang === 'de' ? 'Hilfe' : 'Help';
    var descEl = li.querySelector('.cbpi-menu-desc');
    if (descEl) descEl.textContent = currentLang === 'de' ? 'Dokumentation & Nachschlagewerk' : 'Documentation & Reference';

    // Am Ende der Liste einfügen
    list.appendChild(li);
    _isOurDomChange = false;
  }

  function buildFermenterDashboard() {
    var hash = window.location.hash.replace('#', '');
    if (hash !== '/fermenter') {
      stopFermenterDashboard();
      return;
    }

    // Schon aufgebaut? Nur Daten refreshen
    if (document.getElementById('cbpi-fermenter-page')) {
      if (!_fermenterRefreshInterval) {
        loadFermenterData();
        _fermenterRefreshInterval = setInterval(loadFermenterData, 5000);
      }
      return;
    }

    var target = findContentTarget();
    if (!target) return;

    var de = currentLang === 'de';

    // Original-Content verstecken (React rendert nichts auf /fermenter, aber falls doch)
    _isOurDomChange = true;
    var origChildren = target.children;
    for (var c = 0; c < origChildren.length; c++) {
      if (origChildren[c].id !== 'cbpi-page-title' && origChildren[c].id !== 'cbpi-help-banner' && origChildren[c].id !== 'cbpi-fermenter-page') {
        origChildren[c].style.display = 'none';
      }
    }

    var container = document.createElement('div');
    container.id = 'cbpi-fermenter-page';
    container.innerHTML =
      '<div class="fermenter-body" id="fermenter-body">' +
        '<div class="fermenter-loading">' + (de ? 'Gärbehälter werden geladen…' : 'Loading fermenters…') + '</div>' +
      '</div>';
    target.appendChild(container);

    // Event Delegation
    container.addEventListener('click', fermenterClickHandler);
    container.addEventListener('input', fermenterInputHandler);
    container.addEventListener('change', fermenterChangeHandler);
    _isOurDomChange = false;

    loadFermenterData();
    _fermenterRefreshInterval = setInterval(loadFermenterData, 5000);
  }

  function stopFermenterDashboard() {
    if (_fermenterRefreshInterval) { clearInterval(_fermenterRefreshInterval); _fermenterRefreshInterval = null; }
    var page = document.getElementById('cbpi-fermenter-page');
    if (page) {
      var parent = page.parentNode;
      if (parent) {
        _isOurDomChange = true;
        var children = parent.children;
        for (var i = 0; i < children.length; i++) {
          if (children[i].style && children[i].style.display === 'none') {
            children[i].style.display = '';
          }
        }
        parent.removeChild(page);
        _isOurDomChange = false;
      }
    }
  }

  function fermenterClickHandler(e) {
    var de = currentLang === 'de';

    var btn = e.target.closest('[data-ferm-action]');
    if (btn) {
      e.stopPropagation();
      var fermId = btn.getAttribute('data-ferm-id');
      var action = btn.getAttribute('data-ferm-action');
      btn.disabled = true;
      btn.style.opacity = '0.5';

      var url = '/fermenter/' + encodeURIComponent(fermId) + '/' + action;
      var opts = { method: 'POST' };

      if (action === 'target_temp') {
        var input = document.getElementById('ferm-target-' + fermId);
        var temp = input ? parseFloat(input.value) : 0;
        opts.headers = { 'Content-Type': 'application/json' };
        opts.body = JSON.stringify({ temp: temp });
      }

      fetch(url, opts)
        .then(function() { setTimeout(loadFermenterData, 500); })
        .catch(function(err) { console.error('[Fermenter] Action failed:', err); })
        .finally(function() { btn.disabled = false; btn.style.opacity = '1'; });
      return;
    }

    var brewBtn = e.target.closest('[data-ferm-brew]');
    if (brewBtn) {
      e.stopPropagation();
      var recipeId = brewBtn.getAttribute('data-ferm-recipe');
      var fermId2 = brewBtn.getAttribute('data-ferm-brew');
      var recipeName = brewBtn.getAttribute('data-ferm-recipe-name') || '';
      brewBtn.disabled = true;
      brewBtn.textContent = de ? '⏳ Wird geladen…' : '⏳ Loading…';
      fetch('/fermenterrecipe/' + encodeURIComponent(recipeId) + '/' + encodeURIComponent(fermId2) + '/' + encodeURIComponent(recipeName) + '/brew', { method: 'POST' })
        .then(function() { setTimeout(loadFermenterData, 500); })
        .catch(function(err) { console.error('[Fermenter] Brew failed:', err); });
      return;
    }

    var recipeToggle = e.target.closest('[data-ferm-recipe-toggle]');
    if (recipeToggle) {
      var panel = document.getElementById('ferm-recipes-' + recipeToggle.getAttribute('data-ferm-recipe-toggle'));
      if (panel) {
        panel.classList.toggle('collapsed');
        if (!panel.classList.contains('collapsed')) {
          loadFermenterRecipes(recipeToggle.getAttribute('data-ferm-recipe-toggle'));
        }
      }
      return;
    }

    if (e.target.closest('#fermenter-create-btn')) {
      showCreateFermenterForm();
      return;
    }

    // ── Gärrezept aus Vorlage erstellen ──
    var profileCard = e.target.closest('[data-ferm-profile]');
    if (profileCard) {
      e.stopPropagation();
      var profileIdx = parseInt(profileCard.getAttribute('data-ferm-profile'));
      var targetFermId = profileCard.getAttribute('data-ferm-profile-target');
      var profile = FERMENTATION_PROFILES[profileIdx];
      if (!profile) return;

      var pName = de ? profile.name.de : profile.name.en;
      if (!confirm(de ? 'Gärprofil "' + pName + '" als Rezept erstellen und in den Gärbehälter laden?' : 'Create profile "' + pName + '" and load into fermenter?')) return;

      profileCard.style.opacity = '0.5';
      profileCard.style.pointerEvents = 'none';

      // 1. Rezept erstellen
      fetch('/fermenterrecipe/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: pName })
      })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var recipeId = data.id;
        // 2. Schritte speichern
        var steps = profile.steps.map(function(s) {
          return { name: de ? s.name.de : s.name.en, type: s.type, props: s.props, status: 'I' };
        });
        return fetch('/fermenterrecipe/' + recipeId, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ basic: { name: pName }, steps: steps })
        }).then(function() { return recipeId; });
      })
      .then(function(recipeId) {
        // 3. In den Fermenter laden (brew)
        return fetch('/fermenterrecipe/' + encodeURIComponent(recipeId) + '/' + encodeURIComponent(targetFermId) + '/' + encodeURIComponent(pName) + '/brew', { method: 'POST' });
      })
      .then(function() {
        // Full re-render to show the new steps
        var body = document.getElementById('fermenter-body');
        if (body) body.querySelector('.fermenter-card').remove();
        setTimeout(loadFermenterData, 500);
      })
      .catch(function(err) {
        console.error('[Fermenter] Profile create failed:', err);
        alert(de ? 'Fehler: ' + err.message : 'Error: ' + err.message);
        profileCard.style.opacity = '1';
        profileCard.style.pointerEvents = '';
      });
      return;
    }

    // ── Schritt zum Custom-Rezept hinzufügen ──
    var addStepBtn = e.target.closest('[data-ferm-add-step]');
    if (addStepBtn) {
      e.stopPropagation();
      var fid = addStepBtn.getAttribute('data-ferm-add-step');
      addFermenterRecipeStep(fid);
      return;
    }

    // ── Schritt aus Custom-Rezept entfernen ──
    var removeStepBtn = e.target.closest('[data-ferm-remove-step]');
    if (removeStepBtn) {
      e.stopPropagation();
      removeStepBtn.closest('.fermenter-recipe-step-row').remove();
      return;
    }

    // ── Custom-Rezept speichern + laden ──
    var saveRecipeBtn = e.target.closest('[data-ferm-save-recipe]');
    if (saveRecipeBtn) {
      e.stopPropagation();
      var sfid = saveRecipeBtn.getAttribute('data-ferm-save-recipe');
      saveAndBrewCustomRecipe(sfid);
      return;
    }

    // ── Rezept löschen ──
    var delBtn = e.target.closest('[data-ferm-recipe-delete]');
    if (delBtn) {
      e.stopPropagation();
      var delId = delBtn.getAttribute('data-ferm-recipe-delete');
      var delName = delBtn.getAttribute('data-ferm-recipe-name');
      if (!confirm(de ? 'Rezept "' + delName + '" wirklich löschen?' : 'Delete recipe "' + delName + '"?')) return;
      fetch('/fermenterrecipe/' + encodeURIComponent(delId), { method: 'DELETE' })
        .then(function() {
          // Panel-ID aus dem nächsten parent finden
          var panel = delBtn.closest('.fermenter-recipe-panel');
          if (panel) {
            var panelFermId = panel.id.replace('ferm-recipes-', '');
            loadFermenterRecipes(panelFermId);
          }
        });
      return;
    }
  }

  // ── Schritt-Zeile zum Custom-Rezept hinzufügen ──
  function addFermenterRecipeStep(fermId) {
    var container = document.getElementById('ferm-recipe-steps-' + fermId);
    if (!container) return;
    var de = currentLang === 'de';
    var idx = container.querySelectorAll('.fermenter-recipe-step-row').length + 1;

    var row = document.createElement('div');
    row.className = 'fermenter-recipe-step-row';
    row.innerHTML =
      '<span class="fermenter-step-num">' + idx + '.</span>' +
      '<div class="ferm-step-field" style="flex:2"><label>' + (de ? 'Name' : 'Name') + '</label>' +
        '<input type="text" class="fermenter-input ferm-step-name" placeholder="' + (de ? 'Schrittname' : 'Step name') + '" value="' + (de ? 'Schritt ' + idx : 'Step ' + idx) + '">' +
      '</div>' +
      '<div class="ferm-step-field" style="flex:1.5"><label>' + (de ? 'Typ' : 'Type') + '</label>' +
        '<select class="fermenter-input ferm-step-type">' +
          '<option value="FermenterStep">' + (de ? 'Timer-Schritt' : 'Timer Step') + '</option>' +
          '<option value="FermenterTargetTempStep">' + (de ? 'Zieltemp erreichen' : 'Reach Target') + '</option>' +
          '<option value="FermenterRampTempStep">' + (de ? 'Temp. langsam ändern' : 'Gradual Temp Change') + '</option>' +
          '<option value="FermenterNotificationStep">' + (de ? 'Benachrichtigung' : 'Notification') + '</option>' +
        '</select>' +
      '</div>' +
      '<div class="ferm-step-field" style="width:75px"><label>°C</label>' +
        '<input type="number" class="fermenter-input ferm-step-temp" step="0.5" min="0" max="40" value="18">' +
      '</div>' +
      '<div class="ferm-step-field" style="width:70px"><label>' + (de ? 'Tage' : 'Days') + '</label>' +
        '<input type="number" class="fermenter-input ferm-step-days" min="0" value="7">' +
      '</div>' +
      '<button class="fermenter-ctrl-btn" data-ferm-remove-step="1" style="padding:4px 8px;align-self:flex-end;margin-bottom:4px">✕</button>';
    container.appendChild(row);

    // Input-Events vor Propagation schützen
    row.querySelectorAll('input, select').forEach(function(inp) {
      ['keydown','keyup','keypress','input','mousedown','focus'].forEach(function(evt) {
        inp.addEventListener(evt, function(e2) { e2.stopPropagation(); }, true);
      });
    });
  }

  // ── Custom-Rezept speichern und in Fermenter laden ──
  function saveAndBrewCustomRecipe(fermId) {
    var de = currentLang === 'de';
    var nameInput = document.getElementById('ferm-recipe-name-' + fermId);
    var recipeName = nameInput ? nameInput.value.trim() : '';
    if (!recipeName) {
      alert(de ? 'Bitte einen Rezeptnamen eingeben!' : 'Please enter a recipe name!');
      return;
    }

    var container = document.getElementById('ferm-recipe-steps-' + fermId);
    var rows = container ? container.querySelectorAll('.fermenter-recipe-step-row') : [];
    if (rows.length === 0) {
      alert(de ? 'Bitte mindestens einen Schritt hinzufügen!' : 'Please add at least one step!');
      return;
    }

    var steps = [];
    rows.forEach(function(row) {
      var sName = row.querySelector('.ferm-step-name').value.trim() || 'Step';
      var sType = row.querySelector('.ferm-step-type').value;
      var sTemp = parseFloat(row.querySelector('.ferm-step-temp').value) || 18;
      var sDays = parseInt(row.querySelector('.ferm-step-days').value) || 0;

      var props = { Temp: sTemp, AutoMode: 'Yes' };
      if (sType === 'FermenterStep') {
        props.TimerD = sDays;
        props.TimerH = 0;
        props.TimerM = 0;
      }
      steps.push({ name: sName, type: sType, props: props, status: 'I' });
    });

    var saveBtn = document.querySelector('[data-ferm-save-recipe="' + fermId + '"]');
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = de ? '⏳ Wird gespeichert…' : '⏳ Saving…'; }

    // 1. Rezept erstellen
    fetch('/fermenterrecipe/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: recipeName })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var recipeId = data.id;
      // 2. Steps speichern
      return fetch('/fermenterrecipe/' + recipeId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ basic: { name: recipeName }, steps: steps })
      }).then(function() { return recipeId; });
    })
    .then(function(recipeId) {
      // 3. In den Fermenter laden
      return fetch('/fermenterrecipe/' + encodeURIComponent(recipeId) + '/' + encodeURIComponent(fermId) + '/' + encodeURIComponent(recipeName) + '/brew', { method: 'POST' });
    })
    .then(function() {
      // Re-render
      var body = document.getElementById('fermenter-body');
      if (body) {
        var card = body.querySelector('.fermenter-card');
        if (card) card.remove();
      }
      setTimeout(loadFermenterData, 500);
    })
    .catch(function(err) {
      console.error('[Fermenter] Save recipe failed:', err);
      alert(de ? 'Fehler: ' + err.message : 'Error: ' + err.message);
      if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = de ? '💾 Rezept speichern' : '💾 Save Recipe'; }
    });
  }

  // Legacy: Modal-Wrapper (falls noch irgendwo aufgerufen)
  function showFermenterDashboard() {
    window.location.hash = '#/fermenter';
  }

  function loadFermenterData() {
    var body = document.getElementById('fermenter-body');
    if (!body) { if (_fermenterRefreshInterval) { clearInterval(_fermenterRefreshInterval); _fermenterRefreshInterval = null; } return; }
    var de = currentLang === 'de';
    var isUpdate = body.querySelector('.fermenter-card') !== null;

    fetch('/fermenter/').then(function(r) { return r.json(); }).then(function(fermData) {
      var fermenters = fermData.data || [];
      var steptypes = fermData.steptypes || [];
      var types = fermData.types || [];

      if (fermenters.length === 0) {
        body.innerHTML = renderEmptyFermenter(de, types);
        return;
      }

      // Alle Sensor-IDs aus den Fermentern sammeln
      var sensorIds = [];
      fermenters.forEach(function(f) {
        if (f.sensor) sensorIds.push(f.sensor);
        if (f.pressure_sensor) sensorIds.push(f.pressure_sensor);
        // iSpindle (sensor2) aus Props
        if (f.props && f.props.sensor2) sensorIds.push(f.props.sensor2);
      });

      // Sensorwerte über die zentrale Funktion holen
      fetchSensorValues(sensorIds).then(function(sensorValueMap) {
        // Sensor-Metadaten aus /sensor/ holen (für Namen)
        fetch('/sensor/').then(function(r) { return r.json(); }).then(function(sensorData) {
          var sensorList = sensorData.data || [];
          var sensorMap = {};
          sensorList.forEach(function(s) {
            sensorMap[s.id] = { name: s.name, value: sensorValueMap[s.id] };
          });
          // Auch Sensoren ergänzen die nur Werte haben aber nicht in der Liste
          Object.keys(sensorValueMap).forEach(function(sid) {
            if (!sensorMap[sid]) sensorMap[sid] = { name: '', value: sensorValueMap[sid] };
          });

          if (isUpdate) {
            // ── In-Place Update: nur dynamische Werte aktualisieren ──
            fermenters.forEach(function(f) {
              updateFermenterCardValues(f, sensorMap, de);
            });
            // Graph nur alle 60s neu zeichnen
            var now = Date.now();
            if (now - _fermenterLastGraphDraw >= _fermenterGraphInterval) {
              _fermenterLastGraphDraw = now;
              setTimeout(function() {
                fermenters.forEach(function(f) {
                  if (f.sensor) {
                    var sensor2Id = (f.props && f.props.sensor2) ? f.props.sensor2 : '';
                    drawFermenterGraph('ferm-graph-' + f.id, f.sensor, f.pressure_sensor, sensor2Id, f.target_temp, f.target_pressure, de);
                  }
                });
              }, 50);
            }
          } else {
            // ── Erstes Rendering: komplettes HTML aufbauen ──
            var html = '';
            fermenters.forEach(function(f) {
              html += renderFermenterCard(f, sensorMap, steptypes, de);
            });
            body.innerHTML = html;
            _fermenterLastGraphDraw = Date.now();

            // Graphen initialisieren (nach kurzer Verzögerung für DOM-Rendering)
            setTimeout(function() {
              fermenters.forEach(function(f) {
                if (f.sensor) {
                  var sensor2Id = (f.props && f.props.sensor2) ? f.props.sensor2 : '';
                  drawFermenterGraph('ferm-graph-' + f.id, f.sensor, f.pressure_sensor, sensor2Id, f.target_temp, f.target_pressure, de);
                }
              });
            }, 50);
          }
        });
      });
    }).catch(function(err) {
      console.error('[Fermenter] Load failed:', err);
      if (!isUpdate) {
        body.innerHTML = '<div class="fermenter-error">' + (de ? 'Fehler beim Laden der Gärdaten' : 'Error loading fermentation data') + '</div>';
      }
    });
  }

  // ── In-Place Update für Fermenter-Karten-Werte (kein HTML-Neuaufbau) ──
  function updateFermenterCardValues(f, sensorMap, de) {
    var sensorVal = null;
    if (f.sensor && sensorMap[f.sensor]) {
      sensorVal = sensorMap[f.sensor].value !== undefined ? parseFloat(sensorMap[f.sensor].value) : null;
    }
    var pressureVal = null;
    if (f.pressure_sensor && sensorMap[f.pressure_sensor]) {
      pressureVal = parseFloat(sensorMap[f.pressure_sensor].value);
    }

    // Temperatur-Wert
    var tempEl = document.getElementById('ferm-temp-' + f.id);
    if (tempEl) tempEl.textContent = formatTemp(sensorVal);

    // Delta
    var deltaEl = document.getElementById('ferm-delta-' + f.id);
    if (deltaEl && sensorVal !== null && f.target_temp > 0) {
      var delta = sensorVal - f.target_temp;
      var deltaClass = Math.abs(delta) < 0.5 ? 'ok' : (delta > 0 ? 'warm' : 'cold');
      deltaEl.className = 'fermenter-temp-delta ' + deltaClass;
      deltaEl.textContent = 'Δ ' + (delta > 0 ? '+' : '') + delta.toFixed(1) + '°C';
    }

    // Druck
    var pressEl = document.getElementById('ferm-pressure-' + f.id);
    if (pressEl && pressureVal !== null) {
      pressEl.innerHTML = '🔵 ' + pressureVal.toFixed(2) + ' bar' +
        (f.target_pressure && f.target_pressure > 0
          ? ' <span class="fermenter-pressure-target">(' + (de ? 'Ziel' : 'Target') + ': ' + f.target_pressure.toFixed(2) + ')</span>'
          : '');
    }

    // iSpindle
    var sensor2Id = (f.props && f.props.sensor2) ? f.props.sensor2 : '';
    var s2El = document.getElementById('ferm-ispindle-' + f.id);
    if (s2El && sensor2Id && sensorMap[sensor2Id]) {
      var s2Val = parseFloat(sensorMap[sensor2Id].value);
      var s2Name = sensorMap[sensor2Id].name || 'iSpindle';
      if (!isNaN(s2Val)) {
        s2El.innerHTML = '🫧 ' + s2Name + ': <b>' + s2Val.toFixed(2) + '</b>';
      }
    }

    // Aktiver Schritt — Timer-Text aktualisieren
    var steps = f.steps || [];
    var activeStep = null;
    steps.forEach(function(s) { if (s.status === 'A') activeStep = s; });
    var timerEl = document.getElementById('ferm-timer-' + f.id);
    if (timerEl && activeStep && activeStep.state_text) {
      timerEl.textContent = '⏱ ' + activeStep.state_text;
    }
  }

  function renderEmptyFermenter(de, types) {
    return '<div class="fermenter-empty">' +
      '<div class="fermenter-empty-icon">🍶</div>' +
      '<h3>' + (de ? 'Noch keine Gärbehälter eingerichtet' : 'No fermenters configured yet') + '</h3>' +
      '<p>' + (de
        ? 'Erstelle deinen ersten Gärbehälter hier oder auf der Hardware-Seite.'
        : 'Create your first fermenter here or on the Hardware page.'
      ) + '</p>' +
      '<button class="fermenter-setup-btn" id="fermenter-create-btn">➕ ' +
        (de ? 'Gärbehälter erstellen' : 'Create Fermenter') +
      '</button>' +
    '</div>';
  }

  function showCreateFermenterForm() {
    var body = document.getElementById('fermenter-body');
    if (!body) return;
    var de = currentLang === 'de';

    // Hardware-Daten laden für die Dropdowns
    Promise.all([
      fetch('/sensor/').then(function(r) { return r.json(); }),
      fetch('/actor/').then(function(r) { return r.json(); }),
      fetch('/fermenter/').then(function(r) { return r.json(); })
    ]).then(function(results) {
      var sensors = (results[0].data || results[0] || []);
      var actors = (results[1].data || results[1] || []);
      var fermTypes = results[2].types || {};

      var sensorOpts = '<option value="">— ' + (de ? 'Kein Sensor' : 'No sensor') + ' —</option>';
      sensors.forEach(function(s) {
        sensorOpts += '<option value="' + s.id + '">' + s.name + '</option>';
      });

      var actorOpts = '<option value="">— ' + (de ? 'Keiner' : 'None') + ' —</option>';
      actors.forEach(function(a) {
        actorOpts += '<option value="' + a.id + '">' + a.name + '</option>';
      });

      var typeOpts = '';
      var typeNames = Object.keys(fermTypes);
      typeNames.forEach(function(t) {
        typeOpts += '<option value="' + t + '">' + t + '</option>';
      });

      var html =
        '<div class="fermenter-create-form">' +
          '<h3>➕ ' + (de ? 'Neuen Gärbehälter erstellen' : 'Create New Fermenter') + '</h3>' +
          '<div class="fermenter-form-grid">' +
            '<div class="fermenter-form-field">' +
              '<label>' + (de ? 'Name' : 'Name') + ' *</label>' +
              '<div id="ferm-name-slot"></div>' +
            '</div>' +
            '<div class="fermenter-form-field">' +
              '<label>' + (de ? 'Logik-Typ' : 'Logic Type') + ' *</label>' +
              '<select id="ferm-new-type" class="fermenter-input">' + typeOpts + '</select>' +
            '</div>' +
            '<div class="fermenter-form-field">' +
              '<label>' + (de ? 'Temperatursensor' : 'Temperature Sensor') + ' *</label>' +
              '<select id="ferm-new-sensor" class="fermenter-input">' + sensorOpts + '</select>' +
            '</div>' +
            '<div class="fermenter-form-field">' +
              '<label>' + (de ? 'Drucksensor' : 'Pressure Sensor') + '</label>' +
              '<select id="ferm-new-pressure" class="fermenter-input">' + sensorOpts + '</select>' +
            '</div>' +
            '<div class="fermenter-form-field">' +
              '<label>' + (de ? 'Heizung' : 'Heater') + '</label>' +
              '<select id="ferm-new-heater" class="fermenter-input">' + actorOpts + '</select>' +
            '</div>' +
            '<div class="fermenter-form-field">' +
              '<label>' + (de ? 'Kühlung' : 'Cooler') + '</label>' +
              '<select id="ferm-new-cooler" class="fermenter-input">' + actorOpts + '</select>' +
            '</div>' +
            '<div class="fermenter-form-field">' +
              '<label>' + (de ? 'Ventil (Spunding)' : 'Valve (Spunding)') + '</label>' +
              '<select id="ferm-new-valve" class="fermenter-input">' + actorOpts + '</select>' +
            '</div>' +
            '<div class="fermenter-form-field">' +
              '<label>' + (de ? 'Zieltemperatur (°C)' : 'Target Temp (°C)') + '</label>' +
              '<input type="number" id="ferm-new-target" class="fermenter-input" value="18" step="0.5" min="0" max="40">' +
            '</div>' +
          '</div>' +
          '<div class="fermenter-form-actions">' +
            '<button class="fermenter-ctrl-btn" id="ferm-create-cancel">' + (de ? 'Abbrechen' : 'Cancel') + '</button>' +
            '<button class="fermenter-ctrl-btn start" id="ferm-create-submit">✅ ' + (de ? 'Erstellen' : 'Create') + '</button>' +
          '</div>' +
        '</div>';

      _isOurDomChange = true;
      body.innerHTML = html;

      // Name-Input programmatisch erstellen (vermeidet innerHTML-/backdrop-filter-Bugs)
      var nameSlot = document.getElementById('ferm-name-slot');
      if (nameSlot) {
        var nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = 'ferm-new-name';
        nameInput.className = 'fermenter-input';
        nameInput.placeholder = de ? 'z.B. Gärfass 1' : 'e.g. Fermenter 1';
        nameInput.autocomplete = 'off';
        nameInput.setAttribute('tabindex', '1');
        nameSlot.appendChild(nameInput);
      }
      _isOurDomChange = false;

      // Input-Felder vor Event-Interference schützen
      var formInputs = body.querySelectorAll('input, select');
      formInputs.forEach(function(inp) {
        ['keydown','keyup','keypress','input','mousedown','focus'].forEach(function(evt) {
          inp.addEventListener(evt, function(e) { e.stopPropagation(); }, true); // Capture-Phase
          inp.addEventListener(evt, function(e) { e.stopPropagation(); });       // Bubble-Phase
        });
      });

      // Auto-Focus auf Name-Feld
      setTimeout(function() {
        var ni = document.getElementById('ferm-new-name');
        if (ni) ni.focus();
      }, 100);

      document.getElementById('ferm-create-cancel').addEventListener('click', function() {
        loadFermenterData();
      });
      document.getElementById('ferm-create-submit').addEventListener('click', function() {
        submitCreateFermenter();
      });
    });
  }

  function submitCreateFermenter() {
    var de = currentLang === 'de';
    var name = (document.getElementById('ferm-new-name').value || '').trim();
    var type = document.getElementById('ferm-new-type').value;
    var sensor = document.getElementById('ferm-new-sensor').value;

    if (!name) { alert(de ? 'Bitte einen Namen eingeben!' : 'Please enter a name!'); return; }
    if (!type) { alert(de ? 'Bitte einen Logik-Typ wählen!' : 'Please select a logic type!'); return; }
    if (!sensor) { alert(de ? 'Bitte einen Temperatursensor wählen!' : 'Please select a temperature sensor!'); return; }

    var btn = document.getElementById('ferm-create-submit');
    if (btn) { btn.disabled = true; btn.textContent = de ? '⏳ Wird erstellt…' : '⏳ Creating…'; }

    var payload = {
      name: name,
      type: type,
      sensor: sensor,
      pressure_sensor: document.getElementById('ferm-new-pressure').value || '',
      heater: document.getElementById('ferm-new-heater').value || '',
      cooler: document.getElementById('ferm-new-cooler').value || '',
      valve: document.getElementById('ferm-new-valve').value || '',
      target_temp: parseFloat(document.getElementById('ferm-new-target').value) || 18,
      target_pressure: 0,
      brewname: '',
      props: {}
    };

    fetch('/fermenter/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function() {
      setTimeout(loadFermenterData, 500);
    })
    .catch(function(err) {
      console.error('[Fermenter] Create failed:', err);
      alert(de ? 'Fehler beim Erstellen: ' + err.message : 'Error creating: ' + err.message);
      if (btn) { btn.disabled = false; btn.textContent = de ? '✅ Erstellen' : '✅ Create'; }
    });
  }

  // ============================================================
  // GÄRUNGS-GRAPH — Temperatur + Druck + iSpindle über Canvas
  // ============================================================
  function drawFermenterGraph(canvasId, sensorId, pressureSensorId, sensor2Id, targetTemp, targetPressure, de) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width = canvas.parentElement.offsetWidth || 800;
    var H = canvas.height = 400;

    // Lade alle relevanten Sensor-Logs parallel
    var fetches = [fetch('/log/' + encodeURIComponent(sensorId)).then(function(r) { return r.json(); })];
    var hasPressure = pressureSensorId && pressureSensorId !== sensorId;
    var hasSensor2 = sensor2Id && sensor2Id !== sensorId && sensor2Id !== pressureSensorId;
    if (hasPressure) fetches.push(fetch('/log/' + encodeURIComponent(pressureSensorId)).then(function(r) { return r.json(); }));
    if (hasSensor2) fetches.push(fetch('/log/' + encodeURIComponent(sensor2Id)).then(function(r) { return r.json(); }));

    Promise.all(fetches).then(function(results) {
      var tempData = results[0];
      var pressureData = hasPressure ? results[hasPressure ? 1 : -1] : null;
      var sensor2Data = hasSensor2 ? results[fetches.length - 1] : null;

      var times = tempData.time || [];
      var tempVals = tempData[sensorId] || [];
      if (times.length === 0) {
        ctx.fillStyle = '#888';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(de ? 'Noch keine Messdaten vorhanden' : 'No data yet', W / 2, H / 2);
        return;
      }

      // Daten auf maximal 500 Punkte ausdünnen
      var step = Math.max(1, Math.floor(times.length / 500));
      var t = [], vTemp = [];
      for (var i = 0; i < times.length; i += step) {
        t.push(times[i]);
        vTemp.push(parseFloat(tempVals[i]));
      }

      // Druck-Daten synchronisieren (wenn vorhanden)
      var vPressure = [];
      if (pressureData) {
        var pTimes = pressureData.time || [];
        var pVals = pressureData[pressureSensorId] || [];
        var pStep = Math.max(1, Math.floor(pTimes.length / 500));
        for (var pi = 0; pi < pTimes.length; pi += pStep) {
          vPressure.push(parseFloat(pVals[pi]));
        }
      }

      // Sensor2 (iSpindle) Daten
      var vSensor2 = [];
      if (sensor2Data) {
        var s2Vals = sensor2Data[sensor2Id] || [];
        var s2Step = Math.max(1, Math.floor(s2Vals.length / 500));
        for (var si = 0; si < s2Vals.length; si += s2Step) {
          vSensor2.push(parseFloat(s2Vals[si]));
        }
      }

      // Temperatur Min/Max
      var minT = Math.min.apply(null, vTemp);
      var maxT = Math.max.apply(null, vTemp);
      if (targetTemp) {
        minT = Math.min(minT, targetTemp - 1);
        maxT = Math.max(maxT, targetTemp + 1);
      }
      var rangeT = maxT - minT || 1;
      minT -= rangeT * 0.1;
      maxT += rangeT * 0.1;
      rangeT = maxT - minT;

      // Druck Min/Max (rechte Y-Achse)
      var minP = 0, maxP = 1, rangeP = 1;
      var showPressure = vPressure.length > 0;
      if (showPressure) {
        minP = Math.min.apply(null, vPressure);
        maxP = Math.max.apply(null, vPressure);
        if (targetPressure) {
          minP = Math.min(minP, targetPressure * 0.8);
          maxP = Math.max(maxP, targetPressure * 1.2);
        }
        rangeP = maxP - minP || 1;
        minP -= rangeP * 0.1;
        maxP += rangeP * 0.1;
        if (minP < 0) minP = 0;
        rangeP = maxP - minP;
      }

      // iSpindle Min/Max  
      var minS2 = 0, maxS2 = 1, rangeS2 = 1;
      var showSensor2 = vSensor2.length > 0;
      if (showSensor2) {
        minS2 = Math.min.apply(null, vSensor2);
        maxS2 = Math.max.apply(null, vSensor2);
        rangeS2 = maxS2 - minS2 || 1;
        minS2 -= rangeS2 * 0.1;
        maxS2 += rangeS2 * 0.1;
        rangeS2 = maxS2 - minS2;
      }

      var padL = 50, padR = (showPressure || showSensor2) ? 55 : 15, padT = 28, padB = 35;
      // Wenn sowohl Druck als auch iSpindel: rechts mehr Platz für zwei Achsen
      if (showPressure && showSensor2) padR = 100;
      var gW = W - padL - padR;
      var gH = H - padT - padB;

      // Hintergrund
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, W, H);

      // Gitternetzlinien + Temperatur-Y-Achse (links)
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      var gridSteps = 5;
      for (var g = 0; g <= gridSteps; g++) {
        var gy = padT + (gH / gridSteps) * g;
        ctx.beginPath();
        ctx.moveTo(padL, gy);
        ctx.lineTo(W - padR, gy);
        ctx.stroke();
        var gVal = maxT - (rangeT / gridSteps) * g;
        ctx.fillStyle = '#ff9800';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(gVal.toFixed(1) + '°', padL - 6, gy + 4);
      }

      // Druck-Y-Achse (rechts)
      if (showPressure) {
        var pressAxisX = W - padR + 6;
        for (var gp = 0; gp <= gridSteps; gp++) {
          var gpy = padT + (gH / gridSteps) * gp;
          var gpVal = maxP - (rangeP / gridSteps) * gp;
          ctx.fillStyle = '#42a5f5';
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(gpVal.toFixed(1), pressAxisX, gpy + 4);
        }
        // Rechte Achsen-Beschriftung
        ctx.save();
        ctx.translate(pressAxisX + 30, padT + gH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = '#42a5f5';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('bar', 0, 0);
        ctx.restore();
      }

      // iSpindel-Y-Achse (rechts, neben Druck oder alleine)
      if (showSensor2) {
        var s2AxisX = showPressure ? (W - padR + 52) : (W - padR + 6);
        for (var gs2 = 0; gs2 <= gridSteps; gs2++) {
          var gs2y = padT + (gH / gridSteps) * gs2;
          var gs2Val = maxS2 - (rangeS2 / gridSteps) * gs2;
          ctx.fillStyle = '#ab47bc';
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(gs2Val.toFixed(1), s2AxisX, gs2y + 4);
        }
        // Achsen-Beschriftung
        ctx.save();
        ctx.translate(s2AxisX + 30, padT + gH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = '#ab47bc';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('°P', 0, 0);
        ctx.restore();
      }

      // Zieltemperatur-Linie
      if (targetTemp && targetTemp >= minT && targetTemp <= maxT) {
        var tY = padT + gH - ((targetTemp - minT) / rangeT) * gH;
        ctx.strokeStyle = '#4caf50';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(padL, tY);
        ctx.lineTo(W - padR, tY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#4caf50';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText((de ? 'Ziel' : 'Target') + ' ' + targetTemp + '°C', padL + 4, tY - 5);
      }

      // Zieldruck-Linie
      if (showPressure && targetPressure && targetPressure > 0 && targetPressure >= minP && targetPressure <= maxP) {
        var pTY = padT + gH - ((targetPressure - minP) / rangeP) * gH;
        ctx.strokeStyle = '#42a5f5';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(padL, pTY);
        ctx.lineTo(W - padR, pTY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#42a5f5';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText((de ? 'Ziel' : 'Target') + ' ' + targetPressure + ' bar', W - padR - 4, pTY - 5);
      }

      // --- Temperatur-Gradient + Kurve ---
      var gradient = ctx.createLinearGradient(0, padT, 0, H - padB);
      gradient.addColorStop(0, 'rgba(255,152,0,0.25)');
      gradient.addColorStop(1, 'rgba(255,152,0,0.02)');

      // Füllung
      ctx.beginPath();
      for (var p = 0; p < vTemp.length; p++) {
        var px = padL + (p / (vTemp.length - 1)) * gW;
        var py = padT + gH - ((vTemp[p] - minT) / rangeT) * gH;
        if (p === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.lineTo(padL + gW, padT + gH);
      ctx.lineTo(padL, padT + gH);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Linie
      ctx.beginPath();
      for (var p2 = 0; p2 < vTemp.length; p2++) {
        var px2 = padL + (p2 / (vTemp.length - 1)) * gW;
        var py2 = padT + gH - ((vTemp[p2] - minT) / rangeT) * gH;
        if (p2 === 0) ctx.moveTo(px2, py2);
        else ctx.lineTo(px2, py2);
      }
      ctx.strokeStyle = '#ff9800';
      ctx.lineWidth = 2;
      ctx.stroke();

      // --- Druck-Kurve (blau, rechte Y-Achse) ---
      if (showPressure) {
        ctx.beginPath();
        for (var dp = 0; dp < vPressure.length; dp++) {
          var dpx = padL + (dp / (vPressure.length - 1)) * gW;
          var dpy = padT + gH - ((vPressure[dp] - minP) / rangeP) * gH;
          if (dp === 0) ctx.moveTo(dpx, dpy);
          else ctx.lineTo(dpx, dpy);
        }
        ctx.strokeStyle = '#42a5f5';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // --- iSpindle-Kurve (lila, eigene Y-Skala) ---
      if (showSensor2) {
        // Gradient-Füllung
        var s2Gradient = ctx.createLinearGradient(0, padT, 0, H - padB);
        s2Gradient.addColorStop(0, 'rgba(171,71,188,0.15)');
        s2Gradient.addColorStop(1, 'rgba(171,71,188,0.02)');
        ctx.beginPath();
        for (var s2f = 0; s2f < vSensor2.length; s2f++) {
          var s2fx = padL + (s2f / (vSensor2.length - 1)) * gW;
          var s2fy = padT + gH - ((vSensor2[s2f] - minS2) / rangeS2) * gH;
          if (s2f === 0) ctx.moveTo(s2fx, s2fy);
          else ctx.lineTo(s2fx, s2fy);
        }
        ctx.lineTo(padL + gW, padT + gH);
        ctx.lineTo(padL, padT + gH);
        ctx.closePath();
        ctx.fillStyle = s2Gradient;
        ctx.fill();

        // Linie
        ctx.beginPath();
        for (var s2 = 0; s2 < vSensor2.length; s2++) {
          var s2x = padL + (s2 / (vSensor2.length - 1)) * gW;
          var s2y = padT + gH - ((vSensor2[s2] - minS2) / rangeS2) * gH;
          if (s2 === 0) ctx.moveTo(s2x, s2y);
          else ctx.lineTo(s2x, s2y);
        }
        ctx.strokeStyle = '#ab47bc';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // X-Achse Zeitlabels
      ctx.fillStyle = '#888';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      var labelCount = Math.min(6, t.length);
      for (var lbl = 0; lbl < labelCount; lbl++) {
        var li = Math.floor((lbl / (labelCount - 1)) * (t.length - 1));
        var lx = padL + (li / (t.length - 1)) * gW;
        var ts = t[li] || '';
        var tsParts = ts.split(' ');
        var timeStr = tsParts[1] ? tsParts[1].substring(0, 5) : ts;
        if (lbl === 0 || lbl === labelCount - 1) {
          var datePart = tsParts[0] ? tsParts[0].substring(5) : '';
          if (datePart) timeStr = datePart + '\n' + timeStr;
        }
        ctx.fillText(timeStr, lx, H - padB + 14);
      }

      // Titel
      ctx.fillStyle = '#ccc';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      var graphTitle = showSensor2
        ? (de ? 'Gärverlauf' : 'Fermentation Progress')
        : (de ? 'Temperaturverlauf' : 'Temperature History');
      ctx.fillText(graphTitle, padL, 15);

      // Aktueller Temp-Wert
      var legendX = W - padR;
      if (vTemp.length > 0) {
        var lastT = vTemp[vTemp.length - 1];
        ctx.fillStyle = '#ff9800';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(lastT.toFixed(1) + '°C', legendX, 15);
      }

      // Legende
      var legY = 15;
      var legX = padL + 120;
      if (showSensor2 && vSensor2.length > 0) {
        var lastS2 = vSensor2[vSensor2.length - 1];
        ctx.fillStyle = '#ab47bc';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('● ' + (de ? 'Stammwürze' : 'Gravity') + ': ' + lastS2.toFixed(1) + '°P', legX, legY);
        legX += 170;
      }
      if (showPressure && vPressure.length > 0) {
        var lastP = vPressure[vPressure.length - 1];
        ctx.fillStyle = '#42a5f5';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('● ' + (de ? 'Druck' : 'Pressure') + ': ' + lastP.toFixed(2) + ' bar', legX, legY);
      }
    }).catch(function(err) {
      console.error('[Fermenter Graph] Load failed:', err);
      ctx.fillStyle = '#888';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(de ? 'Graph konnte nicht geladen werden' : 'Failed to load graph', W / 2, H / 2);
    });
  }

  function renderFermenterCard(f, sensorMap, steptypes, de) {
    var sensorVal = null;
    var sensorName = '';
    if (f.sensor && sensorMap[f.sensor]) {
      var s = sensorMap[f.sensor];
      sensorVal = s.value !== undefined ? parseFloat(s.value) : null;
      sensorName = s.name || '';
    }
    var pressureVal = null;
    if (f.pressure_sensor && sensorMap[f.pressure_sensor]) {
      pressureVal = parseFloat(sensorMap[f.pressure_sensor].value);
    }

    var steps = f.steps || [];
    var activeStep = null;
    var activeIdx = -1;
    steps.forEach(function(s, i) { if (s.status === 'A') { activeStep = s; activeIdx = i; } });

    var isRunning = activeStep !== null;
    var stateClass = isRunning ? 'active' : (steps.length > 0 ? 'ready' : 'idle');

    var html = '<div class="fermenter-card ' + stateClass + '">';

    // Header
    html += '<div class="fermenter-card-header">';
    html += '<div class="fermenter-card-title">';
    html += '<span class="fermenter-status-dot ' + stateClass + '"></span>';
    html += '<h3>' + (f.name || 'Fermenter') + '</h3>';
    if (f.brewname) html += '<span class="fermenter-brewname">' + f.brewname + '</span>';
    html += '</div>';
    html += '<div class="fermenter-card-type">' + (f.type || '—') + '</div>';
    html += '</div>';

    // Hauptbereich: Temperatur + Steuerung
    html += '<div class="fermenter-grid">';

    // Temperatur-Karte
    html += '<div class="fermenter-temp-section">';
    html += '<div class="fermenter-temp-big" id="ferm-temp-' + f.id + '">' + formatTemp(sensorVal) + '</div>';
    if (sensorName) html += '<div class="fermenter-temp-label">' + sensorName + '</div>';
    if (f.target_temp && f.target_temp > 0) {
      html += '<div class="fermenter-temp-target">' + (de ? 'Ziel' : 'Target') + ': <b>' + f.target_temp.toFixed(1) + '°C</b></div>';
      if (sensorVal !== null) {
        var delta = sensorVal - f.target_temp;
        var deltaClass = Math.abs(delta) < 0.5 ? 'ok' : (delta > 0 ? 'warm' : 'cold');
        html += '<div class="fermenter-temp-delta ' + deltaClass + '" id="ferm-delta-' + f.id + '">Δ ' + (delta > 0 ? '+' : '') + delta.toFixed(1) + '°C</div>';
      }
    }
    if (pressureVal !== null) {
      html += '<div class="fermenter-pressure" id="ferm-pressure-' + f.id + '">🔵 ' + pressureVal.toFixed(2) + ' bar';
      if (f.target_pressure && f.target_pressure > 0) {
        html += ' <span class="fermenter-pressure-target">(' + (de ? 'Ziel' : 'Target') + ': ' + f.target_pressure.toFixed(2) + ')</span>';
      }
      html += '</div>';
    }
    // iSpindle (sensor2) Messwert
    var sensor2Id = (f.props && f.props.sensor2) ? f.props.sensor2 : '';
    if (sensor2Id && sensorMap[sensor2Id]) {
      var s2Val = parseFloat(sensorMap[sensor2Id].value);
      var s2Name = sensorMap[sensor2Id].name || 'iSpindle';
      if (!isNaN(s2Val)) {
        html += '<div class="fermenter-ispindle" id="ferm-ispindle-' + f.id + '" style="color:#ab47bc;font-size:0.85rem;margin-top:4px">🫧 ' + s2Name + ': <b>' + s2Val.toFixed(2) + '</b></div>';
      }
    }
    html += '</div>';

    // Aktiver Schritt
    html += '<div class="fermenter-step-section">';
    if (activeStep) {
      html += '<div class="fermenter-step-active">';
      html += '<div class="fermenter-step-label">' + (de ? 'Aktueller Schritt' : 'Current Step') + '</div>';
      html += '<div class="fermenter-step-name">' + (activeStep.name || 'Step') + '</div>';
      if (activeStep.props && activeStep.props.Temp) {
        html += '<div class="fermenter-step-detail">' + (de ? 'Ziel' : 'Target') + ': ' + activeStep.props.Temp + '°C</div>';
      }
      if (activeStep.state_text) {
        html += '<div class="fermenter-step-timer" id="ferm-timer-' + f.id + '">⏱ ' + activeStep.state_text + '</div>';
      }
      if (activeIdx < steps.length - 1) {
        var nextStep = steps[activeIdx + 1];
        html += '<div class="fermenter-step-next">→ ' + (de ? 'Nächster' : 'Next') + ': ' + (nextStep.name || 'Step') + '</div>';
      }
      html += '</div>';
    } else if (steps.length > 0) {
      html += '<div class="fermenter-step-ready">';
      html += '<div class="fermenter-step-label">' + (de ? 'Gärplan' : 'Fermentation Plan') + '</div>';
      html += '<div class="fermenter-step-count">' + steps.length + ' ' + (de ? 'Schritte bereit' : 'steps ready') + '</div>';
      html += '</div>';
    } else {
      html += '<div class="fermenter-step-empty">';
      html += '<div class="fermenter-step-label">' + (de ? 'Kein Gärplan' : 'No plan') + '</div>';
      html += '<p>' + (de ? 'Lade ein Gärrezept' : 'Load a fermentation recipe') + '</p>';
      html += '</div>';
    }
    html += '</div>';

    html += '</div>'; // /fermenter-grid

    // Temperaturverlauf-Graph
    if (f.sensor) {
      html += '<div class="fermenter-graph-section">';
      html += '<canvas id="ferm-graph-' + f.id + '" class="fermenter-graph-canvas"></canvas>';
      html += '</div>';
    }

    // Steuerungs-Buttons
    html += '<div class="fermenter-controls">';
    if (isRunning) {
      html += '<button class="fermenter-ctrl-btn next" data-ferm-action="nextstep" data-ferm-id="' + f.id + '">⏭ ' + (de ? 'Weiter' : 'Next') + '</button>';
      html += '<button class="fermenter-ctrl-btn stop" data-ferm-action="stopstep" data-ferm-id="' + f.id + '">⏹ ' + (de ? 'Stop' : 'Stop') + '</button>';
    } else if (steps.length > 0) {
      html += '<button class="fermenter-ctrl-btn start" data-ferm-action="startstep" data-ferm-id="' + f.id + '">▶ ' + (de ? 'Start' : 'Start') + '</button>';
      html += '<button class="fermenter-ctrl-btn reset" data-ferm-action="reset" data-ferm-id="' + f.id + '">🔄 ' + (de ? 'Reset' : 'Reset') + '</button>';
    }
    // Zieltemperatur setzen
    html += '<div class="fermenter-target-input">';
    html += '<input type="number" step="0.5" min="0" max="40" id="ferm-target-' + f.id + '" class="fermenter-temp-input" value="' + (f.target_temp || 18) + '" placeholder="°C">';
    html += '<button class="fermenter-ctrl-btn target" data-ferm-action="target_temp" data-ferm-id="' + f.id + '">🎯 ' + (de ? 'Ziel setzen' : 'Set Target') + '</button>';
    html += '</div>';
    // Rezept laden
    html += '<button class="fermenter-ctrl-btn recipe" data-ferm-recipe-toggle="' + f.id + '">📖 ' + (de ? 'Gärrezept laden' : 'Load Recipe') + '</button>';
    html += '</div>';

    // Rezeptauswahl (eingeklappt)
    html += '<div class="fermenter-recipe-panel collapsed" id="ferm-recipes-' + f.id + '">';
    html += '<div class="fermenter-recipe-list" id="ferm-recipe-list-' + f.id + '">';
    html += '<div class="fermenter-loading">' + (de ? 'Rezepte werden geladen…' : 'Loading recipes…') + '</div>';
    html += '</div></div>';

    // Schrittliste
    if (steps.length > 0) {
      html += '<div class="fermenter-steps-list">';
      html += '<div class="fermenter-steps-title">' + (de ? 'Gärschritte' : 'Fermentation Steps') + '</div>';
      steps.forEach(function(s, i) {
        var statusIcon = s.status === 'D' ? '✅' : (s.status === 'A' ? '🔄' : '⬜');
        var statusClass = s.status === 'D' ? 'done' : (s.status === 'A' ? 'active' : 'pending');
        html += '<div class="fermenter-step-row ' + statusClass + '">';
        html += '<span class="fermenter-step-idx">' + statusIcon + '</span>';
        html += '<span class="fermenter-step-row-name">' + (s.name || (de ? 'Schritt ' : 'Step ') + (i + 1)) + '</span>';
        if (s.props && s.props.Temp) html += '<span class="fermenter-step-row-temp">' + s.props.Temp + '°C</span>';
        if (s.props && (s.props.TimerD || s.props.TimerH || s.props.TimerM)) {
          var parts = [];
          if (s.props.TimerD && parseInt(s.props.TimerD) > 0) parts.push(s.props.TimerD + 'd');
          if (s.props.TimerH && parseInt(s.props.TimerH) > 0) parts.push(s.props.TimerH + 'h');
          if (s.props.TimerM && parseInt(s.props.TimerM) > 0) parts.push(s.props.TimerM + 'm');
          if (parts.length) html += '<span class="fermenter-step-row-time">' + parts.join(' ') + '</span>';
        }
        if (s.state_text) html += '<span class="fermenter-step-row-state">' + s.state_text + '</span>';
        html += '</div>';
      });
      html += '</div>';
    }

    html += '</div>'; // /fermenter-card
    return html;
  }

  // ── Vorgefertigte Gärprofile ──
  var FERMENTATION_PROFILES = [
    {
      name: { de: 'Ale Standard (obergärig)', en: 'Ale Standard (top-fermenting)' },
      steps: [
        { name: { de: 'Hauptgärung', en: 'Primary' }, type: 'FermenterStep', props: { Temp: 18, TimerD: 7, AutoMode: 'Yes' } },
        { name: { de: 'Diacetyl-Rast', en: 'Diacetyl Rest' }, type: 'FermenterStep', props: { Temp: 20, TimerD: 2, AutoMode: 'Yes' } },
        { name: { de: 'Cold Crash', en: 'Cold Crash' }, type: 'FermenterStep', props: { Temp: 4, TimerD: 2, AutoMode: 'Yes' } }
      ]
    },
    {
      name: { de: 'Lager / Pils (untergärig)', en: 'Lager / Pilsner (bottom-fermenting)' },
      steps: [
        { name: { de: 'Hauptgärung', en: 'Primary' }, type: 'FermenterStep', props: { Temp: 10, TimerD: 10, AutoMode: 'Yes' } },
        { name: { de: 'Diacetyl-Rast', en: 'Diacetyl Rest' }, type: 'FermenterStep', props: { Temp: 16, TimerD: 2, AutoMode: 'Yes' } },
        { name: { de: 'Nachgärung', en: 'Secondary' }, type: 'FermenterStep', props: { Temp: 4, TimerD: 14, AutoMode: 'Yes' } },
        { name: { de: 'Cold Crash', en: 'Cold Crash' }, type: 'FermenterStep', props: { Temp: 1, TimerD: 3, AutoMode: 'Yes' } }
      ]
    },
    {
      name: { de: 'Weizenbier', en: 'Wheat Beer' },
      steps: [
        { name: { de: 'Hauptgärung', en: 'Primary' }, type: 'FermenterStep', props: { Temp: 20, TimerD: 5, AutoMode: 'Yes' } },
        { name: { de: 'Nachgärung', en: 'Secondary' }, type: 'FermenterStep', props: { Temp: 20, TimerD: 3, AutoMode: 'Yes' } },
        { name: { de: 'Cold Crash', en: 'Cold Crash' }, type: 'FermenterStep', props: { Temp: 4, TimerD: 2, AutoMode: 'Yes' } }
      ]
    },
    {
      name: { de: 'Kveik (warmgärig)', en: 'Kveik (warm fermenting)' },
      steps: [
        { name: { de: 'Hauptgärung', en: 'Primary' }, type: 'FermenterStep', props: { Temp: 35, TimerD: 4, AutoMode: 'Yes' } },
        { name: { de: 'Cold Crash', en: 'Cold Crash' }, type: 'FermenterStep', props: { Temp: 4, TimerD: 2, AutoMode: 'Yes' } }
      ]
    }
  ];

  function loadFermenterRecipes(fermId) {
    var listEl = document.getElementById('ferm-recipe-list-' + fermId);
    if (!listEl) return;
    var de = currentLang === 'de';
    fetch('/fermenterrecipe/')
      .then(function(r) { return r.json(); })
      .then(function(recipes) {
        if (!Array.isArray(recipes)) recipes = [];
        var html = '';

        // Vorhandene Rezepte anzeigen
        if (recipes.length > 0) {
          html += '<div class="fermenter-recipe-section-title">' + (de ? '📖 Gespeicherte Rezepte' : '📖 Saved Recipes') + '</div>';
          recipes.forEach(function(r) {
            html += '<div class="fermenter-recipe-item">';
            html += '<span class="fermenter-recipe-name">' + (r.name || r.file || '?') + '</span>';
            html += '<div class="fermenter-recipe-actions">';
            html += '<button class="fermenter-recipe-brew-btn" data-ferm-brew="' + fermId + '" data-ferm-recipe="' + (r.file || r.name || '') + '" data-ferm-recipe-name="' + (r.name || '') + '">▶ ' + (de ? 'Laden' : 'Load') + '</button>';
            html += '<button class="fermenter-recipe-del-btn" data-ferm-recipe-delete="' + (r.file || '') + '" data-ferm-recipe-name="' + (r.name || '') + '">🗑</button>';
            html += '</div>';
            html += '</div>';
          });
        }

        // Vorlagen-Bereich
        html += '<div class="fermenter-recipe-section-title" style="margin-top:12px">' + (de ? '⚡ Schnellrezept aus Vorlage' : '⚡ Quick Recipe from Template') + '</div>';
        html += '<div class="fermenter-profile-grid">';
        FERMENTATION_PROFILES.forEach(function(profile, idx) {
          var pName = de ? profile.name.de : profile.name.en;
          var stepSummary = profile.steps.map(function(s) {
            var sn = de ? s.name.de : s.name.en;
            return sn + ' ' + s.props.Temp + '°C / ' + (s.props.TimerD || 0) + (de ? 'T' : 'd');
          }).join(' → ');
          html += '<div class="fermenter-profile-card" data-ferm-profile="' + idx + '" data-ferm-profile-target="' + fermId + '">';
          html += '<div class="fermenter-profile-name">' + pName + '</div>';
          html += '<div class="fermenter-profile-steps">' + stepSummary + '</div>';
          html += '</div>';
        });
        html += '</div>';

        // Eigenes Rezept erstellen
        html += '<div class="fermenter-recipe-section-title" style="margin-top:12px">' + (de ? '✏️ Eigenes Rezept erstellen' : '✏️ Create Custom Recipe') + '</div>';
        html += '<div class="fermenter-custom-recipe" id="ferm-custom-recipe-' + fermId + '">';
        html += '<div class="fermenter-form-field" style="margin-bottom:8px">';
        html += '<label>' + (de ? 'Rezeptname' : 'Recipe Name') + '</label>';
        html += '<input type="text" class="fermenter-input" id="ferm-recipe-name-' + fermId + '" placeholder="' + (de ? 'z.B. Mein IPA Gärplan' : 'e.g. My IPA Fermentation') + '">';
        html += '</div>';
        html += '<div id="ferm-recipe-steps-' + fermId + '" class="fermenter-recipe-step-list"></div>';
        html += '<button class="fermenter-ctrl-btn" data-ferm-add-step="' + fermId + '">➕ ' + (de ? 'Schritt hinzufügen' : 'Add Step') + '</button>';
        html += ' <button class="fermenter-ctrl-btn start" data-ferm-save-recipe="' + fermId + '" style="margin-left:8px">💾 ' + (de ? 'Rezept speichern' : 'Save Recipe') + '</button>';
        html += '</div>';

        listEl.innerHTML = html;
      })
      .catch(function() {
        listEl.innerHTML = '<div class="fermenter-recipe-empty">' + (de ? 'Fehler beim Laden' : 'Error loading') + '</div>';
      });
  }

  // ============================================================
  // HILFE- & DOKUMENTATIONSSEITE
  // ============================================================

  function buildHelpPage() {
    var hash = window.location.hash.replace('#', '');
    if (hash !== '/help') {
      stopHelpPage();
      return;
    }
    if (document.getElementById('cbpi-help-page')) return;

    var target = findContentTarget();
    if (!target) return;

    var de = currentLang === 'de';
    _isOurDomChange = true;

    var origChildren = target.children;
    for (var c = 0; c < origChildren.length; c++) {
      if (origChildren[c].id !== 'cbpi-page-title' && origChildren[c].id !== 'cbpi-help-banner' && origChildren[c].id !== 'cbpi-help-page') {
        origChildren[c].style.display = 'none';
      }
    }

    var container = document.createElement('div');
    container.id = 'cbpi-help-page';

    container.innerHTML = de ? buildHelpContentDE() : buildHelpContentEN();
    target.appendChild(container);

    // Akkordeon-Klicks
    container.addEventListener('click', function(e) {
      var header = e.target.closest('.help-section-header');
      if (header) {
        var section = header.parentElement;
        section.classList.toggle('open');
      }
    });

    _isOurDomChange = false;
  }

  function stopHelpPage() {
    var page = document.getElementById('cbpi-help-page');
    if (page) {
      var parent = page.parentNode;
      if (parent) {
        _isOurDomChange = true;
        var children = parent.children;
        for (var i = 0; i < children.length; i++) {
          if (children[i].style && children[i].style.display === 'none') children[i].style.display = '';
        }
        parent.removeChild(page);
        _isOurDomChange = false;
      }
    }
  }

  function buildHelpContentDE() {
    return '<div class="help-container">' +

    '<div class="help-intro">' +
      '<h2>📖 CraftBeerPi 4 — Hilfe & Nachschlagewerk</h2>' +
      '<p>Hier findest du Erklärungen zu allen Funktionen. Klicke auf einen Bereich, um ihn aufzuklappen.</p>' +
    '</div>' +

    // ── Schnellstart ──
    helpSection('🚀', 'Schnellstart — Dein erstes Bier brauen', true,
      '<ol class="help-steps">' +
        '<li><b>Hardware einrichten</b> → Menü „Hardware"<br>' +
          'Sensor anlegen (OneWire/DS18B20), Aktor anlegen (GPIOActor für Heizung/Rührwerk), ' +
          'Kessel anlegen (Sensor + Heizung + Rührwerk verknüpfen)</li>' +
        '<li><b>Rezept erstellen</b> → Menü „Rezeptbuch"<br>' +
          'Neues Rezept mit + erstellen, Schritte hinzufügen (Einmaischen → Rasten → Kochen → Abkühlen)</li>' +
        '<li><b>Rezept laden</b> → Im Rezept auf „Aktives Rezept" klicken<br>' +
          'Das Rezept wird in den Brauplan übertragen</li>' +
        '<li><b>Brauen starten</b> → Menü „Brauplan" → Start drücken<br>' +
          'CraftBeerPi steuert Temperatur und Timer automatisch!</li>' +
      '</ol>'
    ) +

    // ── Brau-Cockpit ──
    helpSection('🎛️', 'Brau-Cockpit',  false,
      '<p>Das Cockpit ist die Startseite und zeigt alles Wichtige auf einen Blick:</p>' +
      '<table class="help-table">' +
        '<tr><td><b>Status-Banner</b></td><td>Zeigt ob gerade gebraut wird und welches Rezept geladen ist</td></tr>' +
        '<tr><td><b>Temperatur-Anzeige</b></td><td>Aktuelle Temperatur (groß), Zieltemperatur und Abweichung (Δ)</td></tr>' +
        '<tr><td><b>Aktiver Schritt</b></td><td>Name des aktuellen Brauschritts, Timer und nächster Schritt</td></tr>' +
        '<tr><td><b>Temperatur-Graph</b></td><td>Verlauf der letzten Stunden mit Ziel-Linie</td></tr>' +
        '<tr><td><b>Aktoren-Schalter</b></td><td>Heizung, Rührwerk etc. manuell ein-/ausschalten</td></tr>' +
      '</table>' +
      '<p><b>Tipp:</b> Auf der Startseite kannst du zwischen <b>Cockpit</b> und <b>Anlagenbild</b> wählen (⚙️ → Startseite).</p>'
    ) +

    // ── Gärungs-Dashboard ──
    helpSection('🍶', 'Gärungs-Dashboard', false,
      '<p>Das Gärungs-Dashboard zeigt deine Gärbehälter mit Echtzeitdaten:</p>' +
      '<table class="help-table">' +
        '<tr><td><b>Temperatur</b></td><td>Aktuelle Gärtemperatur, Zieltemperatur und Abweichung</td></tr>' +
        '<tr><td><b>Druck</b></td><td>CO₂-Druck im Behälter (bei Spunding)</td></tr>' +
        '<tr><td><b>iSpindel</b></td><td>Stammwürze/Restextrakt in °Plato (wenn iSpindel-Sensor konfiguriert)</td></tr>' +
        '<tr><td><b>Gärverlauf-Graph</b></td><td>Temperatur (orange), Druck (blau) und iSpindel (lila) über die Zeit</td></tr>' +
      '</table>' +
      '<h4>Gärrezepte</h4>' +
      '<p>Ein Gärrezept besteht aus zeitgesteuerten Schritten:</p>' +
      '<table class="help-table">' +
        '<tr><td><b>Timer-Schritt</b></td><td>Hält eine Temperatur für X Tage. Timer startet wenn Zieltemp erreicht ist.</td></tr>' +
        '<tr><td><b>Zieltemp erreichen</b></td><td>Wartet bis die Temperatur erreicht ist, dann sofort nächster Schritt.</td></tr>' +
        '<tr><td><b>Temp. langsam ändern</b></td><td>Ändert die Temperatur schrittweise (z.B. 1°C pro Tag) — schonend für die Hefe.</td></tr>' +
        '<tr><td><b>Benachrichtigung</b></td><td>Zeigt eine Meldung an (z.B. „Probe nehmen").</td></tr>' +
      '</table>' +
      '<h4>Typisches Gärprofil (Ale)</h4>' +
      '<ol>' +
        '<li><b>Hauptgärung</b> — 18°C für 7 Tage (Hefe vergärt den Zucker)</li>' +
        '<li><b>Diacetyl-Rast</b> — 20°C für 2 Tage (baut Buttergeschmack ab)</li>' +
        '<li><b>Cold Crash</b> — 4°C für 2 Tage (Hefe setzt sich ab, Bier wird klar)</li>' +
      '</ol>'
    ) +

    // ── Rezepte & Brauplan ──
    helpSection('📋', 'Rezepte & Brauplan', false,
      '<h4>Rezeptbuch</h4>' +
      '<p>Hier erstellst und verwaltest du Bierrezepte. Jedes Rezept besteht aus Brau-Schritten:</p>' +
      '<table class="help-table">' +
        '<tr><td><b>Einmaischen (MashIn)</b></td><td>Wasser auf Starttemperatur bringen. Malz erst zugeben wenn Zieltemp erreicht!</td></tr>' +
        '<tr><td><b>Maisch-Schritt (MashStep)</b></td><td>Temperatur halten für eine bestimmte Zeit (Rasten). Timer startet wenn Temp erreicht.</td></tr>' +
        '<tr><td><b>Kochschritt (BoilStep)</b></td><td>Würze kochen (meist 60-90 Min). Hopfen nach Rezept zugeben!</td></tr>' +
        '<tr><td><b>Abkühlen (Cooldown)</b></td><td>Waaret bis Anstelltemperatur erreicht ist (z.B. 20°C für Ale-Hefe).</td></tr>' +
      '</table>' +
      '<h4>Rezept zum Brauen laden</h4>' +
      '<p>Im Rezept-Editor → oben auf <b>„Aktives Rezept"</b> klicken → Rezept wird in den Brauplan geladen → dort <b>Start</b> drücken.</p>'
    ) +

    // ── Hardware ──
    helpSection('🔧', 'Hardware einrichten', false,
      '<p>Die Hardware-Seite hat drei Bereiche:</p>' +
      '<h4>1. Sensoren</h4>' +
      '<table class="help-table">' +
        '<tr><td><b>OneWire</b></td><td>Standard DS18B20 Temperatursensor (an GPIO 4). Wird automatisch erkannt.</td></tr>' +
        '<tr><td><b>CustomSensor</b></td><td>Erzeugt Zufallswerte — zum Testen ohne echten Sensor.</td></tr>' +
        '<tr><td><b>HTTPSensor</b></td><td>Empfängt Werte über HTTP (z.B. von iSpindel, ESPEasy).</td></tr>' +
      '</table>' +
      '<h4>2. Aktoren</h4>' +
      '<table class="help-table">' +
        '<tr><td><b>GPIOActor</b></td><td>Schaltet einen GPIO-Pin am Raspberry Pi (für Relais/SSR).</td></tr>' +
        '<tr><td><b>Inverted</b></td><td>Auf <b>Yes</b> setzen bei LOW-Trigger-Relais (z.B. blaue Songle-Module).</td></tr>' +
      '</table>' +
      '<h4>3. Kessel</h4>' +
      '<p>Ein Kessel verknüpft Sensor + Heizung + Rührwerk zu einer Steuereinheit.</p>' +
      '<table class="help-table">' +
        '<tr><td><b>Logik</b></td><td><b>PIDBoil</b> = PID-Regler mit Kochstufe. Am häufigsten verwendet.</td></tr>' +
        '<tr><td><b>Max. Leistung</b></td><td>PWM-Begrenzung in % (z.B. 100% zum Kochen, 70% zum Maischen).</td></tr>' +
      '</table>'
    ) +

    // ── Einstellungen ──
    helpSection('⚙️', 'Wichtige Einstellungen', false,
      '<table class="help-table">' +
        '<tr><td><b>BREWERY_NAME</b></td><td>Name deiner Brauerei (wird im Header angezeigt)</td></tr>' +
        '<tr><td><b>AutoMode</b></td><td>Wenn <b>Yes</b>: Brau-Schritte schalten automatisch weiter</td></tr>' +
        '<tr><td><b>BoilKettle</b></td><td>Welcher Kessel für den Kochschritt verwendet wird</td></tr>' +
        '<tr><td><b>MashKettle</b></td><td>Welcher Kessel für die Maischeschritte verwendet wird</td></tr>' +
        '<tr><td><b>BoilTemp</b></td><td>Ab welcher Temperatur „Kochen" erkannt wird (Standard: 99°C)</td></tr>' +
        '<tr><td><b>CSVLOGFILES</b></td><td>Wenn <b>Yes</b>: Sensor-Daten werden als CSV aufgezeichnet</td></tr>' +
        '<tr><td><b>steps_cooldown_sensor</b></td><td>Welcher Sensor im Abkühl-Schritt überwacht wird</td></tr>' +
      '</table>'
    ) +

    // ── Glossar ──
    helpSection('📚', 'Glossar — Brauerischen Begriffe', false,
      '<table class="help-table">' +
        '<tr><td><b>Maischen</b></td><td>Malz + Wasser mischen und Enzyme bei verschiedenen Temperaturen arbeiten lassen</td></tr>' +
        '<tr><td><b>Rasten</b></td><td>Temperatur-Pausen beim Maischen (z.B. 63°C = Maltose-Rast, 72°C = Verzuckerung)</td></tr>' +
        '<tr><td><b>Läutern</b></td><td>Trennung von Würze (flüssig) und Treber (Malzreste)</td></tr>' +
        '<tr><td><b>Hopfenkochen</b></td><td>Würze kochen und Hopfen für Bittere, Geschmack und Aroma zugeben</td></tr>' +
        '<tr><td><b>Anstellen</b></td><td>Hefe zur abgekühlten Würze geben</td></tr>' +
        '<tr><td><b>Hauptgärung</b></td><td>Hefe wandelt Zucker in Alkohol und CO₂ um (3-14 Tage)</td></tr>' +
        '<tr><td><b>Nachgärung</b></td><td>Reifung bei kühleren Temperaturen für klareres Bier</td></tr>' +
        '<tr><td><b>Cold Crash</b></td><td>Schnelles Abkühlen auf ~2-4°C → Hefe/Trübstoffe setzen sich ab</td></tr>' +
        '<tr><td><b>Diacetyl-Rast</b></td><td>Kurzes Erwärmen nach Hauptgärung zum Abbau von Buttergeschmack</td></tr>' +
        '<tr><td><b>Stammwürze (OG)</b></td><td>Zuckergehalt vor der Gärung in °Plato (z.B. 12°P ≈ 5% Alk.)</td></tr>' +
        '<tr><td><b>Restextrakt (FG)</b></td><td>Zuckergehalt nach der Gärung (z.B. 2.5°P)</td></tr>' +
        '<tr><td><b>Vergärungsgrad</b></td><td>Wie viel % des Zuckers vergoren wurde. 75-80% = normal</td></tr>' +
        '<tr><td><b>Spunding</b></td><td>Natürliche Karbonisierung im geschlossenen Gärbehälter unter Druck</td></tr>' +
        '<tr><td><b>iSpindel</b></td><td>DIY-Digitalhydrometer das im Bier schwimmt und Restextrakt/Temp misst</td></tr>' +
        '<tr><td><b>PID-Regler</b></td><td>Intelligente Temperaturregelung die Über-/Unterschwinger minimiert</td></tr>' +
        '<tr><td><b>Hysterese</b></td><td>Einfache Regelung: Heizung EIN unter Ziel-X°C, AUS über Ziel+X°C</td></tr>' +
      '</table>'
    ) +

    '</div>';
  }

  function buildHelpContentEN() {
    return '<div class="help-container">' +
    '<div class="help-intro">' +
      '<h2>📖 CraftBeerPi 4 — Help & Reference</h2>' +
      '<p>Find explanations for all features here. Click a section to expand it.</p>' +
    '</div>' +
    helpSection('🚀', 'Quick Start — Brew Your First Beer', true,
      '<ol class="help-steps">' +
        '<li><b>Set up hardware</b> → Menu "Hardware"<br>Add sensor (OneWire/DS18B20), actor (GPIOActor), and kettle (link them together)</li>' +
        '<li><b>Create recipe</b> → Menu "Recipe Book"<br>Create with +, add steps (MashIn → MashStep → BoilStep → Cooldown)</li>' +
        '<li><b>Load recipe</b> → Click "Active Recipe" in the recipe editor</li>' +
        '<li><b>Start brewing</b> → Menu "Brew Plan" → Press Start</li>' +
      '</ol>'
    ) +
    helpSection('🎛️', 'Brew Cockpit', false,
      '<p>The cockpit is your main dashboard showing temperature, active step, timer, graph and actor controls.</p>'
    ) +
    helpSection('🍶', 'Fermentation Dashboard', false,
      '<p>Monitor and control your fermenters with real-time temperature, pressure, and iSpindel data. ' +
      'Load fermentation profiles (Ale, Lager, Wheat, Kveik) with one click.</p>'
    ) +
    helpSection('📋', 'Recipes & Brew Plan', false,
      '<p>Create recipes with MashIn → MashStep → BoilStep → Cooldown steps. Load into Brew Plan and press Start.</p>'
    ) +
    helpSection('🔧', 'Hardware Setup', false,
      '<p>Configure sensors (OneWire), actors (GPIOActor), and kettles (link sensor + heater + agitator).</p>'
    ) +
    helpSection('📚', 'Glossary', false,
      '<p>Mashing, lautering, sparging, dry hopping, cold crash, diacetyl rest, gravity, attenuation — all explained on the German page.</p>'
    ) +
    '</div>';
  }

  function helpSection(icon, title, openByDefault, content) {
    return '<div class="help-section' + (openByDefault ? ' open' : '') + '">' +
      '<div class="help-section-header">' +
        '<span class="help-section-icon">' + icon + '</span>' +
        '<span class="help-section-title">' + title + '</span>' +
        '<span class="help-section-chevron">▶</span>' +
      '</div>' +
      '<div class="help-section-body">' + content + '</div>' +
    '</div>';
  }

  // ============================================================
  // HARDWARE-SEITE — Alle Tabellen patchen
  // ============================================================

  // --- Kessel-Tabelle: Sensor-Wert → Sensor-Name, Zieltemp entfernen ---
  function patchKettleTable() {
    var papers = document.querySelectorAll('.MuiPaper-root');
    if (papers.length < 1) return;

    // Kessel ist das erste Paper mit einer Tabelle
    var kettlePaper = null;
    for (var i = 0; i < papers.length; i++) {
      var table = papers[i].querySelector('table');
      if (!table) continue;
      var firstTh = table.querySelector('thead th');
      if (firstTh && (firstTh.textContent === 'Name' || firstTh.textContent === 'Kessel')) {
        // Prüfe ob Heater-Spalte da ist (Kessel-Tabelle hat Heater)
        var headers = table.querySelectorAll('thead th');
        var hasHeater = false;
        headers.forEach(function(h) {
          if (h.textContent === 'Heater' || h.textContent === 'Heizung') hasHeater = true;
        });
        if (hasHeater) { kettlePaper = papers[i]; break; }
      }
    }
    if (!kettlePaper) return;
    if (kettlePaper.getAttribute('data-patched') === 'true') return;

    var de = currentLang === 'de';

    // Tabelle komplett neu bauen per API
    Promise.all([
      fetch('/kettle/').then(function(r) { return r.json(); }),
      fetch('/sensor/').then(function(r) { return r.json(); }),
      fetch('/actor/').then(function(r) { return r.json(); })
    ]).then(function(results) {
      var kettles = results[0].data || [];
      var sensors = results[1].data || [];
      var actors = results[2].data || [];

      var sensorNames = {};
      sensors.forEach(function(s) { sensorNames[s.id] = s.name; });
      var actorNames = {};
      actors.forEach(function(a) { actorNames[a.id] = a.name; });

      var table = kettlePaper.querySelector('table');
      if (!table) return;

      _isOurDomChange = true;

      // Header neu
      var thead = table.querySelector('thead');
      if (thead) {
        thead.innerHTML = '<tr class="MuiTableRow-root MuiTableRow-head">' +
          '<th class="MuiTableCell-root MuiTableCell-head">Name</th>' +
          '<th class="MuiTableCell-root MuiTableCell-head">' + (de ? 'Logik' : 'Logic') + '</th>' +
          '<th class="MuiTableCell-root MuiTableCell-head">' + (de ? 'Heizung' : 'Heater') + '</th>' +
          '<th class="MuiTableCell-root MuiTableCell-head">' + (de ? 'Rührwerk' : 'Agitator') + '</th>' +
          '<th class="MuiTableCell-root MuiTableCell-head">Sensor</th>' +
          '<th class="MuiTableCell-root MuiTableCell-head" style="text-align:right">' + (de ? 'Aktionen' : 'Actions') + '</th>' +
          '</tr>';
      }

      // Body neu
      var tbody = table.querySelector('tbody');
      if (tbody) {
        var html = '';
        kettles.forEach(function(k) {
          html += '<tr class="MuiTableRow-root">';
          html += '<td class="MuiTableCell-root MuiTableCell-body" style="color:#00FF00">' + (k.name || '—') + '</td>';
          html += '<td class="MuiTableCell-root MuiTableCell-body">' + (k.type || '—') + '</td>';
          html += '<td class="MuiTableCell-root MuiTableCell-body">' + (actorNames[k.heater] || '—') + '</td>';
          html += '<td class="MuiTableCell-root MuiTableCell-body">' + (actorNames[k.agitator] || '—') + '</td>';
          html += '<td class="MuiTableCell-root MuiTableCell-body">' + (sensorNames[k.sensor] || '—') + '</td>';
          html += '<td class="MuiTableCell-root MuiTableCell-body" style="text-align:right;white-space:nowrap">';
          html += '<button class="MuiButtonBase-root MuiIconButton-root" data-kettle-delete="' + k.id + '" style="display:inline-flex;flex-direction:column;align-items:center;background:none;border:none;color:var(--text-primary);cursor:pointer;padding:4px 8px;vertical-align:top" title="' + (de ? 'Löschen' : 'Delete') + '">';
          html += '<svg style="width:24px;height:24px;fill:currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
          html += '<span style="font-size:0.65rem;color:#f44336;letter-spacing:0.05em">' + (de ? 'LÖSCHEN' : 'DELETE') + '</span>';
          html += '</button>';
          html += '<button class="MuiButtonBase-root MuiIconButton-root" data-kettle-view="' + k.id + '" style="display:inline-flex;flex-direction:column;align-items:center;background:none;border:none;color:var(--text-primary);cursor:pointer;padding:4px 8px;vertical-align:top" title="' + (de ? 'Bearbeiten' : 'Edit') + '">';
          html += '<svg style="width:24px;height:24px;fill:currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
          html += '<span style="font-size:0.65rem;color:#4caf50;letter-spacing:0.05em">' + (de ? 'BEARBEITEN' : 'EDIT') + '</span>';
          html += '</button>';
          html += '</td></tr>';
        });
        tbody.innerHTML = html;

        // Delete handler — benutzt originale React-Route
        tbody.querySelectorAll('[data-kettle-delete]').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var id = btn.getAttribute('data-kettle-delete');
            showConfirm(
              de ? 'Kessel löschen?' : 'Delete kettle?',
              de ? 'Der Kessel und seine Zuordnungen werden entfernt.' : 'The kettle and its assignments will be removed.',
              function() {
                btn.disabled = true;
                fetch('/kettle/' + encodeURIComponent(id), { method: 'DELETE' })
                  .then(function() { showToast(de ? 'Kessel gelöscht' : 'Kettle deleted', 'success'); location.reload(); })
                  .catch(function() { btn.disabled = false; showToast(de ? 'Fehler beim Löschen' : 'Delete failed', 'error'); });
              },
              { danger: true, confirmText: de ? '🗑 Löschen' : '🗑 Delete' }
            );
          });
        });

        // View handler — navigiert zur Kessel-Detail-Seite
        tbody.querySelectorAll('[data-kettle-view]').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var id = btn.getAttribute('data-kettle-view');
            window.location.hash = '#/kettle/' + id;
          });
        });
      }

      kettlePaper.setAttribute('data-patched', 'true');
      _isOurDomChange = false;
    });
  }

  // --- Sensor-Tabelle: Wert entfernen, Adresse + Interval hinzufügen ---
  function patchSensorTable() {
    var papers = document.querySelectorAll('.MuiPaper-root');
    var sensorPaper = null;
    for (var i = 0; i < papers.length; i++) {
      var table = papers[i].querySelector('table');
      if (!table) continue;
      var headers = table.querySelectorAll('thead th');
      var texts = [];
      headers.forEach(function(h) { texts.push(h.textContent); });
      // Sensor-Tabelle hat: Name, (Logic/Type/Logik), (Value/Wert), Actions
      if (texts.length >= 3 && (texts.indexOf('Value') >= 0 || texts.indexOf('Wert') >= 0)) {
        sensorPaper = papers[i];
        break;
      }
    }
    if (!sensorPaper) return;
    if (sensorPaper.getAttribute('data-patched') === 'true') return;

    var de = currentLang === 'de';

    fetch('/sensor/').then(function(r) { return r.json(); }).then(function(sData) {
      var sensors = sData.data || [];
      var types = sData.types || {};
      var table = sensorPaper.querySelector('table');
      if (!table) return;

      _isOurDomChange = true;

      var thead = table.querySelector('thead');
      if (thead) {
        thead.innerHTML = '<tr class="MuiTableRow-root MuiTableRow-head">' +
          '<th class="MuiTableCell-root MuiTableCell-head">Name</th>' +
          '<th class="MuiTableCell-root MuiTableCell-head">' + (de ? 'Typ' : 'Type') + '</th>' +
          '<th class="MuiTableCell-root MuiTableCell-head">GPIO</th>' +
          '<th class="MuiTableCell-root MuiTableCell-head">' + (de ? 'Adresse / ID' : 'Address / ID') + '</th>' +
          '<th class="MuiTableCell-root MuiTableCell-head">Interval</th>' +
          '<th class="MuiTableCell-root MuiTableCell-head" style="text-align:right">' + (de ? 'Aktionen' : 'Actions') + '</th>' +
          '</tr>';
      }

      var tbody = table.querySelector('tbody');
      if (tbody) {
        var html = '';
        sensors.forEach(function(s) {
          var props = s.props || {};
          // Adresse: für OneWire ist es props.Sensor, für HTTPSensor props.Key etc.
          var address = props.Sensor || props.Key || '—';
          var interval = props.Interval ? props.Interval + 's' : '—';
          // GPIO-Pin: OneWire nutzt standardmäßig GPIO 4, andere Sensoren haben ggf. eigene GPIO-Props
          var gpio = props.GPIO !== undefined ? 'GPIO ' + props.GPIO : (s.type && s.type.indexOf('OneWire') >= 0 ? 'GPIO 4' : '—');

          html += '<tr class="MuiTableRow-root">';
          html += '<td class="MuiTableCell-root MuiTableCell-body" style="color:#00FF00">' + (s.name || '—') + '</td>';
          html += '<td class="MuiTableCell-root MuiTableCell-body">' + (s.type || '—') + '</td>';
          html += '<td class="MuiTableCell-root MuiTableCell-body" style="font-family:monospace">' + gpio + '</td>';
          html += '<td class="MuiTableCell-root MuiTableCell-body" style="font-family:monospace;font-size:0.8rem">' + address + '</td>';
          html += '<td class="MuiTableCell-root MuiTableCell-body">' + interval + '</td>';
          html += '<td class="MuiTableCell-root MuiTableCell-body" style="text-align:right;white-space:nowrap">';
          html += '<button class="MuiButtonBase-root MuiIconButton-root" data-sensor-delete="' + s.id + '" style="display:inline-flex;flex-direction:column;align-items:center;background:none;border:none;color:var(--text-primary);cursor:pointer;padding:4px 8px;vertical-align:top" title="' + (de ? 'Löschen' : 'Delete') + '">';
          html += '<svg style="width:24px;height:24px;fill:currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
          html += '<span style="font-size:0.65rem;color:#f44336;letter-spacing:0.05em">' + (de ? 'LÖSCHEN' : 'DELETE') + '</span>';
          html += '</button>';
          html += '<button class="MuiButtonBase-root MuiIconButton-root" data-sensor-view="' + s.id + '" style="display:inline-flex;flex-direction:column;align-items:center;background:none;border:none;color:var(--text-primary);cursor:pointer;padding:4px 8px;vertical-align:top" title="' + (de ? 'Bearbeiten' : 'Edit') + '">';
          html += '<svg style="width:24px;height:24px;fill:currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
          html += '<span style="font-size:0.65rem;color:#4caf50;letter-spacing:0.05em">' + (de ? 'BEARBEITEN' : 'EDIT') + '</span>';
          html += '</button>';
          html += '</td></tr>';
        });
        tbody.innerHTML = html;

        tbody.querySelectorAll('[data-sensor-delete]').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var id = btn.getAttribute('data-sensor-delete');
            showConfirm(
              de ? 'Sensor löschen?' : 'Delete sensor?',
              de ? 'Der Sensor wird entfernt. Prüfe, ob er noch in einem Kessel zugewiesen ist!' : 'The sensor will be removed. Check if it\'s still assigned to a kettle!',
              function() {
                btn.disabled = true;
                fetch('/sensor/' + encodeURIComponent(id), { method: 'DELETE' })
                  .then(function() { showToast(de ? 'Sensor gelöscht' : 'Sensor deleted', 'success'); location.reload(); })
                  .catch(function() { btn.disabled = false; showToast(de ? 'Fehler beim Löschen' : 'Delete failed', 'error'); });
              },
              { danger: true, confirmText: de ? '🗑 Löschen' : '🗑 Delete' }
            );
          });
        });

        tbody.querySelectorAll('[data-sensor-view]').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var id = btn.getAttribute('data-sensor-view');
            window.location.hash = '#/sensor/' + id;
          });
        });
      }

      sensorPaper.setAttribute('data-patched', 'true');
      _isOurDomChange = false;
    });
  }

  // --- Aktor-Tabelle: GPIO + Invertiert hinzufügen, Toggle entfernen ---
  function patchActorTable() {
    var papers = document.querySelectorAll('.MuiPaper-root');
    var actorPaper = null;
    for (var i = 0; i < papers.length; i++) {
      var table = papers[i].querySelector('table');
      if (!table) continue;
      var headers = table.querySelectorAll('thead th');
      var texts = [];
      headers.forEach(function(h) { texts.push(h.textContent); });
      // Aktor-Tabelle hat: Name, Type/Typ, State/Status, Actions
      if (texts.length >= 3 && (texts.indexOf('State') >= 0 || texts.indexOf('Status') >= 0)) {
        actorPaper = papers[i];
        break;
      }
    }
    if (!actorPaper) return;
    if (actorPaper.getAttribute('data-patched') === 'true') return;

    var de = currentLang === 'de';

    fetch('/actor/').then(function(r) { return r.json(); }).then(function(aData) {
      var actors = aData.data || [];
      var table = actorPaper.querySelector('table');
      if (!table) return;

      _isOurDomChange = true;

      var thead = table.querySelector('thead');
      if (thead) {
        thead.innerHTML = '<tr class="MuiTableRow-root MuiTableRow-head">' +
          '<th class="MuiTableCell-root MuiTableCell-head">Name</th>' +
          '<th class="MuiTableCell-root MuiTableCell-head">' + (de ? 'Typ' : 'Type') + '</th>' +
          '<th class="MuiTableCell-root MuiTableCell-head">GPIO</th>' +
          '<th class="MuiTableCell-root MuiTableCell-head">' + (de ? 'Invertiert' : 'Inverted') + '</th>' +
          '<th class="MuiTableCell-root MuiTableCell-head" style="text-align:right">' + (de ? 'Aktionen' : 'Actions') + '</th>' +
          '</tr>';
      }

      var tbody = table.querySelector('tbody');
      if (tbody) {
        var html = '';
        actors.forEach(function(act) {
          var props = act.props || {};
          var gpio = props.GPIO !== undefined ? 'GPIO ' + props.GPIO : '—';
          var inverted = props.Inverted || '—';

          html += '<tr class="MuiTableRow-root">';
          html += '<td class="MuiTableCell-root MuiTableCell-body" style="color:#00FF00">' + (act.name || '—') + '</td>';
          html += '<td class="MuiTableCell-root MuiTableCell-body">' + (act.type || '—') + '</td>';
          html += '<td class="MuiTableCell-root MuiTableCell-body" style="font-family:monospace">' + gpio + '</td>';
          html += '<td class="MuiTableCell-root MuiTableCell-body">' + inverted + '</td>';
          html += '<td class="MuiTableCell-root MuiTableCell-body" style="text-align:right;white-space:nowrap">';
          html += '<button class="MuiButtonBase-root MuiIconButton-root" data-actor-delete="' + act.id + '" style="display:inline-flex;flex-direction:column;align-items:center;background:none;border:none;color:var(--text-primary);cursor:pointer;padding:4px 8px;vertical-align:top" title="' + (de ? 'Löschen' : 'Delete') + '">';
          html += '<svg style="width:24px;height:24px;fill:currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
          html += '<span style="font-size:0.65rem;color:#f44336;letter-spacing:0.05em">' + (de ? 'LÖSCHEN' : 'DELETE') + '</span>';
          html += '</button>';
          html += '<button class="MuiButtonBase-root MuiIconButton-root" data-actor-view="' + act.id + '" style="display:inline-flex;flex-direction:column;align-items:center;background:none;border:none;color:var(--text-primary);cursor:pointer;padding:4px 8px;vertical-align:top" title="' + (de ? 'Bearbeiten' : 'Edit') + '">';
          html += '<svg style="width:24px;height:24px;fill:currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
          html += '<span style="font-size:0.65rem;color:#4caf50;letter-spacing:0.05em">' + (de ? 'BEARBEITEN' : 'EDIT') + '</span>';
          html += '</button>';
          html += '</td></tr>';
        });
        tbody.innerHTML = html;

        tbody.querySelectorAll('[data-actor-delete]').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var id = btn.getAttribute('data-actor-delete');
            showConfirm(
              de ? 'Aktor löschen?' : 'Delete actor?',
              de ? 'Der Aktor wird entfernt. Prüfe, ob er noch in einem Kessel zugewiesen ist!' : 'The actor will be removed. Check if it\'s still assigned to a kettle!',
              function() {
                btn.disabled = true;
                fetch('/actor/' + encodeURIComponent(id), { method: 'DELETE' })
                  .then(function() { showToast(de ? 'Aktor gelöscht' : 'Actor deleted', 'success'); location.reload(); })
                  .catch(function() { btn.disabled = false; showToast(de ? 'Fehler beim Löschen' : 'Delete failed', 'error'); });
              },
              { danger: true, confirmText: de ? '🗑 Löschen' : '🗑 Delete' }
            );
          });
        });

        tbody.querySelectorAll('[data-actor-view]').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var id = btn.getAttribute('data-actor-view');
            window.location.hash = '#/actor/' + id;
          });
        });
      }

      actorPaper.setAttribute('data-patched', 'true');
      _isOurDomChange = false;
    });
  }

  // ============================================================
  // FERMENTER-DETAILSEITE — Konfigurations-Formular
  // ============================================================
  function enhanceFermenterDetailPage() {
    var hash = window.location.hash.replace('#', '');
    var match = hash.match(/^\/fermenter\/(.+)$/);
    if (!match) {
      // Aufräumen: Formular entfernen wenn nicht mehr auf Fermenter-Detailseite
      var stale = document.getElementById('cbpi-fermenter-config-form');
      if (stale) stale.remove();
      return;
    }
    var fermenterId = match[1];

    // Bereits injiziert?
    if (document.getElementById('cbpi-fermenter-config-form')) return;

    // Suche den leeren main-Bereich der Fermenter-Detailseite
    var main = document.querySelector('main');
    if (!main) return;

    var de = currentLang === 'de';
    _isOurDomChange = true;

    // Lade-Container erstellen
    var container = document.createElement('div');
    container.id = 'cbpi-fermenter-config-form';
    container.style.cssText = 'padding:24px;max-width:1100px;margin:0 auto';
    container.innerHTML = '<div style="color:var(--text-secondary,#888);padding:40px;text-align:center">' + (de ? 'Gärbehälter-Konfiguration wird geladen…' : 'Loading fermenter configuration…') + '</div>';

    // In main nach der Überschrift einfügen
    var existingContent = main.querySelector('.MuiGrid-container, .MuiGrid-root');
    if (existingContent) {
      existingContent.parentNode.insertBefore(container, existingContent.nextSibling);
    } else {
      main.appendChild(container);
    }
    _isOurDomChange = false;

    // Daten laden
    Promise.all([
      fetch('/fermenter/').then(function(r) { return r.json(); }),
      fetch('/sensor/').then(function(r) { return r.json(); }),
      fetch('/actor/').then(function(r) { return r.json(); })
    ]).then(function(results) {
      var fermData = results[0];
      var sensors = results[1].data || [];
      var actors = results[2].data || [];
      var types = fermData.types || {};
      var fermenters = fermData.data || [];
      var f = fermenters.find(function(x) { return x.id === fermenterId; });
      if (!f) {
        container.innerHTML = '<div style="color:#f44336;padding:40px;text-align:center">' + (de ? 'Gärbehälter nicht gefunden' : 'Fermenter not found') + '</div>';
        return;
      }

      buildFermenterConfigForm(container, f, sensors, actors, types, de);
    }).catch(function(err) {
      console.error('[Fermenter Config] Load failed:', err);
      container.innerHTML = '<div style="color:#f44336;padding:40px;text-align:center">' + (de ? 'Fehler beim Laden' : 'Load error') + '</div>';
    });
  }

  function buildFermenterConfigForm(container, f, sensors, actors, types, de) {
    var typeInfo = types[f.type] || {};
    var props = f.props || {};
    var typeProps = typeInfo.properties || [];

    // Sensor-Optionen
    var sensorOpts = '<option value="">— ' + (de ? 'Kein Sensor' : 'No sensor') + ' —</option>';
    sensors.forEach(function(s) {
      sensorOpts += '<option value="' + s.id + '"' + (s.id === f.sensor ? ' selected' : '') + '>' + s.name + '</option>';
    });
    var pressureSensorOpts = '<option value="">— ' + (de ? 'Kein Sensor' : 'No sensor') + ' —</option>';
    sensors.forEach(function(s) {
      pressureSensorOpts += '<option value="' + s.id + '"' + (s.id === f.pressure_sensor ? ' selected' : '') + '>' + s.name + '</option>';
    });

    // Aktor-Optionen
    function buildActorOpts(selectedId) {
      var o = '<option value="">— ' + (de ? 'Keiner' : 'None') + ' —</option>';
      actors.forEach(function(a) {
        o += '<option value="' + a.id + '"' + (a.id === selectedId ? ' selected' : '') + '>' + a.name + '</option>';
      });
      return o;
    }

    // Typ-Optionen
    var typeOpts = '';
    Object.keys(types).forEach(function(t) {
      typeOpts += '<option value="' + t + '"' + (t === f.type ? ' selected' : '') + '>' + t + '</option>';
    });

    _isOurDomChange = true;

    var html = '';
    html += '<div style="margin-bottom:16px">';
    html += '<h2 style="margin:0 0 4px;font-size:1.2rem;color:var(--text-primary,#eee)">' + (de ? 'Gärbehälter-Konfiguration' : 'Fermenter Configuration') + '</h2>';
    html += '<div style="color:var(--text-secondary,#888);font-size:0.9rem">' + (de ? 'Gärbehälter' : 'Fermenter') + ' / <span style="color:#00FF00">' + (f.name || '') + '</span></div>';
    html += '</div>';

    // Formular im Paper-Style
    html += '<div class="MuiPaper-root MuiPaper-elevation1 MuiPaper-rounded" style="padding:24px">';

    // Grid — 2 Spalten
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px 32px">';

    // Name
    html += '<div style="display:flex;flex-direction:column">';
    html += '<label style="font-size:0.75rem;color:var(--text-secondary,#888);margin-bottom:4px">Name *</label>';
    html += '<input type="text" id="fc-name" value="' + (f.name || '').replace(/"/g, '&quot;') + '" style="background:transparent;border:none;border-bottom:1px solid var(--border-color,#555);color:var(--text-primary,#eee);padding:8px 0;font-size:1rem;outline:none;font-family:inherit">';
    html += '</div>';

    // Logik-Typ
    html += '<div style="display:flex;flex-direction:column">';
    html += '<label style="font-size:0.75rem;color:var(--text-secondary,#888);margin-bottom:4px">' + (de ? 'Logik' : 'Logic') + '</label>';
    html += '<select id="fc-type" style="background:transparent;border:none;border-bottom:1px solid var(--border-color,#555);color:var(--text-primary,#eee);padding:8px 0;font-size:1rem;outline:none;font-family:inherit">' + typeOpts + '</select>';
    html += '</div>';

    // Sensor
    html += '<div style="display:flex;flex-direction:column">';
    html += '<label style="font-size:0.75rem;color:var(--text-secondary,#888);margin-bottom:4px">' + (de ? 'Temperatursensor' : 'Temp Sensor') + '</label>';
    html += '<select id="fc-sensor" style="background:transparent;border:none;border-bottom:1px solid var(--border-color,#555);color:var(--text-primary,#eee);padding:8px 0;font-size:1rem;outline:none;font-family:inherit">' + sensorOpts + '</select>';
    html += '</div>';

    // Drucksensor
    html += '<div style="display:flex;flex-direction:column">';
    html += '<label style="font-size:0.75rem;color:var(--text-secondary,#888);margin-bottom:4px">' + (de ? 'Drucksensor' : 'Pressure Sensor') + '</label>';
    html += '<select id="fc-pressure" style="background:transparent;border:none;border-bottom:1px solid var(--border-color,#555);color:var(--text-primary,#eee);padding:8px 0;font-size:1rem;outline:none;font-family:inherit">' + pressureSensorOpts + '</select>';
    html += '</div>';

    // Heizung
    html += '<div style="display:flex;flex-direction:column">';
    html += '<label style="font-size:0.75rem;color:var(--text-secondary,#888);margin-bottom:4px">' + (de ? 'Heizung' : 'Heater') + '</label>';
    html += '<select id="fc-heater" style="background:transparent;border:none;border-bottom:1px solid var(--border-color,#555);color:var(--text-primary,#eee);padding:8px 0;font-size:1rem;outline:none;font-family:inherit">' + buildActorOpts(f.heater) + '</select>';
    html += '</div>';

    // Kühlung
    html += '<div style="display:flex;flex-direction:column">';
    html += '<label style="font-size:0.75rem;color:var(--text-secondary,#888);margin-bottom:4px">' + (de ? 'Kühlung' : 'Cooler') + '</label>';
    html += '<select id="fc-cooler" style="background:transparent;border:none;border-bottom:1px solid var(--border-color,#555);color:var(--text-primary,#eee);padding:8px 0;font-size:1rem;outline:none;font-family:inherit">' + buildActorOpts(f.cooler) + '</select>';
    html += '</div>';

    // Ventil
    html += '<div style="display:flex;flex-direction:column">';
    html += '<label style="font-size:0.75rem;color:var(--text-secondary,#888);margin-bottom:4px">' + (de ? 'Ventil (Spunding)' : 'Valve (Spunding)') + '</label>';
    html += '<select id="fc-valve" style="background:transparent;border:none;border-bottom:1px solid var(--border-color,#555);color:var(--text-primary,#eee);padding:8px 0;font-size:1rem;outline:none;font-family:inherit">' + buildActorOpts(f.valve) + '</select>';
    html += '</div>';

    // Leer-Platzhalter für Grid-Alignment  
    html += '<div></div>';

    html += '</div>'; // grid ende

    // Logik-Properties (dynamisch je nach gewähltem Typ)
    html += '<div id="fc-props-section" style="margin-top:24px;border-top:1px solid var(--border-color,#333);padding-top:20px">';
    html += buildPropsFields(typeInfo, props, de, sensors);
    html += '</div>';

    // Buttons
    html += '<div style="display:flex;justify-content:flex-end;gap:12px;margin-top:28px">';
    html += '<button id="fc-cancel" style="background:#f44336;color:#fff;border:none;padding:8px 24px;border-radius:4px;font-size:0.9rem;cursor:pointer;font-family:inherit">' + (de ? 'Abbrechen' : 'Cancel') + '</button>';
    html += '<button id="fc-save" style="background:#26a69a;color:#fff;border:none;padding:8px 24px;border-radius:4px;font-size:0.9rem;cursor:pointer;font-family:inherit">' + (de ? 'Speichern' : 'Save') + '</button>';
    html += '</div>';

    html += '</div>'; // paper ende
    container.innerHTML = html;
    _isOurDomChange = false;

    // Events vor React-Interference schützen
    container.querySelectorAll('input, select').forEach(function(inp) {
      inp.addEventListener('keydown', function(e) { e.stopPropagation(); });
      inp.addEventListener('keyup', function(e) { e.stopPropagation(); });
      inp.addEventListener('keypress', function(e) { e.stopPropagation(); });
      inp.addEventListener('input', function(e) { e.stopPropagation(); });
      inp.addEventListener('mousedown', function(e) { e.stopPropagation(); });
      inp.addEventListener('focus', function(e) { e.stopPropagation(); });
    });

    // Typ-Wechsel: Properties neu rendern
    document.getElementById('fc-type').addEventListener('change', function() {
      var newType = this.value;
      var newTypeInfo = types[newType] || {};
      var section = document.getElementById('fc-props-section');
      if (section) {
        _isOurDomChange = true;
        section.innerHTML = buildPropsFields(newTypeInfo, {}, de, sensors);
        _isOurDomChange = false;
        // Events auf neue Felder anwenden
        section.querySelectorAll('input, select').forEach(function(inp) {
          inp.addEventListener('keydown', function(e) { e.stopPropagation(); });
          inp.addEventListener('keyup', function(e) { e.stopPropagation(); });
          inp.addEventListener('keypress', function(e) { e.stopPropagation(); });
          inp.addEventListener('input', function(e) { e.stopPropagation(); });
        });
      }
    });

    // Cancel
    document.getElementById('fc-cancel').addEventListener('click', function() {
      window.location.hash = '#/hardware';
    });

    // Save
    document.getElementById('fc-save').addEventListener('click', function() {
      var btn = this;
      btn.disabled = true;
      btn.textContent = de ? 'Speichern…' : 'Saving…';

      // Props sammeln
      var newProps = {};
      container.querySelectorAll('[data-prop-label]').forEach(function(inp) {
        var label = inp.getAttribute('data-prop-label');
        var val = inp.value;
        // Zahlenwerte konvertieren
        if (inp.type === 'number' && val !== '') {
          val = parseFloat(val);
        }
        newProps[label] = val;
      });

      var payload = {
        name: document.getElementById('fc-name').value.trim(),
        type: document.getElementById('fc-type').value,
        sensor: document.getElementById('fc-sensor').value,
        pressure_sensor: document.getElementById('fc-pressure').value,
        heater: document.getElementById('fc-heater').value,
        cooler: document.getElementById('fc-cooler').value,
        valve: document.getElementById('fc-valve').value,
        target_temp: f.target_temp || 0,
        target_pressure: f.target_pressure || 0,
        brewname: f.brewname || '',
        description: f.description || '',
        props: newProps,
        steps: f.steps || []
      };

      if (!payload.name) {
        alert(de ? 'Name darf nicht leer sein!' : 'Name cannot be empty!');
        btn.disabled = false;
        btn.textContent = de ? 'Speichern' : 'Save';
        return;
      }

      fetch('/fermenter/' + encodeURIComponent(f.id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        btn.textContent = de ? 'Gespeichert ✓' : 'Saved ✓';
        btn.style.background = '#4caf50';
        setTimeout(function() { window.location.hash = '#/hardware'; }, 800);
      })
      .catch(function(err) {
        console.error('[Fermenter Config] Save failed:', err);
        alert((de ? 'Speichern fehlgeschlagen: ' : 'Save failed: ') + err.message);
        btn.disabled = false;
        btn.textContent = de ? 'Speichern' : 'Save';
      });
    });
  }

  // Übersetzungstabelle für Property-Labels und Beschreibungen aus der API
  var propTranslations = {
    labels: {
      'HeaterOffsetOn': 'Heizung Ein-Offset',
      'HeaterOffsetOff': 'Heizung Aus-Offset',
      'CoolerOffsetOn': 'Kühlung Ein-Offset',
      'CoolerOffsetOff': 'Kühlung Aus-Offset',
      'AutoStart': 'Autostart',
      'sensor2': 'Sensor 2 (iSpindle)',
      'SpundingOffsetOpen': 'Spunding-Offset',
      'ValveRelease': 'Ventil-Öffnungszeit',
      'Pause': 'Pause',
      'OffsetOn': 'Ein-Offset',
      'OffsetOff': 'Aus-Offset',
      'Sensor': 'Sensor',
      'Inverted': 'Invertiert',
      'SamplingTime': 'Abtastzeit',
      'GPIO': 'GPIO',
      'Frequency': 'Frequenz',
      'Power': 'Leistung',
      'Key': 'HTTP-Schlüssel',
      'offset': 'Offset',
      'Interval': 'Intervall',
      'Topic': 'MQTT-Topic',
      'PayloadDictionary': 'Payload-Pfad',
      'Notification': 'Benachrichtigung',
      'AutoNext': 'Automatisch weiter',
      'Temp': 'Temperatur',
      'Timer': 'Timer (Minuten)',
      'AutoMode': 'Automatikmodus',
      'toggle_type': 'Schaltaktion',
      'LidAlert': 'Deckel-Warnung',
      'Pressure': 'Druck',
      'PressureIncrease': 'Druckanstieg',
      'PressureDecrease': 'Druckabfall',
      'Fermenter': 'Gärbehälter'
    },
    descriptions: {
      'Offset as decimal number when the heater is switched on. Should be greater then \'HeaterOffsetOff\'. For example a value of 2 switches on the heater if the current temperature is 2 degrees below the target temperature': 'Offset als Dezimalzahl für das Einschalten der Heizung. Sollte größer sein als der Aus-Offset. Beispiel: Wert 2 schaltet die Heizung ein, wenn die Temperatur 2°C unter dem Ziel liegt.',
      'Offset as decimal number when the heater is switched off. Should be smaller then \'HeaterOffsetOn\'. For example a value of 1 switches off the heater if the current temperature is 1 degree below the target temperature': 'Offset als Dezimalzahl für das Ausschalten der Heizung. Sollte kleiner sein als der Ein-Offset. Beispiel: Wert 1 schaltet die Heizung aus, wenn die Temperatur 1°C unter dem Ziel liegt.',
      'Offset as decimal number when the cooler is switched on. Should be greater then \'CoolerOffsetOff\'. For example a value of 2 switches on the cooler if the current temperature is 2 degrees below the target temperature': 'Offset als Dezimalzahl für das Einschalten der Kühlung. Sollte größer sein als der Aus-Offset. Beispiel: Wert 2 schaltet die Kühlung ein, wenn die Temperatur 2°C über dem Ziel liegt.',
      'Offset as decimal number when the cooler is switched off. Should be smaller then \'CoolerOffsetOn\'. For example a value of 1 switches off the cooler if the current temperature is 1 degree below the target temperature': 'Offset als Dezimalzahl für das Ausschalten der Kühlung. Sollte kleiner sein als der Ein-Offset. Beispiel: Wert 1 schaltet die Kühlung aus, wenn die Temperatur 1°C über dem Ziel liegt.',
      'Autostart Fermenter on cbpi start': 'Gärbehälter automatisch starten beim Start von CraftBeerPi',
      'Optional Sensor for LCDisplay(e.g. iSpindle)': 'Optionaler Sensor für LC-Display (z.B. iSpindle)',
      'Offset above target pressure as decimal number when the valve is opened': 'Offset über dem Zieldruck als Dezimalzahl, bei dem das Ventil geöffnet wird',
      'Valve Release time in seconds': 'Ventil-Öffnungszeit in Sekunden',
      'Pause time in seconds between valve release': 'Pausenzeit in Sekunden zwischen Ventilöffnungen',
      'Offset below target temp when heater should switched on': 'Offset unter Zieltemperatur, bei dem die Heizung einschaltet',
      'Offset below target temp when heater should switched off': 'Offset unter Zieltemperatur, bei dem die Heizung ausschaltet',
      'No: Active on high; Yes: Active on low': 'Nein: Aktiv bei High; Ja: Aktiv bei Low',
      'Time in seconds for power base interval (Default:5)': 'Leistungs-Intervall in Sekunden (Standard: 5)',
      'Power Setting [0-100]': 'Leistungseinstellung [0-100]',
      'Sensor Offset (Default is 0)': 'Sensor-Offset (Standard: 0)',
      'Interval in Seconds': 'Intervall in Sekunden',
      'Http Key': 'HTTP-Schlüssel',
      'MQTT Topic': 'MQTT-Topic',
      'Text for notification': 'Text für die Benachrichtigung',
      'Text for notification when Temp is reached': 'Benachrichtigung wenn Temperatur erreicht',
      'Automatically move to next step (Yes) or pause after Notification (No)': 'Automatisch zum nächsten Schritt (Yes) oder Pause nach Benachrichtigung (No)',
      'Switch Kettlelogic automatically on and off -> Yes': 'Kessellogik automatisch ein-/ausschalten → Yes',
      'Time in Minutes': 'Zeit in Minuten',
      'Boil temperature': 'Kochtemperatur',
      'Trigger Alert to remove lid if temp is close to boil': 'Warnung zum Deckel-Abnehmen wenn Temperatur nahe Kochpunkt',
      'Target temperature for cooldown. Notification will be send when temp is reached and Actor can be triggered': 'Zieltemperatur für Abkühlung. Benachrichtigung wird gesendet wenn Temperatur erreicht und Aktor ausgelöst wird',
      'Sensor that is used during cooldown': 'Sensor der beim Abkühlen verwendet wird'
    }
  };

  function buildPropsFields(typeInfo, currentProps, de, sensors) {
    var typeProps = (typeInfo && typeInfo.properties) ? typeInfo.properties : [];
    if (typeProps.length === 0) {
      return '<div style="color:var(--text-secondary,#666);font-size:0.85rem;font-style:italic">' + (de ? 'Keine Logik-Einstellungen für diesen Typ' : 'No logic settings for this type') + '</div>';
    }

    var html = '<h3 style="margin:0 0 16px;font-size:0.95rem;color:var(--text-secondary,#888)">' + (de ? 'Logik-Einstellungen' : 'Logic Settings') + ' (' + (typeInfo.name || '') + ')</h3>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px 24px">';

    typeProps.forEach(function(tp) {
      var val = currentProps[tp.label] !== undefined ? currentProps[tp.label] : (tp.default_value || '');
      var displayLabel = (de && propTranslations.labels[tp.label]) ? propTranslations.labels[tp.label] : tp.label;
      html += '<div style="display:flex;flex-direction:column">';
      html += '<label style="font-size:0.75rem;color:var(--text-secondary,#888);margin-bottom:4px">' + displayLabel + '</label>';

      if (tp.type === 'select' && tp.options) {
        html += '<select data-prop-label="' + tp.label + '" style="background:transparent;border:none;border-bottom:1px solid var(--border-color,#555);color:var(--text-primary,#eee);padding:8px 0;font-size:1rem;outline:none;font-family:inherit">';
        tp.options.forEach(function(opt) {
          html += '<option value="' + opt + '"' + (String(val) === String(opt) ? ' selected' : '') + '>' + opt + '</option>';
        });
        html += '</select>';
      } else if (tp.type === 'sensor') {
        html += '<select data-prop-label="' + tp.label + '" data-prop-type="sensor" style="background:transparent;border:none;border-bottom:1px solid var(--border-color,#555);color:var(--text-primary,#eee);padding:8px 0;font-size:1rem;outline:none;font-family:inherit">';
        html += '<option value="">— ' + (de ? 'Kein Sensor' : 'No sensor') + ' —</option>';
        if (sensors) {
          sensors.forEach(function(s) {
            html += '<option value="' + s.id + '"' + (s.id === val ? ' selected' : '') + '>' + s.name + '</option>';
          });
        }
        html += '</select>';
      } else {
        html += '<input type="' + (tp.type === 'number' ? 'number' : 'text') + '" data-prop-label="' + tp.label + '" value="' + (val !== null && val !== undefined ? String(val).replace(/"/g, '&quot;') : '') + '" style="background:transparent;border:none;border-bottom:1px solid var(--border-color,#555);color:var(--text-primary,#eee);padding:8px 0;font-size:1rem;outline:none;font-family:inherit"' + (tp.type === 'number' ? ' step="any"' : '') + '>';
      }

      if (tp.description) {
        var displayDesc = (de && propTranslations.descriptions[tp.description]) ? propTranslations.descriptions[tp.description] : tp.description;
        html += '<span style="font-size:0.7rem;color:var(--text-secondary,#666);margin-top:4px;line-height:1.3">' + displayDesc + '</span>';
      }
      html += '</div>';
    });

    html += '</div>';
    return html;
  }

  // ============================================================
  // HARDWARE-SEITE — Fermenter-Sektion injizieren
  // ============================================================
  function enhanceHardwarePage() {
    var hash = window.location.hash.replace('#', '');
    if (hash !== '/hardware') return;

    // Bestehende Tabellen patchen (Kessel/Sensor/Aktor)
    patchKettleTable();
    patchSensorTable();
    patchActorTable();

    // Hardware-Validierung anzeigen
    var gridContainer = document.querySelector('.MuiGrid-root.MuiGrid-container.MuiGrid-spacing-xs-3');
    if (gridContainer && !document.getElementById('cbpi-hw-warnings')) {
      renderHardwareWarnings(gridContainer);
    }

    if (document.getElementById('cbpi-fermenter-hardware')) return;

    // Hardware-Seite besteht aus MuiPaper-root Karten für Kessel/Sensor/Aktor
    // Finde den Grid-Container direkt statt über das letzte Paper zu gehen
    var gridContainer = document.querySelector('.MuiGrid-root.MuiGrid-container.MuiGrid-spacing-xs-3');
    if (!gridContainer) return;

    var de = currentLang === 'de';
    _isOurDomChange = true;

    // Grid-Item wie die anderen Sektionen erstellen
    var gridItemDiv = document.createElement('div');
    gridItemDiv.className = 'MuiGrid-root MuiGrid-item MuiGrid-grid-sm-12';
    gridItemDiv.id = 'cbpi-fermenter-hardware';
    gridItemDiv.style.padding = '12px';

    var paper = document.createElement('div');
    paper.className = 'MuiPaper-root MuiPaper-elevation1 MuiPaper-rounded';
    paper.style.padding = '10px';

    paper.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;padding:0 16px">' +
        '<div><span class="MuiTypography-root MuiTypography-h6" style="color:#00FF00">' + (de ? 'Gärbehälter' : 'Fermenter') + '</span></div>' +
        '<div><button class="MuiButtonBase-root MuiIconButton-root" id="fermenter-hw-add-hdr" style="display:flex;flex-direction:column;align-items:center;background:none;border:none;color:var(--text-primary);cursor:pointer;padding:4px 8px" title="' + (de ? 'Hinzufügen' : 'Add') + '">' +
          '<span style="font-size:1.5rem;line-height:1">+</span>' +
          '<span style="font-size:0.65rem;letter-spacing:0.05em">' + (de ? 'HINZUFÜGEN' : 'ADD') + '</span>' +
        '</button></div>' +
      '</div>' +
      '<div class="fermenter-hw-content" id="fermenter-hw-content">' +
        '<div style="padding:20px;text-align:center;color:var(--text-secondary)">' + (de ? 'Laden…' : 'Loading…') + '</div>' +
      '</div>';

    gridItemDiv.appendChild(paper);
    gridContainer.appendChild(gridItemDiv);
    _isOurDomChange = false;

    loadFermenterHardwareList();
  }

  function loadFermenterHardwareList() {
    var content = document.getElementById('fermenter-hw-content');
    if (!content) return;
    var de = currentLang === 'de';

    Promise.all([
      fetch('/fermenter/').then(function(r) { return r.json(); }),
      fetch('/sensor/').then(function(r) { return r.json(); }),
      fetch('/actor/').then(function(r) { return r.json(); })
    ]).then(function(results) {
      var fermData = results[0];
      var sensors = results[1].data || [];
      var actors = results[2].data || [];
      var fermenters = fermData.data || [];
      var types = fermData.types || {};

      _isOurDomChange = true;

      var html = '';

      if (fermenters.length > 0) {
        html += '<div class="MuiTableContainer-root" style="width:100%;overflow-x:auto">';
        html += '<table class="MuiTable-root" style="width:100%;border-collapse:collapse">';
        html += '<thead class="MuiTableHead-root"><tr class="MuiTableRow-root MuiTableRow-head">';
        html += '<th class="MuiTableCell-root MuiTableCell-head">' + (de ? 'Name' : 'Name') + '</th>';
        html += '<th class="MuiTableCell-root MuiTableCell-head">' + (de ? 'Logik' : 'Logic') + '</th>';
        html += '<th class="MuiTableCell-root MuiTableCell-head">' + (de ? 'Sensor' : 'Sensor') + '</th>';
        html += '<th class="MuiTableCell-root MuiTableCell-head">' + (de ? 'Drucksensor' : 'Pressure') + '</th>';
        html += '<th class="MuiTableCell-root MuiTableCell-head">' + (de ? 'Heizung' : 'Heater') + '</th>';
        html += '<th class="MuiTableCell-root MuiTableCell-head">' + (de ? 'Kühlung' : 'Cooler') + '</th>';
        html += '<th class="MuiTableCell-root MuiTableCell-head">' + (de ? 'Ventil' : 'Valve') + '</th>';
        html += '<th class="MuiTableCell-root MuiTableCell-head" style="text-align:right">' + (de ? 'Aktionen' : 'Actions') + '</th>';
        html += '</tr></thead><tbody class="MuiTableBody-root">';

        var sensorNames = {};
        sensors.forEach(function(s) { sensorNames[s.id] = s.name; });
        var actorNames = {};
        actors.forEach(function(a) { actorNames[a.id] = a.name; });

        fermenters.forEach(function(f) {
          html += '<tr class="MuiTableRow-root">';
          html += '<td class="MuiTableCell-root MuiTableCell-body" style="color:#00FF00">' + (f.name || '—') + '</td>';
          html += '<td class="MuiTableCell-root MuiTableCell-body">' + (f.type || '—') + '</td>';
          html += '<td class="MuiTableCell-root MuiTableCell-body">' + (sensorNames[f.sensor] || '—') + '</td>';
          html += '<td class="MuiTableCell-root MuiTableCell-body">' + (sensorNames[f.pressure_sensor] || '—') + '</td>';
          html += '<td class="MuiTableCell-root MuiTableCell-body">' + (actorNames[f.heater] || '—') + '</td>';
          html += '<td class="MuiTableCell-root MuiTableCell-body">' + (actorNames[f.cooler] || '—') + '</td>';
          html += '<td class="MuiTableCell-root MuiTableCell-body">' + (actorNames[f.valve] || '—') + '</td>';
          html += '<td class="MuiTableCell-root MuiTableCell-body" style="text-align:right;white-space:nowrap">';
          html += '<button class="MuiButtonBase-root MuiIconButton-root" data-ferm-delete="' + f.id + '" style="display:inline-flex;flex-direction:column;align-items:center;background:none;border:none;color:var(--text-primary);cursor:pointer;padding:4px 8px;vertical-align:top" title="' + (de ? 'Löschen' : 'Delete') + '">';
          html += '<svg style="width:24px;height:24px;fill:currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
          html += '<span style="font-size:0.65rem;color:#f44336;letter-spacing:0.05em">' + (de ? 'LÖSCHEN' : 'DELETE') + '</span>';
          html += '</button>';
          html += '<button class="MuiButtonBase-root MuiIconButton-root" data-ferm-edit="' + f.id + '" style="display:inline-flex;flex-direction:column;align-items:center;background:none;border:none;color:var(--text-primary);cursor:pointer;padding:4px 8px;vertical-align:top" title="' + (de ? 'Bearbeiten' : 'Edit') + '">';
          html += '<svg style="width:24px;height:24px;fill:currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
          html += '<span style="font-size:0.65rem;color:#4caf50;letter-spacing:0.05em">' + (de ? 'BEARBEITEN' : 'EDIT') + '</span>';
          html += '</button>';
          html += '<button class="MuiButtonBase-root MuiIconButton-root" data-ferm-view="' + f.id + '" style="display:inline-flex;flex-direction:column;align-items:center;background:none;border:none;color:var(--text-primary);cursor:pointer;padding:4px 8px;vertical-align:top" title="' + (de ? 'Anzeigen' : 'View') + '">';
          html += '<svg style="width:24px;height:24px;fill:currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>';
          html += '<span style="font-size:0.65rem;letter-spacing:0.05em">' + (de ? 'ANZEIGEN' : 'VIEW') + '</span>';
          html += '</button>';
          html += '</td>';
          html += '</tr>';
        });

        html += '</tbody></table></div>';
      } else {
        html += '<div style="padding:24px;text-align:center;color:var(--text-secondary)">' + (de ? 'Noch keine Gärbehälter angelegt' : 'No fermenters yet') + '</div>';
      }

      content.innerHTML = html;
      _isOurDomChange = false;

      // Event Handler für den Header-Button
      var addBtn = document.getElementById('fermenter-hw-add-hdr');
      if (addBtn) {
        addBtn.onclick = function() {
          showHardwareFermenterForm(sensors, actors, types);
        };
      }

      // Löschen-Handler
      content.querySelectorAll('[data-ferm-delete]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var id = btn.getAttribute('data-ferm-delete');
          showConfirm(
            de ? 'Gärbehälter löschen?' : 'Delete fermenter?',
            de ? 'Der Gärbehälter und seine Einstellungen werden entfernt.' : 'The fermenter and its settings will be removed.',
            function() {
              btn.disabled = true;
              fetch('/fermenter/' + encodeURIComponent(id), { method: 'DELETE' })
                .then(function() { showToast(de ? 'Gärbehälter gelöscht' : 'Fermenter deleted', 'success'); setTimeout(loadFermenterHardwareList, 500); })
                .catch(function(err) { console.error('[Fermenter] Delete failed:', err); btn.disabled = false; showToast(de ? 'Fehler beim Löschen' : 'Delete failed', 'error'); });
            },
            { danger: true, confirmText: de ? '🗑 Löschen' : '🗑 Delete' }
          );
        });
      });

      // Bearbeiten-Handler — navigiert zur Fermenter Config-Seite
      content.querySelectorAll('[data-ferm-edit]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var id = btn.getAttribute('data-ferm-edit');
          window.location.hash = '#/fermenter/' + id;
        });
      });

      // Anzeigen-Handler — zeigt Fermenter-Details in einem Dialog
      content.querySelectorAll('[data-ferm-view]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var id = btn.getAttribute('data-ferm-view');
          var f = fermenters.find(function(x) { return x.id === id; });
          if (!f) return;
          showFermenterDetails(f, sensorNames, actorNames, types, de);
        });
      });
    }).catch(function(err) {
      console.error('[Fermenter HW] Load failed:', err);
      content.innerHTML = '<div class="fermenter-error">' + (de ? 'Fehler beim Laden' : 'Load error') + '</div>';
    });
  }

  function showFermenterDetails(f, sensorNames, actorNames, types, de) {
    // Detail-Dialog als Overlay (wie bei den anderen Hardware-Elementen)
    var existing = document.getElementById('cbpi-fermenter-detail');
    if (existing) existing.remove();

    var typeInfo = types[f.type] || {};
    var props = f.props || {};
    var typeProps = typeInfo.properties || [];

    _isOurDomChange = true;
    var overlay = document.createElement('div');
    overlay.id = 'cbpi-fermenter-detail';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;padding:20px';

    var html = '<div style="background:var(--bg-surface,#1e1e1e);border:1px solid var(--border-color,#333);border-radius:16px;width:100%;max-width:600px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.5);color:var(--text-primary,#eee);position:relative;transform:translateZ(0)">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid var(--border-color,#333)">';
    html += '<h2 style="margin:0;font-size:1.3rem;color:#00FF00">' + (f.name || 'Fermenter') + '</h2>';
    html += '<button id="ferm-detail-close" style="background:none;border:1px solid var(--border-color,#333);color:var(--text-secondary,#888);font-size:1.3rem;cursor:pointer;border-radius:8px;width:36px;height:36px;display:flex;align-items:center;justify-content:center">✕</button>';
    html += '</div>';

    html += '<div style="padding:20px 24px">';

    // Basisdaten
    var rows = [
      [de ? 'Logik-Typ' : 'Logic Type', f.type || '—'],
      [de ? 'Temperatursensor' : 'Temp Sensor', sensorNames[f.sensor] || '—'],
      [de ? 'Drucksensor' : 'Pressure Sensor', sensorNames[f.pressure_sensor] || '—'],
      [de ? 'Heizung' : 'Heater', actorNames[f.heater] || '—'],
      [de ? 'Kühlung' : 'Cooler', actorNames[f.cooler] || '—'],
      [de ? 'Ventil' : 'Valve', actorNames[f.valve] || '—'],
      [de ? 'Zieltemperatur' : 'Target Temp', f.target_temp ? f.target_temp + '°C' : '—'],
      [de ? 'Zieldruck' : 'Target Pressure', f.target_pressure ? f.target_pressure + ' bar' : '—'],
      [de ? 'Sudname' : 'Brew Name', f.brewname || '—'],
      ['Status', f.state ? (de ? 'Aktiv' : 'Active') : (de ? 'Inaktiv' : 'Inactive')],
      [de ? 'Schritte' : 'Steps', (f.steps || []).length + '']
    ];

    html += '<table style="width:100%;border-collapse:collapse">';
    rows.forEach(function(r) {
      html += '<tr style="border-bottom:1px solid var(--border-color,#333)">';
      html += '<td style="padding:10px 12px;color:var(--text-secondary,#888);font-size:0.85rem;width:40%">' + r[0] + '</td>';
      html += '<td style="padding:10px 12px;font-size:0.9rem">' + r[1] + '</td>';
      html += '</tr>';
    });
    html += '</table>';

    // Logik-Properties (wenn vorhanden)
    if (typeProps.length > 0) {
      html += '<h3 style="margin:20px 0 10px;font-size:1rem;color:var(--text-secondary,#888)">' + (de ? 'Logik-Einstellungen' : 'Logic Settings') + '</h3>';
      html += '<table style="width:100%;border-collapse:collapse">';
      typeProps.forEach(function(tp) {
        var val = props[tp.label] !== undefined ? props[tp.label] : (tp.default_value || '—');
        var displayLabel = (de && propTranslations.labels[tp.label]) ? propTranslations.labels[tp.label] : tp.label;
        html += '<tr style="border-bottom:1px solid var(--border-color,#333)">';
        html += '<td style="padding:8px 12px;color:var(--text-secondary,#888);font-size:0.85rem;width:40%">' + displayLabel + '</td>';
        html += '<td style="padding:8px 12px;font-size:0.9rem">' + val + '</td>';
        html += '</tr>';
      });
      html += '</table>';
    }

    html += '</div></div>';
    overlay.innerHTML = html;
    document.body.appendChild(overlay);
    _isOurDomChange = false;

    document.getElementById('ferm-detail-close').addEventListener('click', function() {
      overlay.remove();
    });
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.remove();
    });
  }

  function showHardwareFermenterForm(sensors, actors, types) {
    var content = document.getElementById('fermenter-hw-content');
    if (!content) return;
    var de = currentLang === 'de';

    var sensorOpts = '<option value="">— ' + (de ? 'Kein Sensor' : 'No sensor') + ' —</option>';
    sensors.forEach(function(s) { sensorOpts += '<option value="' + s.id + '">' + s.name + '</option>'; });

    var actorOpts = '<option value="">— ' + (de ? 'Keiner' : 'None') + ' —</option>';
    actors.forEach(function(a) { actorOpts += '<option value="' + a.id + '">' + a.name + '</option>'; });

    var typeOpts = '';
    Object.keys(types).forEach(function(t) { typeOpts += '<option value="' + t + '">' + t + '</option>'; });

    _isOurDomChange = true;
    content.innerHTML =
      '<div class="fermenter-hw-form">' +
        '<div class="fermenter-form-grid">' +
          '<div class="fermenter-form-field">' +
            '<label>' + (de ? 'Name' : 'Name') + ' *</label>' +
            '<input type="text" id="ferm-hw-name" class="fermenter-input" placeholder="' + (de ? 'z.B. Gärfass 1' : 'e.g. Fermenter 1') + '">' +
          '</div>' +
          '<div class="fermenter-form-field">' +
            '<label>' + (de ? 'Logik-Typ' : 'Logic Type') + ' *</label>' +
            '<select id="ferm-hw-type" class="fermenter-input">' + typeOpts + '</select>' +
          '</div>' +
          '<div class="fermenter-form-field">' +
            '<label>' + (de ? 'Temperatursensor' : 'Temp Sensor') + ' *</label>' +
            '<select id="ferm-hw-sensor" class="fermenter-input">' + sensorOpts + '</select>' +
          '</div>' +
          '<div class="fermenter-form-field">' +
            '<label>' + (de ? 'Drucksensor' : 'Pressure Sensor') + '</label>' +
            '<select id="ferm-hw-pressure" class="fermenter-input">' + sensorOpts + '</select>' +
          '</div>' +
          '<div class="fermenter-form-field">' +
            '<label>' + (de ? 'Heizung' : 'Heater') + '</label>' +
            '<select id="ferm-hw-heater" class="fermenter-input">' + actorOpts + '</select>' +
          '</div>' +
          '<div class="fermenter-form-field">' +
            '<label>' + (de ? 'Kühlung' : 'Cooler') + '</label>' +
            '<select id="ferm-hw-cooler" class="fermenter-input">' + actorOpts + '</select>' +
          '</div>' +
          '<div class="fermenter-form-field">' +
            '<label>' + (de ? 'Ventil (Spunding)' : 'Valve (Spunding)') + '</label>' +
            '<select id="ferm-hw-valve" class="fermenter-input">' + actorOpts + '</select>' +
          '</div>' +
          '<div class="fermenter-form-field">' +
            '<label>' + (de ? 'Zieltemperatur (°C)' : 'Target Temp (°C)') + '</label>' +
            '<input type="number" id="ferm-hw-target" class="fermenter-input" value="18" step="0.5" min="0" max="40">' +
          '</div>' +
        '</div>' +
        '<div class="fermenter-form-actions">' +
          '<button class="fermenter-ctrl-btn" id="ferm-hw-cancel">' + (de ? 'Abbrechen' : 'Cancel') + '</button>' +
          '<button class="fermenter-ctrl-btn start" id="ferm-hw-submit">✅ ' + (de ? 'Erstellen' : 'Create') + '</button>' +
        '</div>' +
      '</div>';
    _isOurDomChange = false;

    // Input-Felder vor Event-Interference schützen
    var hwFormInputs = content.querySelectorAll('input, select');
    hwFormInputs.forEach(function(inp) {
      inp.addEventListener('keydown', function(e) { e.stopPropagation(); });
      inp.addEventListener('keyup', function(e) { e.stopPropagation(); });
      inp.addEventListener('keypress', function(e) { e.stopPropagation(); });
      inp.addEventListener('input', function(e) { e.stopPropagation(); });
      inp.addEventListener('mousedown', function(e) { e.stopPropagation(); });
      inp.addEventListener('focus', function(e) { e.stopPropagation(); });
    });

    document.getElementById('ferm-hw-cancel').addEventListener('click', function() {
      loadFermenterHardwareList();
    });
    document.getElementById('ferm-hw-submit').addEventListener('click', function() {
      submitHardwareFermenter(sensors, actors, types);
    });
  }

  function submitHardwareFermenter(sensors, actors, types) {
    var de = currentLang === 'de';
    var name = (document.getElementById('ferm-hw-name').value || '').trim();
    var type = document.getElementById('ferm-hw-type').value;
    var sensor = document.getElementById('ferm-hw-sensor').value;

    if (!name) { alert(de ? 'Bitte einen Namen eingeben!' : 'Please enter a name!'); return; }
    if (!type) { alert(de ? 'Bitte einen Logik-Typ wählen!' : 'Please select a logic type!'); return; }
    if (!sensor) { alert(de ? 'Bitte einen Sensor wählen!' : 'Please select a sensor!'); return; }

    var btn = document.getElementById('ferm-hw-submit');
    if (btn) { btn.disabled = true; btn.textContent = de ? '⏳ Wird erstellt…' : '⏳ Creating…'; }

    var payload = {
      name: name,
      type: type,
      sensor: sensor,
      pressure_sensor: document.getElementById('ferm-hw-pressure').value || '',
      heater: document.getElementById('ferm-hw-heater').value || '',
      cooler: document.getElementById('ferm-hw-cooler').value || '',
      valve: document.getElementById('ferm-hw-valve').value || '',
      target_temp: parseFloat(document.getElementById('ferm-hw-target').value) || 18,
      target_pressure: 0,
      brewname: '',
      props: {}
    };

    fetch('/fermenter/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function() {
      setTimeout(loadFermenterHardwareList, 500);
    })
    .catch(function(err) {
      console.error('[Fermenter] Create failed:', err);
      alert(de ? 'Fehler: ' + err.message : 'Error: ' + err.message);
      if (btn) { btn.disabled = false; btn.textContent = de ? '✅ Erstellen' : '✅ Create'; }
    });
  }

  // ============================================================
  // PLUGIN-MANAGEMENT — Erweiterte Plugin-Ansicht
  // ============================================================
  function enhancePluginPage() {
    var hash = window.location.hash.replace('#', '');
    if (hash !== '/plugins') return;
    if (document.getElementById('cbpi-plugin-enhance')) return;

    var target = findContentTarget();
    if (!target) return;

    var de = currentLang === 'de';

    var marker = document.createElement('div');
    marker.id = 'cbpi-plugin-enhance';
    marker.style.display = 'none';
    target.appendChild(marker);

    // Plugin-Info-Panel
    var panel = document.createElement('div');
    panel.className = 'plugin-info-panel';
    panel.innerHTML =
      '<div class="plugin-info-header">' +
        '<h3>🧩 ' + (de ? 'Plugin-Übersicht' : 'Plugin Overview') + '</h3>' +
      '</div>' +
      '<div class="plugin-info-body">' +
        '<div class="plugin-section">' +
          '<h4>' + (de ? 'Installierte Erweiterungen' : 'Installed Extensions') + '</h4>' +
          '<div id="plugin-installed-list" class="plugin-list">' +
            '<div class="plugin-loading">' + (de ? 'Lade...' : 'Loading...') + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="plugin-section">' +
          '<h4>💡 ' + (de ? 'Empfohlene Plugins' : 'Recommended Plugins') + '</h4>' +
          '<div class="plugin-recommended">' +
            renderPluginRecommendations(de) +
          '</div>' +
        '</div>' +
        '<div class="plugin-section">' +
          '<h4>📦 ' + (de ? 'Plugin installieren (pip)' : 'Install Plugin (pip)') + '</h4>' +
          '<div class="plugin-install-form">' +
            '<input type="text" id="plugin-pip-name" class="plugin-input" placeholder="' + (de ? 'z.B. cbpi4-PIDBoil' : 'e.g. cbpi4-PIDBoil') + '">' +
            '<button class="plugin-install-btn" id="plugin-install-btn">📥 ' + (de ? 'Installieren' : 'Install') + '</button>' +
          '</div>' +
          '<div class="plugin-install-note">' +
            (de ? '⚠️ Nach Installation muss CraftBeerPi neu gestartet werden (System → Neustart).' : '⚠️ CraftBeerPi restart required after installation (System → Restart).') +
          '</div>' +
        '</div>' +
      '</div>';

    // Nach den Help-Bannern einfügen
    var helpBanner = document.getElementById('cbpi-help-banner');
    var pageTitle = document.getElementById('cbpi-page-title');
    var refNode = helpBanner || pageTitle;
    if (refNode && refNode.nextSibling) {
      target.insertBefore(panel, refNode.nextSibling);
    } else {
      target.insertBefore(panel, target.firstChild);
    }

    // Installierte Plugins laden
    loadInstalledPlugins();

    // Install-Button
    document.getElementById('plugin-install-btn').addEventListener('click', function() {
      var name = document.getElementById('plugin-pip-name').value.trim();
      if (!name) return;
      var btn = document.getElementById('plugin-install-btn');
      var deLang = currentLang === 'de';
      showConfirm(
        deLang ? 'Plugin installieren?' : 'Install plugin?',
        deLang ? 'Plugin "' + name + '" wird installiert. Nach der Installation muss CraftBeerPi neu gestartet werden.'
               : 'Plugin "' + name + '" will be installed. CraftBeerPi restart required after installation.',
        function() {
          btn.disabled = true;
          btn.textContent = '⏳ ...';
          fetch('/plugin/install/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ package_name: name })
          })
            .then(function(r) {
              if (!r.ok) throw new Error('HTTP ' + r.status);
              showToast(deLang ? 'Plugin installiert! Bitte CraftBeerPi neu starten.' : 'Plugin installed! Please restart CraftBeerPi.', 'success', 6000);
              btn.disabled = false;
              btn.textContent = '📥 ' + (deLang ? 'Installieren' : 'Install');
              loadInstalledPlugins();
            })
            .catch(function(err) {
              showToast((deLang ? 'Installation fehlgeschlagen: ' : 'Installation failed: ') + err.message, 'error', 5000);
              btn.disabled = false;
              btn.textContent = '📥 ' + (deLang ? 'Installieren' : 'Install');
            });
        }
      );
    });
  }

  function loadInstalledPlugins() {
    var de = currentLang === 'de';
    var listEl = document.getElementById('plugin-installed-list');
    if (!listEl) return;

    fetch('/plugin/list')
      .then(function(r) { return r.json(); })
      .then(function(plugins) {
        if (!plugins || plugins.length === 0) {
          listEl.innerHTML = '<div class="plugin-empty">' + (de ? 'Keine Plugins installiert' : 'No plugins installed') + '</div>';
          return;
        }
        var localPlugins = plugins.filter(function(p) { return p.Name || p.name; });
        listEl.innerHTML = localPlugins.map(function(p) {
          var name = p.Name || p.name || 'Unknown';
          var version = p.Version || p.version || '';
          var desc = p.Description || p.description || '';
          return '<div class="plugin-item">' +
            '<div class="plugin-item-name">' + name + (version ? ' <span class="plugin-version">v' + version + '</span>' : '') + '</div>' +
            (desc ? '<div class="plugin-item-desc">' + desc + '</div>' : '') +
          '</div>';
        }).join('');
      })
      .catch(function() {
        listEl.innerHTML = '<div class="plugin-error">' + (de ? 'Fehler beim Laden' : 'Error loading') + '</div>';
      });
  }

  function renderPluginRecommendations(de) {
    var plugins = [
      { name: 'cbpi4-PIDBoil', desc: de ? 'PID-Regler mit Kocherkennung' : 'PID controller with boil detection' },
      { name: 'cbpi4-BM_PID_SmartBoilWithPump', desc: de ? 'Braumeister PID + Pumpensteuerung' : 'Braumeister PID + pump control' },
      { name: 'cbpi4-pt100x', desc: de ? 'PT100/PT1000 Sensor-Support' : 'PT100/PT1000 sensor support' },
      { name: 'cbpi4-buzzer', desc: de ? 'Buzzer/Pieper für Benachrichtigungen' : 'Buzzer for notifications' },
      { name: 'cbpi4-iSpindle', desc: de ? 'iSpindle Gärungsmonitor' : 'iSpindle fermentation monitor' },
      { name: 'cbpi4-Flowmeter', desc: de ? 'Durchflussmesser-Plugin' : 'Flowmeter plugin' }
    ];
    return plugins.map(function(p) {
      return '<div class="plugin-rec-item">' +
        '<div class="plugin-rec-name">📦 ' + p.name + '</div>' +
        '<div class="plugin-rec-desc">' + p.desc + '</div>' +
      '</div>';
    }).join('');
  }

  function init() {
    // Startseite: Präferenz aus localStorage lesen
    var hash = window.location.hash.replace('#', '');
    if (!hash || hash === '/' || hash === '') {
      var pref = localStorage.getItem('cbpi_start_page') || 'cockpit';
      _cockpitMode = (pref === 'cockpit');
      // Sicherstellen dass wir auf #/ sind (React's Dashboard-Route)
      if (window.location.hash !== '#/') {
        window.location.hash = '#/';
      }
    }
    // Temperatur-Historie laden (wenn vom letzten Brauvorgang vorhanden)
    loadTempHistory();
    // Notification-Berechtigung anfragen
    requestNotificationPermission();
    injectLateStyles();
    translatePage();
    createLanguageToggle();
    createHelpButton();
    createThemeToggle();
    createExpertToggle();
    applyExpertMode();
    createStatusBar();
    startOnlineCheck();
    buildCockpit();
    buildFermenterDashboard();
    buildHelpPage();
    addRecipeTools();
    enhanceRecipePage();
    enhancePluginPage();
    enhanceSettingsPage();
    checkOnboarding();
  }

  function onRouteChange() {
    var h = window.location.hash;
    if (h !== lastHash) {
      lastHash = h;
      // Cockpit stoppen wenn weg von /dashboard oder Cockpit-Modus aus
      var path = h.replace('#', '');
      if (path !== '/') {
        _cockpitMode = false;
        stopCockpit();
      }
      if (path !== '/fermenter') {
        stopFermenterDashboard();
      }
      if (path !== '/help') {
        stopHelpPage();
      }
      setTimeout(function () {
        translatePage();
        buildCockpit();
        buildFermenterDashboard();
        buildHelpPage();
        addRecipeTools();
        enhanceRecipePage();
        enhancePluginPage();
        enhanceHardwarePage();
        enhanceFermenterDetailPage();
        enhanceSettingsPage();
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
      // Mutations innerhalb eigener Overlays/Sektionen ignorieren
      if (m.target && m.target.closest && (m.target.closest('#cbpi-fermenter-page') || m.target.closest('#cbpi-fermenter-overlay') || m.target.closest('#cbpi-fermenter-hardware') || m.target.closest('#cbpi-fermenter-config-form') || m.target.closest('#cbpi-help-page'))) continue;
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
      buildFermenterDashboard();
      buildHelpPage();
      addRecipeTools();
      enhanceRecipePage();
      enhancePluginPage();
      enhanceHardwarePage();
      enhanceFermenterDetailPage();
      enhanceSettingsPage();
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
