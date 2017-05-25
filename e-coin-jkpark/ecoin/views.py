from django.shortcuts import render, redirect, render_to_response
from django.http import JsonResponse, HttpResponseRedirect
from django.views.decorators.http import require_http_methods, require_GET, require_POST
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.template import RequestContext
from django.contrib import messages
from django.db import transaction

from .forms import UserCreationForm, LoginForm, RechargeRealMoneyForm, ExchangeEcoinForm, RemitForm
from .models import User, CoinAccount


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
        return render(request, 'ecoin/registration/login.html', {})
    elif request.method == 'POST':
        form = LoginForm(request.POST)
        print('in POST')
        username = request.POST['username']
        password = request.POST['password']

        print("username: %s, password: %s" % (username, password))
        user = authenticate(username=username, password=password)

        if user is not None:
            print('Correct Password')
            if user.is_active:
                login(request, user)
                return HttpResponseRedirect('/main/')
        else:
            print('Incorrect')
            messages.add_message(request, messages.INFO, 'Incorrect info!')
            return redirect('index')

@login_required(login_url=LOGIN_URI_PATH)
def logout_user(request):
    logout(request)
    rendered_values = {}
    return redirect('index')

@login_required(login_url=LOGIN_URI_PATH)
def main(request):
    current_user = User.objects.get(username=request.user)
    coin_account = CoinAccount.objects.get(username=current_user)

    rendered_values = {'coin_account': coin_account, 'username': request.user}
    return render(request, 'ecoin/main_view.html', rendered_values)

@login_required(login_url=LOGIN_URI_PATH)
def recharge_money(request):
    current_user = User.objects.get(username=request.user)
    coin_account = CoinAccount.objects.get(username=current_user)

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
    current_user = User.objects.get(username=request.user)
    coin_account = CoinAccount.objects.get(username=current_user)

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
    rendered_values = {}
    return render(request, 'ecoin/shopping.html', rendered_values)

@login_required(login_url=LOGIN_URI_PATH)
def refund(request):
    rendered_values = {}
    return render(request, 'ecoin/refund.html', rendered_values)

@login_required(login_url=LOGIN_URI_PATH)
def remit(request):
    current_user = User.objects.get(username=request.user)
    coin_account = CoinAccount.objects.get(username=current_user)

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
                remit_form.save(request.user.username)
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
        
