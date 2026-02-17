#!/bin/bash

# Script de démarrage complet du projet Gestion des Notes
# Usage: bash start.sh

set -e

echo "═══════════════════════════════════════════════════════════════"
echo "🚀 Démarrage du Système de Gestion des Notes"
echo "═══════════════════════════════════════════════════════════════"

# Couleurs pour l'output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier les prérequis
echo -e "${BLUE}Vérification des prérequis...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker et Docker Compose détectés${NC}"

# Créer les fichiers .env s'ils n'existent pas
echo -e "${BLUE}Configuration des fichiers .env...${NC}"

if [ ! -f backend/.env ]; then
    echo -e "  Création backend/.env"
    cp backend/.env.example backend/.env
    echo -e "${GREEN}  ✓ Créé (Vérifiez les paramètres)${NC}"
else
    echo -e "${GREEN}  ✓ Existe déjà${NC}"
fi

if [ ! -f frontend/.env ]; then
    echo -e "  Création frontend/.env"
    cp frontend/.env.example frontend/.env
    echo -e "${GREEN}  ✓ Créé${NC}"
else
    echo -e "${GREEN}  ✓ Existe déjà${NC}"
fi

# Démarrer les services
echo -e "${BLUE}Démarrage des services Docker...${NC}"
docker-compose up -d

echo -e "${GREEN}✓ Services en cours de démarrage${NC}"

# Attendre que PostgreSQL soit prêt
echo -e "${BLUE}Attente de la base de données...${NC}"
sleep 10

# Appliquer les migrations
echo -e "${BLUE}Application des migrations...${NC}"
docker-compose exec -T backend python manage.py migrate

# Créer les données initiales
echo -e "${BLUE}Création des données initiales...${NC}"
docker-compose exec -T backend python manage.py seed_data

# Collecter les fichiers statiques
echo -e "${BLUE}Collecte des fichiers statiques...${NC}"
docker-compose exec -T backend python manage.py collectstatic --noinput

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo -e "${GREEN}✓ Démarrage réussi!${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Accès aux services:"
echo "  🌐 Frontend   : http://localhost:3000"
echo "  🔌 Backend API: http://localhost:8000/api"
echo "  👨‍💼 Admin Panel : http://localhost:8000/admin"
echo "  📊 Nginx      : http://localhost"
echo ""
echo "Identifiants de test:"
echo "  Admin      : admin / admin123"
echo "  Point Focal: point_focal1 / pf123"
echo "  Agent      : agent1 / agent123"
echo ""
echo "Commandes utiles:"
echo "  Logs:     docker-compose logs -f"
echo "  Arrêt:    docker-compose down"
echo "  Stop:     docker-compose stop"
echo "  Restart:  docker-compose restart"
echo ""
echo "═══════════════════════════════════════════════════════════════"
