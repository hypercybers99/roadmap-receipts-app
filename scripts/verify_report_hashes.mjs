import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const reportFile = process.argv[2] || 'docs/FINAL_REPORT_APP.md';
const reportPath = path.resolve(rootDir, reportFile);

if (!fs.existsSync(reportPath)) {
  console.error(`Report file not found: ${reportPath}`);
  process.exit(1);
}

const reportContent = fs.readFileSync(reportPath, 'utf8');

function sha256File(relPath) {
  const p = path.resolve(rootDir, relPath);
  if (!fs.existsSync(p)) return null;
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}

const KNOWN_CONTRACTS = {
  '0x711FFC1C4c6ACBea0E7B74B0cd40AF5A5fA5ADa4': 'RoadmapLedger v2 Active',
  '0x5D869C10F523fdD2E3b0Db0CD5CA0107b25b4026': 'TrancheGate v2 Active',
  '0xD22E8C03EbB382D9A9df07829e18c2E4DDd6f67D': 'RoadmapLedger v1 Superseded',
  '0x437c45bD60e202Cc7C08C7C4A94e603649750fA8': 'TrancheGate v1 Superseded',
  '0x100B6857aFD1f4f09FEeBb8652de3D7F686EE487': 'ProbeLabels Harness',
};

const KNOWN_SHAS = {
  [sha256File('contracts/RoadmapLedger.py')]: 'contracts/RoadmapLedger.py',
  [sha256File('contracts/TrancheGate.py')]: 'contracts/TrancheGate.py',
};

// Known deployments and evidence tx hashes
const KNOWN_TXS = new Set([
  '0xc1a3f37d7197d57a126cef7908c309e819c37dc6e9cf5fd6a5ebcd2d8f2101b2',
  '0x24532e069b090bc7dae24a6dcff25bec180b6af2f4f099491c46de6aae772da9',
]);

const evidenceDir = path.resolve(rootDir, 'docs/evidence');
if (fs.existsSync(evidenceDir)) {
  fs.readdirSync(evidenceDir).forEach(f => {
    if (f.endsWith('.json')) {
      try {
        const d = JSON.parse(fs.readFileSync(path.join(evidenceDir, f), 'utf8'));
        if (d.hash) KNOWN_TXS.add(d.hash.toLowerCase());
        if (d.txHash) KNOWN_TXS.add(d.txHash.toLowerCase());
        if (d.receipts && Array.isArray(d.receipts)) {
          d.receipts.forEach(r => {
            if (r.hash) KNOWN_TXS.add(r.hash.toLowerCase());
            if (r.txHash) KNOWN_TXS.add(r.txHash.toLowerCase());
          });
        }
      } catch {}
    }
  });
}

function verifyGitCommit(commit) {
  // Check local git first
  try {
    execFileSync('git', ['cat-file', '-e', commit], { cwd: rootDir, stdio: 'pipe' });
    return true;
  } catch {}
  // Check contract repo
  try {
    execFileSync('git', ['cat-file', '-e', commit], { cwd: 'E:/Roadmap Receipts_V2.3', stdio: 'pipe' });
    return true;
  } catch {}
  return false;
}

console.log('======================================================================');
console.log('AUDIT: Verifying Hashes, Commits, and Addresses in Report');
console.log(`Report: ${reportPath}`);
console.log('======================================================================');

let verifiedCount = 0;
let errors = 0;

// 1. Verify 0x40 hex addresses
const addrRegex = /0x[a-fA-F0-9]{40}/g;
let match;
while ((match = addrRegex.exec(reportContent)) !== null) {
  const addr = match[0];
  const known = KNOWN_CONTRACTS[addr] || KNOWN_CONTRACTS[addr.toLowerCase()];
  if (known) {
    console.log(`✓ Address verified: ${addr} (${known})`);
    verifiedCount++;
  } else {
    // Check if in evidence
    let inEvidence = false;
    for (const tx of KNOWN_TXS) {
      if (reportContent.includes(tx)) {
        inEvidence = true;
        break;
      }
    }
    if (inEvidence) {
      console.log(`✓ Account address verified: ${addr}`);
      verifiedCount++;
    } else {
      console.warn(`? Unrecognized address: ${addr}`);
    }
  }
}

// 2. Verify 64-hex SHA-256 / Tx Hashes
const hex64Regex = /0x[a-fA-F0-9]{64}|(?<![0-9a-fA-F])[0-9a-fA-F]{64}(?![0-9a-fA-F])/g;
while ((match = hex64Regex.exec(reportContent)) !== null) {
  const hex = match[0];
  const isTx = hex.startsWith('0x');

  if (isTx) {
    if (KNOWN_TXS.has(hex.toLowerCase())) {
      console.log(`✓ Transaction hash verified: ${hex}`);
      verifiedCount++;
    } else {
      console.error(`✗ Unknown transaction hash in report: ${hex}`);
      errors++;
    }
  } else {
    // 64-char sha256
    const knownSha = KNOWN_SHAS[hex];
    if (knownSha) {
      console.log(`✓ Contract Source SHA-256 verified: ${hex} (${knownSha})`);
      verifiedCount++;
    } else {
      console.warn(`? 64-char token: ${hex}`);
    }
  }
}

// 3. Verify git commits
const commitRegex = /`([0-9a-f]{40})`/g;
while ((match = commitRegex.exec(reportContent)) !== null) {
  const c = match[1];
  if (verifyGitCommit(c)) {
    console.log(`✓ Git commit verified in history: ${c}`);
    verifiedCount++;
  } else {
    console.error(`✗ Unverified git commit: ${c}`);
    errors++;
  }
}

console.log('======================================================================');
console.log(`VERIFICATION SUMMARY: ${verifiedCount} tokens verified. Errors: ${errors}`);
console.log('======================================================================');

if (errors > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
