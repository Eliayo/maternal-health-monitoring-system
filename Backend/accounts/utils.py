from .models import ActivityLog, User
from django.contrib.auth import get_user_model
import random
from django.db.models import Max, F, Func
import re
import logging
from django.conf import settings


def log_activity(actor, action, target, description=""):
    try:
        ActivityLog.objects.create(
            actor=actor,
            action=action,
            target=target,
            description=description
        )
    except Exception as e:
        # Optional: print or log error if logging fails, but don't crash the main flow
        print(f"[ActivityLog Error] Failed to log activity: {e}")


def generate_custom_id(prefix):
    """
    Generates a unique custom ID like MOM-0001, DOC-0002, etc.
    Compatible with SQLite (no regex in SQL).
    """
    users_with_prefix = User.objects.filter(custom_id__startswith=prefix)

    max_number = 0
    for user in users_with_prefix:
        match = re.search(r'\d+', user.custom_id)
        if match:
            num = int(match.group())
            if num > max_number:
                max_number = num

    new_number = max_number + 1
    return f"{prefix}-{str(new_number).zfill(4)}"


def generate_password():
    """
    Generates a simple default password: 3 letters + 3 random digits.
    """
    letters = ''.join(random.choices('abcdefghjkmnpqrstuvwxyz', k=3))
    digits = ''.join(random.choices('23456789', k=3))
    return letters + digits


logger = logging.getLogger(__name__)


def send_sms(phone_number: str, message: str):
    """
    Pluggable SMS sender.
    For dev: logs only.
    For prod: wire up Twilio/Termii/Africa's Talking here.
    """
    backend = getattr(settings, "SMS_BACKEND", "console")
    if backend == "console":
        logger.info(f"[SMS] to {phone_number}: {message}")
        return

    if backend == "twilio":
        from twilio.rest import Client
        client = Client(settings.TWILIO_SID, settings.TWILIO_TOKEN)
        client.messages.create(
            to=phone_number,
            from_=settings.TWILIO_FROM,
            body=message
        )
        return

    # Add more providers here...
    logger.warning(f"Unknown SMS_BACKEND={backend}. Falling back to console.")
    logger.info(f"[SMS] to {phone_number}: {message}")
