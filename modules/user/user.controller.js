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
                if (existingUser.authType === 'google') {
                    return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Este correo está registrado con Google. Por favor inicia sesión con Google." });
                }
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "El correo ya está registrado" });
            }

            const hashedPassword = CryptoJS.SHA256(password).toString();

            const newUser = {
                email,
                password: hashedPassword,
                name,
                role: 'user',
                active: true,
                createdAt: new Date(),
                authType: 'email'
            };

            const result = await db.collection(COLLECTION_NAME).insertOne(newUser);

            // Crear el usuario completo con el _id generado
            const userWithId = {
                ...newUser,
                _id: result.insertedId
            };

            // Generar token JWT (igual que en login)
            const token = generateAuthToken(userWithId);

            res.status(HTTP_STATUS.CREATED).json({
                message: "Usuario registrado exitosamente",
                token,
                user: {
                    _id: result.insertedId,
                    email: newUser.email,
                    name: newUser.name,
                    role: newUser.role
                }
            });
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_ERROR).json({ message: "Error al registrar usuario", error: error.message });
        }
    },

    login: async (req, res) => {
        try {
            const db = mongodb.getdb(process.env.DATABASE_NAME);
            const { email, password } = req.body;

            // 1. Verificar si el usuario existe
            const existingUser = await db.collection(COLLECTION_NAME).findOne({ email });

            if (!existingUser) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "No existe una cuenta con este correo. Por favor regístrate primero." });
            }

            // 2. Verificar el tipo de autenticación
            if (existingUser.authType === 'google') {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Este usuario se registró con Google. Por favor usa el botón de Google." });
            }

            // 3. Validar contraseña
            const user = await validateCredentials(email, password, db, COLLECTION_NAME);
            console.log(user);

            if (!user) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Credenciales inválidas" });
            }

            if (!user.active) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "No tiene permisos para ingresar." });
            }

            const token = generateAuthToken(user);

            res.status(HTTP_STATUS.OK).json({
                message: "Login exitoso",
                token,
                user: {
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    _id: user._id
                }
            });
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_ERROR).json({ message: "Error al iniciar sesión", error: error.message });
        }
    },

    googleLogin: async (req, res) => {
        try {
            const db = mongodb.getdb(process.env.DATABASE_NAME);
            const { credential, mode } = req.body;

            const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
            if (!googleRes.ok) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Token de Google inválido" });
            }
            const googleData = await googleRes.json();
            const { email, name, sub: googleId } = googleData;

            const user = await validateCredentials(email, '', db, COLLECTION_NAME, true);
            console.log(user);

            // Lógica para MODO LOGIN
            if (mode === 'login') {
                if (!user) {
                    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "No existe una cuenta con este correo. Por favor regístrate primero." });
                }

                if (user.authType === 'email' || (!user.authType && user.password)) {
                    return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Este correo está registrado con contraseña. Usa tu contraseña para entrar." });
                }

                if (!user.googleId) {
                    await db.collection(COLLECTION_NAME).updateOne({ _id: user._id }, { $set: { googleId, authType: 'google' } });
                }
            }
            // Lógica para MODO REGISTRO
            else if (mode === 'register') {
                if (user) {
                    if (user.authType === 'google') {
                        return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Ya tienes una cuenta de Google. Por favor inicia sesión." });
                    } else {
                        return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Este correo ya está registrado con contraseña. Inicia sesión." });
                    }
                }

                // Crear usuario nuevo solo en modo registro
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
                // Fallback por si no se envía modo (comportamiento anterior o error)
                // Para mantener compatibilidad, si no hay modo, asumimos login/registro automático PERO
                // dado el requerimiento estricto, mejor rechazamos o asumimos login por seguridad.
                // Asumiremos LOGIN por defecto si no se especifica.
                if (!user) {
                    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "No existe una cuenta con este correo. Por favor regístrate." });
                }
            }

            if (!user.active) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "No tiene permisos para ingresar." });
            }

            // Generar token JWT (igual que en login normal)
            const token = generateAuthToken(user);

            res.status(HTTP_STATUS.OK).json({
                message: `Google ${mode === 'register' ? 'Registro' : 'Login'} exitoso`,
                token,
                user: {
                    _id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            });

        } catch (error) {
            console.log(error);

            res.status(HTTP_STATUS.INTERNAL_ERROR).json({ message: "Error en Google Login", error: error.message });
        }
    },

    verifySession: async (req, res) => {
        try {
            // El middleware token.valid ya validó el token y puso el usuario en req.user
            // Si llegamos aquí, el token es válido y el usuario existe y está activo (si validateToken valida active status)
            // validateToken usa functions.dataToken, verifiquemos si valida active status allí. 
            // Si validateToken solo decodifica, entonces req.user puede ser solo el payload o el usuario de DB.
            // Mirando validateToken.js: req.user = dataUser; donde dataUser = await functions.dataToken(tokenData.user);

            // Asumimos que dataToken devuelve el usuario completo.
            const user = req.user;

            res.status(HTTP_STATUS.OK).json({
                valid: true,
                user: {
                    _id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            });
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_ERROR).json({ message: "Error verificando sesión", error: error.message });
        }
    }
};

module.exports = { controller };
