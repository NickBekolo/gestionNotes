from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Permet l'accès uniquement aux administrateurs"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class IsPointFocal(permissions.BasePermission):
    """Permet l'accès aux points focaux"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'point_focal'


class IsAgent(permissions.BasePermission):
    """Permet l'accès aux agents"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'agent'


class IsViceDoyen(permissions.BasePermission):
    """Permet l'accès au vice-doyen"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'vice_doyen'


class IsStudent(permissions.BasePermission):
    """Permet l'accès aux étudiants"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'student'


class IsAdminOrAdjointAdmin(permissions.BasePermission):
    """Admin ou Adjoint admin"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and \
               request.user.role in ['admin', 'adjoint_admin']


class IsValidationPerson(permissions.BasePermission):
    """Peut valider les notes : Admin, Vice-doyen, Agent"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and \
               request.user.role in ['admin', 'vice_doyen', 'agent', 'adjoint_admin']
