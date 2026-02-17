from rest_framework import serializers
from .models import User, Department, Student, Note, PV, AuditLog


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'description', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    department_detail = DepartmentSerializer(source='department', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 
                 'department', 'department_detail', 'is_active', 'created_at']
        read_only_fields = ['created_at']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'role', 'department', 'password']
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class StudentSerializer(serializers.ModelSerializer):
    department_detail = DepartmentSerializer(source='department', read_only=True)
    
    class Meta:
        model = Student
        fields = ['id', 'matricule', 'full_name', 'email', 'phone', 'department', 
                 'department_detail', 'is_solvable', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class NoteSerializer(serializers.ModelSerializer):
    student_detail = StudentSerializer(source='student', read_only=True)
    point_focal_detail = UserSerializer(source='point_focal', read_only=True)
    validated_by_detail = UserSerializer(source='validated_by', read_only=True)
    can_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Note
        fields = ['id', 'student', 'student_detail', 'point_focal', 'point_focal_detail',
                 'subject', 'value', 'period', 'status', 'validated_by', 'validated_by_detail',
                 'validation_date', 'rejection_reason', 'can_display', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'validation_date']
    
    def get_can_display(self, obj):
        return obj.can_display()


class PVSerializer(serializers.ModelSerializer):
    note_detail = NoteSerializer(source='note', read_only=True)
    visa_by_detail = UserSerializer(source='visa_by', read_only=True)
    printed_by_detail = UserSerializer(source='printed_by', read_only=True)
    
    class Meta:
        model = PV
        fields = ['id', 'note', 'note_detail', 'pv_number', 'payment_status',
                 'visa_by', 'visa_by_detail', 'visa_date', 'printed_by', 
                 'printed_by_detail', 'printed_date', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'pv_number', 'visa_date', 'printed_date']


class AuditLogSerializer(serializers.ModelSerializer):
    user_detail = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = ['id', 'user', 'user_detail', 'action_type', 'model_name', 'object_id',
                 'object_repr', 'details_before', 'details_after', 'ip_address', 'created_at']
        read_only_fields = ['created_at']
