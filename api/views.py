from django.shortcuts import render
from django.http.response import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.views.decorators.http import require_http_methods
from api.models import *
from api.serializers import *
import logging
from dotenv import load_dotenv
from django.contrib.auth import authenticate
import uuid
from datetime import datetime, timedelta
import jwt
from django.contrib.auth.hashers import make_password
from django.shortcuts import get_object_or_404
from django.core.paginator import Paginator
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
from django.db.models import Q

load_dotenv()

logger = logging.getLogger(__name__)

logging.basicConfig(filename='app.log', level=logging.INFO)

@csrf_exempt
@require_http_methods(["POST"])
def Login(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        logging.error("Invalid JSON received in login request")
        return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)
            
    email = data.get("email", "")
    password = data.get("password", "")
    if not email or not password:
        logging.error("email or password not provided in email login request")
        return JsonResponse({"status": "error", "message": "email and password required"}, status=400)
    
    user = CustomUser.objects.filter(email=email).first() if "@" in email else CustomUser.objects.filter(username=str(email).lower()).first() 
            
    if user:
        print(user.email)
        print(password)
        authenticated_user = authenticate(request, username=user.username, password=password)
        print(authenticated_user)
        if authenticated_user:
            authenticated_user.last_login = datetime.now()
            # authenticated_user.session_code = uuid.uuid4().hex
            authenticated_user.save()

            user_data = CustomUserSerializer(authenticated_user).data
                   
            logging.info(f'[{datetime.now()} :: {request.META.get("REMOTE_ADDR")}] Login Successful for user: {authenticated_user.email} with Email')


            encoded_data = jwt.encode(user_data, "your_secret_key", algorithm='HS256')

            return JsonResponse({"status": "success", "message": "Login successful", "data": encoded_data}, status=200)
        else:
            logging.error("Wrong email or password in email login request")
            return JsonResponse({"status": "errorInfo", "message": "Wrong email or password", 'subMessage': 'Forget Password'}, status=401)
    else:
        logging.error("User not registered in email login request")
        return JsonResponse({"status": "error", "message": "You are not registered", "subMessage": "Register"}, status=404)


@csrf_exempt
@require_http_methods(["POST"])
def Register(request):
    try:
        data = json.loads(request.body)
        print(data)
        password = make_password(data['password'])
        
        if CustomUser.objects.filter(email=data['email']).exists():
            return JsonResponse({"status": "error", "message": "Email already exists", 'subMessage': 'Login'}, status=401)
        elif CustomUser.objects.filter(username=data['username']).exists():
            return JsonResponse({"status": "error", "message": "Username not available"}, status=401)
    
        

        user = CustomUser.objects.create(
            first_name=data['first_name'],
            last_name=data['last_name'],
            gender=data['gender'],
            email=data['email'],
            username=data['username'],
            password=password,
            currency_type=data['currency'],
        )

        user.save()

        logging.info(f'[{datetime.now()} :: {request.META.get("REMOTE_ADDR")}] Registration Successful for user: {user.email} with Email')


        user_data = CustomUserSerializer(user).data
                   


        encoded_data = jwt.encode(user_data, "your_secret_key", algorithm='HS256')

        return JsonResponse({"status": "success", "message": "Registration successful", 'data': encoded_data}, status=201)
       
    except KeyError as e:
        return JsonResponse({"status": "error", "message": f"Invalid data format: {str(e)}"}, status=400)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)



@csrf_exempt
@require_http_methods(["POST"])
def AddExpenseIncome(request):
    try:
        data = json.loads(request.body)
        if not data or 'amount' not in data or Decimal(data['amount']) <= 0:
            return JsonResponse({"status": "error", "message": "Invalid or missing amount."}, status=400)

        user = get_object_or_404(CustomUser, userUID=data['userUID'])
        card = get_object_or_404(Card, card_number=data['card_number'])

        with transaction.atomic():
            balance_record = get_object_or_404(Balance, card=card)

            if card.card_category == 'Debit':
                if data['type'] == 'Expense':
                    new_balance = balance_record.balance - Decimal(data['amount'])
                elif data['type'] == 'Income':
                    new_balance = balance_record.balance + Decimal(data['amount'])
                else:
                    return JsonResponse({"status": "error", "message": "Invalid type value"}, status=400)

                balance_record.balance = new_balance
                balance_record.save()

            elif card.card_category == 'Credit':
                if data['type'] == 'Expense':
                    if Decimal(data['amount']) > balance_record.available_credit:
                        return JsonResponse({"status": "error", "message": "Request declined, Not enough credit available"}, status=400)

                    new_credit_used = round(balance_record.credit_used + Decimal(data['amount']), 2)
                    balance_record.credit_used = new_credit_used
                    balance_record.available_credit = round(card.credit_limit - new_credit_used, 2)
                    
                else:
                    return JsonResponse({"status": "error", "message": "Invalid type value"}, status=400)

                balance_record.save()

            add = ExpenseIncome.objects.create(
                user=user,
                title=data['title'],
                amount=Decimal(data['amount']),
                date=data['date'],
                description=data['description'],
                category=data['category'],
                type=data['type'],
                card=card
            )

        return JsonResponse({"status": "success", "message": f"{data['type']} added successfully with id: {add.id}", "data": add.id}, status=201)

    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Invalid JSON format"}, status=400)

    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
    


