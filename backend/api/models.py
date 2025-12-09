from django.contrib.auth import get_user_model
from django.core import validators
from django.db import models


class Event(models.Model):
    title = models.CharField('Название', max_length=255)
    image = models.ImageField('Изображение', upload_to='events/')
    short_description = models.TextField(
        'Краткое описание (до 255 символов)',
        max_length=255,
        blank=True,
    )
    full_description = models.TextField('Полное описание')
    start_date = models.DateTimeField('Дата начала')
    end_date = models.DateTimeField('Дата окончания')
    payment_info = models.TextField('Данные по оплате', blank=True)
    max_participants_count = models.PositiveIntegerField(
        'Максимальное количество участников',
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name = 'Событие'
        verbose_name_plural = 'События'

    def __str__(self) -> str:
        return self.title


class EventParticipation(models.Model):
    user = models.ForeignKey(
        get_user_model(),
        models.CASCADE,
        'events',
        verbose_name='Пользователь',
    )
    event = models.ForeignKey(
        Event,
        models.CASCADE,
        'users',
        verbose_name='Событие',
    )
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)

    class Meta:
        verbose_name = 'Участник события'
        verbose_name_plural = 'Участники события'
        unique_together = ('user', 'event')

    def __str__(self) -> str:
        return f'{self.event} - {self.user}'


class Feedback(models.Model):
    participation = models.ForeignKey(
        EventParticipation,
        models.CASCADE,
        'feedback',
        verbose_name='Участие в событии',
    )
    text = models.TextField('Текст', blank=True)
    rating = models.PositiveIntegerField(
        'Оценка',
        validators=[
            validators.MinValueValidator(1),
            validators.MaxValueValidator(10),
        ],
    )
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)

    class Meta:
        verbose_name = 'Отзыв'
        verbose_name_plural = 'Отзывы'

    def __str__(self) -> str:
        return self.text[:50]
