/**
 * Receipt inspection, success rule enforcement, and error payload decoding.
 * Adheres strictly to the GenLayer Studionet consensus rules:
 * - status_name: ACCEPTED or FINALIZED
 * - result_name: MAJORITY_AGREE
 * - leader_receipt[0].execution_result: SUCCESS
 */

import { lookupError } from './errors';

export interface ClassifiedReceipt {
  isSuccess: boolean;
  statusName: string;
  resultName: string;
  leaderResult: string;
  decodedError?: string;
  returnValue?: any;
  errorDetails?: ReturnType<typeof lookupError>;
}

export function decodeBase64Safe(input: string): string {
  if (!input || typeof input !== 'string') return '';
  const clean = input.trim();
  // If it contains spaces, it is already plain text, not base64
  if (clean.includes(' ')) {
    return clean;
  }
  // If valid base64 pattern and length multiple of 4
  if (/^[A-Za-z0-9+/=]+$/.test(clean) && clean.length % 4 === 0) {
    try {
      const decoded = typeof window !== 'undefined' && typeof window.atob === 'function'
        ? window.atob(clean)
        : Buffer.from(clean, 'base64').toString('utf8');
      if (/^[\x20-\x7E\r\n\t]+$/.test(decoded)) {
        return decoded;
      }
    } catch {
      // not base64
    }
  }
  return clean;
}

export function sanitizeErrorMessage(raw: string): string {
  if (!raw) return '';
  // If raw string has non-printable characters, extract ASCII sequences
  const printableMatches = raw.match(/[\x20-\x7E]{3,}/g);
  if (printableMatches && printableMatches.length > 0) {
    const candidate = printableMatches.join(' ').trim();
    // Prefer the candidate if the original had control characters
    if (/[\x00-\x1F]/.test(raw)) {
      return candidate;
    }
  }
  return raw.trim();
}

export function extractLeaderReceipt(receipt: any): any {
  if (!receipt) return null;
  // Standard GenLayer SDK path
  if (receipt.consensus_data?.leader_receipt?.[0]) {
    return receipt.consensus_data.leader_receipt[0];
  }
  // Alternate/flattened paths
  if (Array.isArray(receipt.leader_receipt) && receipt.leader_receipt[0]) {
    return receipt.leader_receipt[0];
  }
  return null;
}

export function isReceiptSuccess(receipt: any): boolean {
  if (!receipt) return false;
  const status = (receipt.status_name || '').toUpperCase();
  const result = (receipt.result_name || '').toUpperCase();
  if (status !== 'ACCEPTED' && status !== 'FINALIZED') {
    return false;
  }
  if (result !== 'MAJORITY_AGREE') {
    return false;
  }
  const leader = extractLeaderReceipt(receipt);
  if (leader) {
    return (leader.execution_result || '').toUpperCase() === 'SUCCESS';
  }
  // Fallback for pre-formatted receipt objects
  if (receipt.leader_result) {
    return String(receipt.leader_result).toUpperCase() === 'SUCCESS';
  }
  return false;
}

export function decodeReceiptError(receiptOrPayload: any): string {
  if (!receiptOrPayload) return 'Unknown error: empty receipt or payload';

  // If passed directly as a string
  if (typeof receiptOrPayload === 'string') {
    const decoded = decodeBase64Safe(receiptOrPayload);
    return sanitizeErrorMessage(decoded) || receiptOrPayload;
  }

  // If passed an object with payload property
  let rawPayload: any = null;
  const leader = extractLeaderReceipt(receiptOrPayload);
  if (leader) {
    rawPayload = leader.result?.payload || leader.result || leader.error || leader.payload;
  } else if (receiptOrPayload.payload !== undefined) {
    rawPayload = receiptOrPayload.payload;
  } else if (receiptOrPayload.error !== undefined) {
    rawPayload = receiptOrPayload.error;
  }

  if (typeof rawPayload === 'object' && rawPayload !== null) {
    if (rawPayload.readable) return String(rawPayload.readable);
    if (rawPayload.error) return String(rawPayload.error);
    if (rawPayload.message) return String(rawPayload.message);
    if (rawPayload.payload) rawPayload = rawPayload.payload;
  }

  if (typeof rawPayload === 'string') {
    const decoded = decodeBase64Safe(rawPayload);
    const sanitized = sanitizeErrorMessage(decoded);
    return sanitized || rawPayload;
  }

  return 'Execution failed without error message';
}

export function parseReceiptReturn<T = any>(receipt: any): T {
  const leader = extractLeaderReceipt(receipt);
  let val: any = null;
  if (leader?.result?.payload) {
    val = leader.result.payload;
  } else if (leader?.result) {
    val = leader.result;
  } else if (receipt.payload?.readable) {
    val = receipt.payload.readable;
  } else if (receipt.payload) {
    val = receipt.payload;
  }

  if (typeof val === 'string') {
    // Try base64 decoding if base64-like
    try {
      const decoded = decodeBase64Safe(val);
      if (decoded.startsWith('{') || decoded.startsWith('[') || decoded.startsWith('"')) {
        return JSON.parse(decoded) as T;
      }
    } catch {
      // not base64 json
    }

    try {
      return JSON.parse(val) as T;
    } catch {
      return val as T;
    }
  }

  return val as T;
}

export function classifyReceipt(receipt: any): ClassifiedReceipt {
  const isSuccess = isReceiptSuccess(receipt);
  const statusName = receipt?.status_name || 'UNKNOWN';
  const resultName = receipt?.result_name || 'UNKNOWN';
  const leader = extractLeaderReceipt(receipt);
  const leaderResult = leader?.execution_result || receipt?.leader_result || (isSuccess ? 'SUCCESS' : 'ERROR');

  if (isSuccess) {
    return {
      isSuccess: true,
      statusName,
      resultName,
      leaderResult,
      returnValue: parseReceiptReturn(receipt),
    };
  }

  const decodedError = decodeReceiptError(receipt);
  const errorDetails = lookupError(decodedError);

  return {
    isSuccess: false,
    statusName,
    resultName,
    leaderResult,
    decodedError,
    errorDetails,
  };
}
