from django.contrib import admin
from django.contrib.auth.models import Group
from django.db.models import QuerySet
from django.http import HttpRequest
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

    @admin.action(description='Пометить как удаленных')
    def mark_as_inactive(
        self,
        request: HttpRequest,
        queryset: QuerySet[User],
    ) -> None:
        queryset.update(is_active=False)
