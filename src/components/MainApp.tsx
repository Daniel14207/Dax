import React, { useState, useEffect } from 'react';
import { User, Match, League } from '../types';
import { Menu, ShoppingCart, Coins, LogOut, ShieldAlert, Lock, Unlock, Star, Clock, Activity, Flame, Trophy, PlayCircle, Gem, ArrowRightLeft, MoreHorizontal, CheckCircle, Plane, Search, X, History, AlertTriangle, ShieldCheck, Settings } from 'lucide-react';
import { LEAGUES, TEAMS_BY_LEAGUE, getTeamLogo } from '../data';
import { useVirtualTime } from '../hooks/useVirtualTime';
import VirtualAnalysis from './VirtualAnalysis';
import AviatorSystem from './AviatorSystem';
import { MatchDetailsModal } from './MatchDetailsModal';
import { MultipleGenerator } from './MultipleGenerator';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc, increment } from 'firebase/firestore';
import { TutorialCard } from './TutorialCard';

interface MainAppProps {
  user: User;
  onLogout: () => void;
  onAdminAccess: () => void;
}

export default function MainApp({ user: initialUser, onLogout, onAdminAccess }: MainAppProps) {
  const [user, setUser] = useState<User>(initialUser);
  const [mainTab, setMainTab] = useState('virtuel');
  const [virtuelTab, setVirtuelTab] = useState('tips');
  const [aviatorTab, setAviatorTab] = useState('live');
  
  const [unlockedMatches, setUnlockedMatches] = useState<string[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  
  const virtualTime = useVirtualTime();

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

  const handleAnalyze = async (amount: number = 1) => {
    if (user.tokens < amount) return;
    
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        tokens: increment(-amount)
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

  const renderDateHeader = () => {
    const now = new Date();
    const monthYear = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const dayDate = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    return (
      <div className="bg-white p-3 text-center border-b border-slate-200 flex justify-between items-center">
        <div className="text-left">
          <h2 className="text-lg font-bold text-slate-900 capitalize">{monthYear}</h2>
          <p className="text-[#2dd4bf] font-medium text-xs capitalize">{dayDate}</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-[#eab308]">{time}</div>
          <div className="text-[10px] text-slate-500 uppercase">Heure locale</div>
        </div>
      </div>
    );
  };

  const renderTimeSlots = () => {
    if (!virtualTime) return null;
    
    return (
      <div className="bg-white border-b border-slate-200 overflow-x-auto hide-scrollbar">
        <div className="flex p-2 gap-2 min-w-max">
          {virtualTime.slots.map((slot, i) => (
            <div 
              key={i}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex flex-col items-center min-w-[60px] ${
                slot.isCurrent ? 'bg-[#eab308] text-slate-900 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 
                slot.isPast ? 'bg-slate-100 text-slate-500' : 'bg-slate-50 text-slate-600'
              }`}
            >
              <span>{slot.time}</span>
              {slot.isCurrent && <span className="text-[9px] uppercase font-bold mt-0.5 animate-pulse">Live</span>}
            </div>
          ))}
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
      <div className="space-y-4">
        {LEAGUES.map(league => (
          <div key={league.id} className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <div className="bg-slate-50 px-3 py-2 flex items-center gap-2 border-b border-slate-200">
              <img src={league.logo} alt={league.name} className="w-5 h-5 object-contain" />
              <h3 className="font-bold text-slate-900 text-sm">{league.name}</h3>
            </div>
            
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {virtualTime.slots.map((slot, slotIndex) => {
                const teamNames = TEAMS_BY_LEAGUE[league.id] || [];
                if (teamNames.length === 0) return null;

                // Use cycleIndex to ensure teams shuffle each cycle
                const cycleSeed = virtualTime.cycleIndex;
                const offset = slot.cycleOffset;
                const homeIdx = Math.abs(offset * 3 + cycleSeed + 10) % teamNames.length;
                const awayIdx = Math.abs(offset * 5 + cycleSeed + 1) % teamNames.length;
                const finalAwayIdx = homeIdx === awayIdx ? Math.abs(offset * 7 + cycleSeed + 2) % teamNames.length : awayIdx;
                
                const homeTeam = teamNames[homeIdx];
                const awayTeam = teamNames[finalAwayIdx];
                
                const isResult = slot.isPast;
                const isLive = slot.isCurrent;
                const isFuture = slot.isFuture;
                const odds = generateOdds(league.id, homeTeam, awayTeam);
                
                // Deterministic score based on slot and teams
                const scoreSeed = Math.abs(offset * homeTeam.length * awayTeam.length + cycleSeed);
                const homeScore = scoreSeed % 4;
                const awayScore = (scoreSeed / 2) % 4 | 0;
                
                const confidence = 65 + (scoreSeed % 30); // 65% to 94%
                const isHotMatch = scoreSeed % 5 === 0; // 20% chance
                
                return (
                  <div 
                    key={slotIndex} 
                    className={`p-2 hover:bg-slate-50 transition-colors cursor-pointer relative overflow-hidden ${isHotMatch ? 'border-l-2 border-[#eab308]' : ''}`}
                    onClick={() => setSelectedMatch({
                      league, homeTeam, awayTeam, homeScore, awayScore, isResult, isLive, isFuture, odds, slot, scoreSeed
                    })}
                  >
                    {isHotMatch && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-bl-lg shadow-sm flex items-center gap-1">
                        <Flame className="w-2.5 h-2.5" /> HOT
                      </div>
                    )}
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-1 text-[10px] font-medium bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        <Clock className="w-2.5 h-2.5 text-[#eab308]" />
                        <span>{slot.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isFuture && (
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            Confiance: <span className={confidence > 85 ? 'text-[#2dd4bf]' : 'text-[#eab308]'}>{confidence}%</span>
                          </span>
                        )}
                        {isResult && <span className="text-[9px] font-bold text-red-500 uppercase bg-red-50 px-1.5 py-0.5 rounded">Résultat</span>}
                        {isLive && <span className="text-[9px] font-bold text-[#2dd4bf] uppercase bg-[#2dd4bf]/10 px-1.5 py-0.5 rounded animate-pulse">Live</span>}
                        {isFuture && <span className="text-[9px] font-bold text-slate-500 uppercase bg-slate-100 px-1.5 py-0.5 rounded">Prédiction</span>}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex-1 flex flex-col items-center gap-1">
                        <img src={getTeamLogo(homeTeam, league.id)} alt={homeTeam} className="w-5 h-5 object-contain" />
                        <span className="font-bold text-slate-900 text-[11px] text-center leading-tight truncate w-full px-1">{homeTeam}</span>
                      </div>
                      
                      <div className="px-2 flex flex-col items-center justify-center">
                        {isResult ? (
                          <div className="text-sm font-black text-slate-900 tracking-widest bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {homeScore} - {awayScore}
                          </div>
                        ) : (
                          <div className="text-slate-400 font-bold text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-full">VS</div>
                        )}
                      </div>
                      
                      <div className="flex-1 flex flex-col items-center gap-1">
                        <img src={getTeamLogo(awayTeam, league.id)} alt={awayTeam} className="w-5 h-5 object-contain" />
                        <span className="font-bold text-slate-900 text-[11px] text-center leading-tight truncate w-full px-1">{awayTeam}</span>
                      </div>
                    </div>
                    
                    <div className="mt-1.5 grid grid-cols-3 gap-1">
                      <div className="bg-slate-50 rounded p-1 flex flex-col items-center border border-slate-200 hover:border-[#eab308] transition-colors">
                        <span className="text-[9px] text-slate-500 mb-0.5">1</span>
                        <span className="font-bold text-[#eab308] text-xs">{odds.home.toFixed(2)}</span>
                      </div>
                      <div className="bg-slate-50 rounded p-1 flex flex-col items-center border border-slate-200 hover:border-[#eab308] transition-colors">
                        <span className="text-[9px] text-slate-500 mb-0.5">X</span>
                        <span className="font-bold text-[#eab308] text-xs">{odds.draw.toFixed(2)}</span>
                      </div>
                      <div className="bg-slate-50 rounded p-1 flex flex-col items-center border border-slate-200 hover:border-[#eab308] transition-colors">
                        <span className="text-[9px] text-slate-500 mb-0.5">2</span>
                        <span className="font-bold text-[#eab308] text-xs">{odds.away.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderVirtuelTabs = () => {
    const tabs = [
      { id: 'tips', label: 'TIPS', icon: Flame },
      { id: 'multiple', label: 'MULTIPLE', icon: CheckCircle },
      { id: 'best_live', label: 'BEST LIVE', icon: PlayCircle },
      { id: 'vip', label: 'VIP', icon: Gem },
      { id: 'result', label: 'RESULT', icon: Trophy },
      { id: 'status', label: 'STATUS', icon: Activity },
    ];

    return (
      <div className="bg-white border-b border-slate-200 overflow-x-auto hide-scrollbar sticky top-[60px] z-10">
        <div className="flex p-2 gap-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setVirtuelTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-colors ${
                  virtuelTab === tab.id 
                    ? 'bg-[#eab308] text-slate-900' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAviatorTabs = () => {
    const tabs = [
      { id: 'live', label: 'LIVE', icon: PlayCircle },
      { id: 'analyse', label: 'ANALYSE', icon: Search },
      { id: 'history', label: 'HISTORY', icon: History },
      { id: 'high_risk', label: 'HIGH RISK', icon: AlertTriangle },
      { id: 'safe_zone', label: 'SAFE ZONE', icon: ShieldCheck },
      { id: 'vip', label: 'VIP', icon: Gem },
      { id: 'admin', label: 'ADMIN', icon: Settings },
    ];

    return (
      <div className="bg-white border-b border-slate-200 overflow-x-auto hide-scrollbar sticky top-[60px] z-10">
        <div className="flex p-2 gap-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setAviatorTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-colors ${
                  aviatorTab === tab.id 
                    ? 'bg-red-500 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-black flex items-center justify-between p-3 sticky top-0 z-20 shadow-md h-[60px]">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowMenu(true)} className="p-1.5 bg-[#eab308] text-slate-900 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white">Betting Tips</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
            <Coins className="w-3.5 h-3.5 text-[#eab308]" />
            <span className="font-bold text-white text-sm">{user.tokens}</span>
          </div>
          <button onClick={() => setShowCart(true)} className="relative p-1.5 hover:bg-slate-800 rounded-full transition-colors">
            <ShoppingCart className="w-5 h-5 text-[#eab308]" />
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
              +
            </span>
          </button>
        </div>
      </header>

      {/* Sub Tabs */}
      {mainTab === 'virtuel' && renderVirtuelTabs()}
      {mainTab === 'aviator' && renderAviatorTabs()}

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
              <button onClick={() => { setMainTab('virtuel'); setShowMenu(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${mainTab === 'virtuel' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50'}`}>
                <Flame className="w-5 h-5" />
                <span className="font-medium">Virtuel</span>
              </button>
              <button onClick={() => { setMainTab('aviator'); setShowMenu(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${mainTab === 'aviator' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50'}`}>
                <Plane className="w-5 h-5" />
                <span className="font-medium">Aviator</span>
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
      <main className="flex-1 overflow-y-auto pb-20">
        {mainTab === 'virtuel' && (
          <>
            {virtuelTab === 'tips' && (
              <>
                {renderDateHeader()}
                {renderTimeSlots()}
                <div className="p-3">
                  {renderLeagues()}
                </div>
              </>
            )}
            
            {virtuelTab === 'multiple' && (
              <MultipleGenerator userTokens={user.tokens} onAnalyze={handleAnalyze} />
            )}

            {virtuelTab === 'best_live' && (
              <div className="p-4 text-center">
                <Activity className="w-12 h-12 text-[#2dd4bf] mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">Best Live</h2>
                <p className="text-slate-600 mb-4">Analyse en temps réel des meilleurs matchs en cours pour des paris en direct.</p>
                <div className="text-left">
                  <TutorialCard 
                    title="Ahoana ny fampiasana Best Live"
                    content={
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Ity section ity dia natokana ho an'ny match efa mandeha (Live)</li>
                        <li>Mampiasa sary na manual analyse mitovy amin'ny mahazatra</li>
                      </ul>
                    }
                    explanation={
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Ny analyse eto dia mifantoka kokoa amin'ny zava-mitranga mandritra ny match</li>
                      </ul>
                    }
                  />
                </div>
                <div className="mt-6 text-left">
                  <VirtualAnalysis userTokens={user.tokens} onAnalyze={handleAnalyze} />
                </div>
              </div>
            )}

            {virtuelTab === 'vip' && (
              <div className="p-4 text-center">
                <Gem className="w-12 h-12 text-[#eab308] mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">Espace VIP</h2>
                <p className="text-slate-600 mb-6">Accédez aux pronostics exclusifs avec un taux de réussite supérieur à 90%.</p>
                
                {user.tokens < 10000 ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <ShieldCheck className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-red-700 mb-2">Accès Refusé</h3>
                    <p className="text-red-600 font-medium">Mila 10,000 tokens farafahakeliny ianao vao afaka miditra eto amin'ny VIP.</p>
                  </div>
                ) : (
                  <div className="text-left space-y-8">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Search className="w-5 h-5 text-[#eab308]" /> VIP ULTRA ANALYSE
                      </h3>
                      <VirtualAnalysis userTokens={user.tokens} onAnalyze={handleAnalyze} isVip={true} />
                    </div>
                    
                    <div className="border-t border-slate-200 pt-8">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-[#eab308]" /> VIP MULTIPLE
                      </h3>
                      <MultipleGenerator userTokens={user.tokens} onAnalyze={handleAnalyze} isVip={true} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {virtuelTab === 'result' && (
              <div className="p-4 text-center">
                <Trophy className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">Résultats</h2>
                <p className="text-slate-600">Consultez les résultats des matchs précédents et l'historique de nos pronostics.</p>
              </div>
            )}

            {virtuelTab === 'status' && (
              <div className="p-4 text-center">
                <Activity className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">Status du Système</h2>
                <p className="text-slate-600">L'algorithme est actuellement en ligne et fonctionne de manière optimale.</p>
              </div>
            )}
          </>
        )}

        {mainTab === 'aviator' && (
          <>
            {aviatorTab === 'live' && (
              <div className="p-4">
                <AviatorSystem userTokens={user.tokens} onAnalyze={handleAnalyze} />
              </div>
            )}
            {aviatorTab === 'analyse' && (
              <div className="p-4 text-center">
                <Search className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">Analyse Poussée</h2>
                <p className="text-slate-600">Outil d'analyse statistique pour détecter les tendances de l'algorithme Aviator.</p>
              </div>
            )}
            {aviatorTab === 'history' && (
              <div className="p-4 text-center">
                <History className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">Historique</h2>
                <p className="text-slate-600">Consultez l'historique complet des multiplicateurs précédents.</p>
              </div>
            )}
            {aviatorTab === 'high_risk' && (
              <div className="p-4 text-center">
                <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">High Risk (Cotes 10x+)</h2>
                <p className="text-slate-600">Prédictions des moments propices pour viser les gros multiplicateurs.</p>
              </div>
            )}
            {aviatorTab === 'safe_zone' && (
              <div className="p-4 text-center">
                <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">Safe Zone (1.5x - 2.0x)</h2>
                <p className="text-slate-600">Stratégie sécurisée pour des gains réguliers avec un risque minimal.</p>
              </div>
            )}
            {aviatorTab === 'vip' && (
              <div className="p-4 text-center">
                <Gem className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">Aviator VIP</h2>
                <p className="text-slate-600 mb-6">Signaux en temps réel via Telegram pour nos membres VIP.</p>
                <div className="text-left">
                  <AviatorSystem userTokens={user.tokens} onAnalyze={handleAnalyze} isVip={true} />
                </div>
              </div>
            )}
            {aviatorTab === 'admin' && (
              <div className="p-4 text-center">
                <Settings className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">Administration</h2>
                <p className="text-slate-600">Configuration de l'algorithme de prédiction (Accès restreint).</p>
                <button onClick={() => setShowAdminModal(true)} className="mt-4 bg-slate-700 text-white px-4 py-2 rounded-lg">Connexion Admin</button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-black border-t border-slate-800 fixed bottom-0 w-full flex justify-around px-2 py-2 pb-safe z-20">
        <button onClick={() => setMainTab('virtuel')} className={`flex flex-col items-center p-2 min-w-[60px] ${mainTab === 'virtuel' ? 'text-[#eab308]' : 'text-slate-500'}`}>
          <Flame className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Virtuel</span>
        </button>
        <button onClick={() => setMainTab('aviator')} className={`flex flex-col items-center p-2 min-w-[60px] ${mainTab === 'aviator' ? 'text-red-500' : 'text-slate-500'}`}>
          <Plane className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Aviator</span>
        </button>
        <button onClick={() => setMainTab('vip')} className={`flex flex-col items-center p-2 min-w-[60px] ${mainTab === 'vip' ? 'text-purple-500' : 'text-slate-500'}`}>
          <Gem className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">VIP</span>
        </button>
        <button onClick={() => setShowMenu(true)} className={`flex flex-col items-center p-2 min-w-[60px] text-slate-500`}>
          <Menu className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Menu</span>
        </button>
      </nav>

      {/* Match Details Modal */}
      {selectedMatch && (
        <MatchDetailsModal 
          match={selectedMatch} 
          onClose={() => setSelectedMatch(null)} 
        />
      )}
    </div>
  );
}
