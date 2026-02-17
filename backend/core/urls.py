from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (DepartmentViewSet, UserViewSet, StudentViewSet, NoteViewSet, 
                    PVViewSet, AuditLogViewSet)

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'users', UserViewSet, basename='user')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'notes', NoteViewSet, basename='note')
router.register(r'pvs', PVViewSet, basename='pv')
router.register(r'audit-logs', AuditLogViewSet, basename='auditlog')

urlpatterns = [
    path('', include(router.urls)),
]
