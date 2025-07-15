import React from 'react';
import { Campaign } from '../hooks/useCampaigns';
import { ipfsService } from '../lib/ipfs';
import { Calendar, Target, TrendingUp, Users } from 'lucide-react';

interface CampaignCardProps {
  campaign: Campaign;
  onClick: () => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onClick }) => {
  const progress = (campaign.current_funding / campaign.funding_goal) * 100;
  const daysLeft = Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden"
    >
      <div className="relative">
        <img 
          src={campaign.image_ipfs_hash ? ipfsService.getFileUrl(campaign.image_ipfs_hash) : 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800'} 
          alt={campaign.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-purple-700 text-xs font-semibold rounded-full">
            {campaign.category}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
            daysLeft > 7 
              ? 'bg-green-100 text-green-800' 
              : daysLeft > 0 
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}>
            {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {campaign.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {campaign.description}
        </p>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-semibold text-gray-900">
                {campaign.current_funding.toFixed(2)} / {campaign.funding_goal.toFixed(2)} SHM
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500 mt-1 block">
              {progress.toFixed(1)}% funded
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Target className="w-4 h-4" />
              <span>Goal: {campaign.funding_goal.toFixed(2)} SHM</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(campaign.deadline).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;