const jwt = require('jsonwebtoken');
const { LRUCache } = require('lru-cache');
const util = require('util');
const { functions } = require('../modules/user/user.functions');
const moment = require("moment-timezone");

// Promisify jwt.verify para usar async/await en lugar de callbacks
const verifyJwt = util.promisify(jwt.verify);

// 1. Configuración de Caché (LRU - Least Recently Used)
// Almacenamos los datos del usuario en memoria para no consultar la BD en cada petición.
// - max: 1000 usuarios simultáneos en caché.
// - ttl: 30 segundos (para pruebas, evita que la caché oculte la expiración del token).
const tokenCache = new LRUCache({
    max: 1000,
    ttl: 30 * 1000,
});

const token = {
    // Middleware principal de validación
    valid: async (req, res, next) => {
        const start = performance.now(); // Inicio del timer para medir rendimiento

        // 2. Extracción del Token
        // Buscamos el token en 3 lugares en orden de prioridad:
        // a) Header 'token' (personalizado)
        // b) Query param '?token=...' (para pruebas rápidas)
        // c) Params de ruta (si aplica)
        let tokenValue = req.headers.token || req.query.token || req.params.token;

        // d) Header estándar 'Authorization: Bearer <token>'
        if (!tokenValue && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            tokenValue = req.headers.authorization.split(' ')[1];
        }

        // 3. Configuración Regional (Opcional)
        // Si el cliente envía su zona horaria, la configuramos globalmente para esta petición
        if (req.headers.timezone && moment.tz.names().includes(req.headers.timezone)) {
            global._timezone = req.headers.timezone;
        }

        // Si no hay token, denegamos el acceso inmediatamente (403 Forbidden)
        if (!tokenValue) {
            return res.sendStatus(403);
        }

        try {
            // 4. Estrategia de Caché (Optimización)
            // Primero verificamos si ya validamos este token recientemente.
            const cachedUser = tokenCache.get(tokenValue);

            if (cachedUser) {
                // ¡Acierto de caché! (HIT)
                // Usamos los datos guardados y evitamos ir a la base de datos.
                req.user = cachedUser;
                res.set('X-Cache', 'HIT'); // Header informativo para depuración
                addTimingHeader(res, start);
                return next(); // Pasamos al siguiente middleware/controlador
            }

            // 5. Verificación Criptográfica (Si no estaba en caché)
            // Verificamos que el token sea auténtico y no haya expirado usando la clave secreta.
            const tokenData = await verifyJwt(tokenValue, process.env.TOKEN_KEY);

            // 6. Obtención de Datos (Base de Datos)
            // Si el token es válido, buscamos los datos frescos del usuario en la BD.
            // Esto asegura que si el usuario fue borrado o bloqueado, no pueda entrar aunque tenga token.
            const dataUser = await functions.dataToken(tokenData.user);

            // 7. Guardado en Caché
            // Guardamos el resultado para futuras peticiones (durante 30s).
            tokenCache.set(tokenValue, dataUser);

            // 8. Inyección de Usuario
            // Adjuntamos el usuario al objeto 'req' para que los controladores puedan usarlo (ej. req.user._id).
            req.user = dataUser;
            res.set('X-Cache', 'MISS'); // Indicamos que tuvimos que procesarlo (no estaba en caché)
            addTimingHeader(res, start);

            next(); // Continuamos

        } catch (err) {
            // Manejo de Errores de Token
            if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
                return res.status(403).json({ message: "Tu sesión ha expirado o el token es inválido" });
            }
            console.error('Error en validación de token:', err);
            res.status(500).json({ message: "Error interno del servidor al validar sesión" });
        }
    },

    // Limpiar toda la caché manualmente (útil para admin/debug)
    clearCache: () => {
        tokenCache.clear();
        return { message: "Caché de tokens limpiada" };
    },

    // Eliminar un token específico de la caché (ej. al hacer logout)
    deleteTokenFromCache: (req, res, next) => {
        const token = req.headers.token || req.params.token; // Nota: Debería usar la misma lógica de extracción completa si se usa Bearer
        if (token) tokenCache.delete(token);
        next();
    }
};

// Helper para medir tiempo de respuesta (Performance)
function addTimingHeader(res, start) {
    const duration = performance.now() - start;
    res.set('X-Response-Time', `${duration.toFixed(2)}ms`);
}

module.exports = { token };