from django.contrib import admin
from django.contrib.auth.models import Group

from jwt_auth.models import User

admin.site.unregister(Group)


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
    list_filter = ('is_staff', 'is_active')
    search_fields = ('username', 'email')
    search_help_text = 'Поиск по ФИО и почте'
    ordering = ('-date_joined',)
