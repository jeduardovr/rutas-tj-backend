const { mongodb, ObjectId } = require('../../utils/mongoConfig');
const { getPaginationParams, getActiveFilter, buildPaginatedResponse } = require('../../utils/pagination');
const { PAGINATION_LIMITS, HTTP_STATUS } = require('../../utils/constants');

const COLLECTION_NAME = 'route';

const controller = {
    getAll: async (req, res) => {
        try {
            const db = mongodb.getdb(process.env.DATABASE_NAME);
            const { page, limit, skip } = getPaginationParams(req, PAGINATION_LIMITS.AMENITY);
            const filter = getActiveFilter(req);

            const routes = await db.collection(COLLECTION_NAME)
                .find(filter)
                .skip(skip)
                .limit(limit)
                .toArray();

            const total = await db.collection(COLLECTION_NAME).countDocuments(filter);
            const response = buildPaginatedResponse(routes, page, limit, total);

            res.status(HTTP_STATUS.OK).json(response);
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_ERROR).json({ message: "Error al obtener rutas", error: error.message });
        }
    },

    create: async (req, res) => {
        try {
            const db = mongodb.getdb(process.env.DATABASE_NAME);
            const { name, type, color, description, landmarks, path, active } = req.body;

            // Validación básica
            if (!name || !type || !path) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    message: "Faltan campos requeridos: name, type, path"
                });
            }

            // Validar que path tenga el formato GeoJSON correcto
            if (!path.type || path.type !== 'LineString' || !Array.isArray(path.coordinates)) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    message: "El campo 'path' debe ser un objeto GeoJSON LineString válido"
                });
            }

            const newRoute = {
                name,
                type,
                color: color || '#3b82f6',
                description: description || '',
                landmarks: landmarks || [],
                path,
                active: active !== undefined ? active : true,
                createdAt: new Date()
            };

            const result = await db.collection(COLLECTION_NAME).insertOne(newRoute);

            res.status(HTTP_STATUS.CREATED).json({
                message: "Ruta creada exitosamente",
                data: {
                    _id: result.insertedId,
                    ...newRoute
                }
            });
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_ERROR).json({
                message: "Error al crear la ruta",
                error: error.message
            });
        }
    }
};

module.exports = { controller };