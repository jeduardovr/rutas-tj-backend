const { ObjectId } = require('../../utils/mongoConfig');
const { body, param } = require('express-validator');
const { expressCustom } = require('../../utils/customValidators');
const moment = require('moment-timezone');


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
        body('currentDate').customSanitizer(expressCustom.currentDate)
    ],

    update: [
        param('id').notEmpty().custom(value => ObjectId.isValid(value)).bail().customSanitizer(value => new ObjectId(value)),
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
        body('currentDate').customSanitizer(expressCustom.currentDate)
    ],

    propose: [
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
        body('currentDate').customSanitizer(expressCustom.currentDate)
    ],

    approveProposal: [
        body('id').notEmpty().custom(value => ObjectId.isValid(value)).bail().customSanitizer(value => new ObjectId(value)),
        body('currentDate').customSanitizer(expressCustom.currentDate)
    ],

    rejectProposal: [
        body('id').notEmpty().custom(value => ObjectId.isValid(value)).bail().customSanitizer(value => new ObjectId(value)),
        body('currentDate').customSanitizer(expressCustom.currentDate)
    ],

    delete: [
        body('id').notEmpty().custom(value => ObjectId.isValid(value)).bail().customSanitizer(value => new ObjectId(value))
    ]
};

module.exports = { models };