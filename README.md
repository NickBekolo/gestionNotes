# Système de Gestion des Notes - Documentation Complète

## 🎯 Objectif du Projet

Créer un système sécurisé pour la collecte, validation et publication des notes des étudiants avec traçabilité complète et contrôle hiérarchique.

## 📋 Table des matières

- [Structure du Projet](#structure-du-projet)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [API Endpoints](#api-endpoints)
- [Sécurité](#sécurité)
- [Déploiement](#déploiement)

## 📁 Structure du Projet

```
gestion-notes/
├── backend/                  # Django REST API
│   ├── config/              # Configuration Django
│   ├── core/                # Application principale
│   │   ├── models.py        # Modèles de données
│   │   ├── serializers.py   # Sérialiseurs DRF
│   │   ├── views.py         # ViewSets API
│   │   ├── permissions.py   # Permissions RBAC
│   │   └── utils.py         # Utilitaires (audit, etc.)
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/                # React Application
│   ├── src/
│   │   ├── components/      # Composants réutilisables
│   │   ├── pages/           # Pages principales
│   │   ├── services/        # Services API
│   │   ├── context/         # Context API (Auth)
│   │   └── App.js
│   ├── public/
│   └── package.json
│
└── docker-compose.yml       # Orchestration des services
```

## 🚀 Installation

### Prérequis

- Python 3.10+
- Node.js 16+
- PostgreSQL 12+
- Docker & Docker Compose (optionnel)

### Backend (Django)

```bash
# 1. Cloner le projet
cd gestion-notes/backend

# 2. Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate

# 3. Installer les dépendances
pip install -r requirements.txt

# 4. Créer un fichier .env
cp .env.example .env

# 5. Appliquer les migrations
python manage.py migrate

# 6. Créer les données initiales
python manage.py seed_data

# 7. Créer un superuser (optionnel)
python manage.py createsuperuser

# 8. Lancer le serveur
python manage.py runserver
```

### Frontend (React)

```bash
# 1. Naviguer au dossier frontend
cd gestion-notes/frontend

# 2. Installer les dépendances
npm install

# 3. Créer un fichier .env
cp .env.example .env

# 4. Lancer l'application
npm start
```

## ⚙️ Configuration

### Backend - Fichier .env

```env
DEBUG=True
SECRET_KEY=your-secret-key-here-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000

# PostgreSQL
DB_ENGINE=django.db.backends.postgresql
DB_NAME=gestion_notes
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
```

### Frontend - Fichier .env

```env
REACT_APP_API_URL=http://localhost:8000/api
```

## 👥 Rôles et Permissions

| Rôle | Accès | Actions |
|------|-------|---------|
| **Admin** | Complet | CRUD utilisateurs, validation finale, audit |
| **Adjoint Admin** | Administratif | Suivi notes, audit complet |
| **Point Focal** | Limité | Import notes, validation préliminaire |
| **Agent** | Limité | Impression PV, corrections mineures |
| **Vice-Doyen** | Modéré | Visa PV, validation hiérarchique |
| **Étudiant** | Consultation | Voir ses notes (si solvable) |

## 🔑 Utilisateurs de Test

```
Admin
- Username: admin
- Password: admin123

Point Focal
- Username: point_focal1
- Password: pf123

Agent
- Username: agent1
- Password: agent123

Vice-Doyen
- Username: vice_doyen
- Password: vd123
```

## 📊 Modèles de Données

### User (Utilisateur)
- Héritage de AbstractUser
- Champs: role, department, is_active
- Lié à Department (FK)

### Department
- name, code, description
- Lié à Student, User

### Student (Étudiant)
- matricule, full_name, email, phone
- is_solvable (paiement)
- Lié à Department

### Note
- student (FK), point_focal (FK), subject, value, period
- status (pending, validated, rejected)
- validated_by, validation_date, rejection_reason
- Unique constraint: (student, subject, period)

### PV (Procès-verbal)
- note (OneToOne), pv_number, payment_status
- visa_by, visa_date, printed_by, printed_date

### AuditLog
- user, action_type, model_name, object_id
- details_before, details_after
- ip_address, user_agent, created_at

## 🔌 API Endpoints

### Authentication
```
POST /api/token/              - Obtenir le token JWT
POST /api/token/refresh/      - Rafraîchir le token
GET  /api/users/me/           - Utilisateur courant
```

### Departments
```
GET    /api/departments/      - Lister tous
GET    /api/departments/{id}/ - Détails
POST   /api/departments/      - Créer (Admin)
PATCH  /api/departments/{id}/ - Modifier (Admin)
DELETE /api/departments/{id}/ - Supprimer (Admin)
```

### Students
```
GET    /api/students/         - Lister tous
GET    /api/students/{id}/    - Détails
POST   /api/students/         - Créer (Admin)
PATCH  /api/students/{id}/    - Modifier (Admin)
DELETE /api/students/{id}/    - Supprimer (Admin)
POST   /api/students/set_solvability/ - Définir solvabilité
```

### Notes
```
GET    /api/notes/            - Lister (selon rôle)
GET    /api/notes/{id}/       - Détails
POST   /api/notes/            - Créer (Point Focal)
PATCH  /api/notes/{id}/       - Modifier (Point Focal)
DELETE /api/notes/{id}/       - Supprimer (Admin)
POST   /api/notes/{id}/validate_note/ - Valider (Validation Staff)
POST   /api/notes/{id}/reject_note/   - Rejeter
GET    /api/notes/pending_notes/      - En attente
```

### PVs
```
GET    /api/pvs/              - Lister tous
GET    /api/pvs/{id}/         - Détails
POST   /api/pvs/{id}/visa_pv/          - Visa (Vice-Doyen)
POST   /api/pvs/{id}/print_pv/         - Imprimer (Agent)
POST   /api/pvs/{id}/set_payment_status/ - Paiement
```

### Audit Logs
```
GET    /api/audit-logs/       - Lister (Admin)
GET    /api/audit-logs/{id}/  - Détails
```

## 🔒 Sécurité

### Implémentations
- **JWT Authentication** - Tokens sécurisés
- **RBAC** - Role-Based Access Control
- **CSRF Protection** - Django CSRF tokens
- **Input Validation** - Formik + Yup
- **HTTPS** - En production obligatoire
- **Audit Logging** - Traçabilité complète
- **CORS Configuration** - Whitelist stricte

### Bonnes Pratiques
- Changer SECRET_KEY en production
- Utiliser HTTPS toujours
- Variables d'environnement pour secrets
- Sessions courtes (1h pour access token)
- Logs immuables pour audit

## 📦 Déploiement

### Avec Docker Compose

```bash
# À la racine du projet
docker-compose up -d

# Appliquer les migrations
docker-compose exec backend python manage.py migrate

# Créer les données initiales
docker-compose exec backend python manage.py seed_data
```

### Services

- **Backend** → http://localhost:8000
- **Frontend** → http://localhost:3000
- **PostgreSQL** → localhost:5432

### Production

```bash
# Build
docker build -t gestion-notes-backend ./backend
docker build -t gestion-notes-frontend ./frontend

# Déployer avec orchestration (Kubernetes, etc.)
# Configurer HTTPS avec reverse proxy (Nginx)
# Configurer backups PostgreSQL
```

## 📈 Flux Complet de Gestion des Notes

```
1. COLLECTE
   └─ Enseignant envoie notes par email/copie papier

2. IMPORT (Point Focal)
   └─ Connexion React
   └─ Remplit formulaire ou upload batch
   └─ AuditLog: action importée

3. VALIDATION (Vice-Doyen/Agent/Admin)
   └─ Vérification solvabilité étudiant
   └─ Approbation/Rejet
   └─ PV généré automatiquement
   └─ AuditLog: validation enregistrée

4. SIGNATURE (Vice-Doyen)
   └─ Visa du PV
   └─ AuditLog: visa enregistré

5. IMPRESSION (Agent)
   └─ Imprimer et distribuer
   └─ AuditLog: impression enregistrée

6. CONSULTATION (Étudiant)
   └─ Voir uniquement si solvable
   └─ Notes validées visibles
```

## 🐛 Troubleshooting

### Erreur de migration
```bash
python manage.py makemigrations
python manage.py migrate
```

### JWT expiré
- Utiliser /api/token/refresh/ pour obtenir un nouveau token

### CORS bloqué
- Vérifier CORS_ALLOWED_ORIGINS dans settings.py

### Base de données non connectée
- Vérifier variables DB_* dans .env
- S'assurer que PostgreSQL est en cours d'exécution

## 📞 Support

Pour toute question ou problème, consultez:
- Documentation Django: https://docs.djangoproject.com/
- DRF: https://www.django-rest-framework.org/
- React: https://react.dev/

---

**Créé avec ❤️ pour la gestion sécurisée des notes**
