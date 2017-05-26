from django.db import models
from django.contrib.auth.models import User


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
    """This model has the information about each purchase of users."""
    username = models.CharField(max_length=150, null=False)
    product_name = models.CharField(max_length=255, null=False)
    product_count = models.IntegerField(default=0)
    ecoin_price = models.IntegerField(default=0)

