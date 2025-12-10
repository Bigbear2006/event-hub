from django.contrib.auth import get_user_model
from django.core import validators
from django.core.exceptions import ValidationError
from django.db import models
from django.utils.timezone import now


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
    is_cancelled = models.BooleanField('Отменено', default=False)
    created_by = models.ForeignKey(
        get_user_model(),
        models.SET_NULL,
        'created_events',
        null=True,
        blank=True,
        verbose_name='Создал',
    )

    class Meta:
        verbose_name = 'Событие'
        verbose_name_plural = 'События'

    def __str__(self) -> str:
        return self.title

    def is_active(self) -> bool:
        return self.start_date <= now() <= self.end_date

    def clean(self) -> None:
        super().clean()
        today = now()

        # if not self.pk and self.start_date < today:
        #     raise ValidationError(
        #         {
        #             'start_date': 'Дата начала должна быть позже '
        #             'сегодняшней даты',
        #         },
        #     )

        if (
            self.pk
            and self.max_participants_count is not None
            and self.users.count() > self.max_participants_count
        ):
            raise ValidationError(
                {
                    'max_participants_count': (
                        'Количество участников этого события '
                        'превышает максимальное'
                    ),
                },
            )

        if not self.pk and self.end_date < today:
            raise ValidationError(
                {
                    'end_date': 'Дата окончания должна быть позже '
                    'сегодняшней даты',
                },
            )

        if self.start_date >= self.end_date:
            raise ValidationError(
                {'end_date': 'Дата окончания должна быть позже даты начала'},
            )

    @property
    def message_text(self) -> str:
        return (
            f'Краткое описание: {self.short_description}\n<br/>'
            f'Описание: {self.full_description}\n<br/>'
            f'Информация об оплате: {self.payment_info}\n<br/>'
            f'Дата начала: {self.start_date:%d.%m.%Y %H:%M:%S}\n<br/>'
            f'Дата окончания: {self.end_date:%d.%m.%Y %H:%M:%S}\n<br/>'
        )


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
