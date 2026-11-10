import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRoadmap, listVerifications } from '../services/readClient';
import { updateEvidence, verifyMilestone } from '../services/walletClient';
import { useWallet } from '../context/WalletContext';
import { OutcomeStamp } from '../components/OutcomeStamp';
import { TxStatusModal, type TxPhase } from '../components/TxStatusModal';
import {
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  Coins,
  ShieldCheck,
  Edit2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import type { Roadmap, Verification } from '../types/contract';
import type { ClassifiedReceipt } from '../lib/receipts';

export const RoadmapDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { address } = useWallet();

  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Update Evidence state
  const [editingMilestoneIndex, setEditingMilestoneIndex] = useState<number | null>(null);
  const [newEvidenceUrl, setNewEvidenceUrl] = useState<string>('');
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Tx Status Modal
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [phase, setPhase] = useState<TxPhase>('idle');
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [classified, setClassified] = useState<ClassifiedReceipt | undefined>(undefined);
  const [customMsg, setCustomMsg] = useState<string | undefined>(undefined);

  const fetchRoadmapData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const rm = await getRoadmap(id);
      setRoadmap(rm);
      const vers = await listVerifications(id, 20);
      setVerifications(vers);
    } catch (err) {
      console.warn('Failed to load roadmap:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRoadmapData();
  }, [fetchRoadmapData]);

  const handleVerify = async (milestoneIndex: number) => {
    if (!id) return;
    setModalOpen(true);
    setPhase('awaiting_signature');
    setTxHash(undefined);
    setClassified(undefined);
    setCustomMsg(undefined);

    try {
      setPhase('awaiting_consensus');
      const res = await verifyMilestone(id, milestoneIndex, address || undefined);
      setTxHash(res.txHash);
      setClassified(res.classified);

      if (res.classified.isSuccess) {
        setPhase('success');
        setCustomMsg(`Milestone ${milestoneIndex} verified successfully!`);
        fetchRoadmapData();
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
        decodedError: err?.message || 'Verification execution failed',
      });
    }
  };

  const handleUpdateEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || editingMilestoneIndex === null) return;
    setUpdateError(null);

    setModalOpen(true);
    setPhase('awaiting_signature');
    setTxHash(undefined);
    setClassified(undefined);

    try {
      setPhase('awaiting_consensus');
      const res = await updateEvidence(id, editingMilestoneIndex, newEvidenceUrl, address || undefined);
      setTxHash(res.txHash);
      setClassified(res.classified);

      if (res.classified.isSuccess) {
        setPhase('success');
        setCustomMsg(`Evidence URL for milestone ${editingMilestoneIndex} updated successfully!`);
        setEditingMilestoneIndex(null);
        setNewEvidenceUrl('');
        fetchRoadmapData();
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
        decodedError: err?.message || 'Update evidence failed',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20 space-y-3">
        <Loader2 className="w-10 h-10 animate-spin mx-auto text-[#4F6B3A]" />
        <p className="text-sm text-[#5C5F56] dark:text-[#A8ABA0]">Loading roadmap data from Studionet...</p>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="p-8 text-center rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#EEE8D8] dark:bg-[#1E201B] space-y-4">
        <AlertCircle className="w-10 h-10 mx-auto text-[#9B3A2E]" />
        <h2 className="text-xl font-bold">Roadmap #{id} Not Found</h2>
        <p className="text-sm text-[#5C5F56] dark:text-[#A8ABA0]">
          The requested roadmap ID does not exist on RoadmapLedger.
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

  const isOwner = address && roadmap.owner.toLowerCase() === address.toLowerCase();

  return (
    <div className="space-y-8">
      {/* Top navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/roadmaps"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5C5F56] hover:text-[#22231F] dark:text-[#A8ABA0] dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Roadmaps</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={`/grants/new?roadmapId=${roadmap.id}`}
            className="min-h-[48px] px-4 py-2 bg-[#A0451E] text-white font-bold rounded-md hover:opacity-90 inline-flex items-center gap-2"
          >
            <Coins className="w-4 h-4" />
            <span>Create Grant Escrow</span>
          </Link>
          <button
            onClick={fetchRoadmapData}
            className="min-h-[48px] px-3.5 py-2 border border-[#D5CDBD] dark:border-[#3D4036] rounded text-[#22231F] dark:text-white hover:bg-[#EEE8D8] dark:hover:bg-[#252722]"
            title="Refresh from chain"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Roadmap Overview Banner */}
      <div className="p-6 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#F7F4EC] dark:bg-[#22241F] space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#A0451E] dark:text-[#F3BAA4] uppercase px-2 py-0.5 rounded bg-[#EEE8D8] dark:bg-[#2B2D27] border border-[#D5CDBD] dark:border-[#4A4E42]">
                Roadmap #{roadmap.id}
              </span>
              <span className="text-xs text-[#5C5F56] dark:text-[#A8ABA0]">
                Seq: {roadmap.seq}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#22231F] dark:text-white mt-1">
              {roadmap.name}
            </h1>
            <p className="text-xs font-mono text-[#5C5F56] dark:text-[#A8ABA0] mt-1 break-all">
              Owner: <span className="text-[#22231F] dark:text-white font-semibold">{roadmap.owner}</span>
              {isOwner && (
                <span className="ml-2 text-xs font-sans font-bold text-[#4F6B3A] dark:text-[#8BB370]">
                  (You are owner)
                </span>
              )}
            </p>
          </div>

          <div className="text-left md:text-right p-4 rounded bg-[#EEE8D8] dark:bg-[#1E201B] border border-[#D5CDBD] dark:border-[#3D4036] min-w-[200px]">
            <span className="text-3xl font-mono font-extrabold text-[#4F6B3A] dark:text-[#8BB370]">
              {roadmap.progress_pct}%
            </span>
            <p className="text-xs text-[#5C5F56] dark:text-[#A8ABA0] uppercase font-bold tracking-wider">
              Completion Score
            </p>
            <p className="text-xs text-[#5C5F56] dark:text-[#A8ABA0] mt-1">
              {roadmap.verified_count} verified &bull; {roadmap.review_count} in review
            </p>
          </div>
        </div>

        {/* Milestones Hash */}
        <div className="text-xs font-mono p-3 rounded bg-[#EEE8D8] dark:bg-[#1E201B] border border-[#D5CDBD] dark:border-[#3D4036] break-all">
          <span className="text-[#5C5F56] dark:text-[#A8ABA0] block font-sans font-bold">
            Milestones Hash (SHA-256):
          </span>
          {roadmap.milestones_hash}
        </div>
      </div>

      {/* Milestones List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-[#22231F] dark:text-white tracking-tight">
          Milestones ({roadmap.milestones?.length || 0})
        </h2>

        <div className="space-y-4">
          {roadmap.milestones.map((m, idx) => (
            <div
              key={idx}
              className="p-6 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#F7F4EC] dark:bg-[#22241F] space-y-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D5CDBD] dark:border-[#3D4036] pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-bold text-[#A0451E] dark:text-[#F3BAA4]">
                    Index {m.index}
                  </span>
                  <h3 className="text-xl font-bold text-[#22231F] dark:text-white">
                    {m.title}
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#EEE8D8] dark:bg-[#2B2D27] text-[#5C5F56] dark:text-[#A8ABA0]">
                    Weight: {m.weight}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <OutcomeStamp status={m.latest_status} />
                  {m.latest_verification_id && (
                    <Link
                      to={`/verifications/${m.latest_verification_id}`}
                      className="text-xs font-mono text-[#4F6B3A] dark:text-[#8BB370] hover:underline"
                    >
                      Receipt #{m.latest_verification_id}
                    </Link>
                  )}
                </div>
              </div>

              {/* Criteria */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C5F56] dark:text-[#A8ABA0]">
                  Verification Criteria
                </h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {m.criteria.map((c, cIdx) => (
                    <li key={cIdx}>{c}</li>
                  ))}
                </ul>
              </div>

              {/* Evidence URL info */}
              <div className="p-3 rounded bg-[#EEE8D8] dark:bg-[#1E201B] border border-[#D5CDBD] dark:border-[#3D4036] space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#5C5F56] dark:text-[#A8ABA0]">Evidence URL:</span>
                  {isOwner && (
                    <button
                      onClick={() => {
                        setEditingMilestoneIndex(parseInt(m.index, 10));
                        setNewEvidenceUrl(m.evidence_url);
                      }}
                      className="text-[#A0451E] dark:text-[#F3BAA4] hover:underline font-semibold inline-flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Update URL</span>
                    </button>
                  )}
                </div>
                <a
                  href={m.evidence_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[#4F6B3A] dark:text-[#8BB370] hover:underline break-all inline-flex items-center gap-1"
                >
                  <span>{m.evidence_url}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
                <div className="text-[11px] text-[#8C8F84] pt-1 font-mono">
                  Host: {m.evidence_host} | Dir: {m.evidence_dir}
                </div>
              </div>

              {/* Actions row */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => handleVerify(parseInt(m.index, 10))}
                  className="min-h-[48px] px-4 py-2 bg-[#4F6B3A] text-white font-bold text-sm rounded hover:opacity-90 inline-flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Milestone {m.index}</span>
                </button>

                {m.latest_verification_id && (
                  <Link
                    to={`/verifications/${m.latest_verification_id}`}
                    className="min-h-[48px] px-4 py-2 border border-[#D5CDBD] dark:border-[#4A4E42] text-sm font-semibold rounded hover:bg-[#EEE8D8] dark:hover:bg-[#252722] inline-flex items-center gap-1.5"
                  >
                    <span>Inspect Receipt #{m.latest_verification_id}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verifications History */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-[#22231F] dark:text-white tracking-tight">
          Verifications History ({verifications.length})
        </h2>

        {verifications.length === 0 ? (
          <div className="p-6 text-center rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#EEE8D8] dark:bg-[#1E201B] text-sm text-[#5C5F56] dark:text-[#A8ABA0]">
            No verifications have been submitted for this roadmap yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#F7F4EC] dark:bg-[#22241F]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#D5CDBD] dark:border-[#3D4036] text-xs uppercase font-bold text-[#5C5F56] dark:text-[#A8ABA0] bg-[#EEE8D8] dark:bg-[#1E201B]">
                <tr>
                  <th className="py-2.5 px-4">ID</th>
                  <th className="py-2.5 px-4">Milestone</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Gate</th>
                  <th className="py-2.5 px-4">Caller</th>
                  <th className="py-2.5 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5CDBD] dark:divide-[#3D4036] font-mono text-xs">
                {verifications.map(v => (
                  <tr key={v.id} className="hover:bg-[#EEE8D8]/50 dark:hover:bg-[#2B2D27]/50">
                    <td className="py-3 px-4 font-bold">#{v.id}</td>
                    <td className="py-3 px-4">Milestone {v.milestone_index}</td>
                    <td className="py-3 px-4">
                      <OutcomeStamp status={v.status} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      {v.tripwire ? (
                        <span className="text-[#A0451E] font-bold">TRIPWIRE</span>
                      ) : (
                        <span className="text-[#5C5F56]">MODEL</span>
                      )}
                    </td>
                    <td className="py-3 px-4 truncate max-w-[120px]">{v.caller}</td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/verifications/${v.id}`}
                        className="text-[#4F6B3A] dark:text-[#8BB370] hover:underline font-sans font-semibold inline-flex items-center gap-1"
                      >
                        <span>Receipt</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Evidence URL Modal */}
      {editingMilestoneIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-lg p-6 bg-[#F7F4EC] dark:bg-[#1E201B] border-2 border-[#D5CDBD] dark:border-[#3D4036] rounded-lg space-y-4">
            <h3 className="text-xl font-bold">
              Update Evidence URL (Milestone {editingMilestoneIndex})
            </h3>
            <p className="text-xs text-[#5C5F56] dark:text-[#A8ABA0]">
              Contract requirement: The new URL must strictly match the initial evidence host ({roadmap.milestones[editingMilestoneIndex]?.evidence_host}) and directory ({roadmap.milestones[editingMilestoneIndex]?.evidence_dir}).
            </p>
            {updateError && (
              <p className="text-xs font-semibold text-[#9B3A2E]">{updateError}</p>
            )}
            <form onSubmit={handleUpdateEvidence} className="space-y-4">
              <input
                type="url"
                required
                maxLength={300}
                value={newEvidenceUrl}
                onChange={e => setNewEvidenceUrl(e.target.value)}
                className="w-full min-h-[48px] px-3 py-2 rounded border border-[#D5CDBD] dark:border-[#4A4E42] bg-white dark:bg-[#252722] text-xs font-mono"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMilestoneIndex(null)}
                  className="min-h-[48px] px-4 py-2 rounded border border-[#D5CDBD] dark:border-[#3D4036] text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[48px] px-4 py-2 bg-[#4F6B3A] text-white font-bold rounded text-sm hover:opacity-90"
                >
                  Submit Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TxStatusModal */}
      <TxStatusModal
        isOpen={modalOpen}
        phase={phase}
        txHash={txHash}
        classified={classified}
        customSuccessMessage={customMsg}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};
