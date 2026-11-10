/**
 * Read-only contract client for GenLayer Studionet.
 * No wallet or private key needed.
 * Strictly adheres to golden schemas captured from on-chain outputs.
 */

import { createClient, chains } from 'genlayer-js';
import { ACTIVE_CONTRACTS } from '../config/deployments';
import type {
  Roadmap,
  Verification,
  MilestoneStatusResult,
  ScoreResult,
  ContractLimits,
  LedgerStats,
  Grant,
  TrancheOpenStatus,
  GateStats,
} from '../types/contract';

const client = createClient({
  chain: chains.studionet,
});

const RL_ADDR = ACTIVE_CONTRACTS.RoadmapLedger.address;
const TG_ADDR = ACTIVE_CONTRACTS.TrancheGate.address;

function safeParse<T>(raw: any, fallback: T): T {
  if (typeof raw !== 'string') return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function getRoadmap(roadmapId: string): Promise<Roadmap | null> {
  if (!roadmapId) return null;
  try {
    const raw = await client.readContract({
      address: RL_ADDR,
      functionName: 'get_roadmap',
      args: [String(roadmapId).trim()],
    });
    if (!raw || raw === '""') return null;
    return safeParse<Roadmap | null>(raw, null);
  } catch (err) {
    console.warn(`Failed to read roadmap ${roadmapId}:`, err);
    return null;
  }
}

export async function listRoadmaps(limit: number = 20): Promise<Roadmap[]> {
  try {
    const rawList = await client.readContract({
      address: RL_ADDR,
      functionName: 'list_roadmaps',
      args: [limit],
    });
    if (!Array.isArray(rawList)) return [];
    return rawList
      .map((item: string) => safeParse<Roadmap | null>(item, null))
      .filter((r): r is Roadmap => r !== null && Boolean(r.id));
  } catch (err) {
    console.warn('Failed to list roadmaps:', err);
    return [];
  }
}

export async function listRoadmapsByOwner(owner: string, limit: number = 20): Promise<Roadmap[]> {
  if (!owner) return [];
  try {
    const rawList = await client.readContract({
      address: RL_ADDR,
      functionName: 'list_roadmaps_by_owner',
      args: [owner.toLowerCase().trim(), limit],
    });
    if (!Array.isArray(rawList)) return [];
    return rawList
      .map((item: string) => safeParse<Roadmap | null>(item, null))
      .filter((r): r is Roadmap => r !== null && Boolean(r.id));
  } catch (err) {
    console.warn(`Failed to list roadmaps for owner ${owner}:`, err);
    return [];
  }
}

export async function getVerification(verificationId: string): Promise<Verification | null> {
  if (!verificationId) return null;
  try {
    const raw = await client.readContract({
      address: RL_ADDR,
      functionName: 'get_verification',
      args: [String(verificationId).trim()],
    });
    if (!raw || raw === '""') return null;
    return safeParse<Verification | null>(raw, null);
  } catch (err) {
    console.warn(`Failed to read verification ${verificationId}:`, err);
    return null;
  }
}

export async function listVerifications(roadmapId: string, limit: number = 20): Promise<Verification[]> {
  if (!roadmapId) return [];
  try {
    const rawList = await client.readContract({
      address: RL_ADDR,
      functionName: 'list_verifications',
      args: [String(roadmapId).trim(), limit],
    });
    if (!Array.isArray(rawList)) return [];
    return rawList
      .map((item: string) => safeParse<Verification | null>(item, null))
      .filter((v): v is Verification => v !== null && Boolean(v.id));
  } catch (err) {
    console.warn(`Failed to list verifications for roadmap ${roadmapId}:`, err);
    return [];
  }
}

export async function getMilestoneStatus(
  roadmapId: string,
  milestoneIndex: number
): Promise<MilestoneStatusResult | null> {
  try {
    const raw = await client.readContract({
      address: RL_ADDR,
      functionName: 'get_milestone_status',
      args: [String(roadmapId).trim(), milestoneIndex],
    });
    if (!raw || raw === '""') return null;
    return safeParse<MilestoneStatusResult | null>(raw, null);
  } catch (err) {
    console.warn(`Failed to read milestone status (${roadmapId}, ${milestoneIndex}):`, err);
    return null;
  }
}

export async function computeScore(
  weights: (number | string)[],
  statuses: string[]
): Promise<ScoreResult> {
  const wArr = weights.map(w => Number(w));
  try {
    const raw = await client.readContract({
      address: RL_ADDR,
      functionName: 'compute_score',
      args: [JSON.stringify(wArr), JSON.stringify(statuses)],
    });
    return safeParse<ScoreResult>(raw, { progress_pct: '0', review_count: '0', verified_count: '0' });
  } catch (err) {
    console.warn('Failed to compute score on chain:', err);
    return { progress_pct: '0', review_count: '0', verified_count: '0' };
  }
}

export async function getLedgerStats(): Promise<LedgerStats> {
  try {
    const raw = await client.readContract({
      address: RL_ADDR,
      functionName: 'get_stats',
      args: [],
    });
    return safeParse<LedgerStats>(raw, { total_roadmaps: '0', total_verifications: '0' });
  } catch (err) {
    console.warn('Failed to get ledger stats:', err);
    return { total_roadmaps: '0', total_verifications: '0' };
  }
}

export async function getContractLimits(): Promise<ContractLimits | null> {
  try {
    const raw = await client.readContract({
      address: RL_ADDR,
      functionName: 'get_limits',
      args: [],
    });
    return safeParse<ContractLimits | null>(raw, null);
  } catch (err) {
    console.warn('Failed to get contract limits:', err);
    return null;
  }
}

export async function getGrant(grantId: string): Promise<Grant | null> {
  if (!grantId) return null;
  try {
    const raw = await client.readContract({
      address: TG_ADDR,
      functionName: 'get_grant',
      args: [String(grantId).trim()],
    });
    if (!raw || raw === '""') return null;
    return safeParse<Grant | null>(raw, null);
  } catch (err) {
    console.warn(`Failed to get grant ${grantId}:`, err);
    return null;
  }
}

export async function listGrantsByFunder(funder: string, limit: number = 20): Promise<Grant[]> {
  if (!funder) return [];
  try {
    const rawList = await client.readContract({
      address: TG_ADDR,
      functionName: 'list_grants_by_funder',
      args: [funder.toLowerCase().trim(), limit],
    });
    if (!Array.isArray(rawList)) return [];
    return rawList
      .map((item: string) => safeParse<Grant | null>(item, null))
      .filter((g): g is Grant => g !== null && Boolean(g.id));
  } catch (err) {
    console.warn(`Failed to list grants for funder ${funder}:`, err);
    return [];
  }
}

export async function listGrantsByRecipient(recipient: string, limit: number = 20): Promise<Grant[]> {
  if (!recipient) return [];
  try {
    const rawList = await client.readContract({
      address: TG_ADDR,
      functionName: 'list_grants_by_recipient',
      args: [recipient.toLowerCase().trim(), limit],
    });
    if (!Array.isArray(rawList)) return [];
    return rawList
      .map((item: string) => safeParse<Grant | null>(item, null))
      .filter((g): g is Grant => g !== null && Boolean(g.id));
  } catch (err) {
    console.warn(`Failed to list grants for recipient ${recipient}:`, err);
    return [];
  }
}

export async function isTrancheOpen(grantId: string, trancheIndex: number): Promise<TrancheOpenStatus> {
  try {
    const raw = await client.readContract({
      address: TG_ADDR,
      functionName: 'is_tranche_open',
      args: [String(grantId).trim(), trancheIndex],
    });
    return safeParse<TrancheOpenStatus>(raw, { open: 'false', reason: 'UNKNOWN' });
  } catch (err) {
    console.warn(`Failed to check is_tranche_open (${grantId}, ${trancheIndex}):`, err);
    return { open: 'false', reason: 'ERROR' };
  }
}

export async function getBalanceOf(address: string): Promise<string> {
  if (!address) return '0';
  try {
    const raw = await client.readContract({
      address: TG_ADDR,
      functionName: 'balance_of',
      args: [address.toLowerCase().trim()],
    });
    return String(raw || '0');
  } catch (err) {
    console.warn(`Failed to get balance for ${address}:`, err);
    return '0';
  }
}

export async function getGateStats(): Promise<GateStats> {
  try {
    const raw = await client.readContract({
      address: TG_ADDR,
      functionName: 'get_stats',
      args: [],
    });
    return safeParse<GateStats>(raw, { total_escrow: '0', total_grants: '0', total_minted: '0' });
  } catch (err) {
    console.warn('Failed to get gate stats:', err);
    return { total_escrow: '0', total_grants: '0', total_minted: '0' };
  }
}
