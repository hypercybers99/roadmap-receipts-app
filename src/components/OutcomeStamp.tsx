import React from 'react';
import type { MilestoneStatus } from '../types/contract';

interface OutcomeStampProps {
  status: MilestoneStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const OutcomeStamp: React.FC<OutcomeStampProps> = ({ status, size = 'md' }) => {
  const norm = (status || 'PENDING').toUpperCase();

  let bgClass = 'bg-[#E3E8DC] text-[#2D451E] dark:bg-[#253818] dark:text-[#C5DDB5] border-[#4F6B3A]';
  let label = norm;

  if (norm === 'DELIVERED') {
    bgClass = 'bg-[#E3E8DC] text-[#2D451E] dark:bg-[#253818] dark:text-[#C5DDB5] border-[#4F6B3A]';
  } else if (norm === 'PARTIAL') {
    bgClass = 'bg-[#FBE8DF] text-[#782E10] dark:bg-[#421D0E] dark:text-[#F3BAA4] border-[#A0451E]';
  } else if (norm === 'MISSED') {
    bgClass = 'bg-[#F8E1DE] text-[#6B2219] dark:bg-[#401511] dark:text-[#F0B2AC] border-[#9B3A2E]';
  } else if (norm === 'REVIEW') {
    bgClass = 'bg-[#EBE5EE] text-[#482F57] dark:bg-[#2C1D36] dark:text-[#D5BFE0] border-[#6B4C7D]';
  } else {
    // PENDING
    bgClass = 'bg-[#EEE8D8] text-[#474942] dark:bg-[#2B2D27] dark:text-[#BBBDB4] border-[#8C8F84]';
    label = 'PENDING';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 border font-semibold rounded',
    md: 'text-sm px-3 py-1 border font-bold rounded',
    lg: 'text-base px-4 py-1.5 border-2 font-bold rounded-md',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 tracking-wide uppercase ${sizeClasses} ${bgClass}`}
      role="status"
      aria-label={`Status: ${label}`}
    >
      <span className="w-2 h-2 rounded-full bg-current" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};
