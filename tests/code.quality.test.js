const fs = require('fs');
const path = require('path');

describe('🔍 Code Quality - Detect Typos and Errors', () => {

    describe('user.route.js - Method Names', () => {
        it('should NOT contain "verifySessiona" typo', () => {
            const filePath = path.join(__dirname, '../modules/user/user.route.js');
            const fileContent = fs.readFileSync(filePath, 'utf8');

            // ❌ Este test FALLA si encuentra "verifySessiona"
            expect(fileContent).not.toContain('verifySessiona');
        });

        it('should contain correct "verifySession" method name', () => {
            const filePath = path.join(__dirname, '../modules/user/user.route.js');
            const fileContent = fs.readFileSync(filePath, 'utf8');

            // ✅ Este test PASA si encuentra "verifySession" (correcto)
            expect(fileContent).toContain('controller.verifySession');
        });
    });

    describe('Common Typos Detection', () => {
        it('should not have doubled letters in controller methods', () => {
            const filePath = path.join(__dirname, '../modules/user/user.route.js');
            const fileContent = fs.readFileSync(filePath, 'utf8');

            // Detecta typos comunes como: loginnn, registerrr, etc.
            const commonTypos = [
                'verifySessiona',
                'verifySessionnn',
                'loginnn',
                'registerrr',
                'googleLoginn'
            ];

            commonTypos.forEach(typo => {
                expect(fileContent).not.toContain(typo);
            });
        });
    });

    describe('route.route.js - Method Names', () => {
        it('should not have undefined controller methods', () => {
            const filePath = path.join(__dirname, '../modules/route/route.route.js');
            const fileContent = fs.readFileSync(filePath, 'utf8');

            // Detecta typos en route controller
            const typos = [
                'getAlll',
                'getByIdd',
                'proposee',
                'approvee',
                'rejectt'
            ];

            typos.forEach(typo => {
                expect(fileContent).not.toContain(typo);
            });
        });
    });

    describe('📝 File Consistency Check', () => {
        it('all route files should have matching controller exports', () => {
            // Lista de controladores y sus rutas
            const modules = [
                {
                    controller: '../modules/user/user.controller.js',
                    route: '../modules/user/user.route.js',
                    requiredMethods: ['register', 'login', 'googleLogin', 'verifySession']
                }
            ];

            modules.forEach(module => {
                const routeContent = fs.readFileSync(
                    path.join(__dirname, module.route),
                    'utf8'
                );

                module.requiredMethods.forEach(method => {
                    // Verifica que cada método requerido esté en el archivo de rutas
                    expect(routeContent).toContain(`controller.${method}`);
                });
            });
        });
    });
});
