# Generated by Django 2.2.13 on 2021-05-10 18:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0079_auto_20210510_1636'),
    ]

    operations = [
        migrations.AddField(
            model_name='drive',
            name='custom_question_example',
            field=models.TextField(blank=True, default='', max_length=255),
        ),
    ]
