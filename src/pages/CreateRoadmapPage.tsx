import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { createRoadmap } from '../services/walletClient';
import {
  validateRoadmapName,
  validateMilestoneTitle,
  validateCriterion,
  validateWeight,
  validateEvidenceUrl,
} from '../lib/validators';
import { TxStatusModal, type TxPhase } from '../components/TxStatusModal';
import { Plus, Trash2, ArrowLeft, Wand2, AlertCircle } from 'lucide-react';
import type { ClassifiedReceipt } from '../lib/receipts';

interface MilestoneDraft {
  title: string;
  weight: number;
  criteria: string[];
  evidence_url: string;
}

const DEFAULT_SAMPLE_MILESTONES: MilestoneDraft[] = [
  {
    title: 'Offline sync',
    weight: 3,
    criteria: [
      'A release note states that offline sync is available to all users.',
      'The release note names the version number that includes offline sync.',
    ],
    evidence_url:
      'https://raw.githubusercontent.com/hypercybers99/roadmap-receipts-fixtures/c83e8f197f9264701f5362a8e2f13f5e185186e8/lumen/m1-delivered.md',
  },
  {
    title: 'Public API',
    weight: 5,
    criteria: [
      'The documentation lists endpoints for notes and for tags.',
      'A release note states that the API is generally available and not in beta.',
    ],
    evidence_url:
      'https://raw.githubusercontent.com/hypercybers99/roadmap-receipts-fixtures/c83e8f197f9264701f5362a8e2f13f5e185186e8/lumen/m2-delivered.md',
  },
  {
    title: 'Security audit published',
    weight: 2,
    criteria: ['A published audit report is linked from the page.'],
    evidence_url:
      'https://raw.githubusercontent.com/hypercybers99/roadmap-receipts-fixtures/c83e8f197f9264701f5362a8e2f13f5e185186e8/lumen/m3-missed.md',
  },
];

