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
def AddBankAccount(request):
    data = json.loads(request.body)
    uid = request.GET.get('u')

    if not data:
        return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)

    if BankAccount.objects.filter(account_number=data['account_number']).exists():
        return JsonResponse({"status": "error", "message": "Card already exists"}, status=400)

    user = get_object_or_404(CustomUser, userUID=uid)
    
    card_data = {
        'user': user,
        'account_type': data['account_type'],
        'account_number': data['account_number'],
        'account_name': data['account_name'],
        'is_default': data['is_default'],
    }

    if data['account_type'] == 'mobile':
        card_data.update({
            'mobile_bank': data['mobile_bank'],
        })
    elif data['account_type'] == 'credit':
        card_data.update({
            'interest_rate': data['interest_rate'],
        })
    elif data['account_type'] == 'loan':
        card_data.update({
            'loan_amount': data['loan_amount'],
            'interest_rate': data['interest_rate'],
        })

    if data['account_type'] == 'credit':
        account = CreditCard.objects.create(**card_data)
    elif data['account_type'] == 'loan':
        account = LoanAccount.objects.create(**card_data)
    else:
        account = BankAccount.objects.create(**card_data)
    Balance.objects.create(account=account, balance=0)
    
    return JsonResponse({"status": "success", "message": "Account added successfully"}, status=200)



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
def GetUserBankAccounts(request):
    uid = request.GET.get('u', None)

    if not uid:
        return JsonResponse({"status": "error", "message": "User not specified"}, status=400)

    user = get_object_or_404(CustomUser, userUID=uid)

    accounts = BankAccount.objects.filter(user=user).select_related('creditcard', 'loanaccount').order_by('is_default', '-created_at')

    if not accounts.exists():
        return JsonResponse({"status": "error", "message": "No accounts found", "data": []}, status=400)

    account_data = []

    for account in accounts:
        if hasattr(account, 'creditcard'):
            account_data.append(CreditCardSerializer(account.creditcard).data)
        elif hasattr(account, 'loanaccount'):
            account_data.append(LoanAccountSerializer(account.loanaccount).data)
        else:
            account_data.append(BankAccountSerializer(account).data)

    return JsonResponse({"status": "success", "data": account_data}, status=200)


@require_http_methods(["DELETE"])
@csrf_exempt
def delete_account(request):
    id = request.GET.get('q')
    uid = request.GET.get('u')

    if not id:
        return JsonResponse({"status": "error", "message": "Account not specified"}, status=400)
    
    if not uid:
        return JsonResponse({"status": "error", "message": "User not specified"}, status=400)
    
    user = get_object_or_404(CustomUser, userUID=uid)
    account = get_object_or_404(BankAccount, id=id, user=user)

    try:
        with transaction.atomic():
            ExpenseIncome.objects.filter(account=account).delete()

            Balance.objects.filter(account=account).delete()

            account.delete()

        return JsonResponse({"status": "success", "message": "Account deleted successfully"}, status=200)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
    


@require_http_methods(["POST"])
@csrf_exempt
def account_defaultation(request):
    id = request.GET.get('q')
    uid = request.GET.get('u')


    if not id or not uid:
        return JsonResponse({"status": "error", "message": "access denied"}, status=400)

    account = get_object_or_404(BankAccount, id=id, user__userUID=uid)


    if account.is_default == True:
        return JsonResponse({"status": "error", "message": "Account is already default"}, status=400)
    else:
        account.is_default = True
        account.save()
        return JsonResponse({"status": "success", "message": "Account set as default"}, status=200)
    


