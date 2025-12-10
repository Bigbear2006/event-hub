from typing import Any

from rest_framework import serializers

from jwt_auth.models import User


class UserSerializer(serializers.ModelSerializer[User]):
    class Meta:
        model = User
        exclude = (
            'is_active',
            'is_superuser',
            'last_login',
            'groups',
            'user_permissions',
        )
        extra_kwargs = {
            'password': {'write_only': True},
            'is_staff': {'read_only': True},
            'date_joined': {'read_only': True},
        }

    def create(self, validated_data: Any) -> User:
        validated_data['is_active'] = False
        return User.objects.create_user(
            username=validated_data.pop('username', None),
            email=validated_data.pop('email', None),
            password=validated_data.pop('password', None),
            **validated_data,
        )
