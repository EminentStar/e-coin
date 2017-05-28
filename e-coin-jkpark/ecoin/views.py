from django.shortcuts import render, redirect, render_to_response
from django.http import JsonResponse, HttpResponseRedirect
from django.views.decorators.http import require_http_methods, require_GET, require_POST
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.template import RequestContext
from django.contrib import messages
from django.db import transaction

from .forms import UserCreationForm, LoginForm, RechargeRealMoneyForm, \
        ExchangeEcoinForm, RemitForm, RefundForm, SearchProductForm
from .models import User, CoinAccount
from .scraper import scrap_searched_page


LOGIN_URI_PATH = '/login/'

@require_GET
def index(request):
    if request.user.is_authenticated():
        return redirect('main')
    else:
        rendered_values = {}
        return render(request, 'ecoin/index.html', rendered_values)

@require_http_methods(["GET", "POST"]) 
def signup(request):
    if request.method == 'GET':
        user_creation_form = UserCreationForm()
        rendered_values = {'form': user_creation_form}
        return render(request, 'ecoin/registration/signup.html', rendered_values)
    elif request.method == 'POST':
        form = UserCreationForm(request.POST)

        if form.is_valid():
            # form.save() # save user info
            username = form.cleaned_data.get('username')
            try:
                create_user_in_atomic_transaction(form, username)
            except IntegrityError as e:
                print(e)
                messages.add_message(request, messages.ERROR, 'Fail to Signup!')
        
        return redirect('index')

@require_http_methods(["GET", "POST"])
def login_user(request):
    if request.method == 'GET':
        form = LoginForm() 
        return render(request, 'ecoin/registration/login.html', {'login_form': form})
    elif request.method == 'POST':
        form = LoginForm(request.POST)

        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)

            if user is not None:
                if user.is_active:
                    login(request, user)
                    return HttpResponseRedirect('/main/')
            else:
                messages.add_message(request, messages.INFO, 'Incorrect info!')

        return redirect('index')

@login_required(login_url=LOGIN_URI_PATH)
def logout_user(request):
    logout(request)
    rendered_values = {}
    return redirect('index')

@login_required(login_url=LOGIN_URI_PATH)
def main(request):
    coin_account = CoinAccount.get_account(request.user)

    rendered_values = {'coin_account': coin_account, 'username': request.user}
    return render(request, 'ecoin/main_view.html', rendered_values)

@login_required(login_url=LOGIN_URI_PATH)
def recharge_money(request):
    coin_account = CoinAccount.get_account(request.user)

    rendered_values = {'coin_account': coin_account, 'username': request.user}
    if request.method == 'GET':
        recharge_real_money_form = RechargeRealMoneyForm()
        exchange_ecoin_form = ExchangeEcoinForm()

        rendered_values['money_form'] = recharge_real_money_form
        rendered_values['ecoin_form'] = exchange_ecoin_form

        return render(request, 'ecoin/charge.html', rendered_values)
    elif request.method == 'POST':
        recharge_real_money_form = RechargeRealMoneyForm(request.POST)
        if recharge_real_money_form.is_valid():
            real_money = recharge_real_money_form.cleaned_data.get('real_money')
            recharge_real_money_form.save(request.user)
        else:
            print('Not valid!')

        return redirect('recharge_money')


@login_required(login_url=LOGIN_URI_PATH)
def exchange_ecoin(request):
    coin_account = CoinAccount.get_account(request.user)

    rendered_values = {'coin_account': coin_account, 'username': request.user}
    if request.method == 'GET':
        recharge_real_money_form = RechargeRealMoneyForm()
        exchange_ecoin_form = ExchangeEcoinForm()

        rendered_values['money_form'] = recharge_real_money_form
        rendered_values['ecoin_form'] = exchange_ecoin_form

        return render(request, 'ecoin/charge.html', rendered_values)
    elif request.method == 'POST':
        exchange_ecoin_form = ExchangeEcoinForm(request.POST)

        if exchange_ecoin_form.is_valid():
            real_money_to_exchange = exchange_ecoin_form.cleaned_data.get('real_money')
            if exchange_ecoin_form.save(request.user) == False:
                """ a user does not have enough money in CoinAccount than money he or she inserted """
                messages.add_message(request, messages.ERROR, 'Fail to Exchange ecoin!')
        else:
            print('Not valid!')

        return redirect('exchange_ecoin')


