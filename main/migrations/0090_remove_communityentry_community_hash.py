# Generated by Django 2.2.20 on 2021-06-29 22:43

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0089_auto_20210629_2238'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='communityentry',
            name='community_hash',
        ),
    ]
