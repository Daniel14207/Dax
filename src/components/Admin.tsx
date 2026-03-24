import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { ArrowLeft, Search, CheckCircle, XCircle, Coins } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';

interface AdminProps {
  onExit: () => void;
}

export default function Admin({ onExit }: AdminProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [tokenAmount, setTokenAmount] = useState('');

  useEffect(() => {
    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const clients: User[] = [];
      snapshot.forEach((doc) => {
        clients.push(doc.data() as User);
      });
      // Sort by creation date descending
      clients.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;

  const filteredUsers = users.filter(u => u.phone.includes(searchTerm) || u.id.includes(searchTerm));
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col relative">
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
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            placeholder="Rechercher par numéro ou ID..."
            className="w-full bg-[#1e293b] border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#2dd4bf]"
          />
        </div>

        <div className="space-y-4">
          {currentUsers.length === 0 ? (
            <div className="text-center text-slate-500 py-10">Aucun client trouvé</div>
          ) : (
            currentUsers.map(user => (
              <div 
                key={user.id} 
                className="bg-[#1e293b] rounded-xl p-4 border border-slate-800 flex flex-col gap-4 cursor-pointer hover:border-amber-500/50 transition-colors"
                onClick={() => setSelectedUser(user)}
              >
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
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedUser(user);
                    }}
                    className="bg-[#eab308] hover:bg-[#ca8a04] text-slate-900 px-4 py-2 rounded-lg font-bold transition-colors text-sm"
                  >
                    ENVOYER TOKENS
                  </button>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleStatus(user.id);
                  }}
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

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6 mb-4">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-slate-800 rounded-lg disabled:opacity-50 hover:bg-slate-700 transition-colors"
            >
              Précédent
            </button>
            <span className="text-slate-400">
              Page {currentPage} sur {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-slate-800 rounded-lg disabled:opacity-50 hover:bg-slate-700 transition-colors"
            >
              Suivant
            </button>
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1e293b] rounded-xl p-6 w-full max-w-sm border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-2">Envoyer des Tokens</h2>
            <p className="text-slate-400 text-sm mb-6">Client: <span className="text-white font-bold">{selectedUser.phone}</span></p>
            
            <form onSubmit={handleSendTokens}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-400 mb-2">Nombre de tokens</label>
                <div className="relative">
                  <Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 w-5 h-5" />
                  <input
                    type="number"
                    min="1"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-amber-500 text-lg font-bold"
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
                  className="flex-1 py-3 rounded-lg font-medium bg-slate-700 text-white hover:bg-slate-600 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!tokenAmount}
                  className="flex-1 py-3 rounded-lg font-bold bg-amber-500 text-slate-900 hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