export const CreateRoadmapPage: React.FC = () => {
  const navigate = useNavigate();
  const { address, connect } = useWallet();

  const [name, setName] = useState<string>('');
  const [milestones, setMilestones] = useState<MilestoneDraft[]>([
    {
      title: '',
      weight: 1,
      criteria: [''],
      evidence_url: '',
    },
  ]);
  const [formError, setFormError] = useState<string | null>(null);

  // Tx Modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [phase, setPhase] = useState<TxPhase>('idle');
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [classified, setClassified] = useState<ClassifiedReceipt | undefined>(undefined);
  const [createdId, setCreatedId] = useState<string | undefined>(undefined);

  const fillSample = () => {
    setName('Lumen Notes Roadmap ' + Math.floor(Math.random() * 1000));
    setMilestones(JSON.parse(JSON.stringify(DEFAULT_SAMPLE_MILESTONES)));
    setFormError(null);
  };

  const handleAddMilestone = () => {
    if (milestones.length >= 6) {
      setFormError('Cannot have more than 6 milestones');
      return;
    }
    const defaultUrl = milestones[0]?.evidence_url || '';
    setMilestones([
      ...milestones,
      {
        title: '',
        weight: 1,
        criteria: [''],
        evidence_url: defaultUrl,
      },
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    if (milestones.length <= 1) {
      setFormError('Roadmap must have at least 1 milestone');
      return;
    }
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (index: number, field: keyof MilestoneDraft, value: any) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const handleAddCriterion = (mIndex: number) => {
    if (milestones[mIndex].criteria.length >= 4) {
      setFormError(`Milestone ${mIndex + 1} cannot have more than 4 criteria`);
      return;
    }
    const updated = [...milestones];
    updated[mIndex].criteria.push('');
    setMilestones(updated);
  };

  const handleRemoveCriterion = (mIndex: number, cIndex: number) => {
    if (milestones[mIndex].criteria.length <= 1) {
      setFormError(`Milestone ${mIndex + 1} must have at least 1 criterion`);
      return;
    }
    const updated = [...milestones];
    updated[mIndex].criteria = updated[mIndex].criteria.filter((_, i) => i !== cIndex);
    setMilestones(updated);
  };

  const handleCriterionChange = (mIndex: number, cIndex: number, val: string) => {
    const updated = [...milestones];
    updated[mIndex].criteria[cIndex] = val;
    setMilestones(updated);
  };

  const validateAll = (): string | null => {
    const nameErr = validateRoadmapName(name);
    if (nameErr) return nameErr;

    if (milestones.length < 1 || milestones.length > 6) {
      return 'Roadmap must have between 1 and 6 milestones';
    }

    let commonHost: string | undefined = undefined;

    for (let i = 0; i < milestones.length; i++) {
      const m = milestones[i];
      const titleErr = validateMilestoneTitle(m.title);
      if (titleErr) return `Milestone ${i + 1}: ${titleErr}`;

      const weightErr = validateWeight(m.weight);
      if (weightErr) return `Milestone ${i + 1}: ${weightErr}`;

      if (m.criteria.length < 1 || m.criteria.length > 4) {
        return `Milestone ${i + 1} must have between 1 and 4 criteria`;
      }

      for (let c = 0; c < m.criteria.length; c++) {
        const critErr = validateCriterion(m.criteria[c]);
        if (critErr) return `Milestone ${i + 1}, criterion ${c + 1}: ${critErr}`;
      }

      const urlRes = validateEvidenceUrl(m.evidence_url, commonHost);
      if (!urlRes.valid) {
        return `Milestone ${i + 1}: ${urlRes.error}`;
      }
      if (!commonHost) {
        commonHost = urlRes.host;
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!address) {
      await connect();
      return;
    }

    const validationError = validateAll();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setModalOpen(true);
    setPhase('awaiting_signature');
    setTxHash(undefined);
    setClassified(undefined);
    setCreatedId(undefined);

    try {
      setPhase('awaiting_consensus');
      const result = await createRoadmap(name, milestones, address);
      setTxHash(result.txHash);
      setClassified(result.classified);

      if (result.classified.isSuccess) {
        setPhase('success');
        setCreatedId(result.resolvedId);
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
        decodedError: err?.message || 'Transaction submission failed',
      });
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    if (phase === 'success' && createdId) {
      navigate(`/roadmaps/${createdId}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/roadmaps')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5C5F56] hover:text-[#22231F] dark:text-[#A8ABA0] dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Roadmaps</span>
        </button>

        <button
          type="button"
          onClick={fillSample}
          className="min-h-[48px] px-3.5 py-2 text-sm font-bold border border-[#A0451E] text-[#A0451E] dark:text-[#F3BAA4] rounded hover:bg-[#FBE8DF] dark:hover:bg-[#381B10] inline-flex items-center gap-2"
        >
          <Wand2 className="w-4 h-4" />
          <span>Fill Proven Fixtures Sample</span>
        </button>
      </div>

      <div>
        <h1 className="text-3xl font-extrabold text-[#22231F] dark:text-[#EDECE6] tracking-tight">
          Create New Roadmap
        </h1>
        <p className="text-sm text-[#5C5F56] dark:text-[#A8ABA0] mt-1">
          Registers an immutable roadmap with 1 to 6 milestones on RoadmapLedger.
        </p>
      </div>

      {formError && (
        <div className="p-4 rounded-md border border-[#9B3A2E] bg-[#F8E1DE] dark:bg-[#401511] text-[#9B3A2E] dark:text-[#F3BAA4] flex items-center gap-2 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Roadmap Name */}
        <div className="p-6 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#F7F4EC] dark:bg-[#22241F] space-y-3">
          <label htmlFor="roadmap-name" className="block text-sm font-bold text-[#22231F] dark:text-white">
            Roadmap Name (3-60 ASCII characters)
          </label>
          <input
            id="roadmap-name"
            type="text"
            required
            maxLength={60}
            placeholder="e.g. Lumen Notes Roadmap"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full min-h-[48px] px-4 py-2 rounded border border-[#D5CDBD] dark:border-[#4A4E42] bg-white dark:bg-[#252722] text-[#22231F] dark:text-white focus:ring-2 focus:ring-[#A0451E] focus:outline-none"
          />
          <p className="text-xs text-[#5C5F56] dark:text-[#A8ABA0]">
            Length: {name.trim().length}/60
          </p>
        </div>

        {/* Milestones Builder */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#22231F] dark:text-white">
              Milestones ({milestones.length}/6)
            </h2>
            {milestones.length < 6 && (
              <button
                type="button"
                onClick={handleAddMilestone}
                className="min-h-[48px] px-4 py-2 border border-[#4F6B3A] text-[#4F6B3A] dark:text-[#8BB370] rounded font-bold text-sm hover:bg-[#E3E8DC] dark:hover:bg-[#253818] inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Milestone</span>
              </button>
            )}
          </div>

          {milestones.map((m, mIdx) => (
            <div
              key={mIdx}
              className="p-6 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#F7F4EC] dark:bg-[#22241F] space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-[#D5CDBD] dark:border-[#3D4036] pb-3">
                <span className="text-sm font-mono font-bold text-[#A0451E] dark:text-[#F3BAA4] uppercase">
                  Milestone Index {mIdx}
                </span>
                {milestones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(mIdx)}
                    className="text-xs text-[#9B3A2E] hover:underline inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-3 space-y-1">
                  <label className="block text-xs font-bold text-[#22231F] dark:text-white uppercase">
                    Title (5-80 chars)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    placeholder="e.g. Offline sync"
                    value={m.title}
                    onChange={e => handleMilestoneChange(mIdx, 'title', e.target.value)}
                    className="w-full min-h-[48px] px-3 py-2 rounded border border-[#D5CDBD] dark:border-[#4A4E42] bg-white dark:bg-[#252722] text-[#22231F] dark:text-white focus:ring-2 focus:ring-[#A0451E] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#22231F] dark:text-white uppercase">
                    Weight (1-10)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={m.weight}
                    onChange={e => handleMilestoneChange(mIdx, 'weight', parseInt(e.target.value, 10) || 1)}
                    className="w-full min-h-[48px] px-3 py-2 rounded border border-[#D5CDBD] dark:border-[#4A4E42] bg-white dark:bg-[#252722] text-[#22231F] dark:text-white focus:ring-2 focus:ring-[#A0451E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Criteria */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#22231F] dark:text-white uppercase">
                    Criteria ({m.criteria.length}/4) — each 10 to 160 characters
                  </label>
                  {m.criteria.length < 4 && (
                    <button
                      type="button"
                      onClick={() => handleAddCriterion(mIdx)}
                      className="text-xs text-[#4F6B3A] hover:underline font-semibold"
                    >
                      + Add Criterion
                    </button>
                  )}
                </div>
                {m.criteria.map((c, cIdx) => (
                  <div key={cIdx} className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      maxLength={160}
                      placeholder="e.g. The documentation lists endpoints for notes and tags."
                      value={c}
                      onChange={e => handleCriterionChange(mIdx, cIdx, e.target.value)}
                      className="flex-1 min-h-[48px] px-3 py-2 rounded border border-[#D5CDBD] dark:border-[#4A4E42] bg-white dark:bg-[#252722] text-[#22231F] dark:text-white text-sm focus:ring-2 focus:ring-[#A0451E] focus:outline-none"
                    />
                    {m.criteria.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCriterion(mIdx, cIdx)}
                        className="p-2 text-[#9B3A2E] hover:opacity-80"
                        title="Remove criterion"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Evidence URL */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#22231F] dark:text-white uppercase">
                  Evidence URL (HTTPS only, must share host and dir with other milestones)
                </label>
                <input
                  type="url"
                  required
                  maxLength={300}
                  placeholder="https://raw.githubusercontent.com/.../m1-delivered.md"
                  value={m.evidence_url}
                  onChange={e => handleMilestoneChange(mIdx, 'evidence_url', e.target.value)}
                  className="w-full min-h-[48px] px-3 py-2 rounded border border-[#D5CDBD] dark:border-[#4A4E42] bg-white dark:bg-[#252722] text-[#22231F] dark:text-white text-sm font-mono focus:ring-2 focus:ring-[#A0451E] focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full min-h-[48px] py-3 px-6 rounded-md bg-[#4F6B3A] text-white font-extrabold text-lg hover:opacity-90 shadow-sm"
          >
            {address ? 'Submit & Register Roadmap' : 'Connect Wallet to Register'}
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
          createdId
            ? `Roadmap #${createdId} created successfully!`
            : 'Roadmap created successfully!'
        }
        onClose={handleModalClose}
      />
    </div>
  );
};
