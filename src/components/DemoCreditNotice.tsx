import React from 'react';
import { Info } from 'lucide-react';

interface DemoCreditNoticeProps {
  compact?: boolean;
}

export const DemoCreditNotice: React.FC<DemoCreditNoticeProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <p className="text-xs text-[#5C5F56] dark:text-[#A8ABA0] flex items-center gap-1.5 mt-1">
        <Info className="w-3.5 h-3.5 shrink-0 text-[#A0451E]" />
        <span>Demo credits are simulated internal units for preview only; they hold no monetary value.</span>
      </p>
    );
  }

  return (
    <div
      className="p-4 rounded-md border border-[#D5CDBD] dark:border-[#3D4036] bg-[#EEE8D8] dark:bg-[#252722] text-[#22231F] dark:text-[#EDECE6] flex items-start gap-3 my-4"
      role="note"
      aria-label="Demo credit notice"
    >
      <Info className="w-5 h-5 shrink-0 text-[#A0451E] mt-0.5" />
      <div className="text-sm space-y-1">
        <p className="font-semibold text-[#22231F] dark:text-[#FFFFFF]">
          Demo Accounting Units (Preview Environment)
        </p>
        <p className="text-[#5C5F56] dark:text-[#A8ABA0]">
          Balances displayed across Roadmap Receipts and TrancheGate represent test demo credits. They are internal accounting tokens intended exclusively for verifying milestone release and reclaim rules on the preview chain, and carry no monetary value.
        </p>
      </div>
    </div>
  );
};
