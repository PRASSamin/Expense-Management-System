from decimal import Decimal
from random import random
from django.db import models
from django.dispatch import receiver
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db.models.signals import post_save
from django.core.mail import send_mail
from django.template.loader import render_to_string
from api.utils import uidGen

class CustomUser(AbstractUser):
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]

    TYPE_CHOICES = [
        ('classic', 'Classic'),
        ('google', 'Google'),
    ]

    CURRENCY_CHOICES = [
        ('USD', 'USD'),
        ('BDT', 'BDT'),
    ]

    # last_password_reset = models.DateTimeField(null=True, blank=True)
    gender = models.CharField(max_length=10, null=True, choices=GENDER_CHOICES, default="O")
    userUID = models.CharField(max_length=100, blank=True, null=True, editable=False, unique=False)
    account_type = models.CharField(max_length=50, blank=False, null=False, default="classic", choices=TYPE_CHOICES)
    # session_code = models.CharField(max_length=3000, blank=True, null=True, default="")
    currency_type = models.CharField(max_length=50, blank=True, null=True, default="USD")


    def __str__(self):
        return self.username
    
    def save(self, *args, **kwargs):
        if not self.userUID:
            self.userUID = uidGen(self.username)
        super().save(*args, **kwargs) 


class ExpenseIncome(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    category = models.CharField(max_length=255)
    type = models.CharField(max_length=255, choices=[('Expense', 'Expense'), ('Income', 'Income'), ['Restore Credit', 'Restore Credit']])
    card = models.ForeignKey('Card', on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.title
    


class Card(models.Model):
    CARD_CATEGORY_CHOICES = [
        ('Debit', 'Debit'),
        ('Credit', 'Credit'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='cards')
    card_type = models.CharField(max_length=20)
    card_number = models.CharField(max_length=16)
    card_category = models.CharField(max_length=10, choices=CARD_CATEGORY_CHOICES)
    expiry_date = models.CharField(max_length=7)
    cardholder_name = models.CharField(max_length=100)
    cvv = models.CharField(max_length=4)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    # credit card specifics
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    credit_limit = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.card_category} {self.card_type} ending in {self.card_number[-4:]}"

    def save(self, *args, **kwargs):
        if self.is_default:
            Card.objects.filter(user=self.user, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)


class Balance(models.Model):
    card = models.OneToOneField(Card, on_delete=models.CASCADE)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    credit_used = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, null=True, blank=True)
    available_credit = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, null=True, blank=True)
    last_payment_date = models.DateField(null=True, blank=True, default=timezone.now)
    last_interest_update = models.DateField(null=True, blank=True, default=timezone.now)
    interest = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.card.card_category == 'Credit':
            if self.card.credit_limit and not self.available_credit:
                self.available_credit = self.card.credit_limit
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.card.card_category} {self.card.card_type} ending in {self.card.card_number[-4:]}"


# class InterestCalculation(models.Model):
#     balance = models.ForeignKey(Balance, on_delete=models.CASCADE)
#     interest_amount = models.DecimalField(max_digits=12, decimal_places=2)
#     calculation_date = models.DateField(default=timezone.now)
#     days_accrued = models.IntegerField()

#     def __str__(self):
#         return f"Interest of {self.interest_amount} on {self.calculation_date} for {self.days_accrued} days"
