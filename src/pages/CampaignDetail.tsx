import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useCampaigns } from '../hooks/useCampaigns';
import { useContributions } from '../hooks/useContributions';
import { useAuth } from '../hooks/useAuth';
import { useWallet } from '../hooks/useWallet';
import { ipfsService } from '../lib/ipfs';
import { platformWalletService } from '../lib/platformWallet';
import toast from 'react-hot-toast';
import { Calendar, Target, TrendingUp, Users, Vote, CheckCircle, Clock, Image, FileText } from 'lucide-react';

const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [donationAmount, setDonationAmount] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [donors, setDonors] = useState<any[]>([]);
  
  const { user } = useAuth();
  const { walletAddress } = useWallet();
  const { getCampaignById } = useCampaigns();
  const { createContribution, getCampaignContributions, processPayout, processRefunds } = useContributions();
  
  const [campaign, setCampaign] = useState<any>(null);
  const [campaignLoading, setCampaignLoading] = useState(true);

  React.useEffect(() => {
    if (id) {
      loadCampaignData();
    }
  }, [id]);

  const loadCampaignData = async () => {
    try {
      setCampaignLoading(true);
      const campaignData = await getCampaignById(id!);
      setCampaign(campaignData);
      
      if (campaignData) {
        const contributionsData = await getCampaignContributions(id!);
        setDonors(contributionsData);
      }
    } catch (error) {
      console.error('Error loading campaign:', error);
      toast.error('Failed to load campaign data');
    } finally {
      setCampaignLoading(false);
    }
  };

  if (campaignLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return <Navigate to="/campaigns" replace />;
  }

  const progress = (campaign.current_funding / campaign.funding_goal) * 100;
  const daysLeft = Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isAdmin = platformWalletService.isAdminWallet(walletAddress || '');
  const campaignEnded = new Date(campaign.deadline) <= new Date();
  const goalMet = campaign.current_funding >= campaign.funding_goal;

  const handleDonate = async () => {
    if (!user) {
      toast.error('Please sign in to donate');
      return;
    }

    if (!walletAddress) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }

    try {
      setLoading(true);
      await createContribution({
        campaign_id: campaign.id,
        amount: parseFloat(donationAmount),
      });
      
      toast.success('Donation successful!');
      setDonationAmount('');
      loadCampaignData(); // Refresh data
    } catch (error: any) {
      toast.error(error.message || 'Failed to process donation');
    } finally {
      setLoading(false);
    }
  };

  const handlePayout = async () => {
    if (!campaign.creator?.wallet_address) {
      toast.error('Creator wallet address not found');
      return;
    }

    try {
      setLoading(true);
      await processPayout(campaign.id, campaign.creator.wallet_address, campaign.current_funding);
      toast.success('Payout processed successfully!');
      loadCampaignData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to process payout');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    try {
      setLoading(true);
      await processRefunds(campaign.id, donors);
      toast.success('Refunds processed successfully!');
      loadCampaignData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to process refunds');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'donors', label: 'Donors' },
    { id: 'media', label: 'Media Gallery' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <img 
            src={campaign.image_ipfs_hash ? ipfsService.getFileUrl(campaign.image_ipfs_hash) : 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800'} 
            alt={campaign.title}
            className="w-full h-64 object-cover"
          />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
                    {campaign.category}
                  </span>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    daysLeft > 7 
                      ? 'bg-green-100 text-green-800' 
                      : daysLeft > 0 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{campaign.title}</h1>
                <p className="text-gray-600">{campaign.description}</p>
              </div>
            </div>

            {/* Progress Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <div className="text-2xl font-bold text-gray-900">{campaign.current_funding.toFixed(2)} SHM</div>
                <div className="text-sm text-gray-500">raised of {campaign.funding_goal.toFixed(2)} SHM goal</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{donors.length}</div>
                <div className="text-sm text-gray-500">backers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{daysLeft > 0 ? daysLeft : 0}</div>
                <div className="text-sm text-gray-500">days to go</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-500 mt-1 block">
                {progress.toFixed(1)}% funded
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-4 text-sm font-medium ${
                        activeTab === tab.id
                          ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Project</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {campaign.description} This innovative project aims to revolutionize how we approach 
                        sustainable solutions in the {campaign.category.toLowerCase()} sector. With your support, 
                        we can bring this vision to life and create lasting positive impact.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Creator</h3>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {campaign.current_funding.toFixed(2)} / {campaign.funding_goal.toFixed(2)} SHM
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{campaign.creator}</div>
                          <div className="text-sm text-gray-500">Verified Creator</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {campaign.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Admin Controls */}
                  {isAdmin && campaignEnded && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-3">Admin Controls</h4>
                      <div className="flex space-x-3">
                        {goalMet ? (
                          <button
                            onClick={handlePayout}
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                          >
                            {loading ? 'Processing...' : 'Payout to Creator'}
                          </button>
                        ) : (
                          <button
                            onClick={handleRefund}
                            disabled={loading}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                          >
                            {loading ? 'Processing...' : 'Refund All Donors'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                )}

                {activeTab === 'milestones' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Milestones</h3>
                    {campaign.milestones.map((milestone, index) => (
                      <div key={milestone.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                          <div className="flex items-center space-x-2">
                            {milestone.isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <Clock className="w-5 h-5 text-yellow-500" />
                            )}
                            <span className="text-sm font-medium text-gray-600">
                              ${milestone.amount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{milestone.description}</p>
                        
                        {!milestone.isCompleted && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Governance Voting</span>
                              <span className="text-gray-600">
                                Deadline: {milestone.votingDeadline.toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
              {activeTab === 'donors' && (
                                <span className="text-green-600">For: {milestone.votesFor}</span>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Donors</h3>
                  {donors.length > 0 ? (
                    <div className="space-y-3">
                      {donors.map((donor) => (
                        <div key={donor.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {donor.contributor?.username || 'Anonymous'}
                              </p>
                              <p className="text-sm text-gray-500 font-mono">
                                {donor.contributor?.wallet_address || 'No wallet connected'}
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(donor.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-green-600">
                                {donor.amount.toFixed(2)} SHM
                              </p>
                              {donor.referral_code && (
                                <p className="text-xs text-blue-600">
                                  Ref: {donor.referral_code}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No donors yet. Be the first to support this campaign!</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'media' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Media Gallery</h3>
                  {campaign.media_ipfs_hashes && campaign.media_ipfs_hashes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {campaign.media_ipfs_hashes.map((hash: string, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={ipfsService.getFileUrl(hash)}
                            alt={`Media ${index + 1}`}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No additional media files uploaded.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-4 text-sm font-medium ${
                      activeTab === tab.id
                        ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Project</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {campaign.description}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Creator</h3>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {campaign.creator?.username?.slice(0, 2).toUpperCase() || 'CR'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {campaign.creator?.username || 'Anonymous Creator'}
                        </div>
                        <div className="text-sm text-gray-500 font-mono">
                          {campaign.creator?.wallet_address || 'Wallet not connected'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'donors' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Donors</h3>
                  {donors.length > 0 ? (
                    <div className="space-y-3">
                      {donors.map((donor) => (
                        <div key={donor.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {donor.contributor?.username || 'Anonymous'}
                              </p>
                              <p className="text-sm text-gray-500 font-mono">
                                {donor.contributor?.wallet_address || 'No wallet connected'}
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(donor.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-green-600">
                                {donor.amount.toFixed(2)} SHM
                              </p>
                              {donor.referral_code && (
                                <p className="text-xs text-blue-600">
                                  Ref: {donor.referral_code}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No donors yet. Be the first to support this campaign!</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'media' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Media Gallery</h3>
                  {campaign.media_ipfs_hashes && campaign.media_ipfs_hashes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {campaign.media_ipfs_hashes.map((hash: string, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={ipfsService.getFileUrl(hash)}
                            alt={`Media ${index + 1}`}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No additional media files uploaded.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-4 text-sm font-medium ${
                      activeTab === tab.id
                        ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Project</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {campaign.description}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Creator</h3>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {campaign.creator?.username?.slice(0, 2).toUpperCase() || 'CR'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {campaign.creator?.username || 'Anonymous Creator'}
                        </div>
                        <div className="text-sm text-gray-500 font-mono">
                          {campaign.creator?.wallet_address || 'Wallet not connected'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'donors' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Donors</h3>
                  {donors.length > 0 ? (
                    <div className="space-y-3">
                      {donors.map((donor) => (
                        <div key={donor.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {donor.contributor?.username || 'Anonymous'}
                              </p>
                              <p className="text-sm text-gray-500 font-mono">
                                {donor.contributor?.wallet_address || 'No wallet connected'}
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(donor.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-green-600">
                                {donor.amount.toFixed(2)} SHM
                              </p>
                              {donor.referral_code && (
                                <p className="text-xs text-blue-600">
                                  Ref: {donor.referral_code}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No donors yet. Be the first to support this campaign!</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'media' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Media Gallery</h3>
                  {campaign.media_ipfs_hashes && campaign.media_ipfs_hashes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {campaign.media_ipfs_hashes.map((hash: string, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={ipfsService.getFileUrl(hash)}
                            alt={`Media ${index + 1}`}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No additional media files uploaded.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'updates' && (
                  Donation Amount (SHM)
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Updates</h3>
                    {campaign.updates.length > 0 ? (
                      campaign.updates.map((update) => (
                        <div key={update.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{update.title}</h4>
                  step="0.01"
                  min="0"
                            <span className="text-sm text-gray-500">
                              {update.timestamp.toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-600">{update.content}</p>
                {[1, 5, 10].map((amount) => (
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No updates yet. Check back later for project news!</p>
                    {amount} SHM
                    )}
                  </div>
                )}

                {activeTab === 'media' && (
                  <div className="space-y-6">
                disabled={!donationAmount || loading || !user || !walletAddress || campaignEnded}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                {loading ? 'Processing...' : 
                 !user ? 'Sign In to Donate' :
                 !walletAddress ? 'Connect Wallet' :
                 campaignEnded ? 'Campaign Ended' :
                 'Donate Now'}
                      <p className="text-sm text-gray-400 mt-2">Coming soon: Project images, videos, and documents</p>
                    </div>
                  </div>
                Donations are sent to platform wallet and processed securely
              </div>
            </div>
          </div>

          {/* Admin Controls */}
          {isAdmin && campaignEnded && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Controls</h3>
              <div className="space-y-3">
                <div className="text-sm text-gray-600 mb-3">
                  Campaign ended. {goalMet ? 'Goal was met.' : 'Goal was not met.'}
                </div>
                {goalMet ? (
                  <button
                    onClick={handlePayout}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Payout to Creator'}
                  </button>
                ) : (
                  <button
                    onClick={handleRefund}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Refund All Donors'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Donation Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Support This Project</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Donation Amount (USD)
                  </label>
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {[25, 50, 100].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setDonationAmount(amount.toString())}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      ${amount}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleDonate}
                  disabled={!donationAmount}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Donate Now
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Donations are processed securely through smart contracts
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium">
                    {new Date(campaign.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deadline</span>
                  <span className="font-medium">{new Date(campaign.deadline).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Donors</span>
                  <span className="font-medium">{donors.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium ${campaign.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {campaign.is_active ? 'Active' : 'Ended'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;