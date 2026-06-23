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

// Copy design-system folder recursively
const dsSrc = path.join('src', 'design-system');
const dsDst = path.join('dist', 'design-system');

if (fs.existsSync(dsSrc)) {
  if (fs.existsSync(dsDst)) {
    try { fs.rmSync(dsDst, { recursive: true, force: true }); } catch (e) {}
  }
  copyDir(dsSrc, dsDst);
}

function copyDir(src, dst) {
  if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const sp = path.join(src, entry.name);
    const dp = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDir(sp, dp);
    } else {
      try { fs.copyFileSync(sp, dp); } catch (e) {}
    }
  }
}

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