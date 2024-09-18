from celery import shared_task
import requests
from time import sleep
from api.models import *
from api.serializers import *
from django.utils import timezone
import calendar

@shared_task
def daily_interest_calculation():
    current_date = timezone.now().date()

    accounts = [CreditCard.objects.all(), LoanAccount.objects.all()]


    for account in accounts:
        for acc in account:
            if isinstance(acc, CreditCard):
                if acc.last_interest_update < current_date:
                    day_diff = (current_date - acc.last_interest_update).days
                    daily_interest_rate = acc.interest_rate / 100 / 365
                    calc_interest = acc.balance * day_diff * daily_interest_rate
                    acc.balance += calc_interest
                    acc.interest += calc_interest
                    acc.last_interest_update = current_date
                    acc.save()
            elif isinstance(acc, LoanAccount):
                if acc.last_interest_update < current_date:
                    day_diff = (current_date - acc.last_interest_update).days
                    daily_interest_rate = acc.interest_rate / 100 / 365
                    calc_interest = acc.loan_remaining * day_diff * daily_interest_rate
                    acc.loan_remaining += calc_interest
                    acc.last_interest_update = current_date
                    acc.save()

        return 'Interest calculated successfully'