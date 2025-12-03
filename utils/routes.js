module.exports = function (app) {
    app.use("/route", require('../modules/route/route.route'));
    app.use("/user", require('../modules/user/user.route'));
}