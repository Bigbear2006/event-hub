from django.conf import settings

from api.models import Event
from backend.celery import app
from jwt_auth.models import User


@app.task
def send_user_participated_email(event_id: int, user_id: int) -> None:
    event = Event.objects.get(id=event_id)
    user = User.objects.get(id=user_id)
    if not event.created_by:
        return
    msg = f'Пользователь {user} принял участие в событии {event}'
    event.created_by.email_user(
        'Новый пользователь принял участие',
        '',
        html_message=msg,
    )


@app.task
def send_user_cancelled_participation_email(
    event_id: int,
    user_id: int,
) -> None:
    event = Event.objects.get(id=event_id)
    user = User.objects.get(id=user_id)
    if not event.created_by:
        return
    msg = f'Пользователь {user} отменил участие в событии {event}'
    event.created_by.email_user(
        'Пользователь отменил участие в событии',
        '',
        html_message=msg,
    )


@app.task
def notify_user_about_event(event_id: int, user_id: int) -> None:
    event = Event.objects.get(id=event_id)
    user = User.objects.get(id=user_id)
    message = (
        f'<b>Здравствуйте, {user}!\n\n</b>'
        f'Администратор добавил вас в участники события '
        f'{event.title}.\n\n<br/>'
        f'{event.message_text}\n<br/>'
        'Вы можете просмотреть подробности на сайте:\n<br/>'
        f'{settings.BASE_URL}event/{event.pk}/\n'
    )
    user.email_user(
        f'Вас пригласили на мероприятие {event.title}',
        '',
        html_message=message,
    )


@app.task
def notify_user_about_updated_event(event_id: int, user_id: int) -> None:
    event = Event.objects.get(id=event_id)
    user = User.objects.get(id=user_id)
    message = (
        f'Здравствуйте, {user}!\n\n'
        f'В событии {event.title} произошли изменения\n\n'
        f'{event.message_text}\n'
        'Вы можете просмотреть подробности на сайте\n'
        f'{settings.BASE_URL}event/{event.pk}/\n'
    )
    user.email_user(
        f'Изменения в событии {event.title}',
        '',
        html_message=message,
    )
