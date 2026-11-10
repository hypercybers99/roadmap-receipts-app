import fs from 'fs';
import path from 'path';
import dns from 'dns';
import { fileURLToPath } from 'url';
import { createClient, chains } from 'genlayer-js';

dns.setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const depConfigPath = path.join(rootDir, 'src/config/deployments.ts');
const depContent = fs.readFileSync(depConfigPath, 'utf8');

const rlAddr = depContent.match(/RoadmapLedger:\s*\{[\s\S]*?address:\s*'(0x[a-fA-F0-9]{40})'/i)[1];
const tgAddr = depContent.match(/TrancheGate:\s*\{[\s\S]*?address:\s*'(0x[a-fA-F0-9]{40})'/i)[1];

const client = createClient({
  chain: chains.studionet,
});

const RL_ADDRESS = rlAddr;
const TG_ADDRESS = tgAddr;

async function main() {
  console.log('======================================================');
  console.log('CAPTURE GOLDEN: Reading Real Contract Outputs');
  console.log(`RoadmapLedger: ${RL_ADDRESS}`);
  console.log(`TrancheGate:   ${TG_ADDRESS}`);
  console.log('======================================================');

  const goldenDir = path.join(rootDir, 'tests/golden');
  if (!fs.existsSync(goldenDir)) {
    fs.mkdirSync(goldenDir, { recursive: true });
  }

  // 1. get_roadmap('1')
  const rawRoadmap = await client.readContract({
    address: RL_ADDRESS,
    functionName: 'get_roadmap',
    args: ['1'],
  });
  const parsedRoadmap = JSON.parse(rawRoadmap);
  fs.writeFileSync(path.join(goldenDir, 'get_roadmap.json'), JSON.stringify(parsedRoadmap, null, 2));
  console.log('✓ Captured get_roadmap.json');

  const owner = parsedRoadmap.owner;

  // 2. get_verification('1')
  const rawVerification = await client.readContract({
    address: RL_ADDRESS,
    functionName: 'get_verification',
    args: ['1'],
  });
  fs.writeFileSync(path.join(goldenDir, 'get_verification.json'), JSON.stringify(JSON.parse(rawVerification), null, 2));
  console.log('✓ Captured get_verification.json');

  // 3. get_milestone_status('1', 0)
  const rawStatus = await client.readContract({
    address: RL_ADDRESS,
    functionName: 'get_milestone_status',
    args: ['1', 0],
  });
  fs.writeFileSync(path.join(goldenDir, 'get_milestone_status.json'), JSON.stringify(JSON.parse(rawStatus), null, 2));
  console.log('✓ Captured get_milestone_status.json');

  // 4. compute_score(weights_json, statuses_json)
  const weights = parsedRoadmap.milestones.map(m => m.weight);
  const statuses = ['DELIVERED', 'PARTIAL', 'MISSED'];
  const rawScore = await client.readContract({
    address: RL_ADDRESS,
    functionName: 'compute_score',
    args: [JSON.stringify(weights), JSON.stringify(statuses)],
  });
  fs.writeFileSync(path.join(goldenDir, 'compute_score.json'), JSON.stringify(JSON.parse(rawScore), null, 2));
  console.log('✓ Captured compute_score.json');

  // 5. get_stats() on RoadmapLedger
  const rawStatsLedger = await client.readContract({
    address: RL_ADDRESS,
    functionName: 'get_stats',
    args: [],
  });
  fs.writeFileSync(path.join(goldenDir, 'get_stats_ledger.json'), JSON.stringify(JSON.parse(rawStatsLedger), null, 2));
  console.log('✓ Captured get_stats_ledger.json');

  // 6. get_limits()
  const rawLimits = await client.readContract({
    address: RL_ADDRESS,
    functionName: 'get_limits',
    args: [],
  });
  fs.writeFileSync(path.join(goldenDir, 'get_limits.json'), JSON.stringify(JSON.parse(rawLimits), null, 2));
  console.log('✓ Captured get_limits.json');

  // 7. list_roadmaps_by_owner
  const rawListRoadmaps = await client.readContract({
    address: RL_ADDRESS,
    functionName: 'list_roadmaps_by_owner',
    args: [owner, 10],
  });
  const parsedListRoadmaps = rawListRoadmaps.map(r => JSON.parse(r));
  fs.writeFileSync(path.join(goldenDir, 'list_roadmaps_by_owner.json'), JSON.stringify(parsedListRoadmaps, null, 2));
  console.log('✓ Captured list_roadmaps_by_owner.json');

  // 8. list_verifications('1')
  const rawListVerifications = await client.readContract({
    address: RL_ADDRESS,
    functionName: 'list_verifications',
    args: ['1', 10],
  });
  const parsedListVerifications = rawListVerifications.map(v => JSON.parse(v));
  fs.writeFileSync(path.join(goldenDir, 'list_verifications.json'), JSON.stringify(parsedListVerifications, null, 2));
  console.log('✓ Captured list_verifications.json');

  // 9. get_grant('1')
  const rawGrant = await client.readContract({
    address: TG_ADDRESS,
    functionName: 'get_grant',
    args: ['1'],
  });
  const parsedGrant = JSON.parse(rawGrant);
  fs.writeFileSync(path.join(goldenDir, 'get_grant.json'), JSON.stringify(parsedGrant, null, 2));
  console.log('✓ Captured get_grant.json');

  const funder = parsedGrant.funder;

  // 10. is_tranche_open('1', 0)
  const rawTrancheOpen = await client.readContract({
    address: TG_ADDRESS,
    functionName: 'is_tranche_open',
    args: ['1', 0],
  });
  fs.writeFileSync(path.join(goldenDir, 'is_tranche_open.json'), JSON.stringify(JSON.parse(rawTrancheOpen), null, 2));
  console.log('✓ Captured is_tranche_open.json');

  // 11. balance_of(funder)
  const rawBalance = await client.readContract({
    address: TG_ADDRESS,
    functionName: 'balance_of',
    args: [funder],
  });
  fs.writeFileSync(path.join(goldenDir, 'balance_of.json'), JSON.stringify({ address: funder, balance: rawBalance }, null, 2));
  console.log('✓ Captured balance_of.json');

  // 12. get_stats() on TrancheGate
  const rawStatsGate = await client.readContract({
    address: TG_ADDRESS,
    functionName: 'get_stats',
    args: [],
  });
  fs.writeFileSync(path.join(goldenDir, 'get_stats_gate.json'), JSON.stringify(JSON.parse(rawStatsGate), null, 2));
  console.log('✓ Captured get_stats_gate.json');

  console.log('\n======================================================');
  console.log('ALL 12 GOLDEN FILES CAPTURED SUCCESSFULLY FROM CHAIN');
  console.log('======================================================');
}

main().catch(err => {
  console.error('Fatal error in capture_golden:', err);
  process.exit(1);
});
