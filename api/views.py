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
from decimal import Decimal, InvalidOperation
from django.db.models import Q
from .tasks import *
from celery.result import AsyncResult

load_dotenv()

logger = logging.getLogger(__name__)

logging.basicConfig(filename='app.log', level=logging.INFO)


@csrf_exempt
@require_http_methods(["POST"])
def Login(request):
    """
    This function handles the login request. It receives a POST request with JSON data containing the user's email and password. 
    If the email and password are valid, it authenticates the user and generates a JSON Web Token (JWT) for the authenticated user.
    The JWT is then returned in the response along with a success message. If the email or password is invalid, appropriate error messages are returned.
    If the user is not registered, a message indicating that the user is not registered is returned.
    Returns:
    - JsonResponse: A JSON response containing the status, message, and data (JWT) if the login is successful. Otherwise, it returns an error message.
    Example usage:
    response = Login(request)
    """

    # Try to parse the JSON data from the request body
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
    

    # Check if the user exists in the database
    user = CustomUser.objects.filter(email=email).first() if "@" in email else CustomUser.objects.filter(username=str(email).lower()).first() 

    # If the user exists, authenticate the user with the provided password 
    if user:
        authenticated_user = authenticate(request, username=user.username, password=password)
        if authenticated_user:
            authenticated_user.last_login = datetime.now()
            authenticated_user.save()


            # Serialize the authenticated user data
            user_data = CustomUserSerializer(authenticated_user).data
                   
            logging.info(f'[{datetime.now()} :: {request.META.get("REMOTE_ADDR")}] Login Successful for user: {authenticated_user.email} with Email')


            # Generate a JSON Web Token (JWT) for the authenticated user
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
    """
    Registers a new user.
    Parameters:
    - request: The HTTP request object with first_name, last_name, gender, email, username, password and currency.
    Returns:
    - JsonResponse: A JSON response containing the registration status and message.
    Raises:
    - KeyError: If the request body contains invalid data format.
    - Exception: If an unexpected error occurs during the registration process.
    """

    # Try to parse the JSON data from the request body
    try:
        data = json.loads(request.body)
        print(data)
        password = make_password(data['password'])
        

        # Check if the email or username already exists in the database
        if CustomUser.objects.filter(email=data['email']).exists():
            return JsonResponse({"status": "error", "message": "Email already exists", 'subMessage': 'Login'}, status=401)
        # Check if the username already exists in the database
        elif CustomUser.objects.filter(username=data['username']).exists():
            return JsonResponse({"status": "error", "message": "Username not available"}, status=401)
        

        # Create a new user with the provided data
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


        # Serialize the user data
        user_data = CustomUserSerializer(user).data


        # Generate a JSON Web Token (JWT) for the registered user
        encoded_data = jwt.encode(user_data, "your_secret_key", algorithm='HS256')

        return JsonResponse({"status": "success", "message": "Registration successful", 'data': encoded_data}, status=201)
       
    # Handle invalid data format
    except KeyError as e:
        return JsonResponse({"status": "error", "message": f"Invalid data format: {str(e)}"}, status=400)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)



@require_http_methods(["GET"])
def GetExpenseIncome7Days(request):
    """
    This view function retrieves the expenses and incomes of a user for the past 7 days.

    Parameters:
    - request: The HTTP request object.

    Returns:
    - JsonResponse: A JSON response containing the status, data, and totalEntries.

    Raises:
    - JsonResponse: If the 'rows per page' or 'user' parameters are not specified.
    - JsonResponse: If the page number is invalid.


    Note:
    - This function requires the 'u' and 'rpp' parameters to be present in the request's GET parameters.
    - The 'u' parameter specifies the user.
    - The 'rpp' parameter specifies the number of rows per page.
    - The function filters the ExpenseIncome objects based on the user and the date range of the past 7 days.
    - The filtered data is paginated using the 'row_per_page' parameter.
    - The serialized data is returned in the JSON response along with the total number of entries.
    """

    user = request.GET.get('u', None)
    row_per_page = request.GET.get('rpp', None)


    # Check if the 'rows per page' and 'user' parameter is specified
    if not row_per_page:
        return JsonResponse({"status": "error", "message": "Rows per page not specified"}, status=400)
    if not user:
        return JsonResponse({"status": "error", "message": "User not specified"}, status=400)


    # Filter the ExpenseIncome objects based on the user and the date range of the past 7 days
    data = ExpenseIncome.objects.filter(
        user=get_object_or_404(CustomUser, userUID=user),
        date__gte=timezone.now() - timezone.timedelta(days=7)
    ).order_by('-created_at')

    # Paginate the filtered data
    paginator = Paginator(data, row_per_page)
    try:
        data = paginator.page(1)
    except:
        return JsonResponse({"status": "error", "message": "Invalid page number"}, status=400)

    # Serialize the paginated data
    serialized_data = ExpenseIncomeSerializer(data, many=True).data

    return JsonResponse({"status": "success", "data": serialized_data, "totalEntries": paginator.count}, status=200)


