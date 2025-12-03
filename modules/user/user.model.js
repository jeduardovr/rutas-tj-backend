const { body } = require('express-validator');

const models = {
    register: [
        body('email').notEmpty().isEmail().normalizeEmail(),
        body('password').notEmpty().isString().isLength({ min: 6 }),
        body('name').notEmpty().isString(),
    ],
    login: [
        body('email').notEmpty().isEmail().normalizeEmail(),
        body('password').notEmpty().isString(),
    ],
    google: [
        body('credential').notEmpty().isString(),
    ]
};

module.exports = { models };
