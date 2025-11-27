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

			// ❌ Se eliminaron: Validación de campos requeridos y GeoJSON LineString.

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
	},

	update: async (req, res) => {
		try {
			const db = mongodb.getdb(process.env.DATABASE_NAME);
			const routeId = req.params.id;
			const { name, type, color, description, landmarks, path, active } = req.body;

			// ❌ Se eliminaron: Validación de ID, campos requeridos y GeoJSON LineString.

			const objectId = new ObjectId(routeId); // Asumimos que el ID es válido por express-validator

			// Construcción del objeto de actualización
			const updateDoc = {
				$set: {
					name,
					type,
					color: color || '#3b82f6',
					description: description || '',
					landmarks: landmarks || [],
					path,
					...(active !== undefined && { active }),
					updatedAt: new Date()
				}
			};

			// Ejecución de la actualización en la base de datos
			const result = await db.collection(COLLECTION_NAME).updateOne(
				{ _id: objectId },
				updateDoc
			);

			if (result.matchedCount === 0) {
				// 💡 Este mensaje de no encontrado se mantiene, ya que no es un error de validación de input, sino de estado de la base de datos.
				return res.status(HTTP_STATUS.NOT_FOUND).json({
					message: `Ruta con ID ${routeId} no encontrada.`
				});
			}

			// Obtener el documento actualizado para devolverlo
			const updatedRoute = await db.collection(COLLECTION_NAME).findOne({ _id: objectId });

			res.status(HTTP_STATUS.OK).json({
				message: "Ruta actualizada exitosamente",
				data: updatedRoute
			});

		} catch (error) {
			res.status(HTTP_STATUS.INTERNAL_ERROR).json({
				message: "Error al actualizar la ruta",
				error: error.message
			});
		}
	}
}

module.exports = { controller };