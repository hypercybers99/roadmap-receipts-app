/**
 * Browser wallet integration for GenLayer Studionet (Chain ID 61999).
 * Interacts via window.ethereum (EIP-1193) with zero private keys stored.
 * Fully compliant with Studionet receipt success rules and decoded error reporting.
 */

import { createClient, chains } from 'genlayer-js';
import { ACTIVE_CONTRACTS, NETWORK } from '../config/deployments';
import { classifyReceipt, type ClassifiedReceipt } from '../lib/receipts';
import { getLedgerStats, getGateStats } from './readClient';

export interface WalletWriteResult {
  txHash: string;
  receipt: any;
  classified: ClassifiedReceipt;
  resolvedId?: string;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const STUDIONET_CHAIN_ID_HEX = '0xf22f'; // 61999 in hex

export async function connectBrowserWallet(): Promise<{ address: string; chainId: number }> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask or Web3 browser wallet is not detected. Please install a Web3 wallet extension.');
  }

  const accounts: string[] = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });

  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts selected by user.');
  }

  const rawChainId: string = await window.ethereum.request({
    method: 'eth_chainId',
  });
  const chainId = parseInt(rawChainId, 16);

  if (chainId !== NETWORK.chainId) {
    await switchOrAddStudionet();
  }

  return {
    address: accounts[0].toLowerCase(),
    chainId: NETWORK.chainId,
  };
}

export async function switchOrAddStudionet(): Promise<void> {
  if (!window.ethereum) return;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: STUDIONET_CHAIN_ID_HEX }],
    });
  } catch (switchError: any) {
    // 4902 indicates the chain has not been added yet
    if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: STUDIONET_CHAIN_ID_HEX,
            chainName: NETWORK.name,
            rpcUrls: [NETWORK.rpcUrl],
            blockExplorerUrls: ['https://explorer-studio.genlayer.com'],
            nativeCurrency: {
              name: 'GEN',
              symbol: 'GEN',
              decimals: 18,
            },
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
}

export function getBrowserClient(userAddress?: string) {
  if (typeof window !== 'undefined' && window.ethereum) {
    return createClient({
      chain: chains.studionet,
      provider: window.ethereum,
      account: (userAddress || undefined) as `0x${string}` | undefined,
    });
  }
  return createClient({
    chain: chains.studionet,
  });
}

export async function executeWrite(options: {
  address: string;
  functionName: string;
  args: any[];
  userAddress?: string;
  idExtractorType?: 'roadmap' | 'grant';
}): Promise<WalletWriteResult> {
  const { address, functionName, args, userAddress, idExtractorType } = options;

  let beforeCount = 0;
  if (idExtractorType === 'roadmap') {
    try {
      const stats = await getLedgerStats();
      beforeCount = parseInt(stats.total_roadmaps, 10);
    } catch {
      // ignore
    }
  } else if (idExtractorType === 'grant') {
    try {
      const stats = await getGateStats();
      beforeCount = parseInt(stats.total_grants, 10);
    } catch {
      // ignore
    }
  }

  const client = getBrowserClient(userAddress);

  const txHash = await client.writeContract({
    address: address as `0x${string}`,
    functionName,
    args,
    value: BigInt(0),
  });

  const receipt = await client.waitForTransactionReceipt({
    hash: txHash,
    retries: 120,
    interval: 3000,
  });

  const classified = classifyReceipt(receipt);

  let resolvedId: string | undefined = undefined;
  if (classified.isSuccess) {
    if (classified.returnValue !== undefined && classified.returnValue !== null) {
      resolvedId = String(classified.returnValue).replace(/["']/g, '');
    } else if (idExtractorType === 'roadmap') {
      try {
        const afterStats = await getLedgerStats();
        const afterCount = parseInt(afterStats.total_roadmaps, 10);
        resolvedId = String(afterCount > beforeCount ? afterCount : beforeCount + 1);
      } catch {
        // fallback
      }
    } else if (idExtractorType === 'grant') {
      try {
        const afterStats = await getGateStats();
        const afterCount = parseInt(afterStats.total_grants, 10);
        resolvedId = String(afterCount > beforeCount ? afterCount : beforeCount + 1);
      } catch {
        // fallback
      }
    }
  }

  return {
    txHash,
    receipt,
    classified,
    resolvedId,
  };
}

export async function claimDemoCredits(userAddress?: string): Promise<WalletWriteResult> {
  return executeWrite({
    address: ACTIVE_CONTRACTS.TrancheGate.address,
    functionName: 'claim_demo_credits',
    args: [],
    userAddress,
  });
}

export async function createRoadmap(
  name: string,
  milestones: Array<{
    title: string;
    criteria: string[];
    weight: number;
    evidence_url: string;
  }>,
  userAddress?: string
): Promise<WalletWriteResult> {
  return executeWrite({
    address: ACTIVE_CONTRACTS.RoadmapLedger.address,
    functionName: 'create_roadmap',
    args: [name.trim(), JSON.stringify(milestones)],
    userAddress,
    idExtractorType: 'roadmap',
  });
}

export async function updateEvidence(
  roadmapId: string,
  milestoneIndex: number,
  newUrl: string,
  userAddress?: string
): Promise<WalletWriteResult> {
  return executeWrite({
    address: ACTIVE_CONTRACTS.RoadmapLedger.address,
    functionName: 'update_evidence',
    args: [String(roadmapId).trim(), milestoneIndex, newUrl.trim()],
    userAddress,
  });
}

export async function verifyMilestone(
  roadmapId: string,
  milestoneIndex: number,
  userAddress?: string
): Promise<WalletWriteResult> {
  return executeWrite({
    address: ACTIVE_CONTRACTS.RoadmapLedger.address,
    functionName: 'verify',
    args: [String(roadmapId).trim(), milestoneIndex],
    userAddress,
  });
}

export async function createGrant(
  roadmapId: string,
  recipient: string,
  tranches: Array<{
    milestone_index: number;
    amount: number;
  }>,
  userAddress?: string
): Promise<WalletWriteResult> {
  return executeWrite({
    address: ACTIVE_CONTRACTS.TrancheGate.address,
    functionName: 'create_grant',
    args: [String(roadmapId).trim(), recipient.toLowerCase().trim(), JSON.stringify(tranches)],
    userAddress,
    idExtractorType: 'grant',
  });
}

export async function releaseTranche(
  grantId: string,
  trancheIndex: number,
  userAddress?: string
): Promise<WalletWriteResult> {
  return executeWrite({
    address: ACTIVE_CONTRACTS.TrancheGate.address,
    functionName: 'release',
    args: [String(grantId).trim(), trancheIndex],
    userAddress,
  });
}

export async function reclaimTranche(
  grantId: string,
  trancheIndex: number,
  userAddress?: string
): Promise<WalletWriteResult> {
  return executeWrite({
    address: ACTIVE_CONTRACTS.TrancheGate.address,
    functionName: 'reclaim',
    args: [String(grantId).trim(), trancheIndex],
    userAddress,
  });
}
