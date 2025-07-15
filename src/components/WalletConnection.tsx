import React from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

const WalletConnection: React.FC = () => {
  const { walletAddress, balance, isConnected, isConnecting, connectWallet } = useWallet();

  const disconnectWallet = () => {
    // Clear wallet state
    window.location.reload();
  };

  if (isConnected && walletAddress) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          {parseFloat(balance).toFixed(4)} SHM
        </div>
        <button
          onClick={disconnectWallet}
          className="flex items-center space-x-1 px-2 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          title="Disconnect Wallet"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="flex items-center space-x-2 px-3 py-2 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-50"
    >
      <Wallet className="w-4 h-4" />
      <span className="text-sm font-medium">
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </span>
    </button>
  );
};

export default WalletConnection;