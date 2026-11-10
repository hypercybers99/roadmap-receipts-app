import React, { useEffect, useState } from 'react';
import { getContractLimits } from '../services/readClient';
import { BookOpen, ShieldAlert, Loader2, RefreshCw } from 'lucide-react';
import type { ContractLimits } from '../types/contract';

export const LimitsPage: React.FC = () => {
  const [limits, setLimits] = useState<ContractLimits | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLimits = () => {
    setIsLoading(true);
    getContractLimits()
      .then(l => setLimits(l))
      .catch(console.warn)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchLimits();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#22231F] dark:text-[#EDECE6] tracking-tight">
            Contract Limits & Parameters
          </h1>
          <p className="text-sm text-[#5C5F56] dark:text-[#A8ABA0] mt-1">
            Exact limits enforced on-chain by RoadmapLedger. Read dynamically via `get_limits()`.
          </p>
        </div>
        <button
          onClick={fetchLimits}
          className="min-h-[48px] px-3.5 py-2 border border-[#D5CDBD] dark:border-[#3D4036] rounded text-[#22231F] dark:text-white hover:bg-[#EEE8D8] dark:hover:bg-[#252722] self-start sm:self-auto"
          title="Refresh limits from chain"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 space-y-3">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-[#4F6B3A]" />
          <p className="text-sm text-[#5C5F56] dark:text-[#A8ABA0]">Reading parameters from contract...</p>
        </div>
      ) : !limits ? (
        <div className="p-6 rounded bg-[#F8E1DE] dark:bg-[#401511] text-[#9B3A2E] text-center">
          Failed to load limits from chain.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Roadmap level limits */}
          <section className="p-6 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#F7F4EC] dark:bg-[#22241F] space-y-4 shadow-sm">
            <h2 className="text-lg font-bold text-[#22231F] dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#4F6B3A]" />
              <span>Roadmap Structure Limits</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded bg-[#EEE8D8] dark:bg-[#1E201B] border border-[#D5CDBD] dark:border-[#3D4036]">
                <span className="text-xs uppercase font-bold text-[#5C5F56] dark:text-[#A8ABA0]">
                  Roadmap Name Length
                </span>
                <p className="text-lg font-mono font-bold mt-1 text-[#22231F] dark:text-white">
                  {limits.min_roadmap_name_len} – {limits.max_roadmap_name_len} characters
                </p>
              </div>
              <div className="p-3 rounded bg-[#EEE8D8] dark:bg-[#1E201B] border border-[#D5CDBD] dark:border-[#3D4036]">
                <span className="text-xs uppercase font-bold text-[#5C5F56] dark:text-[#A8ABA0]">
                  Milestones per Roadmap
                </span>
                <p className="text-lg font-mono font-bold mt-1 text-[#22231F] dark:text-white">
                  {limits.min_milestones} – {limits.max_milestones} milestones
                </p>
              </div>
            </div>
          </section>

          {/* Milestone level limits */}
          <section className="p-6 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#F7F4EC] dark:bg-[#22241F] space-y-4 shadow-sm">
            <h2 className="text-lg font-bold text-[#22231F] dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#A0451E]" />
              <span>Milestone & Criteria Limits</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded bg-[#EEE8D8] dark:bg-[#1E201B] border border-[#D5CDBD] dark:border-[#3D4036]">
                <span className="text-xs uppercase font-bold text-[#5C5F56] dark:text-[#A8ABA0]">
                  Milestone Title Length
                </span>
                <p className="text-lg font-mono font-bold mt-1 text-[#22231F] dark:text-white">
                  {limits.min_milestone_title_len} – {limits.max_milestone_title_len} characters
                </p>
              </div>
              <div className="p-3 rounded bg-[#EEE8D8] dark:bg-[#1E201B] border border-[#D5CDBD] dark:border-[#3D4036]">
                <span className="text-xs uppercase font-bold text-[#5C5F56] dark:text-[#A8ABA0]">
                  Criteria per Milestone
                </span>
                <p className="text-lg font-mono font-bold mt-1 text-[#22231F] dark:text-white">
                  {limits.min_criteria_per_milestone} – {limits.max_criteria_per_milestone} items
                </p>
              </div>
              <div className="p-3 rounded bg-[#EEE8D8] dark:bg-[#1E201B] border border-[#D5CDBD] dark:border-[#3D4036]">
                <span className="text-xs uppercase font-bold text-[#5C5F56] dark:text-[#A8ABA0]">
                  Criterion Text Length
                </span>
                <p className="text-lg font-mono font-bold mt-1 text-[#22231F] dark:text-white">
                  {limits.min_criteria_text_len} – {limits.max_criteria_text_len} characters
                </p>
              </div>
              <div className="p-3 rounded bg-[#EEE8D8] dark:bg-[#1E201B] border border-[#D5CDBD] dark:border-[#3D4036]">
                <span className="text-xs uppercase font-bold text-[#5C5F56] dark:text-[#A8ABA0]">
                  Milestone Weight Range
                </span>
                <p className="text-lg font-mono font-bold mt-1 text-[#22231F] dark:text-white">
                  1 – 10 (integer)
                </p>
              </div>
            </div>
          </section>

          {/* Evidence and consensus limits */}
          <section className="p-6 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#F7F4EC] dark:bg-[#22241F] space-y-4 shadow-sm">
            <h2 className="text-lg font-bold text-[#22231F] dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#4F6B3A]" />
              <span>Evidence Fetching & Tripwire Limits</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded bg-[#EEE8D8] dark:bg-[#1E201B] border border-[#D5CDBD] dark:border-[#3D4036]">
                <span className="text-xs uppercase font-bold text-[#5C5F56] dark:text-[#A8ABA0]">
                  Max Evidence URL Length
                </span>
                <p className="text-lg font-mono font-bold mt-1 text-[#22231F] dark:text-white">
                  {limits.max_evidence_url_len} characters (https only)
                </p>
              </div>
              <div className="p-3 rounded bg-[#EEE8D8] dark:bg-[#1E201B] border border-[#D5CDBD] dark:border-[#3D4036]">
                <span className="text-xs uppercase font-bold text-[#5C5F56] dark:text-[#A8ABA0]">
                  Evidence Page Size Window
                </span>
                <p className="text-lg font-mono font-bold mt-1 text-[#22231F] dark:text-white">
                  {limits.min_evidence_page_chars} chars min – {limits.max_evidence_page_bytes} bytes max
                </p>
              </div>
              <div className="p-3 rounded bg-[#EEE8D8] dark:bg-[#1E201B] border border-[#D5CDBD] dark:border-[#3D4036]">
                <span className="text-xs uppercase font-bold text-[#5C5F56] dark:text-[#A8ABA0]">
                  Verbatim Quote Length Window
                </span>
                <p className="text-lg font-mono font-bold mt-1 text-[#22231F] dark:text-white">
                  {limits.min_quote_norm_chars} chars min – {limits.max_quote_len} chars max
                </p>
              </div>
              <div className="p-3 rounded bg-[#EEE8D8] dark:bg-[#1E201B] border border-[#D5CDBD] dark:border-[#3D4036]">
                <span className="text-xs uppercase font-bold text-[#5C5F56] dark:text-[#A8ABA0]">
                  Schema Version
                </span>
                <p className="text-lg font-mono font-bold mt-1 text-[#22231F] dark:text-white">
                  Version {limits.schema_version}
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
