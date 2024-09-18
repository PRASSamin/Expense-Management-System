# Generated by Django 5.1 on 2024-09-16 03:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0015_bankaccount_transfer_rate'),
    ]

    operations = [
        migrations.AddField(
            model_name='creditcard',
            name='credit_limit',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=10),
        ),
    ]