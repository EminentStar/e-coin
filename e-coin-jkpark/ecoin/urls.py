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
    url(r'recharge_money/$', views.recharge_money, name='recharge_money'),
    url(r'exchange_ecoin/$', views.exchange_ecoin, name='exchange_ecoin'),
    url(r'go_shopping/$', views.go_shopping, name='go_shopping'),
    url(r'refund/$', views.refund, name='refund'),
    url(r'remit/$', views.remit, name='remit'),
]
