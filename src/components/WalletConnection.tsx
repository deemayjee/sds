'use client';

import { usePrivy } from '@privy-io/react-auth';
import { Wallet, LogOut, User } from 'lucide-react';

interface WalletConnectionProps {
  onConnect?: () => void;
}

export default function WalletConnection({ onConnect }: WalletConnectionProps) {
  const { login, authenticated, user, logout, ready } = usePrivy();

  const handleConnect = async () => {
    try {
      await login();
      onConnect?.();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  if (authenticated && user) {
    const walletAddress = user.wallet?.address || (user.linkedAccounts?.[0] as { address?: string })?.address || 'Connected';
    
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-600">
            {walletAddress && walletAddress !== 'Connected' ? 
              `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : 
              'Wallet Connected'
            }
          </span>
        </div>
        <button
          onClick={handleDisconnect}
          className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 underline"
        >
          <LogOut className="w-4 h-4" />
          <span>Disconnect</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={!ready}
      className={`btn-primary flex items-center space-x-2 ${!ready ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Wallet className="w-5 h-5" />
      <span>Connect Wallet</span>
    </button>
  );
} 