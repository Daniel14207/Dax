import React, { useState } from 'react';
import { VirtualAnalysisResult } from '../types';
import { Save, Search, Loader2, Trash2, Clock, Flame, BarChart3, Upload, Image as ImageIcon, X, Copy, CheckCircle, TrendingUp, ShieldCheck } from 'lucide-react';
import { LEAGUES, TEAMS_BY_LEAGUE, getTeamLogo } from '../data';

interface Props {
  userTokens: number;
  onAnalyze: () => void;
}

export default function VirtualAnalysis({ userTokens, onAnalyze }: Props) {
  const [historyImages, setHistoryImages] = useState<string[]>([]);
  const [matchImages, setMatchImages] = useState<string[]>([]);
  const [selectedLeague, setSelectedLeague] = useState(LEAGUES[0].id);
  const [matchTime, setMatchTime] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSavingHistory, setIsSavingHistory] = useState(false);
  const [results, setResults] = useState<VirtualAnalysisResult[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleHistoryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (historyImages.length + files.length > 5) {
      showToast('Maximum 5 images autorisées');
      return;
    }
    const newImages = files.map(f => URL.createObjectURL(f));
    setHistoryImages([...historyImages, ...newImages]);
  };

  const handleMatchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (matchImages.length + files.length > 5) {
      showToast('Maximum 5 images autorisées');
      return;
    }
    const newImages = files.map(f => URL.createObjectURL(f));
    setMatchImages([...matchImages, ...newImages]);
  };

  const removeHistoryImage = (index: number) => {
    setHistoryImages(historyImages.filter((_, i) => i !== index));
  };

  const removeMatchImage = (index: number) => {
    setMatchImages(matchImages.filter((_, i) => i !== index));
  };

  const handleSaveHistory = () => {
    if (historyImages.length === 0) {
      showToast('Veuillez uploader au moins une image d\'historique.');
      return;
    }
    setIsSavingHistory(true);
    // Simulate OCR and saving
    setTimeout(() => {
      setIsSavingHistory(false);
      showToast('Historique analysé et sauvegardé avec succès !');
    }, 2000);
  };

  const handleAnalyze = () => {
    if (userTokens <= 0) {
      showToast('Tokens insuffisants');
      return;
    }
    if (matchImages.length === 0 || !matchTime.trim()) {
      showToast('Veuillez uploader des images de matchs et indiquer l\'heure.');
      return;
    }

    onAnalyze(); // Deduct token
    setIsAnalyzing(true);

    // Simulate 3-5s analysis
    const analysisTime = Math.floor(Math.random() * 2000) + 3000;
    setTimeout(() => {
      setIsAnalyzing(false);
      
      const batchId = Math.random().toString(36).substr(2, 9);
      const newResults: VirtualAnalysisResult[] = [];
      
      // Simulate extracting 3-5 matches from the images
      const numMatches = Math.floor(Math.random() * 3) + 3;
      const teamNames = TEAMS_BY_LEAGUE[selectedLeague] || TEAMS_BY_LEAGUE['eng'];
      
      for (let i = 0; i < numMatches; i++) {
        const homeTeam = teamNames[Math.floor(Math.random() * teamNames.length)];
        let awayTeam = teamNames[Math.floor(Math.random() * teamNames.length)];
        while (awayTeam === homeTeam) {
          awayTeam = teamNames[Math.floor(Math.random() * teamNames.length)];
        }
        
        const isHotMatch = Math.random() > 0.7;
        const confidence = Math.floor(Math.random() * 20) + 75; // 75 to 95

        newResults.push({
          batchId,
          matchId: Math.random().toString(36).substr(2, 9),
          leagueId: selectedLeague,
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
      }

      const updatedResults = [...newResults, ...results];
      setResults(updatedResults);
      localStorage.setItem('virtualAnalyses', JSON.stringify(updatedResults));
    }, analysisTime);
  };

  const clearResults = () => {
    setResults([]);
    localStorage.removeItem('virtualAnalyses');
  };

  const handleCopy = (res: VirtualAnalysisResult) => {
    const text = `⚽ ${res.homeTeam} vs ${res.awayTeam}\n🕒 ${res.time}\n🏆 ${LEAGUES.find(l => l.id === res.leagueId)?.name}\n\n🎯 Pronostic: ${res.results.ft1x2}\n🔥 Confiance: ${res.confidence}%\n\n👉 Double Chance: ${res.results.dc}\n👉 O/U 2.5: ${res.results.ou25}\n👉 GG/NG: ${res.results.ggng}`;
    navigator.clipboard.writeText(text);
    setCopiedId(res.matchId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Load saved results on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('virtualAnalyses');
    if (saved) setResults(JSON.parse(saved));
  }, []);

  // Generate VIP Multiples
  const generateMultiples = () => {
    if (results.length < 2) return [];
    const multiples = [];
    const numMultiples = Math.floor(Math.random() * 11) + 10; // 10 to 20
    
    for (let i = 0; i < numMultiples; i++) {
      const numMatches = Math.floor(Math.random() * 3) + 2; // 2 to 4 matches per multiple
      const selectedMatches = [...results].sort(() => 0.5 - Math.random()).slice(0, numMatches);
      
      let totalOdds = 1;
      const picks = selectedMatches.map(m => {
        const odd = Number((Math.random() * 1.5 + 1.2).toFixed(2));
        totalOdds *= odd;
        return { match: `${m.homeTeam} vs ${m.awayTeam}`, pick: m.results.ft1x2, odd };
      });
      
      multiples.push({ id: i, picks, totalOdds: totalOdds.toFixed(2) });
    }
    return multiples;
  };

  // Generate Cote Boost
  const generateCoteBoost = () => {
    if (results.length === 0) return [];
    const boosts = [];
    const numBoosts = Math.floor(Math.random() * 3) + 1; // 1 to 3
    
    for (let i = 0; i < numBoosts; i++) {
      const match = results[Math.floor(Math.random() * results.length)];
      const isExtreme = Math.random() > 0.8; // 20% chance for 50+ or 100
      const odd = isExtreme ? (Math.random() > 0.5 ? 100 : Number((Math.random() * 30 + 50).toFixed(2))) : Number((Math.random() * 15 + 10).toFixed(2));
      
      boosts.push({
        id: i,
        match: `${match.homeTeam} vs ${match.awayTeam}`,
        pick: match.results.exactScore,
        type: 'Score Exact',
        odd: odd.toFixed(2)
      });
    }
    return boosts;
  };

  const multiples = React.useMemo(() => generateMultiples(), [results]);
  const coteBoosts = React.useMemo(() => generateCoteBoost(), [results]);

  return (
    <div className="space-y-6 relative">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-5">
          <div className="bg-[#2dd4bf]/20 p-1.5 rounded-full">
            <CheckCircle className="w-5 h-5 text-[#2dd4bf]" />
          </div>
          <p className="font-medium text-sm">{toastMessage}</p>
        </div>
      )}

      <div className="bg-[#1e293b] rounded-xl p-4 border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="bg-[#2dd4bf] text-slate-900 w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
          Historique (Upload)
        </h3>
        
        <div className="mb-4">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-800 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-3 text-slate-400" />
              <p className="mb-2 text-sm text-slate-400"><span className="font-semibold text-[#2dd4bf]">Cliquez</span> ou glissez vos images</p>
              <p className="text-xs text-slate-500">PNG, JPG (Max 5 images)</p>
            </div>
            <input type="file" className="hidden" multiple accept="image/png, image/jpeg" onChange={handleHistoryUpload} />
          </label>
        </div>

        {historyImages.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {historyImages.map((img, idx) => (
              <div key={idx} className="relative flex-shrink-0">
                <img src={img} alt={`History ${idx}`} className="w-20 h-20 object-cover rounded-lg border border-slate-700" />
                <button onClick={() => removeHistoryImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <button 
          onClick={handleSaveHistory}
          disabled={isSavingHistory || historyImages.length === 0}
          className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isSavingHistory ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isSavingHistory ? 'Analyse OCR en cours...' : 'Sauvegarder historique'}
        </button>
      </div>

      <div className="bg-[#1e293b] rounded-xl p-4 border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="bg-[#eab308] text-slate-900 w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
          Nouvelle Analyse (Upload Matchs)
        </h3>
        
        <div className="mb-4">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-800 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <ImageIcon className="w-8 h-8 mb-3 text-slate-400" />
              <p className="mb-2 text-sm text-slate-400"><span className="font-semibold text-[#eab308]">Uploadez</span> les matchs à analyser</p>
              <p className="text-xs text-slate-500">PNG, JPG (Max 5 images)</p>
            </div>
            <input type="file" className="hidden" multiple accept="image/png, image/jpeg" onChange={handleMatchUpload} />
          </label>
        </div>

        {matchImages.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {matchImages.map((img, idx) => (
              <div key={idx} className="relative flex-shrink-0">
                <img src={img} alt={`Match ${idx}`} className="w-20 h-20 object-cover rounded-lg border border-slate-700" />
                <button onClick={() => removeMatchImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3 mb-4">
          <select 
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#eab308] appearance-none"
          >
            {LEAGUES.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          <input
            type="time"
            value={matchTime}
            onChange={(e) => setMatchTime(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#eab308]"
          />
        </div>
        <button 
          onClick={handleAnalyze}
          disabled={isAnalyzing || userTokens <= 0 || matchImages.length === 0}
          className={`w-full font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            userTokens <= 0 
              ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
              : 'bg-[#eab308] hover:bg-[#ca8a04] text-slate-900'
          }`}
        >
          {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : userTokens <= 0 ? null : <Search className="w-5 h-5" />}
          {isAnalyzing ? 'Analyse IA en cours...' : userTokens <= 0 ? 'Tokens insuffisants' : 'Lancer l\'analyse (1 Token)'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Résultats d'Analyse</h3>
            <button onClick={clearResults} className="text-red-400 hover:text-red-300 flex items-center gap-1 text-sm">
              <Trash2 className="w-4 h-4" /> Effacer
            </button>
          </div>

          {/* COTE BOOST SECTION */}
          {coteBoosts.length > 0 && (
            <div className="bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-500/30 rounded-xl p-4">
              <h4 className="text-red-400 font-bold flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5" />
                COTE BOOST (Risque Élevé)
              </h4>
              <div className="space-y-2">
                {coteBoosts.map(boost => (
                  <div key={boost.id} className="bg-slate-900/50 p-3 rounded-lg flex justify-between items-center border border-red-500/20">
                    <div>
                      <div className="text-white font-bold text-sm">{boost.match}</div>
                      <div className="text-slate-400 text-xs">{boost.type}: <span className="text-[#eab308] font-bold">{boost.pick}</span></div>
                    </div>
                    <div className="bg-red-500/20 text-red-400 font-bold px-3 py-1 rounded border border-red-500/30">
                      {boost.odd}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MULTIPLE VIP SECTION */}
          {multiples.length > 0 && (
            <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 rounded-xl p-4">
              <h4 className="text-emerald-400 font-bold flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5" />
                MULTIPLE VIP
              </h4>
              <div className="space-y-3">
                {multiples.map(mult => (
                  <div key={mult.id} className="bg-slate-900/50 p-3 rounded-lg border border-emerald-500/20">
                    <div className="flex justify-between items-center mb-2 border-b border-slate-700/50 pb-2">
                      <span className="text-emerald-400 font-bold text-sm">Ticket #{mult.id + 1}</span>
                      <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded text-xs border border-emerald-500/30">
                        Cote: {mult.totalOdds}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {mult.picks.map((pick, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span className="text-slate-300 truncate pr-2">{pick.match}</span>
                          <span className="text-emerald-400 font-bold whitespace-nowrap">{pick.pick} ({pick.odd})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* INDIVIDUAL MATCH RESULTS */}
          <div className="space-y-4">
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

                  {/* COPY BUTTON */}
                  <div className="p-3 border-t border-slate-700/50 bg-slate-800/30">
                    <button
                      onClick={() => handleCopy(res)}
                      className="w-full py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      {copiedId === res.matchId ? (
                        <><CheckCircle className="w-4 h-4 text-[#2dd4bf]" /> Copié !</>
                      ) : (
                        <><Copy className="w-4 h-4" /> Copier le pronostic</>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

