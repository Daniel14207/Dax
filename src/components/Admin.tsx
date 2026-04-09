import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { ArrowLeft, Search, CheckCircle, XCircle, Coins, Filter, Calendar, TrendingUp } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';

interface AdminProps {
  onExit: () => void;
}

export default function Admin({ onExit }: AdminProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'with_tokens' | 'no_tokens'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'tokens'>('tokens');

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [tokenAmount, setTokenAmount] = useState('');

  useEffect(() => {
    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const clients: User[] = [];
      snapshot.forEach((doc) => {
        clients.push(doc.data() as User);
      });
      setUsers(clients);
    }, (error) => {
      console.error("Erreur lors du chargement des clients en temps réel:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleSendTokens = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !tokenAmount) return;
    
    const amount = parseInt(tokenAmount, 10);
    if (isNaN(amount) || amount <= 0) return;

    try {
      const userRef = doc(db, 'users', selectedUser.id);
      await updateDoc(userRef, {
        tokens: selectedUser.tokens + amount
      });
      
      setSelectedUser(null);
      setTokenAmount('');
      alert('Tokens envoyés avec succès !');
    } catch (err) {
      console.error("Erreur lors de l'envoi des tokens:", err);
      alert('Erreur lors de l\'envoi des tokens');
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) return;

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: userToUpdate.status === 'active' ? 'inactive' : 'active'
      });
    } catch (err) {
      console.error("Erreur lors de la modification du statut:", err);
    }
  };

  let processedUsers = users.filter(u => u.phone.includes(searchTerm) || u.id.includes(searchTerm));

  processedUsers.sort((a, b) => {
    if (sortBy === 'tokens') {
      if (b.tokens !== a.tokens) return b.tokens - a.tokens;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const usersWithTokens = processedUsers.filter(u => u.tokens > 0);
  const usersWithoutTokens = processedUsers.filter(u => u.tokens === 0);

  const renderUserCard = (user: User, hasTokens: boolean) => (
    <div 
      key={user.id} 
      className={`bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-4 border flex flex-col gap-4 cursor-pointer transition-colors ${
        hasTokens 
          ? 'border-[#E5E7EB] hover:border-amber-500/50' 
          : 'border-[#E5E7EB] opacity-75 hover:opacity-100 hover:border-slate-600'
      }`}
      onClick={() => setSelectedUser(user)}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="font-bold text-lg text-white">{user.phone}</div>
          <div className="text-xs text-[#6B7280] font-mono mt-1">ID: {user.id}</div>
          <div className="text-xs text-[#6B7280] mt-1">
            Inscrit le: {new Date(user.createdAt).toLocaleDateString('fr-FR')}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {hasTokens ? (
            <span className="px-2 py-1 rounded text-xs font-bold uppercase bg-green-500/20 text-green-400">
              ACTIVE
            </span>
          ) : (
            <span className="px-2 py-1 rounded text-xs font-bold uppercase bg-red-500/20 text-red-400">
              NO TOKENS
            </span>
          )}
          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.status === 'active' ? 'bg-blue-500/20 text-blue-400' : 'bg-[#F9FAFB]0/20 text-[#9CA3AF]'}`}>
            {user.status === 'active' ? 'Compte Actif' : 'Compte Inactif'}
          </span>
        </div>
      </div>

      <div className={`flex items-center justify-between p-3 rounded-xl active:scale-95 transition-transform ${hasTokens ? 'bg-[#1F2937]/80' : 'bg-[#1F2937]/30'}`}>
        <div className="flex items-center gap-2">
          <Coins className={`w-5 h-5 ${hasTokens ? 'text-[#FACC15]' : 'text-[#6B7280]'}`} />
          <span className={`text-lg ${hasTokens ? 'font-black text-white' : 'font-medium text-[#9CA3AF]'}`}>
            {user.tokens}
          </span>
          <span className="text-[#9CA3AF] text-sm">Tokens</span>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setSelectedUser(user);
          }}
          className={`px-4 py-2 rounded-xl active:scale-95 transition-transform font-bold transition-colors text-sm ${
            hasTokens 
              ? 'bg-[#FACC15] hover:bg-[#ca8a04] text-[#111827]' 
              : 'bg-gray-800 hover:bg-gray-700 text-white'
          }`}
        >
          ENVOYER TOKENS
        </button>
      </div>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          handleToggleStatus(user.id);
        }}
        className={`w-full py-2 rounded-xl active:scale-95 transition-transform font-medium flex items-center justify-center gap-2 transition-colors ${
          user.status === 'active' 
            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
            : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
        }`}
      >
        {user.status === 'active' ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
        {user.status === 'active' ? 'Désactiver le compte' : 'Activer le compte'}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col relative">
      <div className="bg-white p-4 flex items-center gap-4 sticky top-0 z-10 shadow-md">
        <button onClick={onExit} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold flex-1">Panel Administrateur</h1>
        <div className="bg-[#1F2937] px-3 py-1 rounded-full text-sm font-medium text-[#2dd4bf]">
          {users.length} Clients
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] w-5 h-5" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par numéro ou ID..."
              className="w-full bg-white border border-[#E5E7EB] rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#2dd4bf]"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-1 border border-[#E5E7EB]">
              <button 
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filterType === 'all' ? 'bg-gray-800 text-white' : 'text-[#9CA3AF] hover:text-white'}`}
              >
                ALL
              </button>
              <button 
                onClick={() => setFilterType('with_tokens')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filterType === 'with_tokens' ? 'bg-green-500/20 text-green-400' : 'text-[#9CA3AF] hover:text-white'}`}
              >
                WITH TOKENS
              </button>
              <button 
                onClick={() => setFilterType('no_tokens')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filterType === 'no_tokens' ? 'bg-red-500/20 text-red-400' : 'text-[#9CA3AF] hover:text-white'}`}
              >
                NO TOKENS
              </button>
            </div>

            <div className="flex bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-1 border border-[#E5E7EB] ml-auto">
              <button 
                onClick={() => setSortBy('tokens')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-colors ${sortBy === 'tokens' ? 'bg-gray-800 text-white' : 'text-[#9CA3AF] hover:text-white'}`}
              >
                <TrendingUp className="w-4 h-4" /> Tokens
              </button>
              <button 
                onClick={() => setSortBy('date')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-colors ${sortBy === 'date' ? 'bg-gray-800 text-white' : 'text-[#9CA3AF] hover:text-white'}`}
              >
                <Calendar className="w-4 h-4" /> Date
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {(filterType === 'all' || filterType === 'with_tokens') && (
            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
                <span className="bg-green-500/20 text-green-400 w-8 h-8 rounded-xl active:scale-95 transition-transform flex items-center justify-center">1️⃣</span>
                USERS WITH TOKENS ({usersWithTokens.length})
              </h2>
              {usersWithTokens.length === 0 ? (
                <div className="text-center text-[#6B7280] py-6 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#E5E7EB]">Aucun client avec des tokens</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {usersWithTokens.map(user => renderUserCard(user, true))}
                </div>
              )}
            </div>
          )}

          {(filterType === 'all' || filterType === 'no_tokens') && (
            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
                <span className="bg-red-500/20 text-red-400 w-8 h-8 rounded-xl active:scale-95 transition-transform flex items-center justify-center">2️⃣</span>
                USERS WITHOUT TOKENS ({usersWithoutTokens.length})
              </h2>
              {usersWithoutTokens.length === 0 ? (
                <div className="text-center text-[#6B7280] py-6 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#E5E7EB]">Aucun client sans tokens</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {usersWithoutTokens.map(user => renderUserCard(user, false))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-[#0D0D0D]/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-6 w-full max-w-sm border border-[#E5E7EB]">
            <h2 className="text-xl font-bold text-white mb-2">Envoyer des Tokens</h2>
            <p className="text-[#9CA3AF] text-sm mb-6">Client: <span className="text-white font-bold">{selectedUser.phone}</span></p>
            
            <form onSubmit={handleSendTokens}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Nombre de tokens</label>
                <div className="relative">
                  <Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 w-5 h-5" />
                  <input
                    type="number"
                    min="1"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                    className="w-full bg-[#1F2937] border border-[#E5E7EB] rounded-xl active:scale-95 transition-transform py-3 pl-10 pr-4 text-white focus:outline-none focus:border-amber-500 text-lg font-bold"
                    placeholder="Ex: 10"
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);
                    setTokenAmount('');
                  }}
                  className="flex-1 py-3 rounded-xl active:scale-95 transition-transform font-medium bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!tokenAmount}
                  className="flex-1 py-3 rounded-xl active:scale-95 transition-transform font-bold bg-amber-500 text-[#111827] hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ENVOYER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
