import random
from django.core.management.base import BaseCommand
from faker import Faker
from api.models import ExpenseIncome, CustomUser, BankAccount, CreditCard, LoanAccount, Balance
from django.utils import timezone
from django.db import transaction
from decimal import Decimal
from django.shortcuts import get_object_or_404

# Expense and Income Categories
ExpenseCategory = [
    "Rent", "Utilities", "Groceries", "Transportation",
    "Healthcare/Medical", "Insurance", "Education",
    "Entertainment", "Dining Out", "Clothing", "Debt Payments",
    "Savings/Investments", "Gifts/Donations", "Miscellaneous",
]

IncomeCategory = [
    "Salary", "Freelancing", "Business", "Investments",
    "Interest", "Rental Income", "Dividends", "Gifts",
    "Bonuses",
]

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        fake = Faker()
        user = CustomUser.objects.get(username='bidyut')

        expense_categories = ExpenseCategory
        income_categories = IncomeCategory
        types = ['Expense', 'Income']

        # Date ranges for random data
        years = list(range(2024, 2025))
        months = list(range(1, 13))

        # Get all types of accounts for the user
        all_accounts = list(BankAccount.objects.filter(user=user)) + \
                       list(CreditCard.objects.filter(user=user)) + \
                       list(LoanAccount.objects.filter(user=user))

        if not all_accounts:
            self.stdout.write(self.style.WARNING('No accounts found for the user'))
            return

        for _ in range(100):  # Create 200 random records
            year = random.choice(years)
            month = random.choice(months)
            day = random.randint(1, 28)

            amount = round(random.uniform(10, 1000), 2)
            date = timezone.datetime(year=year, month=month, day=day).date()
            title = fake.sentence(nb_words=3)
            description = fake.text(max_nb_chars=200)
            type_ = random.choice(types)

            if type_ == 'Expense':
                category = random.choice(expense_categories)
            else:
                category = random.choice(income_categories)

            # Select a random account from all the user's accounts
            account = random.choice(all_accounts)

            # Skip the iteration if the account is a loan account
            if account.account_type == 'loan':
                self.stdout.write(self.style.WARNING(f'Skipping loan account: {account}'))
                continue

            # Get or create the balance record for this account
            balance_record, created = Balance.objects.get_or_create(account=account, defaults={'balance': 0.00})

            # Update balance based on the transaction type
            with transaction.atomic():
                if type_ == 'Expense':
                    new_balance = balance_record.balance - Decimal(amount)
                    if new_balance < 0 and account.account_type != 'credit':
                        self.stdout.write(self.style.WARNING(f'Insufficient balance for account: {account}'))
                        continue
                    if account.account_type == 'credit':
                        account = CreditCard.objects.filter(id=account.id).first()
                        if abs(new_balance) > account.credit_limit:
                            self.stdout.write(self.style.WARNING(f'Exceeded credit limit for account: {account}'))
                            continue
                elif type_ == 'Income':
                    new_balance = balance_record.balance + Decimal(amount)
                    if account.account_type == 'credit' and new_balance > 0:
                        self.stdout.write(self.style.WARNING(f'Cannot overpay credit for account: {account}'))
                        continue

                # Update the balance
                balance_record.balance = new_balance
                balance_record.save()

                # Create the ExpenseIncome record
                ExpenseIncome.objects.create(
                    account=account,
                    user=user,
                    title=title,
                    amount=amount,
                    date=date,
                    description=description,
                    category=category,
                    type=type_
                )

                self.stdout.write(self.style.SUCCESS(f'Created entry: {title} - {type_} - ${amount} on {date} for account: {account}'))
        
        self.stdout.write(self.style.SUCCESS('Successfully populated ExpenseIncome model and updated balances for all account types'))
