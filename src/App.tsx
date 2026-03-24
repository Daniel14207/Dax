/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Auth from './Auth';
import MainApp from './components/MainApp';
import Admin from './components/Admin';
import { User } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      
      try {
        const clients = JSON.parse(localStorage.getItem('clients') || '[]');
        const updatedUser = clients.find((c: any) => c.id === user.id);
        
        if (updatedUser) {
          if (updatedUser.status === 'active') {
            setCurrentUser(updatedUser);
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          } else {
            // Account became inactive
            localStorage.removeItem('currentUser');
            setCurrentUser(null);
          }
        } else {
          // Fallback if client not found in global list for some reason
          setCurrentUser(user);
        }
      } catch (err) {
        console.error('Failed to refresh user data', err);
        setCurrentUser(user);
      }
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem('currentUser');
  };

  if (isAdmin) {
    return <Admin onExit={() => setIsAdmin(false)} />;
  }

  if (!currentUser) {
    return <Auth onLogin={handleLogin} onAdminAccess={() => setIsAdmin(true)} />;
  }

  return <MainApp user={currentUser} onLogout={handleLogout} onAdminAccess={() => setIsAdmin(true)} />;
}
