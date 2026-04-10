import logging
import os.path
from os import listdir
from os.path import isfile, join
import json
import shortuuid
import yaml
from ..api.step import StepMove, StepResult, StepState

import re

class RecipeController:

    def __init__(self, cbpi):
        self.cbpi = cbpi
        self.logger = logging.getLogger(__name__)
    
    def urlify(self, s):
        # Remove all non-word characters (everything except numbers and letters)
        s = re.sub(r"[^\w\s]", '', s)
        # Replace all runs of whitespace with a single dash
        s = re.sub(r"\s+", '-', s)
        return s

    async def create(self, name):
        id = shortuuid.uuid()
        path = self.cbpi.config_folder.get_recipe_file_by_id(id)
        data = dict(basic=dict(name=name, author=self.cbpi.config.get("AUTHOR", "John Doe")), steps=[])
        with open(path, "w") as file:
            yaml.dump(data, file)
        return id

    async def save(self, name, data):
        path = self.cbpi.config_folder.get_recipe_file_by_id(name)
        self.logger.info("Saving recipe: %s", name)
        with open(path, "w") as file:
            yaml.dump(data, file, indent=4, sort_keys=True)
        
    async def get_recipes(self):
        path = self.cbpi.config_folder.get_file_path("recipes")
        try:
            onlyfiles = [os.path.splitext(f)[0] for f in listdir(path) if isfile(join(path, f)) and f.endswith(".yaml")]
        except OSError as e:
            self.logger.error("Failed to list recipes directory: %s", e)
            return []

        result = []
        for filename in onlyfiles:
            try:
                recipe_path = self.cbpi.config_folder.get_recipe_file_by_id(filename)
                with open(recipe_path) as file:
                    data = yaml.safe_load(file)
                    if data and "basic" in data:
                        dataset = data["basic"]
                        dataset["file"] = filename
                        result.append(dataset)
                    else:
                        self.logger.warning("Recipe %s has invalid format", filename)
            except Exception as e:
                self.logger.error("Failed to load recipe %s: %s", filename, e)
        return result
    
    async def get_by_name(self, name):
        recipe_path = self.cbpi.config_folder.get_recipe_file_by_id(name)
        try:
            with open(recipe_path) as file:
                return yaml.safe_load(file)
        except FileNotFoundError:
            self.logger.error("Recipe not found: %s", name)
            return None
        except Exception as e:
            self.logger.error("Failed to read recipe %s: %s", name, e)
            return None
           
    async def remove(self, name):
        path = self.cbpi.config_folder.get_recipe_file_by_id(name)
        try:
            os.remove(path)
        except FileNotFoundError:
            self.logger.warning("Recipe file already removed: %s", name)
        except OSError as e:
            self.logger.error("Failed to remove recipe %s: %s", name, e)

    async def brew(self, name):
        recipe_path = self.cbpi.config_folder.get_recipe_file_by_id(name)
        try:
            with open(recipe_path) as file:
                data = yaml.safe_load(file)
                await self.cbpi.step.load_recipe(data)
        except FileNotFoundError:
            self.logger.error("Recipe not found for brewing: %s", name)
            raise
        except Exception as e:
            self.logger.error("Failed to brew recipe %s: %s", name, e)
            raise

    async def clone(self, id, new_name):
        recipe_path = self.cbpi.config_folder.get_recipe_file_by_id(id)
        try:
            with open(recipe_path) as file:
                data = yaml.safe_load(file)
                data["basic"]["name"] = new_name
                new_id = shortuuid.uuid()
                await self.save(new_id, data)
                return new_id
        except Exception as e:
            self.logger.error("Failed to clone recipe %s: %s", id, e)
            raise
