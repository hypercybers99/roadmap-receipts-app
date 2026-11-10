import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLedgerStats, getGateStats } from '../services/readClient';
import { ACTIVE_CONTRACTS, NETWORK } from '../config/deployments';
import { DemoCreditNotice } from '../components/DemoCreditNotice';
import { ShieldCheck, Coins, BookOpen, ArrowRight, ExternalLink, Activity } from 'lucide-react';
import type { LedgerStats, GateStats } from '../types/contract';

export const LandingPage: React.FC = () => {
  const [ledgerStats, setLedgerStats] = useState<LedgerStats | null>(null);
  const [gateStats, setGateStats] = useState<GateStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getLedgerStats(), getGateStats()])
      .then(([ls, gs]) => {
        if (isMounted) {
          setLedgerStats(ls);
          setGateStats(gs);
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.warn('Failed to load landing stats:', err);
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero section */}
      <section className="text-center max-w-3xl mx-auto space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEE8D8] dark:bg-[#252722] text-[#A0451E] dark:text-[#F3BAA4] text-xs uppercase tracking-widest font-bold border border-[#D5CDBD] dark:border-[#4A4E42]">
          <span>GenLayer Studionet Preview</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#A0451E]" />
          <span>Chain ID {NETWORK.chainId}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#22231F] dark:text-[#EDECE6] leading-tight">
          Verifiable Milestones. <br />
          <span className="text-[#4F6B3A] dark:text-[#8BB370]">Tranche-Gated Escrow.</span>
        </h1>

        <p className="text-lg text-[#5C5F56] dark:text-[#A8ABA0] leading-relaxed">
          Roadmap Receipts turns open-source project commitments into verifiable milestones on GenLayer. Non-deterministic consensus verifies public evidence, scores roadmap completion, and unlocks escrow tranches.
        </p>

        <DemoCreditNotice />

        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link
            to="/roadmaps"
            className="min-h-[48px] px-6 py-3 rounded-md bg-[#4F6B3A] text-white font-bold text-base hover:opacity-90 inline-flex items-center gap-2 shadow-sm"
          >
            <span>Explore Roadmaps</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/roadmaps/new"
            className="min-h-[48px] px-6 py-3 rounded-md border-2 border-[#D5CDBD] dark:border-[#4A4E42] bg-[#EEE8D8] dark:bg-[#252722] text-[#22231F] dark:text-white font-bold text-base hover:bg-[#E4DDCB] dark:hover:bg-[#2F322B] inline-flex items-center gap-2"
          >
            <span>Create Roadmap</span>
          </Link>
          <Link
            to="/credits"
            className="min-h-[48px] px-6 py-3 rounded-md border-2 border-[#A0451E] text-[#A0451E] dark:text-[#F3BAA4] font-bold text-base hover:bg-[#FBE8DF] dark:hover:bg-[#381B10] inline-flex items-center gap-2"
          >
            <Coins className="w-5 h-5" />
            <span>Claim Demo Credits</span>
          </Link>
        </div>
      </section>

      {/* On-Chain Metrics */}
      <section className="p-6 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#EEE8D8] dark:bg-[#1E201B]">
        <div className="flex items-center justify-between mb-4 border-b border-[#D5CDBD] dark:border-[#3D4036] pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#4F6B3A]" />
            <h2 className="text-lg font-bold text-[#22231F] dark:text-white">
              Current Network Metrics (Studionet RPC)
            </h2>
          </div>
          <span className="text-xs text-[#5C5F56] dark:text-[#A8ABA0] font-mono">
            {isLoading ? 'Reading chain...' : 'Connected'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded bg-[#F7F4EC] dark:bg-[#252722] border border-[#D5CDBD] dark:border-[#3D4036]">
            <p className="text-xs text-[#5C5F56] dark:text-[#A8ABA0] uppercase font-bold tracking-wider">
              Total Roadmaps
            </p>
            <p className="text-2xl font-mono font-extrabold text-[#22231F] dark:text-white mt-1">
              {isLoading ? '...' : ledgerStats?.total_roadmaps || '0'}
            </p>
          </div>
          <div className="p-4 rounded bg-[#F7F4EC] dark:bg-[#252722] border border-[#D5CDBD] dark:border-[#3D4036]">
            <p className="text-xs text-[#5C5F56] dark:text-[#A8ABA0] uppercase font-bold tracking-wider">
              Total Verifications
            </p>
            <p className="text-2xl font-mono font-extrabold text-[#22231F] dark:text-white mt-1">
              {isLoading ? '...' : ledgerStats?.total_verifications || '0'}
            </p>
          </div>
          <div className="p-4 rounded bg-[#F7F4EC] dark:bg-[#252722] border border-[#D5CDBD] dark:border-[#3D4036]">
            <p className="text-xs text-[#5C5F56] dark:text-[#A8ABA0] uppercase font-bold tracking-wider">
              Total Grants
            </p>
            <p className="text-2xl font-mono font-extrabold text-[#22231F] dark:text-white mt-1">
              {isLoading ? '...' : gateStats?.total_grants || '0'}
            </p>
          </div>
          <div className="p-4 rounded bg-[#F7F4EC] dark:bg-[#252722] border border-[#D5CDBD] dark:border-[#3D4036]">
            <p className="text-xs text-[#5C5F56] dark:text-[#A8ABA0] uppercase font-bold tracking-wider">
              Escrow in TrancheGate
            </p>
            <p className="text-2xl font-mono font-extrabold text-[#A0451E] dark:text-[#F3BAA4] mt-1">
              {isLoading ? '...' : `${gateStats?.total_escrow || '0'} Credits`}
            </p>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#F7F4EC] dark:bg-[#22241F] space-y-3">
          <div className="p-3 w-fit rounded bg-[#EEE8D8] dark:bg-[#2B2D27] text-[#4F6B3A]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#22231F] dark:text-white">
            Tripwire-Gated Consensus
          </h3>
          <p className="text-sm text-[#5C5F56] dark:text-[#A8ABA0]">
            Deterministic HTML stripping and normalized sha256 hashing protect verification from prompt injection, prompt alteration, and malformed inputs before model evaluation.
          </p>
          <Link to="/evidence" className="text-sm font-semibold text-[#4F6B3A] hover:underline inline-flex items-center gap-1">
            <span>View 60/60 Evidence Runs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="p-6 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#F7F4EC] dark:bg-[#22241F] space-y-3">
          <div className="p-3 w-fit rounded bg-[#EEE8D8] dark:bg-[#2B2D27] text-[#A0451E]">
            <Coins className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#22231F] dark:text-white">
            Tranche-Gated Escrow
          </h3>
          <p className="text-sm text-[#5C5F56] dark:text-[#A8ABA0]">
            Demo credit grants lock accounting units tied strictly to roadmap milestone indices. Anyone may trigger release upon verified delivery; missed tranches are reclaimed to the funder.
          </p>
          <Link to="/grants" className="text-sm font-semibold text-[#A0451E] hover:underline inline-flex items-center gap-1">
            <span>View Grants Escrow</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="p-6 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#F7F4EC] dark:bg-[#22241F] space-y-3">
          <div className="p-3 w-fit rounded bg-[#EEE8D8] dark:bg-[#2B2D27] text-[#4F6B3A]">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#22231F] dark:text-white">
            Exact Limits & Error Mapping
          </h3>
          <p className="text-sm text-[#5C5F56] dark:text-[#A8ABA0]">
            Every input rule is enforced by on-chain limits. All 59 contract errors are mapped to plain explanations, next steps, and raw execution payloads.
          </p>
          <Link to="/limits" className="text-sm font-semibold text-[#4F6B3A] hover:underline inline-flex items-center gap-1">
            <span>Inspect Contract Limits</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Active Deployments Table */}
      <section className="p-6 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#EEE8D8] dark:bg-[#1E201B] space-y-4">
        <h2 className="text-xl font-bold text-[#22231F] dark:text-white">
          Active Contracts on GenLayer Studionet (v2)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#D5CDBD] dark:border-[#3D4036] text-xs uppercase font-bold text-[#5C5F56] dark:text-[#A8ABA0]">
              <tr>
                <th className="py-2 px-3">Contract</th>
                <th className="py-2 px-3">Address</th>
                <th className="py-2 px-3">Deploy Transaction</th>
                <th className="py-2 px-3">Explorer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5CDBD] dark:divide-[#3D4036] font-mono text-xs">
              <tr>
                <td className="py-3 px-3 font-bold font-sans">RoadmapLedger (v2)</td>
                <td className="py-3 px-3 break-all">{ACTIVE_CONTRACTS.RoadmapLedger.address}</td>
                <td className="py-3 px-3 break-all">{ACTIVE_CONTRACTS.RoadmapLedger.deployTx}</td>
                <td className="py-3 px-3">
                  <a
                    href={ACTIVE_CONTRACTS.RoadmapLedger.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#4F6B3A] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Explorer</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold font-sans">TrancheGate (v2)</td>
                <td className="py-3 px-3 break-all">{ACTIVE_CONTRACTS.TrancheGate.address}</td>
                <td className="py-3 px-3 break-all">{ACTIVE_CONTRACTS.TrancheGate.deployTx}</td>
                <td className="py-3 px-3">
                  <a
                    href={ACTIVE_CONTRACTS.TrancheGate.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#4F6B3A] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Explorer</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
