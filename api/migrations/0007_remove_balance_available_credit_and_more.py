# Generated by Django 5.1 on 2024-09-03 09:17

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_alter_bankaccount_account_type'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='balance',
            name='available_credit',
        ),
        migrations.RemoveField(
            model_name='balance',
            name='credit_used',
        ),
        migrations.RemoveField(
            model_name='balance',
            name='interest',
        ),
        migrations.RemoveField(
            model_name='balance',
            name='last_interest_update',
        ),
        migrations.RemoveField(
            model_name='balance',
            name='last_payment_date',
        ),
    ]
