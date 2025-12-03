const { validateFieldsExpress } = require('./validateExpress');
const { token } = require("./validateToken");

global._validtoken = token.valid;
global._validexpress = validateFieldsExpress;