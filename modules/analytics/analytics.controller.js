const { mongodb } = require('../../utils/mongoConfig');
const { HTTP_STATUS } = require('../../utils/constants');

const COLLECTION_NAME = 'analytics_visits';

const controller = {
    recordVisit: async (req, res) => {
        try {
            const db = mongodb.getdb(process.env.DATABASE_NAME);
            const { isRegistered, path, screenWidth } = req.body;

            // Basic data for metrics
            const visitData = {
                timestamp: new Date(),
                userAgent: req.get('User-Agent'),
                isRegistered: !!isRegistered,
                path: path || '/',
                deviceType: (screenWidth && screenWidth < 768) ? 'mobile' : 'desktop'
                // We don't store full IP for privacy, just marking it as a hit
                // If unique visitors are needed, we could hash the IP
            };

            await db.collection(COLLECTION_NAME).insertOne(visitData);

            res.status(HTTP_STATUS.OK).json({ message: "Visit recorded" });
        } catch (error) {
            console.error(error);
            // Non-blocking error for client
            res.status(HTTP_STATUS.OK).json({ message: "Visit recorded (fallback)" });
        }
    },

    getDashboardStats: async (req, res) => {
        try {
            const db = mongodb.getdb(process.env.DATABASE_NAME);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // 1. Total Visits
            const totalVisits = await db.collection(COLLECTION_NAME).countDocuments({});

            // 2. Visits Today
            const visitsToday = await db.collection(COLLECTION_NAME).countDocuments({
                timestamp: { $gte: today }
            });

            // 3. Registered vs Anonymous (Total)
            const registeredUsers = await db.collection(COLLECTION_NAME).countDocuments({ isRegistered: true });
            const anonymousUsers = await db.collection(COLLECTION_NAME).countDocuments({ isRegistered: false });

            // 4. Last 7 Days (Aggregation)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
            sevenDaysAgo.setHours(0, 0, 0, 0);

            const dailyVisits = await db.collection(COLLECTION_NAME).aggregate([
                { $match: { timestamp: { $gte: sevenDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id": 1 } }
            ]).toArray();

            res.status(HTTP_STATUS.OK).json({
                totalVisits,
                visitsToday,
                userBreakdown: {
                    registered: registeredUsers,
                    anonymous: anonymousUsers
                },
                dailyVisits
            });
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_ERROR).json({ message: "Error al obtener métricas", error: error.message });
        }
    }
};

module.exports = { controller };