@require_http_methods(["POST"])
@csrf_exempt
def deleteExpenseIncome7Days(request):
    """
    Deletes expense or income records for a specific user based on provided IDs within 7 days.

    This view handles POST requests to delete multiple records of `ExpenseIncome` 
    for a user identified by the `userUID` passed as a query parameter. The request 
    body should contain a JSON object with a list of record IDs to delete.

    Parameters:
    - request: The HTTP request object, expected to be a POST request.
        - Query parameters:
            - u (str): User UID, identifying the user whose records are to be deleted.
        - JSON body:
            - ids (list): A list of record IDs that need to be deleted.

    Returns:
    - JsonResponse: A JSON response indicating the result of the operation.
        - Success response: 
            - status: "success"
            - message: "{n} items deleted successfully"
        - Error responses (with status code 400):
            - "User not specified" if no `userUID` is provided.
            - "Invalid JSON" if the request body does not contain valid JSON.
            - "No ids specified" if the `ids` list is empty or missing.

    Exceptions:
    - Raises `Http404` if any `ExpenseIncome` record with the specified `id` 
      and `userUID` is not found.
    """

    # Try to parse the JSON data from the request body
    data = json.loads(request.body)
    userUID = request.GET.get('u', None)

    # Check if the 'userUID' and 'data' and 'ids' is specified
    if not userUID:
        return JsonResponse({"status": "error", "message": "User not specified"}, status=400)
    if not data:
        return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)
    ids = data['ids']

    if not ids:
        return JsonResponse({"status": "error", "message": "No ids specified"}, status=400)

    # Delete the records with the specified IDs
    for id in ids:
        expense = get_object_or_404(ExpenseIncome, id=id , user__userUID=userUID)
        expense.delete()

    return JsonResponse({"status": "success", "message": f"{len(ids)} items deleted successfully"}, status=200)


@require_http_methods("GET")
def getIncomesOrExpenses(request):
    """
    Retrieves a paginated list of income or expense records for a specific user.

    This view handles GET requests to fetch either income or expense records 
    based on the 'type' parameter (`q`), with pagination. The number of rows 
    per page and user identification are passed as query parameters.

    Query Parameters:
    - u (str): The user UID used to identify the user whose records are being requested.
    - rpp (int): The number of rows per page (i.e., how many records to return).
    - q (str): A filter parameter, expected to be either 'income' or 'expense' to filter 
      the records accordingly.

    Returns:
    - JsonResponse: A JSON response containing the filtered, paginated records.
        - Success response (status=200):
            - status: "success"
            - data: A list of serialized income or expense records.
            - totalEntries: The total number of matching records.
        - Error responses (status=400):
            - "Rows per page not specified" if `rpp` is missing.
            - "User not specified" if `u` (user UID) is missing.
            - "Invalid page number" if pagination fails.

    Exceptions:
    - Raises `Http404` if the `CustomUser` with the specified `userUID` is not found.
    """

    # Get the query parameters from the request
    user = request.GET.get('u', None)
    row_per_page = request.GET.get('rpp', None)
    q=request.GET.get('q', None)

    # Check if the 'rows per page' and 'user' parameter is specified
    if not row_per_page:
        return JsonResponse({"status": "error", "message": "Rows per page not specified"}, status=400)
    if not user:
        return JsonResponse({"status": "error", "message": "User not specified"}, status=400)

    # Filter the ExpenseIncome objects based on the user and the type
    data = ExpenseIncome.objects.filter(
        user=get_object_or_404(CustomUser, userUID=user),
        type=q
    ).order_by('-created_at')

    # Paginate the filtered data
    paginator = Paginator(data, row_per_page)
    try:
        data = paginator.page(1)
    except:
        return JsonResponse({"status": "error", "message": "Invalid page number"}, status=400)

    # Serialize the paginated data
    serialized_data = ExpenseIncomeSerializer(data, many=True).data

    return JsonResponse({"status": "success", "data": serialized_data, "totalEntries": paginator.count}, status=200)



