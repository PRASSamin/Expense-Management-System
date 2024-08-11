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
    data = json.loads(request.body)
    if not data:
        return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)
    
    add = ExpenseIncome.objects.create(
        user=get_object_or_404(CustomUser, userUID=data['userUID']),
        title=data['title'],
        amount=data['amount'],
        date=data['date'],
        description=data['description'],
        category=data['category'],
        type=data['type'],
    ) 

    add.save()

    return JsonResponse({"status": "success", "message": f"{data['type']} added successfully with id: {add.id}", "data": add.id}, status=201)

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