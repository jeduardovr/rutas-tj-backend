const { mongodb, ObjectId } = require('../../utils/mongoConfig');
const { getPaginationParams, getActiveFilter, buildPaginatedResponse } = require('../../utils/pagination');
const { PAGINATION_LIMITS, HTTP_STATUS } = require('../../utils/constants');

const COLLECTION_NAME = 'route';
const COLLECTION_NAME_TO_APPROVE = 'routes_to_approve';

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
			const { _id } = req.user;
			const { from, to, type, schedule, color, description, landmarks, path, active, currentDate } = req.body;

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
				created: {
					user: _id,
					date: currentDate
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
			const { _id } = req.user;
			const { id } = req.params;
			const { from, to, type, schedule, color, description, landmarks, path, active, currentDate } = req.body;

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
					updated: {
						user: _id,
						date: currentDate
					}
				}
			};

			const result = await db.collection(COLLECTION_NAME).updateOne(
				{ _id: id },
				updateDoc
			);

			if (result.matchedCount === 0) {
				return res.status(HTTP_STATUS.NOT_FOUND).json({
					message: `Ruta no encontrada.`
				});
			}

			const updatedRoute = await db.collection(COLLECTION_NAME).findOne({ _id: id });

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
			const { _id } = req.user;
			const { from, to, type, schedule, color, description, landmarks, path, currentDate } = req.body;

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
				created: {
					user: _id,
					date: currentDate
				}
			};

			const result = await db.collection(COLLECTION_NAME_TO_APPROVE).insertOne(newProposal);

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
	},

	getPendingProposals: async (req, res) => {
		try {
			const db = mongodb.getdb(process.env.DATABASE_NAME);
			const { page, limit, skip } = getPaginationParams(req, PAGINATION_LIMITS.PENDING_PROPOSAL);

			const proposals = await db.collection(COLLECTION_NAME_TO_APPROVE)
				.find({ status: 'pending' })
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.toArray();

			const total = await db.collection(COLLECTION_NAME_TO_APPROVE).countDocuments({ status: 'pending' });
			const response = buildPaginatedResponse(proposals, page, limit, total);

			res.status(HTTP_STATUS.OK).json(response);
		} catch (error) {
			res.status(HTTP_STATUS.INTERNAL_ERROR).json({
				message: "Error al obtener propuestas pendientes",
				error: error.message
			});
		}
	},

	approveProposal: async (req, res) => {
		try {
			const db = mongodb.getdb(process.env.DATABASE_NAME);
			const { _id: userId } = req.user;
			const { id } = req.params;

			if (!id) {
				return res.status(HTTP_STATUS.BAD_REQUEST).json({
					message: "ID de propuesta inválido"
				});
			}

			const proposal = await db.collection(COLLECTION_NAME_TO_APPROVE).findOne({
				_id: id
			});

			if (!proposal) {
				return res.status(HTTP_STATUS.NOT_FOUND).json({
					message: `Propuesta no encontrada`
				});
			}

			if (proposal.status !== 'pending') {
				return res.status(HTTP_STATUS.BAD_REQUEST).json({
					message: `Esta propuesta ya fue ${proposal.status === 'approved' ? 'aprobada' : 'rechazada'}`
				});
			}

			// Crear la ruta en la colección principal
			const { _id, status, proposedBy, ...routeData } = proposal;
			routeData.active = true;

			const result = await db.collection(COLLECTION_NAME).insertOne(routeData);

			// Actualizar el estado de la propuesta
			await db.collection(COLLECTION_NAME_TO_APPROVE).updateOne(
				{ _id: id },
				{
					$set: {
						status: 'approved',
						approved: {
							user: userId,
							date: currentDate
						},
						routeId: result.insertedId
					}
				}
			);

			res.status(HTTP_STATUS.OK).json({
				message: "Propuesta aprobada exitosamente",
				data: {
					_id: result.insertedId,
					...routeData
				}
			});
		} catch (error) {
			res.status(HTTP_STATUS.INTERNAL_ERROR).json({
				message: "Error al aprobar la propuesta",
				error: error.message
			});
		}
	},

	rejectProposal: async (req, res) => {
		try {
			const db = mongodb.getdb(process.env.DATABASE_NAME);
			const { _id: userId } = req.user;
			const { id } = req.params;
			const { reason, currentDate } = req.body;

			if (!id) {
				return res.status(HTTP_STATUS.BAD_REQUEST).json({
					message: "ID de propuesta inválido"
				});
			}

			const proposal = await db.collection(COLLECTION_NAME_TO_APPROVE).findOne({
				_id: id
			});

			if (!proposal) {
				return res.status(HTTP_STATUS.NOT_FOUND).json({
					message: `Propuesta no encontrada`
				});
			}

			if (proposal.status !== 'pending') {
				return res.status(HTTP_STATUS.BAD_REQUEST).json({
					message: `Esta propuesta ya fue ${proposal.status === 'approved' ? 'aprobada' : 'rechazada'}`
				});
			}

			// Actualizar el estado de la propuesta
			await db.collection(COLLECTION_NAME_TO_APPROVE).updateOne(
				{ _id: id },
				{
					$set: {
						status: 'rejected',
						rejected: {
							user: userId,
							date: currentDate
						},
						rejectionReason: reason || 'No especificado'
					}
				}
			);

			res.status(HTTP_STATUS.OK).json({
				message: "Propuesta rechazada exitosamente"
			});
		} catch (error) {
			res.status(HTTP_STATUS.INTERNAL_ERROR).json({
				message: "Error al rechazar la propuesta",
				error: error.message
			});
		}
	},

	updateProposal: async (req, res) => {
		try {
			const db = mongodb.getdb(process.env.DATABASE_NAME);
			const { _id: userId } = req.user;
			const { id } = req.params;
			const { from, to, type, schedule, color, description, landmarks, path, currentDate } = req.body;
			if (!id) {
				return res.status(HTTP_STATUS.BAD_REQUEST).json({
					message: "ID de propuesta inválido"
				});
			}
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
					updated: {
						user: userId,
						date: currentDate
					}
				}
			};
			const result = await db.collection(COLLECTION_NAME_TO_APPROVE).updateOne(
				{ _id: id },
				updateDoc
			);
			if (result.matchedCount === 0) {
				return res.status(HTTP_STATUS.NOT_FOUND).json({
					message: `Propuesta no encontrada.`
				});
			}
			const updatedProposal = await db.collection(COLLECTION_NAME_TO_APPROVE).findOne({
				_id: id
			});
			res.status(HTTP_STATUS.OK).json({
				message: "Propuesta actualizada exitosamente",
				data: updatedProposal
			});
		} catch (error) {
			res.status(HTTP_STATUS.INTERNAL_ERROR).json({
				message: "Error al actualizar la propuesta",
				error: error.message
			});
		}
	},

	delete: async (req, res) => {
		try {
			const db = mongodb.getdb(process.env.DATABASE_NAME);
			const { _id: userId } = req.user;
			// El ID viene en el cuerpo de la solicitud (req.body) ya como ObjectId
			// gracias al middleware models.delete en route.model.js.
			const { id, currentDate } = req.body;

			const updateDoc = {
				$set: {
					// Lógica de Soft Delete: Desactiva la ruta
					active: false,
					updated: {
						user: userId,
						date: currentDate
					}
				}
			};

			const result = await db.collection(COLLECTION_NAME).updateOne(
				{ _id: id },
				updateDoc
			);

			if (result.matchedCount === 0) {
				return res.status(HTTP_STATUS.NOT_FOUND).json({
					message: `Ruta no encontrada para desactivar.`
				});
			}

			res.status(HTTP_STATUS.OK).json({
				message: "Ruta desactivada exitosamente (Soft Delete)"
			});

		} catch (error) {
			res.status(HTTP_STATUS.INTERNAL_ERROR).json({
				message: "Error al desactivar la ruta",
				error: error.message
			});
		}
	}
};

module.exports = { controller };