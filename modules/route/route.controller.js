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

            const amenities = await db.collection(COLLECTION_NAME)
                .find(filter)
                .skip(skip)
                .limit(limit)
                .toArray();

            const total = await db.collection(COLLECTION_NAME).countDocuments(filter);
            const response = buildPaginatedResponse(amenities, page, limit, total);

            res.status(HTTP_STATUS.OK).json(response);
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_ERROR).json({ message: "Error al obtener amenidades", error: error.message });
        }
    }
};

module.exports = { controller };