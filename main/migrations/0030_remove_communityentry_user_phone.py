# Generated by Django 2.2.10 on 2020-06-06 13:21

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0029_auto_20200526_0556"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="communityentry",
            name="user_phone",
        ),
    ]
