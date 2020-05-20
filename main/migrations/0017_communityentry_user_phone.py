# Generated by Django 2.2.6 on 2020-05-17 19:27

from django.db import migrations
import phonenumber_field.modelfields


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0016_communityentry_user_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='communityentry',
            name='user_phone',
            field=phonenumber_field.modelfields.PhoneNumberField(default='', max_length=128, region=None),
        ),
    ]