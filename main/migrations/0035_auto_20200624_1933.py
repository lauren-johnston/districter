# Generated by Django 2.2.13 on 2020-06-24 19:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0034_auto_20200624_1554"),
    ]

    operations = [
        migrations.RenameField(
            model_name="state",
            old_name="content",
            new_name="content1",
        ),
        migrations.AddField(
            model_name="state",
            name="content2",
            field=models.CharField(default="", max_length=500),
        ),
    ]
