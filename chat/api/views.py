from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin
from django.contrib.auth.models import User
from django.db.models import Max

from .serializers import UserSerializer, ConversationSerializer
from .models import Conversation

 
class CustomObtainAuthTokenView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        print(user)
        token, created = Token.objects.get_or_create(user=user)
        # print(token)
        return Response({"token": token.key, "username": user.username})
    

class UserModelViewSet(ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all()


class ConversationViewSet(ListModelMixin, RetrieveModelMixin, GenericViewSet):
    serializer_class = ConversationSerializer
    queryset = Conversation.objects.none()
    lookup_field = "name"
 
    def get_queryset(self):
        queryset = Conversation.objects.filter(
            name__contains=self.request.user.username
        ).annotate(most_recent=Max('messages__timestamp')).order_by('-most_recent')
        return queryset
 
    def get_serializer_context(self):
        return {"request": self.request, "user": self.request.user}