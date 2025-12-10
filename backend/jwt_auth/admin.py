import csv
import io

from django.contrib import admin
from django.contrib.auth.models import Group
from django.db.models import QuerySet
from django.http import HttpRequest, HttpResponse
from openpyxl import Workbook
from openpyxl.styles import Font
from rangefilter.filters import DateTimeRangeFilterBuilder

from jwt_auth.filters import UserRoleFilter
from jwt_auth.models import User

admin.site.unregister(Group)
admin.site.disable_action('delete_selected')


@admin.register(User)
class UserAdmin(admin.ModelAdmin[User]):
    list_display = (
        'username',
        'email',
        'is_staff',
        'date_joined',
        'is_active',
    )
    fields = (
        'username',
        'email',
        'is_staff',
        'date_joined',
        'is_active',
    )
    list_filter = (
        UserRoleFilter,
        ('date_joined', DateTimeRangeFilterBuilder()),
        'is_active',
    )
    search_fields = ('username', 'email')
    search_help_text = 'Поиск по ФИО и почте'
    ordering = ('-date_joined',)
    actions = ('mark_as_inactive', 'export_to_csv', 'export_to_excel')

    @admin.action(description='Пометить как удаленных')
    def mark_as_inactive(
        self,
        request: HttpRequest,
        queryset: QuerySet[User],
    ) -> None:
        queryset.update(is_active=False)

    @admin.action(description='Выгрузить в CSV')
    def export_to_csv(
        self,
        request: HttpRequest,
        queryset: QuerySet[User],
    ) -> HttpResponse:
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename=users.csv'

        response.write('\ufeff')
        wrapper = io.TextIOWrapper(response, encoding='utf-8', newline='')
        writer = csv.writer(wrapper)
        writer.writerow(
            ['ID', 'ФИО', 'Email', 'Админ', 'Дата создания', 'Активен'],
        )

        for user in queryset:
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

    @admin.action(description='Выгрузить в XlSX')
    def export_to_excel(
        self,
        request: HttpRequest,
        queryset: QuerySet[User],
    ) -> HttpResponse:
        wb = Workbook()
        ws = wb.active
        ws.title = 'Пользователи'

        headers = ['ID', 'ФИО', 'Email', 'Админ', 'Дата создания', 'Активен']
        ws.append(headers)

        for user in queryset:
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
