from django.conf.urls import url
from . import views
from django.contrib.auth.views import login
from ecoin.forms import LoginForm


urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'signup$', views.signup, name='signup'),
    url(r'login/$', views.login_user, name='login_user'),
    url(r'logout/$', views.logout_user, name='logout_user'),
    url(r'main/$', views.main, name='main'),
    #url(r'login/$', 'django.contrib.auth.views.login', {'authentication_form': LoginForm}, name='login_url'),
]
