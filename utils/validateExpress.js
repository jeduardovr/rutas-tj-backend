const { validationResult } = require('express-validator');

const validateFieldsExpress = (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).send({ message: "The filds required is not completed in: " + req.url, error: error.mapped() });
    }
    next();
}

module.exports = { validateFieldsExpress }