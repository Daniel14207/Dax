import React, { useState, useEffect } from 'react';
import { AviatorRound } from '../types';
import { Search, Loader2, Trash2, Plane, ShieldCheck, Gem } from 'lucide-react';
import { TutorialCard } from './TutorialCard';

interface Props {
  userTokens: number;
  onAnalyze: (amount: number) => void;
  isVip?: boolean;
}

export default function AviatorSystem({ userTokens, onAnalyze, isVip = false }: Props) {
  const [historyText, setHistoryText] = useState('');
  const [startTime, setStartTime] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [rounds, setRounds] = useState<AviatorRound[]>([]);

  if (isVip && userTokens < 10000) {
    return (
      <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl p-6 text-center">
        <ShieldCheck className="w-12 h-12 text-[#EF4444] mx-auto mb-4" />
        <h3 className="text-lg font-bold text-[#B91C1C] mb-2">Accès Refusé</h3>
        <p className="text-[#DC2626] font-medium">Mila 10,000 tokens farafahakeliny ianao vao afaka miditra eto amin'ny VIP.</p>
      </div>
    );
  }

  const handleAnalyze = () => {
    if (userTokens < 500) {
      alert('Tokens insuffisants');
      return;
    }
    if (!historyText.trim() || !startTime.trim()) {
      alert('Veuillez remplir l\'historique et l\'heure de départ.');
      return;
    }

    try {
      onAnalyze(500); // Deduct token
      setIsAnalyzing(true);

      // Simulate 5s analysis
      setTimeout(() => {
        try {
          const generatedRounds: AviatorRound[] = [];
          const [startH, startM] = startTime.split(':').map(Number);
          
          let currentH = startH;
          let currentM = startM;
          
          // Generate for 4 hours (240 minutes)
          for (let i = 0; i < 240; i++) {
            const randomSeconds = Math.floor(Math.random() * 60);
            const timeStr = `${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}:${randomSeconds.toString().padStart(2, '0')}`;
            
            // Pause logic: if time is 22:30 to 22:34, skip generation but increment time
            if (currentH === 22 && currentM >= 30 && currentM < 35) {
              // Pause 5 mins
            } else {
              // Generate realistic multipliers
              let m1 = 0;
              let m2 = 0;
              let risk = 0;
              
              const rand = Math.random();
              if (rand < 0.5) {
                // 50% chance of 1.00 - 1.99
                m1 = Number((Math.random() * 0.99 + 1.00).toFixed(2));
                m2 = Number((Math.random() * 0.99 + 1.00).toFixed(2));
                risk = Number((Math.random() * 2 + 1).toFixed(2));
              } else if (rand < 0.8) {
                // 30% chance of 2.00 - 4.99
                m1 = Number((Math.random() * 2.99 + 2.00).toFixed(2));
                m2 = Number((Math.random() * 2.99 + 2.00).toFixed(2));
                risk = Number((Math.random() * 5 + 3).toFixed(2));
              } else if (rand < 0.95) {
                // 15% chance of 5.00 - 49.99
                m1 = Number((Math.random() * 44.99 + 5.00).toFixed(2));
                m2 = Number((Math.random() * 44.99 + 5.00).toFixed(2));
                risk = Number((Math.random() * 20 + 10).toFixed(2));
              } else {
                // 5% chance of 50+
                m1 = Number((Math.random() * 50 + 50.00).toFixed(2));
                m2 = Number((Math.random() * 50 + 50.00).toFixed(2));
                risk = Number((Math.random() * 50 + 50).toFixed(2));
              }

              generatedRounds.push({
                time: timeStr,
                multiplier1: m1,
                multiplier2: m2,
                risk: risk
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
        } catch (err) {
          console.error(err);
          alert("Erreur analyse, jereo tsara ny format texte na sary");
        } finally {
          setIsAnalyzing(false);
        }
      }, 5000);
    } catch (err) {
      console.error(err);
      alert("Erreur analyse, jereo tsara ny format texte na sary");
      setIsAnalyzing(false);
    }
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

  const getColorClass = (multiplier: number) => {
    if (multiplier >= 1.00 && multiplier <= 1.99) return 'text-blue-500';
    if (multiplier >= 2.00 && multiplier <= 4.99) return 'text-purple-500';
    if (multiplier >= 5.00 && multiplier <= 49.99) return 'text-[#EF4444]';
    if (multiplier >= 50) return 'text-[#22C55E]';
    return 'text-[#D1D5DB]';
  };

  return (
    <div className="space-y-6">
      <TutorialCard 
        title="Ahoana ny fampiasana Aviator Analyse"
        content={
          <ul className="list-disc pl-5 space-y-1">
            <li>Ampidiro ny historique farany an'ny Aviator</li>
            <li>Ampidiro ny ora nanombohana (Heure de départ)</li>
            <li>Tsindrio ny "Lancer l'analyse"</li>
          </ul>
        }
        explanation={
          <ul className="list-disc pl-5 space-y-1">
            <li>Ny système dia hamakafaka ny pattern ary hanome ny prédiction ho an'ny ora manaraka</li>
          </ul>
        }
      />

      <div className="bg-[var(--card-bg)] rounded-2xl theme-shadow p-4 border border-[var(--border-color)]">
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Plane className="w-5 h-5 text-[#EF4444]" />
          Analyse Aviator (4 Heures) {isVip && <span className="text-[var(--btn-primary)] text-sm ml-2">(VIP MODE)</span>}
        </h3>
        <div className="space-y-3 mb-4">
          <textarea
            value={historyText}
            onChange={(e) => setHistoryText(e.target.value)}
            placeholder="Collez les derniers tours (ex: 2.13, 1.45, 5.56...)"
            className="w-full h-24 bg-[var(--tab-bg)] border border-[var(--border-color)] rounded-xl p-3 text-[var(--text-primary)] focus:outline-none focus:border-[#EF4444] transition-colors"
          />
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full bg-[var(--tab-bg)] border border-[var(--border-color)] rounded-xl p-3 text-[var(--text-primary)] focus:outline-none focus:border-[#EF4444] transition-colors"
          />
        </div>
        <button 
          onClick={handleAnalyze}
          disabled={isAnalyzing || userTokens < 500}
          className={`w-full font-bold py-3 rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            userTokens < 500 
              ? 'bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444]' 
              : 'bg-[#EF4444] hover:bg-[#DC2626] text-[var(--text-primary)] shadow-sm'
          }`}
        >
          {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : userTokens < 500 ? null : <Search className="w-5 h-5" />}
          {isAnalyzing ? 'Analyse en cours (5s)...' : userTokens < 500 ? 'Tokens insuffisants' : 'Générer les prédictions (500 Tokens)'}
        </button>
      </div>

      {rounds.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Prédictions Aviator</h3>
            <button onClick={clearResults} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 text-sm font-medium">
              <Trash2 className="w-4 h-4" /> Effacer
            </button>
          </div>
          
          <div className="bg-[var(--card-bg)] rounded-2xl theme-shadow overflow-hidden border border-[var(--border-color)]">
            <div className="grid grid-cols-4 bg-[var(--tab-bg)] p-3 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">
              <div>Heure</div>
              <div className="text-center">Cote 1</div>
              <div className="text-center">Cote 2</div>
              <div className="text-right">Risque</div>
            </div>
            <div className="max-h-[500px] overflow-y-auto hide-scrollbar divide-y divide-[#E5E7EB]">
              {rounds.map((round, idx) => {
                const isHighRisk = round.multiplier1 > 10 || round.multiplier2 > 10;
                const isSafe = round.multiplier1 >= 1.5 && round.multiplier1 <= 2.0;
                
                let riskLevel = 'LOW';
                let riskColor = 'text-[#22C55E]';
                if (round.risk > 10) {
                  riskLevel = 'HIGH';
                  riskColor = 'text-[#EF4444]';
                } else if (round.risk > 3) {
                  riskLevel = 'MEDIUM';
                  riskColor = 'text-[#F59E0B]';
                }

                return (
                  <div key={idx} className={`p-3 text-sm hover:bg-[var(--tab-bg)] transition-colors ${isVip && isHighRisk ? 'bg-orange-50' : ''}`}>
                    <div className="grid grid-cols-4 items-center">
                      <div className="font-mono text-[var(--text-secondary)]">{round.time}</div>
                      <div className={`text-center font-bold ${getColorClass(round.multiplier1)}`}>{round.multiplier1.toFixed(2)}x</div>
                      <div className={`text-center font-bold ${getColorClass(round.multiplier2)}`}>{round.multiplier2.toFixed(2)}x</div>
                      <div className={`text-right font-bold ${getColorClass(round.risk)}`}>{round.risk.toFixed(2)}x</div>
                    </div>
                    
                    {isVip && (
                      <div className="mt-3 pt-3 border-t border-[var(--border-color)] space-y-2">
                        <div className="flex items-center gap-2 text-[var(--btn-primary)] text-xs font-bold mb-1">
                          <Gem className="w-3 h-3" /> VIP PATTERN DETECTED
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-[var(--tab-bg)] p-2 rounded-lg border border-[var(--border-color)]">
                            <span className="text-[var(--text-secondary)] block mb-1">Entry Timing:</span>
                            <span className="text-[var(--text-primary)] font-medium">{round.time}</span>
                          </div>
                          <div className="bg-[var(--tab-bg)] p-2 rounded-lg border border-[var(--border-color)]">
                            <span className="text-[var(--text-secondary)] block mb-1">Exit Timing:</span>
                            <span className="text-[var(--text-primary)] font-medium">+{Math.floor(Math.random() * 15 + 5)}s</span>
                          </div>
                          <div className="bg-[var(--tab-bg)] p-2 rounded-lg border border-[var(--border-color)] col-span-2">
                            <span className="text-[var(--text-secondary)] block mb-1">Risk Level:</span>
                            <span className={`font-bold ${riskColor}`}>{riskLevel}</span>
                          </div>
                          <div className="bg-[var(--tab-bg)] p-2 rounded-lg border border-[var(--border-color)] col-span-2">
                            <span className="text-[var(--text-secondary)] block mb-1">Crash Range:</span>
                            <span className="text-[var(--text-primary)] font-medium">
                              {Math.max(1.00, round.multiplier1 - 0.5).toFixed(2)}x - {(round.multiplier1 + 1.5).toFixed(2)}x
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
