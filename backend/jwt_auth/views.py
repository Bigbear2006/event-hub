from typing import cast

from django.core.cache import cache
from django.utils.decorators import method_decorator
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.generics import CreateAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from jwt_auth.models import User
from jwt_auth.serializers import UserSerializer
from jwt_auth.services import (
    send_forgot_password_email,
    send_success_registration_email,
    validate_token,
)


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


class VerifyCodeAPIView(APIView):
    def post(self, request: Request) -> Response:
        code = request.data.get('code', '')
        user_id = request.data.get('user_id', '')

        if not code or not code.isdigit() or not user_id:
            return Response(
                {'error': 'code and user_id are required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.get(pk=user_id)
        cached_code = cache.get(f'{user.email}:code')
        if not cached_code or cached_code != int(code):
            return Response(
                {'error': 'code is invalid'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = True
        user.save()
        send_success_registration_email(user)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ForgotPasswordAPIView(APIView):
    def post(self, request: Request) -> Response:
        user = User.objects.filter(email=request.data.get('email', '')).first()
        if not user:
            return Response(
                {'error': 'user with this email does not exist'},
                status.HTTP_404_NOT_FOUND,
            )

        send_forgot_password_email(user)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ResetPasswordAPIView(APIView):
    def post(self, request: Request) -> Response:
        user = validate_token(request)
        if isinstance(user, Response):
            return user

        password = request.data.get('password')
        if not password:
            return Response(
                {'error': 'param password unfilled'},
                status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(password)
        user.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
