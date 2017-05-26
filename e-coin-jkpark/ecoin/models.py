from django.db import models
from django.contrib.auth.models import User

from datetime import datetime


# Create your models here.
class CoinAccount(models.Model):
    """This model has users' coin and money amount."""
    real_money = models.IntegerField(default=0)
    ecoin = models.IntegerField(default=0)
    username = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
    )


class Purchase(models.Model):
    """This model has the information about each product purchase of users."""
    username = models.CharField(max_length=150, null=False)
    product_name = models.CharField(max_length=255, null=False)
    product_count = models.IntegerField(default=0)
    ecoin_price = models.IntegerField(default=0)
    purchased_time = models.DateTimeField(default=datetime.now(), null=False)


class MoneyRechargement(models.Model):
    """This model has the information about each money rechargement of users."""
    username = models.CharField(max_length=150, null=False)
    recharged_money = models.IntegerField(default=0) 
    recharged_time = models.DateTimeField(default=datetime.now(), null=False)


class CoinRechargement(models.Model):
    """This model has the information about each ecoin rechargement of users."""
    username = models.CharField(max_length=150, null=False)
    used_money = models.IntegerField(default=0)
    recharged_ecoin = models.IntegerField(default=0)
    recharged_time = models.DateTimeField(default=datetime.now(), null=False)
    
