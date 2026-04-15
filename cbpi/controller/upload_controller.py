"""upload_controller.py - Rezept-Import aus externen Formaten

Konvertiert Rezepte aus verschiedenen Quellen in das CraftBeerPi-Format:
    - BeerXML (.xml): Standard-Brauformat
    - MMuM-JSON (.json): MaischeMalzUndMehr Export
    - Kleiner Brauhelfer (.db): SQLite-Datenbank
    - Brewfather (API): Cloud-basierter Rezept-Import

Der Import erzeugt automatisch Maisch-Schritte (MashIn, Mash, Boil)
mit den entsprechenden Temperaturen, Zeiten und Hopfengaben.
"""

import os
import pathlib
import aiohttp
from aiohttp import web
import asyncio
from cbpi.api import *
import xml.etree.ElementTree
import sqlite3
from voluptuous.schema_builder import message
from cbpi.api.dataclasses import NotificationAction, NotificationType, Actor, Sensor, Kettle
from cbpi.controller.kettle_controller import KettleController
from cbpi.api.base import CBPiBase
from cbpi.api.config import ConfigType
import webbrowser
import logging
import os.path
from os import listdir
from os.path import isfile, join
import json
import shortuuid
import yaml
from ..api.step import StepMove, StepResult, StepState
import re
import base64


