import random
from django.core.management.base import BaseCommand
from faker import Faker
from api.models import ExpenseIncome, CustomUser

ExpenseCategory = [
    "Rent", "Utilities", "Groceries", "Transportation",
    "Healthcare/Medical", "Insurance", "Education",
    "Entertainment", "Dining Out", "Clothing", "Debt Payments",
    "Savings/Investments", "Gifts/Donations", "Miscellaneous",
]

IncomeCategory = [
    "Salary", "Freelancing", "Business", "Investments",
    "Interest", "Rental Income", "Dividends", "Gifts",
    "Bonuses", "Others",
]

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        fake = Faker()
        user = CustomUser.objects.get(username='prassamin')

        expense_categories = ExpenseCategory
        income_categories = IncomeCategory
        types = ['Expense', 'Income']

        years = list(range(2010, 2025)) 
        months = list(range(1, 13)) 

        for _ in range(200):
            year = random.choice(years)
            month = random.choice(months)
            day = random.randint(1, 28)

            amount = round(random.uniform(10, 1000), 2)
            date = fake.date_of_birth(minimum_age=0, maximum_age=0).replace(year=year, month=month, day=day)
            title = fake.sentence(nb_words=3)
            description = fake.text(max_nb_chars=200)
            type_ = random.choice(types)

            if type_ == 'Expense':
                category = random.choice(expense_categories)
            else:
                category = random.choice(income_categories)

            ExpenseIncome.objects.create(
                user=user,
                title=title,
                amount=amount,
                date=date,
                description=description,
                category=category,
                type=type_
            )
            self.stdout.write(self.style.SUCCESS(f'Created entry: {title} - {type_} - ${amount} on {date}'))

        self.stdout.write(self.style.SUCCESS('Successfully populated ExpenseIncome model with random data'))
