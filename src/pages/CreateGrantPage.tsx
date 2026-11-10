import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { getRoadmap, listRoadmaps } from '../services/readClient';
import { createGrant } from '../services/walletClient';
import { validateAddress, validateGrantTranches } from '../lib/validators';
import { TxStatusModal, type TxPhase } from '../components/TxStatusModal';
import { DemoCreditNotice } from '../components/DemoCreditNotice';
import { ArrowLeft, Plus, Trash2, AlertCircle } from 'lucide-react';
import type { Roadmap } from '../types/contract';
import type { ClassifiedReceipt } from '../lib/receipts';

interface TrancheDraft {
  milestone_index: number;
  amount: string;
}

export const CreateGrantPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRoadmapId = searchParams.get('roadmapId') || '1';

  const { address, balance, connect, refreshBalance } = useWallet();

  const [roadmapId, setRoadmapId] = useState<string>(initialRoadmapId);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [availableRoadmaps, setAvailableRoadmaps] = useState<Roadmap[]>([]);
  const [recipient, setRecipient] = useState<string>('');
  const [tranches, setTranches] = useState<TrancheDraft[]>([
    { milestone_index: 0, amount: '100' },
  ]);
  const [formError, setFormError] = useState<string | null>(null);

  // Tx Modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [phase, setPhase] = useState<TxPhase>('idle');
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [classified, setClassified] = useState<ClassifiedReceipt | undefined>(undefined);
  const [createdGrantId, setCreatedGrantId] = useState<string | undefined>(undefined);

  // Fetch available roadmaps for dropdown
  useEffect(() => {
    listRoadmaps(15)
      .then(rms => setAvailableRoadmaps(rms))
      .catch(console.warn);
  }, []);

  // Fetch selected roadmap details
  useEffect(() => {
    if (!roadmapId) return;
    getRoadmap(roadmapId)
      .then(rm => {
        setSelectedRoadmap(rm);
        // Default tranches if none or out of range
        if (rm && rm.milestones.length > 0) {
          setTranches(
            rm.milestones.map((_, i) => ({
              milestone_index: i,
              amount: String((i + 1) * 100),
            }))
          );
        }
      })
      .catch(console.warn);
  }, [roadmapId]);

  const handleAddTranche = () => {
    if (!selectedRoadmap) return;
    if (tranches.length >= selectedRoadmap.milestones.length) {
      setFormError(`Cannot have more tranches than available milestones (${selectedRoadmap.milestones.length})`);
      return;
    }
    // Find first unused milestone index
    const used = new Set(tranches.map(t => t.milestone_index));
    let nextIdx = 0;
    for (let i = 0; i < selectedRoadmap.milestones.length; i++) {
      if (!used.has(i)) {
        nextIdx = i;
        break;
      }
    }
    setTranches([...tranches, { milestone_index: nextIdx, amount: '100' }]);
  };

  const handleRemoveTranche = (idx: number) => {
    if (tranches.length <= 1) {
      setFormError('Grant must contain at least 1 tranche');
      return;
    }
    setTranches(tranches.filter((_, i) => i !== idx));
  };

  const handleTrancheChange = (idx: number, field: keyof TrancheDraft, val: any) => {
    const updated = [...tranches];
    updated[idx] = { ...updated[idx], [field]: val };
    setTranches(updated);
  };

  const totalGrantAmount = tranches.reduce((sum, t) => sum + (parseInt(t.amount, 10) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!address) {
      await connect();
      return;
    }

    if (!selectedRoadmap) {
      setFormError('Please select a valid registered roadmap');
      return;
    }

    const addrErr = validateAddress(recipient);
    if (addrErr) {
      setFormError(addrErr);
      return;
    }

    const tranchesErr = validateGrantTranches(
      tranches.map(t => ({ milestone_index: t.milestone_index, amount: t.amount })),
      selectedRoadmap.milestones.length,
      balance
    );
    if (tranchesErr) {
      setFormError(tranchesErr);
      return;
    }

    setModalOpen(true);
    setPhase('awaiting_signature');
    setTxHash(undefined);
    setClassified(undefined);
    setCreatedGrantId(undefined);

    try {
      setPhase('awaiting_consensus');
      const formattedTranches = tranches.map(t => ({
        milestone_index: t.milestone_index,
        amount: parseInt(t.amount, 10),
      }));

      const res = await createGrant(selectedRoadmap.id, recipient, formattedTranches, address);
      setTxHash(res.txHash);
      setClassified(res.classified);

      if (res.classified.isSuccess) {
        setPhase('success');
        setCreatedGrantId(res.resolvedId);
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
        decodedError: err?.message || 'Create grant failed',
      });
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    if (phase === 'success' && createdGrantId) {
      navigate(`/grants/${createdGrantId}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/grants"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5C5F56] hover:text-[#22231F] dark:text-[#A8ABA0] dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Grants</span>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-extrabold text-[#22231F] dark:text-[#EDECE6] tracking-tight">
          Create Grant Escrow
        </h1>
        <p className="text-sm text-[#5C5F56] dark:text-[#A8ABA0] mt-1">
          Lock demo credits into TrancheGate escrow governed by verifiable roadmap milestone outcomes.
        </p>
      </div>

      <DemoCreditNotice />

      {formError && (
        <div className="p-4 rounded-md border border-[#9B3A2E] bg-[#F8E1DE] dark:bg-[#401511] text-[#9B3A2E] dark:text-[#F3BAA4] flex items-center gap-2 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Select Roadmap */}
        <div className="p-6 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#F7F4EC] dark:bg-[#22241F] space-y-4">
          <h2 className="text-lg font-bold text-[#22231F] dark:text-white">
            1. Select Target Roadmap
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#5C5F56] dark:text-[#A8ABA0] mb-1">
                Choose Registered Roadmap
              </label>
              <select
                value={roadmapId}
                onChange={e => setRoadmapId(e.target.value)}
                className="w-full min-h-[48px] px-3 py-2 rounded border border-[#D5CDBD] dark:border-[#4A4E42] bg-white dark:bg-[#252722] text-[#22231F] dark:text-white font-medium"
              >
                {availableRoadmaps.map(r => (
                  <option key={r.id} value={r.id}>
                    #{r.id} - {r.name} ({r.milestones?.length || 0} milestones)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#5C5F56] dark:text-[#A8ABA0] mb-1">
                Or Enter Roadmap ID
              </label>
              <input
                type="text"
                placeholder="e.g. 1"
                value={roadmapId}
                onChange={e => setRoadmapId(e.target.value)}
                className="w-full min-h-[48px] px-3 py-2 rounded border border-[#D5CDBD] dark:border-[#4A4E42] bg-white dark:bg-[#252722] text-[#22231F] dark:text-white font-mono"
              />
            </div>
          </div>

          {/* Selected Roadmap Summary */}
          {selectedRoadmap ? (
            <div className="p-4 rounded bg-[#EEE8D8] dark:bg-[#1E201B] border border-[#D5CDBD] dark:border-[#3D4036] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#22231F] dark:text-white">
                  Roadmap #{selectedRoadmap.id}: {selectedRoadmap.name}
                </span>
                <span className="font-mono text-[#4F6B3A] font-bold">
                  {selectedRoadmap.progress_pct}% Progress
                </span>
              </div>
              <p className="font-mono text-[#5C5F56] dark:text-[#A8ABA0] truncate">
                Owner: {selectedRoadmap.owner}
              </p>
              <div className="pt-1">
                <span className="font-bold block text-[#5C5F56] dark:text-[#A8ABA0]">
                  Milestones:
                </span>
                <ul className="list-disc pl-5 space-y-0.5 mt-1 font-sans">
                  {selectedRoadmap.milestones.map(m => (
                    <li key={m.index}>
                      Index {m.index}: <span className="font-semibold">{m.title}</span> (Weight {m.weight}, Status {m.latest_status})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#9B3A2E]">Roadmap #{roadmapId} not found.</p>
          )}
        </div>

        {/* Step 2: Recipient Address */}
        <div className="p-6 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#F7F4EC] dark:bg-[#22241F] space-y-3">
          <h2 className="text-lg font-bold text-[#22231F] dark:text-white">
            2. Grant Recipient Address
          </h2>
          <label htmlFor="recipient-address" className="block text-xs font-bold uppercase text-[#5C5F56] dark:text-[#A8ABA0]">
            Recipient (0x followed by 40 hex characters)
          </label>
          <input
            id="recipient-address"
            type="text"
            required
            placeholder="0x..."
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
            className="w-full min-h-[48px] px-3 py-2 rounded border border-[#D5CDBD] dark:border-[#4A4E42] bg-white dark:bg-[#252722] text-[#22231F] dark:text-white font-mono text-sm focus:ring-2 focus:ring-[#A0451E] focus:outline-none"
          />
          {address && (
            <button
              type="button"
              onClick={() => setRecipient(address)}
              className="text-xs text-[#A0451E] dark:text-[#F3BAA4] hover:underline font-semibold"
            >
              Use My Wallet Address
            </button>
          )}
        </div>

        {/* Step 3: Tranche Configuration */}
        <div className="p-6 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#F7F4EC] dark:bg-[#22241F] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#22231F] dark:text-white">
                3. Configure Escrow Tranches
              </h2>
              <p className="text-xs text-[#5C5F56] dark:text-[#A8ABA0]">
                Assign demo credit amounts locked to individual milestone delivery.
              </p>
            </div>
            {selectedRoadmap && tranches.length < selectedRoadmap.milestones.length && (
              <button
                type="button"
                onClick={handleAddTranche}
                className="min-h-[48px] px-3.5 py-2 border border-[#A0451E] text-[#A0451E] dark:text-[#F3BAA4] text-xs font-bold rounded hover:bg-[#FBE8DF] dark:hover:bg-[#381B10] inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Tranche</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {tranches.map((t, tIdx) => (
              <div
                key={tIdx}
                className="p-4 rounded border border-[#D5CDBD] dark:border-[#3D4036] bg-white dark:bg-[#252722] flex flex-col sm:flex-row items-center gap-4"
              >
                <div className="w-full sm:w-1/2 space-y-1">
                  <label className="block text-xs font-bold uppercase text-[#5C5F56] dark:text-[#A8ABA0]">
                    Tranche {tIdx} &rarr; Target Milestone
                  </label>
                  <select
                    value={t.milestone_index}
                    onChange={e =>
                      handleTrancheChange(tIdx, 'milestone_index', parseInt(e.target.value, 10))
                    }
                    className="w-full min-h-[48px] px-3 py-2 rounded border border-[#D5CDBD] dark:border-[#4A4E42] bg-[#F7F4EC] dark:bg-[#1E201B] text-sm font-medium"
                  >
                    {selectedRoadmap?.milestones.map(m => (
                      <option key={m.index} value={m.index}>
                        Milestone {m.index}: {m.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full sm:w-1/2 space-y-1">
                  <label className="block text-xs font-bold uppercase text-[#5C5F56] dark:text-[#A8ABA0]">
                    Amount (Demo Credits)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      required
                      value={t.amount}
                      onChange={e => handleTrancheChange(tIdx, 'amount', e.target.value)}
                      className="flex-1 min-h-[48px] px-3 py-2 rounded border border-[#D5CDBD] dark:border-[#4A4E42] bg-[#F7F4EC] dark:bg-[#1E201B] text-sm font-mono font-bold"
                    />
                    {tranches.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTranche(tIdx)}
                        className="p-2 text-[#9B3A2E] hover:opacity-80"
                        title="Remove tranche"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total & Funder Balance Check */}
          <div className="p-4 rounded bg-[#EEE8D8] dark:bg-[#1E201B] border border-[#D5CDBD] dark:border-[#3D4036] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs uppercase font-bold text-[#5C5F56] dark:text-[#A8ABA0]">
                Total Escrow Required:
              </span>
              <p className="text-2xl font-mono font-extrabold text-[#A0451E] dark:text-[#F3BAA4]">
                {totalGrantAmount} Demo Credits
              </p>
            </div>
            <div className="text-left sm:text-right text-xs">
              <span className="text-[#5C5F56] dark:text-[#A8ABA0]">Your Demo Balance: </span>
              <span className="font-mono font-bold text-[#22231F] dark:text-white">
                {balance} Credits
              </span>
              {parseInt(balance, 10) < totalGrantAmount && (
                <p className="text-[#9B3A2E] font-bold mt-0.5">
                  Insufficient balance!{' '}
                  <Link to="/credits" className="underline">
                    Claim 1,000 credits here.
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full min-h-[48px] py-3 px-6 rounded-md bg-[#A0451E] text-white font-extrabold text-lg hover:opacity-90 shadow-sm"
          >
            {address ? 'Create Grant & Lock Escrow' : 'Connect Wallet to Create Grant'}
          </button>
        </div>
      </form>

      {/* TxStatusModal */}
      <TxStatusModal
        isOpen={modalOpen}
        phase={phase}
        txHash={txHash}
        classified={classified}
        customSuccessMessage={
          createdGrantId
            ? `Grant #${createdGrantId} created and funded in escrow successfully!`
            : 'Grant created successfully!'
        }
        onClose={handleModalClose}
      />
    </div>
  );
};
