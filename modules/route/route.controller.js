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

	getById: async (req, res) => {
		try {
			const db = mongodb.getdb(process.env.DATABASE_NAME);
			const routeId = req.params.id;

			if (!ObjectId.isValid(routeId)) {
				return res.status(HTTP_STATUS.BAD_REQUEST).json({
					message: "ID de ruta inválido"
				});
			}

			const route = await db.collection(COLLECTION_NAME).findOne({
				_id: new ObjectId(routeId)
			});

			if (!route) {
				return res.status(HTTP_STATUS.NOT_FOUND).json({
					message: `Ruta con ID ${routeId} no encontrada`
				});
			}

			res.status(HTTP_STATUS.OK).json({
				message: "Ruta obtenida exitosamente",
				data: route
			});
		} catch (error) {
			res.status(HTTP_STATUS.INTERNAL_ERROR).json({
				message: "Error al obtener la ruta",
				error: error.message
			});
		}
	},

	create: async (req, res) => {
		try {
			const db = mongodb.getdb(process.env.DATABASE_NAME);
			const { from, to, type, schedule, color, description, landmarks, path, active } = req.body;

			const newRoute = {
				from,
				to,
				type,
				...(schedule && { schedule }),
				color: color || '#3b82f6',
				description: description || '',
				landmarks: landmarks || [],
				path,
				active: active !== undefined ? active : true,
				createdAt: new Date(),
				updated: {
					user: req.body.user || '',
					date: new Date()
				}
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
			const { from, to, type, schedule, color, description, landmarks, path, active, user } = req.body;

			const objectId = new ObjectId(routeId);

			const updateDoc = {
				$set: {
					from,
					to,
					type,
					...(schedule && { schedule }),
					color: color || '#3b82f6',
					description: description || '',
					landmarks: landmarks || [],
					path,
					...(active !== undefined && { active }),
					updatedAt: new Date(),
					updated: {
						user: user || '',
						date: new Date()
					}
				}
			};

			const result = await db.collection(COLLECTION_NAME).updateOne(
				{ _id: objectId },
				updateDoc
			);

			if (result.matchedCount === 0) {
				return res.status(HTTP_STATUS.NOT_FOUND).json({
					message: `Ruta con ID ${routeId} no encontrada.`
				});
			}

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
	},

	propose: async (req, res) => {
		try {
			const db = mongodb.getdb(process.env.DATABASE_NAME);
			const { from, to, type, schedule, color, description, landmarks, path, user } = req.body;

			const newProposal = {
				from,
				to,
				type,
				...(schedule && { schedule }),
				color: color || '#3b82f6',
				description: description || '',
				landmarks: landmarks || [],
				path,
				status: 'pending',
				active: true,
				createdAt: new Date(),
				proposedBy: user || 'anonymous',
				updated: {
					user: user || '',
					date: new Date()
				}
			};

			const result = await db.collection('routes_to_approve').insertOne(newProposal);

			res.status(HTTP_STATUS.CREATED).json({
				message: "Propuesta de ruta enviada exitosamente para aprobación",
				data: {
					_id: result.insertedId,
					...newProposal
				}
			});
		} catch (error) {
			res.status(HTTP_STATUS.INTERNAL_ERROR).json({
				message: "Error al enviar la propuesta de ruta",
				error: error.message
			});
		}
	}
};

module.exports = { controller };