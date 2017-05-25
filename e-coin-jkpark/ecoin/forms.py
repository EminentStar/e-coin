from django.forms import EmailField
from django.utils.translation import ugettext_lazy
from django.utils.translation import gettext as _
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django import forms
from django.db import transaction

from .models import CoinAccount


ONE_ECOIN_PRICE=100


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
    username = forms.CharField(max_length=150)
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


class ExchangeEcoinForm(forms.ModelForm):
    class Meta:
        model = CoinAccount
        fields = ("real_money",)

    def save(self, username, commit=True):
        user = User.objects.get(username=username)
        coin_account = CoinAccount.objects.get(username=user)
        exchanged_real_money = self.cleaned_data["real_money"]

        if self.check_enough_money_in_coin_account(coin_account):
            """
            if a user has enough money than money he inserted
            """
            ecoin_cnt = int(exchanged_real_money / ONE_ECOIN_PRICE)
            coin_account.real_money -= ONE_ECOIN_PRICE * ecoin_cnt
            coin_account.ecoin += ecoin_cnt

            if commit:
                coin_account.save()

            return True
        else:
            return False

    def check_enough_money_in_coin_account(self, coin_account):
        """ This function compare CoinAccount's real money to money typed."""
        return coin_account.real_money >= self.cleaned_data["real_money"]


class RemitForm(forms.Form):
    receiver = forms.CharField(max_length=150)
    ecoin_cnt = forms.IntegerField()

    def save(self, username, commit=True):
        user = User.objects.get(username=username)
        coin_account = CoinAccount.objects.get(username=user)

        receiver_name = self.cleaned_data["receiver"]
        ecoin_sent = self.cleaned_data["ecoin_cnt"]

        received_user = User.objects.get(username=receiver_name)
        receiver_coin_account = CoinAccount.objects.get(username=received_user)
        coin_account.ecoin -= ecoin_sent
        receiver_coin_account.ecoin += ecoin_sent

        try:
            with transaction.atomic():
                coin_account.save()
                receiver_coin_account.save()
        except IntegrityError as e:
            print(e)
            return False
        else:
            return True

    def validate_user(self, current_username):
        returned_dict = {'status': True, 'msg': 'Success'}

        user = User.objects.get(username=current_username)
        coin_account = CoinAccount.objects.get(username=user)
        
        if current_username == self.cleaned_data['receiver']:
            returned_dict['status'] = False
            returned_dict['msg'] = 'You cannot remit ecoin to yourself'
        elif self.check_enough_ecoin_in_coin_account(coin_account) == False:
            returned_dict['status'] = False
            returned_dict['msg'] = 'You cannot exceed your limit!'
        elif self.exists_user() == False:
            returned_dict['status'] = False
            returned_dict['msg'] = 'The user Not Found!'
        
        return returned_dict
            
    def exists_user(self):
        user_cnt = User.objects.filter(username=self.cleaned_data['receiver']).count()
        
        if user_cnt != 0:
            return True
        else:
            return False

    def check_enough_ecoin_in_coin_account(self, coin_account):
        """ This function compare CoinAccount's ecoin to ecoin typed."""
        return coin_account.ecoin >= self.cleaned_data["ecoin_cnt"]


class RefundForm(forms.Form):
    ecoin_cnt = forms.IntegerField()

    def save(self, username, commit=True):
        user = User.objects.get(username=username)
        coin_account = CoinAccount.objects.get(username=user)
        ecoin_sent = self.cleaned_data["ecoin_cnt"]

        coin_account.ecoin -= ecoin_sent
        coin_account.real_money += ecoin_sent * ONE_ECOIN_PRICE

        coin_account.save()

    def validate_ecoin(self, current_username):
        returned_dict = {'status': True, 'msg': 'Success'}

        user = User.objects.get(username=current_username)
        coin_account = CoinAccount.objects.get(username=user)
        
        ecoin_cnt = self.cleaned_data["ecoin_cnt"]
         
        if ecoin_cnt <= 0:
            returned_dict['status'] = False
            returned_dict['msg'] = 'Please input a correct number!'
        elif coin_account.ecoin < ecoin_cnt:
            returned_dict['status'] = False
            returned_dict['msg'] = 'You cannot exceed your limit!'

        return returned_dict

