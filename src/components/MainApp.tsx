import { useState, useEffect } from 'react';
import { User } from '../types';
import { Menu, ShoppingCart, Coins, LogOut, ShieldAlert, Gem, ArrowRightLeft, X } from 'lucide-react';
import { LEAGUES } from '../data';
import { useVirtualTime } from '../hooks/useVirtualTime';
import VirtualAnalysis from './VirtualAnalysis';
import AviatorSystem from './AviatorSystem';
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
  const [showMenu, setShowMenu] = useState(false);
  const [showCart, setShowCart] = useState(false);
  
  const virtualTime = useVirtualTime();

  // Smartlink - Ity ihany no doka tazonina satria ianao no mifehy azy
  const handleSmartlinkClick = () => {
    window.open("https://www.profitablecpmratenetwork.com/q7qzv81iw?key=d2c2ceb6fe39fa58c7330a1f68c9b656", "_blank");
  };

  useEffect(() => {
    const userRef = doc(db, 'users', initialUser.id);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const updatedUser = docSnap.data() as User;
        setUser(updatedUser);
      }
    });
    return () => unsubscribe();
  }, [initialUser.id]);

  const handleAnalyze = async () => {
    if (user.tokens <= 0) return;
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { tokens: increment(-1) });
    } catch (err) {
      console.error('Failed to deduct token', err);
    }
  };

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminCode, setAdminCode] = useState('');

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
      <div className="space-y-6 px-4 pb-24">
        {/* BOKOTRA VIP: Tsy manelingelina fa mampiditra vola */}
        <button 
          onClick={handleSmartlinkClick}
          className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-900 font-black py-4 rounded-2xl shadow-[0_4px_15px_rgba(234,179,8,0.3)] transform transition active:scale-95 flex items-center justify-center gap-3 border-2 border-amber-200/20"
        >
          <Gem className="w-6 h-6 animate-pulse" />
          <span className="text-lg uppercase tracking-wider">Accès Pronostics VIP 💎</span>
          <ArrowRightLeft className="w-5 h-5 opacity-70" />
        </button>

        {LEAGUES.map(league => (
          <div key={league.id} className="bg-[#1e293b] rounded-xl overflow-hidden border border-slate-800 shadow-lg">
            <div className="bg-slate-800/80 px-4 py-3 flex items-center gap-3 border-b border-slate-700/50">
              <img src={league.logo} alt={league.name} className="w-8 h-8 object-contain" />
              <h3 className="font-bold text-white text-lg">{league.name}</h3>
            </div>
            <div className="p-4 text-center text-slate-500 text-sm">
              Chargement des matchs...
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-[#1e293b] flex items-center justify-between p-4 sticky top-0 z-30 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button onClick={() => setShowMenu(true)} className="p-2 bg-[#eab308] text-slate-900 rounded-xl shadow-lg active:scale-90 transition-transform">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-white tracking-tight">Vital Pronos</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 shadow-inner">
            <Coins className="w-4 h-4 text-[#eab308]" />
            <span className="font-bold text-white">{user.tokens}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto hide-scrollbar">
        {activeTab === 'tips' && (
          <>
            <div className="bg-[#1e293b]/50 p-6 text-center border-b border-slate-800 backdrop-blur-md">
               <h2 className="text-2xl font-black text-white mb-1 uppercase">Live Tips</h2>
               <p className="text-[#2dd4bf] text-xs font-medium tracking-widest uppercase opacity-80">Mise à jour toutes les 5 min</p>
            </div>
            {renderLeagues()}
          </>
        )}
        {activeTab === 'virtual' && <VirtualAnalysis onAnalyze={handleAnalyze} tokens={user.tokens} />}
        {activeTab === 'aviator' && <AviatorSystem />}
      </main>

      {/* Side Menu Overlay */}
      {showMenu && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowMenu(false)}></div>
          <div className="relative w-72 bg-[#1e293b] h-full flex flex-col shadow-2xl border-r border-slate-700">
             <div className="p-6 border-b border-slate-800">
                <div className="flex justify-between items-center mb-6">
                   <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-slate-900 font-black text-xl">V</div>
                   <button onClick={() => setShowMenu(false)} className="p-2 text-slate-500"><X /></button>
                </div>
                <div className="font-bold text-white">{user.phone}</div>
                <div className="text-xs text-slate-500">ID: {user.id}</div>
             </div>
             <nav className="flex-1 p-4 space-y-2">
                <button onClick={() => {setActiveTab('tips'); setShowMenu(false)}} className={`w-full text-left p-3 rounded-xl ${activeTab==='tips'?'bg-amber-500/10 text-amber-500':'text-slate-400'}`}>Pronostics</button>
                <button onClick={() => {setActiveTab('virtual'); setShowMenu(false)}} className={`w-full text-left p-3 rounded-xl ${activeTab==='virtual'?'bg-amber-500/10 text-amber-500':'text-slate-400'}`}>Analyse Virtuel</button>
                <button onClick={() => {setActiveTab('aviator'); setShowMenu(false)}} className={`w-full text-left p-3 rounded-xl ${activeTab==='aviator'?'bg-amber-500/10 text-amber-500':'text-slate-400'}`}>Aviator</button>
             </nav>
             <div className="p-4 border-t border-slate-800">
                <button onClick={onLogout} className="w-full flex items-center gap-2 p-3 text-red-400 font-bold"><LogOut size={18}/> Déconnexion</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
