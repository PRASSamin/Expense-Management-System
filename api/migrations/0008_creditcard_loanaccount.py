# Generated by Django 5.1 on 2024-09-04 12:51

import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_remove_balance_available_credit_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='CreditCard',
            fields=[
                ('bankaccount_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='api.bankaccount')),
                ('credit_limit', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                ('interest_rate', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                ('credit_used', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                ('available_credit', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                ('last_payment_date', models.DateField(default=django.utils.timezone.now)),
                ('last_interest_update', models.DateField(default=django.utils.timezone.now)),
            ],
            bases=('api.bankaccount',),
        ),
        migrations.CreateModel(
            name='LoanAccount',
            fields=[
                ('bankaccount_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='api.bankaccount')),
                ('interest_rate', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                ('loan_amount', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
            ],
            bases=('api.bankaccount',),
        ),
    ]
