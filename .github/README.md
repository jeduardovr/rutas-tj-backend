# GitHub Actions Workflows

Este directorio contiene los workflows de GitHub Actions para CI/CD automatizado.

## Workflows Disponibles

### 1. CI/CD (`ci-cd.yml`)

**Propósito:** Pipeline principal de Integración y Despliegue Continuo

**Se ejecuta en:**
- Push a ramas: `main`, `develop`
- Pull Requests a: `main`, `develop`

**Jobs:**

#### Test
- **Node.js versions:** 18.x, 20.x (matrix)
- **Acciones:**
  - Instala dependencias con `npm ci`
  - Ejecuta linter ESLint
  - Ejecuta tests con Jest + coverage
  - Sube reporte de cobertura a Codecov (opcional)
- **Duración estimada:** 2-3 minutos

#### Build
- **Acciones:**
  - Verifica la sintaxis del código
  - Valida que la aplicación compile
- **Duración estimada:** 30 segundos

#### Deploy
- **Condición:** Solo en push a `main`
- **Estado:** Configuración pendiente (ver DEPLOYMENT.md)
- **Plataformas soportadas:** Heroku, Railway, Render, Azure, AWS

---

### 2. Code Quality (`code-quality.yml`)

**Propósito:** Verificación de calidad de código en Pull Requests

**Se ejecuta en:**
- Pull Requests a: `main`, `develop`

**Acciones:**
- Ejecuta ESLint (continúa en errores)
- Ejecuta tests con cobertura
- Verifica cobertura mínima (opcional)
- Comenta en el PR con resultados

**Duración estimada:** 2 minutos

---

## Variables de Entorno

### Secrets Requeridos

Para que los workflows funcionen completamente, configura estos secrets en:
`Settings → Secrets and variables → Actions`

#### Para Coverage (Opcional)
- `CODECOV_TOKEN` - Token de codecov.io

#### Para Deploy (cuando lo configures)
Dependiendo de la plataforma elegida:

**Heroku:**
- `HEROKU_API_KEY`
- `HEROKU_EMAIL`

**Railway:**
- `RAILWAY_TOKEN`

**Azure:**
- `AZURE_WEBAPP_PUBLISH_PROFILE`

Ver `DEPLOYMENT.md` para la lista completa.

---

## Estructura de Archivos

```
.github/
├── workflows/
│   ├── ci-cd.yml           # Pipeline principal
│   └── code-quality.yml    # Calidad en PRs
└── README.md              # Este archivo
```

---

## Modificar Workflows

### Cambiar branches que triggerea el workflow

Edita la sección `on`:

```yaml
on:
  push:
    branches: [ main, develop, feature/* ]
  pull_request:
    branches: [ main ]
```

### Agregar más versiones de Node.js

Edita el `matrix`:

```yaml
strategy:
  matrix:
    node-version: [16.x, 18.x, 20.x, 21.x]
```

### Desactivar deploy automático

Cambia la condición:

```yaml
if: false  # Desactivar
```

O comenta todo el job de deploy.

---

## Badges

Para mostrar el estado del workflow en tu README:

```markdown
![CI/CD Status](https://github.com/USUARIO/REPO/workflows/Backend%20CI%2FCD/badge.svg)
```

---

## Troubleshooting

### Workflow no se ejecuta

- Verifica que el archivo esté en `.github/workflows/`
- Verifica la sintaxis YAML (usa un validador online)
- Revisa que los branches coincidan con tu configuración

### Tests fallan en Actions pero pasan localmente

- Verifica las variables de entorno
- Asegúrate que no hay dependencias locales
- Revisa los logs detallados en la pestaña Actions

### Deploy falla

- Verifica que todos los secrets estén configurados
- Revisa los logs del step de deploy
- Verifica las credenciales de la plataforma

---

## Recursos

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

## Mantenimiento

Revisa periódicamente:
- Versiones de actions usadas (actualizar a latest)
- Versiones de Node.js en el matrix
- Coverage thresholds
- Secrets expirados

---

**Última actualización:** 2025-12-08
**Versión:** 1.0.0
