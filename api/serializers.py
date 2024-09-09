from rest_framework import serializers
from .models import *


class SimpleBalanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Balance
        fields = ('balance',)

class BankAccountSerializer(serializers.ModelSerializer):
    balance = SimpleBalanceSerializer(read_only=True)
    class Meta:
        model = BankAccount
        fields = (
            'user', 'account_number', 'account_type', 'mobile_bank', 'account_name', 'balance', 'is_default', 'id', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = (
            'id', 'username', 'first_name', 'last_name', 'email', 'date_joined',
            'gender', 'userUID', 'currency_type' 
        )
        read_only_fields = ('id', 'date_joined')



class CustomUserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = (
            'id', 'username', 'first_name', 'last_name', 'email','gender', 'userUID', 'currency_type'
        )
        read_only_fields = ('id',)



class ExpenseIncomeSerializer(serializers.ModelSerializer):
    user = CustomUserSimpleSerializer(read_only=True)
    account = BankAccountSerializer(read_only=True)
    class Meta:
        model = ExpenseIncome
        fields = ('id', 'title', 'amount', 'date', 'description', 'category', 'type', 'user', 'account')



class BalanceSerializer(serializers.ModelSerializer):
    account = BankAccountSerializer(read_only=True)
    class Meta:
        model = Balance
        fields = ('id', 'balance', 'account')



class CreditCardSerializer(serializers.ModelSerializer):
    balance = SimpleBalanceSerializer(read_only=True)
    class Meta:
        model = CreditCard
        fields = '__all__'



class LoanAccountSerializer(serializers.ModelSerializer):
    balance = SimpleBalanceSerializer(read_only=True)

    class Meta:
        model = LoanAccount
        fields = '__all__'