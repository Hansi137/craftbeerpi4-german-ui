"""sensor.py - Basisklasse fuer Sensoren (Temperatur, Druck etc.)

Sensoren messen physikalische Groessen und pushen ihre Werte ueber
WebSocket und optional MQTT an alle verbundenen Clients.

Datenfluss:
    Sensor-Hardware -> push_update(value) -> WebSocket + MQTT
    
Plugin-Implementierung:
    class MeinSensor(CBPiSensor):
        async def run(self):
            while self.running:
                value = await self.read_hardware()
                self.push_update(value)
                await asyncio.sleep(1)
"""

import asyncio
import logging
from abc import abstractmethod, ABCMeta
from cbpi.api.extension import CBPiExtension


from cbpi.api.base import CBPiBase

class CBPiSensor(CBPiBase, metaclass=ABCMeta):

    def __init__(self, cbpi, id, props):
        self.cbpi = cbpi
        self.id = id
        self.props = props
        self.logger = logging.getLogger(__file__)
        self.data_logger = None
        self.state = False
        self.running = False

    def init(self):
        pass

    def log_data(self, value):
        self.cbpi.log.log_data(self.id, value)

    def get_state(self):
        pass

    def get_value(self):
        pass

    def get_unit(self):
        pass

    def push_update(self, value, mqtt = True):
        try:
            self.cbpi.ws.send(dict(topic="sensorstate", id=self.id, value=value))
            if mqtt:
                self.cbpi.push_update("cbpi/sensordata/{}".format(self.id), dict(id=self.id, value=value), retain=True)
#            self.cbpi.push_update("cbpi/sensor/{}/udpate".format(self.id), dict(id=self.id, value=value), retain=True)
        except Exception:
            logging.error("Failed to push sensor update")

    async def start(self):
        pass

    async def stop(self):
        pass

    async def on_start(self):
        pass

    async def on_stop(self):
        pass

    async def run(self):
        pass
    
    async def _run(self):

        try:
            await self.on_start()
            self.cancel_reason = await self.run()
        except asyncio.CancelledError as e:
            pass
        finally:
            await self.on_stop()
