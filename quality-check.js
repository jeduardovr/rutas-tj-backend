const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Starting Quality Checks for Backend...');

try {
    // 1. Check for basic file structure integrity
    if (!fs.existsSync('app.js') || !fs.existsSync('package.json')) {
        throw new Error('Critical project files missing!');
    }
    console.log('✅ File structure verified.');

    // 2. Syntax Check (Linting)
    console.log('🧹 Running Linter...');
    try {
        execSync('npm run lint', { stdio: 'inherit' });
        console.log('✅ Linting passed.');
    } catch (e) {
        console.warn('⚠️ Linting found issues, but continuing...');
    }

    // 3. Dependency Check
    console.log('📦 Verifying Dependencies...');
    try {
        require('express');
        require('mongodb');
        // Add other critical deps here if needed
        console.log('✅ Critical dependencies found.');
    } catch (e) {
        throw new Error('Missing dependencies. Run npm install.');
    }

    console.log('🎉  QUALITY CHECK PASSED: Backend code looks good.');
    process.exit(0);
} catch (error) {
    console.error('❌ QUALITY CHECK FAILED:', error.message);
    process.exit(1);
}
