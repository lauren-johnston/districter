# Generated by Django 2.2.13 on 2021-03-12 01:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0073_merge_20210104_0517'),
    ]

    operations = [
        migrations.CreateModel(
            name='CensusBlock',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('census_id', models.CharField(max_length=15)),
                ('year', models.IntegerField(default=2020)),
            ],
        ),
    ]