@require_http_methods(["GET"])
def getAllDatas(request):
    """
    Retrieves all income and expense records for a specific user.

    This view handles GET requests to fetch both income and expense records for 
    a user identified by their `userUID`. It uses two separate queries to retrieve 
    income (including 'Income' and 'Restore Credit') and expense records, ordered 
    by creation date.

    Query Parameters:
    - u (str): The user UID used to identify the user whose records are being requested.

    Returns:
    - JsonResponse: A JSON response containing the filtered records.
        - Success response (status=200):
            - status: "success"
            - data: A dictionary containing:
                - 'incomes': A list of serialized income and restore credit records.
                - 'expenses': A list of serialized expense records.
        - Error response (status=400):
            - "User not specified" if the 'u' query parameter is missing.

    Exceptions:
    - Raises `Http404` if the `CustomUser` with the specified `userUID` is not found.
    """

    # Get the user UID from the query parameters
    userUID = request.GET.get('u', None)


    # Check if the 'userUID' is specified
    if not userUID:
        return JsonResponse({"status": "error", "message": "User not specified"}, status=400)

    # Retrieve the user based on the user UID
    user = get_object_or_404(CustomUser, userUID=userUID)
    from django.db.models import Q


    # Retrieve all income and restore credit records for the user with multiple conditions using Q method
    incomes = ExpenseIncome.objects.filter(
        Q(user=user) & 
        Q(type='Income') & 
        (~Q(category='Receive') & ~Q(category='Transfer'))
    ).order_by('-created_at')


    # Retrieve all expense records for the user
    expenses = ExpenseIncome.objects.filter(
    Q(user=user) &
    Q(type='Expense') &
    (~Q(category='Receive') & ~Q(category='Transfer'))
    ).order_by('-created_at')

    # Serialize the income and expense records
    data = {
        'incomes': ExpenseIncomeSerializer(incomes, many=True).data,
        'expenses': ExpenseIncomeSerializer(expenses, many=True).data
    }

    return JsonResponse({"status": "success", "data": data}, status=200)


@require_http_methods(["POST"])
@csrf_exempt
def AddBankAccount(request):
    """
    Adds a new bank, mobile, credit, or loan account for a specific user.

    This view handles POST requests to add a new account (bank, mobile, credit, or loan) for a user.
    The account data is provided in the request body as JSON. Depending on the type of account, 
    additional data like mobile bank, interest rate, or loan amount is processed. The function 
    checks if the account number already exists to avoid duplicates.

    Request Parameters:
    - u (str): The user UID to identify the owner of the account.

    Request Body (JSON):
    - account_type (str): The type of account ('bank', 'mobile', 'credit', or 'loan').
    - account_number (str): The account number (must be unique).
    - account_name (str): The name of the account holder.
    - is_default (bool): Whether this account should be marked as the default account.
    - mobile_bank (str, optional): The mobile bank provider (required if account_type is 'mobile').
    - interest_rate (float, optional): The interest rate (required if account_type is 'credit' or 'loan').
    - loan_amount (float, optional): The loan amount (required if account_type is 'loan').

    Returns:
    - JsonResponse: A JSON response with the result of the account creation.
        - Success response (status=200):
            - status: "success"
            - message: "Account added successfully"
        - Error response (status=400):
            - "Invalid JSON" if the request body is empty or invalid.
            - "Card already exists" if the account number is already registered.
            - "User not found" if the user UID does not exist.

    Exceptions:
    - Raises `Http404` if the `CustomUser` with the specified `userUID` is not found.

    """

    # Try to parse the JSON data from the request body
    data = json.loads(request.body)
    uid = request.GET.get('u')


    # Check if the 'userUID' is specified
    if not data:
        return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)


    # Check if the account number already exists
    if data['account_number'] and BankAccount.objects.filter(account_number=data['account_number']).exists():
        return JsonResponse({"status": "error", "message": "Card already exists"}, status=400)

    # Retrieve the user based on the user UID
    user = get_object_or_404(CustomUser, userUID=uid)
    
    # wrap the account data in a dictionary
    card_data = {
        'user': user,
        'account_type': data['account_type'],
        'account_number': data['account_number'],
        'account_name': data['account_name'],
        'is_default': data['is_default'],
        'transfer_rate': data['transfer_rate'],
    }

    # Add additional data based on the account type
    if data['account_type'] == 'mobile':
        card_data.update({
            'mobile_bank': data['mobile_bank'],
        })
    elif data['account_type'] == 'credit':
        card_data.update({
            'interest_rate': data['interest_rate'],
            'credit_limit': data['credit_limit'],
        })
    elif data['account_type'] == 'loan':
        card_data.update({
            'loan_amount': data['loan_amount'],
            'interest_rate': data['interest_rate'],
        })

    # Create the account based on the account type
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
    """
    Retrieves user data and returns it in a JWT (JSON Web Token) format.

    This view handles GET requests to fetch a user's information based on the provided
    `userUID` (passed as the query parameter 'u'). The retrieved user data is serialized
    and then encoded into a JWT using the HS256 algorithm.

    Query Parameters:
    - u (str): The user UID used to identify the user whose data is being requested.

    Returns:
    - JsonResponse: A JSON response containing the encoded user data in JWT format.
        - Success response (status=200):
            - status: "success"
            - data: Encoded JWT token containing the serialized user data.
        - Error response (status=400):
            - "User not specified" if the 'u' query parameter is missing.
        - Error response (status=404):
            - If the user with the specified UID is not found.

    Exceptions:
    - Raises `Http404` if the `CustomUser` with the specified `userUID` does not exist.
    """

    # Get the user UID from the query parameters
    uid = request.GET.get('u', None)

    # Check if the 'userUID' is specified
    if not uid:
        return JsonResponse({"status": "error", "message": "User not specified"}, status=400)

    # Retrieve the user based on the user UID
    user = get_object_or_404(CustomUser, userUID=uid)

    # Serialize and encode the user data into a JWT
    data = CustomUserSerializer(user).data
    encoded_data = jwt.encode(data, settings.SECRET_KEY, algorithm="HS256")

    return JsonResponse({"status": "success", "data": encoded_data}, status=200)


