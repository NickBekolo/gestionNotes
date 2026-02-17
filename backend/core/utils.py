from .models import AuditLog
import json
from django.core.serializers.json import DjangoJSONEncoder


def get_client_ip(request):
    """Récupère l'adresse IP du client"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def log_audit(user, action_type, model_name, object_id, object_repr='', 
              details_before=None, details_after=None, request=None):
    """
    Enregistre une action dans le journal d'audit
    
    Args:
        user: Utilisateur qui effectue l'action
        action_type: Type d'action (create, update, delete, validate, etc.)
        model_name: Nom du modèle (Note, Student, etc.)
        object_id: ID de l'objet affecté
        object_repr: Représentation textuelle de l'objet
        details_before: État avant (dict)
        details_after: État après (dict)
        request: Objet request pour IP et user agent
    """
    ip_address = ''
    user_agent = ''
    
    if request:
        ip_address = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
    
    AuditLog.objects.create(
        user=user,
        action_type=action_type,
        model_name=model_name,
        object_id=str(object_id),
        object_repr=object_repr,
        details_before=details_before,
        details_after=details_after,
        ip_address=ip_address,
        user_agent=user_agent
    )


def serialize_model_instance(instance):
    """Sérialise une instance de modèle en dict pour audit"""
    data = {}
    for field in instance._meta.fields:
        value = getattr(instance, field.name)
        if hasattr(value, 'isoformat'):
            value = value.isoformat()
        data[field.name] = value
    return data


def generate_pv_number(note):
    """Génère un numéro de PV unique"""
    from datetime import datetime
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    return f"PV-{note.student.matricule}-{timestamp}"
