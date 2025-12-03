const { mongodb, ObjectId } = require('../../utils/mongoConfig');

const functions = {
    dataToken: async (userId) => {
        let data;

        try {
            const database = await mongodb.getdb(process.env.DATABASE_NAME);

            data = await database.collection('user').aggregate([
                { $match: { _id: new ObjectId(userId) } },
                {
                    $lookup: {
                        from: "role",
                        let: { id: "$roleId" },
                        pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$id"] } } }],
                        as: "rolData"
                    }
                }
            ]).next();

            if (!data) {
                throw new Error('Usuario no encontrado');
            }
        } catch (error) {
            console.error('Error en dataTokenOptimized:', error);
            throw error;
        }

        return data;
    }
}

module.exports = { functions };