@require_http_methods(["GET"])
def GetUserBankAccounts(request):
    """
    Retrieves a user's bank accounts and related account information (e.g., credit cards, loan accounts).

    This view handles GET requests to fetch all bank accounts associated with a specific user, identified
    by the `userUID` (passed as the query parameter 'u'). The function checks whether the user has any
    accounts and returns serialized data for each account type (BankAccount, CreditCard, LoanAccount).

    Query Parameters:
    - u (str): The user UID used to identify the user whose bank accounts are being requested.

    Returns:
    - JsonResponse: A JSON response containing the user's bank accounts or related account data.
        - Success response (status=200):
            - status: "success"
            - data: A list of serialized data for each account (bank accounts, credit cards, or loan accounts).
        - Error response (status=400):
            - "User not specified" if the 'u' query parameter is missing.
            - "No accounts found" if the user does not have any bank accounts.

    Exceptions:
    - Raises `Http404` if the `CustomUser` with the specified `userUID` is not found.
    """

    # Get the user UID from the query parameters
    uid = request.GET.get('u', None)


    # Check if the 'userUID' is specified
    if not uid:
        return JsonResponse({"status": "error", "message": "User not specified"}, status=400)


    # Retrieve the user based on the user UID
    user = get_object_or_404(CustomUser, userUID=uid)

    # Retrieve all bank accounts associated with the user
    accounts = BankAccount.objects.filter(user=user).select_related('creditcard', 'loanaccount').order_by('-is_default', '-created_at')


    # Check if the user has any accounts
    if not accounts.exists():
        return JsonResponse({"status": "error", "message": "No accounts found", "data": []}, status=400)


    # Serialize the account data based on the account type
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
    """
    Deletes a user's bank account and related data (ExpenseIncome and Balance records).

    This view handles DELETE requests to delete a bank account associated with a specific user, identified
    by the `userUID` (passed as the query parameter 'u') and the account ID (passed as the query parameter 'q').
    All associated `ExpenseIncome` and `Balance` records related to the bank account are also deleted within
    a transaction to ensure data integrity.

    Query Parameters:
    - u (str): The user UID used to identify the user.
    - q (str): The bank account ID that should be deleted.

    Returns:
    - JsonResponse: A JSON response indicating the success or failure of the deletion process.
        - Success response (status=200):
            - status: "success"
            - message: "Account deleted successfully"
        - Error response (status=400):
            - "Account not specified" if the 'q' query parameter (account ID) is missing.
            - "User not specified" if the 'u' query parameter (user UID) is missing.
        - Error response (status=404):
            - If the user or the specified bank account does not exist.
        - Error response (status=500):
            - On any exception during the deletion process, the error message is returned.

    Exceptions:
    - Raises `Http404` if the user or the specified bank account is not found.
    - Returns a 500 error if any issue occurs during the transaction process.

    Notes:
    - The deletion process is wrapped in a database transaction (`transaction.atomic()`) to ensure
      all related records (e.g., `ExpenseIncome`, `Balance`) are deleted consistently.
    """

    # Get the account ID and user UID from the query parameters
    id = request.GET.get('q')
    uid = request.GET.get('u')

    # handle missing parameters
    if not id:
        return JsonResponse({"status": "error", "message": "Account not specified"}, status=400)
    if not uid:
        return JsonResponse({"status": "error", "message": "User not specified"}, status=400)
    

    # Retrieve the user and the bank account based on the user UID and account ID
    user = get_object_or_404(CustomUser, userUID=uid)
    account = get_object_or_404(BankAccount, id=id, user=user)


    # Delete the bank account and related data with ensuring all operations are done in a single transaction
    try:
        with transaction.atomic():
            ExpenseIncome.objects.filter(account=account).delete()

            Balance.objects.filter(account=account).delete()

            account.delete()

        return JsonResponse({"status": "success", "message": "Account deleted successfully"}, status=200)
    
    # Handle any exception during the deletion process
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
    


