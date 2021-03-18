# Generated by Django 2.2.13 on 2020-07-21 07:31

import django.contrib.gis.db.models.fields
import django.contrib.postgres.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0046_auto_20200721_0540"),
    ]

    operations = [
        migrations.AlterField(
            model_name="communityentry",
            name="census_blocks_polygon_array",
            field=django.contrib.postgres.fields.ArrayField(
                base_field=django.contrib.gis.db.models.fields.PolygonField(
                    blank=True, geography=True, null=True, srid=4326
                ),
                null=True,
                size=None,
            ),
        ),
    ]
