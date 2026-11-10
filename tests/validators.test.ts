import { describe, it, expect } from 'vitest';
import {
  validateRoadmapName,
  validateMilestoneTitle,
  validateCriterion,
  validateWeight,
  validateEvidenceUrl,
  validateAddress,
  validateGrantTranches,
} from '../src/lib/validators';

describe('Client-Side Validators', () => {
  describe('validateRoadmapName', () => {
    it('accepts valid roadmap name', () => {
      expect(validateRoadmapName('Lumen Notes Roadmap')).toBeNull();
      expect(validateRoadmapName('ABC')).toBeNull(); // min 3
    });

    it('rejects too short or too long names', () => {
      expect(validateRoadmapName('ab')).toContain('between 3 and 60');
      expect(validateRoadmapName('a'.repeat(61))).toContain('between 3 and 60');
    });

    it('rejects non-ASCII characters', () => {
      expect(validateRoadmapName('Roadmap with emoji 🚀')).toContain('ASCII');
    });
  });

  describe('validateMilestoneTitle', () => {
    it('accepts valid milestone title', () => {
      expect(validateMilestoneTitle('Offline sync')).toBeNull();
      expect(validateMilestoneTitle('12345')).toBeNull(); // min 5
    });

    it('rejects short title', () => {
      expect(validateMilestoneTitle('Four')).toContain('between 5 and 80');
    });

    it('rejects title over 80 characters', () => {
      expect(validateMilestoneTitle('A'.repeat(81))).toContain('between 5 and 80');
    });
  });

  describe('validateCriterion', () => {
    it('accepts valid criterion', () => {
      expect(validateCriterion('A release note states that offline sync is available.')).toBeNull();
    });

    it('rejects too short criterion', () => {
      expect(validateCriterion('Too short')).toContain('between 10 and 160');
    });

    it('rejects criterion over 160 characters', () => {
      expect(validateCriterion('A'.repeat(161))).toContain('between 10 and 160');
    });
  });

  describe('validateWeight', () => {
    it('accepts weights 1 to 10', () => {
      expect(validateWeight(1)).toBeNull();
      expect(validateWeight(10)).toBeNull();
      expect(validateWeight('5')).toBeNull();
    });

    it('rejects invalid weights', () => {
      expect(validateWeight(0)).toContain('between 1 and 10');
      expect(validateWeight(11)).toContain('between 1 and 10');
      expect(validateWeight('abc')).toContain('integer');
    });
  });

  describe('validateEvidenceUrl', () => {
    const validUrl = 'https://raw.githubusercontent.com/hypercybers99/roadmap-receipts-fixtures/main/lumen/m1.md';

    it('accepts valid https URL', () => {
      const res = validateEvidenceUrl(validUrl);
      expect(res.valid).toBe(true);
      expect(res.host).toBe('raw.githubusercontent.com');
      expect(res.dir).toBe('/hypercybers99/roadmap-receipts-fixtures/main/lumen/');
    });

    it('rejects http scheme', () => {
      const res = validateEvidenceUrl('http://example.com/test.md');
      expect(res.valid).toBe(false);
      expect(res.error).toContain('https');
    });

    it('rejects fragments and query strings', () => {
      expect(validateEvidenceUrl(`${validUrl}#section`).valid).toBe(false);
      expect(validateEvidenceUrl(`${validUrl}?version=1`).valid).toBe(false);
    });

    it('rejects localhost and IP addresses', () => {
      expect(validateEvidenceUrl('https://localhost/test.md').valid).toBe(false);
      expect(validateEvidenceUrl('https://127.0.0.1/test.md').valid).toBe(false);
    });

    it('enforces expected host and directory match', () => {
      const resMatch = validateEvidenceUrl(
        validUrl,
        'raw.githubusercontent.com',
        '/hypercybers99/roadmap-receipts-fixtures/main/lumen/'
      );
      expect(resMatch.valid).toBe(true);

      const resBadHost = validateEvidenceUrl(validUrl, 'other-host.com');
      expect(resBadHost.valid).toBe(false);
      expect(resBadHost.error).toContain('does not match expected other-host.com');

      const resBadDir = validateEvidenceUrl(validUrl, 'raw.githubusercontent.com', '/other/path/');
      expect(resBadDir.valid).toBe(false);
      expect(resBadDir.error).toContain('does not match initial evidence dir');
    });
  });

  describe('validateAddress', () => {
    it('accepts valid 40 hex char address', () => {
      expect(validateAddress('0x711FFC1C4c6ACBea0E7B74B0cd40AF5A5fA5ADa4')).toBeNull();
      expect(validateAddress('0xaf562fd5c8910e1c2e0e946f085cc6eef2a0cf47')).toBeNull();
    });

    it('rejects bad address formats', () => {
      expect(validateAddress('not an address')).toContain('Invalid address format');
      expect(validateAddress('0x123')).toContain('Invalid address format');
    });
  });

  describe('validateGrantTranches', () => {
    it('accepts valid tranches', () => {
      const tranches = [
        { milestone_index: 0, amount: '300' },
        { milestone_index: 1, amount: 400 },
      ];
      expect(validateGrantTranches(tranches, 2, 1000)).toBeNull();
    });

    it('rejects empty tranches', () => {
      expect(validateGrantTranches([], 2)).toContain('At least one tranche');
    });

    it('rejects out of bounds milestone index', () => {
      expect(validateGrantTranches([{ milestone_index: 3, amount: 100 }], 2)).toContain('out of bounds');
    });

    it('rejects duplicate milestone index', () => {
      const tranches = [
        { milestone_index: 0, amount: 100 },
        { milestone_index: 0, amount: 200 },
      ];
      expect(validateGrantTranches(tranches, 2)).toContain('duplicate');
    });

    it('rejects insufficient funder balance', () => {
      const tranches = [{ milestone_index: 0, amount: 500 }];
      expect(validateGrantTranches(tranches, 1, 300)).toContain('Insufficient demo credit balance');
    });
  });
});
