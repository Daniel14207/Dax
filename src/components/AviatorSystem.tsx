import React, { useState, useEffect } from 'react';
import { AviatorRound } from '../types';
import { Search, Loader2, Trash2, Plane } from 'lucide-react';

interface Props {
  userTokens: number;
  onAnalyze: () => void;
}

export default function AviatorSystem({ userTokens, onAnalyze }: Props) {
  const [historyText, setHistoryText] = useState('');
  const [startTime, setStartTime] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [rounds, setRounds] = useState<AviatorRound[]>([]);

  const handleAnalyze = () => {
    if (userTokens <= 0) {
      alert('❌ Analyse bloquée : Vous n\'avez pas assez de tokens.');
      return;
    }
    if (!historyText.trim() || !startTime.trim()) {
      alert('Veuillez remplir l\'historique et l\'heure de départ.');
      return;
    }

    const confirm = window.confirm('Cette analyse coûte 1 token. Voulez-vous continuer ?');
    if (!confirm) return;

    onAnalyze(); // Deduct token
    setIsAnalyzing(true);

    // Simulate 5s analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      
      const generatedRounds: AviatorRound[] = [];
      const [startH, startM] = startTime.split(':').map(Number);
      
      let currentH = startH;
      let currentM = startM;
      
      // Generate for 4 hours (240 minutes)
      for (let i = 0; i < 240; i++) {
        const timeStr = `${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`;
        
        // Pause logic: if time is 22:30 to 22:34, skip generation but increment time
        if (currentH === 22 && currentM >= 30 && currentM < 35) {
          // Pause 5 mins
        } else {
          generatedRounds.push({
            time: timeStr,
            multiplier1: Number((Math.random() * 5 + 1).toFixed(2)),
            multiplier2: Number((Math.random() * 3 + 1).toFixed(2)),
            risk: Number((Math.random() * 10 + 2).toFixed(2))
          });
        }
        
        currentM++;
        if (currentM >= 60) {
          currentM = 0;
          currentH = (currentH + 1) % 24;
        }
      }

      setRounds(generatedRounds);
      localStorage.setItem('aviatorAnalyses', JSON.stringify(generatedRounds));
    }, 5000);
  };

  const clearResults = () => {
    setRounds([]);
    localStorage.removeItem('aviatorAnalyses');
  };

  // Load saved results on mount
  useEffect(() => {
    const saved = localStorage.getItem('aviatorAnalyses');
    if (saved) setRounds(JSON.parse(saved));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-[#1e293b] rounded-xl p-4 border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Plane className="w-5 h-5 text-red-500" />
          Analyse Aviator (4 Heures)
        </h3>
        <div className="space-y-3 mb-4">
          <textarea
            value={historyText}
            onChange={(e) => setHistoryText(e.target.value)}
            placeholder="Collez les derniers tours (ex: 2.13, 1.45, 5.56...)"
            className="w-full h-24 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-500"
          />
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-500"
          />
        </div>
        <button 
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          {isAnalyzing ? 'Analyse en cours (5s)...' : 'Générer les prédictions (1 Token)'}
        </button>
      </div>

      {rounds.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Prédictions Aviator</h3>
            <button onClick={clearResults} className="text-slate-400 hover:text-slate-300 flex items-center gap-1 text-sm">
              <Trash2 className="w-4 h-4" /> Effacer
            </button>
          </div>
          
          <div className="bg-[#1e293b] rounded-xl overflow-hidden border border-slate-800">
            <div className="grid grid-cols-4 bg-slate-800 p-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <div>Heure</div>
              <div className="text-center">Cote 1</div>
              <div className="text-center">Cote 2</div>
              <div className="text-right">Risque</div>
            </div>
            <div className="max-h-[500px] overflow-y-auto hide-scrollbar">
              {rounds.map((round, idx) => (
                <div key={idx} className="grid grid-cols-4 p-3 border-b border-slate-800/50 text-sm items-center hover:bg-slate-800/30 transition-colors">
                  <div className="font-mono text-slate-300">{round.time}</div>
                  <div className="text-center font-bold text-[#2dd4bf]">{round.multiplier1.toFixed(2)}x</div>
                  <div className="text-center font-bold text-[#eab308]">{round.multiplier2.toFixed(2)}x</div>
                  <div className="text-right font-bold text-red-400">{round.risk.toFixed(2)}x</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
