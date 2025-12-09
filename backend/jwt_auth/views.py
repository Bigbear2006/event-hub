from typing import cast

from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from django.http import HttpResponseRedirect
from django.utils.decorators import method_decorator
from drf_yasg.utils import swagger_auto_schema
from rest_framework.generics import CreateAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from jwt_auth.models import User
from jwt_auth.serializers import UserSerializer


@method_decorator(swagger_auto_schema(tags=['auth']), 'post')
class RegisterUserAPIView(CreateAPIView[User]):
    queryset = User.objects.all()
    serializer_class = UserSerializer


@method_decorator(swagger_auto_schema(tags=['auth']), 'get')
class UserInfoAPIView(RetrieveAPIView[User]):
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_object(self) -> User:
        return cast(User, self.request.user)


class VerifyEmailAPIView(APIView):
    def get(self, request: Request) -> Response | HttpResponseRedirect:
        user_id = request.query_params.get('user_id', None)
        token = request.query_params.get('token', None)

        if not user_id or not token:
            return Response(
                {'error': 'params user_id and/or token unfilled'},
                400,
            )

        try:
            user = User.objects.get(pk=user_id)
        except (IntegrityError, ObjectDoesNotExist):
            return Response({'error': 'invalid user id'}, 400)

        if token is None or not default_token_generator.check_token(
            user,
            token,
        ):
            return Response({'error': 'invalid token'}, 400)

        user.is_active = True
        user.save()
        return HttpResponseRedirect('http://localhost/events/active/')
