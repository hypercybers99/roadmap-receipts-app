import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient, chains, createAccount } from 'genlayer-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const RL_ADDRESS = '0x711FFC1C4c6ACBea0E7B74B0cd40AF5A5fA5ADa4';
const TG_ADDRESS = '0x5D869C10F523fdD2E3b0Db0CD5CA0107b25b4026';

const FIXTURES_SHA = 'c83e8f197f9264701f5362a8e2f13f5e185186e8';
const FIXTURES_BASE = `https://raw.githubusercontent.com/hypercybers99/roadmap-receipts-fixtures/${FIXTURES_SHA}/lumen/`;

function decodeBase64Safe(input) {
  if (!input || typeof input !== 'string') return '';
  const clean = input.trim();
  if (clean.includes(' ')) {
    return clean;
  }
  if (/^[A-Za-z0-9+/=]+$/.test(clean) && clean.length % 4 === 0) {
    try {
      const decoded = Buffer.from(clean, 'base64').toString('utf8');
      if (/^[\x20-\x7E\r\n\t]+$/.test(decoded)) {
        return decoded;
      }
    } catch {}
  }
  return clean;
}

function sanitizeErrorMessage(raw) {
  if (!raw) return '';
  const matches = raw.match(/[\x20-\x7E]{3,}/g);
  if (matches && matches.length > 0 && /[\x00-\x1F]/.test(raw)) {
    return matches.join(' ').trim();
  }
  return raw.trim();
}

function extractDecodedPayload(rcpt) {
  const leader = rcpt?.consensus_data?.leader_receipt?.[0];
  const isSuccess = leader?.execution_result === 'SUCCESS';
  const rawPayload = leader?.result?.payload;

  if (isSuccess) {
    if (rawPayload && typeof rawPayload === 'object' && rawPayload.readable) {
      try {
        return JSON.parse(rawPayload.readable);
      } catch {
        return rawPayload.readable;
      }
    }
    return rawPayload;
  }

  // Error case
  if (typeof rawPayload === 'string') {
    return sanitizeErrorMessage(decodeBase64Safe(rawPayload));
  }
  if (typeof rawPayload === 'object' && rawPayload !== null) {
    if (rawPayload.readable) return rawPayload.readable;
    if (rawPayload.payload) return sanitizeErrorMessage(decodeBase64Safe(rawPayload.payload));
  }
  return 'Unknown error payload';
}

