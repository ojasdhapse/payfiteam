import { ethers } from 'ethers';
import { web3Service } from './web3';

const PLATFORM_WALLET_ADDRESS = import.meta.env.VITE_PLATFORM_WALLET_ADDRESS;

export class PlatformWalletService {
  async sendToPlatformWallet(amount: string): Promise<string> {
    if (!PLATFORM_WALLET_ADDRESS) {
      throw new Error('Platform wallet address not configured');
    }

    try {
      const txHash = await web3Service.sendTransaction(PLATFORM_WALLET_ADDRESS, amount);
      return txHash;
    } catch (error) {
      console.error('Error sending to platform wallet:', error);
      throw new Error('Failed to send funds to platform wallet');
    }
  }

  async payoutToCampaignCreator(creatorAddress: string, amount: string): Promise<string> {
    if (!PLATFORM_WALLET_ADDRESS) {
      throw new Error('Platform wallet address not configured');
    }

    try {
      // This would require the platform wallet's private key to be available
      // In production, this should be handled by a secure backend service
      const txHash = await web3Service.sendTransaction(creatorAddress, amount);
      return txHash;
    } catch (error) {
      console.error('Error paying out to creator:', error);
      throw new Error('Failed to payout to campaign creator');
    }
  }

  async refundToDonor(donorAddress: string, amount: string): Promise<string> {
    if (!PLATFORM_WALLET_ADDRESS) {
      throw new Error('Platform wallet address not configured');
    }

    try {
      // This would require the platform wallet's private key to be available
      // In production, this should be handled by a secure backend service
      const txHash = await web3Service.sendTransaction(donorAddress, amount);
      return txHash;
    } catch (error) {
      console.error('Error refunding to donor:', error);
      throw new Error('Failed to refund to donor');
    }
  }

  getPlatformWalletAddress(): string {
    return PLATFORM_WALLET_ADDRESS || '';
  }

  isAdminWallet(walletAddress: string): boolean {
    return walletAddress.toLowerCase() === PLATFORM_WALLET_ADDRESS?.toLowerCase();
  }
}

export const platformWalletService = new PlatformWalletService();