from collections.abc import Iterable

from django.contrib import admin
from django.db.models import QuerySet
from django.http import HttpRequest
from django.utils.timezone import now
from django_stubs_ext import StrOrPromise

from api.models import Event


class EventStatusFilter(admin.SimpleListFilter):
    title = 'Статус события'
    parameter_name = 'event_status'

    def lookups(
        self,
        request: HttpRequest,
        model_admin: admin.ModelAdmin[Event],
    ) -> Iterable[tuple[str, StrOrPromise]] | None:
        return (
            ('active', 'Активные'),
            ('inactive', 'Неактивные'),
        )

    def queryset(
        self,
        request: HttpRequest,
        queryset: QuerySet[Event],
    ) -> QuerySet[Event]:
        today = now()

        if self.value() == 'active':
            return queryset.filter(start_date__lte=today, end_date__gte=today)

        if self.value() == 'inactive':
            return queryset.exclude(start_date__lte=today, end_date__gte=today)

        return queryset
