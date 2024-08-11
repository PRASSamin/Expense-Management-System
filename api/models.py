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
    type = models.CharField(max_length=255, choices=[('Expense', 'Expense'), ('Income', 'Income')])

    def __str__(self):
        return self.title