var helmet = require('helmet');
var express = require('express');
const fileUpload = require('express-fileupload');
var cors = require('cors');
const { mongodb } = require('./mongoConfig');

module.exports = function (app) {
    app.use(cors());
    app.use(helmet());

    app.use(fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
    }));

    app.use(express.urlencoded({ limit: '350mb', extended: true }));
    app.use(express.json({ limit: '350mb', extended: true }));

    app.use(mongodb.validConnection);
}