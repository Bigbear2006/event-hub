from django.contrib import admin
from django.db.models import QuerySet
from django.http import HttpRequest

from api.models import Event, EventParticipation, Feedback


class EventParticipationInline(admin.TabularInline[EventParticipation, Event]):
    model = EventParticipation


@admin.register(Event)
class EventAdmin(admin.ModelAdmin[Event]):
    list_display = ('title', 'start_date', 'end_date', 'is_cancelled')
    search_fields = ('title', 'short_description', 'full_description')
    search_help_text = 'Поиск по названию, краткому и полному описанию'
    inlines = (EventParticipationInline,)

    @admin.action(description='Отменить')
    def cancel(
        self,
        request: HttpRequest,
        queryset: QuerySet[EventParticipation],
    ) -> None:
        queryset.update(is_cancelled=True)


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
