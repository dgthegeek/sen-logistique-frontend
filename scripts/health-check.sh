#!/bin/bash
# ============================================
# SCRIPT HEALTH CHECK FRONTEND
# ============================================
set -e

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔍 Vérification du Frontend...${NC}"

# Vérifier que le container tourne
echo -e "${YELLOW}1️⃣ Vérification du container...${NC}"

FRONTEND_STATUS=$(docker inspect -f '{{.State.Status}}' sen-logistique-frontend 2>/dev/null || echo "not found")

if [ "$FRONTEND_STATUS" != "running" ]; then
    echo -e "${RED}❌ Container frontend n'est pas en cours d'exécution${NC}"
    docker logs sen-logistique-frontend || true
    exit 1
fi

echo -e "${GREEN}✅ Container en cours d'exécution${NC}"

# Attendre que le frontend soit prêt
echo -e "${YELLOW}2️⃣ Attente du démarrage du frontend...${NC}"

MAX_ATTEMPTS=12
ATTEMPT=0
WAIT_TIME=5

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    ATTEMPT=$((ATTEMPT + 1))
    echo -e "${YELLOW}   Tentative $ATTEMPT/$MAX_ATTEMPTS...${NC}"
    
    # Tester le health endpoint
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4200/health 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Frontend répond correctement !${NC}"
        break
    fi
    
    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        echo -e "${RED}❌ Timeout: Le frontend ne répond pas après 60 secondes${NC}"
        echo -e "${RED}📋 Logs:${NC}"
        docker logs --tail=50 sen-logistique-frontend
        exit 1
    fi
    
    sleep $WAIT_TIME
done

# Tester la page d'accueil
echo -e "${YELLOW}3️⃣ Test de la page d'accueil...${NC}"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4200 2>/dev/null || echo "000")

if [ "$HTTP_CODE" != "200" ]; then
    echo -e "${RED}❌ La page d'accueil ne répond pas correctement (HTTP $HTTP_CODE)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Page d'accueil OK${NC}"

# Résumé
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ HEALTH CHECK RÉUSSI${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🐳 Container: Running${NC}"
echo -e "${GREEN}🌐 Frontend: Responsive${NC}"
echo -e "${GREEN}========================================${NC}"

exit 0