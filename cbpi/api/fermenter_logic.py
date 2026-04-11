"""fermenter_logic.py - Basisklasse fuer Fermenter-Regelungslogik

Identisch zu kettle_logic.py, aber fuer Gaerbottiche/Fermenter.
Unterstuetzt zusaetzlich Kuehlung und Druckregelung (Spunding).

Plugin-Implementierung:
    class MeineGaerLogik(CBPiFermenterLogic):
        async def run(self):
            while self.running:
                # Temperatur- und Druckregelung
                await asyncio.sleep(1)
"""

from cbpi.api.base import CBPiBase
from cbpi.api.extension import CBPiExtension
from abc import ABCMeta
import logging
import asyncio



class CBPiFermenterLogic(CBPiBase, metaclass=ABCMeta):

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
