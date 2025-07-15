import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useContributions } from '../hooks/useContributions';
import { User, Shield, TrendingUp, Calendar, ExternalLink } from 'lucide-react';

const Profile: React.FC = () => {
  const { profile } = useAuth();
  const { contributions } = useContributions();

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account and view your contribution history.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {profile.username || profile.email}
                </h3>
                {profile.is_verified && (
                  <div className="flex items-center justify-center space-x-1 mb-4">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-700 font-medium">Verified Donor</span>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{profile.total_donated.toFixed(2)} SHM</div>
                  <div className="text-sm text-gray-500">Total Contributed</div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Quick Stats</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Campaigns Backed</span>
                  <span className="font-medium">{contributions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Referral Earnings</span>
                  <span className="font-medium text-green-600">0 SHM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tokens Earned</span>
                  <span className="font-medium text-purple-600">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">NFTs Collected</span>
                  <span className="font-medium text-orange-600">0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Donation History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation History</h3>
              <div className="space-y-4">
                {contributions.length > 0 ? contributions.map((contribution) => (
                  <div key={contribution.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{contribution.campaign?.title || 'Unknown Campaign'}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(contribution.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <ExternalLink className="w-4 h-4" />
                          <span className="font-mono">{contribution.transaction_hash.slice(0, 10)}...</span>
                        </div>
                      </div>
                      {contribution.referral_code && (
                        <div className="mt-1">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Ref: {contribution.referral_code}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">{contribution.amount.toFixed(2)} SHM</div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No donations yet. Start supporting campaigns!</p>
                  </div>
                )}
              </div>
            </div>

            {/* NFT Collection */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">NFT Collection</h3>
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No NFTs collected yet. Participate in campaigns to earn rewards!</p>
              </div>
            </div>

            {/* Achievement Progress */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievement Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Generous Supporter</span>
                    <span className="text-sm text-gray-500">{profile.total_donated.toFixed(2)} / 25 SHM</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full" style={{ width: `${Math.min((profile.total_donated / 25) * 100, 100)}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Unlock Platinum NFT at 25 SHM</p>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Community Builder</span>
                    <span className="text-sm text-gray-500">0 / 10 referrals</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Unlock special governance privileges</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;