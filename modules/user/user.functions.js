const { mongodb, ObjectId } = require('../../utils/mongoConfig');

const functions = {
    dataToken: async (userId) => {
        let data;

        try {
            const database = await mongodb.getdb(process.env.DATABASE_NAME);

            // Usar la misma lógica de lookup que en auth.js
            data = await database.collection('user').aggregate([
                { $match: { _id: new ObjectId(userId) } },
                {
                    $lookup: {
                        from: 'roles',
                        localField: 'roleId',
                        foreignField: '_id',
                        as: 'role'
                    }
                },
                {
                    $unwind: {
                        path: '$role',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        email: 1,
                        active: 1,
                        role: 1, // Retornar el objeto role completo o lo que necesite el front
                        authType: 1
                    }
                }
            ]).next();

            if (!data) {
                console.error(`Usuario no encontrado en dataToken. ID: ${userId}`);
                throw new Error('Usuario no encontrado');
            }
        } catch (error) {
            console.error('Error en dataToken:', error);
            throw error;
        }

        return data;
    }
}

module.exports = { functions };