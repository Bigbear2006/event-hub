from django.apps import AppConfig


class JwtAuthConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'jwt_auth'
    verbose_name = 'Авторизация'

    def ready(self) -> None:
        import jwt_auth.signals  # noqa
