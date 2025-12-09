# 🚀 Guía Rápida de GitHub Actions

## ✅ ¿Qué se ha configurado?

### Backend (rutas-tj-backend)
- ✅ Workflow de GitHub Actions en `.github/workflows/ci-cd.yml`
- ✅ Pruebas unitarias con Jest
- ✅ Linter ESLint configurado
- ✅ Scripts de npm actualizados
- ✅ Tests básicos creados

### Frontend (rutas-tj)
- ✅ Workflow de GitHub Actions en `.github/workflows/ci-cd.yml`
- ✅ Build para múltiples entornos
- ✅ Deploy staging y producción separados

## 📦 Instalación

### Backend

```bash
cd rutas-tj-backend
npm install
```

Las nuevas dependencias de desarrollo son:
- `jest`: Framework de testing
- `supertest`: Testing de APIs HTTP
- `eslint`: Linter de código

### Frontend

```bash
cd rutas-tj
npm install
```

## 🧪 Ejecutar Tests Localmente

### Backend

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch (desarrollo)
npm run test:watch

# Tests con configuración CI
npm run test:ci

# Ejecutar linter
npm run lint
```

### Frontend

```bash
# Ejecutar tests
npm test

# Ejecutar linter
npm run lint
```

## 🚀 Próximos Pasos

### 1. Push a GitHub

Después de instalar las dependencias, haz commit y push:

```bash
# En cada repositorio (backend y frontend)
git add .
git commit -m "feat: configure GitHub Actions CI/CD"
git push origin main
```

### 2. Verificar GitHub Actions

1. Ve a tu repositorio en GitHub
2. Click en la pestaña "Actions"
3. Verás los workflows ejecutándose automáticamente

### 3. Configurar Deploy

Elige una plataforma de deploy y configura los secrets necesarios:

#### Opciones populares:

**Backend:**
- Heroku (simple)
- Railway (moderno)
- Render (generoso free tier)

**Frontend:**
- Netlify (recomendado para Angular)
- Vercel
- Firebase Hosting
- GitHub Pages

### 4. Agregar Secrets en GitHub

1. Ve a: Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Agrega los secrets necesarios según tu plataforma

Ver `GITHUB_ACTIONS_SETUP.md` para la lista completa de secrets.

## 🔧 Personalización

### Cambiar cuando se ejecuta el workflow

Edita `.github/workflows/ci-cd.yml`:

```yaml
on:
  push:
    branches: [ main, develop, feature/* ]  # Agrega más branches
  pull_request:
    branches: [ main ]
```

### Agregar más tests

**Backend:**
Crea archivos `*.test.js` en la carpeta `tests/`

**Frontend:**
Crea archivos `*.spec.ts` junto a tus componentes

### Configurar deploy automático

Descomenta y configura la sección de deploy en el workflow según tu plataforma elegida.

## 📊 Badges

Agrega estos badges a tu README.md:

```markdown
![Backend CI](https://github.com/TU-USUARIO/rutas-tj-backend/workflows/Backend%20CI%2FCD/badge.svg)
![Frontend CI](https://github.com/TU-USUARIO/rutas-tj/workflows/Frontend%20CI%2FCD/badge.svg)
```

Reemplaza `TU-USUARIO` con tu nombre de usuario de GitHub.

## ❓ FAQ

### ¿Por qué fallan los tests en GitHub Actions?

- Verifica que las variables de entorno estén configuradas
- Revisa los logs en la pestaña Actions
- Asegúrate que los tests pasen localmente primero

### ¿Cómo desactivo el deploy automático?

En el workflow, cambia esta línea:
```yaml
if: github.ref == 'refs/heads/main' && github.event_name == 'push'
```

Por:
```yaml
if: false  # Desactivar deploy
```

### ¿Puedo ejecutar tests solo en ciertos branches?

Sí, modifica la sección `on` del workflow:

```yaml
on:
  push:
    branches: 
      - main
      - develop
  pull_request:
    branches: 
      - main
```

## 📚 Documentación Completa

Ver `GITHUB_ACTIONS_SETUP.md` para documentación completa y detallada.

## 🛠️ Estructura de Archivos Creados

### Backend
```
rutas-tj-backend/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # Workflow de GitHub Actions
├── tests/
│   ├── api.test.js            # Tests básicos
│   └── setup.js               # Configuración de tests
├── .eslintrc.json             # Configuración ESLint
├── .eslintignore              # Archivos ignorados por ESLint
├── jest.config.js             # Configuración Jest
└── GITHUB_ACTIONS_SETUP.md    # Documentación completa
```

### Frontend
```
rutas-tj/
└── .github/
    └── workflows/
        └── ci-cd.yml          # Workflow de GitHub Actions
```

## 💡 Tips

1. **Ejecuta tests antes de push**: Ahorra tiempo en GitHub Actions
2. **Usa conventional commits**: `feat:`, `fix:`, `docs:`, etc.
3. **Revisa los logs**: Si algo falla, los logs de Actions son muy detallados
4. **Branch protection**: Configura reglas para requerir tests antes de merge

## ✨ Mejoras Futuras

- [ ] Agregar más tests unitarios
- [ ] Configurar tests E2E
- [ ] Agregar análisis de código estático
- [ ] Configurar notificaciones (Slack, Discord, etc.)
- [ ] Agregar badges de coverage
- [ ] Implementar semantic release

¡Listo! Tu proyecto ahora tiene CI/CD automatizado con GitHub Actions 🎉
