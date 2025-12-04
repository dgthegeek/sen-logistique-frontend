# ==========================================
# STAGE 1: Build de l'application Angular
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer TOUTES les dépendances (y compris devDependencies pour le build)
RUN npm ci

# Copier le code source
COPY . .

# Build de l'app Angular en mode production
RUN npm run build -- --configuration production

# ==========================================
# STAGE 2: Serveur Nginx pour servir l'app
# ==========================================
FROM nginx:1.25-alpine

# Copier la configuration nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers buildés depuis le stage précédent
COPY --from=build /app/dist/sen-logistique-frontend /usr/share/nginx/html

# Exposer le port
EXPOSE 80

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]
