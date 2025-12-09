# 🚀 Rutas TJ - GitHub Actions CI/CD

Este documento describe la configuración de GitHub Actions para la automatización de pruebas y despliegue del proyecto Rutas TJ.

## 📋 Contenido

- [Backend CI/CD](#backend-cicd)
- [Frontend CI/CD](#frontend-cicd)
- [Configuración Inicial](#configuración-inicial)
- [Secrets Requeridos](#secrets-requeridos)
- [Plataformas de Deploy](#plataformas-de-deploy)

## 🔧 Backend CI/CD

### Workflow: `.github/workflows/ci-cd.yml`

El workflow del backend incluye tres jobs principales:

### 1️⃣ **Test**
- Ejecuta pruebas en Node.js 18.x y 20.x
- Ejecuta linter ESLint
- Ejecuta tests con Jest
- Genera reporte de cobertura (Coverage)

### 2️⃣ **Build**
- Verifica que el código se compila correctamente
- Valida la sintaxis de app.js

### 3️⃣ **Deploy**
- Se ejecuta solo en push a `main`
- Despliega automáticamente a producción

### 📝 Scripts Disponibles

```bash
# Ejecutar pruebas con cobertura
npm test

# Ejecutar pruebas en modo watch
npm run test:watch

# Ejecutar pruebas para CI (usado en GitHub Actions)
npm run test:ci

# Ejecutar linter
npm run lint

# Iniciar servidor desarrollo
npm start

# Iniciar servidor producción
npm run start:prod
```

## 🎨 Frontend CI/CD

### Workflow: `.github/workflows/ci-cd.yml`

El workflow del frontend incluye cuatro jobs principales:

### 1️⃣ **Test**
- Ejecuta linter
- Ejecuta tests con Karma/Jasmine
- Genera reporte de cobertura

### 2️⃣ **Build**
- Construye la aplicación para development y production
- Guarda artifacts de la build de producción

### 3️⃣ **Deploy Staging**
- Se ejecuta solo en push a `develop`
- Despliega automáticamente a staging

### 4️⃣ **Deploy Production**
- Se ejecuta solo en push a `main`
- Despliega automáticamente a producción

## ⚙️ Configuración Inicial

### Backend

1. **Instalar dependencias de desarrollo:**
```bash
cd rutas-tj-backend
npm install
```

2. **Ejecutar tests localmente:**
```bash
npm test
```

3. **Ejecutar linter:**
```bash
npm run lint
```

### Frontend

1. **Instalar dependencias:**
```bash
cd rutas-tj
npm install
```

2. **Ejecutar tests localmente:**
```bash
npm test
```

3. **Ejecutar linter:**
```bash
npm run lint
```

## 🔐 Secrets Requeridos

Para configurar los secrets en GitHub:
1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Click en "New repository secret"

### Secrets Comunes

```
CODECOV_TOKEN          # Token de Codecov (opcional)
```

### Secrets para Deploy (según plataforma)

#### Heroku (Backend)
```
HEROKU_API_KEY         # API Key de Heroku
HEROKU_APP_NAME        # Nombre de tu app en Heroku
HEROKU_EMAIL           # Email de tu cuenta Heroku
```

#### Firebase (Frontend)
```
FIREBASE_SERVICE_ACCOUNT    # Service account JSON
FIREBASE_PROJECT_ID         # ID del proyecto Firebase
```

#### Netlify (Frontend)
```
NETLIFY_AUTH_TOKEN     # Token de autenticación
NETLIFY_SITE_ID        # ID del sitio
```

#### AWS (Ambos)
```
AWS_ACCESS_KEY_ID      # AWS Access Key
AWS_SECRET_ACCESS_KEY  # AWS Secret Key
AWS_REGION             # Región de AWS
```

#### MongoDB Atlas
```
MONGODB_URI            # URI de MongoDB para producción
MONGODB_URI_TEST       # URI de MongoDB para tests
```

## 🌐 Plataformas de Deploy

### Backend - Opciones Recomendadas

#### 1. **Heroku** (Más Simple)
```yaml
- name: Deploy to Heroku
  uses: akhileshns/heroku-deploy@v3.12.14
  with:
    heroku_api_key: ${{secrets.HEROKU_API_KEY}}
    heroku_app_name: "rutas-tj-backend"
    heroku_email: ${{secrets.HEROKU_EMAIL}}
```

#### 2. **Railway** (Alternativa Moderna)
```yaml
- name: Deploy to Railway
  run: |
    npm install -g railway
    railway up
  env:
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

#### 3. **Render** (Free Tier Generoso)
- Conectar repositorio en render.com
- Auto-deploy en push a main

#### 4. **Azure Web Apps**
```yaml
- name: Deploy to Azure
  uses: azure/webapps-deploy@v2
  with:
    app-name: 'rutas-tj-backend'
    publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
```

### Frontend - Opciones Recomendadas

#### 1. **Netlify** (Más Popular para Angular)
```yaml
- name: Deploy to Netlify
  uses: netlify/actions/cli@master
  with:
    args: deploy --dir=dist/rutas-tj/browser --prod
  env:
    NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
    NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

#### 2. **Vercel** (Excelente para SPAs)
```yaml
- name: Deploy to Vercel
  uses: amondnet/vercel-action@v20
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.ORG_ID}}
    vercel-project-id: ${{ secrets.PROJECT_ID}}
    vercel-args: '--prod'
```

#### 3. **Firebase Hosting** (Integración con Google)
```yaml
- name: Deploy to Firebase
  uses: FirebaseExtended/action-hosting-deploy@v0
  with:
    repoToken: '${{ secrets.GITHUB_TOKEN }}'
    firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
    projectId: rutas-tj
    channelId: live
```

#### 4. **GitHub Pages** (Gratis)
```yaml
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./dist/rutas-tj/browser
```

#### 5. **AWS S3 + CloudFront**
```yaml
- name: Deploy to AWS S3
  uses: jakejarvis/s3-sync-action@master
  with:
    args: --delete
  env:
    AWS_S3_BUCKET: ${{ secrets.AWS_S3_BUCKET }}
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    SOURCE_DIR: 'dist/rutas-tj/browser'
```

## 🔄 Flujo de Trabajo

### Desarrollo
1. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
2. Hacer commits: `git commit -m "feat: nueva funcionalidad"`
3. Push: `git push origin feature/nueva-funcionalidad`
4. Crear Pull Request hacia `develop`
5. GitHub Actions ejecuta tests automáticamente
6. Si pasan los tests, mergear el PR

### Staging
1. Mergear PR a `develop`
2. GitHub Actions ejecuta:
   - Tests
   - Build
   - Deploy a Staging

### Producción
1. Crear PR de `develop` a `main`
2. Revisar cambios
3. Mergear PR
4. GitHub Actions ejecuta:
   - Tests
   - Build de producción
   - Deploy a Producción

## 📊 Badges para README

Agrega estos badges a tu README.md principal:

```markdown
![Backend CI/CD](https://github.com/tu-usuario/rutas-tj-backend/workflows/Backend%20CI%2FCD/badge.svg)
![Frontend CI/CD](https://github.com/tu-usuario/rutas-tj/workflows/Frontend%20CI%2FCD/badge.svg)
[![codecov](https://codecov.io/gh/tu-usuario/rutas-tj-backend/branch/main/graph/badge.svg)](https://codecov.io/gh/tu-usuario/rutas-tj-backend)
```

## 🐛 Troubleshooting

### Tests fallan en CI pero pasan localmente
- Verifica las variables de entorno
- Asegúrate que las versiones de Node.js coincidan
- Revisa los logs de GitHub Actions

### Deploy falla
- Verifica que todos los secrets estén configurados
- Revisa los logs del job de deploy
- Verifica las credenciales de la plataforma

### Linter falla
- Ejecuta `npm run lint` localmente
- Corrige los errores antes de hacer push
- Usa `npm run lint -- --fix` para auto-correcciones

## 📚 Recursos Adicionales

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Angular Testing Guide](https://angular.io/guide/testing)
- [ESLint Documentation](https://eslint.org/docs/latest/)

## 🤝 Contribuir

Para contribuir al proyecto:
1. Fork el repositorio
2. Crear rama feature
3. Hacer commits siguiendo [Conventional Commits](https://www.conventionalcommits.org/)
4. Asegurar que todos los tests pasen
5. Crear Pull Request

## 📄 Licencia

ISC
