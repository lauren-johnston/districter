# Generated by Django 2.2.4 on 2020-04-24 06:48

import django.contrib.postgres.fields
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0009_auto_20200423_2013"),
    ]

    operations = [
        migrations.AddField(
            model_name="organization",
            name="states",
            field=django.contrib.postgres.fields.ArrayField(
                base_field=models.CharField(
                    blank=True,
                    choices=[
                        ("AL", "Alabama"),
                        ("AZ", "Arizona"),
                        ("AR", "Arkansas"),
                        ("CA", "California"),
                        ("CO", "Colorado"),
                        ("CT", "Connecticut"),
                        ("DE", "Delaware"),
                        ("DC", "District of Columbia"),
                        ("FL", "Florida"),
                        ("GA", "Georgia"),
                        ("ID", "Idaho"),
                        ("IL", "Illinois"),
                        ("IN", "Indiana"),
                        ("IA", "Iowa"),
                        ("KS", "Kansas"),
                        ("KY", "Kentucky"),
                        ("LA", "Louisiana"),
                        ("ME", "Maine"),
                        ("MD", "Maryland"),
                        ("MA", "Massachusetts"),
                        ("MI", "Michigan"),
                        ("MN", "Minnesota"),
                        ("MS", "Mississippi"),
                        ("MO", "Missouri"),
                        ("MT", "Montana"),
                        ("NE", "Nebraska"),
                        ("NV", "Nevada"),
                        ("NH", "New Hampshire"),
                        ("NJ", "New Jersey"),
                        ("NM", "New Mexico"),
                        ("NY", "New York"),
                        ("NC", "North Carolina"),
                        ("ND", "North Dakota"),
                        ("OH", "Ohio"),
                        ("OK", "Oklahoma"),
                        ("OR", "Oregon"),
                        ("PA", "Pennsylvania"),
                        ("RI", "Rhode Island"),
                        ("SC", "South Carolina"),
                        ("SD", "South Dakota"),
                        ("TN", "Tennessee"),
                        ("TX", "Texas"),
                        ("UT", "Utah"),
                        ("VT", "Vermont"),
                        ("VA", "Virginia"),
                        ("WA", "Washington"),
                        ("WV", "West Virginia"),
                        ("WI", "Wisconsin"),
                        ("WY", "Wyoming"),
                        ("AK", "Alaska"),
                        ("HI", "Hawaii"),
                    ],
                    max_length=50,
                ),
                default=["nj"],
                size=None,
            ),
            preserve_default=False,
        ),
        migrations.CreateModel(
            name="Campaign",
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
                ("name", models.CharField(max_length=128)),
                ("description", models.CharField(blank=True, max_length=250)),
                (
                    "state",
                    models.CharField(
                        choices=[
                            ("AL", "Alabama"),
                            ("AZ", "Arizona"),
                            ("AR", "Arkansas"),
                            ("CA", "California"),
                            ("CO", "Colorado"),
                            ("CT", "Connecticut"),
                            ("DE", "Delaware"),
                            ("DC", "District of Columbia"),
                            ("FL", "Florida"),
                            ("GA", "Georgia"),
                            ("ID", "Idaho"),
                            ("IL", "Illinois"),
                            ("IN", "Indiana"),
                            ("IA", "Iowa"),
                            ("KS", "Kansas"),
                            ("KY", "Kentucky"),
                            ("LA", "Louisiana"),
                            ("ME", "Maine"),
                            ("MD", "Maryland"),
                            ("MA", "Massachusetts"),
                            ("MI", "Michigan"),
                            ("MN", "Minnesota"),
                            ("MS", "Mississippi"),
                            ("MO", "Missouri"),
                            ("MT", "Montana"),
                            ("NE", "Nebraska"),
                            ("NV", "Nevada"),
                            ("NH", "New Hampshire"),
                            ("NJ", "New Jersey"),
                            ("NM", "New Mexico"),
                            ("NY", "New York"),
                            ("NC", "North Carolina"),
                            ("ND", "North Dakota"),
                            ("OH", "Ohio"),
                            ("OK", "Oklahoma"),
                            ("OR", "Oregon"),
                            ("PA", "Pennsylvania"),
                            ("RI", "Rhode Island"),
                            ("SC", "South Carolina"),
                            ("SD", "South Dakota"),
                            ("TN", "Tennessee"),
                            ("TX", "Texas"),
                            ("UT", "Utah"),
                            ("VT", "Vermont"),
                            ("VA", "Virginia"),
                            ("WA", "Washington"),
                            ("WV", "West Virginia"),
                            ("WI", "Wisconsin"),
                            ("WY", "Wyoming"),
                            ("AK", "Alaska"),
                            ("HI", "Hawaii"),
                        ],
                        default=None,
                        max_length=50,
                    ),
                ),
                ("start_date", models.DateField(auto_now_add=True)),
                ("end_date", models.DateField(blank=True)),
                (
                    "organization",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="main.Organization",
                    ),
                ),
            ],
            options={
                "ordering": ("description",),
            },
        ),
    ]
