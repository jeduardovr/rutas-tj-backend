# Instrucciones para actualizar route.controller.js

Los siguientes cambios necesitan realizarse en el archivo `modules/route/route.controller.js` para guardar correctamente los IDs de usuario como ObjectId en lugar de strings:

## Cambios requeridos:

### 1. Método `create` (línea 62-99):
- Cambiar `createdAt: new Date()` por un objeto `create` con:
  ```javascript
  create: {
    user: new ObjectId(req.user._id),
    date: new Date()
  }
  ```
- Cambiar el objeto `updated` de:
  ```javascript
  updated: {
    user: req.body.user || '',
    date: new Date()
  }
  ```
  A:
  ```javascript
  updated: {
    user: new ObjectId(req.user._id),
    date: new Date()
  }
  ```

### 2. Método `update` (línea 101-151):
- Cambiar el objeto `updated` de:
  ```javascript
  updated: {
    user: user || '',
    date: new Date()
  }
  ```
  A:
  ```javascript
  updated: {
    user: new ObjectId(req.user._id),
    date: new Date()
  }
  ```

### 3. Método `propose` (línea 154-192):
- Cambiar `proposedBy: user || 'anonymous'` por:
  ```javascript
  proposedBy: new ObjectId(req.user._id)
  ```
- Cambiar el objeto `updated` de:
  ```javascript
  updated: {
    user: user || '',
    date: new Date()
  }
  ```
  A:
  ```javascript
  updated: {
    user: new ObjectId(req.user._id),
    date: new Date()
  }
  ```

### 4. Método `approveProposal` (línea 219-279):
- Cambiar `routeData.approvedBy = req.body.approvedBy || 'admin';` por:
  ```javascript
  routeData.approvedBy = new ObjectId(req.user._id);
  ```
- Y dentro del updateOne:
  ```javascript
  approvedBy: new ObjectId(req.user._id),
  ```

### 5. Método `rejectProposal` (línea 282-331):
- Cambiar `rejectedBy: req.body.rejectedBy || 'admin',` por:
  ```javascript
  rejectedBy: new ObjectId(req.user._id),
  ```

### 6. Método `updateProposal` (línea 333-388):
- Cambiar el objeto `updated` de:
  ```javascript
  updated: {
    user: req.body.user || 'admin',
    date: new Date()
  }
  ```
  A:
  ```javascript
  updated: {
    user: new ObjectId(req.user._id),
    date: new Date()
  }
  ```

## Resultado esperado:
Todos los campos user, approvedBy, rejectedBy, y proposedBy deben almacenarse como ObjectId en lugar de strings.
