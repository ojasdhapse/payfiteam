import React, { useState } from 'react';
import { X, Heart, Wallet, User, DollarSign } from 'lucide-react';
import { Campaign } from '../hooks/useCampaigns';
import { useAuth } from '../hooks/useAuth';
import { useWallet } from '../hooks/useWallet';
import { useContributions } from '../hooks/useContributions';
import toast from 'react-hot-toast';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
  onDonationSuccess: () => void;
}

const DonationModal: React.FC<DonationModalProps> = ({ 
  isOpen, 
  onClose, 
  campaign, 
  onDonationSuccess 
}) => {
  const [donorName, setDonorName] = useState('');
  const [donationAmount, setDonationAmount] = useState('');
  const [donating, setDonating] = useState(false);

  const { user } = useAuth();
  const { walletAddress, balance, isConnected } = useWallet();
  const { createContribution } = useContributions();

  if (!isOpen) return null;

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !isConnected || !walletAddress) {
      toast.error('Please sign in and connect your wallet');
      return;
    }

    if (!donorName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }

    const amount = parseFloat(donationAmount);
    const currentBalance = parseFloat(balance);

    if (amount > currentBalance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      setDonating(true);
      
      // Create contribution record
      await createContribution({
        campaign_id: campaign.id,
        amount: amount,
        donor_name: donorName,
        donor_wallet: walletAddress,
      });

      toast.success(`Thank you ${donorName}! Your donation of ${amount} SHM has been processed successfully.`);
      
      // Reset form
      setDonorName('');
      setDonationAmount('');
      
      // Notify parent component
      onDonationSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to process donation');
    } finally {
      setDonating(false);
    }
  };

  const maxDonation = Math.min(parseFloat(balance) || 0, campaign.funding_goal - campaign.current_funding);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Support Campaign</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Campaign Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">{campaign.title}</h3>
            <div className="text-sm text-gray-600">
              <p>Goal: {campaign.funding_goal.toFixed(2)} SHM</p>
              <p>Raised: {campaign.current_funding.toFixed(2)} SHM</p>
              <p>Remaining: {(campaign.funding_goal - campaign.current_funding).toFixed(2)} SHM</p>
            </div>
          </div>

          {/* Wallet Status */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Wallet Status</span>
              {isConnected ? (
                <span className="text-sm text-green-600 font-medium">Connected</span>
              ) : (
                <span className="text-sm text-red-600 font-medium">Not Connected</span>
              )}
            </div>
            {isConnected && walletAddress && (
              <>
                <p className="text-xs text-gray-500 mb-1">
                  {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
                </p>
                <p className="text-sm font-medium text-gray-900">
                  Balance: {parseFloat(balance).toFixed(4)} SHM
                </p>
              </>
            )}
          </div>

          {isConnected ? (
            <form onSubmit={handleDonate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet Address
                </label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={walletAddress || ''}
                    readOnly
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Donation Amount (SHM) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    max={maxDonation}
                    step="0.01"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: {maxDonation.toFixed(4)} SHM
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={donating || !donorName || !donationAmount}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <Heart className="w-4 h-4" />
                  <span>{donating ? 'Processing...' : 'Donate Now'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">Please connect your wallet to make a donation</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Connect Wallet First
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationModal;