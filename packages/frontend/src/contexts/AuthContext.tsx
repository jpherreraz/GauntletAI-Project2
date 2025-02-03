import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@crm/shared/utils/api-client';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@crm/shared/constants';
import { UserRole } from '@crm/shared/types/user';

console.log('🔍 AuthContext: Initializing');

interface Profile {
  id: string;
  role: UserRole;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  console.log('🔍 AuthProvider: Component mounting');
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchProfile = async (userId: string) => {
    try {
      console.log('🔍 AuthProvider: Fetching profile for user:', userId);
      setLoading(true); // Ensure loading is true while fetching
      
      // Log available roles
      console.log('Available roles:', Object.values(UserRole));
      
      // Use edge function instead of direct database access
      console.log('🔍 AuthProvider: Fetching profile using edge function');
      const { data: profileData, error: fnError } = await supabase.functions.invoke('get-user-profile', {
        body: { userId }
      });

      console.log('Edge function response:', JSON.stringify({ profileData, fnError }, null, 2));

      if (fnError) {
        console.error('❌ AuthProvider: Error fetching profile from edge function:', {
          error: fnError,
          details: fnError.details,
          message: fnError.message
        });
        setError('Failed to fetch user profile');
        throw fnError;
      }

      if (!profileData) {
        console.error('❌ AuthProvider: No profile data received from edge function');
        setError('No profile data available');
        throw new Error('No profile data');
      }

      // Log the role type and value
      console.log('Profile role details:', {
        roleValue: profileData.role,
        roleType: typeof profileData.role,
        isValidRole: Object.values(UserRole).includes(profileData.role),
        caseMatch: Object.values(UserRole).some(r => r.toLowerCase() === profileData.role?.toLowerCase())
      });

      // Validate the role with case-insensitive comparison
      const normalizedRole = profileData.role?.toLowerCase();
      const validRole = Object.values(UserRole).find(r => r.toLowerCase() === normalizedRole);

      if (!validRole) {
        console.error('❌ AuthProvider: Invalid role in profile:', {
          receivedRole: profileData.role,
          validRoles: Object.values(UserRole),
          normalizedRole,
        });
        setError('Invalid user role');
        throw new Error('Invalid user role');
      }

      // Use the correctly cased role from our enum
      const profile = {
        id: profileData.id || userId,
        role: validRole as UserRole,
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || ''
      };

      console.log('✅ AuthProvider: Profile processed:', profile);

      setProfile(profile);
      setError(null);
      
    } catch (error) {
      console.error('❌ AuthProvider: Error in fetchProfile:', error);
      setProfile(null);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔍 AuthProvider: Running auth effect');
    let mounted = true;

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;

      console.log('✅ AuthProvider: Session checked', {
        hasSession: !!session,
        userData: session?.user,
      });
      
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    }).catch(error => {
      if (!mounted) return;
      console.error('❌ AuthProvider: Error getting session:', error);
      setError('Failed to get session');
      setLoading(false);
    });

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      console.log('🔄 AuthProvider: Auth state changed', {
        event: _event,
        hasSession: !!session,
        userData: session?.user,
      });
      
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      console.log('🔍 AuthProvider: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log('🔍 AuthProvider: Signing out');
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setError(null);
      navigate(ROUTES.LOGIN);
      console.log('✅ AuthProvider: Sign out successful');
    } catch (error) {
      console.error('❌ AuthProvider: Error signing out:', error);
      setError('Failed to sign out');
    }
  };

  const value = {
    user,
    profile,
    loading,
    error,
    signOut,
  };

  console.log('🔍 AuthProvider: Rendering', { 
    loading, 
    hasUser: !!user, 
    hasProfile: !!profile, 
    error,
    profileData: profile
  });

  // Always render children, let components handle loading state if needed
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('❌ useAuth: Hook must be used within an AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 