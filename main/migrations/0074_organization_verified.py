# Generated by Django 2.2.13 on 2021-02-25 18:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0073_merge_20210104_0517'),
    ]

    operations = [
        migrations.AddField(
            model_name='organization',
            name='verified',
            field=models.BooleanField(default=False),
        ),
    ]