@login_required(login_url=LOGIN_URI_PATH)
def go_shopping(request):
    coin_account = CoinAccount.get_account(request.user)

    rendered_values = {'coin_account': coin_account, 'username': request.user}
    if request.method == 'GET':
        search_product_form = SearchProductForm()
        rendered_values['search_product_form'] = search_product_form

        return render(request, 'ecoin/shopping.html', rendered_values)
    elif request.method == 'POST':
        search_product_form = SearchProductForm(request.POST)
        if search_product_form.is_valid():
            query = search_product_form.cleaned_data.get('query')
            products = scrap_searched_page(query)
            
            rendered_values['search_product_form'] = search_product_form
            rendered_values['products'] = products
            return render(request, 'ecoin/product_list.html', rendered_values)


@login_required(login_url=LOGIN_URI_PATH)
@require_POST
def buy_product(request):
    coin_account = CoinAccount.get_account(request.user)

    rendered_values = {'coin_account': coin_account, 'username': request.user}
    ecoin_price = int(request.POST['ecoin_price'])
    
    purchasement_status = buy_product_process(coin_account, ecoin_price)

    if purchasement_status.get('status') == False:
        messages.add_message(request, messages.WARNING, 
                purchasement_status.get('msg'))

    return redirect('go_shopping')

@login_required(login_url=LOGIN_URI_PATH)
def refund(request):
    coin_account = CoinAccount.get_account(request.user)

    rendered_values = {'coin_account': coin_account, 'username': request.user}
    if request.method == 'GET':
        refund_form = RefundForm()
        rendered_values['refund_form'] = refund_form

        return render(request, 'ecoin/refund.html', rendered_values)
    elif request.method == 'POST':
        refund_form = RefundForm(request.POST)

        if refund_form.is_valid():
            validation_status = refund_form.validate_ecoin(request.user.username)
            if validation_status.get('status'):
                refund_form.save(request.user.username)
            else:
                messages.add_message(request, messages.ERROR, 
                        validation_status.get('msg'))

            return redirect('refund')


@login_required(login_url=LOGIN_URI_PATH)
def remit(request):
    coin_account = CoinAccount.get_account(request.user)

    rendered_values = {'coin_account': coin_account, 'username': request.user}
    if request.method == 'GET':
        remit_form = RemitForm()
        rendered_values['remit_form'] = remit_form
        
        return render(request, 'ecoin/remittance.html', rendered_values)
    elif request.method == 'POST':
        remit_form = RemitForm(request.POST)

        if remit_form.is_valid():
            receiver = remit_form.cleaned_data.get('receiver')
            ecoin_cnt = remit_form.cleaned_data.get('ecoin_cnt')
           
            validation_status = remit_form.validate_user(request.user.username)
            if validation_status.get('status'):
                commit_status = remit_form.save(request.user.username)
                """ If this transaction conflicted to others, 
                    the transaction was failed. """
                if commit_status is False:
                    messages.add_message(request, messages.ERROR, 
                        'An Error occured while the remittance!')
            else:
                messages.add_message(request, messages.ERROR, 
                    validation_status.get('msg'))

        return redirect('remit')

def create_user_in_atomic_transaction(user, username):
    """This function saves User and CoinAccount object in atomic transaction."""
    try:
        with transaction.atomic():
            user.save()
            user = User.objects.get(username=username)
            coin_account = CoinAccount(username=user)
            coin_account.save()
    except IntegrityError as e:
        raise e

def buy_product_process(coin_account, ecoin_price):
    """This function proceed payment for the product."""
    returned_dict = {'status': True, 'msg': 'Success'}

    if coin_account.ecoin >= ecoin_price:
        coin_account.ecoin -= ecoin_price
        coin_account.save()
    else:
        returned_dict['status'] = False
        returned_dict['msg'] = 'Not enough money'
    
    return returned_dict