class UploadController:

    def __init__(self, cbpi):
        self.cbpi = cbpi
        self.logger = logging.getLogger(__name__)
   
    async def get_kbh_recipes(self):
        try:
            path = self.cbpi.config_folder.get_upload_file("kbh.db")
            conn = sqlite3.connect(path)
            c = conn.cursor()
            c.execute('SELECT ID, Sudname, Status FROM Sud')
            data = c.fetchall()
            result = []
            for row in data:
                element = {'value': str(row[0]), 'label': str(row[1])}
                result.append(element)
            return result
        except Exception:
            return []

    async def get_xml_recipes(self):
        try:
            path = self.cbpi.config_folder.get_upload_file("beer.xml")
            e = xml.etree.ElementTree.parse(path).getroot()
            result =[] 
            counter = 1
            for idx, val in enumerate(e.findall('RECIPE')):
                element = {'value': str(counter), 'label': val.find("NAME").text}
                result.append(element)
                counter +=1
            return result
        except Exception:
            return []

    def _detect_json_format(self, data):
        """Erkennt ob JSON-Daten MMuM oder Brewfather Format sind."""
        if 'mash' in data and 'fermentables' in data:
            return 'brewfather'
        if 'Rasten' in data or 'Malze' in data or 'Rezeptquelle' in data:
            return 'mmum'
        # MMuM v1.x Felder
        if 'Infusion_Rastzeit1' in data or 'Infusion_Rasttemperatur1' in data:
            return 'mmum'
        return 'mmum'  # Fallback

    async def get_json_recipes(self):
        try:
            path = self.cbpi.config_folder.get_upload_file("mmum.json")
            e = json.load(open(path))
            fmt = self._detect_json_format(e)
            label_prefix = 'Brewfather' if fmt == 'brewfather' else 'MMuM'
            name = e.get('name', e.get('Name', 'Unbekanntes Rezept'))
            result = []
            result.append({'value': str(1), 'label': '{}: {}'.format(label_prefix, name)})
            return result
        except Exception:
            return []

    async def get_brewfather_recipes(self,offset=0):
        brewfather = True
        result=[]
        self.url="https://api.brewfather.app/v1/recipes"
        brewfather_user_id = self.cbpi.config.get("brewfather_user_id", None)
        if brewfather_user_id == "" or brewfather_user_id is None:
            brewfather = False

        brewfather_api_key = self.cbpi.config.get("brewfather_api_key", None)
        if brewfather_api_key == "" or brewfather_api_key is None:
            brewfather = False

        if brewfather == True:
            encodedData = base64.b64encode(bytes(f"{brewfather_user_id}:{brewfather_api_key}", "ISO-8859-1")).decode("ascii")
            headers={"Authorization": "Basic %s" % encodedData}
            parameters={"limit": 50, 'offset': offset}
            async with aiohttp.ClientSession(headers=headers) as bf_session:
                async with bf_session.get(self.url, params=parameters) as r:
                    bf_recipe_list = await r.json()
                await bf_session.close()

            if bf_recipe_list:
                for row in bf_recipe_list:
                    recipe_id = row['_id']
                    name = row['name']
                    element = {'value': recipe_id, 'label': name}
                    result.append(element)
                return result
            else:
                return []

        else:
            return []

        
    def get_creation_path(self):
        creation_path = self.cbpi.config.get("RECIPE_CREATION_PATH", "upload")
        path = {'path': 'upload'} if creation_path == '' else {'path': creation_path}
        return path

    def allowed_file(self, filename, extension):
        return '.' in filename and filename.rsplit('.', 1)[1] in set([extension])


    async def FileUpload(self, data):
        fileData = data['File']
        filename = fileData.filename
        recipe_file = fileData.file
        content_type = fileData.content_type

        if content_type == 'text/xml':
            try:
                beer_xml = recipe_file.read().decode('utf-8','replace')
                if recipe_file and self.allowed_file(filename, 'xml'):
                    self.path = self.cbpi.config_folder.get_upload_file("beer.xml")
    
                    f = open(self.path, "w")
                    f.write(beer_xml)
                    f.close()
                    self.cbpi.notify("Success", "XML Recipe {} has been uploaded".format(filename), NotificationType.SUCCESS)
            except Exception as e:
                self.cbpi.notify("Error" "XML Recipe upload failed: {}".format(e), NotificationType.ERROR)
                pass

        elif content_type == 'application/json':
            try:
                mmum_json = recipe_file.read().decode('utf-8','replace')
                if recipe_file and self.allowed_file(filename, 'json'):
                    self.path = self.cbpi.config_folder.get_upload_file("mmum.json")
    
                    f = open(self.path, "w")
                    f.write(mmum_json)
                    f.close()
                    self.cbpi.notify("Success", "JSON Recipe {} has been uploaded".format(filename), NotificationType.SUCCESS)
            except Exception as e:
                self.cbpi.notify("Error" "JSON Recipe upload failed: {}".format(e), NotificationType.ERROR)
                pass

        elif content_type == 'application/octet-stream':
            try:
                content = recipe_file.read()
                if recipe_file and self.allowed_file(filename, 'sqlite'):
                    self.path = self.cbpi.config_folder.get_upload_file("kbh.db")

                    f=open(self.path, "wb")
                    f.write(content)
                    f.close()
                    self.cbpi.notify("Success", "Kleiner Brauhelfer database has been uploaded", NotificationType.SUCCESS)

            except Exception as e:
                self.cbpi.notify("Error", "Kleiner Brauhelfer database upload failed", NotificationType.ERROR)
                logging.error("KBH upload failed: %s", e)
        else:
            self.cbpi.notify("Error", "Wrong content type. Upload failed", NotificationType.ERROR)

    async def kbh_recipe_creation(self, Recipe_ID):
        config = self.get_config_values()
        if self.kettle is not None:
            # load beerxml file located in upload folder
            self.path = self.cbpi.config_folder.get_upload_file("kbh.db")
            if os.path.exists(self.path) is False:
                self.cbpi.notify("Datei nicht gefunden", "Bitte eine KBH-V2-Datenbankdatei hochladen", NotificationType.ERROR)
                
            try:
                # Get Recipe Nmae
                conn = sqlite3.connect(self.path)
                c = conn.cursor()
                c.execute('SELECT Sudname FROM Sud WHERE ID = ?', (Recipe_ID,))
                row = c.fetchone()
                name = row[0]

                # get MashIn Temp
                mashin_temp = None
                c.execute('SELECT Temp FROM Rasten WHERE Typ = 0 AND SudID = ?', (Recipe_ID,))
                row = c.fetchone()
                try:
                    if self.cbpi.config.get("TEMP_UNIT", "C") == "C":
                        mashin_temp = str(int(row[0]))
                    else:
                        mashin_temp = str(round(9.0 / 5.0 * int(row[0]) + 32))
                except (TypeError, IndexError):
                    pass

                # get the hop addition times
                c.execute('SELECT Zeit FROM Hopfengaben WHERE Vorderwuerze = 0 AND SudID = ?', (Recipe_ID,))
                hops = c.fetchall()

                # get the misc addition times
                c.execute('SELECT Zugabedauer FROM WeitereZutatenGaben WHERE Zeitpunkt = 1 AND SudID = ?', (Recipe_ID,))
                miscs = c.fetchall()

                try:
                    c.execute('SELECT Zeit FROM Hopfengaben WHERE Vorderwuerze = 1 AND SudID = ?', (Recipe_ID,))
                    FW_Hops = c.fetchall()
                    FirstWort = self.getFirstWort(FW_Hops,"kbh")
                except Exception:
                    FirstWort = "No"

                c.execute('SELECT Kochdauer FROM Sud WHERE ID = ?', (Recipe_ID,))
                row = c.fetchone()
                BoilTime = str(int(row[0]))



                await self.create_recipe(name)

                if mashin_temp is not None:
                    step_type = self.mashin if self.mashin != "" else "MashInStep"
                    step_string = { "name": "Einmaischen",
                                    "props": {
                                        "AutoMode": self.AutoMode,
                                        "Kettle": self.id,
                                        "Sensor": self.kettle.sensor,
                                        "Temp": mashin_temp,
                                        "Timer": "0",
                                        "Notification": "Zieltemperatur erreicht. Bitte Malz zugeben."
                                        },
                                    "status_text": "",
                                    "status": "I",
                                    "type": step_type
                                    }
                    await self.create_step(step_string)

                for row in c.execute('SELECT Name, Temp, Dauer FROM Rasten WHERE Typ <> 0 AND SudID = ?', (Recipe_ID,)):
                    if mashin_temp is None and self.addmashin == "Yes":
                        step_type = self.mashin if self.mashin != "" else "MashInStep"
                        step_string = { "name": "Einmaischen",
                                    "props": {
                                        "AutoMode": self.AutoMode,
                                        "Kettle": self.id,
                                        "Sensor": self.kettle.sensor,
                                        "Temp": str(int(row[1])) if self.TEMP_UNIT == "C" else str(round(9.0 / 5.0 * int(row[1]) + 32)),
                                        "Timer": "0",
                                        "Notification": "Zieltemperatur erreicht. Bitte Malz zugeben."
                                        },
                                    "status_text": "",
                                    "status": "I",
                                    "type": step_type
                                    }
                        await self.create_step(step_string)


                    step_type = self.mash if self.mash != "" else "MashStep"
                    step_string = { "name": str(row[0]),
                                    "props": {
                                        "AutoMode": self.AutoMode,
                                        "Kettle": self.id,
                                        "Sensor": self.kettle.sensor,
                                        "Temp": str(int(row[1])) if self.TEMP_UNIT == "C" else str(round(9.0 / 5.0 * int(row[1]) + 32)),
                                        "Timer": str(int(row[2]))
                                        },
                                    "status_text": "",
                                    "status": "I",
                                    "type": step_type
                                    }
                    await self.create_step(step_string)

                # Laeutern -> Benachrichtigung, wartet auf Benutzer
                if self.mashout == "NotificationStep":
                    step_string = { "name": "Laeutern",
                                    "props": {
                                        "AutoNext": "No",
                                        "Kettle": self.id,
                                        "Notification": "Maischprozess abgeschlossen. Bitte Laeutern starten und dann Weiter druecken."

                                        },
                                    "status_text": "",
                                    "status": "I",
                                    "type": self.mashout
                                    }
                    await self.create_step(step_string)


                Hops = self.getBoilAlerts(hops, miscs, "kbh")
                step_type = self.boil if self.boil != "" else "BoilStep"
                step_string = { "name": "Kochen",
                            "props": {
                                "AutoMode": self.AutoMode,
                                "Kettle": self.boilid,
                                "Sensor": self.boilkettle.sensor,
                                "Temp": int(self.BoilTemp),
                                "Timer": BoilTime,
                                "First_Wort": FirstWort,
                                "LidAlert": "Yes",
                                "Hop_1": Hops[0],
                                "Hop_2": Hops[1],
                                "Hop_3": Hops[2],
                                "Hop_4": Hops[3],
                                "Hop_5": Hops[4],
                                "Hop_6": Hops[5]
                                },
                            "status_text": "",
                            "status": "I",
                            "type": step_type 
                        }

                await self.create_step(step_string)

                await self.create_Whirlpool_Cooldown()
 
                await self.save_recipe_steps()
                self.cbpi.notify('KBH-Rezept erstellt', name, NotificationType.INFO)

            except Exception as e:
                self.cbpi.notify('KBH-Rezept fehlgeschlagen', name, NotificationType.ERROR)
                logging.error("KBH recipe creation failed: %s", e)
        else:
            self.cbpi.notify('Rezept-Import', 'Kein Standard-Kessel definiert. Bitte in den Einstellungen festlegen.', NotificationType.ERROR)

    def findMax(self, string):
        self.path = self.cbpi.config_folder.get_upload_file("mmum.json")
        e = json.load(open(self.path))
        for idx in range(1,20):
            search_string = string.replace("%%",str(idx))
            i = idx
            if search_string not in e:
                break
        return i

    def getJsonMashin(self, id):
        self.path = self.cbpi.config_folder.get_upload_file("mmum.json")
        e = json.load(open(self.path))
        # MMuM v2.0: Einmaischtemperatur direkt im Feld
        if 'Einmaischtemperatur' in e:
            return str(int(float(e['Einmaischtemperatur'])))
        # MMuM v1.x: Altes Feldformat
        return str(int(float(e.get('Infusion_Einmaischtemperatur', 57))))

    async def json_recipe_creation(self, Recipe_ID):
        config = self.get_config_values()

        if self.kettle is not None:
            # load json file located in upload folder
            self.path = self.cbpi.config_folder.get_upload_file("mmum.json")
            if os.path.exists(self.path) is False:
                self.cbpi.notify("Datei nicht gefunden", "Bitte eine JSON-Datei hochladen", NotificationType.ERROR)
                return

            # Auto-detect: Brewfather oder MMuM?
            try:
                with open(self.path) as f:
                    probe = json.load(f)
                fmt = self._detect_json_format(probe)
            except Exception:
                fmt = 'mmum'

            if fmt == 'brewfather':
                logging.info("Brewfather-JSON erkannt, verwende Brewfather-Import")
                await self.brewfather_json_recipe_creation(probe)
                return

            e = probe
            name = e['Name']
            boil_time = float(e['Kochzeit_Wuerze'])
            
            await self.create_recipe(name)
            
            
            hops = []
            firstHops = []
            miscs = []
            # MMuM v2.0: Hopfenkochen als Array
            if 'Hopfenkochen' in e and isinstance(e['Hopfenkochen'], list):
                for hop in e['Hopfenkochen']:
                    hops_name = "%sg %s %s%% alpha" % (hop.get('Menge', ''), hop.get('Sorte', ''), hop.get('Alpha', ''))
                    if hop.get('Typ') == 'Vorderwuerze':
                        firstHops.append({"name": hops_name})
                    else:
                        zeit = hop.get('Zeit', 0)
                        try:
                            alert = float(zeit)
                        except (ValueError, TypeError):
                            alert = float(1)
                        hops.append({"name": hops_name, "time": alert})
            else:
                # MMuM v1.x: Altes Feldformat Hopfen_1_Kochzeit etc.
                for idx in range(1,self.findMax("Hopfen_%%_Kochzeit")):
                    hops_name = "%sg %s %s%% alpha" % (e["Hopfen_{}_Menge".format(idx)],e["Hopfen_{}_Sorte".format(idx)],e["Hopfen_{}_alpha".format(idx)])
                    if e["Hopfen_{}_Kochzeit".format(idx)].isnumeric():
                        if boil_time is not e["Hopfen_{}_Kochzeit".format(idx)].isnumeric():
                            alert = float(e["Hopfen_{}_Kochzeit".format(idx)])
                    elif e["Hopfen_{}_Kochzeit".format(idx)] == "Whirlpool":
                        alert = float(1)
                    else:
                        logging.warning("Ungueltige Hopfenzeit in Hopfen_%s_Kochzeit", idx)
                        alert = float(1)
                    hops.append({"name":hops_name,"time":alert})
                for idx in range(1,self.findMax("Hopfen_VWH_%%_Sorte")):
                    firstHops_name = "%sg %s %s%% alpha" % (e["Hopfen_VWH_{}_Menge".format(idx)],e["Hopfen_VWH_{}_Sorte".format(idx)],e["Hopfen_VWH_{}_alpha".format(idx)])
                    firstHops.append({"name":firstHops_name})
                for idx in range(1,self.findMax("WeitereZutat_Wuerze_%%_Kochzeit")):
                    miscs_name = "%s%s %s" % (e["WeitereZutat_Wuerze_{}_Menge".format(idx)],e["WeitereZutat_Wuerze_{}_Einheit".format(idx)],e["WeitereZutat_Wuerze_{}_Name".format(idx)])
                    if e["WeitereZutat_Wuerze_{}_Kochzeit".format(idx)].isnumeric():
                        alert = float(e["WeitereZutat_Wuerze_{}_Kochzeit".format(idx)])
                    elif e["WeitereZutat_Wuerze_{}_Kochzeit".format(idx)] == "Whirlpool":
                        alert = float(1)
                    else:
                        logging.warning("Ungueltige Kochzeit fuer WeitereZutat_Wuerze_%s", idx)
                        alert = float(1)
                    miscs.append({"name":miscs_name,"time":alert})
            
            FirstWort = self.getFirstWort(firstHops, "json")
                
                
            # Mash Steps -> first step is different as it heats up to defined temp and stops with notification to add malt
            # AutoMode is yes to start and stop automatic mode or each step
            MashIn_Flag = True
            step_kettle = self.id
            last_step_temp = 0
            for row in self.getSteps(Recipe_ID, "json"):
                step_name = str(row.get("name"))
                step_timer = str(int(row.get("timer")))
                step_temp = str(int(row.get("temp")))
                last_step_temp = step_temp
                sensor = self.kettle.sensor
                if MashIn_Flag == True:
                    if row.get("timer") == 0:
                        step_type = self.mashin if self.mashin != "" else "MashInStep"
                        Notification = "Zieltemperatur erreicht. Bitte Malz zugeben."
                        MashIn_Flag = False
                        if step_name is None or step_name == "":
                            step_name = "Einmaischen"
                    elif self.addmashin == "Yes":
                        step_type = self.mashin if self.mashin != "" else "MashInStep"
                        Notification = "Zieltemperatur erreicht. Bitte Malz zugeben."
                        MashIn_Flag = False
                        step_string = { "name": "Einmaischen",
                                        "props": {
                                            "AutoMode": self.AutoMode,
                                            "Kettle": self.id,
                                            "Sensor": self.kettle.sensor,
                                            "Temp": self.getJsonMashin(Recipe_ID),
                                            "Timer": 0,
                                            "Notification": Notification
                                            },
                                         "status_text": "",
                                         "status": "I",
                                         "type": step_type
                                        }
                        await self.create_step(step_string)

                        step_type = self.mash if self.mash != "" else "MashStep"
                        Notification = ""
                    else:
                        step_type = self.mash if self.mash != "" else "MashStep"
                        Notification = ""

                else:
                    step_type = self.mash if self.mash != "" else "MashStep"
                    Notification = ""

                step_string = { "name": step_name,
                                "props": {
                                        "AutoMode": self.AutoMode,
                                        "Kettle": self.id,
                                        "Sensor": self.kettle.sensor,
                                        "Temp": step_temp,
                                        "Timer": step_timer,
                                        "Notification": Notification
                                        },
                                "status_text": "",
                                "status": "I",
                                "type": step_type
                                }

                await self.create_step(step_string)
            # Abmaischen -> MashStep um Abmaischtemperatur zu erreichen (1 Min)
            abmaisch_temp = e.get("Abmaischtemperatur", None)
            if abmaisch_temp is not None and str(last_step_temp) != str(abmaisch_temp):
                step_string = { "name": "Abmaischen",
                                "props": {
                                        "AutoMode": self.AutoMode,
                                        "Kettle": self.id,
                                        "Sensor": self.kettle.sensor,
                                        "Temp": str(int(float(abmaisch_temp))),
                                        "Timer": "1",
                                        "Notification": ""
                                        },
                                "status_text": "",
                                "status": "I",
                                "type": "MashStep"
                                }

                await self.create_step(step_string)
            # Laeutern -> Benachrichtigung, wartet auf Benutzer
            if self.mashout == "NotificationStep":
                step_string = { "name": "Laeutern",
                                "props": {
                                        "AutoNext": "No",
                                        "Kettle": self.id,
                                        "Notification": "Maischprozess abgeschlossen. Bitte Laeutern starten und dann Weiter druecken."
                                        },
                                    "status_text": "",
                                    "status": "I",
                                    "type": self.mashout
                                    }
                await self.create_step(step_string)
                
            # Stammwuerze messen
            step_string = { "name": "Stammwuerze messen",
                            "props": {
                                    "AutoNext": "No",
                                    "Kettle": self.id,
                                    "Notification": "Wie hoch ist die Stammwuerze?"
                                    },
                                "status_text": "",
                                "status": "I",
                                "type": "NotificationStep"
                                }
            await self.create_step(step_string)
                
            # Kochschritt mit Hopfenalarmen
            Hops = self.getBoilAlerts(hops, miscs, "json")
            step_kettle = self.boilid
            step_type = self.boil if self.boil != "" else "BoilStep"
            step_time = str(int(boil_time))
            step_temp = self.BoilTemp
            sensor = self.boilkettle.sensor
            LidAlert = "Yes"

            step_string = { "name": "Kochen",
                            "props": {
                                "AutoMode": self.AutoMode,
                                "Kettle": step_kettle,
                                "Sensor": sensor,
                                "Temp": step_temp,
                                "Timer": step_time,
                                "First_Wort": FirstWort,
                                "LidAlert": LidAlert,
                                "Hop_1": Hops[0],
                                "Hop_2": Hops[1],
                                "Hop_3": Hops[2],
                                "Hop_4": Hops[3],
                                "Hop_5": Hops[4],
                                "Hop_6": Hops[5]
                                },
                            "status_text": "",
                            "status": "I",
                            "type": step_type 
                        }

            await self.create_step(step_string)
            
            # Stammwuerze messen (nach dem Kochen)
            step_string = { "name": "Stammwuerze messen",
                            "props": {
                                    "AutoNext": "No",
                                    "Kettle": self.id,
                                    "Notification": "Wie hoch ist die Stammwuerze?"
                                    },
                                "status_text": "",
                                "status": "I",
                                "type": "NotificationStep"
                                }
            await self.create_step(step_string)

            await self.create_Whirlpool_Cooldown()

            await self.save_recipe_steps()
            self.cbpi.notify('MMuM-Rezept erstellt', name, NotificationType.INFO)
        else:
            self.cbpi.notify('Rezept-Import', 'Kein Standard-Kessel definiert. Bitte in den Einstellungen festlegen.', NotificationType.ERROR)


    async def brewfather_json_recipe_creation(self, bf_recipe):
        """Importiert ein Rezept aus einer lokal hochgeladenen Brewfather-JSON-Datei."""
        config = self.get_config_values()

        if self.kettle is None:
            self.cbpi.notify('Rezept-Import', 'Kein Standard-Kessel definiert. Bitte in den Einstellungen festlegen.', NotificationType.ERROR)
            return

        try:
            StrikeTemp = bf_recipe.get('data', {}).get('strikeTemp', None)
        except (KeyError, TypeError):
            StrikeTemp = None
        if StrikeTemp is not None and self.TEMP_UNIT != "C":
            StrikeTemp = round((9.0 / 5.0 * float(StrikeTemp) + 32))

        RecipeName = bf_recipe.get('name', 'Brewfather Import')
        BoilTime = bf_recipe.get('boilTime', 60)
        mash_steps = bf_recipe.get('mash', {}).get('steps', [])
        hops = bf_recipe.get('hops', [])
        miscs = bf_recipe.get('miscs', None)

        FirstWort = self.getFirstWort(hops, "bf")

        await self.create_recipe(RecipeName)

        MashIn_Flag = True
        step_kettle = self.id
        for step in mash_steps:
            try:
                step_name = step.get('name', '')
                if step_name == "":
                    step_name = "Maischeschritt"
            except (KeyError, TypeError):
                step_name = "Maischeschritt"

            step_timer = str(int(step.get('stepTime', 0)))

            if self.TEMP_UNIT == "C":
                step_temp = str(int(step.get('stepTemp', 65)))
            else:
                step_temp = str(round((9.0 / 5.0 * int(step.get('stepTemp', 65)) + 32)))

            sensor = self.kettle.sensor
            if MashIn_Flag == True:
                if int(step_timer) == 0:
                    step_type = self.mashin if self.mashin != "" else "MashInStep"
                    Notification = "Zieltemperatur erreicht. Bitte Malz zugeben."
                    MashIn_Flag = False
                elif self.addmashin == "Yes":
                    mashin_temp = str(round(StrikeTemp)) if StrikeTemp is not None else step_temp
                    step_type = self.mashin if self.mashin != "" else "MashInStep"
                    Notification = "Zieltemperatur erreicht. Bitte Malz zugeben."
                    MashIn_Flag = False
                    step_string = { "name": "Einmaischen",
                                "props": {
                                    "AutoMode": self.AutoMode,
                                    "Kettle": self.id,
                                    "Sensor": self.kettle.sensor,
                                    "Temp": mashin_temp,
                                    "Timer": 0,
                                    "Notification": Notification
                                    },
                                 "status_text": "",
                                 "status": "I",
                                 "type": step_type
                                }
                    await self.create_step(step_string)

                    step_type = self.mash if self.mash != "" else "MashStep"
                    Notification = ""
                else:
                    step_type = self.mash if self.mash != "" else "MashStep"
                    Notification = ""
            else:
                step_type = self.mash if self.mash != "" else "MashStep"
                Notification = ""

            step_string = { "name": step_name,
                            "props": {
                                "AutoMode": self.AutoMode,
                                "Kettle": self.id,
                                "Sensor": self.kettle.sensor,
                                "Temp": step_temp,
                                "Timer": step_timer,
                                "Notification": Notification
                                },
                             "status_text": "",
                             "status": "I",
                             "type": step_type
                            }
            await self.create_step(step_string)

        # Laeutern
        if self.mashout == "NotificationStep":
            step_string = { "name": "Laeutern",
                            "props": {
                                "AutoNext": "No",
                                "Kettle": self.id,
                                "Notification": "Maischprozess abgeschlossen. Bitte Laeutern starten und dann Weiter druecken."
                                },
                            "status_text": "",
                            "status": "I",
                            "type": self.mashout
                            }
            await self.create_step(step_string)

        # Stammwuerze messen
        step_string = { "name": "Stammwuerze messen",
                        "props": {
                                "AutoNext": "No",
                                "Kettle": self.id,
                                "Notification": "Wie hoch ist die Stammwuerze?"
                                },
                            "status_text": "",
                            "status": "I",
                            "type": "NotificationStep"
                            }
        await self.create_step(step_string)

        # Kochschritt mit Hopfenalarmen
        Hops = self.getBoilAlerts(hops, miscs, "bf")
        step_kettle = self.boilid
        step_time = str(int(BoilTime))
        step_type = self.boil if self.boil != "" else "BoilStep"
        step_temp = self.BoilTemp
        sensor = self.boilkettle.sensor
        LidAlert = "Yes"

        step_string = { "name": "Kochen",
                    "props": {
                        "AutoMode": self.AutoMode,
                        "Kettle": step_kettle,
                        "Sensor": sensor,
                        "Temp": step_temp,
                        "Timer": step_time,
                        "First_Wort": FirstWort,
                        "LidAlert": LidAlert,
                        "Hop_1": Hops[0],
                        "Hop_2": Hops[1],
                        "Hop_3": Hops[2],
                        "Hop_4": Hops[3],
                        "Hop_5": Hops[4],
                        "Hop_6": Hops[5]
                        },
                    "status_text": "",
                    "status": "I",
                    "type": step_type
                }
        await self.create_step(step_string)

        # Stammwuerze messen (nach dem Kochen)
        step_string = { "name": "Stammwuerze messen",
                        "props": {
                                "AutoNext": "No",
                                "Kettle": self.id,
                                "Notification": "Wie hoch ist die Stammwuerze?"
                                },
                            "status_text": "",
                            "status": "I",
                            "type": "NotificationStep"
                            }
        await self.create_step(step_string)

        await self.create_Whirlpool_Cooldown()

        await self.save_recipe_steps()
        self.cbpi.notify('Brewfather-Rezept erstellt', RecipeName, NotificationType.INFO)


    async def xml_recipe_creation(self, Recipe_ID):
        config = self.get_config_values()

        if self.kettle is not None:
            # load beerxml file located in upload folder
            self.path = self.cbpi.config_folder.get_upload_file("beer.xml")
            if os.path.exists(self.path) is False:
                self.cbpi.notify("Datei nicht gefunden", "Bitte eine Beer.xml-Datei hochladen", NotificationType.ERROR)


            e = xml.etree.ElementTree.parse(self.path).getroot()
            recipe = e.find('./RECIPE[%s]' % (str(Recipe_ID)))
            hops = recipe.findall('./HOPS/HOP')
            miscs = recipe.findall('MISCS/MISC[USE="Boil"]')
            name = e.find('./RECIPE[%s]/NAME' % (str(Recipe_ID))).text
            boil_time = float(e.find('./RECIPE[%s]/BOIL_TIME' % (str(Recipe_ID))).text)
            FirstWort= self.getFirstWort(hops, "xml")

            await self.create_recipe(name)
            # Mash Steps -> first step is different as it heats up to defined temp and stops with notification to add malt
            # AutoMode is yes to start and stop automatic mode or each step
            MashIn_Flag = True
            step_kettle = self.id
            for row in self.getSteps(Recipe_ID, "xml"):
                step_name = str(row.get("name"))
                step_timer = str(int(row.get("timer")))
                step_temp = str(int(row.get("temp")))
                sensor = self.kettle.sensor
                if MashIn_Flag == True:
                    if row.get("timer") == 0:
                        step_type = self.mashin if self.mashin != "" else "MashInStep"
                        Notification = "Zieltemperatur erreicht. Bitte Malz zugeben."
                        MashIn_Flag = False
                        if step_name is None or step_name == "":
                            step_name = "Einmaischen"
                    elif self.addmashin == "Yes":
                        step_type = self.mashin if self.mashin != "" else "MashInStep"
                        Notification = "Zieltemperatur erreicht. Bitte Malz zugeben."
                        MashIn_Flag = False
                        step_string = { "name": "Einmaischen",
                                        "props": {
                                            "AutoMode": self.AutoMode,
                                            "Kettle": self.id,
                                            "Sensor": self.kettle.sensor,
                                            "Temp": step_temp,
                                            "Timer": 0,
                                            "Notification": Notification
                                            },
                                         "status_text": "",
                                         "status": "I",
                                         "type": step_type
                                        }
                        await self.create_step(step_string)

                        step_type = self.mash if self.mash != "" else "MashStep"
                        Notification = ""
                    else:
                        step_type = self.mash if self.mash != "" else "MashStep"
                        Notification = ""

                else:
                    step_type = self.mash if self.mash != "" else "MashStep"
                    Notification = ""

                step_string = { "name": step_name,
                                "props": {
                                        "AutoMode": self.AutoMode,
                                        "Kettle": self.id,
                                        "Sensor": self.kettle.sensor,
                                        "Temp": step_temp,
                                        "Timer": step_timer,
                                        "Notification": Notification
                                        },
                                "status_text": "",
                                "status": "I",
                                "type": step_type
                                }

                await self.create_step(step_string)

            # Laeutern -> Benachrichtigung, wartet auf Benutzer
            if self.mashout == "NotificationStep":
                step_string = { "name": "Laeutern",
                                "props": {
                                        "AutoNext": "No",
                                        "Kettle": self.id,
                                        "Notification": "Maischprozess abgeschlossen. Bitte Laeutern starten und dann Weiter druecken."
                                        },
                                    "status_text": "",
                                    "status": "I",
                                    "type": self.mashout
                                    }
                await self.create_step(step_string)               
                
            # Kochschritt mit Hopfenalarmen
            Hops = self.getBoilAlerts(hops, miscs, "xml")
            step_kettle = self.boilid
            step_type = self.boil if self.boil != "" else "BoilStep"
            step_time = str(int(boil_time))
            step_temp = self.BoilTemp
            sensor = self.boilkettle.sensor
            LidAlert = "Yes"

            step_string = { "name": "Kochen",
                            "props": {
                                "AutoMode": self.AutoMode,
                                "Kettle": step_kettle,
                                "Sensor": sensor,
                                "Temp": step_temp,
                                "Timer": step_time,
                                "First_Wort": FirstWort,
                                "LidAlert": LidAlert,
                                "Hop_1": Hops[0],
                                "Hop_2": Hops[1],
                                "Hop_3": Hops[2],
                                "Hop_4": Hops[3],
                                "Hop_5": Hops[4],
                                "Hop_6": Hops[5]
                                },
                            "status_text": "",
                            "status": "I",
                            "type": step_type 
                        }

            await self.create_step(step_string)

            await self.create_Whirlpool_Cooldown()

            await self.save_recipe_steps()
            self.cbpi.notify('BeerXML-Rezept erstellt', name, NotificationType.INFO)
        else:
            self.cbpi.notify('Rezept-Import', 'Kein Standard-Kessel definiert. Bitte in den Einstellungen festlegen.', NotificationType.ERROR)


   # XML functions to retrieve xml repice parameters (if multiple recipes are stored in one xml file, id could be used)

    def getSteps(self, id, recipe_type):
        steps = []
        if recipe_type == "xml":
            e = xml.etree.ElementTree.parse(self.path).getroot()
            for e in e.findall('./RECIPE[%s]/MASH/MASH_STEPS/MASH_STEP' % (str(id))):
                if self.cbpi.config.get("TEMP_UNIT", "C") == "C":
                    temp = float(e.find("STEP_TEMP").text)
                else:
                    temp = round(9.0 / 5.0 * float(e.find("STEP_TEMP").text) + 32, 2)
                steps.append({"name": e.find("NAME").text, "temp": temp, "timer": float(e.find("STEP_TIME").text)})
        elif recipe_type == "json":
            self.path = self.cbpi.config_folder.get_upload_file("mmum.json")
            e = json.load(open(self.path))
            # MMuM v2.0: Rasten als Array
            if 'Rasten' in e and isinstance(e['Rasten'], list):
                for idx, rast in enumerate(e['Rasten']):
                    if self.cbpi.config.get("TEMP_UNIT", "C") == "C":
                        temp = float(rast['Temperatur'])
                    else:
                        temp = round(9.0 / 5.0 * float(rast['Temperatur']) + 32, 2)
                    rast_name = rast.get('Name', 'Rast {}'.format(idx + 1))
                    steps.append({"name": rast_name, "temp": temp, "timer": float(rast['Zeit'])})
            else:
                # MMuM v1.x: Altes Feldformat Infusion_Rasttemperatur1 etc.
                for idx in range(1,self.findMax("Infusion_Rastzeit%%")):
                    if self.cbpi.config.get("TEMP_UNIT", "C") == "C":
                        temp = float(e["Infusion_Rasttemperatur{}".format(idx)])
                    else:
                        temp = round(9.0 / 5.0 * float(e["Infusion_Rasttemperatur{}".format(idx)]) + 32, 2)
                    steps.append({"name": "Rast {}".format(idx), "temp": temp, "timer": float(e["Infusion_Rastzeit{}".format(idx)])})

        return steps

    async def bf_recipe_creation(self, Recipe_ID):
        config = self.get_config_values()

        if self.kettle is not None:

            brewfather = True
            result=[]
            self.bf_url="https://api.brewfather.app/v1/recipes/" + Recipe_ID
            brewfather_user_id = self.cbpi.config.get("brewfather_user_id", None)
            if brewfather_user_id == "" or brewfather_user_id is None:
                brewfather = False

            brewfather_api_key = self.cbpi.config.get("brewfather_api_key", None)
            if brewfather_api_key == "" or brewfather_api_key is None:
                brewfather = False

            if brewfather == True:
                encodedData = base64.b64encode(bytes(f"{brewfather_user_id}:{brewfather_api_key}", "ISO-8859-1")).decode("ascii")
                headers={"Authorization": "Basic %s" % encodedData}
                bf_recipe = ""

                async with aiohttp.ClientSession(headers=headers) as bf_session:
                    async with bf_session.get(self.bf_url) as r:
                        bf_recipe = await r.json()
                    await bf_session.close()
            
            if bf_recipe !="":
                try:
                    StrikeTemp=bf_recipe['data']['strikeTemp']
                except (KeyError, TypeError):
                    StrikeTemp = None
                # BF is sending all Temeprature values in °C. If system is running in F, values need to be converted
                if StrikeTemp is not None and self.TEMP_UNIT != "C":
                    StrikeTemp = round((9.0 / 5.0 *  float(StrikeTemp)+ 32))

                RecipeName = bf_recipe['name']
                BoilTime = bf_recipe['boilTime']
                mash_steps=bf_recipe['mash']['steps']
                hops=bf_recipe['hops']
                try:
                    miscs = bf_recipe['miscs']
                except KeyError:
                    miscs = None

                FirstWort = self.getFirstWort(hops, "bf")

                await self.create_recipe(RecipeName)

                # Mash Steps -> first step is different as it heats up to defined temp and stops with notification to add malt
                # AutoMode is yes to start and stop automatic mode or each step
                MashIn_Flag = True
                step_kettle = self.id
                for step in mash_steps:
                    try:
                        step_name = step['name']
                        if step_name == "":
                            step_name = "Maischeschritt"
                    except (KeyError, TypeError):
                        step_name = "Maischeschritt"


                    step_timer = str(int(step['stepTime']))

                    if self.TEMP_UNIT == "C":
                        step_temp = str(int(step['stepTemp']))
                    else:
                        step_temp = str(round((9.0 / 5.0 * int(step['stepTemp']) + 32)))

                    sensor = self.kettle.sensor
                    if MashIn_Flag == True: 

                        if int(step_timer) == 0:
                            step_type = self.mashin if self.mashin != "" else "MashInStep"
                            Notification = "Zieltemperatur erreicht. Bitte Malz zugeben."
                            MashIn_Flag = False

                        elif self.addmashin == "Yes":
                            mashin_temp = str(round(StrikeTemp)) if StrikeTemp is not None else step_temp
                            step_type = self.mashin if self.mashin != "" else "MashInStep"
                            Notification = "Zieltemperatur erreicht. Bitte Malz zugeben."
                            MashIn_Flag = False
                            step_string = { "name": "Einmaischen",
                                        "props": {
                                            "AutoMode": self.AutoMode,
                                            "Kettle": self.id,
                                            "Sensor": self.kettle.sensor,
                                            "Temp": mashin_temp,
                                            "Timer": 0,
                                            "Notification": Notification
                                            },
                                         "status_text": "",
                                         "status": "I",
                                         "type": step_type
                                        }
                            await self.create_step(step_string)

                            step_type = self.mash if self.mash != "" else "MashStep"
                            Notification = ""
                        else:
                            step_type = self.mash if self.mash != "" else "MashStep"
                            Notification = ""

                    else:
                        step_type = self.mash if self.mash != "" else "MashStep"
                        Notification = ""

                    step_string = { "name": step_name,
                                    "props": {
                                        "AutoMode": self.AutoMode,
                                        "Kettle": self.id,
                                        "Sensor": self.kettle.sensor,
                                        "Temp": step_temp,
                                        "Timer": step_timer,
                                        "Notification": Notification
                                        },
                                     "status_text": "",
                                     "status": "I",
                                     "type": step_type
                                    }

                    await self.create_step(step_string)

                # Laeutern -> Benachrichtigung, wartet auf Benutzer

                if self.mashout == "NotificationStep":
                    step_string = { "name": "Laeutern",
                                    "props": {
                                        "AutoNext": "No",
                                        "Kettle": self.id,
                                        "Notification": "Maischprozess abgeschlossen. Bitte Laeutern starten und dann Weiter druecken."
                                        },
                                    "status_text": "",
                                    "status": "I",
                                    "type": self.mashout
                                    }
                await self.create_step(step_string)    

                # Kochschritt mit Hopfenalarmen
                Hops = self.getBoilAlerts(hops , miscs, "bf")

                step_kettle = self.boilid
                step_time = str(int(BoilTime))
                step_type = self.boil if self.boil != "" else "BoilStep"
                step_temp = self.BoilTemp
                sensor = self.boilkettle.sensor
                LidAlert = "Yes"

                step_string = { "name": "Kochen",
                            "props": {
                                "AutoMode": self.AutoMode,
                                "Kettle": step_kettle,
                                "Sensor": sensor,
                                "Temp": step_temp,
                                "Timer": step_time,
                                "First_Wort": FirstWort,
                                "LidAlert": LidAlert,
                                "Hop_1": Hops[0],
                                "Hop_2": Hops[1],
                                "Hop_3": Hops[2],
                                "Hop_4": Hops[3],
                                "Hop_5": Hops[4],
                                "Hop_6": Hops[5]
                                },
                            "status_text": "",
                            "status": "I",
                            "type": step_type 
                        }

                await self.create_step(step_string)

                await self.create_Whirlpool_Cooldown()

                await self.save_recipe_steps()
                self.cbpi.notify('Brewfather-Rezept erstellt', RecipeName, NotificationType.INFO)
        else:
            self.cbpi.notify('Rezept-Import', 'Kein Standard-Kessel definiert. Bitte in den Einstellungen festlegen.', NotificationType.ERROR)

    def getBoilAlerts(self, hops, miscs, recipe_type):
        alerts = []
        for hop in hops:
            if recipe_type == "xml":
                use = hop.find('USE').text
                ## Hops which are not used in the boil step should not cause alerts
                if use != 'Aroma' and use != 'Boil':
                    continue
                alerts.append(float(hop.find('TIME').text))
            elif recipe_type == "bf":
                use = hop['use']
                if use != 'Aroma' and use != 'Boil':
                    continue
                alerts.append(float(hop['time']))
            elif recipe_type == "kbh":
                alerts.append(float(hop[0]))
            elif  recipe_type == "json":
                alerts.append(float(hop['time']))
                
        ## There might also be miscelaneous additions during boild time
        if miscs is not None:
            for misc in miscs:
                if recipe_type == "xml":
                    alerts.append(float(misc.find('TIME').text))
                elif recipe_type == "bf":
                    use = misc['use']
                    if use != 'Aroma' and use != 'Boil':
                        continue
                    alerts.append(float(misc['time']))
                elif recipe_type == "kbh":
                    alerts.append(float(misc[0]))
                elif  recipe_type == "json":
                    alerts.append(float(misc['time']))
        ## Dedupe and order the additions by their time, to prevent multiple alerts at the same time
        alerts = sorted(list(set(alerts)))
        ## CBP should have these additions in reverse
        alerts.reverse()
        hop_alerts = []
        for i in range(0,6):
            try:
                hop_alerts.append(str(int(alerts[i])))
            except IndexError:
                hop_alerts.append(None)
        return hop_alerts

    def getFirstWort(self, hops, recipe_type):
        alert = "No"
        if recipe_type == "kbh":
            if len(hops) != 0:
                alert = "Yes"
        elif recipe_type == "xml":
            for hop in hops:
                use = hop.find('USE').text
                ## Hops which are not used in the boil step should not cause alerts
                if use != 'First Wort':
                    continue
                alert = "Yes"
        elif recipe_type == "bf":
            for hop in hops:
                if hop['use'] == "First Wort":
                    alert="Yes"
        elif recipe_type == "json":
            for hop in hops:
                alert="Yes"
        return alert

    async def create_Whirlpool_Cooldown(self):
        # Whirlpool als Warteschritt
        if self.cooldown != "WaiStep" and self.cooldown !="":
            step_string = { "name": "Whirlpool",
                            "props": {
                                "Kettle": self.boilid,
                                "Timer": "15"
                                },
                            "status_text": "",
                            "status": "I",
                            "type": "WaitStep" 
                        }
            await self.create_step(step_string)

        # Abkuehlen -> Benachrichtigung wenn Temperatur erreicht
        step_type = self.cooldown if self.cooldown != "" else "WaitStep"
        step_name = "Abkuehlen"
        cooldown_sensor = ""
        step_temp = ""
        step_timer = "15"
        if step_type == "CooldownStep":
            cooldown_sensor = self.cbpi.config.get("steps_cooldown_sensor", None)
            if cooldown_sensor is None or cooldown_sensor == '':
                cooldown_sensor = self.boilkettle.sensor  # fall back to boilkettle sensor if no other sensor is specified
            step_timer = ""                
            step_temp = str(int(self.CoolDownTemp))
            step_string = { "name": "Abkuehlen",
                            "props": {
                                "Kettle": self.boilid,
                                "Timer": step_timer,
                                "Temp": step_temp,
                                "Sensor": cooldown_sensor,
                                "Actor": self.CoolDownActor
                                },
                            "status_text": "",
                            "status": "I",
                            "type": step_type 
                        }
            await self.create_step(step_string)

    def get_config_values(self):
        self.kettle = None
        self.boilkettle = None
        #Define MashSteps
        self.TEMP_UNIT = self.cbpi.config.get("TEMP_UNIT", "C")
        self.AutoMode = self.cbpi.config.get("AutoMode", "Yes")
        self.mashin =  self.cbpi.config.get("steps_mashin", "MashInStep")
        self.mash = self.cbpi.config.get("steps_mash", "MashStep") 
        self.mashout = self.cbpi.config.get("steps_mashout", None) # Currently used only for the Braumeister 
        self.boil = self.cbpi.config.get("steps_boil", "BoilStep") 
        self.whirlpool="Waitstep"
        self.cooldown = self.cbpi.config.get("steps_cooldown", "WaitStep") 
        #get default boil temp from settings
        self.BoilTemp = self.cbpi.config.get("steps_boil_temp", 98)
        #get default cooldown temp alarm setting
        self.CoolDownTemp = self.cbpi.config.get("steps_cooldown_temp", 25)
        self.CoolDownActor = self.cbpi.config.get("steps_cooldown_actor", None)
        # get default Kettle from Settings       
        self.id = self.cbpi.config.get('MASH_TUN', None)
        self.boilid = self.cbpi.config.get('BoilKettle', None)
        if self.boilid is None:
            self.boilid = self.id
        # If next parameter is Yes, MashIn Ste will be added before first mash step if not included in recipe
        self.addmashin = self.cbpi.config.get('AddMashInStep', "Yes")

        try:
            self.kettle = self.cbpi.kettle.find_by_id(self.id) 
        except Exception:
            self.cbpi.notify('Recipe Upload', 'No default Kettle defined. Please specify default Kettle in settings', NotificationType.ERROR)
        try:
            self.boilkettle = self.cbpi.kettle.find_by_id(self.boilid) 
        except Exception:
            self.boilkettle = self.kettle

        config_values = { "kettle": self.kettle,
                          "kettle_id": str(self.id),
                          "boilkettle": self.boilkettle,
                          "boilkettle_id": str(self.boilid),
                          "mashin": str(self.mashin),
                          "mash": str(self.mash),
                          "mashout": str(self.mashout),
                          "boil": str(self.boil),
                          "whirlpool": str(self.whirlpool),
                          "cooldown": str(self.cooldown),
                          "boiltemp": str(self.BoilTemp),
                          "cooldowntemp": str(self.CoolDownTemp),
                          "cooldownactor": self.CoolDownActor,
                          "temp_unit": str(self.TEMP_UNIT),
                          "AutoMode": str(self.AutoMode)
                        }
        logging.info(config_values)
        return config_values

    async def create_recipe(self, name):
        # Create recipe in recipe Book with name of first recipe in xml file
        self.recipeID = await self.cbpi.recipe.create(name)
        # send recipe to mash profile
        await self.cbpi.recipe.brew(self.recipeID)
        # Recipe bleibt im Rezeptbuch — Steps werden am Ende gespeichert

    async def save_recipe_steps(self):
        """Speichert die aktiven Brau-Schritte zurueck in das Rezeptbuch-YAML."""
        try:
            step_path = os.path.join(self.cbpi.config_folder.get_file_path(""), "step_data.json")
            if os.path.exists(step_path):
                with open(step_path) as f:
                    step_data = json.load(f)
                recipe_data = {
                    "basic": step_data.get("basic", {"name": "Import"}),
                    "steps": step_data.get("steps", [])
                }
                await self.cbpi.recipe.save(self.recipeID, recipe_data)
        except Exception as e:
            logging.error("Failed to save recipe steps to book: %s", e)

    # function to create json to be send to api to add a step to the current mash profile. Currently all properties are send to each step which does not cuase an issue
    async def create_step(self, step_string):
        #get server port from settings and define url for api calls -> adding steps
        self.port = str(self.cbpi.static_config.get('port',8000))
        self.url="http://127.0.0.1:" + self.port + "/step2/"
        # convert step:string to json required for api call. 
        step = json.dumps(step_string)
        headers={'Content-Type': 'application/json', 'Accept': 'application/json'}
        async with aiohttp.ClientSession(headers=headers) as session:
            async with session.post(self.url, data=step) as response:
                return await response.text()
            await self.push_update()
