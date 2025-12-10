from typing import Any

from django.db.models.signals import post_save
from django.dispatch import receiver

from jwt_auth.models import User
from jwt_auth.services import send_verification_code_email


@receiver(signal=post_save, sender=User)
def send_mail_after_create_user(
    instance: User,
    created: bool,
    **kwargs: Any,
) -> None:
    if created and not instance.is_active:
        send_verification_code_email(instance)