@require_http_methods(["POST"])
@csrf_exempt
def account_defaultation(request):
    """
    Sets a specified bank account as the default account for a user.

    This view handles POST requests to mark a bank account as the default account for a specific user.
    The account is identified by the account ID (`q`) and the user is identified by the `userUID` (`u`).
    If the account is already the default, an appropriate message is returned.

    Query Parameters:
    - q (str): The ID of the bank account to be set as the default.
    - u (str): The user UID used to identify the user.

    Returns:
    - JsonResponse: A JSON response indicating the success or failure of setting the default account.
        - Success response (status=200):
            - status: "success"
            - message: "Account set as default"
        - Error response (status=400):
            - "access denied" if either the account ID or user UID is missing.
            - "Account is already default" if the specified account is already set as default.

    Exceptions:
    - Raises `Http404` if the bank account with the specified ID does not exist for the given user.

    Notes:
    - The `is_default` attribute of the `BankAccount` model is used to mark the account as default.
    - The function first checks if the `is_default` flag is already set to `True`. If so, it returns an error indicating that the account is already the default. If not, it updates the flag and saves the account.
    """

    # Get the account ID and user UID from the query parameters
    id = request.GET.get('q')
    uid = request.GET.get('u')

    # handle missing parameters
    if not id or not uid:
        return JsonResponse({"status": "error", "message": "access denied"}, status=400)

    # Retrieve the user and the bank account based on the user UID and account ID
    account = get_object_or_404(BankAccount, id=id, user__userUID=uid)

    # Check if the account is already the default
    if account.is_default == True:
        return JsonResponse({"status": "error", "message": "Account is already default"}, status=400)
    else:
        account.is_default = True
        account.save()
        return JsonResponse({"status": "success", "message": "Account set as default"}, status=200)
    


@require_http_methods(["GET"])
def getBankAccountsDetails(request):
    """
    Retrieves detailed information about a specific bank account, including related expenses/incomes and balance.

    This view handles GET requests to fetch details of a bank account based on the account type (credit card, loan, or regular bank account).
    It also calculates and updates interest for credit cards and loans if applicable, and returns the account details along with associated expenses/incomes and balance.

    Query Parameters:
    - q (str): The ID of the bank account whose details are to be fetched.
    - u (str): The user UID used to identify the user associated with the account.
    - type (str): The type of the account. Expected values are 'credit', 'loan', or other (for regular bank accounts).

    Returns:
    - JsonResponse: A JSON response containing the account details, related expenses/incomes, and balance.
        - Success response (status=200):
            - status: "success"
            - data: A dictionary containing:
                - account: Details of the requested account, serialized according to its type.
                - expenses_incomes: A list of serialized `ExpenseIncome` records related to the account.
                - balance: The serialized balance associated with the account.
        - Error response (status=400):
            - "Sorry, access denied" if any of the required query parameters (ID, userUID, or type) are missing.

    Exceptions:
    - Raises `Http404` if the account with the specified ID and user UID does not exist for the given account type.

    Notes:
    - If the account type is 'credit', the function calculates daily interest based on the account's interest rate and updates the account and balance accordingly.
    - If the account type is 'loan', the function calculates daily interest on the remaining loan amount and updates the loan account accordingly.
    - If the account type is neither 'credit' nor 'loan', a regular bank account is assumed.
    """

    # Get the account ID, user UID, and account type from the query parameters
    id = request.GET.get('q')
    userUID = request.GET.get('u')
    type = request.GET.get('type')

    # handle missing parameters
    if not id or not userUID or not type:
        return JsonResponse({"status": "error", "message": "Sorry, access denied"}, status=400)
    
    # Retrieve the account based on the account ID and user UID
    account = None
    if type == 'credit':
        account = get_object_or_404(CreditCard, id=id, user__userUID=userUID)
    elif type == 'loan':
        account = get_object_or_404(LoanAccount, id=id, user__userUID=userUID)
    else:
        account = get_object_or_404(BankAccount, id=id, user__userUID=userUID)

    # Retrieve related expenses/incomes and balance for the account
    related_expenses_incomes = ExpenseIncome.objects.filter(account=account).order_by('-created_at')
    balance = None
    if type != 'loan':
        balance = Balance.objects.get(account=account)

    # Serialization
    account_data = BankAccountSerializer(account).data
    if type == 'credit':
        account_data = CreditCardSerializer(account).data
    elif type == 'loan':
        account_data = LoanAccountSerializer(account).data


    # Serialize the related expenses/incomes and balance data
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
    """
    Handles payments for credit cards and loans.
    """
    id = request.GET.get('q')
    userUID = request.GET.get('u')
    account_type = request.GET.get('type')
    data = json.loads(request.body or '{}')
    
    if not id or not userUID:
        return JsonResponse({"status": "error", "message": "Sorry, access denied"}, status=400)

    from_account = get_object_or_404(BankAccount, id=data.get('from_account'))
    from_account_balance = get_object_or_404(Balance, account=from_account)
    amount = Decimal(data.get('amount', 0))

    if from_account_balance.balance < amount:
        return JsonResponse({"status": "error", "message": "Insufficient funds in the account"}, status=400)
    if not amount:
        return JsonResponse({"status": "error", "message": "Amount not specified"}, status=400)

    account = get_account(account_type, id, userUID)
    if not account:
        return JsonResponse({"status": "error", "message": "Invalid account type or account not found"}, status=400)

    current_date = timezone.now().date()
    if current_date == account.created_at.date():
        return JsonResponse({"status": "error", "message": f"{account_type.capitalize()} payment is not allowed on the first day of account creation."}, status=400)

    if account.last_payment_date >= current_date:
        return JsonResponse({"status": "error", "message": f"{account_type.capitalize()} payment already made for today"}, status=400)

    try:
        with transaction.atomic():
            if account_type == 'credit':
                return handle_credit_payment(account, from_account, current_date, userUID, from_account_balance)
            elif account_type == 'loan':
                return handle_loan_payment(account, from_account, amount, current_date, userUID, from_account_balance)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


