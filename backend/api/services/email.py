from django.conf import settings

from api.models import Event
from jwt_auth.models import User


def send_user_participated_email(event: Event, user: User) -> None:
    if not event.created_by:
        return
    msg = f'Пользователь {user} принял участие в событии {event}'
    event.created_by.email_user(
        'Новый пользователь принял участие',
        '',
        html_message=msg,
    )


def send_user_cancelled_participation_email(event: Event, user: User) -> None:
    if not event.created_by:
        return
    msg = f'Пользователь {user} отменил участие в событии {event}'
    event.created_by.email_user(
        'Пользователь отменил участие в событии',
        '',
        html_message=msg,
    )


def notify_user_about_event(event: Event, user: User) -> None:
    message = (
        f'Здравствуйте, {user}!\n\n'
        f'Администратор добавил вас в участники события {event.title}.\n'
        f'Дата начала: {event.start_date}\n'
        f'Дата окончания: {event.end_date}\n\n'
        'Вы можете просмотреть подробности на сайте\n'
        f'{settings.BASE_URL}event/{event.pk}/\n'
    )
    user.email_user(
        f'Вас пригласили на мероприятие {event.title}',
        '',
        html_message=message,
    )
