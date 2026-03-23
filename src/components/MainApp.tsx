import React, { useState, useEffect } from 'react';
import { User, Match } from '../types';
import { Menu, ShoppingCart, Coins, LogOut, ShieldAlert, Lock, Unlock, Star, Clock, Activity, Flame, Trophy, PlayCircle, Gem, ArrowRightLeft, MoreHorizontal, CheckCircle } from 'lucide-react';

interface MainAppProps {
  user: User;
  onLogout: () => void;
  onAdminAccess: () => void;
}

const MOCK_MATCHES: Match[] = [
  {
    id: '1',
    league: 'Champions League',
    homeTeam: 'Real Madrid',
    awayTeam: 'Man City',
    time: '21:00',
    status: 'NS',
    odds: { home: 2.80, draw: 3.50, away: 2.40 },
    prediction: 'Both Teams To Score',
    isVip: true
  },
  {
    id: '2',
    league: 'English Premier League',
    homeTeam: 'Arsenal',
    awayTeam: 'Aston Villa',
    time: '18:30',
    status: 'NS',
    odds: { home: 1.55, draw: 4.20, away: 6.00 },
    prediction: 'Home Win (1)',
    isVip: false
  },
  {
    id: '3',
    league: 'Serie A',
    homeTeam: 'Juventus',
    awayTeam: 'Inter Milan',
    time: '20:45',
    status: 'NS',
    odds: { home: 2.60, draw: 3.10, away: 2.80 },
    prediction: 'Under 2.5 Goals',
    isVip: true
  },
  {
    id: '4',
    league: 'La Liga',
    homeTeam: 'Barcelona',
    awayTeam: 'Sevilla',
    time: '21:00',
    status: 'NS',
    odds: { home: 1.35, draw: 5.00, away: 8.50 },
    prediction: 'Over 2.5 Goals',
    isVip: false
  },
  {
    id: '5',
    league: 'Ligue 1',
    homeTeam: 'PSG',
    awayTeam: 'Marseille',
    time: '20:45',
    status: 'NS',
    odds: { home: 1.45, draw: 4.80, away: 6.50 },
    prediction: 'Home Win & Over 1.5',
    isVip: true
  }
];

