# Generated by Django 2.2.13 on 2020-07-03 19:57

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0043_auto_20200703_1953"),
    ]

    operations = [
        migrations.RenameField(
            model_name="communityentry",
            old_name="campaign",
            new_name="drive",
        ),
        migrations.RenameField(
            model_name="drivetoken",
            old_name="campaign",
            new_name="drive",
        ),
    ]
