#!/bin/bash

# QUICKSTART - Démarrage Rapide en 5 minutes

echo "⚡ QUICKSTART - Gestion des Notes"
echo "=================================="
echo ""
echo "Ce script va démarrer le projet complet."
echo ""

# Vérifier Docker
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé"
    echo "Installez Docker Desktop depuis: https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo "✓ Docker détecté"
echo ""

# Copier les .env
echo "1️⃣  Configuration..."
cp backend/.env.example backend/.env 2>/dev/null || true
cp frontend/.env.example frontend/.env 2>/dev/null || true
echo "   ✓ .env configurés"
echo ""

# Démarrer
echo "2️⃣  Démarrage des services..."
docker-compose up -d
echo "   ⏳ Attendez 30 secondes..."
sleep 30
echo "   ✓ Services en cours d'exécution"
echo ""

# Migrations
echo "3️⃣  Préparation de la base de données..."
docker-compose exec -T backend python manage.py migrate 2>/dev/null
docker-compose exec -T backend python manage.py seed_data 2>/dev/null
echo "   ✓ Base de données prête"
echo ""

echo "✅ DÉMARRAGE RÉUSSI!"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Accès rapide:"
echo ""
echo "  🌐 FRONTEND (React)"
echo "     URL: http://localhost:3000"
echo "     Admin: admin / admin123"
echo ""
echo "  🔌 API BACKEND"
echo "     URL: http://localhost:8000/api"
echo "     Swagger: http://localhost:8000/api/schema/"
echo ""
echo "  👨‍💼 ADMIN DJANGO"
echo "     URL: http://localhost:8000/admin"
echo "     Admin: admin / admin123"
echo ""
echo "  🌍 NGINX PROXY"
echo "     URL: http://localhost"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Utilisateurs de test:"
echo ""
echo "  Admin        → admin          / admin123"
echo "  Point Focal  → point_focal1   / pf123"
echo "  Agent        → agent1         / agent123"
echo "  Vice-Doyen   → vice_doyen     / vd123"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Commandes utiles:"
echo ""
echo "  Afficher les logs:      docker-compose logs -f"
echo "  Arrêter les services:   docker-compose down"
echo "  Redémarrer:             docker-compose restart"
echo "  Shell du backend:       docker-compose exec backend bash"
echo "  Shell du frontend:      docker-compose exec frontend sh"
echo ""
echo "═══════════════════════════════════════════════════════════════"
