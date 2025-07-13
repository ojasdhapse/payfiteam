import { useState, useEffect } from 'react';
import { web3Service } from '../lib/web3';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useWallet = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const { connectWallet: updateProfileWallet, profile } = useAuth();

  useEffect(() => {
    // Check if wallet was previously connected
    if (profile?.wallet_address) {
      setWalletAddress(profile.wallet_address);
      updateBalance(profile.wallet_address);
    }

    // Listen for account changes
    if ((window as any).ethereum) {
      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
      (window as any).ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if ((window as any).ethereum) {
        (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
        (window as any).ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [profile]);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected wallet
      setWalletAddress(null);
      setBalance('0');
    } else {
      // User switched accounts
      const newAddress = accounts[0];
      setWalletAddress(newAddress);
      updateBalance(newAddress);
      updateProfileWallet(newAddress);
    }
  };

  const handleChainChanged = () => {
    // Reload the page when chain changes
    window.location.reload();
  };

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      
      const address = await web3Service.connectWallet();
      if (address) {
        setWalletAddress(address);
        await updateBalance(address);
        await updateProfileWallet(address);
        toast.success('Wallet connected successfully!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const updateBalance = async (address: string) => {
    try {
      const balance = await web3Service.getBalance(address);
      setBalance(balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const sendTransaction = async (to: string, amount: string) => {
    try {
      if (!walletAddress) {
        throw new Error('Wallet not connected');
      }

      const txHash = await web3Service.sendTransaction(to, amount);
      await updateBalance(walletAddress);
      return txHash;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  };

  const isConnected = !!walletAddress;

  return {
    walletAddress,
    balance,
    isConnected,
    isConnecting,
    connectWallet,
    sendTransaction,
    updateBalance,
  };
};