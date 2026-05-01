# -*- coding: utf-8 -*-
"""cbpi_datastore — Einfacher serverseitiger Key-Value-Store für CraftBeerPi 4

Speichert beliebige JSON-Daten pro Key als Dateien im ~/.cbpi/ Verzeichnis.
Damit sind z.B. Rezept-Zutaten geräteübergreifend auf dem Pi verfügbar.

Endpoints:
  GET  /datastore/{key}   → gibt gespeichertes JSON zurück (oder {} wenn nicht vorhanden)
  POST /datastore/{key}   → speichert übergebenes JSON
"""

import json
import logging
import os
import re

from aiohttp import web
from cbpi.api import *

logger = logging.getLogger(__name__)

# Erlaubte Zeichen für Store-Keys
_KEY_PATTERN = re.compile(r'^[a-zA-Z0-9_-]{1,64}$')


class DatastoreEndpoint(CBPiExtension):

    def __init__(self, cbpi):
        self.cbpi = cbpi
        self.cbpi.register(self, '/datastore')
        # Verzeichnis sicherstellen
        self._store_dir = os.path.join(os.path.expanduser('~'), '.cbpi', 'datastore')
        os.makedirs(self._store_dir, exist_ok=True)

    def _store_path(self, key):
        return os.path.join(self._store_dir, key + '.json')

    @request_mapping(path='/{key}', method='GET', auth_required=False)
    async def get_value(self, request):
        key = request.match_info['key']
        if not _KEY_PATTERN.match(key):
            return web.Response(status=422, text='Invalid key')
        try:
            with open(self._store_path(key), 'r', encoding='utf-8') as f:
                data = json.load(f)
            return web.json_response(data)
        except FileNotFoundError:
            return web.json_response({})
        except Exception as e:
            logger.error('Datastore GET error for key "%s": %s', key, e)
            return web.Response(status=500, text=str(e))

    @request_mapping(path='/{key}', method='POST', auth_required=False)
    async def set_value(self, request):
        key = request.match_info['key']
        if not _KEY_PATTERN.match(key):
            return web.Response(status=422, text='Invalid key')
        try:
            data = await request.json()
            with open(self._store_path(key), 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            return web.json_response({'status': 'ok'})
        except Exception as e:
            logger.error('Datastore POST error for key "%s": %s', key, e)
            return web.Response(status=500, text=str(e))


def setup(cbpi):
    cbpi.plugin.register('DatastoreEndpoint', DatastoreEndpoint)
