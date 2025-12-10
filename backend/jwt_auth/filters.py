from collections.abc import Iterable

from django.contrib import admin
from django.db.models import QuerySet
from django.http import HttpRequest
from django_stubs_ext import StrOrPromise

from jwt_auth.models import User


class UserRoleFilter(admin.SimpleListFilter):
    title = 'Роль'
    parameter_name = 'role'

    def lookups(
        self,
        request: HttpRequest,
        model_admin: admin.ModelAdmin[User],
    ) -> Iterable[tuple[str, StrOrPromise]] | None:
        return (
            ('admin', 'Администратор'),
            ('user', 'Пользователь'),
        )

    def queryset(
        self,
        request: HttpRequest,
        queryset: QuerySet[User],
    ) -> QuerySet[User]:
        if self.value() == 'admin':
            return queryset.filter(is_staff=True)
        if self.value() == 'user':
            return queryset.filter(is_staff=False)
        return queryset
