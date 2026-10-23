import json
import logging
import os.path
import re
from os import listdir
from os.path import isfile, join

import shortuuid
import yaml
from cbpi.api.dataclasses import NotificationType

from ..api.step import StepMove, StepResult, StepState


class RecipeController:

    def __init__(self, cbpi):
        self.cbpi = cbpi
        self.logger = logging.getLogger(__name__)

    def urlify(self, s):

        # Remove all non-word characters (everything except numbers and letters)
        s = re.sub(r"[^\w\s]", "", s)

        # Replace all runs of whitespace with a single dash
        s = re.sub(r"\s+", "-", s)

        return s

    async def create(self, name):
        id = shortuuid.uuid()
        path = self.cbpi.config_folder.get_recipe_file_by_id(id)
        data = dict(
            basic=dict(name=name, author=self.cbpi.config.get("AUTHOR", "John Doe")),
            steps=[],
        )
        with open(path, "w") as file:
            yaml.dump(data, file)
        return id

    async def save(self, name, data):
        path = self.cbpi.config_folder.get_recipe_file_by_id(name)

        # Alten Namen merken, bevor die Datei überschrieben wird - falls sich
        # der Name geändert hat, müssen die Zutaten mitwandern (siehe
        # _rename_ingredients). Existiert die Datei noch nicht (z.B. Aufruf
        # aus clone() mit frischer ID), gibt es naturgemäß nichts zu merken.
        old_name = None
        try:
            with open(path) as file:
                old_data = yaml.load(file, Loader=yaml.FullLoader)
                if old_data:
                    old_name = old_data.get("basic", {}).get("name")
        except FileNotFoundError:
            pass
        except Exception as e:
            self.logger.warning("Bisheriger Rezeptname konnte nicht gelesen werden: %s", e)

        logging.info(data)
        with open(path, "w") as file:
            yaml.dump(data, file, indent=4, sort_keys=True)

        new_name = data.get("basic", {}).get("name") if isinstance(data, dict) else None
        self._rename_ingredients(old_name, new_name)

    async def get_recipes(self):
        path = self.cbpi.config_folder.get_file_path("recipes")
        onlyfiles = [
            os.path.splitext(f)[0]
            for f in listdir(path)
            if isfile(join(path, f)) and f.endswith(".yaml")
        ]

        result = []
        for filename in onlyfiles:
            recipe_path = self.cbpi.config_folder.get_recipe_file_by_id(filename)
            with open(recipe_path) as file:
                try:
                    data = yaml.load(file, Loader=yaml.FullLoader)
                    dataset = data["basic"]
                    dataset["file"] = filename
                    result.append(dataset)
                except Exception as e:
                    self.cbpi.notify(
                        "Error",
                        f"Invalid recipe file skipped: {filename}",
                        NotificationType.ERROR,
                    )
                    logging.error(f"Skip invalid file: {e}")
        return result

    async def get_by_name(self, name):

        recipe_path = self.cbpi.config_folder.get_recipe_file_by_id(name)
        with open(recipe_path) as file:
            return yaml.load(file, Loader=yaml.FullLoader)

    async def remove(self, name):
        path = self.cbpi.config_folder.get_recipe_file_by_id(name)
        os.remove(path)

    async def brew(self, name):

        recipe_path = self.cbpi.config_folder.get_recipe_file_by_id(name)
        with open(recipe_path) as file:
            data = yaml.load(file, Loader=yaml.FullLoader)
            await self.cbpi.step.load_recipe(data)

    async def clone(self, id, new_name):
        recipe_path = self.cbpi.config_folder.get_recipe_file_by_id(id)
        with open(recipe_path) as file:
            data = yaml.load(file, Loader=yaml.FullLoader)
            old_name = data.get("basic", {}).get("name")
            data["basic"]["name"] = new_name
            new_id = shortuuid.uuid()
            await self.save(new_id, data)

            self._clone_ingredients(old_name, new_name)

            return new_id

    # ── Zutaten-Datastore (custom_ui) ─────────────────────────────────────
    # Die Zutaten-Verwaltung speichert Malz/Hopfen/Wasser pro Rezept im
    # cbpi_datastore-Key "recipe_ingredients", indiziert über den Rezeptnamen
    # (basic.name) - nicht über die Datei-ID. Jede Aktion, die diesen Namen
    # ändert (Klonen, Umbenennen per Speichern), muss den Eintrag deshalb
    # mitführen, sonst sind die Zutaten für den Nutzer "verschwunden".

    def _ingredients_store_path(self):
        return os.path.join(
            os.path.expanduser("~"), ".cbpi", "datastore", "recipe_ingredients.json"
        )

    def _read_ingredients_store(self):
        try:
            with open(self._ingredients_store_path(), "r", encoding="utf-8") as file:
                return json.load(file)
        except FileNotFoundError:
            return {}
        except Exception as e:
            self.logger.warning("Zutaten-Datastore konnte nicht gelesen werden: %s", e)
            return None

    def _write_ingredients_store(self, all_ingredients):
        try:
            with open(self._ingredients_store_path(), "w", encoding="utf-8") as file:
                json.dump(all_ingredients, file, ensure_ascii=False, indent=2)
        except Exception as e:
            self.logger.warning("Zutaten-Datastore konnte nicht geschrieben werden: %s", e)

    def _clone_ingredients(self, old_name, new_name):
        # Klonen: Original behält seinen Eintrag, der Klon bekommt eine Kopie.
        if not old_name or not new_name or old_name == new_name:
            return
        all_ingredients = self._read_ingredients_store()
        if not all_ingredients or old_name not in all_ingredients:
            return
        all_ingredients[new_name] = all_ingredients[old_name]
        self._write_ingredients_store(all_ingredients)

    def _rename_ingredients(self, old_name, new_name):
        # Umbenennen (Speichern mit geändertem Namen): das Rezept unter dem
        # alten Namen existiert danach nicht mehr, der Eintrag wird verschoben
        # statt kopiert. Hat der Zielname zufällig schon eigene Zutaten,
        # lassen wir den alten Eintrag lieber stehen (Datenverlust vermeiden)
        # statt ihn kommentarlos zu überschreiben oder zu löschen.
        if not old_name or not new_name or old_name == new_name:
            return
        all_ingredients = self._read_ingredients_store()
        if not all_ingredients or old_name not in all_ingredients:
            return
        if new_name in all_ingredients:
            self.logger.warning(
                "Zutaten-Umzug übersprungen: '%s' hat bereits eigene Zutaten "
                "(alter Eintrag '%s' bleibt erhalten statt überschrieben zu werden).",
                new_name, old_name,
            )
            return
        all_ingredients[new_name] = all_ingredients.pop(old_name)
        self._write_ingredients_store(all_ingredients)
