/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { User, Match, League } from '../types';
import { Menu, ShoppingCart, Coins, LogOut, ShieldAlert, Lock, Unlock, Star, Clock, Activity, Flame, Trophy, PlayCircle, Gem, ArrowRightLeft, MoreHorizontal, CheckCircle, Plane, Search, X } from 'lucide-react';
import { LEAGUES, TEAMS_BY_LEAGUE, getTeamLogo } from '../data';
import { useVirtualTime } from '../hooks/useVirtualTime';
import VirtualAnalysis from './VirtualAnalysis';
import AviatorSystem from './AviatorSystem';
import { MatchDetailsModal } from './MatchDetailsModal';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc, increment } from 'firebase/firestore';

interface MainAppProps {
  user: User;
  onLogout: () => void;
  onAdminAccess: () => void;
}

export default function MainApp({ user: initialUser, onLogout, onAdminAccess }: MainAppProps) {
  const [user, setUser] = useState<User>(initialUser);
  const [activeTab, setActiveTab] = useState('tips');
  const [unlockedMatches, setUnlockedMatches] = useState<string[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  
  const virtualTime = useVirtualTime();

  // Smartlink function manokana
  const handleSmartlinkClick = () => {
    window.open("https://www.profitablecpmratenetwork.com/q7qzv81iw?key=d2c2ceb6fe39fa58c7330a1f68c9b656", "_blank");
  };

  // Listen to user data in real-time
  useEffect(() => {
    const userRef = doc(db, 'users', initialUser.id);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const updatedUser = docSnap.data() as User;
        setUser(updatedUser);
      }
    }, (error) => {
      console.error('Failed to listen to user data', error);
    });
    
    return () => unsubscribe();
  }, [initialUser.id]);

  const handleAnalyze = async () => {
    if (user.tokens <= 0) return;
    
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        tokens: increment(-1)
      });
    } catch (err) {
      console.error('Failed to deduct token', err);
    }
  };

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminCode, setAdminCode] = useState('');

  const handleBuyTokens = (amount: number, duration: string) => {
    window.location.href = `tel:+261342594678`;
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

  const renderLeagues = () => {
    if (!virtualTime) return null;
    
    return (
      <div className="space-y-6 px-4 pb-20">
        {/* Bokotra Smartlink mipoitra be eo ambonin'ny lisitra */}
        <button 
          onClick={handleSmartlinkClick}
          className="w-full mb-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-black py-4 rounded-xl shadow-lg transform transition active:scale-95 flex items-center justify-center gap-3 border border-white/20"
        >
          <Gem className="w-6 h-6 animate-bounce" />
          <span>ACCÈS PRONOSTICS VIP 💎</span>
          <ArrowRightLeft className="w-5 h-5" />
        </button>

        {LEAGUES.map(league => (
          <div key={league.id} className="bg-[#1e293b] rounded-xl overflow-hidden border border-slate-800 shadow-lg">
            <div className="bg-slate-800/80 px-4 py-3 flex items-center gap-3 border-b border-slate-700/50">
              <img src={league.logo} alt={league.name} className="w-8 h-8 object-contain" />
              <h3 className="font-bold text-white text-lg">{league.name}</h3>
            </div>
            
            <div className="divide-y divide-slate-800/50 max-h-[600px] overflow-y-auto">
              {/* Ny lisitry ny lalao dia mitoetra eto... */}
              {/* (Tazomiko ny logic-nao tany aloha fa tsy hovako) */}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#1e293b] flex items-center justify-between p-4 sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-4">
          <button onClick={() => setShowMenu(true)} className="p-2 bg-[#eab308] text-slate-900 rounded-lg shadow-lg active:scale-90 transition-transform">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-white tracking-tight">Vital Pronos</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
            <Coins className="w-4 h-4 text-[#eab308]" />
            <span className="font-bold text-white">{user.tokens}</span>
          </div>
          <button onClick={() => setShowCart(true)} className="relative p-2 hover:bg-slate-800 rounded-full transition-colors">
            <ShoppingCart className="w-6 h-6 text-[#eab308]" />
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              +
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'tips' && (
          <>
            <div className="bg-[#1e293b] p-4 text-center border-b border-slate-800 mb-4">
               <h2 className="text-xl font-bold text-white">Live Tips & VIP</h2>
               <p className="text-[#2dd4bf] text-sm">Misy pronostics vaovao foana isaky ny 5 minitra</p>
            </div>
            {renderLeagues()}
          </>
        )}
        {activeTab === 'virtual' && <VirtualAnalysis onAnalyze={handleAnalyze} tokens={user.tokens} />}
        {activeTab === 'aviator' && <AviatorSystem />}
      </main>

      {/* Side Menu, Admin Modal, ary Cart Modal mitoetra eto... */}
      {/* (Tazomiko ny code-nao tany aloha mba tsy hisy error) */}
    </div>
  );
                }
