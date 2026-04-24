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
  
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'purple';
  });

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    document.documentElement.className = theme === 'purple' ? '' : `theme-${theme}`;
  }, [theme]);

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
    const now = virtualTime ? virtualTime.liveTime : new Date();
    const monthYear = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const dayDate = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    return (
      <div className="bg-[var(--card-bg)] p-3 text-center border-b border-[var(--border-color)] flex justify-between items-center">
        <div className="text-left">
          <h2 className="text-lg font-bold text-[var(--text-primary)] capitalize">{monthYear}</h2>
          <p className="text-[var(--btn-primary)] font-medium text-xs capitalize">{dayDate}</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-[var(--btn-primary)]">{time}</div>
          <div className="text-[10px] text-[var(--text-secondary)] uppercase">Heure virtuelle</div>
        </div>
      </div>
    );
  };

  const renderTimeSlots = () => {
    if (!virtualTime) return null;
    
    return (
      <div className="bg-[var(--card-bg)] border-b border-[var(--border-color)] overflow-x-auto hide-scrollbar">
        <div className="flex p-2 gap-2 min-w-max">
          {virtualTime.slots.map((slot, i) => (
            <div 
              key={i}
              className={`px-3 py-1.5 rounded-xl active:scale-95 transition-transform text-xs font-medium flex flex-col items-center min-w-[60px] ${
                slot.isCurrent ? 'bg-[var(--btn-primary)] text-[var(--text-primary)] shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 
                slot.isPast ? 'bg-[var(--tab-bg)] text-[var(--text-secondary)]' : 'bg-[var(--tab-bg)] text-[var(--text-secondary)]'
              }`}
            >
              <span>{slot.time}</span>
              {slot.isCurrent && <span className="text-[9px] uppercase font-bold mt-0.5 animate-pulse">Live {slot.matchMinute !== undefined ? `${slot.matchMinute}'` : ''}</span>}
              {slot.isFuture && slot.remainingSeconds !== undefined && (
                <span className="text-[9px] font-black tracking-widest mt-0.5">
                  {Math.floor(slot.remainingSeconds / 60).toString().padStart(2, '0')}:{(slot.remainingSeconds % 60).toString().padStart(2, '0')}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const generateOdds = (leagueId: string, homeTeam: string, awayTeam: string, slotCycle: number) => {
    // Simple seeded random function
    const seed = Math.abs(slotCycle * homeTeam.length + awayTeam.length * 13 + leagueId.charCodeAt(0));
    const random = (x: number) => {
      const x2 = Math.sin(seed + x) * 10000;
      return x2 - Math.floor(x2);
    };

    const isAfricaCup = leagueId === 'afr';
    const specialTeams = ['Sudan', 'Benin', 'Equatorial Guinea'];
    
    let homeOdd = 0;
    let awayOdd = 0;
    let drawOdd = Number((random(1) * 2 + 2.5).toFixed(2)); // 2.50 - 4.50

    // Special Africa Cup logic
    if (isAfricaCup && (specialTeams.includes(homeTeam) || specialTeams.includes(awayTeam))) {
      const isRare = random(2) > 0.8; // 20% chance for rare odds
      if (isRare) {
        const veryRare = random(3) > 0.9; // 10% of rare are very rare (98, 100)
        const highOdd = veryRare ? (random(4) > 0.5 ? 98 : 100) : Number((random(5) * 15 + 10).toFixed(2)); // 10.00 - 25.00
        
        if (specialTeams.includes(homeTeam)) {
          homeOdd = highOdd;
          awayOdd = Number((random(6) * 1.3 + 1.2).toFixed(2)); // 1.20 - 2.50
        } else {
          awayOdd = highOdd;
          homeOdd = Number((random(7) * 1.3 + 1.2).toFixed(2));
        }
        return { home: homeOdd, draw: drawOdd, away: awayOdd };
      }
    }

    // Normal realistic odds
    const type = random(8);
    if (type > 0.6) {
      // Home favorite
      homeOdd = Number((random(9) * 1.3 + 1.2).toFixed(2)); // 1.20 - 2.50
      awayOdd = Number((random(10) * 15 + 5).toFixed(2)); // 5.00 - 20.00
    } else if (type > 0.2) {
      // Away favorite
      awayOdd = Number((random(11) * 1.3 + 1.2).toFixed(2));
      homeOdd = Number((random(12) * 15 + 5).toFixed(2));
    } else {
      // Balanced
      homeOdd = Number((random(13) * 2.5 + 2.5).toFixed(2)); // 2.50 - 5.00
      awayOdd = Number((random(14) * 2.5 + 2.5).toFixed(2));
    }

    return { home: homeOdd, draw: drawOdd, away: awayOdd };
  };

  const renderLeagues = () => {
    if (!virtualTime) return null;
    
    return (
      <div className="space-y-4">
        {LEAGUES.map(league => (
          <div key={league.id} className="bg-[var(--card-bg)] rounded-2xl theme-shadow overflow-hidden border border-[var(--border-color)] shadow-sm">
            <div className="bg-[var(--tab-bg)] px-3 py-2 flex items-center gap-2 border-b border-[var(--border-color)]">
              <img src={league.logo} alt={league.name} className="w-5 h-5 object-contain" />
              <h3 className="font-bold text-[var(--text-primary)] text-sm">{league.name}</h3>
            </div>
            
            <div className="divide-y border-t border-[var(--border-color)] border-[var(--border-color)] max-h-[600px] overflow-y-auto">
              {virtualTime.slots.flatMap((slot, slotIndex) => {
                const teamNames = TEAMS_BY_LEAGUE[league.id] || [];
                if (teamNames.length < 2) return [];

                // Use absolute slotCycle to ensure teams and scores are stable for a given time
                const slotCycle = virtualTime.cycleIndex + slot.cycleOffset;
                
                // Determinist shuffling of teams based on slotCycle
                const shuffledTeams = [...teamNames].sort((a, b) => {
                  const valA = Math.abs(Math.sin(slotCycle * a.charCodeAt(0) + a.length));
                  const valB = Math.abs(Math.sin(slotCycle * b.charCodeAt(0) + b.length));
                  return valA - valB;
                });
                
                const matchesInSlot = [];
                for(let i = 0; i < shuffledTeams.length - 1; i += 2) {
                  matchesInSlot.push({
                    homeTeam: shuffledTeams[i],
                    awayTeam: shuffledTeams[i+1],
                    matchSeedOffset: i
                  });
                }
                
                return matchesInSlot.map(({homeTeam, awayTeam, matchSeedOffset}, matchIdx) => {
                  const isLive = slot.isCurrent;
                  const isResult = isLive || slot.showResult;
                  const isFuture = slot.isFuture;
                  const odds = generateOdds(league.id, homeTeam, awayTeam, slotCycle + matchSeedOffset);
                  
                  // Deterministic score based on slotCycle and teams
                  const scoreSeed = Math.abs((slotCycle + matchSeedOffset + 1) * homeTeam.length * awayTeam.length);
                  const finalHomeScore = scoreSeed % 4 + (scoreSeed % 10 > 8 ? 1 : 0); // slight variance
                  const finalAwayScore = ((scoreSeed / 2) % 4 | 0) + (scoreSeed % 8 > 6 ? 1 : 0);
                  
                  const matchProgress = slot.matchMinute !== undefined ? Math.min(1, slot.matchMinute / 90) : 1;
                  const homeScore = isLive && slot.matchMinute !== undefined && slot.matchMinute < 90 ?
                    Math.floor(finalHomeScore * matchProgress) : finalHomeScore;
                  const awayScore = isLive && slot.matchMinute !== undefined && slot.matchMinute < 90 ?
                    Math.floor(finalAwayScore * matchProgress) : finalAwayScore;
                  
                  const confidence = 65 + (scoreSeed % 30); // 65% to 94%
                  const isHotMatch = scoreSeed % 5 === 0; // 20% chance
                  
                  return (
                    <div 
                      key={`${slotIndex}-${matchIdx}`} 
                      className={`p-2 hover:bg-[var(--tab-bg)] transition-colors cursor-pointer relative overflow-hidden border-b border-[var(--border-color)] last:border-b-0 ${isHotMatch ? 'border-l-2 border-[#eab308]' : ''}`}
                      onClick={() => setSelectedMatch({
                        league, homeTeam, awayTeam, homeScore, awayScore, isResult, isLive, isFuture, odds, slot, scoreSeed
                      })}
                    >
                      {isHotMatch && (
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-[#F59E0B] to-[#F97316] text-[var(--text-primary)] text-[9px] font-bold px-1.5 py-0.5 rounded-bl-lg shadow-sm flex items-center gap-1 z-10">
                          <Flame className="w-2.5 h-2.5" /> HOT
                        </div>
                      )}
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-1 text-[10px] font-medium bg-[var(--tab-bg)] px-1.5 py-0.5 rounded text-[var(--text-secondary)]">
                          <Clock className="w-2.5 h-2.5 text-[var(--btn-primary)]" />
                          <span>{slot.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isFuture && (
                            <span className="text-[9px] font-bold text-[var(--text-secondary)] bg-[var(--tab-bg)] px-1.5 py-0.5 rounded border border-[var(--border-color)]">
                              Confiance: <span className={confidence > 85 ? 'text-[var(--btn-primary)]' : 'text-[var(--btn-primary)]'}>{confidence}%</span>
                            </span>
                          )}
                          {slot.isPast && <span className="text-[9px] font-bold text-[#EF4444] uppercase bg-[#EF4444]/10 px-1.5 py-0.5 rounded border border-[#EF4444]/20">Résultat</span>}
                          {isLive && <span className="text-[9px] font-bold text-[var(--btn-primary)] uppercase bg-[var(--btn-primary)]/10 px-1.5 py-0.5 rounded animate-pulse border border-[var(--btn-primary)]/20">Live {slot.matchMinute !== undefined ? `${slot.matchMinute}'` : ''}</span>}
                          {isFuture && slot.remainingSeconds !== undefined && (
                            <span className="text-[10px] font-black text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/30 tracking-widest flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {Math.floor(slot.remainingSeconds / 60).toString().padStart(2, '0')}:{(slot.remainingSeconds % 60).toString().padStart(2, '0')}
                            </span>
                          )}
                          {isFuture && slot.remainingSeconds === undefined && (
                            <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase bg-[var(--tab-bg)] px-1.5 py-0.5 rounded border border-[var(--border-color)]">Prédiction</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex-1 flex flex-col items-center gap-1">
                          <img src={getTeamLogo(homeTeam, league.id)} alt={homeTeam} className="w-5 h-5 object-contain" />
                          <span className="font-bold text-[var(--text-primary)] text-[11px] text-center leading-tight truncate w-full px-1">{homeTeam}</span>
                        </div>
                        
                        <div className="px-2 flex flex-col items-center justify-center">
                          {isResult ? (
                            <div className="text-sm font-black text-[var(--text-primary)] tracking-widest bg-[var(--tab-bg)] px-2 py-0.5 rounded border border-[var(--border-color)] shadow-sm">
                              {homeScore} - {awayScore}
                            </div>
                          ) : (
                            <div className="text-[var(--text-secondary)] font-bold text-[10px] bg-[var(--tab-bg)] px-1.5 py-0.5 rounded-full border border-[var(--border-color)]">VS</div>
                          )}
                        </div>
                        
                        <div className="flex-1 flex flex-col items-center gap-1">
                          <img src={getTeamLogo(awayTeam, league.id)} alt={awayTeam} className="w-5 h-5 object-contain" />
                          <span className="font-bold text-[var(--text-primary)] text-[11px] text-center leading-tight truncate w-full px-1">{awayTeam}</span>
                        </div>
                      </div>
                      
                      <div className="mt-1.5 grid grid-cols-3 gap-1">
                        <div className="bg-[var(--tab-bg)] rounded p-1 flex flex-col items-center border border-[var(--border-color)] hover:border-[var(--input-focus)] transition-colors group">
                          <span className="text-[9px] text-[var(--text-secondary)] mb-0.5 group-hover:text-[var(--btn-primary)] transition-colors">1</span>
                          <span className="font-bold text-[var(--btn-primary)] text-xs">{odds.home.toFixed(2)}</span>
                        </div>
                        <div className="bg-[var(--tab-bg)] rounded p-1 flex flex-col items-center border border-[var(--border-color)] hover:border-[var(--input-focus)] transition-colors group">
                          <span className="text-[9px] text-[var(--text-secondary)] mb-0.5 group-hover:text-[var(--btn-primary)] transition-colors">X</span>
                          <span className="font-bold text-[var(--btn-primary)] text-xs">{odds.draw.toFixed(2)}</span>
                        </div>
                        <div className="bg-[var(--tab-bg)] rounded p-1 flex flex-col items-center border border-[var(--border-color)] hover:border-[var(--input-focus)] transition-colors group">
                          <span className="text-[9px] text-[var(--text-secondary)] mb-0.5 group-hover:text-[var(--btn-primary)] transition-colors">2</span>
                          <span className="font-bold text-[var(--btn-primary)] text-xs">{odds.away.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                });
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderResults = () => {
    if (!virtualTime) return null;
    
    // Generate past 50 results
    const pastResults: any[] = [];
    for (let i = 1; i <= 50; i++) {
      const slotCycle = virtualTime.cycleIndex - i;
      const slotRealTimeStart = slotCycle * 100000;
      const slotMatchTime = new Date(slotRealTimeStart);
      
      const slotH = slotMatchTime.getHours();
      const slotM = slotMatchTime.getMinutes();
      const timeStr = `${slotH.toString().padStart(2, '0')}:${slotM.toString().padStart(2, '0')}`;
      
      LEAGUES.forEach(league => {
        const teamNames = TEAMS_BY_LEAGUE[league.id] || [];
        if (teamNames.length < 2) return;

        // Determinist shuffling of teams based on slotCycle
        const shuffledTeams = [...teamNames].sort((a, b) => {
          const valA = Math.abs(Math.sin(slotCycle * a.charCodeAt(0) + a.length));
          const valB = Math.abs(Math.sin(slotCycle * b.charCodeAt(0) + b.length));
          return valA - valB;
        });

        const matchesInSlot = [];
        for(let j = 0; j < shuffledTeams.length - 1; j += 2) {
          matchesInSlot.push({
            homeTeam: shuffledTeams[j],
            awayTeam: shuffledTeams[j+1],
            matchSeedOffset: j
          });
        }
        
        matchesInSlot.forEach(({homeTeam, awayTeam, matchSeedOffset}) => {
          const scoreSeed = Math.abs((slotCycle + matchSeedOffset + 1) * homeTeam.length * awayTeam.length);
          const homeScore = scoreSeed % 4 + (scoreSeed % 10 > 8 ? 1 : 0);
          const awayScore = ((scoreSeed / 2) % 4 | 0) + (scoreSeed % 8 > 6 ? 1 : 0);
          
          pastResults.push({
            date: slotMatchTime.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
            time: timeStr,
            matchTime: slotMatchTime,
            league,
            homeTeam,
            awayTeam,
            homeScore,
            awayScore
          });
        });
      });
    }
    
    // Sort by time descending
    pastResults.sort((a, b) => b.matchTime.getTime() - a.matchTime.getTime());

    return (
      <div className="space-y-3 mt-4 text-left">
        {pastResults.map((result, idx) => (
          <div key={idx} className="bg-[var(--card-bg)] rounded-2xl theme-shadow p-3 border border-[var(--border-color)] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center bg-[var(--tab-bg)] px-2 py-1 rounded">
                <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase">{result.date}</span>
                <span className="text-xs font-bold text-[var(--text-secondary)]">{result.time}</span>
              </div>
              <img src={result.league.logo} alt={result.league.name} className="w-5 h-5 object-contain ml-1" />
            </div>
            
            <div className="flex-1 flex items-center justify-center gap-3 px-2">
              <span className="text-xs font-bold text-[var(--text-primary)] text-right flex-1 truncate">{result.homeTeam}</span>
              <div className="bg-[#111827] text-[var(--text-primary)] font-black text-sm px-2 py-0.5 rounded tracking-widest">
                {result.homeScore} - {result.awayScore}
              </div>
              <span className="text-xs font-bold text-[var(--text-primary)] text-left flex-1 truncate">{result.awayTeam}</span>
            </div>
            
            <div className="text-[10px] font-bold text-[#EF4444] bg-[#EF4444]/10 px-1.5 py-0.5 rounded uppercase">
              FT
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
      <div className="bg-[var(--card-bg)] border-b border-[var(--border-color)] overflow-x-auto hide-scrollbar sticky top-[60px] z-10">
        <div className="flex p-2 gap-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setVirtuelTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl active:scale-95 transition-transform text-[11px] font-bold uppercase transition-colors ${
                  virtuelTab === tab.id 
                    ? 'bg-[var(--btn-primary)] text-[var(--text-primary)]' 
                    : 'bg-[var(--tab-bg)] text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]'
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
      <div className="bg-[var(--card-bg)] border-b border-[var(--border-color)] overflow-x-auto hide-scrollbar sticky top-[60px] z-10">
        <div className="flex p-2 gap-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setAviatorTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl active:scale-95 transition-transform text-[11px] font-bold uppercase transition-colors ${
                  aviatorTab === tab.id 
                    ? 'bg-[#EF4444] text-[var(--text-primary)]' 
                    : 'bg-[var(--tab-bg)] text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]'
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
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-from to-theme-bg-to text-[var(--text-primary)] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[var(--header-bg)] flex items-center justify-between p-3 sticky top-0 z-20 shadow-md h-[60px]">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowMenu(true)} className="p-1.5 bg-[var(--btn-primary)] text-[var(--text-primary)] rounded-xl active:scale-95 transition-transform">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">Betting Tips</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[var(--input-bg)] px-2.5 py-1 rounded-full border border-[var(--border-color)]">
            <Coins className="w-3.5 h-3.5 text-[var(--btn-primary)]" />
            <span className="font-bold text-[var(--text-primary)] text-sm">{user.tokens}</span>
          </div>
          <button onClick={() => setShowCart(true)} className="relative p-1.5 hover:bg-[var(--input-bg)] rounded-full transition-colors">
            <ShoppingCart className="w-5 h-5 text-[var(--btn-primary)]" />
            <span className="absolute top-0 right-0 bg-[#EF4444] text-[var(--text-primary)] text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
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
          <div className="absolute inset-0 bg-[var(--header-bg)]/60 backdrop-blur-sm" onClick={() => setShowMenu(false)}></div>
          <div className="relative w-72 bg-[var(--card-bg)] h-full flex flex-col shadow-2xl transform transition-transform">
            <div className="p-6 bg-[var(--card-bg)] border-b border-[var(--border-color)] relative">
              <button onClick={() => setShowMenu(false)} className="absolute top-4 right-4 p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <X className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 bg-[var(--btn-primary)] rounded-full flex items-center justify-center mb-4 text-2xl font-bold text-[var(--text-primary)] shadow-lg">
                {user.phone.substring(0, 2)}
              </div>
              <div className="font-bold text-[var(--text-primary)] text-lg">{user.phone}</div>
              <div className="text-sm text-[var(--text-secondary)] mt-1 font-mono">ID: {user.id}</div>
            </div>
            <div className="flex-1 p-4 space-y-2 overflow-y-auto">
              <button onClick={() => { setMainTab('virtuel'); setShowMenu(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl active:scale-95 transition-transform transition-colors ${mainTab === 'virtuel' ? 'bg-[var(--tab-bg)] text-[var(--text-primary)] font-bold border border-[var(--border-color)]' : 'text-[var(--text-secondary)] hover:bg-[var(--tab-bg)]'}`}>
                <Flame className="w-5 h-5" />
                <span className="font-medium">Virtuel</span>
              </button>
              <button onClick={() => { setMainTab('aviator'); setShowMenu(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl active:scale-95 transition-transform transition-colors ${mainTab === 'aviator' ? 'bg-[var(--tab-bg)] text-[var(--text-primary)] font-bold border border-[var(--border-color)]' : 'text-[var(--text-secondary)] hover:bg-[var(--tab-bg)]'}`}>
                <Plane className="w-5 h-5" />
                <span className="font-medium">Aviator</span>
              </button>
              <div className="my-4 border-t border-[var(--border-color)]"></div>
              
              <div className="px-4 py-2">
                <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Thème</h3>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setTheme('purple')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border ${theme === 'purple' ? 'border-[#8B5CF6] bg-[#8B5CF6]/10' : 'border-[var(--border-color)] hover:bg-[var(--tab-bg)]'}`}
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#2E1065] to-[#4C1D95]"></div>
                    <span className="text-[10px] font-bold text-[var(--text-primary)]">Purple</span>
                  </button>
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border ${theme === 'dark' ? 'border-[#8B5CF6] bg-[#8B5CF6]/10' : 'border-[var(--border-color)] hover:bg-[var(--tab-bg)]'}`}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#0D0D0D]"></div>
                    <span className="text-[10px] font-bold text-[var(--text-primary)]">Dark</span>
                  </button>
                  <button 
                    onClick={() => setTheme('light')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border ${theme === 'light' ? 'border-[#8B5CF6] bg-[#8B5CF6]/10' : 'border-[var(--border-color)] hover:bg-[var(--tab-bg)]'}`}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#F5F7FA] border border-[#E5E7EB]"></div>
                    <span className="text-[10px] font-bold text-[var(--text-primary)]">Light</span>
                  </button>
                </div>
              </div>

              <div className="my-4 border-t border-[var(--border-color)]"></div>
              <button onClick={() => setShowAdminModal(true)} className="w-full flex items-center gap-3 px-4 py-3 text-[var(--btn-primary)] hover:bg-[var(--btn-hover)]/10 rounded-xl active:scale-95 transition-transform transition-colors">
                <ShieldAlert className="w-5 h-5" />
                <span className="font-medium">Admin Panel</span>
              </button>
            </div>
            <div className="p-4 border-t border-[var(--border-color)]">
              <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-xl active:scale-95 transition-transform transition-colors font-medium">
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-[var(--header-bg)]/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--card-bg)] rounded-2xl theme-shadow p-6 w-full max-w-sm border border-[var(--border-color)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-[var(--btn-primary)]" />
              Accès Administrateur
            </h2>
            <form onSubmit={handleAdminSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Code d'accès</label>
                <input
                  type="password"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  className="w-full bg-[var(--tab-bg)] border border-[var(--border-color)] rounded-xl active:scale-95 transition-transform py-3 px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--input-focus)]"
                  placeholder="••••"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="flex-1 py-2 rounded-xl active:scale-95 transition-transform font-medium bg-[var(--tab-bg)] text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors border border-[var(--border-color)]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl active:scale-95 transition-transform font-bold bg-[var(--btn-primary)] text-[var(--text-primary)] hover:bg-[var(--btn-hover)] transition-colors"
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
          <div className="absolute inset-0 bg-[var(--header-bg)]/60 backdrop-blur-sm" onClick={() => setShowCart(false)}></div>
          <div className="relative bg-[var(--card-bg)] w-full max-w-md rounded-2xl shadow-2xl border border-[var(--border-color)] overflow-hidden">
            <div className="bg-[var(--tab-bg)] p-4 border-b border-[var(--border-color)] flex justify-between items-center">
              <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-[var(--btn-primary)]" />
                Acheter des Tokens
              </h2>
              <button onClick={() => setShowCart(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4 flex items-center justify-between hover:border-[var(--input-focus)] transition-colors cursor-pointer shadow-sm" onClick={() => handleBuyTokens(5000, '3.5 jours')}>
                <div>
                  <div className="font-bold text-[var(--text-primary)] text-lg">5 000 Ar</div>
                  <div className="text-sm text-[var(--text-secondary)]">Validité: 3.5 jours</div>
                </div>
                <button className="bg-[var(--btn-primary)] text-[var(--text-primary)] font-bold px-4 py-2 rounded-xl active:scale-95 transition-transform">Acheter</button>
              </div>
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4 flex items-center justify-between hover:border-[var(--input-focus)] transition-colors cursor-pointer shadow-sm" onClick={() => handleBuyTokens(10000, '7 jours')}>
                <div>
                  <div className="font-bold text-[var(--text-primary)] text-lg">10 000 Ar</div>
                  <div className="text-sm text-[var(--text-secondary)]">Validité: 7 jours</div>
                </div>
                <button className="bg-[var(--btn-primary)] text-[var(--text-primary)] font-bold px-4 py-2 rounded-xl active:scale-95 transition-transform">Acheter</button>
              </div>
              <div className="bg-[var(--btn-primary)]/10 border border-[var(--btn-primary)]/30 rounded-xl p-4 flex items-center justify-between hover:border-[var(--btn-primary)] transition-colors cursor-pointer relative overflow-hidden shadow-sm" onClick={() => handleBuyTokens(40000, '30 jours')}>
                <div className="absolute top-0 right-0 bg-[var(--btn-primary)] text-[var(--text-primary)] text-[10px] font-bold px-2 py-1 rounded-bl-lg">POPULAIRE</div>
                <div>
                  <div className="font-bold text-[var(--btn-primary)] text-lg">40 000 Ar</div>
                  <div className="text-sm text-[var(--text-secondary)]">Validité: 30 jours (VIP)</div>
                </div>
                <button className="bg-[var(--btn-primary)] text-[var(--text-primary)] font-bold px-4 py-2 rounded-xl active:scale-95 transition-transform shadow-md">Acheter</button>
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
                <Activity className="w-12 h-12 text-[var(--btn-primary)] mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Best Live</h2>
                <p className="text-[var(--text-secondary)] mb-4">Analyse en temps réel des meilleurs matchs en cours pour des paris en direct.</p>
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
                <Gem className="w-12 h-12 text-[var(--btn-primary)] mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Espace VIP</h2>
                <p className="text-[var(--text-secondary)] mb-6">Accédez aux pronostics exclusifs avec un taux de réussite supérieur à 90%.</p>
                
                {user.tokens < 10000 ? (
                  <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl p-6 text-center">
                    <ShieldCheck className="w-12 h-12 text-[#EF4444] mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-[#B91C1C] mb-2">Accès Refusé</h3>
                    <p className="text-[#DC2626] font-medium">Mila 10,000 tokens farafahakeliny ianao vao afaka miditra eto amin'ny VIP.</p>
                  </div>
                ) : (
                  <div className="text-left space-y-8">
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <Search className="w-5 h-5 text-[var(--btn-primary)]" /> VIP ULTRA ANALYSE
                      </h3>
                      <VirtualAnalysis userTokens={user.tokens} onAnalyze={handleAnalyze} isVip={true} />
                    </div>
                    
                    <div className="border-t border-[var(--border-color)] pt-8">
                      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-[var(--btn-primary)]" /> VIP MULTIPLE
                      </h3>
                      <MultipleGenerator userTokens={user.tokens} onAnalyze={handleAnalyze} isVip={true} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {virtuelTab === 'result' && (
              <div className="p-4 text-center">
                <Trophy className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Résultats</h2>
                <p className="text-[var(--text-secondary)] mb-6">Consultez les résultats des matchs précédents et l'historique de nos pronostics.</p>
                {renderResults()}
              </div>
            )}

            {virtuelTab === 'status' && (
              <div className="p-4 text-center">
                <Activity className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Status du Système</h2>
                <p className="text-[var(--text-secondary)]">L'algorithme est actuellement en ligne et fonctionne de manière optimale.</p>
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
                <Search className="w-12 h-12 text-[#EF4444] mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Analyse Poussée</h2>
                <p className="text-[var(--text-secondary)]">Outil d'analyse statistique pour détecter les tendances de l'algorithme Aviator.</p>
              </div>
            )}
            {aviatorTab === 'history' && (
              <div className="p-4 text-center">
                <History className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Historique</h2>
                <p className="text-[var(--text-secondary)]">Consultez l'historique complet des multiplicateurs précédents.</p>
              </div>
            )}
            {aviatorTab === 'high_risk' && (
              <div className="p-4 text-center">
                <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">High Risk (Cotes 10x+)</h2>
                <p className="text-[var(--text-secondary)]">Prédictions des moments propices pour viser les gros multiplicateurs.</p>
              </div>
            )}
            {aviatorTab === 'safe_zone' && (
              <div className="p-4 text-center">
                <ShieldCheck className="w-12 h-12 text-[#22C55E] mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Safe Zone (1.5x - 2.0x)</h2>
                <p className="text-[var(--text-secondary)]">Stratégie sécurisée pour des gains réguliers avec un risque minimal.</p>
              </div>
            )}
            {aviatorTab === 'vip' && (
              <div className="p-4 text-center">
                <Gem className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Aviator VIP</h2>
                <p className="text-[var(--text-secondary)] mb-6">Signaux en temps réel via Telegram pour nos membres VIP.</p>
                <div className="text-left">
                  <AviatorSystem userTokens={user.tokens} onAnalyze={handleAnalyze} isVip={true} />
                </div>
              </div>
            )}
            {aviatorTab === 'admin' && (
              <div className="p-4 text-center">
                <Settings className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Administration</h2>
                <p className="text-[var(--text-secondary)]">Configuration de l'algorithme de prédiction (Accès restreint).</p>
                <button onClick={() => setShowAdminModal(true)} className="mt-4 bg-[var(--input-bg)] text-[var(--text-primary)] px-4 py-2 rounded-xl active:scale-95 transition-transform">Connexion Admin</button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-[var(--header-bg)] border-t border-[var(--border-color)] fixed bottom-0 w-full flex justify-around px-2 py-2 pb-safe z-20">
        <button onClick={() => setMainTab('virtuel')} className={`flex flex-col items-center p-2 min-w-[60px] ${mainTab === 'virtuel' ? 'text-[var(--btn-primary)]' : 'text-[var(--text-secondary)]'}`}>
          <Flame className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Virtuel</span>
        </button>
        <button onClick={() => setMainTab('aviator')} className={`flex flex-col items-center p-2 min-w-[60px] ${mainTab === 'aviator' ? 'text-[#EF4444]' : 'text-[var(--text-secondary)]'}`}>
          <Plane className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Aviator</span>
        </button>
        <button onClick={() => setMainTab('vip')} className={`flex flex-col items-center p-2 min-w-[60px] ${mainTab === 'vip' ? 'text-purple-500' : 'text-[var(--text-secondary)]'}`}>
          <Gem className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">VIP</span>
        </button>
        <button onClick={() => setShowMenu(true)} className={`flex flex-col items-center p-2 min-w-[60px] text-[var(--text-secondary)]`}>
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
