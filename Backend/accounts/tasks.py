from datetime import timedelta
from django.utils import timezone
from celery import shared_task
from django.db import transaction
from .models import ExaminationRecord, AppointmentReminder, Notification
from .utils import send_sms


@shared_task
def send_appointment_reminders():
    today = timezone.localdate()
    tomorrow = today + timedelta(days=1)

    count = 0

    # Day-before reminders
    count += _send_for_date(
        target_date=tomorrow,
        kind="day_before",
        msg_tpl="Reminder: Your ANC visit is on {date}."
    )

    # Same-day reminders
    count += _send_for_date(
        target_date=today,
        kind="same_day",
        msg_tpl="Your ANC visit is today ({date}). Please attend."
    )

    return f"✅ Sent {count} reminders"


def _send_for_date(target_date, kind, msg_tpl):
    qs = (ExaminationRecord.objects
          .filter(is_active=True,
                  next_appointment=target_date,
                  mother__is_active=True)
          .select_related("mother"))

    sent = 0
    for ex in qs:
        if AppointmentReminder.objects.filter(exam=ex, kind=kind).exists():
            continue

        message = msg_tpl.format(date=target_date.strftime("%Y-%m-%d"))

        with transaction.atomic():
            phone = ex.mother.phone_number
            if phone:
                # For testing, just print instead of sending SMS
                print(f"📱 Would send SMS to {phone}: {message}")
                send_sms(phone, message)

            Notification.objects.create(
                user=ex.mother,
                title="ANC Visit Reminder",
                body=message,
                object_type="examination",
                object_id=ex.id,
            )

            AppointmentReminder.objects.create(exam=ex, kind=kind)

        sent += 1

    return sent


@shared_task
def hello_celery():
    print("👋 Hello from Celery! The worker is running fine.")
    return "done"


# celery -A <maternal_health> worker -l info -P solo
# celery -A <maternal_health> beat -l info
