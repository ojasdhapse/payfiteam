import { Campaign, Donation, User, NFTReward, GovernanceProposal } from '../types';

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    title: 'Revolutionary Solar Water Purifier',
    description: 'Bringing clean water to remote communities using solar-powered purification technology.',
    creator: '0x1234...5678',
    target: 100000,
    raised: 67500,
    deadline: new Date('2024-12-15'),
    category: 'Technology',
    image: 'https://images.pexels.com/photos/433308/pexels-photo-433308.jpeg?auto=compress&cs=tinysrgb&w=800',
    milestones: [
      {
        id: 'm1',
        title: 'Prototype Development',
        description: 'Complete working prototype with initial testing',
        amount: 25000,
        isCompleted: true,
        votingDeadline: new Date('2024-10-01'),
        votesFor: 45,
        votesAgainst: 5,
        totalVoters: 50
      },
      {
        id: 'm2',
        title: 'Field Testing',
        description: 'Deploy and test in 3 remote locations',
        amount: 35000,
        isCompleted: false,
        votingDeadline: new Date('2024-11-15'),
        votesFor: 38,
        votesAgainst: 12,
        totalVoters: 50
      }
    ],
    updates: [
      {
        id: 'u1',
        title: 'Prototype Testing Complete!',
        content: 'We successfully completed our prototype testing with amazing results. The purifier achieved 99.9% contamination removal.',
        media: [],
        timestamp: new Date('2024-10-05'),
        author: '0x1234...5678'
      }
    ],
    isActive: true,
    tags: ['solar', 'water', 'sustainability']
  },
  {
    id: '2',
    title: 'AI-Powered Learning Platform',
    description: 'Democratizing education through personalized AI tutoring for underserved communities.',
    creator: '0x9876...4321',
    target: 75000,
    raised: 42300,
    deadline: new Date('2024-11-30'),
    category: 'Education',
    image: 'https://images.pexels.com/photos/5428830/pexels-photo-5428830.jpeg?auto=compress&cs=tinysrgb&w=800',
    milestones: [
      {
        id: 'm3',
        title: 'AI Model Development',
        description: 'Train and optimize the core AI tutoring model',
        amount: 30000,
        isCompleted: true,
        votingDeadline: new Date('2024-09-15'),
        votesFor: 42,
        votesAgainst: 3,
        totalVoters: 45
      }
    ],
    updates: [],
    isActive: true,
    tags: ['ai', 'education', 'accessibility']
  },
  {
    id: '3',
    title: 'Biodegradable Packaging Solution',
    description: 'Revolutionary packaging material that decomposes in 30 days while maintaining durability.',
    creator: '0x5555...7777',
    target: 120000,
    raised: 89200,
    deadline: new Date('2025-01-20'),
    category: 'Environment',
    image: 'https://images.pexels.com/photos/4108715/pexels-photo-4108715.jpeg?auto=compress&cs=tinysrgb&w=800',
    milestones: [],
    updates: [],
    isActive: true,
    tags: ['sustainability', 'packaging', 'environment']
  }
];

export const mockUser: User = {
  address: '0xabcd...ef01',
  isVerified: true,
  totalDonated: 15750,
  referralCode: 'CRYPTO2024',
  referralEarnings: 2340,
  tokensEarned: 1250,
  nftsEarned: [
    {
      id: 'nft1',
      name: 'Golden Supporter',
      image: 'https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=400',
      tier: 'gold',
      earnedAt: new Date('2024-09-15')
    },
    {
      id: 'nft2',
      name: 'Environmental Champion',
      image: 'https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg?auto=compress&cs=tinysrgb&w=400',
      tier: 'silver',
      earnedAt: new Date('2024-08-20')
    }
  ]
};

export const mockDonations: Donation[] = [
  {
    id: 'd1',
    campaignId: '1',
    campaignTitle: 'Revolutionary Solar Water Purifier',
    amount: 500,
    timestamp: new Date('2024-10-10'),
    transactionHash: '0x123...abc',
    referralCode: 'FRIEND123'
  },
  {
    id: 'd2',
    campaignId: '2',
    campaignTitle: 'AI-Powered Learning Platform',
    amount: 250,
    timestamp: new Date('2024-10-05'),
    transactionHash: '0x456...def'
  },
  {
    id: 'd3',
    campaignId: '3',
    campaignTitle: 'Biodegradable Packaging Solution',
    amount: 1000,
    timestamp: new Date('2024-09-28'),
    transactionHash: '0x789...ghi'
  }
];

export const mockGovernanceProposals: GovernanceProposal[] = [
  {
    id: 'p1',
    campaignId: '1',
    milestoneId: 'm2',
    title: 'Release Funds for Field Testing Phase',
    description: 'Approve the release of $35,000 for conducting field tests in 3 remote locations as outlined in Milestone 2.',
    votingDeadline: new Date('2024-11-15'),
    votesFor: 38,
    votesAgainst: 12,
    totalVoters: 50,
    status: 'active'
  },
  {
    id: 'p2',
    campaignId: '2',
    milestoneId: 'm3',
    title: 'Platform Beta Launch Approval',
    description: 'Approve the launch of beta version of the AI tutoring platform.',
    votingDeadline: new Date('2024-10-30'),
    votesFor: 45,
    votesAgainst: 5,
    totalVoters: 50,
    status: 'passed'
  }
];