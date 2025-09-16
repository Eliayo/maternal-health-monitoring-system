import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "maternal_health.settings")
app = Celery("maternal_health")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
