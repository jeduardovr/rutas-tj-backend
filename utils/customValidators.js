const moment = require('moment-timezone');
const expressCustom = {
    isGeoJSONLineString: (pathValue, { req }) => {
        if (!pathValue) {
            return true;
        }

        if (pathValue.type !== 'LineString' || !Array.isArray(pathValue.coordinates) || pathValue.coordinates.length < 2) {
            throw new Error('Formato de path inválido o incompleto.');
        }

        return true;
    },
    currentDate: (value, { req }) => {
        return moment.tz("America/Tijuana").toDate()
    },
};

module.exports = { expressCustom };
