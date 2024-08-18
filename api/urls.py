from django.urls import path 
from .views import *


urlpatterns = [
    path('api/login/', name="login", view=Login),
    path('api/register/', name="register", view=Register),
    path('api/add/expense-income/', name="Add Expense Income", view=AddExpenseIncome),
    path('api/get/expense-income/7days/', name="Get Expense Income", view=GetExpenseIncome7Days),
    path('api/delete/expense-income/7days/', name="Delete Expense Income", view=deleteExpenseIncome7Days),
    path('api/get/data/', name="Get Incomes or Expenses", view=getIncomesOrExpenses),
    path('api/get/all/data/', name="Get Incomes And Expenses", view=getAllDatas),
    path('api/add/card/', name="Add Card", view=AddCard),
    path('api/get/my/data/', name="Get My Data", view=getMyData),
    path('api/get/user/cards/', name="Get User Cards", view=GetUserCards),
    path('api/delete/card/', name="Delete Card", view=delete_card),
    path('api/card/activation-defaultation/', name="Card Activation Defaultation", view=card_activation_and_defaultation), 
    path('api/get/card/details/', getCardDetails, name='Get Card Details'),
]


