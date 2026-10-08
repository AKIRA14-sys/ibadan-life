import React from 'react';
import { Wallet } from '../types';
import { Coins, Building } from 'lucide-react';

interface Props {
  wallet: Wallet;
}

export const WalletHUD: React.FC<Props> = ({ wallet }) => {
  const formattedCash = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(wallet.cash).replace('NGN', '₦');

  const formattedBank = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(wallet.bank_balance).replace('NGN', '₦');

  return (
    <div className="hud-card px-3.5 py-2 flex items-center gap-3 border border-emerald-500/30 font-mono text-xs">
      <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
        <Coins className="w-4 h-4 text-emerald-400" />
        <span>{formattedCash}</span>
      </div>

      <div className="w-px h-4 bg-gray-700" />

      <div className="flex items-center gap-1.5 text-blue-400 font-bold">
        <Building className="w-4 h-4 text-blue-400" />
        <span>{formattedBank}</span>
      </div>
    </div>
  );
};
