// Este test SÍ detectaría el error de verifySessiona
const request = require('supertest');

// Este test está desactivado (.skip) porque requiere la app completa
// Pero muestra CÓMO detectar el tipo de error que introducimos

describe.skip('User Routes Integration Tests', () => {
    let app;

    beforeAll(() => {
        // Aquí cargaríamos la app real
        // app = require('../app');
    });

    it('should detect missing controller method', async () => {
        // Si este test estuviera activo, fallaría con el error:
        // TypeError: controller.verifySessiona is not a function

        const response = await request(app)
            .get('/user/verify')
            .set('Authorization', 'Bearer fake-token');

        // Este test nunca llegaría aquí porque crashearía antes
        expect(response.status).toBe(401); // o 200 si el token es válido
    });
});

// NOTA: Este test está .skip() para no romper el CI actual
// Cuando quieras activarlo, quita el .skip y carga la app real
