const { execSync } = require('child_process');
const path = require('path');

console.log('[build] Compiling TypeScript...');
execSync('tsc --noEmit', { stdio: 'inherit' });

console.log('[build] Bundling with esbuild...');
execSync('npx esbuild src/main.ts --bundle --outfile=dist/main.js', { stdio: 'inherit' });
execSync('npx esbuild src/design-system.ts --bundle --outfile=dist/design-system.js', { stdio: 'inherit' });

console.log('[build] Copying assets...');
const copyScript = path.join(__dirname, 'copy-assets.js');
require(copyScript);

console.log('[build] Done.');