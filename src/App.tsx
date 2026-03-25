/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import Auth from './Auth';
import MainApp from './components/MainApp';
import Admin from './components/Admin';
import { User } from './types';
import { db, auth } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

// Component manokana hampisehoana ny doka Adsterra ao amin'ny React
const AdBanner = ({ id, height, width, hash }: { id: string, height: number, width: number, hash: string }) => {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bannerRef.current && !bannerRef.current.firstChild) {
      const conf = document.createElement('script');
      const script = document.createElement('script');
      conf.type = 'text/javascript';
      conf.innerHTML = `
        atOptions = {
          'key' : '${hash}',
          'format' : 'iframe',
          'height' : ${height},
          'width' : ${width},
          'params' : {}
        };
      `;
      script.type = 'text/javascript';
      script.src = `//www.highperformanceformat.com/${hash}/invoke.js`;
      bannerRef.current.append(conf);
      bannerRef.current.append(script);
    }
  }, [hash, height, width]);

  return <div style={{ display: 'flex', justifyContent: 'center', margin: '15px 0' }} ref={bannerRef}></div>;
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthReady(true);
      } else {
        signInAnonymously(auth).catch((error) => {
          console.error("Error signing in anonymously:", error);
          setIsAuthReady(true);
        });
      }
    });
    return () => unsubscribeAuth();
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
          if (updatedUser.status === 'active') {
            setCurrentUser(updatedUser);
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          } else {
            localStorage.removeItem('currentUser');
            setCurrentUser(null);
          }
        } else {
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
    return (
      <>
        {/* Doka kely eo ambonin'ny pejy Login */}
        <AdBanner id="top-ad-auth" height={60} width={468} hash="6a1fbab843840829bce64f162306344c" />
        <Auth onLogin={handleLogin} onAdminAccess={() => setIsAdmin(true)} />
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0f172a]">
      {/* Doka eo ambonin'ny Application */}
      <AdBanner id="top-ad-main" height={60} width={468} hash="6a1fbab843840829bce64f162306344c" />
      
      <div className="flex-grow">
        <MainApp user={currentUser} onLogout={handleLogout} onAdminAccess={() => setIsAdmin(true)} />
      </div>

      {/* Doka Banner lehibe eo ambany pejy (Footer) */}
      <AdBanner id="bottom-ad" height={250} width={300} hash="4521e6c4c2aa30c7a5bae5cff1137ec6" />
    </div>
  );
}
