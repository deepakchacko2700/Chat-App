import json
from channels.generic.websocket import JsonWebsocketConsumer
from asgiref.sync import async_to_sync
from django.contrib.auth.models import User
from django.db.models import Max

from  .models import Conversation, Message
from .serializers import MessageSerializer, ConversationSerializer


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
            # sending message to the group
            async_to_sync(self.channel_layer.group_send)(
                self.conversation_name,
                {
                    'type':'chat_message_echo',
                    'name':content['name'],
                    "message": MessageSerializer(message).data,
                }
            )
            # sending message to the notification_group of the other user
            notification_group_name = self.get_receiver().username + "__notifications"
            async_to_sync(self.channel_layer.group_send)(
                notification_group_name,
                {
                    "type": "new_message_notification",
                    "name": self.user.username,
                    "message": MessageSerializer(message).data,
                },
            )
        
        if message_type == 'read_messages':
            msg_to_me =  self.conversation.messages.filter(to_user= self.user, read=False)
            msg_to_me.update(read=True)
        
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

    def new_message_notification(self, event):
        self.send_json(event)


class NotificationConsumer(JsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.user = None
        self.notification_group_name = None
 
    def connect(self):
        self.user = self.scope["user"]
        if not self.user.is_authenticated:
            return
 
        self.accept()
        self.notification_group_name = self.user.username + "__notifications"
        async_to_sync(self.channel_layer.group_add)(
                    self.notification_group_name,
                    self.channel_name,
                    )

        unread_count = Message.objects.filter(to_user=self.user, read=False).count()
        active_conversations = Conversation.objects.filter(
                        name__contains=self.user.username
                        ).annotate(most_recent=Max('messages__timestamp')
                        ).order_by('-most_recent')
        self.send_json(
            {
            "type": "unread_count",
            "unread_count": unread_count,
            "active_conversations": ConversationSerializer(active_conversations, context= {'user': self.user}, many= True).data
            }
        )

    def disconnect(self, code):
        async_to_sync(self.channel_layer.group_discard)(
        self.notification_group_name,
        self.channel_name,
        )
        return super().disconnect(code)
    
    def new_message_notification(self, event):
        self.send_json(event)
