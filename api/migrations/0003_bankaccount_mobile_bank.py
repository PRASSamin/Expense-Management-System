# Generated by Django 5.1 on 2024-08-22 05:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_remove_bankaccount_is_active_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='bankaccount',
            name='mobile_bank',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
