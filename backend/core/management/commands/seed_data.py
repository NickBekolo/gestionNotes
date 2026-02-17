from django.core.management.base import BaseCommand
from core.models import Department, User, Student
from django.utils import timezone


class Command(BaseCommand):
    help = 'Crée les données initiales'
    
    def handle(self, *args, **options):
        # Créer les départements
        departments = [
            {'name': 'Informatique', 'code': 'INFO', 'description': 'Département d\'Informatique'},
            {'name': 'Génie Civil', 'code': 'GC', 'description': 'Département de Génie Civil'},
            {'name': 'Électrotechnique', 'code': 'ELEC', 'description': 'Département d\'Électrotechnique'},
            {'name': 'Mécanique', 'code': 'MECH', 'description': 'Département de Mécanique'},
        ]
        
        for dept_data in departments:
            dept, created = Department.objects.get_or_create(
                code=dept_data['code'],
                defaults={'name': dept_data['name'], 'description': dept_data['description']}
            )
            if created:
                self.stdout.write(f"✓ Département créé: {dept.name}")
            else:
                self.stdout.write(f"- Département existant: {dept.name}")
        
        # Créer l'administrateur par défaut
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@example.com',
                password='admin123',
                role='admin',
                first_name='Admin',
                last_name='System'
            )
            self.stdout.write("✓ Admin créé (admin/admin123)")
        
        # Créer les utilisateurs de test
        users_data = [
            {
                'username': 'point_focal1',
                'email': 'pf1@example.com',
                'password': 'pf123',
                'role': 'point_focal',
                'first_name': 'Jean',
                'last_name': 'Point Focal',
                'dept_code': 'INFO'
            },
            {
                'username': 'agent1',
                'email': 'agent1@example.com',
                'password': 'agent123',
                'role': 'agent',
                'first_name': 'Marie',
                'last_name': 'Agent',
                'dept_code': 'INFO'
            },
            {
                'username': 'vice_doyen',
                'email': 'vd@example.com',
                'password': 'vd123',
                'role': 'vice_doyen',
                'first_name': 'Paul',
                'last_name': 'Vice-Doyen',
                'dept_code': 'INFO'
            },
        ]
        
        for user_data in users_data:
            dept_code = user_data.pop('dept_code')
            dept = Department.objects.get(code=dept_code)
            
            if not User.objects.filter(username=user_data['username']).exists():
                User.objects.create_user(
                    department=dept,
                    **user_data
                )
                self.stdout.write(f"✓ Utilisateur créé: {user_data['username']}")
            else:
                self.stdout.write(f"- Utilisateur existant: {user_data['username']}")
        
        # Créer des étudiants de test
        students_data = [
            {'matricule': 'ELEV001', 'full_name': 'Nkouondjou Alain', 'email': 'alain@example.com', 
             'dept_code': 'INFO', 'is_solvable': True},
            {'matricule': 'ELEV002', 'full_name': 'Kamdem Sophie', 'email': 'sophie@example.com', 
             'dept_code': 'INFO', 'is_solvable': True},
            {'matricule': 'ELEV003', 'full_name': 'Nkoulam Jean', 'email': 'jean@example.com', 
             'dept_code': 'GC', 'is_solvable': False},
            {'matricule': 'ELEV004', 'full_name': 'Biya Marc', 'email': 'marc@example.com', 
             'dept_code': 'ELEC', 'is_solvable': True},
        ]
        
        for student_data in students_data:
            dept_code = student_data.pop('dept_code')
            dept = Department.objects.get(code=dept_code)
            
            if not Student.objects.filter(matricule=student_data['matricule']).exists():
                Student.objects.create(
                    department=dept,
                    **student_data
                )
                self.stdout.write(f"✓ Étudiant créé: {student_data['matricule']} - {student_data['full_name']}")
            else:
                self.stdout.write(f"- Étudiant existant: {student_data['matricule']}")
        
        self.stdout.write(self.style.SUCCESS('\n✓ Données initiales créées avec succès!'))
