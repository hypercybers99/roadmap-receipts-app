import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import { Sun, Moon, Wallet, Layers } from 'lucide-react';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { address, balance, isConnecting, connect, disconnect } = useWallet();
  const location = useLocation();

  const navLinks = [
    { to: '/roadmaps', label: 'Roadmaps' },
    { to: '/grants', label: 'Grants' },
    { to: '/credits', label: 'Demo Credits' },
    { to: '/evidence', label: 'Evidence' },
    { to: '/limits', label: 'Limits' },
  ];

  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  return (
    <header className="border-b border-[#D5CDBD] dark:border-[#3D4036] bg-[#F7F4EC] dark:bg-[#181916] sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-[#22231F] dark:text-[#EDECE6] hover:opacity-90">
              <span className="p-2 bg-[#4F6B3A] text-white rounded">
                <Layers className="w-5 h-5" />
              </span>
              <span>Roadmap Receipts</span>
            </Link>
            <span className="text-xs uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-[#EEE8D8] text-[#A0451E] dark:bg-[#2B2D27] dark:text-[#E87568] border border-[#D5CDBD] dark:border-[#4A4E42]">
              Preview
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            {navLinks.map(link => {
              const isActive = location.pathname === link.to || location.pathname.startsWith(`${link.to}/`);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`min-h-[48px] px-3.5 py-2.5 rounded font-medium text-base inline-flex items-center transition-colors ${
                    isActive
                      ? 'bg-[#EEE8D8] text-[#22231F] dark:bg-[#252722] dark:text-white font-bold'
                      : 'text-[#5C5F56] hover:text-[#22231F] dark:text-[#A8ABA0] dark:hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Theme Toggle & Wallet Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="min-h-[48px] min-w-[48px] p-2.5 rounded border border-[#D5CDBD] dark:border-[#3D4036] bg-[#EEE8D8] dark:bg-[#252722] text-[#22231F] dark:text-[#EDECE6] hover:bg-[#E4DDCB] dark:hover:bg-[#2F322B] transition-colors focus:ring-2 focus:ring-[#A0451E]"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {address ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col items-end text-xs">
                  <span className="font-mono font-bold text-[#22231F] dark:text-white">{shortAddr}</span>
                  <span className="text-[#4F6B3A] dark:text-[#8BB370] font-semibold">
                    {balance} Demo Credits
                  </span>
                </div>
                <button
                  onClick={disconnect}
                  className="min-h-[48px] px-3.5 py-2 border border-[#9B3A2E] text-[#9B3A2E] dark:text-[#F0B2AC] rounded font-semibold text-sm hover:bg-[#F8E1DE] dark:hover:bg-[#401511] transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                disabled={isConnecting}
                className="min-h-[48px] px-4 py-2.5 bg-[#4F6B3A] text-white rounded font-bold text-base hover:opacity-90 transition-opacity inline-flex items-center gap-2 shadow-sm"
              >
                <Wallet className="w-5 h-5" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto pb-3 gap-1 scrollbar-none" aria-label="Mobile Navigation">
          {navLinks.map(link => {
            const isActive = location.pathname === link.to || location.pathname.startsWith(`${link.to}/`);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`min-h-[48px] px-3 py-2 rounded text-sm font-semibold shrink-0 inline-flex items-center ${
                  isActive
                    ? 'bg-[#EEE8D8] text-[#22231F] dark:bg-[#252722] dark:text-white'
                    : 'text-[#5C5F56] dark:text-[#A8ABA0]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
};
