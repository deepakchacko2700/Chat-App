import json
from channels.generic.websocket import JsonWebsocketConsumer
from asgiref.sync import async_to_sync
from django.contrib.auth.models import User
from  .models import Conversation, Message
from .serializers import MessageSerializer


import json
from uuid import UUID
 
 
class UUIDEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, UUID):
            # if the obj is uuid, we simply return the value of uuid
            return obj.hex
        return json.JSONEncoder.default(self, obj)

class ChatConsumer(JsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.user = None
        self.conversation_name = None
        self.conversation = None

    @classmethod
    def encode_json(cls, content):
        return json.dumps(content, cls=UUIDEncoder)

    def connect(self):
        self.user = self.scope["user"]
        if not self.user.is_authenticated:
            return
 
        self.accept()
        self.conversation_name = f"{self.scope['url_route']['kwargs']['conversation_name']}"
        self.conversation, created = Conversation.objects.get_or_create(name=self.conversation_name)
 
        async_to_sync(self.channel_layer.group_add)(
        self.conversation_name,
        self.channel_name,
        )
        messages = self.conversation.messages.all().order_by("-timestamp")[0:50]
        self.send_json({
            "type": "last_50_messages",
            "messages": MessageSerializer(messages, many=True).data,
            })

    def disconnect(self, code):
        print("Disconnected!")
        return super().disconnect(code)

    def receive_json(self, content, **kwargs):
        # print(content)
        message_type = content['type']
        if message_type == 'chat_message':
            # saving message into to database
            message = Message.objects.create(
                from_user=self.user,
                to_user=self.get_receiver(),
                content=content["message"],
                conversation=self.conversation
                )
            async_to_sync(self.channel_layer.group_send)(
                self.conversation_name,
                {
                    'type':'chat_message_echo',
                    'name':content['name'],
                    "message": MessageSerializer(message).data,
                }
            )
        return super().receive_json(content, **kwargs)

    def get_receiver(self):
        usernames = self.conversation_name.split("__")
        for username in usernames:
            if username != self.user.username:
                # This is the receiver
                return User.objects.get(username=username)
    
    def chat_message_echo(self, event):
        # print(event)
        self.send_json(event)