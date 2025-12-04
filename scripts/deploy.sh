#!/bin/bash
# ============================================
# SCRIPT DE DÉPLOIEMENT FRONTEND
# ============================================
set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 Déploiement du Frontend${NC}"
echo -e "${BLUE}========================================${NC}"

# Vérifier docker-compose.prod.yml
if [ ! -f "docker-compose.prod.yml" ]; then
    echo -e "${RED}❌ Erreur: docker-compose.prod.yml introuvable${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Fichier docker-compose.prod.yml trouvé${NC}"

# Arrêter l'ancienne version
echo -e "${YELLOW}📦 Arrêt de l'ancienne version...${NC}"
docker compose -f docker-compose.prod.yml down || true

# Démarrer la nouvelle version
echo -e "${BLUE}🚀 Démarrage de la nouvelle version...${NC}"
docker compose -f docker-compose.prod.yml up -d

# Attendre le démarrage
echo -e "${YELLOW}⏳ Attente du démarrage...${NC}"
sleep 5

# Vérifier l'état
echo -e "${BLUE}📊 État du service:${NC}"
docker compose -f docker-compose.prod.yml ps

# Afficher les logs
echo -e "${BLUE}📋 Derniers logs:${NC}"
docker compose -f docker-compose.prod.yml logs --tail=20 frontend

# Succès
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Frontend déployé avec succès !${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🌐 Frontend disponible sur:${NC}"
echo -e "${GREEN}   http://$(hostname -I | awk '{print $1}'):4200${NC}"
echo -e "${GREEN}========================================${NC}"

exit 0