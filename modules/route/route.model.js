const { body, param } = require('express-validator');
const { expressCustom } = require('../../utils/customValidators');


const models = {
    create: [
        body('from').notEmpty().isString().toUpperCase(),
        body('to').notEmpty().isString().toUpperCase(),
        body('type').notEmpty().isString(),
        body('path')
            .notEmpty()
            .isObject()
            .custom(expressCustom.isGeoJSONLineString),
        body('color').optional().isString(),
        body('description').optional().isString().toUpperCase(),
        body('landmarks').optional().isArray(),
        body('active').optional().isBoolean(),
        body('schedule').optional().isObject(),
        body('schedule.start').optional().isString().toUpperCase(),
        body('schedule.end').optional().isString().toUpperCase(),
    ],

    update: [
        param('id')
            .notEmpty()
            .isMongoId(),
        body('from').notEmpty().isString().toUpperCase(),
        body('to').notEmpty().isString().toUpperCase(),
        body('type').notEmpty().isString(),
        body('path')
            .notEmpty()
            .isObject()
            .custom(expressCustom.isGeoJSONLineString),
        body('color').optional().isString(),
        body('description').optional().isString().toUpperCase(),
        body('landmarks').optional().isArray(),
        body('active').optional().isBoolean(),
        body('schedule').optional().isObject(),
        body('schedule.start').optional().isString().toUpperCase(),
        body('schedule.end').optional().isString().toUpperCase(),
    ]
};

module.exports = { models };