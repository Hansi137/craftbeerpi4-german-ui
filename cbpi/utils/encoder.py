"""encoder.py - JSON-Encoder fuer komplexe Datentypen

Erweitert den Standard-JSONEncoder um Unterstuetzung fuer:
    - Objekte mit to_json() Methode (z.B. Dataclasses)
    - datetime.datetime -> ISO-String
    - pandas.Timestamp  -> String
"""

import datetime
import logging
from json import JSONEncoder

from pandas import Timestamp

class ComplexEncoder(JSONEncoder):

    def default(self, obj):
        try:

            if hasattr(obj, "to_json") and callable(getattr(obj, "to_json")):
                return obj.to_json()
            elif isinstance(obj, datetime.datetime):
                return obj.__str__()
            elif isinstance(obj, Timestamp):
                return obj.__str__()
            else:
                logging.debug("Unhandled type in JSON encoder: %s", type(obj))
                raise TypeError()
        except Exception as e:
            
            pass
        return None
