from django.contrib.auth import get_user_model; User=get_user_model(); u=User.objects.filter(username='admin').first();
if not u:
    User.objects.create_superuser('admin','admin@example.com','admin123')
    print('Superuser created')
else:
    print('Superuser exists')
