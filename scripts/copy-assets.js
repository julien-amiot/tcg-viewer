const fs = require('fs');
const path = require('path');

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// Copy HTML and CSS files (skip on error)
const p = ['src/index.html', 'src/design-system.html', 'src/styles.css'];
p.forEach(f => {
  try {
    fs.copyFileSync(f, f.replace('src/', 'dist/'));
  } catch (e) {
    // skip
  }
});

// Copy design-system: consolidate all CSS into a single index.css to avoid
// locked-directory issues with subdirectories.
const dsSrc = path.join('src', 'design-system');
const dsDst = path.join('dist', 'design-system');

if (fs.existsSync(dsSrc)) {
  // Remove old dist/design-system (skip on error — may be locked)
  try { fs.rmSync(dsDst, { recursive: true, force: true }); } catch (e) {}

  // Ensure destination directory exists
  fs.mkdirSync(dsDst, { recursive: true });

  // Collect all CSS files in source order
  const cssFiles = [
    'tokens.css',
    'atoms/mana-dot.css',
    'atoms/rarity.css',
    'atoms/color-identity.css',
    'atoms/text-shadow.css',
    'atoms/typography.css',
    'molecules/card-header.css',
    'molecules/mana-cost.css',
    'molecules/card-type-row.css',
    'molecules/card-text.css',
    'molecules/card-footer.css',
    'organisms/card.css',
    'templates/card-grid.css',
    'templates/showcase.css',
  ];

  let allCss = [];
  for (const cssFile of cssFiles) {
    const cssPath = path.join(dsSrc, cssFile);
    try {
      allCss.push(fs.readFileSync(cssPath, 'utf8'));
    } catch (e) {
      console.log('[copy-assets] Warning: could not read', cssFile, e.message);
    }
  }
  fs.writeFileSync(path.join(dsDst, 'index.css'), allCss.join('\n'), 'utf8');
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