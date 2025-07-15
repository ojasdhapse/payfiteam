import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Contribution {
  id: string;
  contributor_id: string;
  campaign_id: string;
  amount: number;
  transaction_hash: string;
  referral_code: string | null;
  created_at: string;
  campaign?: {
    title: string;
    creator_id: string;
  };
  contributor?: {
    username: string | null;
    wallet_address: string | null;
  };
}

export const useContributions = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserContributions();
      
      // Subscribe to real-time updates
      const subscription = supabase
        .channel('contributions')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'contributions' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newContribution = payload.new as Contribution;
              if (newContribution.contributor_id === user.id) {
                setContributions(prev => [newContribution, ...prev]);
              }
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchUserContributions = async () => {
    try {
      if (!user) return;

      setLoading(true);
      const { data, error } = await supabase
        .from('contributions')
        .select(`
          *,
          campaign:campaigns!contributions_campaign_id_fkey(title, creator_id),
          contributor:profiles!contributions_contributor_id_fkey(username, wallet_address)
        `)
        .eq('contributor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContributions(data || []);
    } catch (err) {
      console.error('Error fetching contributions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch contributions');
    } finally {
      setLoading(false);
    }
  };

  const createContribution = async (contributionData: {
    campaign_id: string;
    amount: number;
    referral_code?: string;
  }) => {
    try {
      if (!user) throw new Error('User must be logged in');

      // Send funds to platform wallet first
      const { platformWalletService } = await import('../lib/platformWallet');
      const txHash = await platformWalletService.sendToPlatformWallet(contributionData.amount.toString());

      const { data, error } = await supabase
        .from('contributions')
        .insert({
          ...contributionData,
          contributor_id: user.id,
          transaction_hash: txHash,
        })
        .select()
        .single();

      if (error) throw error;

      // Update campaign funding and user profile
      await Promise.all([
        supabase.rpc('increment_campaign_funding', {
          campaign_id: contributionData.campaign_id,
          amount: contributionData.amount
        }),
        supabase.rpc('increment_total_donated', {
          user_id: user.id,
          amount: contributionData.amount
        })
      ]);

      return data;
    } catch (err) {
      console.error('Error creating contribution:', err);
      throw err;
    }
  };

  const getCampaignContributions = async (campaignId: string) => {
    try {
      const { data, error } = await supabase
        .from('contributions')
        .select(`
          *,
          contributor:profiles!contributions_contributor_id_fkey(username, wallet_address)
        `)
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching campaign contributions:', err);
      return [];
    }
  };

  const getTotalContributed = async (userId?: string) => {
    try {
      const targetUserId = userId || user?.id;
      if (!targetUserId) return 0;

      const { data, error } = await supabase
        .from('contributions')
        .select('amount')
        .eq('contributor_id', targetUserId);

      if (error) throw error;
      
      return data?.reduce((total, contribution) => total + contribution.amount, 0) || 0;
    } catch (err) {
      console.error('Error calculating total contributed:', err);
      return 0;
    }
  };

  const processPayout = async (campaignId: string, creatorAddress: string, amount: number) => {
    try {
      if (!user) throw new Error('User must be logged in');

      const { platformWalletService } = await import('../lib/platformWallet');
      const txHash = await platformWalletService.payoutToCampaignCreator(creatorAddress, amount.toString());

      // Update campaign status
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          is_active: false,
          payout_transaction_hash: txHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      if (error) throw error;
      return txHash;
    } catch (err) {
      console.error('Error processing payout:', err);
      throw err;
    }
  };

  const processRefunds = async (campaignId: string, contributions: Contribution[]) => {
    try {
      if (!user) throw new Error('User must be logged in');

      const { platformWalletService } = await import('../lib/platformWallet');
      const refundPromises = contributions.map(async (contribution) => {
        if (contribution.contributor?.wallet_address) {
          return platformWalletService.refundToDonor(
            contribution.contributor.wallet_address,
            contribution.amount.toString()
          );
        }
        return null;
      });

      const refundTxHashes = await Promise.all(refundPromises);

      // Update campaign status
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          is_active: false,
          refund_processed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      if (error) throw error;
      return refundTxHashes.filter(Boolean);
    } catch (err) {
      console.error('Error processing refunds:', err);
      throw err;
    }
  };

  return {
    contributions,
    loading,
    error,
    createContribution,
    getCampaignContributions,
    getTotalContributed,
    processPayout,
    processRefunds,
    refetch: fetchUserContributions,
  };
};