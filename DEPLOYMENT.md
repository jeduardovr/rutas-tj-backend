# 🚀 Guía de Deployment

## Backend Deployment Options

### Opción 1: Heroku (Recomendado para empezar)

#### Configuración Manual
1. Crear cuenta en [Heroku](https://heroku.com)
2. Instalar Heroku CLI:
```bash
npm install -g heroku
```

3. Login y crear app:
```bash
heroku login
heroku create rutas-tj-backend
```

4. Configurar variables de entorno:
```bash
heroku config:set MONGODB_URI=tu_mongodb_uri
heroku config:set JWT_SECRET=tu_jwt_secret
```

5. Deploy:
```bash
git push heroku main
```

#### Configuración con GitHub Actions

Actualiza `.github/workflows/ci-cd.yml` en la sección de deploy:

```yaml
deploy:
  name: Deploy Backend
  runs-on: ubuntu-latest
  needs: [test, build]
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  
  steps:
  - name: Checkout code
    uses: actions/checkout@v4
  
  - name: Deploy to Heroku
    uses: akhileshns/heroku-deploy@v3.12.14
    with:
      heroku_api_key: ${{secrets.HEROKU_API_KEY}}
      heroku_app_name: "rutas-tj-backend"
      heroku_email: ${{secrets.HEROKU_EMAIL}}
```

Configura estos secrets en GitHub:
- `HEROKU_API_KEY`: Tu API key de Heroku (Settings → Account → API Key)
- `HEROKU_EMAIL`: Tu email de Heroku

---

### Opción 2: Railway

1. Crear cuenta en [Railway](https://railway.app)
2. Conectar tu repositorio de GitHub
3. Railway detectará automáticamente tu app Node.js
4. Configurar variables de entorno en el dashboard
5. Deploy automático en cada push a main

#### Con GitHub Actions:
```yaml
- name: Deploy to Railway
  run: |
    npm install -g railway
    railway up
  env:
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

### Opción 3: Render

1. Crear cuenta en [Render](https://render.com)
2. New → Web Service
3. Conectar repositorio
4. Configuración:
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start:prod`
5. Agregar variables de entorno
6. Deploy

Render tiene auto-deploy desde GitHub incluido, no necesitas GitHub Actions.

---

### Opción 4: Vercel (para APIs serverless)

```bash
npm install -g vercel
vercel
```

Crear `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "app.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app.js"
    }
  ]
}
```

---

## Frontend Deployment Options

### Opción 1: Netlify (Recomendado)

#### Configuración Manual:
1. Crear cuenta en [Netlify](https://netlify.com)
2. Instalar Netlify CLI:
```bash
npm install -g netlify-cli
```

3. Build y deploy:
```bash
npm run build
netlify deploy --prod --dir=dist/rutas-tj/browser
```

#### Con GitHub Actions:

Actualiza `.github/workflows/ci-cd.yml`:

```yaml
deploy-production:
  name: Deploy to Production
  runs-on: ubuntu-latest
  needs: build
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  
  steps:
  - name: Checkout code
    uses: actions/checkout@v4
  
  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: '20.x'
      cache: 'npm'
  
  - name: Install dependencies
    run: npm ci
  
  - name: Build
    run: npm run build -- --configuration=production
  
  - name: Deploy to Netlify
    uses: netlify/actions/cli@master
    with:
      args: deploy --dir=dist/rutas-tj/browser --prod
    env:
      NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
      NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

Secrets necesarios:
- `NETLIFY_SITE_ID`: ID del sitio (Settings → Site details → Site ID)
- `NETLIFY_AUTH_TOKEN`: Token personal (User settings → Applications → Personal access tokens)

---

### Opción 2: Vercel

```bash
npm install -g vercel
vercel
```

Con GitHub Actions:
```yaml
- name: Deploy to Vercel
  uses: amondnet/vercel-action@v20
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.ORG_ID}}
    vercel-project-id: ${{ secrets.PROJECT_ID}}
    vercel-args: '--prod'
    working-directory: ./
```

---

### Opción 3: Firebase Hosting

1. Instalar Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
```

2. Configurar `firebase.json`:
```json
{
  "hosting": {
    "public": "dist/rutas-tj/browser",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

3. Deploy:
```bash
npm run build
firebase deploy --only hosting
```

---

### Opción 4: GitHub Pages

Agregar a `.github/workflows/ci-cd.yml`:

```yaml
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./dist/rutas-tj/browser
    cname: tu-dominio.com  # Opcional
```

---

## Variables de Entorno

### Backend
Asegúrate de configurar estas variables en tu plataforma de deploy:

```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=tu_secret_super_seguro
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
```

### Frontend
Si usas variables de entorno en Angular:

1. Crear `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-backend-url.com'
};
```

2. En la plataforma de deploy, NO necesitas configurar variables adicionales si usas el sistema de environments de Angular.

---

## Checklist Pre-Deploy

### Backend
- [ ] Tests pasan localmente
- [ ] Variables de entorno configuradas
- [ ] MongoDB URI de producción configurado
- [ ] CORS configurado correctamente
- [ ] Rate limiting implementado (opcional)
- [ ] Logs configurados
- [ ] Health check endpoint funcional

### Frontend
- [ ] Build de producción funciona
- [ ] API URL apunta al backend de producción
- [ ] Google OAuth configurado para dominio de producción
- [ ] Favicon y meta tags configurados
- [ ] Analytics configurado (opcional)

---

## Monitoreo Post-Deploy

### Backend
- Revisar logs de la aplicación
- Verificar conexión a MongoDB
- Probar endpoints críticos
- Verificar autenticación

### Frontend
- Verificar que la app carga
- Probar login/registro
- Verificar integración con backend
- Probar en diferentes navegadores

---

## Rollback

Si algo sale mal:

### Heroku:
```bash
heroku rollback
```

### Netlify/Vercel:
- Usar el dashboard para hacer rollback a un deploy anterior

### Railway/Render:
- Redeploy desde un commit anterior en GitHub

---

## Próximos Pasos

1. Elegir plataforma de deploy
2. Configurar secrets en GitHub
3. Actualizar workflows con la configuración de deploy elegida
4. Hacer push a main
5. Verificar deploy en la plataforma
6. Configurar dominio custom (opcional)
7. Configurar SSL (automático en la mayoría de plataformas)

---

## Soporte

Para más ayuda:
- Heroku Docs: https://devcenter.heroku.com/
- Netlify Docs: https://docs.netlify.com/
- Railway Docs: https://docs.railway.app/
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
