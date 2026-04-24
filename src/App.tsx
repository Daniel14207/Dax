/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Auth from './Auth';
import MainApp from './components/MainApp';
import Admin from './components/Admin';
import SplashScreen from './components/SplashScreen';
import { User } from './types';
import { db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSplashDone, setIsSplashDone] = useState(false);

  useEffect(() => {
    // The app uses a custom authentication system (Auth.tsx) and stores users in Firestore.
    // Firebase Auth (signInAnonymously) is not required since Firestore rules are open.
    setIsAuthReady(true);
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;

    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      
      const userRef = doc(db, 'users', user.id);
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const updatedUser = docSnap.data() as User;
          if (updatedUser.status === 'active' || updatedUser.status === 'expired') {
            setCurrentUser(updatedUser);
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          } else {
            // Account became inactive
            localStorage.removeItem('currentUser');
            setCurrentUser(null);
          }
        } else {
          // User document deleted
          localStorage.removeItem('currentUser');
          setCurrentUser(null);
        }
      }, (error) => {
        console.error('Failed to listen to user data', error);
      });

      return () => unsubscribe();
    }
  }, [isAuthReady]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem('currentUser');
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2dd4bf]"></div>
      </div>
    );
  }

  if (isAdmin) {
    return <Admin onExit={() => setIsAdmin(false)} />;
  }

  if (!currentUser) {
    if (!isSplashDone) {
      return <SplashScreen onComplete={() => setIsSplashDone(true)} />;
    }
    return <Auth onLogin={handleLogin} onAdminAccess={() => setIsAdmin(true)} />;
  }

  return <MainApp user={currentUser} onLogout={handleLogout} onAdminAccess={() => setIsAdmin(true)} />;
}
