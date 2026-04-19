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
      className={`bg-[var(--card-bg)] rounded-2xl theme-shadow p-4 border flex flex-col gap-4 cursor-pointer transition-colors ${
        hasTokens 
          ? 'border-[var(--border-color)] hover:border-[var(--input-focus)]/50' 
          : 'border-[var(--border-color)] opacity-75 hover:opacity-100 hover:border-slate-600'
      }`}
      onClick={() => setSelectedUser(user)}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="font-bold text-lg text-[var(--text-primary)]">{user.phone}</div>
          <div className="text-xs text-[var(--text-secondary)] font-mono mt-1">ID: {user.id}</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">
            Inscrit le: {new Date(user.createdAt).toLocaleDateString('fr-FR')}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {hasTokens ? (
            <span className="px-2 py-1 rounded text-xs font-bold uppercase bg-[#22C55E]/20 text-[#22C55E]">
              ACTIVE
            </span>
          ) : (
            <span className="px-2 py-1 rounded text-xs font-bold uppercase bg-[#EF4444]/20 text-[#EF4444]">
              NO TOKENS
            </span>
          )}
          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.status === 'active' ? 'bg-blue-500/20 text-blue-400' : 'bg-[var(--tab-bg)]0/20 text-[var(--text-secondary)]'}`}>
            {user.status === 'active' ? 'Compte Actif' : 'Compte Inactif'}
          </span>
        </div>
      </div>

      <div className={`flex items-center justify-between p-3 rounded-xl active:scale-95 transition-transform ${hasTokens ? 'bg-[var(--input-bg)] opacity-80' : 'bg-[var(--input-bg)] opacity-30'}`}>
        <div className="flex items-center gap-2">
          <Coins className={`w-5 h-5 ${hasTokens ? 'text-[var(--btn-primary)]' : 'text-[var(--text-secondary)]'}`} />
          <span className={`text-lg ${hasTokens ? 'font-black text-[var(--text-primary)]' : 'font-medium text-[var(--text-secondary)]'}`}>
            {user.tokens}
          </span>
          <span className="text-[var(--text-secondary)] text-sm">Tokens</span>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setSelectedUser(user);
          }}
          className={`px-4 py-2 rounded-xl active:scale-95 transition-transform font-bold transition-colors text-sm ${
            hasTokens 
              ? 'bg-[var(--btn-primary)] hover:bg-[var(--btn-hover)] text-white' 
              : 'bg-[var(--input-bg)] hover:bg-[var(--border-color)] text-white'
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
            ? 'bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20' 
            : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
        }`}
      >
        {user.status === 'active' ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
        {user.status === 'active' ? 'Désactiver le compte' : 'Activer le compte'}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-from to-theme-bg-to text-[var(--text-primary)] flex flex-col relative">
      <div className="bg-[var(--card-bg)] p-4 flex items-center gap-4 sticky top-0 z-10 shadow-md">
        <button onClick={onExit} className="p-2 hover:bg-[var(--input-bg)] rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold flex-1">Panel Administrateur</h1>
        <div className="bg-[var(--input-bg)] px-3 py-1 rounded-full text-sm font-medium text-[var(--btn-primary)]">
          {users.length} Clients
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-5 h-5" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par numéro ou ID..."
              className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl py-3 pl-10 pr-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--input-focus)]"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex bg-[var(--card-bg)] rounded-2xl theme-shadow p-1 border border-[var(--border-color)]">
              <button 
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filterType === 'all' ? 'bg-[var(--input-bg)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                ALL
              </button>
              <button 
                onClick={() => setFilterType('with_tokens')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filterType === 'with_tokens' ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                WITH TOKENS
              </button>
              <button 
                onClick={() => setFilterType('no_tokens')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filterType === 'no_tokens' ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                NO TOKENS
              </button>
            </div>

            <div className="flex bg-[var(--card-bg)] rounded-2xl theme-shadow p-1 border border-[var(--border-color)] ml-auto">
              <button 
                onClick={() => setSortBy('tokens')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-colors ${sortBy === 'tokens' ? 'bg-[var(--input-bg)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                <TrendingUp className="w-4 h-4" /> Tokens
              </button>
              <button 
                onClick={() => setSortBy('date')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-colors ${sortBy === 'date' ? 'bg-[var(--input-bg)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                <Calendar className="w-4 h-4" /> Date
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {(filterType === 'all' || filterType === 'with_tokens') && (
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
                <span className="bg-[#22C55E]/20 text-[#22C55E] w-8 h-8 rounded-xl active:scale-95 transition-transform flex items-center justify-center">1️⃣</span>
                USERS WITH TOKENS ({usersWithTokens.length})
              </h2>
              {usersWithTokens.length === 0 ? (
                <div className="text-center text-[var(--text-secondary)] py-6 bg-[var(--card-bg)] rounded-2xl theme-shadow border border-[var(--border-color)]">Aucun client avec des tokens</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {usersWithTokens.map(user => renderUserCard(user, true))}
                </div>
              )}
            </div>
          )}

          {(filterType === 'all' || filterType === 'no_tokens') && (
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2 border-b border-[var(--border-color)] pb-2">
                <span className="bg-[#EF4444]/20 text-[#EF4444] w-8 h-8 rounded-xl active:scale-95 transition-transform flex items-center justify-center">2️⃣</span>
                USERS WITHOUT TOKENS ({usersWithoutTokens.length})
              </h2>
              {usersWithoutTokens.length === 0 ? (
                <div className="text-center text-[var(--text-secondary)] py-6 bg-[var(--card-bg)] rounded-2xl theme-shadow border border-[var(--border-color)]">Aucun client sans tokens</div>
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
        <div className="fixed inset-0 bg-[var(--header-bg)]/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--card-bg)] rounded-2xl theme-shadow p-6 w-full max-w-sm border border-[var(--border-color)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Envoyer des Tokens</h2>
            <p className="text-[var(--text-secondary)] text-sm mb-6">Client: <span className="text-[var(--text-primary)] font-bold">{selectedUser.phone}</span></p>
            
            <form onSubmit={handleSendTokens}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Nombre de tokens</label>
                <div className="relative">
                  <Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--btn-primary)] w-5 h-5" />
                  <input
                    type="number"
                    min="1"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                    className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl active:scale-95 transition-transform py-3 pl-10 pr-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--input-focus)] text-lg font-bold"
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
                  className="flex-1 py-3 rounded-xl active:scale-95 transition-transform font-medium bg-[var(--input-bg)] text-white hover:bg-[var(--border-color)] transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!tokenAmount}
                  className="flex-1 py-3 rounded-xl active:scale-95 transition-transform font-bold bg-[var(--btn-primary)] text-white hover:bg-[var(--btn-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
