import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Target, Users, Share2, Heart, ExternalLink, AlertCircle, CheckCircle, Clock, ArrowLeft, Trophy } from 'lucide-react';
import { useCampaigns, Campaign } from '../hooks/useCampaigns';
import { useContributions, Contribution } from '../hooks/useContributions';
import { useAuth } from '../hooks/useAuth';
import { useWallet } from '../hooks/useWallet';
import { ipfsService } from '../lib/ipfs';
import { platformWalletService } from '../lib/platformWallet';
import DonationModal from '../components/DonationModal';
import SupportersHallOfFame from '../components/SupportersHallOfFame';
import toast from 'react-hot-toast';

const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [processingPayout, setProcessingPayout] = useState(false);
  const [processingRefund, setProcessingRefund] = useState(false);

  const { user, profile } = useAuth();
  const { walletAddress, isConnected } = useWallet();
  const { getCampaignById } = useCampaigns();
  const { getCampaignContributions, processPayout, processRefunds } = useContributions();

  useEffect(() => {
    if (id) {
      fetchCampaignData();
    }
  }, [id]);

  const fetchCampaignData = async () => {
    try {
      setLoading(true);
      if (!id) return;

      const [campaignData, contributionsData] = await Promise.all([
        getCampaignById(id),
        getCampaignContributions(id)
      ]);

      setCampaign(campaignData);
      setContributions(contributionsData);
    } catch (error) {
      console.error('Error fetching campaign data:', error);
      toast.error('Failed to load campaign details');
    } finally {
      setLoading(false);
    }
  };

  const handleDonationSuccess = () => {
    fetchCampaignData(); // Refresh data after successful donation
  };

  const handlePayout = async () => {
    if (!campaign || !campaign.creator?.wallet_address) {
      toast.error('Campaign creator wallet not found');
      return;
    }

    try {
      setProcessingPayout(true);
      await processPayout(campaign.id, campaign.creator.wallet_address, campaign.current_funding);
      toast.success('Payout processed successfully!');
      await fetchCampaignData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to process payout');
    } finally {
      setProcessingPayout(false);
    }
  };

  const handleRefund = async () => {
    if (!campaign) return;

    try {
      setProcessingRefund(true);
      await processRefunds(campaign.id, contributions);
      toast.success('Refunds processed successfully!');
      await fetchCampaignData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to process refunds');
    } finally {
      setProcessingRefund(false);
    }
  };

  const isAdmin = walletAddress && platformWalletService.isAdminWallet(walletAddress);
  const campaignEnded = campaign && new Date() > new Date(campaign.deadline);
  const goalMet = campaign && campaign.current_funding >= campaign.funding_goal;
  const progress = campaign ? (campaign.current_funding / campaign.funding_goal) * 100 : 0;
  const daysLeft = campaign ? Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Campaign Not Found</h2>
          <p className="text-gray-600 mb-4">The campaign you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/campaigns')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Browse Campaigns
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <img
                src={campaign.image_ipfs_hash ? ipfsService.getFileUrl(campaign.image_ipfs_hash) : 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200'}
                alt={campaign.title}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                    {campaign.category}
                  </span>
                  <div className="flex items-center space-x-2">
                    {campaignEnded ? (
                      <span className="flex items-center space-x-1 text-red-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Ended</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-green-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{daysLeft} days left</span>
                      </span>
                    )}
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{campaign.title}</h1>
                <p className="text-gray-600 leading-relaxed">{campaign.description}</p>
              </div>
            </div>

            {/* Campaign Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {campaign.current_funding.toFixed(2)} SHM
                  </div>
                  <div className="text-sm text-gray-600">Raised</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {campaign.funding_goal.toFixed(2)} SHM
                  </div>
                  <div className="text-sm text-gray-600">Goal</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {contributions.length}
                  </div>
                  <div className="text-sm text-gray-600">Backers</div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-600">{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Platform Wallet Notice */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Secure Fund Management</p>
                    <p>All contributions are held securely by the platform until the campaign ends. Funds will be distributed to the creator if the goal is met, or refunded to donors if not.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Supporters Hall of Fame */}
            <SupportersHallOfFame contributions={contributions} />

            {/* Admin Controls */}
            {isAdmin && campaignEnded && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Controls</h3>
                <div className="flex space-x-4">
                  {goalMet ? (
                    <button
                      onClick={handlePayout}
                      disabled={processingPayout}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{processingPayout ? 'Processing...' : 'Payout to Creator'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleRefund}
                      disabled={processingRefund}
                      className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>{processingRefund ? 'Processing...' : 'Refund All Donors'}</span>
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {goalMet ? 
                    'Campaign goal was met. You can now payout funds to the creator.' : 
                    'Campaign goal was not met. You can refund all donors.'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Donation Form */}
            {!campaignEnded && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Support This Campaign</h3>
                
                {user && isConnected ? (
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowDonationModal(true)}
                      className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-lg hover:from-pink-600 hover:to-red-600 transition-all font-medium"
                    >
                      <Heart className="w-5 h-5" />
                      <span>Support Campaign</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">Sign in and connect your wallet to support this campaign</p>
                    <button
                      onClick={() => navigate('/')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Get Started
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Campaign Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Creator</span>
                  <span className="font-medium text-gray-900">
                    {campaign.creator?.username || 'Anonymous'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium text-gray-900">
                    {new Date(campaign.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Deadline</span>
                  <span className="font-medium text-gray-900">
                    {new Date(campaign.deadline).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium ${campaign.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {campaign.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Share Campaign */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Campaign</h3>
              <div className="flex space-x-2">
                <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
                <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  <Heart className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DonationModal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        campaign={campaign}
        onDonationSuccess={handleDonationSuccess}
      />
    </div>
  );
};

export default CampaignDetail;