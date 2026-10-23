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
        logging.info(data)
        with open(path, "w") as file:
            yaml.dump(data, file, indent=4, sort_keys=True)

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

    def _clone_ingredients(self, old_name, new_name):
        # Die Zutaten-Verwaltung (custom_ui) speichert Malz/Hopfen/Wasser pro
        # Rezept im cbpi_datastore-Key "recipe_ingredients", indiziert über
        # den Rezeptnamen (basic.name) - nicht über die Datei-ID. Beim Klonen
        # bekommt das Rezept einen neuen Namen, sonst würden die Zutaten des
        # Originals für das geklonte Rezept verloren gehen.
        if not old_name or not new_name or old_name == new_name:
            return
        store_path = os.path.join(
            os.path.expanduser("~"), ".cbpi", "datastore", "recipe_ingredients.json"
        )
        try:
            with open(store_path, "r", encoding="utf-8") as file:
                all_ingredients = json.load(file)
        except FileNotFoundError:
            return
        except Exception as e:
            self.logger.warning("Zutaten-Datastore konnte nicht gelesen werden: %s", e)
            return

        if old_name not in all_ingredients:
            return

        all_ingredients[new_name] = all_ingredients[old_name]
        try:
            with open(store_path, "w", encoding="utf-8") as file:
                json.dump(all_ingredients, file, ensure_ascii=False, indent=2)
        except Exception as e:
            self.logger.warning("Zutaten-Datastore konnte nicht geschrieben werden: %s", e)
