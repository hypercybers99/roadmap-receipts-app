import React from 'react';
import {
  EVIDENCE_SOURCE_META,
} from '../data/evidenceSummary';
import { SUPERSEDED_CONTRACTS, PROBE_HARNESS } from '../config/deployments';
import { ShieldCheck, CheckCircle2, AlertOctagon, ExternalLink, GitCommit } from 'lucide-react';

export const EvidencePage: React.FC = () => {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-[#22231F] dark:text-[#EDECE6] tracking-tight">
          Evidence & Chain Audit
        </h1>
        <p className="text-sm text-[#5C5F56] dark:text-[#A8ABA0] mt-1">
          Cryptographically backed audit records, robustness evaluations, error cases, and lifecycle receipts executed on GenLayer Studionet.
        </p>
      </div>

      {/* Audit Source Banner */}
      <div className="p-4 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#EEE8D8] dark:bg-[#1E201B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-[#4F6B3A]" />
          <span>
            Source of Truth: <strong className="font-mono">{EVIDENCE_SOURCE_META.repo}</strong> at commit <strong className="font-mono">{EVIDENCE_SOURCE_META.commit.slice(0, 10)}</strong> (tag <strong className="font-mono">{EVIDENCE_SOURCE_META.tag}</strong>)
          </span>
        </div>
        <a
          href={`https://github.com/${EVIDENCE_SOURCE_META.repo}/tree/${EVIDENCE_SOURCE_META.tag}`}
          target="_blank"
          rel="noreferrer"
          className="text-[#4F6B3A] dark:text-[#8BB370] font-semibold hover:underline inline-flex items-center gap-1"
        >
          <span>View Source Repository</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* 1. Robustness Summary */}
      <section className="p-6 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#F7F4EC] dark:bg-[#22241F] space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[#4F6B3A]" />
          <h2 className="text-xl font-bold text-[#22231F] dark:text-white">
            1. Robustness Evaluation (60/60 On-Chain Runs)
          </h2>
        </div>
        <p className="text-sm text-[#5C5F56] dark:text-[#A8ABA0]">
          Executed on GenLayer Studionet using 6 distinct fixture pages evaluated 10 times each (60 distinct transactions) across 0 prompt iterations.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded bg-[#EEE8D8] dark:bg-[#1E201B] border border-[#D5CDBD] dark:border-[#3D4036]">
            <span className="text-xs font-bold uppercase text-[#5C5F56] dark:text-[#A8ABA0]">Total Runs</span>
            <p className="text-2xl font-mono font-extrabold text-[#22231F] dark:text-white mt-1">60</p>
          </div>
          <div className="p-4 rounded bg-[#EEE8D8] dark:bg-[#1E201B] border border-[#D5CDBD] dark:border-[#3D4036]">
            <span className="text-xs font-bold uppercase text-[#5C5F56] dark:text-[#A8ABA0]">Agreement</span>
            <p className="text-2xl font-mono font-extrabold text-[#4F6B3A] dark:text-[#8BB370] mt-1">100%</p>
          </div>
          <div className="p-4 rounded bg-[#EEE8D8] dark:bg-[#1E201B] border border-[#D5CDBD] dark:border-[#3D4036]">
            <span className="text-xs font-bold uppercase text-[#5C5F56] dark:text-[#A8ABA0]">Prompt Iterations</span>
            <p className="text-2xl font-mono font-extrabold text-[#22231F] dark:text-white mt-1">0</p>
          </div>
          <div className="p-4 rounded bg-[#EEE8D8] dark:bg-[#1E201B] border border-[#D5CDBD] dark:border-[#3D4036]">
            <span className="text-xs font-bold uppercase text-[#5C5F56] dark:text-[#A8ABA0]">Unit Tests</span>
            <p className="text-2xl font-mono font-extrabold text-[#4F6B3A] dark:text-[#8BB370] mt-1">17/17</p>
          </div>
        </div>

        {/* Robustness table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm mt-2">
            <thead className="border-b border-[#D5CDBD] dark:border-[#3D4036] text-xs uppercase font-bold text-[#5C5F56] dark:text-[#A8ABA0]">
              <tr>
                <th className="py-2 px-3">Page / Test Scenario</th>
                <th className="py-2 px-3">Runs</th>
                <th className="py-2 px-3">Expected Outcome</th>
                <th className="py-2 px-3">Chain Result</th>
                <th className="py-2 px-3">Consensus Agreement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5CDBD] dark:divide-[#3D4036] font-mono text-xs">
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold">m1-delivered.md</td>
                <td className="py-2.5 px-3">10 / 10</td>
                <td className="py-2.5 px-3 text-[#4F6B3A] font-bold">DELIVERED</td>
                <td className="py-2.5 px-3 text-[#4F6B3A] font-bold">DELIVERED (10/10)</td>
                <td className="py-2.5 px-3">100%</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold">m1-delivered.html (HTML Strip)</td>
                <td className="py-2.5 px-3">10 / 10</td>
                <td className="py-2.5 px-3 text-[#4F6B3A] font-bold">DELIVERED</td>
                <td className="py-2.5 px-3 text-[#4F6B3A] font-bold">DELIVERED (10/10)</td>
                <td className="py-2.5 px-3">100%</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold">m2-partial.md</td>
                <td className="py-2.5 px-3">10 / 10</td>
                <td className="py-2.5 px-3 text-[#A0451E] font-bold">PARTIAL</td>
                <td className="py-2.5 px-3 text-[#A0451E] font-bold">PARTIAL (10/10)</td>
                <td className="py-2.5 px-3">100%</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold">m2-delivered.md</td>
                <td className="py-2.5 px-3">10 / 10</td>
                <td className="py-2.5 px-3 text-[#4F6B3A] font-bold">DELIVERED</td>
                <td className="py-2.5 px-3 text-[#4F6B3A] font-bold">DELIVERED (10/10)</td>
                <td className="py-2.5 px-3">100%</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold">m3-missed.md</td>
                <td className="py-2.5 px-3">10 / 10</td>
                <td className="py-2.5 px-3 text-[#9B3A2E] font-bold">MISSED</td>
                <td className="py-2.5 px-3 text-[#9B3A2E] font-bold">MISSED (10/10)</td>
                <td className="py-2.5 px-3">100%</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold">m3-injection.md (Tripwire Contained)</td>
                <td className="py-2.5 px-3">10 / 10</td>
                <td className="py-2.5 px-3 text-[#6B4C7D] font-bold">REVIEW</td>
                <td className="py-2.5 px-3 text-[#6B4C7D] font-bold">REVIEW (10/10)</td>
                <td className="py-2.5 px-3">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Error Cases Decoded Proof */}
      <section className="p-6 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#F7F4EC] dark:bg-[#22241F] space-y-4">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-6 h-6 text-[#9B3A2E]" />
          <h2 className="text-xl font-bold text-[#22231F] dark:text-white">
            2. Verified Error Cases & Decoded Payloads
          </h2>
        </div>
        <p className="text-sm text-[#5C5F56] dark:text-[#A8ABA0]">
          Contract execution refusals arrive with status ACCEPTED, result MAJORITY_AGREE, leader result ERROR, and an encoded payload. Our decoded error dictionary decodes all strings verbatim.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#D5CDBD] dark:border-[#3D4036] text-xs uppercase font-bold text-[#5C5F56] dark:text-[#A8ABA0]">
              <tr>
                <th className="py-2 px-3">Scenario</th>
                <th className="py-2 px-3">Tx Hash</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Decoded Error String</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5CDBD] dark:divide-[#3D4036] font-mono text-xs">
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold">HTTP 404 URL</td>
                <td className="py-2.5 px-3 truncate max-w-[140px]">
                  0xf304033f85a47fe1cf2434ef2318106b751a09eb3104c531ae73dc876b3bd04e
                </td>
                <td className="py-2.5 px-3 text-[#9B3A2E] font-bold">LEADER ERROR</td>
                <td className="py-2.5 px-3 text-[#9B3A2E] font-bold">HTTP status not 200: 404</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold">Page Too Short (&lt;150 chars)</td>
                <td className="py-2.5 px-3 truncate max-w-[140px]">
                  0x2a1ecf330366eb9f311c10714fc2a76f25450dd5b2d72f10731fa63bc876e6a1
                </td>
                <td className="py-2.5 px-3 text-[#9B3A2E] font-bold">LEADER ERROR</td>
                <td className="py-2.5 px-3 text-[#9B3A2E] font-bold">evidence page text too short: 63 characters (minimum 150)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold">Reclaim on Delivered</td>
                <td className="py-2.5 px-3 truncate max-w-[140px]">
                  0x0e5dbe48ebf5fb0b7c7f0782bfdebb835467dbb6903f56843c089745e1281db2
                </td>
                <td className="py-2.5 px-3 text-[#9B3A2E] font-bold">LEADER ERROR</td>
                <td className="py-2.5 px-3 text-[#9B3A2E] font-bold">cannot reclaim: milestone status is delivered</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold">Reclaim on Review</td>
                <td className="py-2.5 px-3 truncate max-w-[140px]">
                  0xa4966699ff9d6e8107dc6cb8623cf2c9ce224a1810f27c3ea45bcf5f76f45a19
                </td>
                <td className="py-2.5 px-3 text-[#9B3A2E] font-bold">LEADER ERROR</td>
                <td className="py-2.5 px-3 text-[#9B3A2E] font-bold">cannot reclaim: milestone status is review</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold">Duplicate Reclaim</td>
                <td className="py-2.5 px-3 truncate max-w-[140px]">
                  0xdb65f7c3554e2a6d4ee293aebbe39c87d4669818816ca4ba153cfb8ad368cf23
                </td>
                <td className="py-2.5 px-3 text-[#9B3A2E] font-bold">LEADER ERROR</td>
                <td className="py-2.5 px-3 text-[#9B3A2E] font-bold">tranche already reclaimed</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Real Reclaim Lifecycle & Conservation Invariant */}
      <section className="p-6 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#F7F4EC] dark:bg-[#22241F] space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-[#4F6B3A]" />
          <h2 className="text-xl font-bold text-[#22231F] dark:text-white">
            3. Real Reclaim Lifecycle & Conservation Invariant Proof
          </h2>
        </div>
        <p className="text-sm text-[#5C5F56] dark:text-[#A8ABA0]">
          Verified on chain in roadmap #4 / grant #2 where milestone M3 was verified MISSED. Reclaim of the MISSED tranche succeeded and returned 200 demo credits to the funder. Conservation of demo credits held before and after.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 rounded bg-[#EEE8D8] dark:bg-[#1E201B] border border-[#D5CDBD] dark:border-[#3D4036] text-center">
            <span className="text-xs uppercase font-bold text-[#5C5F56] dark:text-[#A8ABA0]">Funder Balance</span>
            <p className="text-xl font-mono font-bold text-[#22231F] dark:text-white mt-1">300 Credits</p>
          </div>
          <div className="p-3 rounded bg-[#EEE8D8] dark:bg-[#1E201B] border border-[#D5CDBD] dark:border-[#3D4036] text-center">
            <span className="text-xs uppercase font-bold text-[#5C5F56] dark:text-[#A8ABA0]">Recipient Balance</span>
            <p className="text-xl font-mono font-bold text-[#22231F] dark:text-white mt-1">700 Credits</p>
          </div>
          <div className="p-3 rounded bg-[#EEE8D8] dark:bg-[#1E201B] border border-[#D5CDBD] dark:border-[#3D4036] text-center">
            <span className="text-xs uppercase font-bold text-[#5C5F56] dark:text-[#A8ABA0]">Escrow Balance</span>
            <p className="text-xl font-mono font-bold text-[#22231F] dark:text-white mt-1">0 Credits</p>
          </div>
          <div className="p-3 rounded bg-[#E3E8DC] dark:bg-[#253818] border border-[#4F6B3A] text-center">
            <span className="text-xs uppercase font-bold text-[#4F6B3A] dark:text-[#C5DDB5]">Total System Credits</span>
            <p className="text-xl font-mono font-bold text-[#4F6B3A] dark:text-[#C5DDB5] mt-1">1,000 (Conserved)</p>
          </div>
        </div>
      </section>

      {/* 4. Superseded Deployments & Harness */}
      <section className="p-6 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#EEE8D8] dark:bg-[#1E201B] space-y-4">
        <h2 className="text-xl font-bold text-[#22231F] dark:text-white">
          4. Superseded Contracts & ProbeLabels Harness
        </h2>
        <p className="text-xs text-[#5C5F56] dark:text-[#A8ABA0]">
          These contracts were deployed during initial probe phases. All active application views strictly interact with active v2 pair.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#D5CDBD] dark:border-[#3D4036] text-xs uppercase font-bold text-[#5C5F56] dark:text-[#A8ABA0]">
              <tr>
                <th className="py-2 px-3">Role</th>
                <th className="py-2 px-3">Contract Address</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5CDBD] dark:divide-[#3D4036] font-mono text-xs">
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold">RoadmapLedger (v1)</td>
                <td className="py-2.5 px-3 break-all">{SUPERSEDED_CONTRACTS.RoadmapLedger.address}</td>
                <td className="py-2.5 px-3 text-[#A0451E] font-bold">Superseded</td>
                <td className="py-2.5 px-3 font-sans">Initial deployment pair v1</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold">TrancheGate (v1)</td>
                <td className="py-2.5 px-3 break-all">{SUPERSEDED_CONTRACTS.TrancheGate.address}</td>
                <td className="py-2.5 px-3 text-[#A0451E] font-bold">Superseded</td>
                <td className="py-2.5 px-3 font-sans">Bound to v1 RoadmapLedger</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold">ProbeLabels Harness</td>
                <td className="py-2.5 px-3 break-all">{PROBE_HARNESS.address}</td>
                <td className="py-2.5 px-3 text-[#5C5F56] font-bold">Test Harness</td>
                <td className="py-2.5 px-3 font-sans">Byte-for-byte parity harness for non-det consensus probe</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
