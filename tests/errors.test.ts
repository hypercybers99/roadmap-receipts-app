import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { CONTRACT_ERRORS, lookupError } from '../src/lib/errors';

function extractContractTemplates(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const templates = new Set<string>();
  lines.forEach(line => {
    if (line.includes('raise gl.vm.UserError')) {
      const match = line.match(/raise\s+gl\.vm\.UserError\((?:f?["'])([^"'\n]+)/);
      if (match) {
        templates.add(match[1].trim());
      }
    }
  });
  return Array.from(templates).sort();
}

describe('Contract Errors 1:1 Parity and Mapping Verification', () => {
  const rlPath = path.resolve(__dirname, '../contracts/RoadmapLedger.py');
  const tgPath = path.resolve(__dirname, '../contracts/TrancheGate.py');

  const contractRLTemplates = extractContractTemplates(rlPath);
  const contractTGTemplates = extractContractTemplates(tgPath);

  const mappedRL = CONTRACT_ERRORS.filter(e => e.contract === 'RoadmapLedger').map(e => e.template).sort();
  const mappedTG = CONTRACT_ERRORS.filter(e => e.contract === 'TrancheGate').map(e => e.template).sort();

  it('prints exact error template counts', () => {
    console.log(`\n======================================================`);
    console.log(`CONTRACT ERROR COUNT AUDIT:`);
    console.log(`RoadmapLedger.py contract error templates: ${contractRLTemplates.length}`);
    console.log(`RoadmapLedger mapped in errors.ts:         ${mappedRL.length}`);
    console.log(`TrancheGate.py contract error templates:   ${contractTGTemplates.length}`);
    console.log(`TrancheGate mapped in errors.ts:           ${mappedTG.length}`);
    console.log(`Total contract error templates:            ${contractRLTemplates.length + contractTGTemplates.length}`);
    console.log(`Total mapped in errors.ts:                 ${CONTRACT_ERRORS.length}`);
    console.log(`======================================================\n`);

    expect(contractRLTemplates.length).toBe(31);
    expect(contractTGTemplates.length).toBe(28);
    expect(CONTRACT_ERRORS.length).toBe(59);
  });

  it('verifies 1:1 bidirectional mapping for RoadmapLedger (empty diff both ways)', () => {
    const missingInMapping = contractRLTemplates.filter(t => !mappedRL.includes(t));
    const extraInMapping = mappedRL.filter(t => !contractRLTemplates.includes(t));

    expect(missingInMapping).toEqual([]);
    expect(extraInMapping).toEqual([]);
  });

  it('verifies 1:1 bidirectional mapping for TrancheGate (empty diff both ways)', () => {
    const missingInMapping = contractTGTemplates.filter(t => !mappedTG.includes(t));
    const extraInMapping = mappedTG.filter(t => !contractTGTemplates.includes(t));

    expect(missingInMapping).toEqual([]);
    expect(extraInMapping).toEqual([]);
  });

  it('successfully matches runtime formatted errors', () => {
    const r1 = lookupError('cannot reclaim: milestone status is review');
    expect(r1.template).toBe('cannot reclaim: milestone status is {curr_status.lower()}');
    expect(r1.contract).toBe('TrancheGate');

    const r2 = lookupError('duplicate observation: already recorded in verification 1');
    expect(r2.template).toBe('duplicate observation: already recorded in verification {existing_vid}');
    expect(r2.contract).toBe('RoadmapLedger');

    const r3 = lookupError('host or directory mismatch');
    expect(r3.template).toBe('host or directory mismatch');
    expect(r3.contract).toBe('RoadmapLedger');

    const r4 = lookupError('tranche already released');
    expect(r4.template).toBe('tranche already released');
    expect(r4.contract).toBe('TrancheGate');
  });
});
