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

]


