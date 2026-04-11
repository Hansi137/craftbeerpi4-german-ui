"""http_notification.py - REST-API fuer Benachrichtigungs-Aktionen

Routen:
    POST /notification/{id}/action/{action_id} - Benutzer-Aktion ausfuehren

Wird aufgerufen wenn der Benutzer in der UI auf einen Action-Button
einer Benachrichtigung klickt (z.B. 'Weiter', 'Abbrechen').
"""

import logging
from aiohttp import web
from cbpi.api import request_mapping
from cbpi.utils import json_dumps

class NotificationHttpEndpoints:

    def __init__(self,cbpi):
        self.cbpi = cbpi
        self.cbpi.register(self, url_prefix="/notification")

    @request_mapping(path="/{id}/action/{action_id}", method="POST", auth_required=False)
    async def action(self, request):
        """
        ---
        description: Update an actor
        tags:
        - Notification
        parameters:
        - name: "id"
          in: "path"
          description: "Notification Id"
          required: true
          type: "string"
        - name: "action_id"
          in: "path"
          description: "Action Id"
          required: true
          type: "string"

        responses:
            "200":
                description: successful operation
        """

        notification_id = request.match_info['id']
        action_id = request.match_info['action_id']
        logging.debug("Notification callback: %s action %s", notification_id, action_id)
        self.cbpi.notification.notify_callback(notification_id, action_id)  
        return web.Response(status=204)