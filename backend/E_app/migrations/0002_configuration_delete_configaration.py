# Generated by Django 5.2 on 2025-06-25 04:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('E_app', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Configuration',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('key', models.CharField(max_length=100, unique=True)),
                ('value', models.DecimalField(decimal_places=2, max_digits=10)),
            ],
        ),
        migrations.DeleteModel(
            name='Configaration',
        ),
    ]
