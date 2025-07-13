import React, { useState } from 'react';
import { mockGovernanceProposals, mockUser } from '../data/mockData';
import { Vote, Clock, CheckCircle, XCircle, AlertCircle, Users } from 'lucide-react';

const Governance: React.FC = () => {
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleVote = (proposalId: string, vote: 'for' | 'against') => {
    alert(`Voted ${vote} on proposal ${proposalId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Governance</h1>
          <p className="text-gray-600">
            Participate in decentralized decision-making for milestone approvals and fund releases.
          </p>
        </div>

        {/* User Voting Power */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Your Voting Power</h3>
              <p className="text-gray-600">Based on your donation history and verification status</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                {mockUser.isVerified ? '5.2' : '0'}
              </div>
              <div className="text-sm text-gray-500">Voting Weight</div>
            </div>
          </div>
          {mockUser.isVerified && (
            <div className="mt-4 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-700 font-medium">Verified Voter</span>
            </div>
          )}
        </div>

        {/* Active Proposals */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Active Proposals</h2>
          
          {mockGovernanceProposals.map((proposal) => (
            <div key={proposal.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(proposal.status)}
                      <h3 className="text-lg font-semibold text-gray-900">{proposal.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(proposal.status)}`}>
                        {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{proposal.description}</p>
                  </div>
                </div>

                {/* Voting Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800">Votes For</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-900">{proposal.votesFor}</div>
                    <div className="text-sm text-green-600">
                      {((proposal.votesFor / proposal.totalVoters) * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-red-800">Votes Against</span>
                      <XCircle className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="text-2xl font-bold text-red-900">{proposal.votesAgainst}</div>
                    <div className="text-sm text-red-600">
                      {((proposal.votesAgainst / proposal.totalVoters) * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">Total Voters</span>
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-900">{proposal.totalVoters}</div>
                    <div className="text-sm text-blue-600">Participated</div>
                  </div>
                </div>

                {/* Voting Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Voting Progress</span>
                    <span>Deadline: {proposal.votingDeadline.toLocaleDateString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="flex h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-green-500" 
                        style={{ width: `${(proposal.votesFor / proposal.totalVoters) * 100}%` }}
                      ></div>
                      <div 
                        className="bg-red-500" 
                        style={{ width: `${(proposal.votesAgainst / proposal.totalVoters) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Voting Actions */}
                {proposal.status === 'active' && mockUser.isVerified && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleVote(proposal.id, 'for')}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Vote For</span>
                    </button>
                    <button
                      onClick={() => handleVote(proposal.id, 'against')}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Vote Against</span>
                    </button>
                  </div>
                )}

                {!mockUser.isVerified && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        You need to be a verified donor to participate in governance voting.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* How Governance Works */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How Governance Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Verified Donors</h4>
              <p className="text-sm text-gray-600">Only verified donors can participate in governance decisions</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Vote className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Milestone Voting</h4>
              <p className="text-sm text-gray-600">Vote on milestone completion and fund releases</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Transparent Results</h4>
              <p className="text-sm text-gray-600">All votes are recorded on-chain for full transparency</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Governance;