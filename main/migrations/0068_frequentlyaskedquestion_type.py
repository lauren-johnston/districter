# Generated by Django 2.2.13 on 2020-12-29 21:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0067_frequentlyaskedquestion_glossarydefinition"),
    ]

    operations = [
        migrations.AddField(
            model_name="frequentlyaskedquestion",
            name="type",
            field=models.CharField(
                choices=[("USER", "User"), ("ORGANIZATION", "Organization")],
                default="USER",
                max_length=12,
            ),
        ),
    ]
