const { body, param } = require('express-validator');
const { expressCustom } = require('../../utils/customValidators');


const models = {
    create: [
        body('name').notEmpty().isString(),
        body('type').notEmpty().isString(),
        body('path')
            .notEmpty()
            .isObject()
            .custom(expressCustom.isGeoJSONLineString),
        body('color').optional().isString(),
        body('description').optional().isString(),
        body('landmarks').optional().isArray(),
        body('active').optional().isBoolean(),
    ],

    update: [
        param('id')
            .notEmpty()
            .isMongoId(),
        body('name').notEmpty().isString(),
        body('type').notEmpty().isString(),
        body('path')
            .notEmpty()
            .isObject()
            .custom(isGeoJSONLineString),
        body('color').optional().isString(),
        body('description').optional().isString(),
        body('landmarks').optional().isArray(),
        body('active').optional().isBoolean(),
    ]
};

module.exports = { models };