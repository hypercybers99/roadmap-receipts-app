import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGrant, getRoadmap, isTrancheOpen } from '../services/readClient';
import { releaseTranche, reclaimTranche } from '../services/walletClient';
import { useWallet } from '../context/WalletContext';
import { OutcomeStamp } from '../components/OutcomeStamp';
import { TxStatusModal, type TxPhase } from '../components/TxStatusModal';
import { DemoCreditNotice } from '../components/DemoCreditNotice';
import {
  ArrowLeft,
  CheckCircle,
  RotateCcw,
  RefreshCw,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react';
import type { Grant, Roadmap, TrancheOpenStatus } from '../types/contract';
import type { ClassifiedReceipt } from '../lib/receipts';

export const GrantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { address, refreshBalance } = useWallet();

  const [grant, setGrant] = useState<Grant | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [openStatuses, setOpenStatuses] = useState<Record<number, TrancheOpenStatus>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Tx Modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [phase, setPhase] = useState<TxPhase>('idle');
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [classified, setClassified] = useState<ClassifiedReceipt | undefined>(undefined);
  const [customMsg, setCustomMsg] = useState<string | undefined>(undefined);

  const fetchGrantData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const g = await getGrant(id);
      setGrant(g);
      if (g) {
        const rm = await getRoadmap(g.roadmap_id);
        setRoadmap(rm);

        // Fetch is_tranche_open for each tranche
        const statuses: Record<number, TrancheOpenStatus> = {};
        for (const t of g.tranches) {
          const st = await isTrancheOpen(g.id, t.tranche_index);
          statuses[t.tranche_index] = st;
        }
        setOpenStatuses(statuses);
      }
    } catch (err) {
      console.warn('Failed to load grant data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGrantData();
  }, [fetchGrantData]);

  const handleRelease = async (trancheIndex: number) => {
    if (!grant) return;
    setModalOpen(true);
    setPhase('awaiting_signature');
    setTxHash(undefined);
    setClassified(undefined);
    setCustomMsg(undefined);

    try {
      setPhase('awaiting_consensus');
      const res = await releaseTranche(grant.id, trancheIndex, address || undefined);
      setTxHash(res.txHash);
      setClassified(res.classified);

      if (res.classified.isSuccess) {
        setPhase('success');
        setCustomMsg(`Tranche ${trancheIndex} released successfully to recipient!`);
        fetchGrantData();
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
        decodedError: err?.message || 'Release tranche execution failed',
      });
    }
  };

  const handleReclaim = async (trancheIndex: number) => {
    if (!grant) return;
    setModalOpen(true);
    setPhase('awaiting_signature');
    setTxHash(undefined);
    setClassified(undefined);
    setCustomMsg(undefined);

    try {
      setPhase('awaiting_consensus');
      const res = await reclaimTranche(grant.id, trancheIndex, address || undefined);
      setTxHash(res.txHash);
      setClassified(res.classified);

      if (res.classified.isSuccess) {
        setPhase('success');
        setCustomMsg(`Tranche ${trancheIndex} reclaimed successfully back to funder!`);
        fetchGrantData();
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
        decodedError: err?.message || 'Reclaim tranche execution failed',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20 space-y-3">
        <Loader2 className="w-10 h-10 animate-spin mx-auto text-[#A0451E]" />
        <h1 className="text-xl font-bold text-[#22231F] dark:text-[#EDECE6]">Loading Grant #{id}...</h1>
        <p className="text-sm text-[#5C5F56] dark:text-[#A8ABA0]">Loading grant #{id} from TrancheGate...</p>
      </div>
    );
  }

  if (!grant) {
    return (
      <div className="p-8 text-center rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#EEE8D8] dark:bg-[#1E201B] space-y-4">
        <AlertCircle className="w-10 h-10 mx-auto text-[#9B3A2E]" />
        <h1 className="text-xl font-bold text-[#22231F] dark:text-[#EDECE6]">Grant #{id} Not Found</h1>
        <p className="text-sm text-[#5C5F56] dark:text-[#A8ABA0]">
          No grant exists with this ID on TrancheGate.
        </p>
        <Link
          to="/grants"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#A0451E] text-white font-bold rounded"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Grants</span>
        </Link>
      </div>
    );
  }

  const isFunder = address && grant.funder.toLowerCase() === address.toLowerCase();
  const isRecipient = address && grant.recipient.toLowerCase() === address.toLowerCase();

  return (
    <div className="space-y-8">
      {/* Top navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/grants"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5C5F56] hover:text-[#22231F] dark:text-[#A8ABA0] dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Grants</span>
        </Link>

        <button
          onClick={fetchGrantData}
          className="min-h-[48px] px-3.5 py-2 border border-[#D5CDBD] dark:border-[#3D4036] rounded text-[#22231F] dark:text-white hover:bg-[#EEE8D8] dark:hover:bg-[#252722] self-start sm:self-auto"
          title="Refresh from chain"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <DemoCreditNotice />

      {/* Grant Overview Card */}
      <div className="p-6 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#F7F4EC] dark:bg-[#22241F] space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#A0451E] dark:text-[#F3BAA4] uppercase px-2 py-0.5 rounded bg-[#EEE8D8] dark:bg-[#2B2D27] border border-[#D5CDBD] dark:border-[#4A4E42]">
                Grant #{grant.id}
              </span>
              <Link
                to={`/roadmaps/${grant.roadmap_id}`}
                className="text-xs font-semibold text-[#4F6B3A] dark:text-[#8BB370] hover:underline"
              >
                Roadmap #{grant.roadmap_id} ({roadmap?.name || 'Inspect'})
              </Link>
            </div>
            <h1 className="text-3xl font-extrabold text-[#22231F] dark:text-white mt-1">
              Tranche-Gated Grant #{grant.id}
            </h1>
            <div className="space-y-1 text-xs font-mono text-[#5C5F56] dark:text-[#A8ABA0] mt-2">
              <div className="truncate">
                Funder: <span className="text-[#22231F] dark:text-white font-semibold">{grant.funder}</span>
                {isFunder && <span className="ml-1 text-[#A0451E] font-bold">(You)</span>}
              </div>
              <div className="truncate">
                Recipient: <span className="text-[#22231F] dark:text-white font-semibold">{grant.recipient}</span>
                {isRecipient && <span className="ml-1 text-[#4F6B3A] font-bold">(You)</span>}
              </div>
            </div>
          </div>

          <div className="p-4 rounded bg-[#EEE8D8] dark:bg-[#1E201B] border border-[#D5CDBD] dark:border-[#3D4036] min-w-[220px] text-left md:text-right">
            <span className="text-3xl font-mono font-extrabold text-[#A0451E] dark:text-[#F3BAA4]">
              {grant.escrow_balance}
            </span>
            <span className="text-sm font-mono text-[#5C5F56] dark:text-[#A8ABA0]"> / {grant.total_amount}</span>
            <p className="text-xs text-[#5C5F56] dark:text-[#A8ABA0] uppercase font-bold tracking-wider mt-0.5">
              Escrow Credits Remaining
            </p>
          </div>
        </div>

        {/* Milestones Hash binding */}
        <div className="text-xs font-mono p-3 rounded bg-[#EEE8D8] dark:bg-[#1E201B] border border-[#D5CDBD] dark:border-[#3D4036] break-all">
          <span className="text-[#5C5F56] dark:text-[#A8ABA0] block font-sans font-bold">
            Bound Milestones Hash:
          </span>
          {grant.milestones_hash}
        </div>
      </div>

      {/* Tranches Table / Cards */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-[#22231F] dark:text-white tracking-tight">
          Escrow Tranches ({grant.tranches?.length || 0})
        </h2>

        <div className="space-y-4">
          {grant.tranches.map(t => {
            const milestone = roadmap?.milestones?.find(m => parseInt(m.index, 10) === t.milestone_index);
            const openInfo = openStatuses[t.tranche_index];

            return (
              <div
                key={t.tranche_index}
                className="p-6 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#F7F4EC] dark:bg-[#22241F] space-y-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D5CDBD] dark:border-[#3D4036] pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-bold text-[#A0451E] dark:text-[#F3BAA4]">
                      Tranche #{t.tranche_index}
                    </span>
                    <span className="font-mono text-lg font-bold text-[#22231F] dark:text-white">
                      {t.amount} Demo Credits
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.released ? (
                      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-[#E3E8DC] text-[#2D451E] dark:bg-[#253818] dark:text-[#C5DDB5] rounded border border-[#4F6B3A]">
                        Released
                      </span>
                    ) : t.reclaimed ? (
                      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-[#F8E1DE] text-[#6B2219] dark:bg-[#401511] dark:text-[#F0B2AC] rounded border border-[#9B3A2E]">
                        Reclaimed
                      </span>
                    ) : (
                      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-[#EEE8D8] text-[#5C5F56] dark:bg-[#2B2D27] dark:text-[#A8ABA0] rounded border border-[#8C8F84] inline-flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Locked in Escrow</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Milestone Binding Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded bg-[#EEE8D8] dark:bg-[#1E201B] border border-[#D5CDBD] dark:border-[#3D4036] space-y-1">
                    <span className="font-bold text-[#5C5F56] dark:text-[#A8ABA0] uppercase tracking-wider">
                      Target Milestone #{t.milestone_index}
                    </span>
                    <p className="text-sm font-bold text-[#22231F] dark:text-white">
                      {milestone?.title || `Milestone Index ${t.milestone_index}`}
                    </p>
                    <div className="pt-1 flex items-center gap-2">
                      <span className="text-[#5C5F56] dark:text-[#A8ABA0]">Current Status:</span>
                      <OutcomeStamp status={milestone?.latest_status || 'PENDING'} size="sm" />
                    </div>
                  </div>

                  <div className="p-3 rounded bg-[#EEE8D8] dark:bg-[#1E201B] border border-[#D5CDBD] dark:border-[#3D4036] space-y-1 font-mono">
                    <span className="font-bold font-sans text-[#5C5F56] dark:text-[#A8ABA0] uppercase tracking-wider block">
                      Contract Open Check (`is_tranche_open`)
                    </span>
                    <div>
                      <span className="text-[#5C5F56] dark:text-[#A8ABA0]">Open: </span>
                      <span className={openInfo?.open === 'true' ? 'text-[#4F6B3A] font-bold' : 'text-[#9B3A2E] font-bold'}>
                        {openInfo?.open || '...'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#5C5F56] dark:text-[#A8ABA0]">Reason: </span>
                      <span className="font-semibold">{openInfo?.reason || '...'}</span>
                    </div>
                  </div>
                </div>

                {/* Tranche Actions */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  {/* Release Action */}
                  <button
                    onClick={() => handleRelease(t.tranche_index)}
                    disabled={t.released || t.reclaimed}
                    className={`min-h-[48px] px-4 py-2 font-bold text-sm rounded inline-flex items-center gap-2 transition-colors ${
                      t.released || t.reclaimed
                        ? 'bg-[#EEE8D8] dark:bg-[#2B2D27] text-[#8C8F84] cursor-not-allowed border border-[#D5CDBD] dark:border-[#3D4036]'
                        : 'bg-[#4F6B3A] text-white hover:opacity-90 shadow-sm'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Release Tranche {t.tranche_index}</span>
                  </button>

                  {/* Reclaim Action */}
                  <button
                    onClick={() => handleReclaim(t.tranche_index)}
                    disabled={t.released || t.reclaimed}
                    className={`min-h-[48px] px-4 py-2 font-bold text-sm rounded inline-flex items-center gap-2 transition-colors ${
                      t.released || t.reclaimed
                        ? 'bg-[#EEE8D8] dark:bg-[#2B2D27] text-[#8C8F84] cursor-not-allowed border border-[#D5CDBD] dark:border-[#3D4036]'
                        : 'border-2 border-[#9B3A2E] text-[#9B3A2E] dark:text-[#F3BAA4] hover:bg-[#F8E1DE] dark:hover:bg-[#401511]'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reclaim Tranche {t.tranche_index} (Funder Only)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
