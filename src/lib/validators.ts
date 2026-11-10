/**
 * Client-side input validators matching contract rules and get_limits.
 * No phantom rules or invented constraints.
 */

export interface UrlValidationResult {
  valid: boolean;
  host?: string;
  dir?: string;
  error?: string;
}

export function validateRoadmapName(name: string): string | null {
  const trimmed = (name || '').trim();
  if (trimmed.length < 3 || trimmed.length > 60) {
    return 'Roadmap name must be between 3 and 60 characters';
  }
  // ASCII check
  if (!/^[\x20-\x7E]+$/.test(trimmed)) {
    return 'Roadmap name must contain ASCII printable characters only';
  }
  return null;
}

export function validateMilestoneTitle(title: string): string | null {
  const trimmed = (title || '').trim();
  if (trimmed.length < 5 || trimmed.length > 80) {
    return 'Milestone title must be between 5 and 80 characters';
  }
  if (!/^[\x20-\x7E]+$/.test(trimmed)) {
    return 'Milestone title must contain ASCII printable characters only';
  }
  return null;
}

export function validateCriterion(criterion: string): string | null {
  const trimmed = (criterion || '').trim();
  if (trimmed.length < 10 || trimmed.length > 160) {
    return 'Criterion must be between 10 and 160 characters';
  }
  if (!/^[\x20-\x7E]+$/.test(trimmed)) {
    return 'Criterion must contain ASCII printable characters only';
  }
  return null;
}

export function validateWeight(weight: number | string): string | null {
  const num = typeof weight === 'number' ? weight : parseInt(weight, 10);
  if (!Number.isInteger(num) || isNaN(num)) {
    return 'Weight must be an integer';
  }
  if (num < 1 || num > 10) {
    return 'Weight must be between 1 and 10';
  }
  return null;
}

export function validateEvidenceUrl(
  url: string,
  expectedHost?: string,
  expectedDir?: string
): UrlValidationResult {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'evidence URL must be a string' };
  }
  if (url.length > 300) {
    return { valid: false, error: 'evidence URL exceeds 300 characters' };
  }
  if (!url.startsWith('https://')) {
    return { valid: false, error: 'evidence URL must use https scheme' };
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { valid: false, error: 'evidence URL is malformed' };
  }

  if (parsed.protocol !== 'https:') {
    return { valid: false, error: 'evidence URL must use https scheme' };
  }
  if (parsed.hash) {
    return { valid: false, error: 'evidence URL must not contain fragment' };
  }
  if (parsed.search) {
    return { valid: false, error: 'evidence URL must not contain query parameters' };
  }
  if (parsed.username || parsed.password) {
    return { valid: false, error: 'evidence URL must not contain userinfo' };
  }
  if (parsed.port && parsed.port !== '443') {
    return { valid: false, error: 'evidence URL port must be 443 or omitted' };
  }

  const hostname = parsed.hostname.toLowerCase().trim();
  if (!hostname) {
    return { valid: false, error: 'evidence URL missing valid host' };
  }

  // Prevent local/ip hosts
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    /^\d+\.\d+\.\d+\.\d+$/.test(hostname) ||
    hostname.includes(':')
  ) {
    return { valid: false, error: 'evidence URL host must not be local or IP address' };
  }

  // Extract dir path: path up to last '/' with trailing '/'
  const pathname = parsed.pathname || '/';
  const lastSlash = pathname.lastIndexOf('/');
  const dirPath = lastSlash >= 0 ? pathname.slice(0, lastSlash + 1) : '/';

  if (expectedHost && hostname !== expectedHost.toLowerCase().trim()) {
    return {
      valid: false,
      host: hostname,
      dir: dirPath,
      error: `evidence host ${hostname} does not match expected ${expectedHost}`,
    };
  }

  if (expectedDir && dirPath !== expectedDir) {
    return {
      valid: false,
      host: hostname,
      dir: dirPath,
      error: `evidence dir ${dirPath} does not match initial evidence dir ${expectedDir}`,
    };
  }

  return { valid: true, host: hostname, dir: dirPath };
}

export function validateAddress(address: string): string | null {
  if (!address || typeof address !== 'string') {
    return 'Address is required';
  }
  const clean = address.trim();
  if (!/^0x[0-9a-fA-F]{40}$/.test(clean)) {
    return 'Invalid address format (expected 0x followed by 40 hex characters)';
  }
  return null;
}

export interface TrancheInput {
  milestone_index: number;
  amount: number | string;
}

export function validateGrantTranches(
  tranches: TrancheInput[],
  milestoneCount: number,
  funderBalance?: number | string
): string | null {
  if (!Array.isArray(tranches) || tranches.length === 0) {
    return 'At least one tranche is required';
  }
  if (tranches.length > 6) {
    return 'Cannot have more than 6 tranches';
  }

  const seenMilestones = new Set<number>();
  let totalAmount = 0;

  for (let i = 0; i < tranches.length; i++) {
    const t = tranches[i];
    if (typeof t.milestone_index !== 'number' || !Number.isInteger(t.milestone_index)) {
      return `Tranche ${i}: invalid milestone index`;
    }
    if (t.milestone_index < 0 || t.milestone_index >= milestoneCount) {
      return `Tranche ${i}: milestone index ${t.milestone_index} is out of bounds (0-${milestoneCount - 1})`;
    }
    if (seenMilestones.has(t.milestone_index)) {
      return `Tranche ${i}: duplicate milestone index ${t.milestone_index}`;
    }
    seenMilestones.add(t.milestone_index);

    const amount = typeof t.amount === 'number' ? t.amount : parseInt(t.amount, 10);
    if (!Number.isInteger(amount) || isNaN(amount) || amount <= 0) {
      return `Tranche ${i}: amount must be a positive integer`;
    }
    totalAmount += amount;
  }

  if (funderBalance !== undefined) {
    const bal = typeof funderBalance === 'number' ? funderBalance : parseInt(funderBalance, 10);
    if (!isNaN(bal) && bal < totalAmount) {
      return `Insufficient demo credit balance: have ${bal}, grant requires ${totalAmount}`;
    }
  }

  return null;
}
