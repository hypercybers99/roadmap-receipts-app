import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const forbidden = [
  'linear-gradient',
  'radial-gradient',
  'conic-gradient',
  'backdrop-blur',
  'glassmorphism',
  'bg-gradient-',
];

function collectFiles(dir) {
  const results = [];
  for (const f of fs.readdirSync(dir)) {
    if (f === 'node_modules' || f === '.git' || f === 'dist') continue;
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results.push(...collectFiles(full));
    } else if (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.css') || f.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

const files = collectFiles(path.join(rootDir, 'src'));
let violations = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((lineText, idx) => {
    for (const f of forbidden) {
      if (lineText.includes(f)) {
        console.error(`FORBIDDEN VISUAL STYLING: "${f}" in ${path.relative(rootDir, file)}:${idx + 1}`);
        violations++;
      }
    }
  });
}

if (violations > 0) {
  console.error(`Scan failed: ${violations} forbidden visual styles found!`);
  process.exit(1);
} else {
  console.log('Visual identity scan passed: 0 gradients, 0 glassmorphism.');
}
