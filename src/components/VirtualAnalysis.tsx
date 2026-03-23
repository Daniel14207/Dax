import React, { useState } from 'react';
import { VirtualAnalysisResult } from '../types';
import { Save, Search, Loader2, Trash2, Clock, Flame, BarChart3 } from 'lucide-react';
import { LEAGUES, TEAMS_BY_LEAGUE, getTeamLogo } from '../data';

interface Props {
  userTokens: number;
  onAnalyze: () => void;
}

export default function VirtualAnalysis({ userTokens, onAnalyze }: Props) {
  const [historyText, setHistoryText] = useState('');
  const [matchInput, setMatchInput] = useState('');
  const [matchTime, setMatchTime] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<VirtualAnalysisResult[]>([]);

  const handleSaveHistory = () => {
    if (!historyText.trim()) return;
    localStorage.setItem('virtualHistory', historyText);
    alert('Historique sauvegardé avec succès !');
  };

  const handleAnalyze = () => {
    if (userTokens <= 0) {
      alert('Tokens insuffisants');
      return;
    }
    if (!matchInput.trim() || !matchTime.trim()) {
      alert('Veuillez remplir les matchs et l\'heure.');
      return;
    }

    onAnalyze(); // Deduct token
    setIsAnalyzing(true);

    // Simulate 5s analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      
      const batchId = Math.random().toString(36).substr(2, 9);
      const newResults: VirtualAnalysisResult[] = [];
      
      const matchLines = matchInput.split('\n').filter(line => line.trim() !== '');
      
      matchLines.forEach(line => {
        // Expected format: Team A vs Team B | cote 1 | cote X | cote 2
        const parts = line.split('|').map(p => p.trim());
        const teamsPart = parts[0] || '';
        const teams = teamsPart.split(/ vs /i).map(t => t.trim());
        
        const homeTeam = teams[0] || 'Team A';
        const awayTeam = teams[1] || 'Team B';
        
        // Determine league (mocking for now, just pick the first one where the team exists, or default)
        let leagueId = LEAGUES[0].id;
        for (const [lId, lTeams] of Object.entries(TEAMS_BY_LEAGUE)) {
          if (lTeams.includes(homeTeam) || lTeams.includes(awayTeam)) {
            leagueId = lId;
            break;
          }
        }
        
        const isHotMatch = Math.random() > 0.7;
        const confidence = Math.floor(Math.random() * 31) + 65; // 65 to 95

        newResults.push({
          batchId,
          matchId: Math.random().toString(36).substr(2, 9),
          leagueId,
          time: matchTime,
          homeTeam,
          awayTeam,
          isHotMatch,
          confidence,
          results: {
            ft1x2: ['1', 'X', '2'][Math.floor(Math.random() * 3)],
            ht1x2: ['1', 'X', '2'][Math.floor(Math.random() * 3)],
            dc: ['1X', '12', 'X2'][Math.floor(Math.random() * 3)],
            dcHt: ['1X', '12', 'X2'][Math.floor(Math.random() * 3)],
            exactScore: `${Math.floor(Math.random() * 4)}-${Math.floor(Math.random() * 4)}`,
            htScore: `${Math.floor(Math.random() * 2)}-${Math.floor(Math.random() * 2)}`,
            ou05: Math.random() > 0.1 ? 'Over' : 'Under',
            ou15: Math.random() > 0.3 ? 'Over' : 'Under',
            ou25: Math.random() > 0.5 ? 'Over' : 'Under',
            ou35: Math.random() > 0.7 ? 'Over' : 'Under',
            htft: ['1/1', 'X/1', '2/2', 'X/X'][Math.floor(Math.random() * 4)],
            totalGoals: Math.floor(Math.random() * 5).toString(),
            ggng: Math.random() > 0.5 ? 'GG' : 'NG',
            btts: Math.random() > 0.5 ? 'Yes' : 'No',
            teamTotals: `H: ${Math.floor(Math.random() * 3)} | A: ${Math.floor(Math.random() * 3)}`,
            oddEven: Math.random() > 0.5 ? 'Odd' : 'Even',
            firstGoalMin: `${Math.floor(Math.random() * 45) + 1}'`,
            multiGoals: '1-3',
            ftts: Math.random() > 0.5 ? 'Home' : 'Away'
          }
        });
      });

      const updatedResults = [...newResults, ...results];
      setResults(updatedResults);
      localStorage.setItem('virtualAnalyses', JSON.stringify(updatedResults));
    }, 5000);
  };

  const clearResults = () => {
    setResults([]);
    localStorage.removeItem('virtualAnalyses');
  };

  // Load saved results on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('virtualAnalyses');
    if (saved) setResults(JSON.parse(saved));
    const hist = localStorage.getItem('virtualHistory');
    if (hist) setHistoryText(hist);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-[#1e293b] rounded-xl p-4 border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="bg-[#2dd4bf] text-slate-900 w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
          Historique
        </h3>
        <textarea
          value={historyText}
          onChange={(e) => setHistoryText(e.target.value)}
          placeholder="Collez l'historique ici (ex: Team A 2-1 Team B)..."
          className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#2dd4bf] mb-3"
        />
        <button 
          onClick={handleSaveHistory}
          className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          Sauvegarder l'historique
        </button>
      </div>

      <div className="bg-[#1e293b] rounded-xl p-4 border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="bg-[#eab308] text-slate-900 w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
          Nouvelle Analyse (Multi-Match)
        </h3>
        <div className="space-y-3 mb-4">
          <textarea
            value={matchInput}
            onChange={(e) => setMatchInput(e.target.value)}
            placeholder="Team A vs Team B | 1.50 | 3.20 | 4.10&#10;Team C vs Team D | 2.10 | 3.00 | 2.80"
            className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#eab308]"
          />
          <input
            type="time"
            value={matchTime}
            onChange={(e) => setMatchTime(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#eab308]"
          />
        </div>
        <button 
          onClick={handleAnalyze}
          disabled={isAnalyzing || userTokens <= 0}
          className={`w-full font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            userTokens <= 0 
              ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
              : 'bg-[#eab308] hover:bg-[#ca8a04] text-slate-900'
          }`}
        >
          {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : userTokens <= 0 ? null : <Search className="w-5 h-5" />}
          {isAnalyzing ? 'Analyse en cours (5s)...' : userTokens <= 0 ? 'Tokens insuffisants' : 'Lancer l\'analyse (1 Token)'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Résultats d'Analyse</h3>
            <button onClick={clearResults} className="text-red-400 hover:text-red-300 flex items-center gap-1 text-sm">
              <Trash2 className="w-4 h-4" /> Effacer
            </button>
          </div>
          
          {results.map((res) => {
            const league = LEAGUES.find(l => l.id === res.leagueId);
            return (
              <div key={res.matchId} className="bg-[#1e293b] rounded-xl overflow-hidden border border-slate-800 shadow-lg relative">
                {res.isHotMatch && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 z-10 shadow-md">
                    <Flame className="w-3 h-3" /> HOT MATCH
                  </div>
                )}
                <div className="bg-slate-800/80 px-4 py-2 flex justify-between items-center border-b border-slate-700/50">
                  <div className="flex items-center gap-2">
                    {league && <img src={league.logo} alt={league.name} className="w-4 h-4 object-contain" />}
                    <span className="text-sm font-medium text-slate-300">{league?.name || 'League'}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {res.confidence && (
                      <div className="flex items-center gap-1 text-xs font-bold text-[#2dd4bf]">
                        <BarChart3 className="w-3 h-3" />
                        {res.confidence}% Confiance
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-400">{res.time}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                  <div className="flex-1 flex items-center gap-2">
                    <img src={getTeamLogo(res.homeTeam, res.leagueId)} alt={res.homeTeam} className="w-6 h-6 object-contain" />
                    <span className="font-bold text-white text-sm">{res.homeTeam}</span>
                  </div>
                  <span className="text-slate-500 font-bold px-2">VS</span>
                  <div className="flex-1 flex items-center gap-2 justify-end">
                    <span className="font-bold text-white text-sm text-right">{res.awayTeam}</span>
                    <img src={getTeamLogo(res.awayTeam, res.leagueId)} alt={res.awayTeam} className="w-6 h-6 object-contain" />
                  </div>
                </div>
                
                {/* Graphique de tendance visuelle simple */}
                <div className="px-4 py-2 bg-slate-800/30 border-b border-slate-700/50 flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium w-16">Tendance:</span>
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden flex">
                    <div className="bg-[#2dd4bf] h-full" style={{ width: `${res.confidence}%` }}></div>
                    <div className="bg-red-500 h-full" style={{ width: `${100 - (res.confidence || 50)}%` }}></div>
                  </div>
                </div>
                
                <div className="p-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between bg-slate-800/50 p-2 rounded"><span className="text-slate-400">1X2:</span> <span className="font-bold text-[#2dd4bf]">{res.results.ft1x2}</span></div>
                  <div className="flex justify-between bg-slate-800/50 p-2 rounded"><span className="text-slate-400">1X2 MT:</span> <span className="font-bold text-white">{res.results.ht1x2}</span></div>
                  <div className="flex justify-between bg-slate-800/50 p-2 rounded"><span className="text-slate-400">DC:</span> <span className="font-bold text-white">{res.results.dc}</span></div>
                  <div className="flex justify-between bg-slate-800/50 p-2 rounded"><span className="text-slate-400">DC MT:</span> <span className="font-bold text-white">{res.results.dcHt}</span></div>
                  <div className="flex justify-between bg-slate-800/50 p-2 rounded"><span className="text-slate-400">Score Exact:</span> <span className="font-bold text-[#eab308]">{res.results.exactScore}</span></div>
                  <div className="flex justify-between bg-slate-800/50 p-2 rounded"><span className="text-slate-400">Score MT:</span> <span className="font-bold text-white">{res.results.htScore}</span></div>
                  <div className="flex justify-between bg-slate-800/50 p-2 rounded"><span className="text-slate-400">O/U 0.5:</span> <span className="font-bold text-white">{res.results.ou05}</span></div>
                  <div className="flex justify-between bg-slate-800/50 p-2 rounded"><span className="text-slate-400">O/U 1.5:</span> <span className="font-bold text-white">{res.results.ou15}</span></div>
                  <div className="flex justify-between bg-slate-800/50 p-2 rounded"><span className="text-slate-400">O/U 2.5:</span> <span className="font-bold text-white">{res.results.ou25}</span></div>
                  <div className="flex justify-between bg-slate-800/50 p-2 rounded"><span className="text-slate-400">O/U 3.5:</span> <span className="font-bold text-white">{res.results.ou35}</span></div>
                  <div className="flex justify-between bg-slate-800/50 p-2 rounded"><span className="text-slate-400">HT/FT:</span> <span className="font-bold text-[#2dd4bf]">{res.results.htft}</span></div>
                  <div className="flex justify-between bg-slate-800/50 p-2 rounded"><span className="text-slate-400">Total Buts:</span> <span className="font-bold text-white">{res.results.totalGoals}</span></div>
                  <div className="flex justify-between bg-slate-800/50 p-2 rounded"><span className="text-slate-400">GG/NG:</span> <span className="font-bold text-white">{res.results.ggng}</span></div>
                  <div className="flex justify-between bg-slate-800/50 p-2 rounded"><span className="text-slate-400">BTTS:</span> <span className="font-bold text-[#eab308]">{res.results.btts}</span></div>
                  <div className="flex justify-between bg-slate-800/50 p-2 rounded"><span className="text-slate-400">Team Totals:</span> <span className="font-bold text-white">{res.results.teamTotals}</span></div>
                  <div className="flex justify-between bg-slate-800/50 p-2 rounded"><span className="text-slate-400">Pair/Impair:</span> <span className="font-bold text-white">{res.results.oddEven}</span></div>
                  <div className="flex justify-between bg-slate-800/50 p-2 rounded"><span className="text-slate-400">1er But Min:</span> <span className="font-bold text-white">{res.results.firstGoalMin}</span></div>
                  <div className="flex justify-between bg-slate-800/50 p-2 rounded"><span className="text-slate-400">Multi-buts:</span> <span className="font-bold text-white">{res.results.multiGoals}</span></div>
                  <div className="flex justify-between bg-slate-800/50 p-2 rounded col-span-2"><span className="text-slate-400">FTTS (First Team To Score):</span> <span className="font-bold text-[#2dd4bf]">{res.results.ftts}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
