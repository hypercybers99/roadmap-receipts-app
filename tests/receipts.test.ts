import { describe, it, expect } from 'vitest';
import {
  isReceiptSuccess,
  decodeReceiptError,
  parseReceiptReturn,
  classifyReceipt,
} from '../src/lib/receipts';

describe('Receipts Layer Verification', () => {
  const successReceipt = {
    status_name: 'ACCEPTED',
    result_name: 'MAJORITY_AGREE',
    consensus_data: {
      leader_receipt: [
        {
          execution_result: 'SUCCESS',
          result: {
            payload: Buffer.from(JSON.stringify('4')).toString('base64'),
          },
        },
      ],
    },
  };

  const finalizedSuccessReceipt = {
    status_name: 'FINALIZED',
    result_name: 'MAJORITY_AGREE',
    consensus_data: {
      leader_receipt: [
        {
          execution_result: 'SUCCESS',
          result: {
            payload: '"4"',
          },
        },
      ],
    },
  };

  const errorReceipt = {
    status_name: 'ACCEPTED',
    result_name: 'MAJORITY_AGREE',
    consensus_data: {
      leader_receipt: [
        {
          execution_result: 'ERROR',
          result: {
            payload: Buffer.from('cannot reclaim: milestone status is delivered').toString('base64'),
          },
        },
      ],
    },
  };

  it('correctly verifies successful receipts', () => {
    expect(isReceiptSuccess(successReceipt)).toBe(true);
    expect(isReceiptSuccess(finalizedSuccessReceipt)).toBe(true);
  });

  it('rejects error or non-majority receipts', () => {
    expect(isReceiptSuccess(errorReceipt)).toBe(false);

    expect(
      isReceiptSuccess({
        status_name: 'ACCEPTED',
        result_name: 'UNDECIDED',
        consensus_data: {
          leader_receipt: [{ execution_result: 'SUCCESS' }],
        },
      })
    ).toBe(false);

    expect(
      isReceiptSuccess({
        status_name: 'REJECTED',
        result_name: 'MAJORITY_AGREE',
        consensus_data: {
          leader_receipt: [{ execution_result: 'SUCCESS' }],
        },
      })
    ).toBe(false);
  });

  it('decodes base64 error payloads accurately', () => {
    const decoded = decodeReceiptError(errorReceipt);
    expect(decoded).toBe('cannot reclaim: milestone status is delivered');
  });

  it('parses return value from successful receipt', () => {
    const res = parseReceiptReturn(successReceipt);
    expect(res).toBe('4');
  });

  it('classifies successful receipt with clean structure', () => {
    const classified = classifyReceipt(successReceipt);
    expect(classified.isSuccess).toBe(true);
    expect(classified.statusName).toBe('ACCEPTED');
    expect(classified.resultName).toBe('MAJORITY_AGREE');
    expect(classified.returnValue).toBe('4');
  });

  it('classifies error receipt with contract error mapping and next step', () => {
    const classified = classifyReceipt(errorReceipt);
    expect(classified.isSuccess).toBe(false);
    expect(classified.statusName).toBe('ACCEPTED');
    expect(classified.leaderResult).toBe('ERROR');
    expect(classified.decodedError).toBe('cannot reclaim: milestone status is delivered');
    expect(classified.errorDetails?.contract).toBe('TrancheGate');
    expect(classified.errorDetails?.plainMessage).toContain('Funds can only be reclaimed when the milestone is verified MISSED.');
  });
});