@require_http_methods(["GET"])
def GetExpenseIncome7Days(request):
    user = request.GET.get('u', None)
    row_per_page = request.GET.get('rpp', None)

    if not row_per_page:
        return JsonResponse({"status": "error", "message": "Rows per page not specified"}, status=400)

    if not user:
        return JsonResponse({"status": "error", "message": "User not specified"}, status=400)

    data = ExpenseIncome.objects.filter(
        user=get_object_or_404(CustomUser, userUID=user),
        date__gte=timezone.now() - timezone.timedelta(days=7)
    ).order_by('-created_at')

    paginator = Paginator(data, row_per_page)
    try:
        data = paginator.page(1)
    except:
        return JsonResponse({"status": "error", "message": "Invalid page number"}, status=400)

    serialized_data = ExpenseIncomeSerializer(data, many=True).data

    return JsonResponse({"status": "success", "data": serialized_data, "totalEntries": paginator.count}, status=200)


@require_http_methods(["POST"])
@csrf_exempt
def deleteExpenseIncome7Days(request):
    data = json.loads(request.body)
    userUID = request.GET.get('u', None)

    if not userUID:
        return JsonResponse({"status": "error", "message": "User not specified"}, status=400)
    if not data:
        return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)
    ids = data['ids']

    if not ids:
        return JsonResponse({"status": "error", "message": "No ids specified"}, status=400)

    for id in ids:
        expense = get_object_or_404(ExpenseIncome, id=id , user__userUID=userUID)
        expense.delete()

    return JsonResponse({"status": "success", "message": f"{len(ids)} items deleted successfully"}, status=200)


@require_http_methods("GET")
def getIncomesOrExpenses(request):
    user = request.GET.get('u', None)
    row_per_page = request.GET.get('rpp', None)
    q=request.GET.get('q', None)

    if not row_per_page:
        return JsonResponse({"status": "error", "message": "Rows per page not specified"}, status=400)

    if not user:
        return JsonResponse({"status": "error", "message": "User not specified"}, status=400)

    data = ExpenseIncome.objects.filter(
        user=get_object_or_404(CustomUser, userUID=user),
        type=q
    ).order_by('-created_at')

    paginator = Paginator(data, row_per_page)
    try:
        data = paginator.page(1)
    except:
        return JsonResponse({"status": "error", "message": "Invalid page number"}, status=400)

    serialized_data = ExpenseIncomeSerializer(data, many=True).data

    return JsonResponse({"status": "success", "data": serialized_data, "totalEntries": paginator.count}, status=200)

@require_http_methods(["GET"])
def getAllDatas(request):
    userUID = request.GET.get('u', None)

    if not userUID:
        return JsonResponse({"status": "error", "message": "User not specified"}, status=400)

    user = get_object_or_404(CustomUser, userUID=userUID)
    from django.db.models import Q

    incomes = ExpenseIncome.objects.filter(
        Q(user=user) & (Q(type='Income') | Q(type='Restore Credit'))
    ).order_by('-created_at')



    expenses = ExpenseIncome.objects.filter(
        user=user,
        type='Expense'
    ).order_by('-created_at')

    data = {
        'incomes': ExpenseIncomeSerializer(incomes, many=True).data,
        'expenses': ExpenseIncomeSerializer(expenses, many=True).data
    }

    return JsonResponse({"status": "success", "data": data}, status=200)


@require_http_methods(["POST"])
@csrf_exempt
def AddCard(request):
    data = json.loads(request.body)
    uid = request.GET.get('u')

    if not data:
        return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)

    if Card.objects.filter(card_number=data['card_number']).exists():
        return JsonResponse({"status": "error", "message": "Card already exists"}, status=400)

    user = get_object_or_404(CustomUser, userUID=uid)
    current_month_year = datetime.now().strftime("%m/%Y")
    
    is_active = data['expiry_date'] >= current_month_year
    is_default = data['is_default'] and is_active
    
    card_data = {
        'user': user,
        'card_type': data['card_type'],
        'card_number': data['card_number'],
        'card_category': data['card_category'],
        'expiry_date': data['expiry_date'],
        'cvv': data['cvv'],
        'cardholder_name': data['cardholder_name'],
        'is_default': is_default,
        'is_active': is_active,
    }

    if data['card_category'] == 'Credit':
        card_data.update({
            'interest_rate': data['interest_rate'],
            'credit_limit': data['credit_limit'],
        })

    card = Card.objects.create(**card_data)
    Balance.objects.create(card=card, balance=0)
    
    return JsonResponse({"status": "success", "message": "Card added successfully"}, status=200)



@require_http_methods(["GET"])
def getMyData(request):
    uid = request.GET.get('u', None)

    if not uid:
        return JsonResponse({"status": "error", "message": "User not specified"}, status=400)

    user = get_object_or_404(CustomUser, userUID=uid)

    data = CustomUserSerializer(user).data

    encoded_data = jwt.encode(data, settings.SECRET_KEY, algorithm="HS256")

    return JsonResponse({"status": "success", "data": encoded_data}, status=200)


