const { mongodb, ObjectId } = require('../../utils/mongoConfig');
const { getPaginationParams, buildPaginatedResponse } = require('../../utils/pagination');
const { HTTP_STATUS } = require('../../utils/constants');

const COLLECTION_NAME = 'community_posts';

const controller = {
    getAll: async (req, res) => {
        try {
            const db = mongodb.getdb(process.env.DATABASE_NAME);
            const { page, limit, skip } = getPaginationParams(req, 20); // Default 20 posts per page

            const posts = await db.collection(COLLECTION_NAME)
                .find({})
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray();

            // Enrich posts with user details if needed, or assume basic author info is embedded
            // For better performance, we'll embed minimal author info at creation

            const total = await db.collection(COLLECTION_NAME).countDocuments({});
            const response = buildPaginatedResponse(posts, page, limit, total);

            res.status(HTTP_STATUS.OK).json(response);
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_ERROR).json({ message: "Error al obtener publicaciones", error: error.message });
        }
    },

    create: async (req, res) => {
        try {
            const db = mongodb.getdb(process.env.DATABASE_NAME);
            const user = req.user; // User from token
            const { content } = req.body;

            // Fetch user basic info to embed (name, badges)
            const userInfo = await db.collection('users').findOne({ _id: new ObjectId(user._id) }, { projection: { name: 1, badges: 1 } });

            const newPost = {
                content,
                author: {
                    _id: new ObjectId(user._id),
                    name: userInfo ? userInfo.name : 'Usuario',
                    badges: userInfo ? (userInfo.badges || []) : []
                },
                createdAt: new Date(),
                replies: []
            };

            const result = await db.collection(COLLECTION_NAME).insertOne(newPost);

            res.status(HTTP_STATUS.CREATED).json({
                message: "Publicación creada exitosamente",
                data: { _id: result.insertedId, ...newPost }
            });
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_ERROR).json({ message: "Error al crear publicación", error: error.message });
        }
    },

    reply: async (req, res) => {
        try {
            const db = mongodb.getdb(process.env.DATABASE_NAME);
            const user = req.user;
            const { id } = req.params; // Post ID
            const { content } = req.body;

            if (!ObjectId.isValid(id)) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "ID de post inválido" });
            }

            // Fetch user basic info
            const userInfo = await db.collection('users').findOne({ _id: new ObjectId(user._id) }, { projection: { name: 1, badges: 1 } });

            const reply = {
                _id: new ObjectId(),
                content,
                author: {
                    _id: new ObjectId(user._id),
                    name: userInfo ? userInfo.name : 'Usuario',
                    badges: userInfo ? (userInfo.badges || []) : []
                },
                createdAt: new Date()
            };

            const result = await db.collection(COLLECTION_NAME).updateOne(
                { _id: new ObjectId(id) },
                { $push: { replies: reply } }
            );

            if (result.matchedCount === 0) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Publicación no encontrada" });
            }

            res.status(HTTP_STATUS.OK).json({
                message: "Respuesta agregada exitosamente",
                data: reply
            });
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_ERROR).json({ message: "Error al responder", error: error.message });
        }
    }
};

module.exports = { controller };
