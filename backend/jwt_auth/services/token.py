from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from rest_framework.request import Request
from rest_framework.response import Response

from jwt_auth.models import User


def validate_token(request: Request) -> User | Response:
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

    if token is None or not default_token_generator.check_token(user, token):
        return Response({'error': 'invalid token'}, 400)

    return user
