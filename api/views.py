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
from datetime import datetime
import jwt
from django.contrib.auth.hashers import make_password
from django.shortcuts import get_object_or_404
from django.core.paginator import Paginator
from django.db import transaction
from decimal import Decimal

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
        if not data:
            return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)

        user = get_object_or_404(CustomUser, userUID=data['userUID'])
        card = get_object_or_404(Card, card_number=data['card_number'])

        with transaction.atomic():
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

            balance_record = Balance.objects.filter(card=card).first()
            if not balance_record:
                return JsonResponse({"status": "error", "message": "Balance record not found for the card"}, status=400)

            current_balance = balance_record.balance

            if data['type'] == 'Expense':
                new_balance = current_balance - Decimal(data['amount'])
            elif data['type'] == 'Income':
                new_balance = current_balance + Decimal(data['amount'])
            else:
                return JsonResponse({"status": "error", "message": "Invalid type value"}, status=400)

            balance_record.balance = new_balance
            balance_record.save()

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
    user = request.GET.get('u', None)

    if not user:
        return JsonResponse({"status": "error", "message": "User not specified"}, status=400)

    incomes = ExpenseIncome.objects.filter(
        user=get_object_or_404(CustomUser, userUID=user),
        type='Income'
    ).order_by('-created_at')

    expenses = ExpenseIncome.objects.filter(
        user=get_object_or_404(CustomUser, userUID=user),
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

    uid = request.GET.get('u', None)

    if not data:
        return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)
    
    if Card.objects.filter(card_number=data['card_number']).exists():
        return JsonResponse({"status": "error", "message": "Card already exists"}, status=400)
    
    add = Card.objects.create(
        user=get_object_or_404(CustomUser, userUID=uid),
        card_type=data['card_type'],
        card_number=data['card_number'],
        card_category=data['card_category'],
        expiry_date=data['expiry_date'],
        cvv=data['cvv'],
        cardholder_name=data['cardholder_name'],
        is_default=data['is_default']
    )

    Balance.objects.create(
        card=add,
        balance=0
    )

    add.save()

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

    cards = Card.objects.filter(user=user)

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
        'deactivate': lambda: setattr(card, 'is_active', False)
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

    if not card:
        return JsonResponse({"status": "error", "message": "Sorry, access denied"}, status=400)

    return JsonResponse({"status": "success", "data": CardSerializer(card).data}, status=200)