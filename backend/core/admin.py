from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Department, Student, Note, PV, AuditLog


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'created_at')
    search_fields = ('name', 'code')
    list_filter = ('created_at',)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'department', 'is_active')
    list_filter = ('role', 'is_active', 'created_at')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Informations personnalisées', {'fields': ('role', 'department')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Informations personnalisées', {'fields': ('role', 'department')}),
    )


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('matricule', 'full_name', 'department', 'is_solvable', 'created_at')
    list_filter = ('department', 'is_solvable', 'created_at')
    search_fields = ('matricule', 'full_name', 'email')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('student', 'subject', 'value', 'period', 'status', 'point_focal')
    list_filter = ('status', 'period', 'created_at')
    search_fields = ('student__full_name', 'subject')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Informations principales', {
            'fields': ('student', 'subject', 'value', 'period', 'point_focal')
        }),
        ('Validation', {
            'fields': ('status', 'validated_by', 'validation_date', 'rejection_reason')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(PV)
class PVAdmin(admin.ModelAdmin):
    list_display = ('pv_number', 'note', 'payment_status', 'visa_date', 'printed_date')
    list_filter = ('payment_status', 'created_at', 'visa_date')
    search_fields = ('pv_number', 'note__student__full_name')
    readonly_fields = ('created_at', 'updated_at', 'pv_number')


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action_type', 'model_name', 'created_at')
    list_filter = ('action_type', 'model_name', 'created_at')
    search_fields = ('user__username', 'object_repr')
    readonly_fields = ('created_at', 'details_before', 'details_after')
    
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
