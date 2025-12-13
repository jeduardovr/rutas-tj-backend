const { body } = require('express-validator');

const models = {
    createPost: [
        body('content').notEmpty().isString().trim().isLength({ min: 1, max: 1000 }).withMessage('El contenido debe tener entre 1 y 1000 caracteres'),
    ],
    replyPost: [
        body('content').notEmpty().isString().trim().isLength({ min: 1, max: 500 }).withMessage('El comentario debe tener entre 1 y 500 caracteres'),
    ]
};

module.exports = { models };
