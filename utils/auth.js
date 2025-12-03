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
const validateCredentials = async (email, password, db, collectionName) => {
    const user = await db.collection(collectionName).findOne({ email });

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
    const tokenData = {
        user: user._id,
        role: user.roleId
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
