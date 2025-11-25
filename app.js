process.loadEnvFile()

require('./utils/config');
require("./utils/global");

const express = require('express');

const { mongodb } = require('./utils/mongoConfig');
const { errorHandler, notFoundHandler } = require('./utils/errorHandler');

const app = express();
const SERVER_APP = require('http').Server(app);

require('./utils/config')(app);
require('./utils/routes')(app);

// Middleware para rutas no encontradas (debe ir DESPUÉS de las rutas)
app.use(notFoundHandler);

// Middleware global de errores (debe ir al FINAL)
app.use(errorHandler);

SERVER_APP.listen(process.env.PORT, async (err) => {
    console.clear()
    console.log('\x1b[33m%s\x1b[0m', "INITIALIZED SERVER ON PORT: " + process.env.PORT);
    if (err) {
        console.log(err);
    }

    await mongodb.connect();
});
