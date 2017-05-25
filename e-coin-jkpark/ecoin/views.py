from django.shortcuts import render, redirect, render_to_response
from django.http import JsonResponse, HttpResponseRedirect
from django.views.decorators.http import require_http_methods, require_GET, require_POST
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.template import RequestContext
from django.contrib import messages

from .forms import UserCreationForm, LoginForm


@require_GET
def index(request):
    if request.user.is_authenticated():
        return redirect('main')
    else:
        rendered_values = {}
        return render(request, 'ecoin/index.html', rendered_values)

def signup(request):
    if request.method == 'GET':
        user_creation_form = UserCreationForm()
        rendered_values = {'form': user_creation_form}
        return render(request, 'ecoin/registration/signup.html', rendered_values)
    elif request.method == 'POST':
        form = UserCreationForm(request.POST)

        if form.is_valid():
            form.save() # save user info
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            email = form.cleaned_data.get('email')
            print("username: %s, raw_password: %s, email: %s" % (username, raw_password, email))
        
        return redirect('index')

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

@login_required(login_url='/login/')
def logout_user(request):
    logout(request)
    rendered_values = {}
    return redirect('index')

@login_required(login_url='/login/')
def main(request):
    rendered_values = {}
    return render(request, 'ecoin/main_view.html', rendered_values)

@login_required(login_url='/login/')
def charge(request):
    rendered_values = {}
    return render(request, 'ecoin/charge.html', rendered_values)

@login_required(login_url='/login/')
def go_shopping(request):
    rendered_values = {}
    return render(request, 'ecoin/shopping.html', rendered_values)

@login_required(login_url='/login/')
def refund(request):
    rendered_values = {}
    return render(request, 'ecoin/refund.html', rendered_values)

@login_required(login_url='/login/')
def remit(request):
    rendered_values = {}
    return render(request, 'ecoin/remittance.html', rendered_values)
