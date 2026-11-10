import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const bannedWords = [
  'testnet',
  'unanimous',
  'tamper-proof',
  'cryptographic proof',
  'tamper',
  'tampered',
  'tampering',
  'autonomous',
  'revolutionary',
  'bytecode',
  'Live',
];

function collectFiles(dir) {
  const results = [];
  for (const f of fs.readdirSync(dir)) {
    if (f === 'node_modules' || f === '.git' || f === 'dist' || f === 'contracts' || f === 'test-results') continue;
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results.push(...collectFiles(full));
    } else if (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.mjs') || f.endsWith('.md') || f.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

const files = collectFiles(rootDir);
let violations = 0;

for (const file of files) {
  if (file.includes('scan_banned.mjs') || file.includes('scans.test.ts') || file.includes('package-lock.json')) continue;
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((lineText, idx) => {
    // Skip code/comment declarations of the list itself
    if (lineText.includes('bannedWords') || lineText.includes("'bytecode'") || lineText.includes('"bytecode"') || lineText.includes("'Live'") || lineText.includes('"Live"')) return;

    for (const w of bannedWords) {
      if (w === 'Live') {
        if (/\bLive\b/.test(lineText)) {
          console.error(`BANNED WORD: "Live" in ${path.relative(rootDir, file)}:${idx + 1}`);
          violations++;
        } else if (/\blive\b/.test(lineText) && !lineText.trim().startsWith('//') && !lineText.trim().startsWith('*')) {
          console.error(`BANNED WORD: "live" in user-facing text in ${path.relative(rootDir, file)}:${idx + 1}`);
          violations++;
        }
      } else {
        const regex = new RegExp(`\\b${w}\\b`, 'i');
        if (regex.test(lineText)) {
          // Allow literal 'FINALIZED' or 'finalized' ONLY when referring directly to status_name property
          if (w.toLowerCase() === 'finalized' && (lineText.includes('status_name') || lineText.includes('FINALIZED'))) {
            return;
          }
          console.error(`BANNED WORD: "${w}" in ${path.relative(rootDir, file)}:${idx + 1}`);
          violations++;
        }
      }
    }
  });
}

if (violations > 0) {
  console.error(`Scan failed: ${violations} banned word occurrences found!`);
  process.exit(1);
} else {
  console.log('Banned words scan passed: 0 occurrences.');
}
