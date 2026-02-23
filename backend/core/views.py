from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.utils import timezone

from .models import User, Department, Student, Note, PV, AuditLog
from .serializers import (UserSerializer, UserCreateSerializer, DepartmentSerializer, 
                         StudentSerializer, NoteSerializer, PVSerializer, AuditLogSerializer)
from .permissions import (IsAdmin, IsAdminOrAdjointAdmin, IsPointFocal, IsValidationPerson, 
                         IsAgent, IsViceDoyen)
from .utils import log_audit, serialize_model_instance, generate_pv_number, get_client_ip


class DepartmentViewSet(viewsets.ModelViewSet):
    """CRUD pour les départements"""
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrAdjointAdmin()]
        return [IsAuthenticated()]
    
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        if response.status_code == 201:
            log_audit(
                user=request.user,
                action_type='create',
                model_name='Department',
                object_id=response.data['id'],
                object_repr=response.data['name'],
                details_after=response.data,
                request=request
            )
        return response
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        before = serialize_model_instance(instance)
        response = super().update(request, *args, **kwargs)
        
        log_audit(
            user=request.user,
            action_type='update',
            model_name='Department',
            object_id=instance.id,
            object_repr=str(instance),
            details_before=before,
            details_after=response.data,
            request=request
        )
        return response


