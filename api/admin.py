from django.contrib import admin
from .models import *

class CardInline(admin.TabularInline):
    model = Card
    extra = 0

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name']
    search_fields = ['username', 'email']
    inlines = [CardInline] 

@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = ['user', 'card_type', 'card_number', 'expiry_date', 'is_active']
    search_fields = ['user__username', 'card_number']

@admin.register(ExpenseIncome)
class ExpenseIncomeAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'amount', 'type', 'date']
    search_fields = ['user__username', 'title']

@admin.register(Balance)
class BalanceAdmin(admin.ModelAdmin):
    list_display = ['card', 'balance']
    search_fields = ['card__user__username', 'card__card_number']
