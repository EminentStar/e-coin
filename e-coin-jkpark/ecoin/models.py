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
