# Generated by Django 2.2.13 on 2020-06-24 19:41

import ckeditor.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0035_auto_20200624_1933"),
    ]

    operations = [
        migrations.AlterField(
            model_name="state",
            name="content2",
            field=ckeditor.fields.RichTextField(),
        ),
    ]