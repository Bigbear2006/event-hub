from django.conf import settings
from django.contrib.auth.tokens import default_token_generator

from jwt_auth.models import User


def send_email(user: User) -> None:
    token = default_token_generator.make_token(user)
    url = f'{settings.VERIFY_EMAIL_URL}?user_id={user.pk}&token={token}'
    msg = (
        f'Чтобы завершить регистрацию на сайте, '
        f'перейдите по ссылке: <a href="{url}">{url}</a>'
    )
    user.email_user('Активация аккаунта', '', html_message=msg)
