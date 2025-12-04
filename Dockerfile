# ==========================================
# STAGE 1 : Build de l'application Angular
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Build de l'app Angular en mode production
RUN npm run build -- --configuration production

# ==========================================
# STAGE 2 : Servir avec Nginx
# ==========================================
FROM nginx:1.25-alpine

# Copier la config Nginx personnalisée
COPY nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers buildés depuis le stage 1
COPY --from=build /dist/sen-logistique-frontend /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]