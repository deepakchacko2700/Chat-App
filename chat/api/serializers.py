from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Message, Conversation


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields = ['username', 'password']
        extra_kwargs = {'password': {'write_only': True}}


class MessageSerializer(serializers.ModelSerializer):
    from_user = serializers.SerializerMethodField()
    to_user = serializers.SerializerMethodField()
    conversation = serializers.SerializerMethodField()
    timestamp = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")
    class Meta:
        model = Message
        fields = (
            "id",
            "conversation",
            "from_user",
            "to_user",
            "content",
            "timestamp",
            "read",
        )
 
    def get_conversation(self, obj):
        return str(obj.conversation.id)
 
    def get_from_user(self, obj):
        return UserSerializer(obj.from_user).data
 
    def get_to_user(self, obj):
        return UserSerializer(obj.to_user).data
    


class ConversationSerializer(serializers.ModelSerializer):
    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_msg_count = serializers.SerializerMethodField()
 
    class Meta:
        model = Conversation
        fields = ("id", "name", "other_user", "last_message", "unread_msg_count")
 
    def get_last_message(self, obj):
        messages = obj.messages.all().order_by("-timestamp")
        if not messages.exists():
            return None
        message = messages[0]
        return MessageSerializer(message).data
 
    def get_other_user(self, obj):
        usernames = obj.name.split("__")
        context = {}
        for username in usernames:
            if username != self.context["user"].username:
                # This is the other participant
                other_user = User.objects.get(username=username)
                return UserSerializer(other_user, context=context).data
    
    def get_unread_msg_count(self, obj):
        count = obj.messages.filter(to_user=self.context["user"], read=False).count()
        return count