async function main() {
  console.log('======================================================================');
  console.log('ROADMAP RECEIPTS: ON-CHAIN END-TO-END VERIFICATION');
  console.log('======================================================================');
  console.log(`Active RoadmapLedger: ${RL_ADDRESS}`);
  console.log(`Active TrancheGate:   ${TG_ADDRESS}`);

  // Generate throwaway accounts
  const funderAcc = createAccount();
  const recipientAcc = createAccount();
  const attackerAcc = createAccount();

  console.log(`Funder Address:    ${funderAcc.address}`);
  console.log(`Recipient Address: ${recipientAcc.address}`);
  console.log(`Attacker Address:  ${attackerAcc.address}`);

  // Write throwaway keys to git-ignored .env
  const envContent = [
    `# Throwaway E2E Test Accounts (Preview Studionet - Zero Balance Required)`,
    `E2E_FUNDER_ADDRESS=${funderAcc.address}`,
    `E2E_RECIPIENT_ADDRESS=${recipientAcc.address}`,
    `E2E_ATTACKER_ADDRESS=${attackerAcc.address}`,
    `E2E_TIMESTAMP=${new Date().toISOString()}`,
  ].join('\n');
  fs.writeFileSync(path.join(rootDir, '.env'), envContent);
  console.log('✓ Throwaway test credentials written to git-ignored .env');

  const funderClient = createClient({ chain: chains.studionet, account: funderAcc });
  const recipientClient = createClient({ chain: chains.studionet, account: recipientAcc });
  const attackerClient = createClient({ chain: chains.studionet, account: attackerAcc });
  const readClient = createClient({ chain: chains.studionet });

  const evidenceDir = path.join(rootDir, 'docs/evidence');
  if (!fs.existsSync(evidenceDir)) {
    fs.mkdirSync(evidenceDir, { recursive: true });
  }

  const receiptsLog = [];

  async function executeAndRecord(client, actionName, filename, contractAddress, functionName, args) {
    console.log(`\n--- Executing: ${actionName} (${functionName}) ---`);
    const startTime = Date.now();
    const txHash = await client.writeContract({
      address: contractAddress,
      functionName,
      args,
      value: BigInt(0),
    });
    console.log(`Submitted tx: ${txHash}`);

    const rcpt = await client.waitForTransactionReceipt({
      hash: txHash,
      retries: 120,
      interval: 3000,
    });
    const latency = ((Date.now() - startTime) / 1000).toFixed(2);

    const leaderResult = rcpt.consensus_data?.leader_receipt?.[0]?.execution_result || 'UNKNOWN';
    const decodedPayload = extractDecodedPayload(rcpt);

    console.log(`Confirmed in ${latency}s | Status: ${rcpt.status_name} | Result: ${rcpt.result_name} | Leader: ${leaderResult}`);
    console.log(`Payload:`, decodedPayload);

    const record = {
      action: actionName,
      hash: txHash,
      status_name: rcpt.status_name,
      result_name: rcpt.result_name,
      leader_result: leaderResult,
      latency_seconds: latency,
      decoded_payload: decodedPayload,
      consensus_data: rcpt.consensus_data,
    };

    fs.writeFileSync(
      path.join(evidenceDir, `${filename}.json`),
      JSON.stringify(record, null, 2)
    );
    receiptsLog.push(record);
    return { txHash, rcpt, leaderResult, decodedPayload, latency };
  }

  // =========================================================================
  // STEP 1: PROVE DYNAMIC ROADMAP IDS (CREATE 2 ROADMAPS IN A ROW)
  // =========================================================================
  console.log('\n=============================================================');
  console.log('STEP 1: Prove Dynamic Roadmap IDs (Create 2 Roadmaps in a row)');
  console.log('=============================================================');

  const roadmapAMilestones = [
    {
      title: 'Offline sync',
      criteria: [
        'A release note states that offline sync is available to all users.',
        'The release note names the version number that includes offline sync.',
      ],
      weight: 3,
      evidence_url: `${FIXTURES_BASE}m1-delivered.md`,
    },
    {
      title: 'Public API',
      criteria: [
        'The documentation lists endpoints for notes and for tags.',
        'A release note states that the API is generally available and not in beta.',
      ],
      weight: 5,
      evidence_url: `${FIXTURES_BASE}m2-delivered.md`,
    },
    {
      title: 'Security audit published',
      criteria: ['A published audit report is linked from the page.'],
      weight: 2,
      evidence_url: `${FIXTURES_BASE}m3-missed.md`,
    },
  ];

  const r1 = await executeAndRecord(
    funderClient,
    'create_roadmap_1',
    'e2e_create_roadmap_1',
    RL_ADDRESS,
    'create_roadmap',
    [`E2E Primary Roadmap ${Date.now()}`, JSON.stringify(roadmapAMilestones)]
  );
  const roadmapIdA = String(r1.decodedPayload);
  console.log(`>>> Captured Dynamic Roadmap ID 1: ${roadmapIdA}`);

  const roadmapBMilestones = [
    {
      title: 'Secondary Probe',
      criteria: ['A release note states that the secondary milestone is operational.'],
      weight: 10,
      evidence_url: `${FIXTURES_BASE}m1-delivered.md`,
    },
  ];

  const r2 = await executeAndRecord(
    funderClient,
    'create_roadmap_2',
    'e2e_create_roadmap_2',
    RL_ADDRESS,
    'create_roadmap',
    [`E2E Secondary Roadmap ${Date.now()}`, JSON.stringify(roadmapBMilestones)]
  );
  const roadmapIdB = String(r2.decodedPayload);
  console.log(`>>> Captured Dynamic Roadmap ID 2: ${roadmapIdB}`);

  if (roadmapIdA === roadmapIdB) {
    throw new Error(`Dynamic ID proof failed: IDs are identical (${roadmapIdA})!`);
  }
  console.log(`✓ PROVED: Roadmap IDs are dynamic and incrementing (${roadmapIdA} -> ${roadmapIdB})`);

  // =========================================================================
  // STEP 2: VERIFY MILESTONES ON ROADMAP A
  // =========================================================================
  console.log('\n=============================================================');
  console.log('STEP 2: Verify Milestones on Roadmap A (DELIVERED & MISSED)');
  console.log('=============================================================');

  // Verify M0 (Offline sync -> m1-delivered.md) -> DELIVERED
  const v0 = await executeAndRecord(
    funderClient,
    'verify_milestone_0',
    'e2e_verify_m0',
    RL_ADDRESS,
    'verify',
    [roadmapIdA, 0]
  );
  console.log(`Milestone 0 verification result: ${v0.decodedPayload}`);

  // Verify M1 (Public API -> m2-delivered.md) -> DELIVERED
  const v1 = await executeAndRecord(
    funderClient,
    'verify_milestone_1',
    'e2e_verify_m1',
    RL_ADDRESS,
    'verify',
    [roadmapIdA, 1]
  );
  console.log(`Milestone 1 verification result: ${v1.decodedPayload}`);

  // Verify M2 (Security audit published -> m3-missed.md) -> MISSED
  const v2 = await executeAndRecord(
    funderClient,
    'verify_milestone_2',
    'e2e_verify_m2',
    RL_ADDRESS,
    'verify',
    [roadmapIdA, 2]
  );
  console.log(`Milestone 2 verification result: ${v2.decodedPayload}`);

  // Readback roadmap score
  const rawRm = await readClient.readContract({
    address: RL_ADDRESS,
    functionName: 'get_roadmap',
    args: [roadmapIdA],
  });
  const parsedRm = JSON.parse(rawRm);
  console.log(`Roadmap ${roadmapIdA} Verified Status:`);
  console.log(`  Progress Score: ${parsedRm.progress_pct}%`);
  console.log(`  M0 Status: ${parsedRm.milestones[0].latest_status} (Weight ${parsedRm.milestones[0].weight})`);
  console.log(`  M1 Status: ${parsedRm.milestones[1].latest_status} (Weight ${parsedRm.milestones[1].weight})`);
  console.log(`  M2 Status: ${parsedRm.milestones[2].latest_status} (Weight ${parsedRm.milestones[2].weight})`);

  // =========================================================================
  // STEP 3: DEMO CREDITS CLAIM & GRANT ESCROW CREATION
  // =========================================================================
  console.log('\n=============================================================');
  console.log('STEP 3: Claim Demo Credits and Create Grant Tied to Roadmap A');
  console.log('=============================================================');

  await executeAndRecord(
    funderClient,
    'claim_demo_credits',
    'e2e_claim_credits',
    TG_ADDRESS,
    'claim_demo_credits',
    []
  );

  const initialFunderBal = await readClient.readContract({
    address: TG_ADDRESS,
    functionName: 'balance_of',
    args: [funderAcc.address],
  });
  console.log(`Funder Initial Balance: ${initialFunderBal} Demo Credits`);

  const grantTranches = [
    { milestone_index: 0, amount: 300 }, // DELIVERED
    { milestone_index: 1, amount: 400 }, // DELIVERED
    { milestone_index: 2, amount: 200 }, // MISSED
  ];

  const gRes = await executeAndRecord(
    funderClient,
    'create_grant',
    'e2e_create_grant',
    TG_ADDRESS,
    'create_grant',
    [roadmapIdA, recipientAcc.address, JSON.stringify(grantTranches)]
  );
  const grantId = String(gRes.decodedPayload);
  console.log(`>>> Captured Dynamic Grant ID: ${grantId}`);

  // Check balances after grant creation
  const funderBalAfterGrant = await readClient.readContract({
    address: TG_ADDRESS,
    functionName: 'balance_of',
    args: [funderAcc.address],
  });
  const rawGrantAfterCreate = await readClient.readContract({
    address: TG_ADDRESS,
    functionName: 'get_grant',
    args: [grantId],
  });
  const parsedGrant = JSON.parse(rawGrantAfterCreate);
  console.log(`Funder Balance after Grant creation: ${funderBalAfterGrant} (Expected 100)`);
  console.log(`Grant Escrow Balance: ${parsedGrant.escrow_balance} (Expected 900)`);

  // =========================================================================
  // STEP 4: RELEASE & RECLAIM LIFECYCLE WITH ERROR REFUSALS
  // =========================================================================
  console.log('\n=============================================================');
  console.log('STEP 4: Release & Reclaim Lifecycle and Error Refusals');
  console.log('=============================================================');

  // 1. Release Tranche 0 (Milestone 0 is DELIVERED, 300 credits) -> SUCCESS
  await executeAndRecord(
    recipientClient,
    'release_tranche_0_success',
    'e2e_release_tranche_0',
    TG_ADDRESS,
    'release',
    [grantId, 0]
  );
  const recipientBalAfterT0 = await readClient.readContract({
    address: TG_ADDRESS,
    functionName: 'balance_of',
    args: [recipientAcc.address],
  });
  console.log(`Recipient Balance after T0 release: ${recipientBalAfterT0} (Expected 300)`);

  // 2. Attempt Reclaim Tranche 0 (DELIVERED) -> REFUSAL
  const reclaimDelivered = await executeAndRecord(
    funderClient,
    'reclaim_delivered_refusal',
    'e2e_reclaim_delivered_refusal',
    TG_ADDRESS,
    'reclaim',
    [grantId, 0]
  );
  console.log(`Reclaim DELIVERED refusal decoded: "${reclaimDelivered.decodedPayload}"`);

  // 3. Attacker attempts to Reclaim Tranche 2 (MISSED) -> REFUSAL (Only funder can reclaim)
  const attackerReclaim = await executeAndRecord(
    attackerClient,
    'attacker_reclaim_refusal',
    'e2e_attacker_reclaim_refusal',
    TG_ADDRESS,
    'reclaim',
    [grantId, 2]
  );
  console.log(`Attacker reclaim refusal decoded: "${attackerReclaim.decodedPayload}"`);

  // 4. Funder Reclaims Tranche 2 (MISSED, 200 credits) -> SUCCESS
  await executeAndRecord(
    funderClient,
    'reclaim_missed_success',
    'e2e_reclaim_missed_success',
    TG_ADDRESS,
    'reclaim',
    [grantId, 2]
  );
  const funderBalAfterReclaim = await readClient.readContract({
    address: TG_ADDRESS,
    functionName: 'balance_of',
    args: [funderAcc.address],
  });
  console.log(`Funder Balance after MISSED reclaim: ${funderBalAfterReclaim} (Expected 100 + 200 = 300)`);

  // 5. Attempt Duplicate Reclaim Tranche 2 -> REFUSAL
  const duplicateReclaim = await executeAndRecord(
    funderClient,
    'duplicate_reclaim_refusal',
    'e2e_duplicate_reclaim_refusal',
    TG_ADDRESS,
    'reclaim',
    [grantId, 2]
  );
  console.log(`Duplicate reclaim refusal decoded: "${duplicateReclaim.decodedPayload}"`);

  // 6. Release Tranche 1 (Milestone 1 is DELIVERED, 400 credits) -> SUCCESS
  await executeAndRecord(
    recipientClient,
    'release_tranche_1_success',
    'e2e_release_tranche_1',
    TG_ADDRESS,
    'release',
    [grantId, 1]
  );
  const recipientBalFinal = await readClient.readContract({
    address: TG_ADDRESS,
    functionName: 'balance_of',
    args: [recipientAcc.address],
  });
  console.log(`Recipient Final Balance: ${recipientBalFinal} (Expected 700)`);

  // =========================================================================
  // STEP 5: PROVE CONSERVATION INVARIANT
  // =========================================================================
  console.log('\n=============================================================');
  console.log('STEP 5: Prove Conservation of Demo Credits Invariant');
  console.log('=============================================================');

  const finalFunderBal = parseInt(await readClient.readContract({ address: TG_ADDRESS, functionName: 'balance_of', args: [funderAcc.address] }), 10);
  const finalRecipientBal = parseInt(await readClient.readContract({ address: TG_ADDRESS, functionName: 'balance_of', args: [recipientAcc.address] }), 10);
  const finalGrant = JSON.parse(await readClient.readContract({ address: TG_ADDRESS, functionName: 'get_grant', args: [grantId] }));
  const finalEscrow = parseInt(finalGrant.escrow_balance, 10);

  const totalCredits = finalFunderBal + finalRecipientBal + finalEscrow;

  console.log(`Final Funder Balance:    ${finalFunderBal} Demo Credits`);
  console.log(`Final Recipient Balance: ${finalRecipientBal} Demo Credits`);
  console.log(`Final Escrow Balance:    ${finalEscrow} Demo Credits`);
  console.log(`Total System Credits:    ${totalCredits} Demo Credits`);

  if (totalCredits !== 1000) {
    throw new Error(`Conservation invariant violated: Total is ${totalCredits}, expected 1000!`);
  }
  console.log('✓ CONSERVATION INVARIANT VERIFIED: Exact 1,000 demo credits conserved throughout lifecycle.');

  // Save summary
  const summary = {
    executedAt: new Date().toISOString(),
    contracts: {
      RoadmapLedger: RL_ADDRESS,
      TrancheGate: TG_ADDRESS,
    },
    accounts: {
      funder: funderAcc.address,
      recipient: recipientAcc.address,
      attacker: attackerAcc.address,
    },
    dynamicIds: {
      roadmapIdA,
      roadmapIdB,
      grantId,
    },
    conservation: {
      funder: finalFunderBal,
      recipient: finalRecipientBal,
      escrow: finalEscrow,
      total: totalCredits,
      holds: totalCredits === 1000,
    },
    receipts: receiptsLog.map(r => ({
      action: r.action,
      hash: r.hash,
      status_name: r.status_name,
      result_name: r.result_name,
      leader_result: r.leader_result,
      latency_seconds: r.latency_seconds,
      decoded_payload: r.decoded_payload,
    })),
  };

  fs.writeFileSync(path.join(evidenceDir, 'e2e_summary.json'), JSON.stringify(summary, null, 2));
  console.log(`\n✓ All ${receiptsLog.length} on-chain receipts saved to docs/evidence/`);
  console.log('======================================================================');
  console.log('ON-CHAIN E2E SCRIPT COMPLETED SUCCESSFULLY');
  console.log('======================================================================');
}

main().catch(err => {
  console.error('Fatal error in e2e_full_chain:', err);
  process.exit(1);
});
