import random

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.cache import cache

from backend.celery import app
from jwt_auth.models import User

@app.task
def send_verification_code_email(user_id: int) -> None:
    user = User.objects.get(id=user_id)
    code = random.randint(1000, 9999)
    cache.set(f'{user.email}:code', code, timeout=300)
    msg = f'Ваш код подтверждения: {code}'
    user.email_user('Активация аккаунта', '', html_message=msg)


@app.task
def send_success_registration_email(user_id: int) -> None:
    user = User.objects.get(id=user_id)
    msg = (
        f'Поздравляем, вы успешно зарегистрировались в на нашем сайте!\n\n'
        f'<a href="{settings.BASE_URL}">{settings.BASE_URL}</a>'
    )
    user.email_user('Успешная регистрация', '', html_message=msg)


@app.task
def send_forgot_password_email(user_id: int) -> None:
    user = User.objects.get(id=user_id)
    token = default_token_generator.make_token(user)
    url = f'{settings.BASE_URL}reset-password/?user_id={user.pk}&token={token}'
    msg = (
        f'Перейдите по ссылке и создайте новый пароль: '
        f'<a href="{url}">{url}</a>'
    )
    user.email_user('Смена пароля', '', html_message=msg)
