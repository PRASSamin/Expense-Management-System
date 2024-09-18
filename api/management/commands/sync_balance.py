from django.core.management.base import BaseCommand
from api.models import BankAccount, LoanAccount, CreditCard, Balance

class Command(BaseCommand):
    help = 'Syncs BankAccount, LoanAccount, and CreditCard with Balance table'

    def handle(self, *args, **kwargs):
        self.sync_balance_for_accounts(BankAccount)
        self.sync_balance_for_accounts(LoanAccount)
        self.sync_balance_for_accounts(CreditCard)
        self.stdout.write(self.style.SUCCESS('Balance sync completed successfully'))

    def sync_balance_for_accounts(self, account_model):
        # Get all accounts from the provided account model
        accounts = account_model.objects.all()

        for account in accounts:
            # Check if a Balance record exists for this account
            if not Balance.objects.filter(account=account).exists():
                # Create a Balance record for the account
                Balance.objects.create(account=account, balance=0.00)
                self.stdout.write(self.style.SUCCESS(f"Created balance for {account}"))
            else:
                self.stdout.write(self.style.WARNING(f"Balance already exists for {account}"))
