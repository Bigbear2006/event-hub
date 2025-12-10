from typing import Any, cast

from django.contrib import admin
from django.db.models import QuerySet
from django.http import HttpRequest

from api.models import Event, EventParticipation, Feedback
from api.services import notify_user_about_event
from jwt_auth.models import User


class EventParticipationInline(admin.TabularInline[EventParticipation, Event]):
    model = EventParticipation


@admin.register(Event)
class EventAdmin(admin.ModelAdmin[Event]):
    list_display = ('title', 'start_date', 'end_date', 'is_cancelled')
    search_fields = ('title', 'short_description', 'full_description')
    search_help_text = 'Поиск по названию, краткому и полному описанию'
    inlines = (EventParticipationInline,)
    actions = ('cancel',)

    @admin.action(description='Отменить')
    def cancel(
        self,
        request: HttpRequest,
        queryset: QuerySet[EventParticipation],
    ) -> None:
        queryset.update(is_cancelled=True)

    def save_model(
        self,
        request: HttpRequest,
        obj: Event,
        form: Any,
        change: bool,
    ) -> None:
        if not change and not obj.created_by:
            obj.created_by = cast(User, request.user)
        super().save_model(request, obj, form, change)

    def save_related(
        self,
        request: HttpRequest,
        form: Any,
        formsets: Any,
        change: bool,
    ) -> None:
        super().save_related(request, form, formsets, change)
        event = form.instance
        for formset in formsets:
            if not hasattr(formset, 'new_objects'):
                return
            for new_obj in formset.new_objects:
                if isinstance(new_obj, EventParticipation):
                    notify_user_about_event(event, new_obj.user)


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin[Feedback]):
    list_display = (
        '__str__',
        'rating',
        'participation__event',
        'participation__user',
    )
    list_filter = ('rating', 'participation__event')
    search_fields = ('text',)
    search_help_text = 'Поиск по тексту'
    list_select_related = ('participation__event', 'participation__user')
    ordering = ('-created_at',)
    readonly_fields = ('participation', 'text', 'rating', 'created_at')
