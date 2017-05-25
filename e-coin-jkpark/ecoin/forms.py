from django.forms import EmailField
from django.utils.translation import ugettext_lazy
from django.utils.translation import gettext as _
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django import forms

from .models import CoinAccount


class UserCreationForm(UserCreationForm):
    email = EmailField(label=_("Email address"), required=True,
        help_text=_("Required."))

    class Meta:
        model = User
        fields = ("username", "email", "password1", "password2")

    def save(self, commit=True):
        user = super(UserCreationForm, self).save(commit=False)
        user.email = self.cleaned_data["email"]
        if commit:
            user.save()
        return user


class LoginForm(AuthenticationForm):
    username = forms.CharField(max_length=254)
    password = forms.CharField(label=_("Password"), widget=forms.PasswordInput)


class RechargeRealMoneyForm(forms.ModelForm):
    class Meta:
        model = CoinAccount
        fields = ("real_money",)

    def save(self, username, commit=True):
        user = User.objects.get(username=username)
        coin_account = CoinAccount.objects.get(username=user)
        coin_account.real_money += self.cleaned_data["real_money"]

        if commit:
            coin_account.save()

        return coin_account
