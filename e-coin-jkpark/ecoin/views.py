from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.http import require_GET
from django.views.decorators.http import require_POST
from .forms import UserCreationForm
from django.contrib.auth import login, authenticate


@require_GET
def index(request):
    rendered_values = {'test_val': 'For Test'}
    return render(request, 'ecoin/main_view.html', rendered_values)

def signup(request):
    if request.method == 'GET':
        user_creation_form = UserCreationForm()
        rendered_values = {'form': user_creation_form}
        return render(request, 'ecoin/registration/signup.html', rendered_values)
    elif request.method == 'POST':
        form = UserCreationForm(request.POST)

        if form.is_valid():
            # form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            email = form.cleaned_data.get('email')
            # user = authenticate(username=username, password=raw_password)
            print("username: %s, raw_password: %s, email: %s" % (username, raw_password, email))
        
        return redirect('index')

