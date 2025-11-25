/**
 * Utilidades de paginación reutilizables
 * Permite configurar límites por defecto específicos para cada módulo
 */

/**
 * Obtiene los parámetros de paginación desde la request
 * @param {Object} req - Request de Express
 * @param {number} defaultLimit - Límite por defecto (puede variar por módulo)
 * @returns {Object} { page, limit, skip }
 */
const getPaginationParams = (req, defaultLimit = 10) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || defaultLimit;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

/**
 * Construye el filtro para registros activos/inactivos
 * @param {Object} req - Request de Express
 * @returns {Object} Filtro MongoDB
 */
const getActiveFilter = (req) => {
    const includeInactive = req.query.includeInactive === 'true';
    return includeInactive ? {} : { active: true };
};

/**
 * Construye la respuesta paginada estándar
 * @param {Array} data - Datos a devolver
 * @param {number} page - Página actual
 * @param {number} limit - Límite de items por página
 * @param {number} total - Total de registros
 * @returns {Object} Respuesta con data y pagination
 */
const buildPaginatedResponse = (data, page, limit, total) => ({
    data,
    pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
    }
});

module.exports = {
    getPaginationParams,
    getActiveFilter,
    buildPaginatedResponse
};
