import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const contractRepoPath = process.env.CONTRACT_REPO_PATH || 'E:/Roadmap Receipts_V2.3';

console.log('======================================================');
console.log('SYNC DEPLOYMENTS: Source of Truth Verification');
console.log(`Contract repository path: ${contractRepoPath}`);
console.log('======================================================');

if (!fs.existsSync(contractRepoPath)) {
  console.error(`Error: Contract repository path not found at ${contractRepoPath}`);
  process.exit(1);
}

// 1. Read scripts/deploy/deployments.json from contract repo
const depJsonPath = path.join(contractRepoPath, 'scripts/deploy/deployments.json');
if (!fs.existsSync(depJsonPath)) {
  console.error(`Error: deployments.json not found at ${depJsonPath}`);
  process.exit(1);
}
const depJson = JSON.parse(fs.readFileSync(depJsonPath, 'utf8'));

// 2. Read docs/ADDRESS_REGISTRY.md from contract repo
const regPath = path.join(contractRepoPath, 'docs/ADDRESS_REGISTRY.md');
if (!fs.existsSync(regPath)) {
  console.error(`Error: ADDRESS_REGISTRY.md not found at ${regPath}`);
  process.exit(1);
}
const regMd = fs.readFileSync(regPath, 'utf8');

// Parse Active Pair from ADDRESS_REGISTRY.md
const activeSectionMatch = regMd.match(/## 2\. Active Pair[\s\S]*$/);
if (!activeSectionMatch) {
  console.error('Error: Could not locate Section 2 (Active Pair) in ADDRESS_REGISTRY.md');
  process.exit(1);
}
const activeSection = activeSectionMatch[0];

const rlAddrMatch = activeSection.match(/### RoadmapLedger[\s\S]*?-\s*\*\*Contract Address\*\*:\s*`([^`]+)`/);
const rlTxMatch = activeSection.match(/### RoadmapLedger[\s\S]*?-\s*\*\*Deploy Transaction\*\*:\s*`([^`]+)`/);
const rlShaMatch = activeSection.match(/### RoadmapLedger[\s\S]*?-\s*\*\*Source SHA-256\*\*:\s*`([^`]+)`/);

const tgAddrMatch = activeSection.match(/### TrancheGate[\s\S]*?-\s*\*\*Contract Address\*\*:\s*`([^`]+)`/);
const tgTxMatch = activeSection.match(/### TrancheGate[\s\S]*?-\s*\*\*Deploy Transaction\*\*:\s*`([^`]+)`/);
const tgShaMatch = activeSection.match(/### TrancheGate[\s\S]*?-\s*\*\*Source SHA-256\*\*:\s*`([^`]+)`/);
const tgBoundMatch = activeSection.match(/### TrancheGate[\s\S]*?-\s*\*\*Bound Ledger Address\*\*:\s*`([^`]+)`/);

if (!rlAddrMatch || !rlTxMatch || !rlShaMatch || !tgAddrMatch || !tgTxMatch || !tgShaMatch || !tgBoundMatch) {
  console.error('Error: Failed to parse active contract entries from ADDRESS_REGISTRY.md');
  process.exit(1);
}

const regRL = {
  address: rlAddrMatch[1].trim(),
  deployTx: rlTxMatch[1].trim(),
  sourceSha: rlShaMatch[1].trim(),
};

const regTG = {
  address: tgAddrMatch[1].trim(),
  deployTx: tgTxMatch[1].trim(),
  sourceSha: tgShaMatch[1].trim(),
  boundAddress: tgBoundMatch[1].trim(),
};

// 3. Verify against deployments.json active_pair
const jsonRL = depJson.active_pair.RoadmapLedger;
const jsonTG = depJson.active_pair.TrancheGate;

if (regRL.address.toLowerCase() !== jsonRL.address.toLowerCase()) {
  console.error(`Disagreement on RoadmapLedger address: Registry ${regRL.address} vs JSON ${jsonRL.address}`);
  process.exit(1);
}
if (regRL.deployTx.toLowerCase() !== jsonRL.deploy_tx.toLowerCase()) {
  console.error(`Disagreement on RoadmapLedger deployTx: Registry ${regRL.deployTx} vs JSON ${jsonRL.deploy_tx}`);
  process.exit(1);
}
if (regRL.sourceSha.toLowerCase() !== jsonRL.source_sha256.toLowerCase()) {
  console.error(`Disagreement on RoadmapLedger sourceSha: Registry ${regRL.sourceSha} vs JSON ${jsonRL.source_sha256}`);
  process.exit(1);
}

if (regTG.address.toLowerCase() !== jsonTG.address.toLowerCase()) {
  console.error(`Disagreement on TrancheGate address: Registry ${regTG.address} vs JSON ${jsonTG.address}`);
  process.exit(1);
}
if (regTG.deployTx.toLowerCase() !== jsonTG.deploy_tx.toLowerCase()) {
  console.error(`Disagreement on TrancheGate deployTx: Registry ${regTG.deployTx} vs JSON ${jsonTG.deploy_tx}`);
  process.exit(1);
}
if (regTG.sourceSha.toLowerCase() !== jsonTG.source_sha256.toLowerCase()) {
  console.error(`Disagreement on TrancheGate sourceSha: Registry ${regTG.sourceSha} vs JSON ${jsonTG.source_sha256}`);
  process.exit(1);
}
if (regTG.boundAddress.toLowerCase() !== regRL.address.toLowerCase()) {
  console.error(`Disagreement: TrancheGate bound ledger ${regTG.boundAddress} does not equal RoadmapLedger ${regRL.address}`);
  process.exit(1);
}

console.log('✓ Active contracts in ADDRESS_REGISTRY.md match deployments.json exactly.');

// 4. Verify against deploy payload files
const txRLPath = path.join(contractRepoPath, 'docs/evidence/source/deploy_tx_RoadmapLedger_v2.json');
const txTGPath = path.join(contractRepoPath, 'docs/evidence/source/deploy_tx_TrancheGate_v2.json');

if (fs.existsSync(txRLPath)) {
  const txRL = JSON.parse(fs.readFileSync(txRLPath, 'utf8'));
  const payloadCode = Buffer.from(txRL.data.contract_code, 'base64').toString('utf8');
  const codeSha = crypto.createHash('sha256').update(payloadCode, 'utf8').digest('hex');
  if (codeSha.toLowerCase() !== regRL.sourceSha.toLowerCase()) {
    console.error(`Disagreement on RoadmapLedger v2 deploy payload code sha: ${codeSha} vs ${regRL.sourceSha}`);
    process.exit(1);
  }
  console.log(`✓ RoadmapLedger v2 deploy payload SHA-256 verified: ${codeSha}`);
}

if (fs.existsSync(txTGPath)) {
  const txTG = JSON.parse(fs.readFileSync(txTGPath, 'utf8'));
  const payloadCode = Buffer.from(txTG.data.contract_code, 'base64').toString('utf8');
  const codeSha = crypto.createHash('sha256').update(payloadCode, 'utf8').digest('hex');
  if (codeSha.toLowerCase() !== regTG.sourceSha.toLowerCase()) {
    console.error(`Disagreement on TrancheGate v2 deploy payload code sha: ${codeSha} vs ${regTG.sourceSha}`);
    process.exit(1);
  }
  console.log(`✓ TrancheGate v2 deploy payload SHA-256 verified: ${codeSha}`);
}

// 5. Generate src/config/deployments.ts
const supRL = depJson.superseded_pair.RoadmapLedger;
const supTG = depJson.superseded_pair.TrancheGate;
const probeAddress = '0x100B6857aFD1f4f09FEeBb8652de3D7F686EE487';

const tsContent = `// AUTO-GENERATED by scripts/sync_deployments.mjs
// Source of truth: ${contractRepoPath} (tag rr-v1 / rr-v1b)

export interface ContractDeployment {
  address: string;
  deployTx: string;
  sourceSha256: string;
  explorerUrl: string;
  boundLedgerAddress?: string;
}

export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerBase: string;
}

export const NETWORK: NetworkConfig = {
  name: 'GenLayer Studionet',
  chainId: 61999,
  rpcUrl: 'https://studio.genlayer.com/api',
  explorerBase: 'https://explorer-studio.genlayer.com/address/',
};

export const ACTIVE_CONTRACTS: {
  RoadmapLedger: ContractDeployment;
  TrancheGate: ContractDeployment;
} = {
  RoadmapLedger: {
    address: '${jsonRL.address}',
    deployTx: '${jsonRL.deploy_tx}',
    sourceSha256: '${jsonRL.source_sha256}',
    explorerUrl: '${jsonRL.explorer_url}',
  },
  TrancheGate: {
    address: '${jsonTG.address}',
    deployTx: '${jsonTG.deploy_tx}',
    sourceSha256: '${jsonTG.source_sha256}',
    explorerUrl: '${jsonTG.explorer_url}',
    boundLedgerAddress: '${jsonRL.address}',
  },
};

export const SUPERSEDED_CONTRACTS: {
  RoadmapLedger: ContractDeployment;
  TrancheGate: ContractDeployment;
} = {
  RoadmapLedger: {
    address: '${supRL.address}',
    deployTx: '${supRL.deploy_tx}',
    sourceSha256: '${supRL.source_sha256}',
    explorerUrl: '${supRL.explorer_url}',
  },
  TrancheGate: {
    address: '${supTG.address}',
    deployTx: '${supTG.deploy_tx}',
    sourceSha256: '${supTG.source_sha256}',
    explorerUrl: '${supTG.explorer_url}',
    boundLedgerAddress: '${supRL.address}',
  },
};

export const PROBE_HARNESS: {
  address: string;
  sourceSha256: string;
  explorerUrl: string;
} = {
  address: '${probeAddress}',
  sourceSha256: '834b2ed4272b38693eac0e683b0bdf671b9dd3bbcfe878f52d87dbd9bdcf48a0',
  explorerUrl: 'https://explorer-studio.genlayer.com/address/${probeAddress}',
};
`;

const outPath = path.join(rootDir, 'src/config/deployments.ts');
fs.writeFileSync(outPath, tsContent, 'utf8');
console.log(`✓ Successfully generated ${outPath}`);
