import React, { useState } from 'react';
import { User } from './types';
import { Lock, Phone, UserPlus, LogIn, ShieldAlert } from 'lucide-react';
import { db } from './firebase';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';

interface AuthProps {
  onLogin: (user: User) => void;
  onAdminAccess: () => void;
}

export default function Auth({ onLogin, onAdminAccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (password.length < 4 || password.length > 6) {
      setError('Le mot de passe doit contenir entre 4 et 6 caractères');
      return;
    }

    setIsLoading(true);
    try {
      const usersRef = collection(db, 'users');

      if (isLogin) {
        const q = query(usersRef, where('phone', '==', phone), where('password', '==', password));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('Identifiants incorrects');
          setIsLoading(false);
          return;
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data() as User;
        
        if (userData.status === 'inactive') {
          setError('Compte inactif. Veuillez contacter l\'administrateur.');
          setIsLoading(false);
          return;
        }
        
        onLogin(userData);
      } else {
        // Check if phone already exists
        const q = query(usersRef, where('phone', '==', phone));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          setError('Ce numéro est déjà inscrit');
          setIsLoading(false);
          return;
        }

        const newId = `CLT-${Math.floor(100000 + Math.random() * 900000)}`;
        const newClient: User = {
          id: newId,
          phone,
          password,
          tokens: 0,
          status: 'active',
          createdAt: new Date().toISOString()
        };
        
        await setDoc(doc(db, 'users', newId), newClient);
        onLogin(newClient);
      }
    } catch (err: any) {
      console.error("Erreur base de données:", err);
      // Afficher le message d'erreur exact pour comprendre le problème
      setError(err.message || 'Erreur lors de la connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCode === '9729') {
      onAdminAccess();
      setShowAdminModal(false);
      setAdminCode('');
    } else {
      alert('Code incorrect');
      setAdminCode('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col justify-center items-center p-4 text-white relative">
      <div className="w-full max-w-md bg-[#1e293b] rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 bg-[#2dd4bf] text-center">
          <h1 className="text-3xl font-bold text-slate-900">Betting Tips</h1>
          <p className="text-slate-800 mt-2">Pronostics Premium</p>
        </div>
        
        <div className="p-6">
          <div className="flex mb-6 bg-slate-800 rounded-lg p-1">
            <button 
              className={`flex-1 py-2 rounded-md font-medium transition-colors ${isLogin ? 'bg-[#2dd4bf] text-slate-900' : 'text-slate-400'}`}
              onClick={() => setIsLogin(true)}
            >
              Connexion
            </button>
            <button 
              className={`flex-1 py-2 rounded-md font-medium transition-colors ${!isLogin ? 'bg-[#2dd4bf] text-slate-900' : 'text-slate-400'}`}
              onClick={() => setIsLogin(false)}
            >
              Inscription
            </button>
          </div>

          {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Numéro de téléphone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#2dd4bf] focus:ring-1 focus:ring-[#2dd4bf]"
                  placeholder="Votre numéro"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Mot de passe (4-6 chiffres)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={6}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#2dd4bf] focus:ring-1 focus:ring-[#2dd4bf]"
                  placeholder="••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#eab308] hover:bg-[#ca8a04] text-slate-900 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-6"
            >
              {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              {isLogin ? 'Se connecter' : 'S\'inscrire'}
            </button>
          </form>
        </div>
      </div>

      <button 
        onClick={() => setShowAdminModal(true)}
        className="mt-8 flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors"
      >
        <ShieldAlert className="w-4 h-4" />
        Accès Admin
      </button>

      {showAdminModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1e293b] rounded-xl p-6 w-full max-w-sm border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-amber-500" />
              Accès Administrateur
            </h2>
            <form onSubmit={handleAdminSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-1">Code d'accès</label>
                <input
                  type="password"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-amber-500"
                  placeholder="••••"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="flex-1 py-2 rounded-lg font-medium bg-slate-700 text-white hover:bg-slate-600 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg font-bold bg-amber-500 text-slate-900 hover:bg-amber-400 transition-colors"
                >
                  Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
