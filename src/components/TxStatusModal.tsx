import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertOctagon, Loader2, ExternalLink, X } from 'lucide-react';
import type { ClassifiedReceipt } from '../lib/receipts';

export type TxPhase = 'idle' | 'awaiting_signature' | 'awaiting_consensus' | 'success' | 'error';

interface TxStatusModalProps {
  isOpen: boolean;
  phase: TxPhase;
  txHash?: string;
  classified?: ClassifiedReceipt;
  customSuccessMessage?: string;
  errorMessage?: string;
  onClose: () => void;
}

export const TxStatusModal: React.FC<TxStatusModalProps> = ({
  isOpen,
  phase,
  txHash,
  classified,
  customSuccessMessage,
  errorMessage,
  onClose,
}) => {
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    let timer: any = null;
    if (isOpen && (phase === 'awaiting_signature' || phase === 'awaiting_consensus')) {
      setElapsed(0);
      timer = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, phase]);

  if (!isOpen || phase === 'idle') return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tx-modal-title"
    >
      <div className="relative w-full max-w-lg p-6 bg-[#F7F4EC] dark:bg-[#1E201B] border-2 border-[#D5CDBD] dark:border-[#3D4036] rounded-lg shadow-xl text-[#22231F] dark:text-[#EDECE6]">
        {/* Close button if finished */}
        {(phase === 'success' || phase === 'error') && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded hover:bg-[#EEE8D8] dark:hover:bg-[#2B2D27] focus:outline-none focus:ring-2 focus:ring-[#A0451E]"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Phase: awaiting_signature */}
        {phase === 'awaiting_signature' && (
          <div className="text-center py-4 space-y-4">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-[#A0451E]" />
            <h2 id="tx-modal-title" className="text-xl font-bold">
              Confirm in Wallet
            </h2>
            <p className="text-sm text-[#5C5F56] dark:text-[#A8ABA0]">
              Please check your browser wallet extension and approve the transaction signature.
            </p>
            <div className="text-xs font-mono text-[#8C8F84]">Elapsed: {elapsed}s</div>
          </div>
        )}

        {/* Phase: awaiting_consensus */}
        {phase === 'awaiting_consensus' && (
          <div className="text-center py-4 space-y-4">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-[#4F6B3A]" />
            <h2 id="tx-modal-title" className="text-xl font-bold">
              Studionet Consensus in Progress
            </h2>
            <p className="text-sm text-[#5C5F56] dark:text-[#A8ABA0]">
              Transaction submitted. Waiting for validators to execute consensus and generate execution receipt.
            </p>
            {txHash && (
              <p className="text-xs font-mono truncate px-2 py-1 bg-[#EEE8D8] dark:bg-[#252722] rounded">
                TX: {txHash}
              </p>
            )}
            <div className="text-xs font-mono text-[#8C8F84]">Elapsed: {elapsed}s</div>
          </div>
        )}

        {/* Phase: success */}
        {phase === 'success' && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 text-[#4F6B3A] dark:text-[#7FA661]">
              <CheckCircle2 className="w-8 h-8 shrink-0" />
              <h2 id="tx-modal-title" className="text-xl font-bold">
                Transaction Confirmed
              </h2>
            </div>
            <p className="text-sm">
              {customSuccessMessage || 'Operation successfully executed and recorded on chain.'}
            </p>
            {classified?.statusName && (
              <div className="p-3 bg-[#E3E8DC] dark:bg-[#253818] rounded border border-[#4F6B3A] text-xs font-mono space-y-1">
                <div>Status: <span className="font-bold">{classified.statusName}</span></div>
                <div>Result: <span className="font-bold">{classified.resultName}</span></div>
                <div>Leader: <span className="font-bold">{classified.leaderResult}</span></div>
                {classified.returnValue !== undefined && (
                  <div>Return: <span className="font-bold">{String(classified.returnValue)}</span></div>
                )}
              </div>
            )}
            {txHash && (
              <a
                href={`https://explorer-studio.genlayer.com/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4F6B3A] hover:underline"
              >
                <span>View on GenLayer Explorer</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full min-h-[48px] py-2 px-4 bg-[#4F6B3A] text-white font-bold rounded hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Phase: error */}
        {phase === 'error' && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 text-[#9B3A2E] dark:text-[#E87568]">
              <AlertOctagon className="w-8 h-8 shrink-0" />
              <h2 id="tx-modal-title" className="text-xl font-bold">
                Execution Refused by Contract
              </h2>
            </div>

            {/* Error decoded mapping */}
            {classified?.errorDetails ? (
              <div className="space-y-3">
                <div className="p-3 bg-[#F8E1DE] dark:bg-[#401511] border border-[#9B3A2E] rounded text-sm space-y-2">
                  <p className="font-semibold text-[#9B3A2E] dark:text-[#F3BAA4]">
                    {classified.errorDetails.plainMessage}
                  </p>
                  <p className="text-xs text-[#5C5F56] dark:text-[#C5C8BD]">
                    <span className="font-bold">Next step: </span>
                    {classified.errorDetails.nextStep}
                  </p>
                </div>
                <div className="text-xs font-mono p-2 bg-[#EEE8D8] dark:bg-[#252722] rounded text-[#5C5F56] dark:text-[#A8ABA0] break-all">
                  Raw Contract Error: "{classified.decodedError || classified.errorDetails.template}"
                </div>
              </div>
            ) : (
              <div className="p-3 bg-[#F8E1DE] dark:bg-[#401511] border border-[#9B3A2E] rounded text-sm font-mono break-all">
                {classified?.decodedError || errorMessage || 'Contract execution failed'}
              </div>
            )}

            {txHash && (
              <a
                href={`https://explorer-studio.genlayer.com/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#A0451E] hover:underline"
              >
                <span>View Failed Transaction on Explorer</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full min-h-[48px] py-2 px-4 bg-[#9B3A2E] text-white font-bold rounded hover:opacity-90 transition-opacity"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
