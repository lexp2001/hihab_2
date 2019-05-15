# hi:hab 2da Fase
### Cómo actualizar el código:
- Entrar en VS Code con las credenciales suministradas.
- Ubicar yeditar el archivo en el directorio: /home/hihab/api/app
### Descripción Archivos editables:
- ../app/calcs: Es el directorio que contiene los archivos que definen las funciones que determinan si una propiedad "califica" y las encargadas de calcular la renta.
- ../app/models/buildings.js: Archivo de parametrización de la base de datos MongoDB
- ../app/public/assets: Directorio con todos los recursos gráficos para el HTML/PDF
- ../app/routes/buildings.js: Implementa los métodos del API para la búsqueda de propiedades y los respectivos cálculos de renta
- ../app/routes/proposal.js: Implementa el métodp del API para crear el PDF de la propuesta

## Configuración de Docker Compose:
```
#docker-compose.yml
version: '3.5'
services:
  db: # Mongo Database
    image: mongo:latest
    restart: always
    container_name: mongo_hihab_dev
    volumes:
      - './data/db:/data/db'
    ports: 
      - "27017:27017"

  express_qa: #QA API for testing
    tty: true 
    restart: always
    container_name: api_qa
    build:
      context: './app'
      dockerfile: Dockerfile
    environment:
      - PORT=3000
      - NODE_ENV=development
      - DATABASE_URL=mongodb://db:27017/hi_hab

      - SKIP_DB_WAIT=0
      - SKIP_DB_MIGRATION=0
      - SKIP_NPM_INSTALL=0
      - SKIP_BOWER_INSTALL=0
    volumes:
    - './proposals:/usr/src/app/public/proposals'
    ports:
      - 3000:3000

  express_prod: #API for Production
    tty: true 
    restart: always
    container_name: api_prod
    build:
      context: './app'
      dockerfile: Dockerfile
    environment:
      - PORT=3000
      - NODE_ENV=development
      - DATABASE_URL=mongodb://db:27017/hi_hab

      - SKIP_DB_WAIT=0
      - SKIP_DB_MIGRATION=0
      - SKIP_NPM_INSTALL=0
      - SKIP_BOWER_INSTALL=0
    volumes:
    - './proposals:/usr/src/app/public/proposals'
    ports:
      - 3002:3000
```
## Configuración de Nginx
```
# prod.api.hihab.com.conf
server {
    
    # listen to port 80 
    listen 80;
    # server name or names
    server_name prod.api.hihab.com;
    location / {
       proxy_pass http://0.0.0.0:3002;
    }

    error_page 404 /404.html;
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/prod.api.hihab.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/prod.api.hihab.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}
```
