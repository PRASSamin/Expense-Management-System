from django.contrib import admin
from .models import *

class CardInline(admin.TabularInline):
    model = BankAccount
    extra = 0

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name']
    search_fields = ['username', 'email']
    inlines = [CardInline] 

@admin.register(BankAccount)
class BankAccountAdmin(admin.ModelAdmin):
    list_display = ['user', 'account_name', 'account_type', 'account_number', 'is_default']
    search_fields = ['user__username', 'account_number']

@admin.register(ExpenseIncome)
class ExpenseIncomeAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'amount', 'type', 'date']
    search_fields = ['user__username', 'title']

@admin.register(Balance)
class BalanceAdmin(admin.ModelAdmin):
    list_display = [ 'balance']
    search_fields = ['card__card_number']


admin.site.register(CreditCard)
admin.site.register(LoanAccount)