# Generated by Django 2.2.13 on 2020-12-23 07:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0065_auto_20201202_0159"),
    ]

    operations = [
        migrations.AlterField(
            model_name="drive",
            name="slug",
            field=models.SlugField(max_length=255, null=True, unique=True),
        ),
    ]
