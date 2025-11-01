import React, { useContext, useState, useEffect, createContext, ReactNode } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Simplified user object to avoid circular references
export interface AppUser {
  uid: string;
  email: string | null;
  name: string | null;
  phoneNumber?: string | null;
}

interface AuthContextType {
  currentUser: AppUser | null;
  credits: number | null;
  loading: boolean;
  updateCredits: (newCredits: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        const userData = userDoc.exists() ? userDoc.data() : null;
        const userName = userData ? userData.name : null;
        const userCredits = userData ? userData.credits : 0;
        const userPhoneNumber = userData ? userData.phoneNumber : null;

        const appUser: AppUser = { 
          uid: user.uid, 
          email: user.email, 
          name: userName,
          phoneNumber: userPhoneNumber,
        };

        setCurrentUser(appUser);
        setCredits(userCredits);

      } else {
        setCurrentUser(null);
        setCredits(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);
  
  const updateCredits = async (newCredits: number) => {
    if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        try {
            await setDoc(userDocRef, { credits: newCredits }, { merge: true });
            setCredits(newCredits);
        } catch (error) {
            console.error("Failed to update credits in Firestore:", error);
            // Optionally re-throw or handle the error in UI
            throw new Error("Could not update credits.");
        }
    } else {
        throw new Error("No user logged in to update credits.");
    }
  };


  const value = {
    currentUser,
    credits,
    loading,
    updateCredits,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};