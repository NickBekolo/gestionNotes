"""
Script de démarrage pour créer les données initiales
"""
from core.models import Department, User


def run():
    """Crée les départements et utilisateurs initiaux"""
    
    # Créer les départements
    departments = [
        {'name': 'Informatique', 'code': 'INFO'},
        {'name': 'Génie Civil', 'code': 'GC'},
        {'name': 'Électrotechnique', 'code': 'ELEC'},
        {'name': 'Mécanique', 'code': 'MECH'},
    ]
    
    for dept in departments:
        Department.objects.get_or_create(code=dept['code'], defaults={'name': dept['name']})
    
    print("Départements créés")
    
    # Créer l'administrateur par défaut
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123',
            role='admin'
        )
        print("Admin créé")
    
    # Créer un point focal de test
    if not User.objects.filter(username='point_focal').exists():
        dept = Department.objects.first()
        User.objects.create_user(
            username='point_focal',
            email='pf@example.com',
            password='pf123',
            role='point_focal',
            department=dept
        )
        print("Point focal créé")
    
    print("Données initiales créées avec succès!")
