import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listGrantsByFunder, listGrantsByRecipient, getGateStats } from '../services/readClient';
import { useWallet } from '../context/WalletContext';
import { DemoCreditNotice } from '../components/DemoCreditNotice';
import { Plus, Coins, ExternalLink, Loader2, Search } from 'lucide-react';
import type { Grant, GateStats } from '../types/contract';

export const GrantsPage: React.FC = () => {
  const { address } = useWallet();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [stats, setStats] = useState<GateStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [grantIdSearch, setGrantIdSearch] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getGateStats().then(s => {
      if (isMounted) setStats(s);
    }).catch(console.warn);

    // If wallet connected, load funder and recipient grants
    if (address) {
      Promise.all([
        listGrantsByFunder(address, 20),
        listGrantsByRecipient(address, 20),
      ])
        .then(([funderGrants, recipientGrants]) => {
          if (!isMounted) return;
          // Deduplicate by id
          const map = new Map<string, Grant>();
          funderGrants.forEach(g => map.set(g.id, g));
          recipientGrants.forEach(g => map.set(g.id, g));
          setGrants(Array.from(map.values()));
        })
        .catch(console.warn)
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    } else {
      // If no wallet connected, try loading grant #1 as sample
      import('../services/readClient').then(({ getGrant }) => {
        getGrant('1').then(g => {
          if (isMounted) {
            setGrants(g ? [g] : []);
            setIsLoading(false);
          }
        }).catch(() => {
          if (isMounted) setIsLoading(false);
        });
      });
    }

    return () => {
      isMounted = false;
    };
  }, [address]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#22231F] dark:text-[#EDECE6] tracking-tight">
            Tranche-Gated Grants
          </h1>
          <p className="text-sm text-[#5C5F56] dark:text-[#A8ABA0] mt-1">
            Escrow grants on TrancheGate locked to milestone delivery and reclaim rules.
          </p>
        </div>
        <Link
          to="/grants/new"
          className="min-h-[48px] px-5 py-2.5 bg-[#A0451E] text-white font-bold rounded-md hover:opacity-90 inline-flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>New Grant Escrow</span>
        </Link>
      </div>

      <DemoCreditNotice />

      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#EEE8D8] dark:bg-[#1E201B]">
          <span className="text-xs font-bold uppercase text-[#5C5F56] dark:text-[#A8ABA0]">Total Grants</span>
          <p className="text-2xl font-mono font-extrabold text-[#22231F] dark:text-white mt-1">
            {stats?.total_grants || '0'}
          </p>
        </div>
        <div className="p-4 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#EEE8D8] dark:bg-[#1E201B]">
          <span className="text-xs font-bold uppercase text-[#5C5F56] dark:text-[#A8ABA0]">Total Escrow Locked</span>
          <p className="text-2xl font-mono font-extrabold text-[#A0451E] dark:text-[#F3BAA4] mt-1">
            {stats?.total_escrow || '0'} Demo Credits
          </p>
        </div>
        <div className="p-4 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#EEE8D8] dark:bg-[#1E201B]">
          <span className="text-xs font-bold uppercase text-[#5C5F56] dark:text-[#A8ABA0]">Total Minted</span>
          <p className="text-2xl font-mono font-extrabold text-[#4F6B3A] dark:text-[#8BB370] mt-1">
            {stats?.total_minted || '0'} Demo Credits
          </p>
        </div>
      </div>

      {/* Grant ID lookup bar */}
      <div className="p-4 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#F7F4EC] dark:bg-[#22241F] flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8F84]" />
          <input
            type="text"
            placeholder="Inspect Grant by ID (e.g. 1)..."
            value={grantIdSearch}
            onChange={e => setGrantIdSearch(e.target.value)}
            className="w-full min-h-[48px] pl-9 pr-3 py-2 rounded border border-[#D5CDBD] dark:border-[#4A4E42] bg-white dark:bg-[#252722] text-sm font-mono"
          />
        </div>
        {grantIdSearch.trim() && (
          <Link
            to={`/grants/${grantIdSearch.trim()}`}
            className="min-h-[48px] px-4 py-2 bg-[#4F6B3A] text-white font-bold rounded text-sm hover:opacity-90 inline-flex items-center gap-1.5"
          >
            <span>Inspect Grant #{grantIdSearch.trim()}</span>
          </Link>
        )}
      </div>

      {/* Grants list */}
      {isLoading ? (
        <div className="text-center py-12 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#4F6B3A]" />
          <p className="text-sm text-[#5C5F56] dark:text-[#A8ABA0]">Reading grants from chain...</p>
        </div>
      ) : grants.length === 0 ? (
        <div className="p-8 text-center rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#EEE8D8] dark:bg-[#1E201B] space-y-3">
          <Coins className="w-10 h-10 mx-auto text-[#8C8F84]" />
          <h3 className="text-lg font-bold">No active grants found for this address</h3>
          <p className="text-sm text-[#5C5F56] dark:text-[#A8ABA0]">
            Connect your wallet to see grants you funded or are recipient of, or create a new grant tied to a roadmap.
          </p>
          <Link
            to="/grants/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#A0451E] text-white font-bold rounded hover:opacity-90 mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Grant</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {grants.map(g => (
            <div
              key={g.id}
              className="p-6 rounded-lg border border-[#D5CDBD] dark:border-[#3D4036] bg-[#F7F4EC] dark:bg-[#22241F] space-y-4 hover:border-[#A0451E] transition-colors shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-[#A0451E] dark:text-[#F3BAA4] uppercase">
                    Grant #{g.id}
                  </span>
                  <p className="text-sm font-semibold text-[#22231F] dark:text-white mt-0.5">
                    Tied to Roadmap #{g.roadmap_id}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-mono font-bold text-[#A0451E] dark:text-[#F3BAA4]">
                    {g.escrow_balance} / {g.total_amount}
                  </span>
                  <p className="text-xs text-[#5C5F56] dark:text-[#A8ABA0]">Escrow Remaining</p>
                </div>
              </div>

              <div className="text-xs font-mono space-y-1 text-[#5C5F56] dark:text-[#A8ABA0]">
                <div className="truncate">Funder: <span className="font-semibold text-[#22231F] dark:text-white">{g.funder}</span></div>
                <div className="truncate">Recipient: <span className="font-semibold text-[#22231F] dark:text-white">{g.recipient}</span></div>
                <div>Tranches: <span className="font-semibold text-[#22231F] dark:text-white">{g.tranches?.length || 0}</span></div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-[#D5CDBD] dark:border-[#3D4036]">
                <Link
                  to={`/grants/${g.id}`}
                  className="min-h-[48px] px-4 py-2 bg-[#A0451E] text-white font-bold text-sm rounded hover:opacity-90 inline-flex items-center gap-1.5"
                >
                  <span>Manage Escrow</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <Link
                  to={`/roadmaps/${g.roadmap_id}`}
                  className="min-h-[48px] px-4 py-2 border border-[#D5CDBD] dark:border-[#4A4E42] text-sm font-semibold rounded hover:bg-[#EEE8D8] dark:hover:bg-[#252722] inline-flex items-center"
                >
                  View Roadmap #{g.roadmap_id}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
