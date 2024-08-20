from rest_framework import serializers
from .models import *

class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = (
            'id', 'card_type', 'card_number', 'card_category', 'expiry_date', 
            'cardholder_name', 'cvv', 'is_default', 'created_at', 'updated_at', 'is_active', 'credit_limit', 'interest_rate'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

class CardSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = ('card_number', 'card_type', 'expiry_date', 'is_default', 'is_active', 'card_category')

class CustomUserSerializer(serializers.ModelSerializer):
    cards = CardSimpleSerializer(many=True, read_only=True)  

    class Meta:
        model = CustomUser
        fields = (
            'id', 'username', 'first_name', 'last_name', 'email', 'date_joined',
            'gender', 'userUID', 'currency_type', 'cards' 
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
    card = CardSimpleSerializer(read_only=True)
    class Meta:
        model = ExpenseIncome
        fields = ('id', 'title', 'amount', 'date', 'description', 'category', 'type', 'user', 'card')



class BalanceSerializer(serializers.ModelSerializer):
    card = CardSimpleSerializer(read_only=True)
    class Meta:
        model = Balance
        fields = ('id', 'balance', 'credit_used', 'available_credit', 'last_payment_date', 'last_interest_update', 'interest', 'card')