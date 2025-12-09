// Setup global test configuration
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/rutas-tj-test';

// Global timeout for async operations
jest.setTimeout(10000);

// Mock console methods in tests to reduce noise
global.console = {
    ...console,
    // Uncomment to suppress console output during tests
    // log: jest.fn(),
    // error: jest.fn(),
    // warn: jest.fn(),
};
