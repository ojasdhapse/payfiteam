import React from 'react';
import { Trophy, Medal, Award, Users } from 'lucide-react';
import { Contribution } from '../hooks/useContributions';

interface SupportersHallOfFameProps {
  contributions: Contribution[];
}

const SupportersHallOfFame: React.FC<SupportersHallOfFameProps> = ({ contributions }) => {
  // Sort contributions by amount (highest first)
  const sortedContributions = [...contributions].sort((a, b) => b.amount - a.amount);
  
  const getPositionIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <Users className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPositionBadge = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-yellow-100 text-yellow-800';
      case 1:
        return 'bg-gray-100 text-gray-800';
      case 2:
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (contributions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span>Supporters Hall of Fame</span>
        </h3>
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No supporters yet. Be the first to back this campaign!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <span>Supporters Hall of Fame ({contributions.length})</span>
      </h3>
      
      <div className="space-y-3">
        {sortedContributions.map((contribution, index) => (
          <div 
            key={contribution.id} 
            className={`flex items-center justify-between p-4 rounded-lg border ${
              index < 3 ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {getPositionIcon(index)}
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPositionBadge(index)}`}>
                  #{index + 1}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {contribution.donor_name || 'Anonymous'}
                </p>
                <p className="text-sm text-gray-500">
                  {contribution.donor_wallet ? 
                    `${contribution.donor_wallet.slice(0, 6)}...${contribution.donor_wallet.slice(-4)}` : 
                    'No wallet'
                  }
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(contribution.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">{contribution.amount.toFixed(2)} SHM</p>
              {index < 3 && (
                <p className="text-xs text-yellow-600 font-medium">Top Supporter</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {contributions.reduce((sum, c) => sum + c.amount, 0).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">Total Raised (SHM)</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {(contributions.reduce((sum, c) => sum + c.amount, 0) / contributions.length).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">Average Donation (SHM)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportersHallOfFame;