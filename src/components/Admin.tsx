import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { ArrowLeft, Search, CheckCircle, XCircle, Coins } from 'lucide-react';

interface AdminProps {
  onExit: () => void;
}

export default function Admin({ onExit }: AdminProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const loadUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(storedUsers);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddTokens = (userId: string, amount: number) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return { ...u, tokens: u.tokens + amount };
      }
      return u;
    });
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Also update current user if they are logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, tokens: currentUser.tokens + amount }));
    }
  };

  const handleToggleStatus = (userId: string) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return { ...u, status: u.status === 'active' ? 'inactive' : 'active' };
      }
      return u;
    });
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const filteredUsers = users.filter(u => u.phone.includes(searchTerm) || u.id.includes(searchTerm));

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      <div className="bg-[#1e293b] p-4 flex items-center gap-4 sticky top-0 z-10 shadow-md">
        <button onClick={onExit} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold flex-1">Panel Administrateur</h1>
        <div className="bg-slate-800 px-3 py-1 rounded-full text-sm font-medium text-[#2dd4bf]">
          {users.length} Clients
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par numéro ou ID..."
            className="w-full bg-[#1e293b] border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#2dd4bf]"
          />
        </div>

        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <div className="text-center text-slate-500 py-10">Aucun client trouvé</div>
          ) : (
            filteredUsers.map(user => (
              <div key={user.id} className="bg-[#1e293b] rounded-xl p-4 border border-slate-800 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-lg">{user.phone}</div>
                    <div className="text-xs text-slate-500 font-mono mt-1">ID: {user.id}</div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {user.status}
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-[#eab308]" />
                    <span className="font-bold text-lg">{user.tokens}</span>
                    <span className="text-slate-400 text-sm">Tokens</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAddTokens(user.id, 1)}
                      className="bg-slate-700 hover:bg-slate-600 w-8 h-8 rounded flex items-center justify-center font-bold transition-colors"
                    >
                      +1
                    </button>
                    <button 
                      onClick={() => handleAddTokens(user.id, 5)}
                      className="bg-slate-700 hover:bg-slate-600 w-8 h-8 rounded flex items-center justify-center font-bold transition-colors"
                    >
                      +5
                    </button>
                    <button 
                      onClick={() => handleAddTokens(user.id, 10)}
                      className="bg-[#eab308] hover:bg-[#ca8a04] text-slate-900 w-10 h-8 rounded flex items-center justify-center font-bold transition-colors"
                    >
                      +10
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => handleToggleStatus(user.id)}
                  className={`w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                    user.status === 'active' 
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                      : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                  }`}
                >
                  {user.status === 'active' ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                  {user.status === 'active' ? 'Désactiver le compte' : 'Activer le compte'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
