import React from 'react';
import { mockUser, mockDonations } from '../data/mockData';
import { User, Shield, TrendingUp, Calendar, ExternalLink } from 'lucide-react';

const Profile: React.FC = () => {
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
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{mockUser.address}</h3>
                {mockUser.isVerified && (
                  <div className="flex items-center justify-center space-x-1 mb-4">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-700 font-medium">Verified Donor</span>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">${mockUser.totalDonated.toLocaleString()}</div>
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
                  <span className="font-medium">{mockDonations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Referral Earnings</span>
                  <span className="font-medium text-green-600">${mockUser.referralEarnings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tokens Earned</span>
                  <span className="font-medium text-purple-600">{mockUser.tokensEarned}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">NFTs Collected</span>
                  <span className="font-medium text-orange-600">{mockUser.nftsEarned.length}</span>
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
                {mockDonations.map((donation) => (
                  <div key={donation.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{donation.campaignTitle}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{donation.timestamp.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <ExternalLink className="w-4 h-4" />
                          <span className="font-mono">{donation.transactionHash.slice(0, 10)}...</span>
                        </div>
                      </div>
                      {donation.referralCode && (
                        <div className="mt-1">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Ref: {donation.referralCode}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">${donation.amount}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* NFT Collection */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">NFT Collection</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mockUser.nftsEarned.map((nft) => (
                  <div key={nft.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <img
                      src={nft.image}
                      alt={nft.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h4 className="font-medium text-gray-900 mb-1">{nft.name}</h4>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        nft.tier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                        nft.tier === 'silver' ? 'bg-gray-100 text-gray-800' :
                        nft.tier === 'bronze' ? 'bg-orange-100 text-orange-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {nft.tier.charAt(0).toUpperCase() + nft.tier.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {nft.earnedAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievement Progress */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievement Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Generous Supporter</span>
                    <span className="text-sm text-gray-500">$15,750 / $25,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full" style={{ width: '63%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Unlock Platinum NFT at $25,000</p>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Community Builder</span>
                    <span className="text-sm text-gray-500">28 / 50 referrals</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '56%' }}></div>
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