def get_account(account_type, id, userUID):
    """
    Helper to fetch the correct account based on type.
    """
    if account_type == 'credit':
        return get_object_or_404(CreditCard, id=id, user__userUID=userUID)
    elif account_type == 'loan':
        return get_object_or_404(LoanAccount, id=id, user__userUID=userUID)
    return None


def create_expense_income(user, account, from_account, amount, current_date, category, description):
    """
    Helper to create expense/income records.
    """
    ExpenseIncome.objects.bulk_create([
        ExpenseIncome(
            user=user,
            title=f'{category} Payment',
            amount=abs(amount),
            date=current_date,
            description=description,
            category=category,
            type=f'{category} Payment',
            account=account
        ),
        ExpenseIncome(
            user=user,
            title=f'{category} Payment to {account.account_name}',
            amount=abs(amount),
            date=current_date,
            description=description,
            category=category,
            type='Expense',
            account=from_account
        )
    ])


def handle_credit_payment(account, from_account, current_date, userUID, from_account_balance):
    """
    Handles credit card payments.
    """
    user = get_object_or_404(CustomUser, userUID=userUID)
    balance = get_object_or_404(Balance, account=account)
    
    description = f'Credit payment for card ending in {account.account_number[-4:]} from {user.first_name} {user.last_name} on {current_date}'
    create_expense_income(user, account, from_account, balance.balance, current_date, 'Credit', description)

    # Update balance and account
    from_account_balance.balance -= abs(balance.balance)
    from_account_balance.save()
    balance.balance = 0
    account.interest = 0
    account.last_payment_date = current_date
    balance.save()
    account.save()

    return JsonResponse({"status": "success", "message": "Payment successful"}, status=200)


def handle_loan_payment(account, from_account, amount, current_date, userUID, from_account_balance):
    """
    Handles loan payments.
    """
    user = get_object_or_404(CustomUser, userUID=userUID)
    extra_amount = max(0, amount - account.loan_remaining)

    description = f'Loan payment for account {account.account_name} from {user.first_name} {user.last_name} on {current_date}'
    create_expense_income(user, account, from_account, amount, current_date, 'Loan', description)

    # Update loan balance and account
    from_account_balance.balance -= abs(amount)
    from_account_balance.save()
    account.loan_remaining -= (amount - extra_amount)
    account.last_payment_date = current_date
    account.save()

    if extra_amount > 0:
        handle_extra_loan_amount(user, extra_amount, account)

    return JsonResponse({"status": "success", "message": "Payment successful"}, status=200)


def handle_extra_loan_amount(user, extra_amount, account):
    """
    Handles any extra loan payment amounts by creating a new account and transferring the excess.
    """
    new_account = BankAccount.objects.create(
        user=user,
        account_number=account.account_number,
        account_type='general',
        account_name='Bank Account',
    )
    Balance.objects.create(account=new_account, balance=extra_amount)
    
    account.is_active = False
    account.save()






