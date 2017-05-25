from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.http import require_GET
from django.views.decorators.http import require_POST

# Create your views here.

@require_GET
def index(request):
    return JsonResponse({'version': 'v1'}, status=200)