class UserViewSet(viewsets.ModelViewSet):
    """CRUD pour les utilisateurs"""
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    filterset_fields = ['role', 'department', 'is_active']
    ordering_fields = ['username', 'created_at']
    ordering = ['username']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrAdjointAdmin()]
        elif self.action == 'retrieve':
            return [IsAuthenticated()]
        return [IsAdminOrAdjointAdmin()]
    
    def get_queryset(self):
        if self.request.user.role == 'student':
            return User.objects.filter(id=self.request.user.id)
        return User.objects.all()
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Récupère l'utilisateur actuel"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAdminOrAdjointAdmin()])
    def deactivate_user(self, request):
        """Désactive un utilisateur"""
        user_id = request.data.get('user_id')
        try:
            user = User.objects.get(id=user_id)
            user.is_active = False
            user.save()
            
            log_audit(
                user=request.user,
                action_type='update',
                model_name='User',
                object_id=user.id,
                object_repr=str(user),
                details_after={'is_active': False},
                request=request
            )
            return Response({'status': 'User deactivated'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAdmin()])
    def activate_user(self, request):
        """Active un utilisateur (Admin seulement)"""
        user_id = request.data.get('user_id')
        try:
            user = User.objects.get(id=user_id)
            user.is_active = True
            user.save()
            
            log_audit(
                user=request.user,
                action_type='update',
                model_name='User',
                object_id=user.id,
                object_repr=str(user),
                details_after={'is_active': True},
                request=request
            )
            return Response({'status': 'User activated'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAdmin()])
    def delegate_privileges(self, request):
        """Délègue temporairement les privilèges à un adjoint (traçabilité obligatoire)"""
        adjoint_id = request.data.get('adjoint_id')
        reason = request.data.get('reason', '')
        duration_days = request.data.get('duration_days', 7)
        
        try:
            adjoint = User.objects.get(id=adjoint_id)
            if adjoint.role != 'adjoint_admin':
                return Response(
                    {'error': 'Seul un adjoint_admin peut recevoir une délégation'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Stocker la délégation dans les métadonnées
            delegation_info = {
                'delegated_by': request.user.id,
                'delegated_by_username': request.user.username,
                'delegated_at': timezone.now().isoformat(),
                'reason': reason,
                'duration_days': duration_days,
            }
            
            adjoint.delegation_info = delegation_info
            adjoint.save()
            
            log_audit(
                user=request.user,
                action_type='delegation',
                model_name='User',
                object_id=adjoint.id,
                object_repr=f'Delegation to {adjoint.username}',
                details_after=delegation_info,
                request=request
            )
            return Response({'status': 'Privileges delegated', 'delegation_info': delegation_info})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'], permission_classes=[IsAdmin()])
    def revoke_delegation(self, request):
        """Retire une délégation temporaire avant l'expiration"""
        adjoint_id = request.data.get('adjoint_id')
        
        try:
            adjoint = User.objects.get(id=adjoint_id)
            if not adjoint.delegation_info:
                return Response(
                    {'error': 'Cet utilisateur n\'a pas de délégation active'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Récupérer les infos avant la suppression pour l'audit
            delegation_info_before = adjoint.delegation_info.copy()
            
            # Retirer la délégation
            adjoint.delegation_info = None
            adjoint.save()
            
            log_audit(
                user=request.user,
                action_type='revoke_delegation',
                model_name='User',
                object_id=adjoint.id,
                object_repr=f'Revoked delegation from {adjoint.username}',
                details_before=delegation_info_before,
                request=request
            )
            return Response({'status': 'Delegation revoked'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


class StudentViewSet(viewsets.ModelViewSet):
    """CRUD pour les étudiants"""
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['matricule', 'full_name', 'email']
    filterset_fields = ['department', 'is_solvable']
    ordering_fields = ['matricule', 'created_at']
    ordering = ['matricule']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrAdjointAdmin()]
        return [IsAuthenticated()]
    
    @action(detail=False, methods=['post'], permission_classes=[IsAdminOrAdjointAdmin()])
    def set_solvability(self, request):
        """Définit la solvabilité d'un étudiant"""
        student_id = request.data.get('student_id')
        is_solvable = request.data.get('is_solvable')
        
        try:
            student = Student.objects.get(id=student_id)
            before = serialize_model_instance(student)
            student.is_solvable = is_solvable
            student.save()
            
            log_audit(
                user=request.user,
                action_type='update',
                model_name='Student',
                object_id=student.id,
                object_repr=str(student),
                details_before=before,
                details_after=serialize_model_instance(student),
                request=request
            )
            
            serializer = StudentSerializer(student)
            return Response(serializer.data)
        except Student.DoesNotExist:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)


class NoteViewSet(viewsets.ModelViewSet):
    """CRUD pour les notes"""
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['student__full_name', 'subject']
    filterset_fields = ['student', 'period', 'status', 'point_focal']
    ordering_fields = ['-created_at', 'status']
    ordering = ['-created_at']
    
    def get_permissions(self):
        # Permissions are decided dynamically to allow OR semantics between roles
        if self.action in ['create', 'update', 'partial_update']:
            # Allow either point focal or admin/adjonint admin
            if hasattr(self, 'request') and getattr(self.request, 'user', None):
                if self.request.user.role == 'point_focal':
                    return [IsPointFocal()]
            return [IsAdminOrAdjointAdmin()]
        elif self.action in ['validate_note', 'reject_note']:
            return [IsValidationPerson()]
        elif self.action == 'list':
            return [IsAuthenticated()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        # Les étudiants ne voient que leurs notes validées et s'ils sont solvables
        if self.request.user.role == 'student':
            # Students are a separate model; match by email to link User->Student for display
            return Note.objects.filter(
                Q(student__email=self.request.user.email) & 
                Q(status='validated') & 
                Q(student__is_solvable=True)
            )
        return Note.objects.all()
    
    def create(self, request, *args, **kwargs):
        # Vérifier que seul un point focal peut créer des notes
        response = super().create(request, *args, **kwargs)
        
        if response.status_code == 201:
            log_audit(
                user=request.user,
                action_type='import',
                model_name='Note',
                object_id=response.data['id'],
                object_repr=f"{response.data['student_detail']['full_name']} - {response.data['subject']}",
                details_after=response.data,
                request=request
            )
        return response
    
    @action(detail=True, methods=['post'], permission_classes=[IsValidationPerson])
    def validate_note(self, request, pk=None):
        """Valide une note"""
        note = self.get_object()
        before = serialize_model_instance(note)
        
        note.status = 'validated'
        note.validated_by = request.user
        note.validation_date = timezone.now()
        note.save()
        
        # Créer automatiquement le PV
        if not hasattr(note, 'pv'):
            pv_number = generate_pv_number(note)
            PV.objects.create(note=note, pv_number=pv_number)
        
        log_audit(
            user=request.user,
            action_type='validate',
            model_name='Note',
            object_id=note.id,
            object_repr=str(note),
            details_before=before,
            details_after=serialize_model_instance(note),
            request=request
        )
        
        serializer = NoteSerializer(note)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsValidationPerson])
    def reject_note(self, request, pk=None):
        """Rejette une note"""
        note = self.get_object()
        before = serialize_model_instance(note)
        
        note.status = 'rejected'
        note.rejection_reason = request.data.get('reason', '')
        note.save()
        
        log_audit(
            user=request.user,
            action_type='reject',
            model_name='Note',
            object_id=note.id,
            object_repr=str(note),
            details_before=before,
            details_after=serialize_model_instance(note),
            request=request
        )
        
        serializer = NoteSerializer(note)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin()])
    def final_validation(self, request, pk=None):
        """Validation finale de la note par l'administrateur"""
        note = self.get_object()
        before = serialize_model_instance(note)
        
        if note.status != 'validated':
            return Response(
                {'error': 'La note doit être validée avant la validation finale'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        note.status = 'final_validated'
        note.final_validated_by = request.user
        note.final_validation_date = timezone.now()
        note.save()
        
        log_audit(
            user=request.user,
            action_type='final_validation',
            model_name='Note',
            object_id=note.id,
            object_repr=str(note),
            details_before=before,
            details_after=serialize_model_instance(note),
            request=request
        )
        
        serializer = NoteSerializer(note)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def pending_notes(self, request):
        """Récupère les notes en attente"""
        notes = Note.objects.filter(status='pending')
        serializer = NoteSerializer(notes, many=True)
        return Response(serializer.data)


class PVViewSet(viewsets.ModelViewSet):
    """CRUD pour les PVs"""
    queryset = PV.objects.all()
    serializer_class = PVSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['pv_number', 'note__student__full_name']
    filterset_fields = ['payment_status']
    ordering_fields = ['-created_at']
    ordering = ['-created_at']
    
    def get_permissions(self):
        # Dynamic permissions for PV actions: use runtime role checks inside actions
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAdminOrAdjointAdmin()]
        return [IsAuthenticated()]
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def visa_pv(self, request, pk=None):
        """Vise un PV (Vice-doyen)"""
        # Only vice_doyen, admin or adjoint_admin may visa
        if request.user.role not in ['vice_doyen', 'admin', 'adjoint_admin']:
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        pv = self.get_object()
        pv.visa_by = request.user
        pv.visa_date = timezone.now()
        pv.save()
        
        log_audit(
            user=request.user,
            action_type='update',
            model_name='PV',
            object_id=pv.id,
            object_repr=str(pv),
            details_after={'visa_by': str(request.user), 'visa_date': str(pv.visa_date)},
            request=request
        )
        
        serializer = PVSerializer(pv)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def print_pv(self, request, pk=None):
        """Marque un PV comme imprimé"""
        # Only agent or admin/adjonint_admin may mark as printed
        if request.user.role not in ['agent', 'admin', 'adjoint_admin']:
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        pv = self.get_object()
        pv.printed_by = request.user
        pv.printed_date = timezone.now()
        pv.save()
        
        log_audit(
            user=request.user,
            action_type='export',
            model_name='PV',
            object_id=pv.id,
            object_repr=str(pv),
            details_after={'printed_by': str(request.user), 'printed_date': str(pv.printed_date)},
            request=request
        )
        
        serializer = PVSerializer(pv)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrAdjointAdmin])
    def set_payment_status(self, request, pk=None):
        """Définit le statut de paiement"""
        pv = self.get_object()
        status_value = request.data.get('status')
        
        if status_value not in ['paid', 'unpaid', 'partial']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        before = serialize_model_instance(pv)
        pv.payment_status = status_value
        pv.save()
        
        log_audit(
            user=request.user,
            action_type='update',
            model_name='PV',
            object_id=pv.id,
            object_repr=str(pv),
            details_before=before,
            details_after=serialize_model_instance(pv),
            request=request
        )
        
        serializer = PVSerializer(pv)
        return Response(serializer.data)


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Lecture seule pour les logs d'audit"""
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminOrAdjointAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['user__username', 'object_repr', 'model_name']
    filterset_fields = ['action_type', 'model_name', 'user']
    ordering_fields = ['-created_at']
    ordering = ['-created_at']
