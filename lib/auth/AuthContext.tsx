'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  subscribeToAuthChanges, 
  getUserProfile, 
  createUserProfile,
  signInRecruiter, 
  signUpRecruiter, 
  signInWithGoogle as googleSignInService,
  signOutUser 
} from '@/lib/services/authService';
import { UserProfile } from '@/types/recruiter';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isRecruiter: boolean;
  signIn: (email: string, pass: string) => Promise<UserProfile>;
  signUp: (email: string, pass: string, name: string) => Promise<UserProfile>;
  signInWithGoogle: () => Promise<UserProfile>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (fbUser: FirebaseUser) => {
    try {
      let profile = await getUserProfile(fbUser.uid);
      if (!profile) {
        // Automatically create missing user document in Firestore
        profile = await createUserProfile(
          fbUser.uid,
          fbUser.email || '',
          fbUser.displayName || fbUser.email?.split('@')[0] || 'Recruiter',
          'RECRUITER'
        );
      }
      setUserProfile(profile);
    } catch (err) {
      console.warn('Error fetching user profile:', err);
      setUserProfile({
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Recruiter',
        email: fbUser.email || '',
        role: 'RECRUITER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string) => {
    const profile = await signInRecruiter(email, pass);
    setUserProfile(profile);
    return profile;
  };

  const signUp = async (email: string, pass: string, name: string) => {
    const profile = await signUpRecruiter(email, pass, name);
    setUserProfile(profile);
    return profile;
  };

  const signInWithGoogle = async () => {
    const profile = await googleSignInService('RECRUITER');
    setUserProfile(profile);
    return profile;
  };

  const signOut = async () => {
    await signOutUser();
    setUser(null);
    setUserProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  const isRecruiter = userProfile?.role === 'RECRUITER' || (!userProfile && !!user);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isRecruiter,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
