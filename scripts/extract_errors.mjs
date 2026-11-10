import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const rlCode = fs.readFileSync(path.join(rootDir, 'contracts/RoadmapLedger.py'), 'utf8');
const tgCode = fs.readFileSync(path.join(rootDir, 'contracts/TrancheGate.py'), 'utf8');

function extractErrors(content) {
  const lines = content.split('\n');
  const errors = [];
  lines.forEach((line, idx) => {
    if (line.includes('raise gl.vm.UserError')) {
      const match = line.match(/raise\s+gl\.vm\.UserError\((?:f?["'])([^"'\n]+)/);
      if (match) {
        errors.push({ line: idx + 1, raw: match[1].trim() });
      }
    }
  });
  return errors;
}

const rl = extractErrors(rlCode);
const tg = extractErrors(tgCode);

const uniqueRL = Array.from(new Set(rl.map(e => e.raw))).sort();
const uniqueTG = Array.from(new Set(tg.map(e => e.raw))).sort();

console.log(`Unique RoadmapLedger templates (${uniqueRL.length}):`);
uniqueRL.forEach((t, i) => console.log(`  ${i + 1}. "${t}"`));

console.log(`\nUnique TrancheGate templates (${uniqueTG.length}):`);
uniqueTG.forEach((t, i) => console.log(`  ${i + 1}. "${t}"`));