@require_http_methods(["GET"])
def GetUserCards(request):
    uid = request.GET.get('u', None)

    if not uid:
        return JsonResponse({"status": "error", "message": "User not specified"}, status=400)

    user = get_object_or_404(CustomUser, userUID=uid)

    cards = Card.objects.filter(user=user).order_by('-is_active', '-created_at')

    data = CardSerializer(cards, many=True).data

    return JsonResponse({"status": "success", "data": data}, status=200)


@require_http_methods(["DELETE"])
@csrf_exempt
def delete_card(request):
    card_number = request.GET.get('c')

    if not card_number:
        return JsonResponse({"status": "error", "message": "Card not specified"}, status=400)

    card = get_object_or_404(Card, card_number=card_number)

    try:
        with transaction.atomic():
            ExpenseIncome.objects.filter(card=card).delete()

            Balance.objects.filter(card=card).delete()

            card.delete()

        return JsonResponse({"status": "success", "message": "Card deleted successfully"}, status=200)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
    


@require_http_methods(["POST"])
@csrf_exempt
def card_activation_and_defaultation(request):
    card_number = request.GET.get('c')
    action = request.GET.get('a')

    if not card_number or not action:
        print(card_number, action)
        return JsonResponse({"status": "error", "message": "Card number or action not specified"}, status=400)

    card = get_object_or_404(Card, card_number=card_number)

    actions = {
        'default': lambda: setattr(card, 'is_default', True),
        'activate': lambda: setattr(card, 'is_active', True),
        'deactivate': lambda: (setattr(card, 'is_active', False), setattr(card, 'is_default', False))
    }

    if action in actions:
        actions[action]()
        card.save()
        if action == 'activate':
            return JsonResponse({"status": "success", "message": "Card activated successfully"}, status=200)
        elif action == 'deactivate':
            return JsonResponse({"status": "success", "message": "Card deactivated successfully"}, status=200)
        elif action == 'default':
            return JsonResponse({"status": "success", "message": "Card set as default successfully"}, status=200)
    
    return JsonResponse({"status": "error", "message": "Invalid action"}, status=400)


@require_http_methods(["GET"])
def getCardDetails(request):
    card_number = request.GET.get('c')
    cvv = request.GET.get('cvv')
    userUID = request.GET.get('u')

    if not card_number or not cvv or not userUID:
        return JsonResponse({"status": "error", "message": "Sorry, access denied"}, status=400)
    
    card = get_object_or_404(Card, card_number=card_number, cvv=cvv, user__userUID=userUID)
    related_expenses_incomes = ExpenseIncome.objects.filter(card=card)
    balance = Balance.objects.get(card=card)
    current_date = timezone.now().date()

    if card.card_category == 'Credit':
        if balance.last_interest_update < current_date:
            day_diff = (current_date - balance.last_interest_update).days
            daily_interest_rate = card.interest_rate / 100 / 365
            calc_interest = balance.credit_used * day_diff * daily_interest_rate
            
            balance.credit_used += calc_interest
            balance.interest += calc_interest
            balance.last_interest_update = current_date
            balance.save()

    balance_serializer = BalanceSerializer(balance).data
    card_data = CardSerializer(card).data
    expenses_incomes_data = ExpenseIncomeSerializer(related_expenses_incomes, many=True).data

    return JsonResponse({
        "status": "success",
        "data": {
            "card": card_data,
            "expenses_incomes": expenses_incomes_data,
            "balance": balance_serializer
        }
    }, status=200)


require_http_methods(["POST"])
@csrf_exempt
def PayCredit(request):
    card_number = request.GET.get('c')
    cvv = request.GET.get('cvv')
    userUID = request.GET.get('u')

    if not card_number or not cvv or not userUID:  
        return JsonResponse({"status": "error", "message": "Sorry, access denied"}, status=400)
    
    card = get_object_or_404(Card, card_number=card_number, cvv=cvv, user__userUID=userUID)
    user = get_object_or_404(CustomUser, userUID=userUID)
    balance = Balance.objects.get(card=card)
    current_date = timezone.now().date()

    if card.card_category == 'Credit':
        if balance.last_payment_date < current_date:
            ExpenseIncome.objects.create(
                user=user,
                title='Credit Payment',
                amount=balance.credit_used,
                date=current_date,
                description=f'Credit payment for card ending in {card.card_number[-4:]} from {user.first_name} {user.last_name} on {current_date}',
                category='Credit Payment',
                type='Restore Credit',
                card=card
            )

            balance.credit_used = 0
            balance.interest = 0
            balance.last_payment_date = current_date
            balance.available_credit = card.credit_limit
            balance.save()

            return JsonResponse({"status": "success", "message": "Card updated successfully"}, status=200)
        else:
            return JsonResponse({"status": "error", "message": "Card payment already made for today"}, status=400)

    return JsonResponse({"status": "error", "message": "Card not found"}, status=404)