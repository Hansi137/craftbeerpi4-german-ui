"""kettle_logic.py - Basisklasse fuer Kessel-Regelungslogik

Definiert die Schnittstelle fuer Temperaturregler im Maischkessel.
Typische Implementierungen: Hysterese-Regler, PID-Regler.

Der Controller startet die Logik als async Task, der solange laeuft
bis stop() aufgerufen oder der Task abgebrochen wird.

Plugin-Implementierung:
    class MeinPIDRegler(CBPiKettleLogic):
        async def run(self):
            while self.running:
                temp = self.get_sensor_value(self.kettle.sensor)
                if temp < self.kettle.target_temp:
                    await self.actor_on(self.kettle.heater)
                else:
                    await self.actor_off(self.kettle.heater)
                await asyncio.sleep(1)
"""

from cbpi.api.base import CBPiBase
from cbpi.api.extension import CBPiExtension
from abc import ABCMeta
import logging
import asyncio



class CBPiKettleLogic(CBPiBase, metaclass=ABCMeta):

    def __init__(self, cbpi, id, props):
        self.cbpi = cbpi
        self.id = id
        self.props = props
        self.state = False  
        self.running = False

    def init(self):
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
        
    def get_state(self):
        return dict(running=self.state)

    async def start(self):
        
        self.state = True

    async def stop(self):
        
        self.task.cancel()
        await self.task
        self.state = False