@require_http_methods(["GET"])
def getBankAccountsDetails(request):
    id = request.GET.get('q')
    userUID = request.GET.get('u')
    type = request.GET.get('type')

    if not id or not userUID or not type:
        return JsonResponse({"status": "error", "message": "Sorry, access denied"}, status=400)
    
    account = None

    if type == 'credit':
        account = get_object_or_404(CreditCard, id=id, user__userUID=userUID)
    elif type == 'loan':
        account = get_object_or_404(LoanAccount, id=id, user__userUID=userUID)
    else:
        account = get_object_or_404(BankAccount, id=id, user__userUID=userUID)

    related_expenses_incomes = ExpenseIncome.objects.filter(account=account)
    balance = Balance.objects.get(account=account)

    account_data = BankAccountSerializer(account).data


    current_date = timezone.now().date()
    if type == 'credit':
        if account.last_interest_update < current_date:
            day_diff = (current_date - account.last_interest_update).days
            daily_interest_rate = account.interest_rate / 100 / 365
            calc_interest = balance.balance * day_diff * daily_interest_rate
            
            balance.balance += calc_interest
            account.interest += calc_interest
            account.last_interest_update = current_date
            account.save()
            balance.save()  

        
        account_data = CreditCardSerializer(account).data

    elif type == 'loan':
        if account.last_interest_update < current_date:
            day_diff = (current_date - account.last_interest_update).days
            daily_interest_rate = account.interest_rate / 100 / 365
            calc_interest = account.loan_remaining * day_diff * daily_interest_rate

            account.loan_remaining += calc_interest
            account.last_interest_update = current_date
            account.save()

        account_data = LoanAccountSerializer(account).data




    expenses_incomes_data = ExpenseIncomeSerializer(related_expenses_incomes, many=True).data
    balance_serializer = SimpleBalanceSerializer(balance).data


    return JsonResponse({
        "status": "success",
        "data": {
            "account": account_data,
            "expenses_incomes": expenses_incomes_data,
            "balance": balance_serializer
        }
    }, status=200)





# @require_http_methods(["GET"])
# def getCardDetails(request):
#     card_number = request.GET.get('c')
#     userUID = request.GET.get('u')

#     if not card_number or not cvv or not userUID:
#         return JsonResponse({"status": "error", "message": "Sorry, access denied"}, status=400)
    
#     card = get_object_or_404(BankAccount, account_number=card_number, user__userUID=userUID)
#     related_expenses_incomes = ExpenseIncome.objects.filter(card=card)
#     balance = Balance.objects.get(card=card)
#     current_date = timezone.now().date()

#     if card.card_category == 'Credit':
#         if balance.last_interest_update < current_date:
#             day_diff = (current_date - balance.last_interest_update).days
#             daily_interest_rate = card.interest_rate / 100 / 365
#             calc_interest = balance.credit_used * day_diff * daily_interest_rate
            
#             balance.credit_used += calc_interest
#             balance.interest += calc_interest
#             balance.last_interest_update = current_date
#             balance.save()

#     balance_serializer = BalanceSerializer(balance).data
#     card_data = CardSerializer(card).data
#     expenses_incomes_data = ExpenseIncomeSerializer(related_expenses_incomes, many=True).data

#     return JsonResponse({
#         "status": "success",
#         "data": {
#             "card": card_data,
#             "expenses_incomes": expenses_incomes_data,
#             "balance": balance_serializer
#         }
#     }, status=200)


@require_http_methods(["POST"])
@csrf_exempt
def PayCredit(request):
    id = request.GET.get('q')
    userUID = request.GET.get('u')
    type = request.GET.get('type')
    data = json.loads(request.body or '{}')

    if not id or not userUID:  
        return JsonResponse({"status": "error", "message": "Sorry, access denied"}, status=400)
    
    account = None
    if type == 'credit':
        account = get_object_or_404(CreditCard, id=id, user__userUID=userUID)
    else:
        account = get_object_or_404(LoanAccount, id=id, user__userUID=userUID)

    user = get_object_or_404(CustomUser, userUID=userUID)
    balance = Balance.objects.get(account=account)
    current_date = timezone.now().date()

    if type == 'credit':
        if account.last_payment_date < current_date:
            ExpenseIncome.objects.create(
                user=user,
                title='Credit Payment',
                amount=balance.balance,
                date=current_date,
                description=f'Credit payment for card ending in {account.account_number[-4:]} from {user.first_name} {user.last_name} on {current_date}',
                category='Credit Payment',
                type='Credit Payment',
                account=account
            )

            balance.balance = 0
            account.interest = 0
            account.last_payment_date = current_date
            balance.save()
            account.save()

            return JsonResponse({"status": "success", "message": "Payment successful"}, status=200)
        
        else:
            return JsonResponse({"status": "error", "message": "Card payment already made for today"}, status=400)
        


    elif type == 'loan':
        amount = Decimal(data['amount'])
        
        if amount > account.loan_remaining:
            return JsonResponse({"status": "error", "message": "Loan payment amount is greater than loan"}, status=400)
        if account.last_payment_date >= current_date:
            return JsonResponse({"status": "error", "message": "Card payment already made for today"}, status=400)

        ExpenseIncome.objects.create(
            user=user,
            title='Loan Payment',
            amount=amount,
            date=current_date,
            description=f'Loan payment for account {account.account_name} from {user.first_name} {user.last_name} on {current_date}',
            category='Loan Payment',
            type='Loan Payment',
            account=account
        )

        account.loan_remaining -= amount

        account.last_payment_date = current_date
        account.save()
        
        return JsonResponse({"status": "success", "message": "Payment successful"}, status=200)



    return JsonResponse({"status": "error", "message": "Card not found"}, status=404)



