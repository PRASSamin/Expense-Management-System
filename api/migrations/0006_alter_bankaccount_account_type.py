# Generated by Django 5.1 on 2024-09-03 05:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_alter_expenseincome_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bankaccount',
            name='account_type',
            field=models.CharField(max_length=10),
        ),
    ]