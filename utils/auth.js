/**
 * Utilidades de autenticación
 */
const jwt = require('jsonwebtoken');
const CryptoJS = require("crypto-js");
const { AUTH } = require('../utils/constants');

/**
 * Valida las credenciales del usuario
 * @param {string} email - Correo de usuario
 * @param {string} password - Contraseña
 * @param {Object} db - Instancia de base de datos
 * @param {string} collectionName - Nombre de la colección
 * @returns {Promise<Object>} Usuario encontrado
 * @throws {Error} Si las credenciales son inválidas
 */
const validateCredentials = async (email, password = '', db, collectionName, isGoogle = false) => {
    const user = await db.collection(collectionName).aggregate([
        {
            $match: {
                email
            }
        },
        {
            $lookup: {
                from: 'roles',
                localField: 'roleId',
                foreignField: '_id',
                as: 'role'
            }
        },
        {
            $unwind: '$role'
        },
        {
            $project: {
                _id: 1,
                name: 1,
                email: 1,
                active: 1,
                role: { name: 1, routes: 1 },
            }
        }
    ]).next();

    if (!user) {
        throw new Error('USER_DOESNT_EXIST');
    }

    if (!isGoogle) {
        const passwordHash = CryptoJS.SHA256(String(password)).toString();

        if (user.password !== passwordHash) {
            throw new Error('INVALID_CREDENTIALS');
        }
    }

    return user;
};

const validateGoogleCredentials = async (email, password, db, collectionName) => {
    const user = await db.collection(collectionName).aggregate([
        {
            $match: {
                email
            }
        },
        {
            $lookup: {
                from: 'roles',
                localField: 'roleId',
                foreignField: '_id',
                as: 'role'
            }
        }
    ]);

    if (!user) {
        throw new Error('INVALID_CREDENTIALS');
    }

    const passwordHash = CryptoJS.SHA256(String(password)).toString();

    if (user.password !== passwordHash) {
        throw new Error('INVALID_CREDENTIALS');
    }

    return user;
};

/**
 * Genera un token JWT para el usuario
 * @param {Object} user - Objeto de usuario
 * @returns {string} Token JWT
 */
const generateAuthToken = (user) => {
    // Manejar tanto roleId (ObjectId) como role (objeto con _id)
    const roleId = user.roleId || (user.role && user.role._id) || user.role;

    const tokenData = {
        user: user._id,
        role: roleId
    };

    return jwt.sign(tokenData, process.env.SECRET_KEY, {
        expiresIn: AUTH.TOKEN_EXPIRY
    });
};

/**
 * Hashea una contraseña
 * @param {string} password - Contraseña a hashear
 * @returns {string} Hash de la contraseña
 */
const hashPassword = (password) => {
    return CryptoJS.SHA256(String(password)).toString();
};

module.exports = {
    validateCredentials,
    generateAuthToken,
    hashPassword
};