@csrf_exempt
@require_http_methods(["POST"])
def AddExpenseIncome(request):
    try:
        data = json.loads(request.body)
        if not data or 'amount' not in data or Decimal(data['amount']) <= 0:
            return JsonResponse({"status": "error", "message": "Invalid or missing amount."}, status=400)

        user = get_object_or_404(CustomUser, userUID=data['userUID'])
        account = get_object_or_404(BankAccount, id=data['account_id'])

        with transaction.atomic():
            balance_record = get_object_or_404(Balance, account=account)

            
            if data['type'] == 'Expense':
                new_balance = balance_record.balance - Decimal(data['amount'])
            elif data['type'] == 'Income':
                new_balance = balance_record.balance + Decimal(data['amount'])
            else:
                return JsonResponse({"status": "error", "message": "Invalid type value"}, status=400)

            if account.account_type != 'credit' and new_balance < 0 and data['type'] == 'Expense':
                return JsonResponse({"status": "error", "message": "Insufficient balance"}, status=400)
            
            if account.account_type == 'credit' and new_balance > 0 and data['type'] == 'Income':
                return JsonResponse({"status": "error", "message": "You can't pay more than your unused credit"}, status=400)

            balance_record.balance = new_balance
            balance_record.save()


            add = ExpenseIncome.objects.create(
                user=user,
                title=data['title'],
                amount=Decimal(data['amount']),
                date=data['date'],
                description=data['description'],
                category=data['category'],
                type=data['type'],
                account=account
            )

        return JsonResponse({"status": "success", "message": f"{data['type']} added successfully with id: {add.id}", "data": add.id}, status=201)

    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Invalid JSON format"}, status=400)

    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


@require_http_methods(["GET"])
def GetAccountBalance(request):
    id = request.GET.get('q')
    if not id:
        return JsonResponse({"status": "error", "message": "Account not specified"}, status=400)
    account = get_object_or_404(BankAccount, id=id)
    balance = Balance.objects.get(account=account)
    balance_serializer = BalanceSerializer(balance).data
    return JsonResponse({"status": "success", "data": balance_serializer}, status=200)


@require_http_methods(["POST"])
@csrf_exempt
def BalanceTransfer(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)

    uid = request.GET.get('u')
    if not uid:
        return JsonResponse({"status": "error", "message": "User not specified"}, status=400)

    from_account = get_object_or_404(BankAccount, id=data.get('from_account_id'), user__userUID=uid)
    to_account = get_object_or_404(BankAccount, id=data.get('to_account_id'), user__userUID=uid)

    from_balance = get_object_or_404(Balance, account=from_account)
    to_balance = get_object_or_404(Balance, account=to_account)

    if from_account.account_type == 'credit' or to_account.account_type == 'credit':
        return JsonResponse({"status": "error", "message": "Cannot transfer from or to a credit account"}, status=400)

    try:
        amount = Decimal(data.get('amount'))
        if amount <= 0:
            raise ValueError("Amount must be greater than zero")
    except (TypeError, ValueError, Decimal.InvalidOperation):
        return JsonResponse({"status": "error", "message": "Invalid amount"}, status=400)

    if from_balance.balance < amount:
        return JsonResponse({"status": "error", "message": "Insufficient balance"}, status=400)

    from_balance.balance -= amount
    from_balance.save()

    to_balance.balance += amount
    to_balance.save()

    ExpenseIncome.objects.bulk_create([
        ExpenseIncome(
            user=from_account.user,
            title="Balance Transferred",
            amount=amount,
            date=data.get('date'),
            description=f"Balance transferred to {to_account.account_name}",
            category="Transfer",
            type="Expense",
            account=from_account
        ),
        ExpenseIncome(
            user=to_account.user,
            title="Balance Received",
            amount=amount,
            date=data.get('date'),
            description=f"Balance received from {from_account.account_name}",
            category="Receive",
            type="Income",
            account=to_account
        )
    ])

    return JsonResponse({"status": "success", "message": "Balance transferred successfully"}, status=200)