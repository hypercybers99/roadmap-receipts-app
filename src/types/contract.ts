export type MilestoneStatus = 'PENDING' | 'DELIVERED' | 'PARTIAL' | 'MISSED' | 'REVIEW';

export interface Milestone {
  index: string;
  title: string;
  weight: string;
  criteria: string[];
  evidence_url: string;
  evidence_host: string;
  evidence_dir: string;
  evidence_history: string[];
  latest_status: MilestoneStatus;
  latest_verification_id: string;
}

export interface Roadmap {
  id: string;
  name: string;
  owner: string;
  milestones: Milestone[];
  milestones_hash: string;
  progress_pct: string;
  verified_count: string;
  review_count: string;
  schema_version: string;
  seq: string;
}

export interface Verification {
  id: string;
  roadmap_id: string;
  milestone_index: string;
  status: MilestoneStatus;
  gate: string; // "TRIPWIRE" or ""
  tripwire: boolean;
  labels: string[];
  effective_labels: string[];
  quotes: string[];
  evidence_url_used: string;
  norm_hash16: string;
  leader_reported: string;
  caller: string;
  seq: string;
  schema_version: string;
}

export interface MilestoneStatusReadback {
  criteria: string[];
  effective_labels: string[];
  evidence_url: string;
  labels: string[];
  milestone_index: string;
  quotes: string[];
  roadmap_id: string;
  status: MilestoneStatus;
  title: string;
  weight: string;
}

export interface ScoreResult {
  progress_pct: string;
  review_count: string;
  verified_count: string;
}

export interface GrantTranche {
  tranche_index: number;
  milestone_index: number;
  amount: string;
  released: boolean;
  reclaimed: boolean;
}

export interface Grant {
  id: string;
  roadmap_id: string;
  funder: string;
  recipient: string;
  total_amount: string;
  escrow_balance: string;
  milestones_hash: string;
  tranches: GrantTranche[];
  schema_version: string;
}

export interface TrancheOpenStatus {
  open: 'true' | 'false';
  reason: string;
}

export interface ContractLimits {
  max_criteria_per_milestone: string;
  max_criteria_text_len: string;
  max_evidence_page_bytes: string;
  max_evidence_url_len: string;
  max_milestone_title_len: string;
  max_milestones: string;
  max_quote_len: string;
  max_roadmap_name_len: string;
  min_criteria_per_milestone: string;
  min_criteria_text_len: string;
  min_evidence_page_chars: string;
  min_milestone_title_len: string;
  min_milestones: string;
  min_quote_norm_chars: string;
  min_roadmap_name_len: string;
  schema_version: string;
}

export interface LedgerStats {
  total_roadmaps: string;
  total_verifications: string;
}

export interface GateStats {
  total_escrow: string;
  total_grants: string;
  total_minted: string;
}
