import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { connectBrowserWallet, switchOrAddStudionet } from '../services/walletClient';
import { getBalanceOf } from '../services/readClient';
import { NETWORK } from '../config/deployments';

interface WalletContextType {
  address: string | null;
  chainId: number | null;
  balance: string;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  chainId: null,
  balance: '0',
  isConnecting: false,
  error: null,
  connect: async () => {},
  disconnect: () => {},
  refreshBalance: async () => {},
});

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBalance = useCallback(async () => {
    if (!address) {
      setBalance('0');
      return;
    }
    try {
      const bal = await getBalanceOf(address);
      setBalance(bal);
    } catch (err) {
      console.warn('Failed to refresh demo credit balance:', err);
    }
  }, [address]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const res = await connectBrowserWallet();
      setAddress(res.address);
      setChainId(res.chainId);
      const bal = await getBalanceOf(res.address);
      setBalance(bal);
    } catch (err: any) {
      setError(err?.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setChainId(null);
    setBalance('0');
    setError(null);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        disconnect();
      } else {
        const nextAddr = accounts[0].toLowerCase();
        setAddress(nextAddr);
        const bal = await getBalanceOf(nextAddr);
        setBalance(bal);
      }
    };

    const handleChainChanged = (newChainId: string) => {
      const parsed = parseInt(newChainId, 16);
      setChainId(parsed);
      if (parsed !== NETWORK.chainId) {
        switchOrAddStudionet().catch(console.warn);
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Auto-check if already authorized
    window.ethereum
      .request({ method: 'eth_accounts' })
      .then((accs: string[]) => {
        if (accs && accs.length > 0) {
          const initAddr = accs[0].toLowerCase();
          setAddress(initAddr);
          getBalanceOf(initAddr).then(setBalance).catch(console.warn);
        }
      })
      .catch(console.warn);

    window.ethereum
      .request({ method: 'eth_chainId' })
      .then((cid: string) => {
        setChainId(parseInt(cid, 16));
      })
      .catch(console.warn);

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [disconnect]);

  useEffect(() => {
    if (address) {
      refreshBalance();
    }
  }, [address, refreshBalance]);

  return (
    <WalletContext.Provider
      value={{
        address,
        chainId,
        balance,
        isConnecting,
        error,
        connect,
        disconnect,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export function useWallet() {
  return useContext(WalletContext);
}
