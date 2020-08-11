# Generated by Django 2.2.13 on 2020-08-11 16:32

import django.contrib.gis.db.models.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0050_merge_20200803_1853"),
    ]

    operations = [
        migrations.CreateModel(
            name="BlockGroup",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("census_id", models.IntegerField()),
                ("year", models.IntegerField(default=2010)),
                (
                    "geometry",
                    django.contrib.gis.db.models.fields.PolygonField(
                        blank=True, geography=True, null=True, srid=4326
                    ),
                ),
            ],
        ),
        migrations.AddField(
            model_name="communityentry",
            name="block_groups",
            field=models.ManyToManyField(to="main.BlockGroup"),
        ),
    ]