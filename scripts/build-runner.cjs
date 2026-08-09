const { execSync } = require('child_process');
const fs = require('fs');

function run(cmd) {
    try {
        execSync(cmd, { stdio: 'inherit' });
    } catch (e) {
        process.exit(1);
    }
}

run('node scripts/build-frontend.cjs');
run('vite build');
try {
    fs.copyFileSync('frontend/env.js', 'frontend/dist/env.js');
} catch (e) {
    // ignore if env.js doesn't exist
}
