const fs = require('fs');
const path = require('path');

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// Copy HTML and CSS files (skip on error)
const p = ['src/index.html', 'src/styles.css'];
p.forEach(f => {
  try {
    fs.copyFileSync(f, f.replace('src/', 'dist/'));
  } catch (e) {
    // skip
  }
});

// Copy CARDS folder
const cardsSrc = path.join('CARDS');
const cardsDst = path.join('dist', 'CARDS');

if (!fs.existsSync(cardsSrc)) {
  console.log('No source CARDS directory found, skipping.');
} else {
  // Remove old dist/CARDS if it exists (skip on error)
  if (fs.existsSync(cardsDst)) {
    try {
      fs.rmSync(cardsDst, { recursive: true, force: true });
    } catch (e) {
      // Might be locked - continue and copy over existing files
    }
  }

  fs.mkdirSync(cardsDst, { recursive: true });

  const items = fs.readdirSync(cardsSrc);
  for (const f of items) {
    const sp = path.join(cardsSrc, f);
    const dp = path.join(cardsDst, f);
    try {
      if (fs.statSync(sp).isDirectory()) {
        try {
          fs.mkdirSync(dp, { recursive: true });
        } catch (e) {
          // skip
        }
      } else {
        fs.copyFileSync(sp, dp);
      }
    } catch (e) {
      console.log('Skipping file:', f, e.message);
    }
  }
}

console.log('Assets copied successfully.');