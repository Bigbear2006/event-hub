import csv
import io
from typing import Any, cast

from django.contrib import admin
from django.db.models import ForeignKey, QuerySet, Subquery
from django.forms.models import ModelChoiceField, ModelForm
from django.http import HttpRequest, HttpResponse
from openpyxl import Workbook
from openpyxl.styles import Font

from api.filters import EventStatusFilter
from api.models import Event, EventParticipation, Feedback
from api.services import (
    notify_user_about_event,
    notify_user_about_updated_event,
)
from jwt_auth.models import User


class EventParticipationInline(admin.TabularInline[EventParticipation, Event]):
    model = EventParticipation

    def get_queryset(
        self,
        request: HttpRequest,
    ) -> QuerySet[EventParticipation]:
        return super().get_queryset(request).filter(user__is_active=True)

    def formfield_for_foreignkey(
        self,
        db_field: ForeignKey[Any],
        request: HttpRequest,
        **kwargs: Any,
    ) -> ModelChoiceField[Any] | None:
        if db_field.name == 'user':
            kwargs['queryset'] = User.objects.filter(is_active=True)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


@admin.register(Event)
class EventAdmin(admin.ModelAdmin[Event]):
    list_display = ('title', 'start_date', 'end_date', 'is_cancelled')
    exclude = ('created_by',)
    search_fields = ('title', 'short_description', 'full_description')
    search_help_text = 'Поиск по названию, краткому и полному описанию'
    list_filter = (EventStatusFilter,)
    inlines = (EventParticipationInline,)
    actions = ('cancel', 'export_to_csv', 'export_to_excel')

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
        form: ModelForm[Event],
        change: bool,
    ) -> None:
        if not change and not obj.created_by:
            obj.created_by = cast(User, request.user)
        super().save_model(request, obj, form, change)

        if change and any(
            i in form.changed_data
            for i in (
                'start_date',
                'end_date',
                'short_description',
                'full_description',
                'payment_info',
            )
        ):
            for user in User.objects.filter(is_active=True, events__event=obj):
                notify_user_about_updated_event.delay(obj.pk, user.pk)

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
                    notify_user_about_event.delay(event.pk, new_obj.user.pk)

    @admin.action(description='Выгрузить пользователей в CSV')
    def export_to_csv(
        self,
        request: HttpRequest,
        queryset: QuerySet[Event],
    ) -> HttpResponse:
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename=users.csv'

        response.write('\ufeff')
        wrapper = io.TextIOWrapper(response, encoding='utf-8', newline='')  # type: ignore
        writer = csv.writer(wrapper)
        writer.writerow(
            ['ID', 'ФИО', 'Email', 'Админ', 'Дата создания', 'Активен'],
        )

        for user in User.objects.filter(
            events__event__in=Subquery(queryset.values('id')),
            is_active=True,
        ):
            writer.writerow(
                [
                    user.id,
                    user.username,
                    user.email,
                    'Да' if user.is_staff else 'Нет',
                    user.date_joined.strftime('%d.%m.%Y %H:%M:%S'),
                    'Да' if user.is_active else 'Нет',
                ],
            )

        return response

    @admin.action(description='Выгрузить пользователей в XlSX')
    def export_to_excel(
        self,
        request: HttpRequest,
        queryset: QuerySet[Event],
    ) -> HttpResponse:
        wb = Workbook()
        ws = wb.active
        ws.title = 'Пользователи'

        headers = ['ID', 'ФИО', 'Email', 'Админ', 'Дата создания', 'Активен']
        ws.append(headers)

        for user in User.objects.filter(
            events__event__in=Subquery(queryset.values('id')),
            is_active=True,
        ):
            ws.append(
                [
                    user.id,
                    user.username,
                    user.email,
                    user.is_staff,
                    user.date_joined.strftime('%d.%m.%Y %H:%M:%S'),
                    user.is_active,
                ],
            )

        for cell in ws[1]:  # type: ignore
            cell.font = Font(bold=True)

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
        response['Content-Disposition'] = 'attachment; filename=users.xlsx'

        wb.save(response)
        return response


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin[Feedback]):
    list_display = ('__str__', 'rating', 'event', 'user')
    list_filter = ('rating', 'participation__event')
    search_fields = ('text',)
    search_help_text = 'Поиск по тексту'
    list_select_related = ('participation__event', 'participation__user')
    ordering = ('-created_at',)
    readonly_fields = ('participation', 'text', 'rating', 'created_at')

    @admin.display(description='Событие')
    def event(self, obj: Feedback) -> str:
        return str(obj.participation.event)

    @admin.display(description='Пользователь')
    def user(self, obj: Feedback) -> str:
        return str(obj.participation.user)
