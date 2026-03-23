import React, { useState, useEffect } from 'react';
import { User, Match, League } from '../types';
import { Menu, ShoppingCart, Coins, LogOut, ShieldAlert, Lock, Unlock, Star, Clock, Activity, Flame, Trophy, PlayCircle, Gem, ArrowRightLeft, MoreHorizontal, CheckCircle, Plane, Search, X } from 'lucide-react';
import { LEAGUES, TEAMS_BY_LEAGUE, getTeamLogo } from '../data';
import { useVirtualTime } from '../hooks/useVirtualTime';
import VirtualAnalysis from './VirtualAnalysis';
import AviatorSystem from './AviatorSystem';

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
  
  const virtualTime = useVirtualTime();

  // Refresh user data periodically to get latest tokens
  useEffect(() => {
    const refreshUser = async () => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: user.phone, password: user.password })
        });
        if (res.ok) {
          const updatedUser = await res.json();
          setUser(updatedUser);
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }
      } catch (err) {
        console.error('Failed to refresh user data', err);
      }
    };
    
    refreshUser();
    const interval = setInterval(refreshUser, 5000); // 5 seconds is better than 2 for API
    return () => clearInterval(interval);
  }, [user.id, user.phone, user.password]);

  const handleAnalyze = async () => {
    try {
      const res = await fetch(`/api/users/${user.id}/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: -1 })
      });
      if (res.ok) {
        const updatedUser = { ...user, tokens: user.tokens - 1 };
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
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

  const renderDateHeader = () => {
    if (!virtualTime) return null;
    const now = virtualTime.currentTime;
    const monthYear = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const dayDate = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    
    return (
      <div className="bg-[#1e293b] p-4 text-center border-b border-slate-800">
        <h2 className="text-xl font-bold text-white capitalize">{monthYear}</h2>
        <p className="text-[#2dd4bf] font-medium capitalize">{dayDate}</p>
      </div>
    );
  };

  const renderTimeSlots = () => {
    if (!virtualTime) return null;
    
    return (
      <div className="bg-[#1e293b] border-b border-slate-800 overflow-x-auto hide-scrollbar">
        <div className="flex p-2 gap-2 min-w-max">
          {virtualTime.slots.map((slot, i) => (
            <div 
              key={i}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex flex-col items-center min-w-[80px] ${
                slot.isCurrent ? 'bg-[#eab308] text-slate-900 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 
                slot.isPast ? 'bg-slate-800 text-slate-500' : 'bg-slate-700 text-slate-300'
              }`}
            >
              <span>{slot.time}</span>
              {slot.isCurrent && <span className="text-[10px] uppercase font-bold mt-1 animate-pulse">Live</span>}
            </div>
          ))}
          {virtualTime.isBreak && (
            <div className="px-4 py-2 rounded-lg text-sm font-medium flex flex-col items-center min-w-[80px] bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              <span>STOP</span>
              <span className="text-[10px] uppercase font-bold mt-1">NEW (+5m)</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const generateOdds = (leagueId: string, homeTeam: string, awayTeam: string) => {
    const isAfricaCup = leagueId === 'afr';
    const specialTeams = ['Sudan', 'Benin', 'Equatorial Guinea'];
    
    let homeOdd = 0;
    let awayOdd = 0;
    let drawOdd = Number((Math.random() * 2 + 2.5).toFixed(2)); // 2.50 - 4.50

    // Special Africa Cup logic
    if (isAfricaCup && (specialTeams.includes(homeTeam) || specialTeams.includes(awayTeam))) {
      const isRare = Math.random() > 0.8; // 20% chance for rare odds
      if (isRare) {
        const veryRare = Math.random() > 0.9; // 10% of rare are very rare (98, 100)
        const highOdd = veryRare ? (Math.random() > 0.5 ? 98 : 100) : Number((Math.random() * 15 + 10).toFixed(2)); // 10.00 - 25.00
        
        if (specialTeams.includes(homeTeam)) {
          homeOdd = highOdd;
          awayOdd = Number((Math.random() * 1.3 + 1.2).toFixed(2)); // 1.20 - 2.50
        } else {
          awayOdd = highOdd;
          homeOdd = Number((Math.random() * 1.3 + 1.2).toFixed(2));
        }
        return { home: homeOdd, draw: drawOdd, away: awayOdd };
      }
    }

    // Normal realistic odds
    const type = Math.random();
    if (type > 0.6) {
      // Home favorite
      homeOdd = Number((Math.random() * 1.3 + 1.2).toFixed(2)); // 1.20 - 2.50
      awayOdd = Number((Math.random() * 15 + 5).toFixed(2)); // 5.00 - 20.00
    } else if (type > 0.2) {
      // Away favorite
      awayOdd = Number((Math.random() * 1.3 + 1.2).toFixed(2));
      homeOdd = Number((Math.random() * 15 + 5).toFixed(2));
    } else {
      // Balanced
      homeOdd = Number((Math.random() * 2.5 + 2.5).toFixed(2)); // 2.50 - 5.00
      awayOdd = Number((Math.random() * 2.5 + 2.5).toFixed(2));
    }

    return { home: homeOdd, draw: drawOdd, away: awayOdd };
  };

  const renderLeagues = () => {
    if (!virtualTime) return null;
    
    return (
      <div className="space-y-6">
        {LEAGUES.map(league => (
          <div key={league.id} className="bg-[#1e293b] rounded-xl overflow-hidden border border-slate-800 shadow-lg">
            <div className="bg-slate-800/80 px-4 py-3 flex items-center gap-3 border-b border-slate-700/50">
              <img src={league.logo} alt={league.name} className="w-8 h-8 object-contain" />
              <h3 className="font-bold text-white text-lg">{league.name}</h3>
            </div>
            
            <div className="divide-y divide-slate-800/50">
              {[-2, -1, 0].map(offset => {
                const slotIndex = virtualTime.currentSlotIndex + offset;
                if (slotIndex < 0 || slotIndex >= 20) return null;
                
                const slot = virtualTime.slots[slotIndex];
                if (!slot) return null;
                
                const teamNames = TEAMS_BY_LEAGUE[league.id] || [];
                if (teamNames.length === 0) return null;

                const homeTeam = teamNames[(slotIndex * 3 + offset + 10) % teamNames.length];
                const awayTeam = teamNames[(slotIndex * 5 + offset + 1) % teamNames.length];
                const finalAwayTeam = homeTeam === awayTeam ? teamNames[(slotIndex * 7 + offset + 2) % teamNames.length] : awayTeam;
                
                const isResult = offset < 0;
                const isUpcoming = offset === 0;
                const odds = generateOdds(league.id, homeTeam, finalAwayTeam);
                
                // Deterministic score based on slot and teams
                const scoreSeed = slotIndex * homeTeam.length * finalAwayTeam.length;
                const homeScore = scoreSeed % 4;
                const awayScore = (scoreSeed / 2) % 4 | 0;
                
                return (
                  <div key={offset} className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2 text-xs font-medium bg-slate-800 px-2 py-1 rounded text-slate-300">
                        <Clock className="w-3 h-3 text-[#eab308]" />
                        <span>{slot.time}</span>
                      </div>
                      {isResult && <span className="text-xs font-bold text-red-400 uppercase bg-red-500/10 px-2 py-1 rounded">Résultat</span>}
                      {isUpcoming && <span className="text-xs font-bold text-[#2dd4bf] uppercase bg-[#2dd4bf]/10 px-2 py-1 rounded animate-pulse">Live / Upcoming</span>}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex-1 flex flex-col items-center gap-2">
                        <img src={getTeamLogo(homeTeam, league.id)} alt={homeTeam} className="w-10 h-10 object-contain" />
                        <span className="font-bold text-white text-sm text-center">{homeTeam}</span>
                      </div>
                      
                      <div className="px-4 flex flex-col items-center justify-center">
                        {isResult ? (
                          <div className="text-2xl font-black text-white tracking-widest bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                            {homeScore} - {awayScore}
                          </div>
                        ) : (
                          <div className="text-slate-500 font-bold text-sm bg-slate-800 px-3 py-1 rounded-full">VS</div>
                        )}
                      </div>
                      
                      <div className="flex-1 flex flex-col items-center gap-2">
                        <img src={getTeamLogo(finalAwayTeam, league.id)} alt={finalAwayTeam} className="w-10 h-10 object-contain" />
                        <span className="font-bold text-white text-sm text-center">{finalAwayTeam}</span>
                      </div>
                    </div>
                    
                    {isUpcoming && (
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="bg-slate-800/50 rounded-lg p-2 flex flex-col items-center border border-slate-700/50 hover:border-[#eab308] transition-colors cursor-pointer">
                          <span className="text-xs text-slate-400 mb-1">1</span>
                          <span className="font-bold text-[#eab308]">{odds.home.toFixed(2)}</span>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-2 flex flex-col items-center border border-slate-700/50 hover:border-[#eab308] transition-colors cursor-pointer">
                          <span className="text-xs text-slate-400 mb-1">X</span>
                          <span className="font-bold text-[#eab308]">{odds.draw.toFixed(2)}</span>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-2 flex flex-col items-center border border-slate-700/50 hover:border-[#eab308] transition-colors cursor-pointer">
                          <span className="text-xs text-slate-400 mb-1">2</span>
                          <span className="font-bold text-[#eab308]">{odds.away.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
          <button onClick={() => setShowMenu(true)} className="p-2 bg-[#eab308] text-slate-900 rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-white">Betting Tips</h1>
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

      {/* Side Menu Overlay */}
      {showMenu && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMenu(false)}></div>
          <div className="relative w-72 bg-[#1e293b] h-full flex flex-col shadow-2xl transform transition-transform">
            <div className="p-6 bg-slate-800 border-b border-slate-700 relative">
              <button onClick={() => setShowMenu(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 bg-[#2dd4bf] rounded-full flex items-center justify-center mb-4 text-2xl font-bold text-slate-900 shadow-lg">
                {user.phone.substring(0, 2)}
              </div>
              <div className="font-bold text-white text-lg">{user.phone}</div>
              <div className="text-sm text-slate-400 mt-1 font-mono">ID: {user.id}</div>
            </div>
            <div className="flex-1 p-4 space-y-2 overflow-y-auto">
              <button onClick={() => { setActiveTab('tips'); setShowMenu(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'tips' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50'}`}>
                <Flame className="w-5 h-5" />
                <span className="font-medium">Live Tips</span>
              </button>
              <button onClick={() => { setActiveTab('virtual'); setShowMenu(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'virtual' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50'}`}>
                <Activity className="w-5 h-5" />
                <span className="font-medium">Analyse Virtuel</span>
              </button>
              <button onClick={() => { setActiveTab('aviator'); setShowMenu(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'aviator' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50'}`}>
                <Plane className="w-5 h-5" />
                <span className="font-medium">Aviator System</span>
              </button>
              <div className="my-4 border-t border-slate-700"></div>
              <button onClick={() => setShowAdminModal(true)} className="w-full flex items-center gap-3 px-4 py-3 text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors">
                <ShieldAlert className="w-5 h-5" />
                <span className="font-medium">Admin Panel</span>
              </button>
            </div>
            <div className="p-4 border-t border-slate-700">
              <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors font-medium">
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Modal */}
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

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCart(false)}></div>
          <div className="relative bg-[#1e293b] w-full max-w-md rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
            <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-[#eab308]" />
                Acheter des Tokens
              </h2>
              <button onClick={() => setShowCart(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center justify-between hover:border-[#eab308] transition-colors cursor-pointer" onClick={() => handleBuyTokens(5000, '3.5 jours')}>
                <div>
                  <div className="font-bold text-white text-lg">5 000 Ar</div>
                  <div className="text-sm text-slate-400">Validité: 3.5 jours</div>
                </div>
                <button className="bg-[#eab308] text-slate-900 font-bold px-4 py-2 rounded-lg">Acheter</button>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center justify-between hover:border-[#eab308] transition-colors cursor-pointer" onClick={() => handleBuyTokens(10000, '7 jours')}>
                <div>
                  <div className="font-bold text-white text-lg">10 000 Ar</div>
                  <div className="text-sm text-slate-400">Validité: 7 jours</div>
                </div>
                <button className="bg-[#eab308] text-slate-900 font-bold px-4 py-2 rounded-lg">Acheter</button>
              </div>
              <div className="bg-gradient-to-r from-amber-500/20 to-amber-500/5 border border-amber-500/50 rounded-xl p-4 flex items-center justify-between hover:border-amber-400 transition-colors cursor-pointer relative overflow-hidden" onClick={() => handleBuyTokens(40000, '30 jours')}>
                <div className="absolute top-0 right-0 bg-amber-500 text-slate-900 text-[10px] font-bold px-2 py-1 rounded-bl-lg">POPULAIRE</div>
                <div>
                  <div className="font-bold text-amber-400 text-lg">40 000 Ar</div>
                  <div className="text-sm text-slate-300">Validité: 30 jours (VIP)</div>
                </div>
                <button className="bg-amber-500 text-slate-900 font-bold px-4 py-2 rounded-lg shadow-lg">Acheter</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24">
        {activeTab === 'tips' && (
          <>
            {renderDateHeader()}
            {renderTimeSlots()}
            <div className="p-4">
              {renderLeagues()}
            </div>
          </>
        )}
        
        {activeTab === 'virtual' && (
          <div className="p-4">
            <VirtualAnalysis userTokens={user.tokens} onAnalyze={handleAnalyze} />
          </div>
        )}

        {activeTab === 'aviator' && (
          <div className="p-4">
            <AviatorSystem userTokens={user.tokens} onAnalyze={handleAnalyze} />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-[#1e293b] border-t border-slate-800 fixed bottom-0 w-full flex justify-between px-2 py-2 pb-safe z-20 overflow-x-auto hide-scrollbar">
        <button onClick={() => setActiveTab('tips')} className={`flex flex-col items-center p-2 min-w-[60px] ${activeTab === 'tips' ? 'text-[#eab308]' : 'text-slate-500'}`}>
          <Flame className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold uppercase">Tips</span>
        </button>
        <button onClick={() => setActiveTab('virtual')} className={`flex flex-col items-center p-2 min-w-[60px] ${activeTab === 'virtual' ? 'text-[#eab308]' : 'text-slate-500'}`}>
          <Activity className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold uppercase">Virtuel</span>
        </button>
        <button onClick={() => setActiveTab('aviator')} className={`flex flex-col items-center p-2 min-w-[60px] ${activeTab === 'aviator' ? 'text-[#eab308]' : 'text-slate-500'}`}>
          <Plane className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold uppercase">Aviator</span>
        </button>
        <button onClick={() => setActiveTab('vip')} className={`flex flex-col items-center p-2 min-w-[60px] ${activeTab === 'vip' ? 'text-[#eab308]' : 'text-slate-500'}`}>
          <Gem className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold uppercase">VIP</span>
        </button>
        <button onClick={() => setActiveTab('more')} className={`flex flex-col items-center p-2 min-w-[60px] ${activeTab === 'more' ? 'text-[#eab308]' : 'text-slate-500'}`}>
          <MoreHorizontal className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold uppercase">More</span>
        </button>
      </nav>
    </div>
  );
}

