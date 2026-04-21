import logging

from aiohttp import web
from cbpi.api import request_mapping
from cbpi.utils import json_dumps


class PluginHttpEndpoints:

    def __init__(self, cbpi):
        self.cbpi = cbpi
        self.cbpi.register(self, url_prefix="/plugin")

    @request_mapping(path="/install/", method="POST", auth_required=False)
    async def install(self, request):
        """
        ---
        description: Install a plugin via pip
        tags:
        - Plugin
        parameters:
        - in: body
          name: body
          required: true
          schema:
            type: object
            properties:
              package_name:
                type: string
        responses:
            "204":
                description: successful operation
            "500":
                description: installation failed
        """
        data = await request.json()
        success = await self.cbpi.plugin.install(data["package_name"])
        return web.Response(status=204 if success else 500)

    @request_mapping(path="/uninstall", method="POST", auth_required=False)
    async def uninstall(self, request):
        """
        ---
        description: Uninstall a plugin via pip
        tags:
        - Plugin
        parameters:
        - in: body
          name: body
          required: true
          schema:
            type: object
            properties:
              package_name:
                type: string
        responses:
            "204":
                description: successful operation
            "500":
                description: uninstall failed
        """
        data = await request.json()
        success = await self.cbpi.plugin.uninstall(data["package_name"])
        return web.Response(status=204 if success else 500)

    @request_mapping(path="/list", method="GET", auth_required=False)
    async def list(self, request):
        """
        ---
        description: Get a list of installed plugins
        tags:
        - Plugin
        produces:
        - application/json
        responses:
            "200":
                description: successful operation.

        """
        plugin_list = await self.cbpi.plugin.load_plugin_list()
        return web.json_response(plugin_list, dumps=json_dumps)

    @request_mapping(path="/names", method="GET", auth_required=False)
    async def names(self, request):
        """
        ---
        description: Get a list of available plugin names with global settings incl. craftbeerpi native categories (All, craftbeerpi, steps)
        tags:
        - Plugin
        produces:
        - application/json
        responses:
            "200":
                description: successful operation. 
        """
        plugin_names = await self.cbpi.plugin.load_plugin_names()
        return web.json_response(plugin_names, dumps=json_dumps)
