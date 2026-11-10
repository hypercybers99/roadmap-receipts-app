import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getVerification } from '../services/readClient';
import { OutcomeStamp } from '../components/OutcomeStamp';
import { ArrowLeft, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import type { Verification } from '../types/contract';

export const VerificationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [verification, setVerification] = useState<Verification | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getVerification(id)
      .then(v => setVerification(v))
      .catch(console.warn)
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="text-center py-20 space-y-3">
        <Loader2 className="w-10 h-10 animate-spin mx-auto text-[#4F6B3A]" />
        <p className="text-sm text-[#5C5F56] dark:text-[#A8ABA0]">Loading verification receipt #{id}...</p>
      </div>
    );
  }

  if (!verification) {
    return (
      <div className="p-8 text-center rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#EEE8D8] dark:bg-[#1E201B] space-y-4">
        <AlertCircle className="w-10 h-10 mx-auto text-[#9B3A2E]" />
        <h2 className="text-xl font-bold">Verification #{id} Not Found</h2>
        <p className="text-sm text-[#5C5F56] dark:text-[#A8ABA0]">
          No verification receipt exists with this ID on RoadmapLedger.
        </p>
        <Link
          to="/roadmaps"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#4F6B3A] text-white font-bold rounded"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Roadmaps</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to={`/roadmaps/${verification.roadmap_id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5C5F56] hover:text-[#22231F] dark:text-[#A8ABA0] dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Roadmap #{verification.roadmap_id}</span>
        </Link>
      </div>

      {/* Main Receipt Card */}
      <div className="p-6 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#F7F4EC] dark:bg-[#22241F] space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D5CDBD] dark:border-[#3D4036] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#A0451E] dark:text-[#F3BAA4] uppercase px-2 py-0.5 rounded bg-[#EEE8D8] dark:bg-[#2B2D27] border border-[#D5CDBD] dark:border-[#4A4E42]">
                Verification Receipt #{verification.id}
              </span>
              <span className="text-xs text-[#5C5F56] dark:text-[#A8ABA0] font-mono">
                Seq: {verification.seq}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#22231F] dark:text-white mt-1">
              Milestone {verification.milestone_index} Verification
            </h1>
          </div>
          <div>
            <OutcomeStamp status={verification.status} size="lg" />
          </div>
        </div>

        {/* Execution Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded bg-[#EEE8D8] dark:bg-[#1E201B] border border-[#D5CDBD] dark:border-[#3D4036] space-y-2 text-xs">
            <span className="font-bold text-[#5C5F56] dark:text-[#A8ABA0] uppercase tracking-wider block">
              Consensus Pipeline
            </span>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#4F6B3A]" />
              <span className="font-semibold text-sm">
                Gate: {verification.tripwire ? 'TRIPWIRE GATED' : 'MODEL JUDGED'}
              </span>
            </div>
            <p className="text-[#5C5F56] dark:text-[#A8ABA0]">
              {verification.tripwire
                ? 'Deterministic pre-execution tripwire tripped (e.g. prompt injection, 404, or length restriction); model evaluation was safely bypassed.'
                : 'Passed pre-execution tripwire checks; evaluated by non-deterministic consensus model.'}
            </p>
          </div>

          <div className="p-4 rounded bg-[#EEE8D8] dark:bg-[#1E201B] border border-[#D5CDBD] dark:border-[#3D4036] space-y-2 text-xs font-mono">
            <span className="font-bold font-sans text-[#5C5F56] dark:text-[#A8ABA0] uppercase tracking-wider block">
              Execution Evidence
            </span>
            <div>
              <span className="text-[#5C5F56] dark:text-[#A8ABA0]">Norm Hash16: </span>
              <span className="font-bold">{verification.norm_hash16}</span>
            </div>
            <div>
              <span className="text-[#5C5F56] dark:text-[#A8ABA0]">Leader Reported: </span>
              <span className="font-bold">{verification.leader_reported}</span>
            </div>
            <div className="truncate">
              <span className="text-[#5C5F56] dark:text-[#A8ABA0]">Caller: </span>
              <span>{verification.caller}</span>
            </div>
          </div>
        </div>

        {/* Evidence URL Used */}
        <div className="p-4 rounded bg-[#EEE8D8] dark:bg-[#1E201B] border border-[#D5CDBD] dark:border-[#3D4036] space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5C5F56] dark:text-[#A8ABA0]">
            Evidence URL Evaluated
          </span>
          <a
            href={verification.evidence_url_used}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono text-[#4F6B3A] dark:text-[#8BB370] hover:underline break-all block"
          >
            {verification.evidence_url_used}
          </a>
        </div>

        {/* Criterion Judgments & Quotes */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#22231F] dark:text-white">
            Criterion Judgments & Extracted Quotes
          </h2>

          <div className="space-y-3">
            {verification.effective_labels.map((label, cIdx) => (
              <div
                key={cIdx}
                className="p-4 rounded border border-[#D5CDBD] dark:border-[#3D4036] bg-white dark:bg-[#252722] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#5C5F56] dark:text-[#A8ABA0]">
                    Criterion {cIdx + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#EEE8D8] dark:bg-[#1E201B] font-bold">
                      Raw: {verification.labels[cIdx] || 'N/A'}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      label === 'YES'
                        ? 'bg-[#E3E8DC] text-[#2D451E] dark:bg-[#253818] dark:text-[#C5DDB5]'
                        : label === 'PARTIAL'
                        ? 'bg-[#FBE8DF] text-[#782E10] dark:bg-[#421D0E] dark:text-[#F3BAA4]'
                        : label === 'NO'
                        ? 'bg-[#F8E1DE] text-[#6B2219] dark:bg-[#401511] dark:text-[#F0B2AC]'
                        : 'bg-[#EBE5EE] text-[#482F57] dark:bg-[#2C1D36] dark:text-[#D5BFE0]'
                    }`}>
                      Effective: {label}
                    </span>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <span className="font-semibold text-[#5C5F56] dark:text-[#A8ABA0]">Extracted Quote:</span>
                  <blockquote className="p-2 rounded bg-[#EEE8D8]/60 dark:bg-[#1E201B]/60 italic font-mono text-[11px] border-l-2 border-[#A0451E] break-words">
                    {verification.quotes[cIdx] || '(No verbatim quote extracted or tripped by gate)'}
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back Link */}
        <div className="pt-2">
          <Link
            to={`/roadmaps/${verification.roadmap_id}`}
            className="min-h-[48px] px-4 py-2 bg-[#4F6B3A] text-white font-bold rounded text-sm hover:opacity-90 inline-flex items-center gap-2"
          >
            <span>Back to Roadmap #{verification.roadmap_id}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
