// Pre-compile all .jsx files in function-plane/src/ to .js next to them.
// Runtime Babel transforms (`<script type="text/babel" src="...">`) work in
// Chrome but are unreliable in the Capacitor Android WebView — Babel-standalone
// XHR-fetches each script and eval's it, which silently fails on some Android
// versions. Shipping pre-compiled JS removes that dependency.
//
// Run: node scripts/build-jsx.js
const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const srcDir = path.join(__dirname, '..', 'function-plane', 'src');
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  const inPath = path.join(srcDir, file);
  const outPath = path.join(srcDir, file.replace(/\.jsx$/, '.js'));
  const code = fs.readFileSync(inPath, 'utf8');
  const result = babel.transformSync(code, {
    presets: [['@babel/preset-react', { runtime: 'classic' }]],
    babelrc: false,
    configFile: false,
    filename: file,
  });
  fs.writeFileSync(outPath, result.code);
  console.log(`built ${file} -> ${path.basename(outPath)}`);
}

console.log(`\nCompiled ${files.length} JSX files.`);
