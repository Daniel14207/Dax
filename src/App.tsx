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
      setCurrentUser(JSON.parse(storedUser));
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