@csrf_exempt
@require_http_methods(["POST"])
def AddExpenseIncome(request):
    """
    Adds an expense or income entry to the user's account and updates the account balance accordingly.

    This view processes POST requests to add either an expense or income entry for a specified bank account.
    It updates the account balance based on the transaction type (Expense or Income) and validates that
    the balance conditions are met before making any updates.

    Request Body:
    - A JSON object containing:
        - amount (float): The amount of the transaction. Must be positive.
        - userUID (str): The unique identifier of the user.
        - account_id (int): The ID of the bank account where the transaction will be recorded.
        - type (str): The type of the transaction. Expected values are 'Expense' or 'Income'.
        - title (str): The title or description of the transaction.
        - date (str): The date of the transaction in YYYY-MM-DD format.
        - description (str): A detailed description of the transaction.
        - category (str): The category of the transaction.

    Returns:
    - JsonResponse: A JSON response indicating the status of the request.
        - Success response (status=201):
            - status: "success"
            - message: A message indicating the transaction was added successfully, including the transaction ID.
            - data: The ID of the created transaction.
        - Error response (status=400):
            - "Invalid or missing amount" if the amount is missing or invalid.
            - "Invalid type value" if the type is not 'Expense' or 'Income'.
            - "Insufficient balance" if there is not enough balance to cover the expense.
            - "You can't pay more than your unused credit" if attempting to add income to a credit account with unused credit.
        - Error response (status=500):
            - "Invalid JSON format" if the request body is not valid JSON.
            - A generic error message for any other exceptions.

    Notes:
    - For expenses:
        - Ensures that the balance is not negative.
    - For income:
        - Ensures that the income amount does not exceed the available credit.
    """


    try:
        # Parse the JSON data from the request body
        data = json.loads(request.body)


        # Check if the amount is valid and positive
        if not data or 'amount' not in data or Decimal(data['amount']) <= 0:
            return JsonResponse({"status": "error", "message": "Invalid or missing amount."}, status=400)


        # Retrieve the user and account based on the user UID and account ID
        user = get_object_or_404(CustomUser, userUID=data['userUID'])
        account = get_object_or_404(BankAccount, id=data['account_id'])


        # Update nases
        with transaction.atomic():
            balance_record = get_object_or_404(Balance, account=account)

            
            if data['type'] == 'Expense':
                new_balance = balance_record.balance - Decimal(data['amount'])
            elif data['type'] == 'Income':
                new_balance = balance_record.balance + Decimal(data['amount'])
            else:
                return JsonResponse({"status": "error", "message": "Invalid type value"}, status=400)
            

            if account.account_type == 'credit':
                account = get_object_or_404(CreditCard, id=data['account_id'])
                

            if account.account_type != 'credit' and new_balance < 0 and data['type'] == 'Expense':
                return JsonResponse({"status": "error", "message": "Insufficient balance"}, status=400)
            
            if account.account_type == 'credit' and data['type'] == 'Expense' and abs(new_balance) > account.credit_limit:
                return JsonResponse({"status": "error", "message": "Insufficient credit"}, status=400)

            
            if account.account_type == 'credit' and new_balance > 0 and data['type'] == 'Income':
                return JsonResponse({"status": "error", "message": "You can't pay more than your unused credit"}, status=400)
            

            balance_record.balance = new_balance
            balance_record.save()


            # Create the expense or income entry
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

    # Handle any other exceptions
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


@require_http_methods(["GET"])
def GetAccountBalance(request):
    """
    Retrieves the balance information of a specified bank account.

    This view processes GET requests to fetch the current balance of a bank account identified by its ID.
    It returns the balance data in JSON format.1

    Query Parameters:
    - q (int): The ID of the bank account whose balance is to be retrieved.

    Returns:
    - JsonResponse: A JSON response indicating the status of the request and the balance data.
        - Success response (status=200):
            - status: "success"
            - data: The balance information serialized into JSON format.
        - Error response (status=400):
            - "Account not specified" if the account ID is missing from the query parameters.
            - "Not Found" (404 error) if the account with the specified ID does not exist.

    Notes:
    - Uses Django's `get_object_or_404` to ensure that the account exists and raises a 404 error if not found.
    - The balance information is serialized using `BalanceSerializer` to convert it into JSON format for the response.
    """

    # Get the data from the request body
    id = request.GET.get('q')
    if not id:
        return JsonResponse({"status": "error", "message": "Account not specified"}, status=400)
    
    # Retrieve and serialize the account and balance data
    account = get_object_or_404(BankAccount, id=id)
    balance = Balance.objects.get(account=account)
    balance_serializer = BalanceSerializer(balance).data
    return JsonResponse({"status": "success", "data": balance_serializer}, status=200)



