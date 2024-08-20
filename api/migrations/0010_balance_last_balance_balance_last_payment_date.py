# Generated by Django 5.1 on 2024-08-19 16:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_balance_available_credit_balance_credit_used'),
    ]

    operations = [
        migrations.AddField(
            model_name='balance',
            name='last_balance',
            field=models.DecimalField(blank=True, decimal_places=2, default=0.0, max_digits=12, null=True),
        ),
        migrations.AddField(
            model_name='balance',
            name='last_payment_date',
            field=models.DateField(blank=True, null=True),
        ),
    ]