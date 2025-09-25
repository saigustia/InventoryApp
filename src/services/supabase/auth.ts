import { supabase } from './client';
import { User, Session } from '@supabase/supabase-js';
import { flipperDebug } from '@/utils/debugging/flipper';

export interface AuthService {
  signUp: (email: string, password: string, userData: { firstName: string; lastName: string }) => Promise<{ user: User | null; error: any }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  getCurrentUser: () => Promise<User | null>;
  getCurrentSession: () => Promise<Session | null>;
  getUserProfile: () => Promise<any>;
  updateUserProfile: (updates: any) => Promise<{ data: any; error: any }>;
  onAuthStateChange: (callback: (event: string, session: Session | null) => void) => any;
}

export const authService: AuthService = {
  async signUp(email: string, password: string, userData: { firstName: string; lastName: string }) {
    try {
      flipperDebug.logUserAction('User Registration Attempt', { email });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
          },
        },
      });

      if (error) {
        flipperDebug.logError(error, 'User Registration');
        return { user: null, error };
      }

      flipperDebug.logUserAction('User Registration Success', { email, userId: data.user?.id });
      return { user: data.user, error: null };
    } catch (error) {
      flipperDebug.logError(error as Error, 'User Registration');
      return { user: null, error };
    }
  },

  async signIn(email: string, password: string) {
    try {
      flipperDebug.logUserAction('User Login Attempt', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        flipperDebug.logError(error, 'User Login');
        return { user: null, error };
      }

      flipperDebug.logUserAction('User Login Success', { email, userId: data.user?.id });
      return { user: data.user, error: null };
    } catch (error) {
      flipperDebug.logError(error as Error, 'User Login');
      return { user: null, error };
    }
  },

  async signOut() {
    try {
      flipperDebug.logUserAction('User Logout');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        flipperDebug.logError(error, 'User Logout');
      }
      
      return { error };
    } catch (error) {
      flipperDebug.logError(error as Error, 'User Logout');
      return { error };
    }
  },

  async resetPassword(email: string) {
    try {
      flipperDebug.logUserAction('Password Reset Request', { email });
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'icecream://reset-password',
      });
      
      if (error) {
        flipperDebug.logError(error, 'Password Reset');
      }
      
      return { error };
    } catch (error) {
      flipperDebug.logError(error as Error, 'Password Reset');
      return { error };
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        flipperDebug.logError(error, 'Get Current User');
        return null;
      }
      
      return user;
    } catch (error) {
      flipperDebug.logError(error as Error, 'Get Current User');
      return null;
    }
  },

  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        flipperDebug.logError(error, 'Get Current Session');
        return null;
      }
      
      return session;
    } catch (error) {
      flipperDebug.logError(error as Error, 'Get Current Session');
      return null;
    }
  },

  async getUserProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        flipperDebug.logError(error, 'Get User Profile');
        return null;
      }

      return data;
    } catch (error) {
      flipperDebug.logError(error as Error, 'Get User Profile');
      return null;
    }
  },

  async updateUserProfile(updates: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: { message: 'No authenticated user' } };
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        flipperDebug.logError(error, 'Update User Profile');
      }

      return { data, error };
    } catch (error) {
      flipperDebug.logError(error as Error, 'Update User Profile');
      return { data: null, error };
    }
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
