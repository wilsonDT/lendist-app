import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User, AuthError, SignUpWithPasswordCredentials, SignInWithPasswordCredentials, Subscription } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient'; // Your Supabase client

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  error: AuthError | null;
  signInWithPassword: (credentials: SignInWithPasswordCredentials) => Promise<{ error: AuthError | null }>;
  signUpWithPassword: (credentials: SignUpWithPasswordCredentials) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  sendPasswordResetEmail: (email: string) => Promise<{ error: AuthError | null }>;
  // Add other methods like signInWithOAuth, etc., if needed
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    setIsLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    }).catch(err => {
      console.error("Error getting session:", err);
      setError(err as AuthError);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        setError(null); // Clear previous errors on auth state change
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signInWithPassword = async (credentials: SignInWithPasswordCredentials) => {
    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword(credentials);
    if (error) setError(error);
    setIsLoading(false);
    return { error };
  };

  const signUpWithPassword = async (credentials: SignUpWithPasswordCredentials) => {
    setIsLoading(true);
    setError(null);
    // Supabase sends a confirmation email by default.
    // You might want to add options if you've disabled it or handle it differently.
    const { data, error } = await supabase.auth.signUp(credentials);
     if (error) {
        setError(error);
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
        // This can happen if user already exists but is not confirmed
        setError({ name: 'UserAlreadyExists', message: 'User already exists but is not confirmed. Please check your email for confirmation link or try to sign in.' } as AuthError);
    }
    // session and user state will be updated by onAuthStateChange listener
    setIsLoading(false);
    return { error };
  };

  const signOut = async () => {
    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.signOut();
    if (error) setError(error);
    // session and user state will be updated by onAuthStateChange listener
    setIsLoading(false);
    return { error };
  };
  
  const sendPasswordResetEmail = async (email: string) => {
    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/update-password', // URL to redirect to after email link is clicked
    });
    if (error) setError(error);
    setIsLoading(false);
    return { error };
  };

  const value = {
    session,
    user,
    isLoading,
    error,
    signInWithPassword,
    signUpWithPassword,
    signOut,
    sendPasswordResetEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 