import React from 'react';
import { ACTIVE_CONTRACTS, SUPERSEDED_CONTRACTS, PROBE_HARNESS, NETWORK } from '../config/deployments';
import { ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#D5CDBD] dark:border-[#3D4036] bg-[#EEE8D8] dark:bg-[#1E201B] py-10 transition-colors mt-16 text-[#5C5F56] dark:text-[#A8ABA0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Col 1: System info */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#22231F] dark:text-[#EDECE6] tracking-tight">
              Roadmap Receipts (Preview)
            </h2>
            <p className="text-sm">
              Verifiable decentralized roadmap milestones with deterministic milestone progress calculation and tranche-gated escrow enforcement on GenLayer Studionet.
            </p>
            <p className="text-xs font-mono">
              Network: {NETWORK.name} (Chain ID {NETWORK.chainId})
            </p>
          </div>

          {/* Col 2: Active Deployments */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#22231F] dark:text-[#EDECE6] tracking-tight">
              Active Contracts (v2)
            </h2>
            <ul className="text-xs font-mono space-y-2">
              <li>
                <span className="font-semibold block text-[#22231F] dark:text-white">RoadmapLedger:</span>
                <a
                  href={ACTIVE_CONTRACTS.RoadmapLedger.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#4F6B3A] dark:text-[#8BB370] hover:underline inline-flex items-center gap-1 break-all"
                >
                  <span>{ACTIVE_CONTRACTS.RoadmapLedger.address}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </li>
              <li>
                <span className="font-semibold block text-[#22231F] dark:text-white">TrancheGate:</span>
                <a
                  href={ACTIVE_CONTRACTS.TrancheGate.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#4F6B3A] dark:text-[#8BB370] hover:underline inline-flex items-center gap-1 break-all"
                >
                  <span>{ACTIVE_CONTRACTS.TrancheGate.address}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Repositories & Traceability */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#22231F] dark:text-[#EDECE6] tracking-tight">
              Audit & Traceability
            </h2>
            <ul className="text-sm space-y-1.5">
              <li>
                <a
                  href="https://github.com/hypercybers99/roadmap-receipts-genlayer/tree/rr-v1"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline text-[#A0451E] dark:text-[#F3BAA4] inline-flex items-center gap-1"
                >
                  <span>Contract Repo (tag rr-v1)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/hypercybers99/roadmap-receipts-app"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline text-[#A0451E] dark:text-[#F3BAA4] inline-flex items-center gap-1"
                >
                  <span>Web App Repo (roadmap-receipts-app)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <span className="text-xs text-[#8C8F84]">
                  Superseded v1 pair: {SUPERSEDED_CONTRACTS.RoadmapLedger.address.slice(0, 10)}... | Harness: {PROBE_HARNESS.address.slice(0, 10)}...
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer row */}
        <div className="pt-6 border-t border-[#D5CDBD] dark:border-[#3D4036] text-xs text-[#6A6D65] dark:text-[#8C8F84] text-center space-y-1">
          <p>
            Demo credits are internal accounting units strictly for demonstration on GenLayer Studionet preview environment. They do not constitute financial value, currency, or securities.
          </p>
          <p>
            Roadmap Receipts &copy; 2026. Distributed under the MIT License.
          </p>
        </div>
      </div>
    </footer>
  );
};
