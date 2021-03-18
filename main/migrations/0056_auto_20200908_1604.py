# Generated by Django 2.2.13 on 2020-09-08 16:04

import django.contrib.gis.db.models.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0055_auto_20200907_2034"),
    ]

    operations = [
        migrations.AlterField(
            model_name="communityentry",
            name="census_blocks_polygon",
            field=django.contrib.gis.db.models.fields.GeometryField(
                blank=True, geography=True, null=True, srid=4326
            ),
        ),
    ]
