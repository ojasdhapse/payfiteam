import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, referralCode?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
  connectWallet: (walletAddress: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        await createProfile(userId);
      } else if (error) {
        throw error;
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const createProfile = async (userId: string) => {
    try {
      const referralCode = `REF_${uuidv4().slice(0, 8).toUpperCase()}`;
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: user?.email || '',
          referral_code: referralCode,
          total_donated: 0,
          total_raised: 0,
          is_verified: false,
        })
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, referralCode?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Create profile with referral info
        const newReferralCode = `REF_${uuidv4().slice(0, 8).toUpperCase()}`;
        
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            referral_code: newReferralCode,
            referred_by: referralCode || null,
            total_donated: 0,
            total_raised: 0,
            is_verified: false,
          });

        if (profileError) throw profileError;
      }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Always update UI state first for responsive UX
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Attempt to sign out from Supabase, but don't block UI if it fails
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.warn('Supabase sign out error (non-blocking):', error);
        }
      } catch (supabaseError) {
        console.warn('Supabase unreachable during sign out:', supabaseError);
      }
      
      // Note: We intentionally do NOT disconnect the wallet here
      // The wallet connection should persist across sign-in/sign-out cycles
    } catch (error) {
      console.error('Error during sign out process:', error);
      // Even if there's an error, ensure the user is logged out locally
      setUser(null);
      setProfile(null);
      setSession(null);
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const connectWallet = async (walletAddress: string) => {
    try {
      await updateProfile({ wallet_address: walletAddress });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  };

  return {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    connectWallet,
  };
};

export { AuthContext };