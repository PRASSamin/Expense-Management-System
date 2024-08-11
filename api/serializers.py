from rest_framework import serializers
from .models import *



class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = (
            'id', 'username', 'first_name', 'last_name', 'email', 'date_joined',
            'gender', 'userUID', 'currency_type'
        )
        read_only_fields = ('id', 'date_joined')


class ExpenseIncomeSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    class Meta:
        model = ExpenseIncome
        fields = ('id', 'title', 'amount', 'date', 'description', 'category', 'type', 'user')