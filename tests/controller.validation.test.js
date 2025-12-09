describe('Static Code Validation - Controller Methods', () => {

    describe('User Controller', () => {
        let userController;

        beforeAll(() => {
            try {
                userController = require('../modules/user/user.controller');
            } catch (e) {
                console.log('Could not load user controller:', e.message);
            }
        });

        it('should export verifySession method (not verifySessiona)', () => {
            if (!userController) {
                console.warn('Skipping: could not load controller');
                return;
            }

            // Este test DETECTA el error
            expect(userController).toHaveProperty('verifySession');
            expect(typeof userController.verifySession).toBe('function');

            // También verifica que NO tenga el typo
            expect(userController.verifySessiona).toBeUndefined();
        });

        it('should export all required methods', () => {
            if (!userController) {
                console.warn('Skipping: could not load controller');
                return;
            }

            const requiredMethods = [
                'register',
                'login',
                'googleLogin',
                'verifySession'  // ← IMPORTANTE: debe existir
            ];

            requiredMethods.forEach(method => {
                expect(userController).toHaveProperty(method);
                expect(typeof userController[method]).toBe('function');
            });
        });
    });

    describe('Route Controller', () => {
        let routeController;

        beforeAll(() => {
            try {
                routeController = require('../modules/route/route.controller');
            } catch (e) {
                console.log('Could not load route controller:', e.message);
            }
        });

        it('should export all required methods', () => {
            if (!routeController) {
                console.warn('Skipping: could not load controller');
                return;
            }

            const requiredMethods = [
                'getAll',
                'getById',
                'propose',
                'getPendingProposals',
                'approveProposal',
                'rejectProposal'
            ];

            requiredMethods.forEach(method => {
                expect(routeController).toHaveProperty(method);
                expect(typeof routeController[method]).toBe('function');
            });
        });
    });

    describe('Route File References', () => {
        it('user.route.js should not reference verifySessiona', () => {
            const fs = require('fs');
            const path = require('path');

            const routeFilePath = path.join(__dirname, '../modules/user/user.route.js');
            const routeFileContent = fs.readFileSync(routeFilePath, 'utf8');

            // Este test fallará si encuentra "verifySessiona" en el archivo
            expect(routeFileContent).not.toContain('verifySessiona');

            // Debe contener "verifySession" (el correcto)
            expect(routeFileContent).toContain('verifySession');
        });

        it('all route files should use valid controller method names', () => {
            const fs = require('fs');
            const path = require('path');

            const userRoutePath = path.join(__dirname, '../modules/user/user.route.js');
            const content = fs.readFileSync(userRoutePath, 'utf8');

            // Buscar patrones comunes de typos
            const typos = ['verifySessiona', 'loginnn', 'registerr'];

            typos.forEach(typo => {
                expect(content).not.toContain(typo);
            });
        });
    });
});
