import os

from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Expense_Management_System.settings')

app = Celery('Expense_Management_System')

app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks()


app.conf.beat_schedule = {
    'daily_interest_calc': {
        'task': 'api.tasks.daily_interest_calculation',
        'schedule': crontab(hour=23, minute=59),  
    },
}
