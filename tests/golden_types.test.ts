import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import type {
  Roadmap,
  Verification,
  MilestoneStatusResult,
  ScoreResult,
  ContractLimits,
  LedgerStats,
  Grant,
  TrancheOpenStatus,
  BalanceResult,
  GateStats,
} from '../src/types/contract';

const goldenDir = path.resolve(__dirname, 'golden');

function loadGolden<T>(name: string): T {
  const filepath = path.join(goldenDir, `${name}.json`);
  if (!fs.existsSync(filepath)) {
    throw new Error(`Golden file missing: ${filepath}`);
  }
  return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

describe('Golden Contract Types Verification', () => {
  it('validates get_roadmap matches Roadmap type exactly', () => {
    const data = loadGolden<Roadmap>('get_roadmap');
    expect(typeof data.id).toBe('string');
    expect(typeof data.name).toBe('string');
    expect(typeof data.owner).toBe('string');
    expect(typeof data.milestones_hash).toBe('string');
    expect(typeof data.progress_pct).toBe('string');
    expect(typeof data.verified_count).toBe('string');
    expect(typeof data.review_count).toBe('string');
    expect(typeof data.schema_version).toBe('string');
    expect(typeof data.seq).toBe('string');
    expect(Array.isArray(data.milestones)).toBe(true);
    expect(data.milestones.length).toBeGreaterThan(0);

    const m = data.milestones[0];
    expect(typeof m.index).toBe('string');
    expect(typeof m.title).toBe('string');
    expect(typeof m.weight).toBe('string');
    expect(Array.isArray(m.criteria)).toBe(true);
    expect(typeof m.evidence_url).toBe('string');
    expect(typeof m.evidence_host).toBe('string');
    expect(typeof m.evidence_dir).toBe('string');
    expect(Array.isArray(m.evidence_history)).toBe(true);
    expect(['PENDING', 'DELIVERED', 'PARTIAL', 'MISSED', 'REVIEW']).toContain(m.latest_status);
    expect(typeof m.latest_verification_id).toBe('string');
  });

  it('validates get_verification matches Verification type exactly', () => {
    const data = loadGolden<Verification>('get_verification');
    expect(typeof data.id).toBe('string');
    expect(typeof data.roadmap_id).toBe('string');
    expect(typeof data.milestone_index).toBe('string');
    expect(['PENDING', 'DELIVERED', 'PARTIAL', 'MISSED', 'REVIEW']).toContain(data.status);
    expect(typeof data.gate).toBe('string');
    expect(typeof data.tripwire).toBe('boolean');
    expect(Array.isArray(data.labels)).toBe(true);
    expect(Array.isArray(data.effective_labels)).toBe(true);
    expect(Array.isArray(data.quotes)).toBe(true);
    expect(typeof data.evidence_url_used).toBe('string');
    expect(typeof data.norm_hash16).toBe('string');
    expect(typeof data.leader_reported).toBe('string');
    expect(typeof data.caller).toBe('string');
    expect(typeof data.seq).toBe('string');
    expect(typeof data.schema_version).toBe('string');
  });

  it('validates get_milestone_status matches MilestoneStatusResult type', () => {
    const data = loadGolden<MilestoneStatusResult>('get_milestone_status');
    expect(typeof data.milestone_index).toBe('string');
    expect(typeof data.milestones_hash).toBe('string');
    expect(typeof data.roadmap_id).toBe('string');
    expect(['PENDING', 'DELIVERED', 'PARTIAL', 'MISSED', 'REVIEW']).toContain(data.status);
    expect(typeof data.verification_id).toBe('string');
  });

  it('validates compute_score matches ScoreResult type', () => {
    const data = loadGolden<ScoreResult>('compute_score');
    expect(typeof data.progress_pct).toBe('string');
    expect(typeof data.review_count).toBe('string');
    expect(typeof data.verified_count).toBe('string');
    // Ensure all are parseable numbers
    expect(Number.isFinite(Number(data.progress_pct))).toBe(true);
    expect(Number.isFinite(Number(data.review_count))).toBe(true);
    expect(Number.isFinite(Number(data.verified_count))).toBe(true);
  });

  it('validates get_limits matches ContractLimits type', () => {
    const data = loadGolden<ContractLimits>('get_limits');
    expect(typeof data.max_criteria_per_milestone).toBe('string');
    expect(typeof data.max_criteria_text_len).toBe('string');
    expect(typeof data.max_evidence_page_bytes).toBe('string');
    expect(typeof data.max_evidence_url_len).toBe('string');
    expect(typeof data.max_milestone_title_len).toBe('string');
    expect(typeof data.max_milestones).toBe('string');
    expect(typeof data.max_quote_len).toBe('string');
    expect(typeof data.max_roadmap_name_len).toBe('string');
    expect(typeof data.min_criteria_per_milestone).toBe('string');
    expect(typeof data.min_criteria_text_len).toBe('string');
    expect(typeof data.min_evidence_page_chars).toBe('string');
    expect(typeof data.min_milestone_title_len).toBe('string');
    expect(typeof data.min_milestones).toBe('string');
    expect(typeof data.min_quote_norm_chars).toBe('string');
    expect(typeof data.min_roadmap_name_len).toBe('string');
    expect(typeof data.schema_version).toBe('string');
  });

  it('validates get_stats_ledger matches LedgerStats type', () => {
    const data = loadGolden<LedgerStats>('get_stats_ledger');
    expect(typeof data.total_roadmaps).toBe('string');
    expect(typeof data.total_verifications).toBe('string');
  });

  it('validates list_roadmaps_by_owner returns array of Roadmap items', () => {
    const list = loadGolden<Roadmap[]>('list_roadmaps_by_owner');
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
    const item = list[0];
    expect(typeof item.id).toBe('string');
    expect(typeof item.name).toBe('string');
    expect(typeof item.owner).toBe('string');
  });

  it('validates list_verifications returns array of Verification items', () => {
    const list = loadGolden<Verification[]>('list_verifications');
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
    const item = list[0];
    expect(typeof item.id).toBe('string');
    expect(typeof item.roadmap_id).toBe('string');
    expect(typeof item.milestone_index).toBe('string');
  });

  it('validates get_grant matches Grant type', () => {
    const data = loadGolden<Grant>('get_grant');
    expect(typeof data.id).toBe('string');
    expect(typeof data.roadmap_id).toBe('string');
    expect(typeof data.funder).toBe('string');
    expect(typeof data.recipient).toBe('string');
    expect(typeof data.total_amount).toBe('string');
    expect(typeof data.escrow_balance).toBe('string');
    expect(typeof data.milestones_hash).toBe('string');
    expect(typeof data.schema_version).toBe('string');
    expect(Array.isArray(data.tranches)).toBe(true);
    expect(data.tranches.length).toBeGreaterThan(0);

    const t = data.tranches[0];
    expect(typeof t.tranche_index).toBe('number');
    expect(typeof t.milestone_index).toBe('number');
    expect(typeof t.amount).toBe('string');
    expect(typeof t.released).toBe('boolean');
    expect(typeof t.reclaimed).toBe('boolean');
  });

  it('validates is_tranche_open matches TrancheOpenStatus type', () => {
    const data = loadGolden<TrancheOpenStatus>('is_tranche_open');
    expect(['true', 'false']).toContain(data.open);
    expect(typeof data.reason).toBe('string');
  });

  it('validates balance_of matches BalanceResult type', () => {
    const data = loadGolden<BalanceResult>('balance_of');
    expect(typeof data.address).toBe('string');
    expect(typeof data.balance).toBe('string');
    expect(Number.isFinite(Number(data.balance))).toBe(true);
  });

  it('validates get_stats_gate matches GateStats type', () => {
    const data = loadGolden<GateStats>('get_stats_gate');
    expect(typeof data.total_escrow).toBe('string');
    expect(typeof data.total_grants).toBe('string');
    expect(typeof data.total_minted).toBe('string');
  });
});
