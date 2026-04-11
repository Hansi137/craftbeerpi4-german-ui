"""dashboard_controller.py - Dashboard-Widget-Verwaltung

Verwaltet mehrere Dashboards mit konfigurierbaren Widgets.
Jedes Dashboard ist ein JSON-Layout mit SVG-Widgets.

Dashboard-Dateien: config/dashboard/cbpi_dashboard_N.json
Benutzerdefinierte Widgets: config/dashboard/widgets/*.svg
"""

from cbpi.api.dataclasses import NotificationType
import logging
import json
import os
from os import listdir
from os.path import isfile, join
from cbpi.api.base import CBPiBase
from cbpi.api.config import ConfigType

from voluptuous.schema_builder import message

class DashboardController:


    def __init__(self, cbpi):
        self.caching = False
        self.cbpi = cbpi
        self.logger = logging.getLogger(__name__)
        self.cbpi.register(self)

        self.path = cbpi.config_folder.get_file_path("cbpi_dashboard_1.json")

    async def init(self):
        pass

    async def get_content(self, dashboard_id):
        try:
            self.path = self.cbpi.config_folder.get_file_path("cbpi_dashboard_"+ str(dashboard_id) +".json")
            logging.info(self.path)
            with open(self.path) as json_file:
                data = json.load(json_file)
                return data
        except Exception:
            return {'elements': [], 'pathes': []}
    
    async def add_content(self, dashboard_id, data):
        logging.debug("Dashboard %s content update", dashboard_id)
        self.path = self.cbpi.config_folder.get_file_path("cbpi_dashboard_" + str(dashboard_id)+ ".json")
        with open(self.path, 'w') as outfile:
            json.dump(data, outfile, indent=4, sort_keys=True)
        self.cbpi.notify(title="Dashboard {}".format(dashboard_id), message="Saved Successfully", type=NotificationType.SUCCESS)
        return {"status": "OK"}

    async def delete_content(self, dashboard_id):
        self.path = self.cbpi.config_folder.get_file_path("cbpi_dashboard_"+ str(dashboard_id)+ ".json")
        if os.path.exists(self.path):
            os.remove(self.path)
            self.cbpi.notify(title="Dashboard {}".format(dashboard_id), message="Deleted Successfully", type=NotificationType.SUCCESS)


    async def get_custom_widgets(self):
        path = os.path.join(self.cbpi.config_folder.get_file_path("dashboard"), "widgets")
        onlyfiles = [os.path.splitext(f)[0] for f in sorted(listdir(path)) if isfile(join(path, f)) and f.endswith(".svg")]
        return onlyfiles

    async def get_dashboard_numbers(self):
        max_dashboard_number = self.cbpi.config.get("max_dashboard_number", 4)
        return max_dashboard_number

    async def get_current_dashboard(self):
        current_dashboard_number = self.cbpi.config.get("current_dashboard_number", 1)
        return current_dashboard_number

    async def set_current_dashboard(self, dashboard_id=1):
        await self.cbpi.config.set("current_dashboard_number", dashboard_id)
        return {"status": "OK"}
