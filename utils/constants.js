/**
 * Configuración centralizada de la aplicación
 */

module.exports = {
    // Límites de paginación por módulo
    PAGINATION_LIMITS: {
        USER: 10,
        PERSON: 20,
        ROLE: 15,
        AMENITY: 5
    },

    // Configuración de caché
    CACHE: {
        TTL_SECONDS: 30,
        MAX_ITEMS: 1000
    },

    // Configuración de autenticación
    AUTH: {
        TOKEN_EXPIRY: "12h",
        HASH_ALGORITHM: "SHA256"
    },

    // Códigos de estado HTTP
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        INTERNAL_ERROR: 500
    }
};
