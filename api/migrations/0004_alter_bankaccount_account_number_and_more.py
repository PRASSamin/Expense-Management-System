# Generated by Django 5.1 on 2024-08-22 08:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_bankaccount_mobile_bank'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bankaccount',
            name='account_number',
            field=models.CharField(blank=True, max_length=16, null=True, unique=True),
        ),
        migrations.AlterField(
            model_name='bankaccount',
            name='account_type',
            field=models.CharField(choices=[('genaral', 'General Account'), ('credit', 'Credit Card'), ('debit', 'Debit Card'), ('mobile', 'Mobile Wallet'), ('cash', 'Cash')], max_length=10),
        ),
    ]