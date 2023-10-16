"""
ASGI config for chat project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
django_asgi_app =  get_asgi_application()

# import django
from api.middleware import TokenAuthMiddleware 
from channels.routing import ProtocolTypeRouter, URLRouter

import api.routing

os.environ["DJANGO_SETTINGS_MODULE"] = "chat.settings"

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chat.settings')
# django.setup()

application = ProtocolTypeRouter({
  'http': django_asgi_app,
  'websocket': TokenAuthMiddleware(  
        URLRouter(
            api.routing.websocket_urlpatterns
        )
    ), 
})
