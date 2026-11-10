import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { claimDemoCredits } from '../services/walletClient';
import { DemoCreditNotice } from '../components/DemoCreditNotice';
import { TxStatusModal, type TxPhase } from '../components/TxStatusModal';
import { Coins, Sparkles, Wallet } from 'lucide-react';
import type { ClassifiedReceipt } from '../lib/receipts';

export const CreditsPage: React.FC = () => {
  const { address, balance, connect, refreshBalance } = useWallet();

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [phase, setPhase] = useState<TxPhase>('idle');
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [classified, setClassified] = useState<ClassifiedReceipt | undefined>(undefined);

  const handleClaim = async () => {
    if (!address) {
      await connect();
      return;
    }

    setModalOpen(true);
    setPhase('awaiting_signature');
    setTxHash(undefined);
    setClassified(undefined);

    try {
      setPhase('awaiting_consensus');
      const res = await claimDemoCredits(address);
      setTxHash(res.txHash);
      setClassified(res.classified);

      if (res.classified.isSuccess) {
        setPhase('success');
        refreshBalance();
      } else {
        setPhase('error');
      }
    } catch (err: any) {
      setPhase('error');
      setClassified({
        isSuccess: false,
        statusName: 'ERROR',
        resultName: 'REJECTED',
        leaderResult: 'ERROR',
        decodedError: err?.message || 'Claim demo credits failed',
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#22231F] dark:text-[#EDECE6] tracking-tight">
          Demo Credits
        </h1>
        <p className="text-sm text-[#5C5F56] dark:text-[#A8ABA0] mt-1">
          Mint 1,000 internal demo credits on TrancheGate to test grant escrow, release, and reclaim mechanics.
        </p>
      </div>

      <DemoCreditNotice />

      {/* Balance Card */}
      <div className="p-8 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#F7F4EC] dark:bg-[#22241F] space-y-6 text-center shadow-sm">
        <div className="p-4 w-16 h-16 rounded-full bg-[#EEE8D8] dark:bg-[#2B2D27] text-[#A0451E] mx-auto flex items-center justify-center">
          <Coins className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5C5F56] dark:text-[#A8ABA0]">
            Current Wallet Demo Balance
          </span>
          <p className="text-4xl font-mono font-extrabold text-[#22231F] dark:text-white">
            {balance} <span className="text-xl text-[#5C5F56] dark:text-[#A8ABA0]">Credits</span>
          </p>
          {address ? (
            <p className="text-xs font-mono text-[#5C5F56] dark:text-[#A8ABA0] truncate max-w-md mx-auto pt-1">
              Wallet: {address}
            </p>
          ) : (
            <p className="text-xs text-[#9B3A2E] font-semibold pt-1">
              Wallet not connected. Connect below to view and claim demo credits.
            </p>
          )}
        </div>

        <div className="pt-2 max-w-sm mx-auto">
          {address ? (
            <button
              onClick={handleClaim}
              className="w-full min-h-[48px] py-3 px-6 rounded-md bg-[#4F6B3A] text-white font-extrabold text-base hover:opacity-90 inline-flex items-center justify-center gap-2 shadow-sm"
            >
              <Sparkles className="w-5 h-5" />
              <span>Claim 1,000 Demo Credits</span>
            </button>
          ) : (
            <button
              onClick={connect}
              className="w-full min-h-[48px] py-3 px-6 rounded-md bg-[#4F6B3A] text-white font-extrabold text-base hover:opacity-90 inline-flex items-center justify-center gap-2 shadow-sm"
            >
              <Wallet className="w-5 h-5" />
              <span>Connect Wallet to Claim</span>
            </button>
          )}
        </div>
      </div>

      {/* Rules Information */}
      <div className="p-6 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#EEE8D8] dark:bg-[#1E201B] space-y-3">
        <h2 className="text-lg font-bold text-[#22231F] dark:text-white">
          TrancheGate Credit Rules
        </h2>
        <ul className="list-disc pl-5 text-sm space-y-1.5 text-[#5C5F56] dark:text-[#A8ABA0]">
          <li>
            <strong className="text-[#22231F] dark:text-white">One-time claim: </strong>
            Each address may invoke `claim_demo_credits()` exactly once to receive 1,000 demo credits.
          </li>
          <li>
            <strong className="text-[#22231F] dark:text-white">Strict escrow locking: </strong>
            When funding a grant, credits are deducted from the funder's balance and locked in contract escrow.
          </li>
          <li>
            <strong className="text-[#22231F] dark:text-white">Conservation of value: </strong>
            Every credit in escrow is either released to the recipient upon verified delivery or reclaimed to the funder upon verified milestone miss. Total system credits are conserved.
          </li>
        </ul>
      </div>

      {/* TxStatusModal */}
      <TxStatusModal
        isOpen={modalOpen}
        phase={phase}
        txHash={txHash}
        classified={classified}
        customSuccessMessage="1,000 demo credits successfully credited to your address!"
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};
