import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listRoadmaps, listRoadmapsByOwner } from '../services/readClient';
import { useWallet } from '../context/WalletContext';
import { Plus, Search, Layers, ExternalLink, Loader2 } from 'lucide-react';
import type { Roadmap } from '../types/contract';

export const RoadmapsPage: React.FC = () => {
  const { address } = useWallet();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [filterOwner, setFilterOwner] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadRoadmaps = async (ownerAddr?: string) => {
    setIsLoading(true);
    try {
      if (ownerAddr && ownerAddr.startsWith('0x') && ownerAddr.length === 42) {
        const list = await listRoadmapsByOwner(ownerAddr, 25);
        setRoadmaps(list);
      } else {
        const list = await listRoadmaps(25);
        setRoadmaps(list);
      }
    } catch (err) {
      console.warn('Failed to fetch roadmaps:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoadmaps(filterOwner);
  }, [filterOwner]);

  const filtered = roadmaps.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.id.includes(q) ||
      r.owner.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#22231F] dark:text-[#EDECE6] tracking-tight">
            Roadmaps
          </h1>
          <p className="text-sm text-[#5C5F56] dark:text-[#A8ABA0] mt-1">
            Browse and inspect verifiable milestone roadmaps registered on RoadmapLedger.
          </p>
        </div>
        <Link
          to="/roadmaps/new"
          className="min-h-[48px] px-5 py-2.5 bg-[#4F6B3A] text-white font-bold rounded-md hover:opacity-90 inline-flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>New Roadmap</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#EEE8D8] dark:bg-[#1E201B] flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5C5F56] dark:text-[#A8ABA0]" />
          <input
            type="text"
            placeholder="Search by roadmap name, ID, or owner address..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full min-h-[48px] pl-10 pr-4 py-2 rounded border border-[#D5CDBD] dark:border-[#4A4E42] bg-[#F7F4EC] dark:bg-[#252722] text-[#22231F] dark:text-white placeholder-[#8C8F84] focus:ring-2 focus:ring-[#A0451E] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {address && (
            <button
              onClick={() => setFilterOwner(filterOwner === address ? '' : address)}
              className={`min-h-[48px] px-4 py-2 rounded text-sm font-semibold border transition-colors whitespace-nowrap ${
                filterOwner === address
                  ? 'bg-[#A0451E] text-white border-[#A0451E]'
                  : 'bg-[#F7F4EC] dark:bg-[#252722] text-[#22231F] dark:text-white border-[#D5CDBD] dark:border-[#4A4E42] hover:bg-[#E4DDCB]'
              }`}
            >
              {filterOwner === address ? 'Showing My Roadmaps' : 'Filter Mine'}
            </button>
          )}
          <button
            onClick={() => loadRoadmaps(filterOwner)}
            className="min-h-[48px] px-4 py-2 rounded text-sm font-semibold border border-[#D5CDBD] dark:border-[#4A4E42] bg-[#F7F4EC] dark:bg-[#252722] text-[#22231F] dark:text-white hover:bg-[#E4DDCB] transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Roadmaps List */}
      {isLoading ? (
        <div className="text-center py-12 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#4F6B3A]" />
          <p className="text-sm text-[#5C5F56] dark:text-[#A8ABA0]">Reading roadmaps from chain...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#EEE8D8] dark:bg-[#1E201B] space-y-3">
          <Layers className="w-10 h-10 mx-auto text-[#8C8F84]" />
          <h3 className="text-lg font-bold text-[#22231F] dark:text-white">No roadmaps found</h3>
          <p className="text-sm text-[#5C5F56] dark:text-[#A8ABA0]">
            {searchQuery || filterOwner
              ? 'No registered roadmaps match your search or filter criteria.'
              : 'No roadmaps have been registered on this contract yet.'}
          </p>
          <Link
            to="/roadmaps/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#4F6B3A] text-white font-bold rounded hover:opacity-90 mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Register First Roadmap</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(r => (
            <div
              key={r.id}
              className="p-6 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#F7F4EC] dark:bg-[#22241F] space-y-4 hover:border-[#4F6B3A] transition-colors shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-mono font-bold text-[#A0451E] dark:text-[#F3BAA4] uppercase">
                    Roadmap #{r.id}
                  </span>
                  <h2 className="text-xl font-bold text-[#22231F] dark:text-white mt-0.5">
                    {r.name}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-mono font-extrabold text-[#4F6B3A] dark:text-[#8BB370]">
                    {r.progress_pct}%
                  </span>
                  <p className="text-xs text-[#5C5F56] dark:text-[#A8ABA0]">Progress</p>
                </div>
              </div>

              {/* Owner and milestones count */}
              <div className="text-xs font-mono text-[#5C5F56] dark:text-[#A8ABA0] space-y-1">
                <div className="truncate">
                  Owner: <span className="text-[#22231F] dark:text-white font-semibold">{r.owner}</span>
                </div>
                <div>
                  Milestones: <span className="font-semibold text-[#22231F] dark:text-white">{r.milestones?.length || 0}</span> | Verified: <span className="font-semibold text-[#4F6B3A]">{r.verified_count}</span> | Under Review: <span className="font-semibold text-[#A0451E]">{r.review_count}</span>
                </div>
              </div>

              {/* Progress bar (zero gradients, clean solid color) */}
              <div className="w-full bg-[#EEE8D8] dark:bg-[#2B2D27] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#4F6B3A] h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, parseInt(r.progress_pct, 10) || 0))}%` }}
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between border-t border-[#D5CDBD] dark:border-[#3D4036]">
                <Link
                  to={`/roadmaps/${r.id}`}
                  className="min-h-[48px] px-4 py-2 bg-[#4F6B3A] text-white text-sm font-bold rounded hover:opacity-90 inline-flex items-center gap-1.5"
                >
                  <span>View Details</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <Link
                  to={`/grants/new?roadmapId=${r.id}`}
                  className="min-h-[48px] px-4 py-2 border border-[#A0451E] text-[#A0451E] dark:text-[#F3BAA4] text-sm font-bold rounded hover:bg-[#FBE8DF] dark:hover:bg-[#381B10] inline-flex items-center"
                >
                  Create Grant
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
