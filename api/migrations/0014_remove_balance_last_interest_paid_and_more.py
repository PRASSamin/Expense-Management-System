# Generated by Django 5.1 on 2024-08-20 06:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0013_rename_last_balance_balance_last_interest_paid'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='balance',
            name='last_interest_paid',
        ),
        migrations.AddField(
            model_name='balance',
            name='last_interest_update',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='expenseincome',
            name='type',
            field=models.CharField(choices=[('Expense', 'Expense'), ('Income', 'Income'), ('Restore Credit', 'Restore Credit')], max_length=255),
        ),
    ]