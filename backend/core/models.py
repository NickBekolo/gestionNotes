from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

# Choices
ROLE_CHOICES = [
    ('admin', 'Administrateur'),
    ('adjoint_admin', 'Adjoint Admin'),
    ('point_focal', 'Point Focal'),
    ('agent', 'Agent / Secrétariat'),
    ('vice_doyen', 'Vice-doyen'),
    ('student', 'Étudiant'),
]

STATUS_CHOICES = [
    ('pending', 'En attente'),
    ('validated', 'Validée'),
    ('rejected', 'Rejetée'),
]

PAYMENT_STATUS_CHOICES = [
    ('paid', 'Payé'),
    ('unpaid', 'Non payé'),
    ('partial', 'Partiellement payé'),
]

ACTION_TYPE_CHOICES = [
    ('create', 'Création'),
    ('update', 'Modification'),
    ('delete', 'Suppression'),
    ('validate', 'Validation'),
    ('reject', 'Rejet'),
    ('import', 'Import'),
    ('export', 'Export'),
    ('login', 'Connexion'),
]


class Department(models.Model):
    """Département ou Filière"""
    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'core_department'
        verbose_name = 'Département'
        verbose_name_plural = 'Départements'

    def __str__(self):
        return self.name


class User(AbstractUser):
    """Modèle utilisateur personnalisé"""
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'core_user'
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"

    @property
    def is_admin(self):
        return self.role == 'admin'

    @property
    def is_point_focal(self):
        return self.role == 'point_focal'

    @property
    def is_agent(self):
        return self.role == 'agent'

    @property
    def is_vice_doyen(self):
        return self.role == 'vice_doyen'

    @property
    def is_student_user(self):
        return self.role == 'student'


class Student(models.Model):
    """Modèle Étudiant"""
    matricule = models.CharField(max_length=50, unique=True)
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='students')
    is_solvable = models.BooleanField(default=False, help_text="L'étudiant a payé ses frais")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'core_student'
        verbose_name = 'Étudiant'
        verbose_name_plural = 'Étudiants'
        ordering = ['matricule']

    def __str__(self):
        return f"{self.full_name} ({self.matricule})"


class Note(models.Model):
    """Modèle Note"""
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='notes')
    point_focal = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                                    limit_choices_to={'role': 'point_focal'},
                                    related_name='imported_notes')
    subject = models.CharField(max_length=255)
    value = models.DecimalField(max_digits=5, decimal_places=2)
    period = models.CharField(max_length=50)  # "Semestre 1", "CC1", etc.
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Validation
    validated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                    limit_choices_to={'role__in': ['admin', 'vice_doyen', 'agent']},
                                    related_name='validated_notes')
    validation_date = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'core_note'
        verbose_name = 'Note'
        verbose_name_plural = 'Notes'
        unique_together = ('student', 'subject', 'period')
        indexes = [
            models.Index(fields=['student', 'period']),
            models.Index(fields=['status']),
            models.Index(fields=['point_focal']),
        ]

    def __str__(self):
        return f"{self.student.full_name} - {self.subject}: {self.value}"

    def can_display(self):
        """Retourne True si la note peut être affichée (étudiant solvable + note validée)"""
        return self.student.is_solvable and self.status == 'validated'


class PV(models.Model):
    """Procès-verbal / Validation"""
    note = models.OneToOneField(Note, on_delete=models.CASCADE, related_name='pv')
    pv_number = models.CharField(max_length=50, unique=True)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='unpaid')
    
    # Visa du Vice-doyen
    visa_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                               limit_choices_to={'role': 'vice_doyen'},
                               related_name='visaed_pvs')
    visa_date = models.DateTimeField(null=True, blank=True)
    
    # Impression
    printed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                  limit_choices_to={'role': 'agent'},
                                  related_name='printed_pvs')
    printed_date = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'core_pv'
        verbose_name = 'PV'
        verbose_name_plural = 'PVs'
        ordering = ['-created_at']

    def __str__(self):
        return f"PV {self.pv_number} - {self.note.student.full_name}"


class AuditLog(models.Model):
    """Journal d'audit - Traçabilité complète"""
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action_type = models.CharField(max_length=20, choices=ACTION_TYPE_CHOICES)
    model_name = models.CharField(max_length=50)  # e.g., "Note", "User", "Student"
    object_id = models.CharField(max_length=50)
    object_repr = models.CharField(max_length=255, blank=True)
    
    # Avant et après
    details_before = models.JSONField(null=True, blank=True)
    details_after = models.JSONField(null=True, blank=True)
    
    # IP et informations de session
    ip_address = models.CharField(max_length=45, blank=True)
    user_agent = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'core_auditlog'
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['action_type', '-created_at']),
            models.Index(fields=['model_name', 'object_id']),
        ]

    def __str__(self):
        return f"{self.user} - {self.action_type} - {self.model_name}"
