from decimal import Decimal
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from django.conf import settings
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
    userUID = models.CharField(max_length=100, blank=True, null=True, editable=True, unique=True)
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
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    date = models.DateField()
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    category = models.CharField(max_length=255)
    type = models.CharField(max_length=255, choices=[('Expense', 'Expense'), ('Income', 'Income')])
    account = models.ForeignKey('BankAccount', on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.title
    


class BankAccount(models.Model):
    # ACCOUNT_TYPE_CHOICES = [
    #     ('genaral', 'General Account'),
    #     ('credit', 'Credit Card'),
    #     ('debit', 'Debit Card'),
    #     ('mobile', 'Mobile Wallet'),
    #     ('cash', 'Cash'),
    # ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='bank_accounts')
    account_number = models.CharField(max_length=16, unique=False, null=True, blank=True)
    account_type = models.CharField(max_length=10)
    mobile_bank = models.CharField(max_length=100, null=True, blank=True)
    account_name = models.CharField(max_length=100) 
    transfer_rate = models.IntegerField(default=0, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_default = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.account_type} account ending in {self.account_number[-4:]}" if self.account_number else "Bank Account"

    def save(self, *args, **kwargs):
        if self.is_default:
            BankAccount.objects.filter(user=self.user, is_default=True).update(is_default=False)
        
        super().save(*args, **kwargs)



class LoanAccount(BankAccount):
    interest_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, null=True, blank=True)
    loan_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, null=True, blank=True)
    loan_remaining = models.DecimalField(max_digits=10, null=True, blank=True, decimal_places=2, )
    last_interest_update = models.DateField(default=timezone.now)
    last_payment_date = models.DateField(default=timezone.now)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Loan Account for {self.account_name} with amount {self.loan_amount}"
    
    def save(self, *args, **kwargs):
        if self.loan_remaining is None:
            self.loan_remaining = self.loan_amount
        super().save(*args, **kwargs)


class CreditCard(BankAccount):
    interest_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, null=True, blank=True)
    credit_limit = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, null=True, blank=True)
    last_payment_date = models.DateField(default=timezone.now)
    last_interest_update = models.DateField(default=timezone.now)
    interest = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, null=True, blank=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)


class Balance(models.Model):
    account = models.OneToOneField(BankAccount, on_delete=models.CASCADE)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, null=True, blank=True)

    def __str__(self):
        return f"{self.account.account_name} {self.account.account_type} ending in {self.account.account_number[-4:]}"


# class InterestCalculation(models.Model):
#     balance = models.ForeignKey(Balance, on_delete=models.CASCADE)
#     interest_amount = models.DecimalField(max_digits=12, decimal_places=2)
#     calculation_date = models.DateField(default=timezone.now)
#     days_accrued = models.IntegerField()

#     def __str__(self):
#         return f"Interest of {self.interest_amount} on {self.calculation_date} for {self.days_accrued} days"
