import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Share2, Copy, Gift, TrendingUp, Users, Award } from 'lucide-react';

const Referrals: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const { profile } = useAuth();
  
  const referralLink = profile ? `https://crowdfund.app/ref/${profile.referral_code}` : '';

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const referralStats = [
    { label: 'Total Referrals', value: '28', icon: Users, color: 'blue' },
    { label: 'Earnings', value: '0 SHM', icon: TrendingUp, color: 'green' },
    { label: 'Tokens Earned', value: '0', icon: Gift, color: 'purple' },
    { label: 'NFTs Earned', value: '0', icon: Award, color: 'orange' }
  ];

  const recentReferrals: any[] = [];

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view your referral dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Referral Program</h1>
          <p className="text-gray-600">
            Invite friends and earn rewards when they make donations. Build the future of crowdfunding together!
          </p>
        </div>

        {/* Referral Link */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Link</h3>
          <div className="flex items-center space-x-3">
            <div className="flex-1 flex items-center bg-gray-50 rounded-lg p-3">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 bg-transparent border-none outline-none text-gray-700"
              />
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Share this link with friends. You'll earn 5% of their donation amount plus bonus tokens!
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {referralStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Referrals */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Referrals</h3>
            {recentReferrals.length > 0 ? (
              <div className="space-y-4">
                {recentReferrals.map((referral, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{referral.name}</p>
                      <p className="text-sm text-gray-500">Donated {referral.amount} • {referral.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">{referral.reward}</p>
                      <p className="text-xs text-gray-500">Your reward</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No referrals yet. Share your link to get started!</p>
              </div>
            )}
            </div>

          {/* NFT Rewards */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your NFT Rewards</h3>
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No NFT rewards yet. Refer users to earn exclusive NFTs!</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How Referrals Work</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Share2 className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Share Your Link</h4>
              <p className="text-sm text-gray-600">Share your unique referral link with friends and community</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Gift className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Friends Donate</h4>
              <p className="text-sm text-gray-600">When someone donates through your link, you both benefit</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Earn Rewards</h4>
              <p className="text-sm text-gray-600">Get 5% commission, tokens, and exclusive NFTs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referrals;