export default function MainApp({ user: initialUser, onLogout, onAdminAccess }: MainAppProps) {
  const [user, setUser] = useState<User>(initialUser);
  const [activeTab, setActiveTab] = useState('tips');
  const [unlockedMatches, setUnlockedMatches] = useState<string[]>([]);
  const [showMenu, setShowMenu] = useState(false);

  // Refresh user data periodically to get latest tokens
  useEffect(() => {
    const refreshUser = () => {
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUser = users.find(u => u.id === user.id);
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    };
    
    refreshUser();
    const interval = setInterval(refreshUser, 2000);
    return () => clearInterval(interval);
  }, [user.id]);

  const handleAnalyze = (matchId: string) => {
    if (unlockedMatches.includes(matchId)) return;

    if (user.tokens <= 0) {
      alert('❌ Analyse bloquée : Vous n\'avez pas assez de tokens. Veuillez contacter l\'administrateur.');
      return;
    }

    const confirm = window.confirm('Cette analyse coûte 1 token. Voulez-vous continuer ?');
    if (!confirm) return;

    // Deduct token
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(u => {
      if (u.id === user.id) {
        return { ...u, tokens: u.tokens - 1 };
      }
      return u;
    });
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    const updatedUser = updatedUsers.find(u => u.id === user.id)!;
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    setUnlockedMatches([...unlockedMatches, matchId]);
  };

  const handleAdminClick = () => {
    const code = prompt('Code Admin:');
    if (code === '@9729') {
      onAdminAccess();
    } else if (code !== null) {
      alert('Code incorrect');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#1e293b] flex items-center justify-between p-4 sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-4">
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 bg-[#eab308] text-slate-900 rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-white">Betting Tips</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
            <Coins className="w-4 h-4 text-[#eab308]" />
            <span className="font-bold text-white">{user.tokens}</span>
          </div>
          <div className="relative">
            <ShoppingCart className="w-6 h-6 text-[#eab308]" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              1
            </span>
          </div>
        </div>
      </header>

      {/* Side Menu Overlay */}
      {showMenu && (
        <div className="fixed inset-0 z-30 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMenu(false)}></div>
          <div className="relative w-64 bg-[#1e293b] h-full flex flex-col shadow-2xl">
            <div className="p-6 bg-slate-800 border-b border-slate-700">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4 text-2xl font-bold text-white">
                {user.phone.substring(0, 2)}
              </div>
              <div className="font-bold text-white">{user.phone}</div>
              <div className="text-sm text-slate-400 mt-1">ID: {user.id}</div>
            </div>
            <div className="flex-1 p-4 space-y-2">
              <button onClick={handleAdminClick} className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
                <ShieldAlert className="w-5 h-5" />
                <span>Admin Panel</span>
              </button>
            </div>
            <div className="p-4 border-t border-slate-700">
              <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dates Scroll */}
      <div className="bg-[#1e293b] border-b border-slate-800 overflow-x-auto hide-scrollbar">
        <div className="flex p-2 gap-2 min-w-max">
          {['Mar 20', 'Mar 21', 'Mar 22', 'Mar 23', 'Mar 24', 'Mar 25'].map((date, i) => (
            <button 
              key={i}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex flex-col items-center min-w-[80px] ${
                i === 1 ? 'bg-[#eab308] text-slate-900' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <span className="text-xs">{['Ven', 'Sam', 'Dim', 'Lun', 'Mar', 'Mer'][i]}</span>
              <span>{date.split(' ')[1]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex p-4 gap-2 overflow-x-auto hide-scrollbar">
        <button className="px-6 py-2 bg-[#eab308] text-slate-900 font-bold rounded-full whitespace-nowrap">All</button>
        <button className="px-6 py-2 bg-slate-800 text-slate-300 font-medium rounded-full whitespace-nowrap border border-slate-700">Popular</button>
        <button className="px-6 py-2 bg-slate-800 text-slate-300 font-medium rounded-full whitespace-nowrap border border-slate-700">Favorites</button>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-24 overflow-y-auto space-y-6">
        {/* VIP Banner */}
        <div className="bg-gradient-to-r from-amber-500/20 to-amber-500/5 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between">
          <div>
            <h3 className="text-amber-400 font-bold flex items-center gap-2">
              <Star className="w-4 h-4 fill-amber-400" />
              Pronostics VIP
            </h3>
            <p className="text-sm text-slate-400 mt-1">Débloquez les meilleures analyses</p>
          </div>
          <div className="bg-amber-500 text-slate-900 font-bold px-3 py-1 rounded-lg text-sm">
            {user.tokens} Tokens
          </div>
        </div>

        {/* Matches List */}
        <div className="space-y-4">
          {MOCK_MATCHES.map((match) => {
            const isUnlocked = unlockedMatches.includes(match.id);
            
            return (
              <div key={match.id} className="bg-[#1e293b] rounded-xl overflow-hidden border border-slate-800 shadow-lg">
                {/* League Header */}
                <div className="bg-slate-800/80 px-4 py-2 flex justify-between items-center border-b border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-slate-600"></div>
                    <span className="text-sm font-medium text-slate-300">{match.league}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-400">{match.time}</span>
                  </div>
                </div>

                {/* Teams */}
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex-1 flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-700"></div>
                      <span className="font-bold text-white">{match.homeTeam}</span>
                    </div>
                    <div className="px-3 text-slate-500 font-bold text-sm">VS</div>
                    <div className="flex-1 flex items-center gap-3 justify-end">
                      <span className="font-bold text-white">{match.awayTeam}</span>
                      <div className="w-6 h-6 rounded-full bg-slate-700"></div>
                    </div>
                  </div>

                  {/* Odds */}
                  <div className="flex gap-2 mb-4">
                    <div className="flex-1 bg-slate-800/50 rounded-lg p-2 flex flex-col items-center border border-slate-700/50">
                      <span className="text-xs text-slate-500 mb-1">1</span>
                      <span className="font-bold text-white">{match.odds.home.toFixed(2)}</span>
                    </div>
                    <div className="flex-1 bg-slate-800/50 rounded-lg p-2 flex flex-col items-center border border-slate-700/50">
                      <span className="text-xs text-slate-500 mb-1">X</span>
                      <span className="font-bold text-white">{match.odds.draw.toFixed(2)}</span>
                    </div>
                    <div className="flex-1 bg-slate-800/50 rounded-lg p-2 flex flex-col items-center border border-slate-700/50">
                      <span className="text-xs text-slate-500 mb-1">2</span>
                      <span className="font-bold text-white">{match.odds.away.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Prediction / Action */}
                  {isUnlocked ? (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="font-bold text-green-400">Pronostic:</span>
                      </div>
                      <span className="font-bold text-white">{match.prediction}</span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleAnalyze(match.id)}
                      className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg p-3 flex items-center justify-center gap-2 transition-colors group"
                    >
                      {match.isVip ? (
                        <Lock className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Activity className="w-4 h-4 text-[#2dd4bf]" />
                      )}
                      <span className={`font-bold ${match.isVip ? 'text-amber-400' : 'text-[#2dd4bf]'}`}>
                        Voir l'analyse
                      </span>
                      <div className="flex items-center gap-1 ml-2 bg-slate-900 px-2 py-0.5 rounded text-xs">
                        <Coins className="w-3 h-3 text-[#eab308]" />
                        <span className="text-slate-300">1</span>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-[#1e293b] border-t border-slate-800 fixed bottom-0 w-full flex justify-between px-2 py-2 pb-safe z-20 overflow-x-auto hide-scrollbar">
        <button onClick={() => setActiveTab('tips')} className={`flex flex-col items-center p-2 min-w-[60px] ${activeTab === 'tips' ? 'text-[#eab308]' : 'text-slate-500'}`}>
          <Flame className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold uppercase">Tips</span>
        </button>
        <button onClick={() => setActiveTab('free')} className={`flex flex-col items-center p-2 min-w-[60px] ${activeTab === 'free' ? 'text-[#eab308]' : 'text-slate-500'}`}>
          <Trophy className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold uppercase">Free</span>
        </button>
        <button onClick={() => setActiveTab('best')} className={`flex flex-col items-center p-2 min-w-[60px] ${activeTab === 'best' ? 'text-[#eab308]' : 'text-slate-500'}`}>
          <Star className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold uppercase">Best</span>
        </button>
        <button onClick={() => setActiveTab('live')} className={`flex flex-col items-center p-2 min-w-[60px] ${activeTab === 'live' ? 'text-[#eab308]' : 'text-slate-500'}`}>
          <PlayCircle className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold uppercase">Live</span>
        </button>
        <button onClick={() => setActiveTab('vip')} className={`flex flex-col items-center p-2 min-w-[60px] ${activeTab === 'vip' ? 'text-[#eab308]' : 'text-slate-500'}`}>
          <Gem className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold uppercase">VIP</span>
        </button>
        <button onClick={() => setActiveTab('ht-ft')} className={`flex flex-col items-center p-2 min-w-[60px] ${activeTab === 'ht-ft' ? 'text-[#eab308]' : 'text-slate-500'}`}>
          <ArrowRightLeft className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold uppercase">HT-FT</span>
        </button>
        <button onClick={() => setActiveTab('more')} className={`flex flex-col items-center p-2 min-w-[60px] ${activeTab === 'more' ? 'text-[#eab308]' : 'text-slate-500'}`}>
          <MoreHorizontal className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold uppercase">More</span>
        </button>
      </nav>
    </div>
  );
}
