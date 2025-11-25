module.exports = function (app) {
    app.use("/route", require('../modules/route/route.route'));
}