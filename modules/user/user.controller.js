const { mongodb, ObjectId } = require('../../utils/mongoConfig');
const { HTTP_STATUS } = require('../../utils/constants');
const CryptoJS = require("crypto-js");
const { validateCredentials, generateAuthToken, hashPassword } = require('../../utils/auth');

const COLLECTION_NAME = 'user';
const SECRET_KEY = process.env.SECRET_KEY;

const controller = {
    register: async (req, res) => {
        try {
            const db = mongodb.getdb(process.env.DATABASE_NAME);
            const { email, password, name } = req.body;

            const existingUser = await db.collection(COLLECTION_NAME).findOne({ email });
            if (existingUser) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "El correo ya está registrado" });
            }

            const hashedPassword = CryptoJS.SHA256(password).toString();

            const newUser = {
                email,
                password: hashedPassword,
                name,
                role: 'user',
                active: true,
                createdAt: new Date()
            };

            const result = await db.collection(COLLECTION_NAME).insertOne(newUser);

            const tokenData = {
                _id: result.insertedId,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role
            };
            const token = CryptoJS.AES.encrypt(JSON.stringify(tokenData), SECRET_KEY).toString();

            res.status(HTTP_STATUS.CREATED).json({
                message: "Usuario registrado exitosamente",
                token,
                user: tokenData
            });
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_ERROR).json({ message: "Error al registrar usuario", error: error.message });
        }
    },

    login: async (req, res) => {
        try {
            const db = mongodb.getdb(process.env.DATABASE_NAME);
            const { email, password } = req.body;

            const user = await validateCredentials(email, password, db, COLLECTION_NAME);
            if (!user || !user.active) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Credenciales inválidas" });
            }

            const token = generateAuthToken(user);

            res.status(HTTP_STATUS.OK).json({
                message: "Login exitoso",
                token,
                user: {
                    name: user.name

                }
            });
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_ERROR).json({ message: "Error al iniciar sesión", error: error.message });
        }
    },

    googleLogin: async (req, res) => {
        try {
            const db = mongodb.getdb(process.env.DATABASE_NAME);
            const { credential } = req.body;

            const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
            if (!googleRes.ok) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Token de Google inválido" });
            }
            const googleData = await googleRes.json();
            const { email, name, sub: googleId } = googleData;

            let user = await db.collection(COLLECTION_NAME).findOne({ email });

            if (!user) {
                const newUser = {
                    email,
                    name,
                    googleId,
                    role: 'user',
                    active: true,
                    createdAt: new Date(),
                    authType: 'google'
                };
                const result = await db.collection(COLLECTION_NAME).insertOne(newUser);
                user = { ...newUser, _id: result.insertedId };
            } else {
                if (!user.googleId) {
                    await db.collection(COLLECTION_NAME).updateOne({ _id: user._id }, { $set: { googleId, authType: 'google' } });
                }
            }

            if (!user.active) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Usuario inactivo" });
            }

            const tokenData = {
                _id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            };
            const token = CryptoJS.AES.encrypt(JSON.stringify(tokenData), SECRET_KEY).toString();

            res.status(HTTP_STATUS.OK).json({
                message: "Login con Google exitoso",
                token,
                user: tokenData
            });

        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_ERROR).json({ message: "Error en Google Login", error: error.message });
        }
    }
};

module.exports = { controller };
