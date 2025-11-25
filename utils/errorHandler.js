// Middleware global de manejo de errores
const errorHandler = (err, req, res, next) => {
    // Log del error en consola (en producción usar un logger profesional)
    console.error('\x1b[31m%s\x1b[0m', '❌ Error capturado:');
    console.error(err);

    // Determinar código de estado
    const statusCode = err.statusCode || err.status || 500;

    // Preparar respuesta
    const response = {
        success: false,
        message: err.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            error: err
        })
    };

    res.status(statusCode).json(response);
};

// Middleware para rutas no encontradas
const notFoundHandler = (req, res, next) => {
    const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

module.exports = {
    errorHandler,
    notFoundHandler
};