@require_http_methods(["POST"])
@csrf_exempt
def BalanceTransfer(request):
    """
    Handles the transfer of balance between two bank accounts.

    This view processes POST requests to transfer a specified amount from one bank account to another
    for a given user. It updates the balances of both accounts and records the transaction in the `ExpenseIncome` model.

    Request Body:
    - A JSON object containing:
        - from_account_id (int): The ID of the account from which the balance will be transferred.
        - to_account_id (int): The ID of the account to which the balance will be transferred.
        - amount (float): The amount of money to transfer.
        - date (str): The date of the transaction.

    Query Parameters:
    - u (str): The user UID associated with both bank accounts.

    Returns:
    - JsonResponse: A JSON response indicating the status of the balance transfer.
        - Success response (status=200):
            - status: "success"
            - message: "Balance transferred successfully"
        - Error response (status=400):
            - "Invalid JSON" if the request body is not a valid JSON format.
            - "User not specified" if the user UID is missing from the query parameters.
            - "Cannot transfer from or to a credit account" if either of the accounts involved is a credit account.
            - "Invalid amount" if the amount is not a valid number or less than or equal to zero.
            - "Insufficient balance" if the source account does not have enough balance to cover the transfer.

    Notes:
    - Uses Django's `get_object_or_404` to ensure that both bank accounts exist and belong to the specified user.
    - Performs checks to ensure that the transfer does not involve credit accounts.
    - Updates account balances and records the transaction in the `ExpenseIncome` model with two entries: one for the expense and one for the income.
    - Uses `bulk_create` to efficiently create multiple `ExpenseIncome` records in a single database transaction.
    """

    # Parse the JSON data from the request body
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)

    uid = request.GET.get('u')
    if not uid:
        return JsonResponse({"status": "error", "message": "User not specified"}, status=400)

    # Retrieve the bank accounts and balances
    from_account_id = data.get('from_account_id')
    to_account_id = data.get('to_account_id')
    amount_str = data.get('amount')
    transfer_fee_str = data.get('transfer_fee', '0')  # Default fee to 0 if not provided
    transaction_date = data.get('date')

    if not all([from_account_id, to_account_id, amount_str, transaction_date]):
        return JsonResponse({"status": "error", "message": "Missing parameters"}, status=400)

    try:
        amount = Decimal(amount_str)
        transfer_fee = Decimal(transfer_fee_str)
    except (InvalidOperation, TypeError):
        return JsonResponse({"status": "error", "message": "Invalid amount"}, status=400)

    if amount <= 0 or transfer_fee < 0:
        return JsonResponse({"status": "error", "message": "Invalid amount or transfer fee"}, status=400)

    # Get the bank accounts and balances
    from_account = get_object_or_404(BankAccount, id=from_account_id, user__userUID=uid)
    to_account = get_object_or_404(BankAccount, id=to_account_id, user__userUID=uid)

    from_balance = get_object_or_404(Balance, account=from_account)
    to_balance = get_object_or_404(Balance, account=to_account)

    # Check account types and balances
    if from_account.account_type == 'loan' or to_account.account_type == 'loan':
        return JsonResponse({"status": "error", "message": "Cannot transfer from or to a loan account"}, status=400)

    if from_account.account_type == 'credit':
        from_account = get_object_or_404(CreditCard, id=from_account_id, user__userUID=uid)
        print(from_account.credit_limit)
        print(from_account.credit_limit - abs(from_balance.balance))
        print(amount + transfer_fee)
        print(from_account.credit_limit < amount + transfer_fee)
        if (from_account.credit_limit - abs(from_balance.balance)) < (amount + transfer_fee):
            return JsonResponse({"status": "error", "message": "Insufficient credit"}, status=400)
    else:
        if from_balance.balance < amount + transfer_fee:
            return JsonResponse({"status": "error", "message": "Insufficient balance"}, status=400)

    # Perform the balance transfer
    from_balance.balance -= (amount + transfer_fee)
    from_balance.save()

    to_balance.balance += amount
    to_balance.save()

    # Record the transaction
    ExpenseIncome.objects.bulk_create([
        ExpenseIncome(
            user=from_account.user,
            title="Balance Transferred",
            amount=amount + transfer_fee,
            date=transaction_date,
            description=f"Balance transferred to {to_account.account_name}",
            category="Transfer",
            type="Expense",
            account=from_account
        ),
        ExpenseIncome(
            user=to_account.user,
            title="Balance Received",
            amount=amount,
            date=transaction_date,
            description=f"Balance received from {from_account.account_name}",
            category="Receive",
            type="Income",
            account=to_account
        )
    ])

    return JsonResponse({"status": "success", "message": "Balance transferred successfully"}, status=200)