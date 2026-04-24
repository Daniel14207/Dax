import React, { useState, useEffect } from 'react';
import { Activity, Clock, CheckCircle, Flame, Menu, History } from 'lucide-react';

export function ResultHistory() {
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const savedResults = localStorage.getItem('virtualAnalyses');
    if (savedResults) {
      try {
        setResults(JSON.parse(savedResults));
      } catch (e) {
        console.error("Failed to parse saved results", e);
      }
    }
  }, []);

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <Activity className="w-12 h-12 text-[var(--text-secondary)] mb-4" />
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Aucun historique</h2>
        <p className="text-[var(--text-secondary)] text-sm">Vos analyses précédentes apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[var(--input-bg)] p-2 rounded-xl active:scale-95 transition-transform">
          <History className="w-6 h-6 text-[var(--btn-primary)]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Historique des Résultats</h2>
          <p className="text-sm text-[var(--text-secondary)]">Consultez les résultats de vos matchs analysés.</p>
        </div>
      </div>

      {results.map((result, index) => (
        <div key={index} className="bg-[var(--card-bg)] rounded-2xl theme-shadow overflow-hidden border border-[var(--border-color)] shadow-lg relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-[var(--btn-primary)]"></div>
          
          {/* Header */}
          <div className="bg-[var(--input-bg)] opacity-50 px-4 py-2.5 flex justify-between items-center border-b border-[var(--border-color)]/50">
            <div className="flex items-center gap-1.5 bg-[var(--tab-bg)] px-2 py-1 rounded-md border border-[var(--border-color)]/50">
              <span className="text-[10px] font-bold text-[#D1D5DB] uppercase tracking-wider">{result.leagueId || 'COMPETITION'}</span>
            </div>
            <div className="text-[10px] text-[var(--text-secondary)] font-bold">{new Date(result.timestamp || Date.now()).toLocaleString('fr-FR')}</div>
          </div>

          {/* Match Teams */}
          <div className="px-4 py-3 flex items-center justify-center gap-3">
            <span className="font-bold text-[var(--text-primary)] text-sm text-right flex-1">{result.homeTeam}</span>
            <span className="text-[10px] font-black text-[var(--text-secondary)] bg-[var(--input-bg)] px-2 py-0.5 rounded-full">VS</span>
            <span className="font-bold text-[var(--text-primary)] text-sm text-left flex-1">{result.awayTeam}</span>
          </div>

          {/* Odds */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Activity className="w-3 h-3 text-[var(--text-secondary)]" />
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Cotes (Extraites)</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-[var(--tab-bg)] rounded-xl active:scale-95 transition-transform p-2 flex justify-between items-center border border-[var(--border-color)]/50">
                <span className="text-[10px] text-[var(--text-secondary)] font-bold">1</span>
                <span className="text-xs font-bold text-[var(--text-primary)]">{result.extractedOdds?.home?.toFixed(2) || '-'}</span>
              </div>
              <div className="flex-1 bg-[var(--tab-bg)] rounded-xl active:scale-95 transition-transform p-2 flex justify-between items-center border border-[var(--border-color)]/50">
                <span className="text-[10px] text-[var(--text-secondary)] font-bold">X</span>
                <span className="text-xs font-bold text-[var(--text-primary)]">{result.extractedOdds?.draw?.toFixed(2) || '-'}</span>
              </div>
              <div className="flex-1 bg-[var(--tab-bg)] rounded-xl active:scale-95 transition-transform p-2 flex justify-between items-center border border-[var(--border-color)]/50">
                <span className="text-[10px] text-[var(--text-secondary)] font-bold">2</span>
                <span className="text-xs font-bold text-[var(--text-primary)]">{result.extractedOdds?.away?.toFixed(2) || '-'}</span>
              </div>
            </div>
          </div>

          {/* Prediction & Details */}
          <div className="bg-[var(--input-bg)] opacity-30 p-4 border-t border-[var(--border-color)]/50">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle className="w-3.5 h-3.5 text-[var(--btn-primary)]" />
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Pronostic</span>
                </div>
                <div className="text-lg font-black text-[var(--text-primary)] bg-[var(--btn-primary)]/10 px-3 py-1 rounded-xl active:scale-95 transition-transform border border-[var(--input-focus)]/20 inline-block">
                  {result.results?.ft1x2 || '-'}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end mb-1">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Confiance</span>
                </div>
                <div className={`text-lg font-black ${(result.confidence || 0) >= 85 ? 'text-[var(--btn-primary)]' : 'text-[var(--btn-primary)]'}`}>
                  {result.confidence || 0}%
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Menu className="w-3 h-3 text-[var(--text-secondary)]" />
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Détails</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[var(--tab-bg)] px-2.5 py-1.5 rounded-md border border-[var(--border-color)]/30 flex justify-between items-center">
                  <span className="text-[10px] text-[var(--text-secondary)]">Double Chance</span>
                  <span className="text-[11px] font-bold text-[#D1D5DB]">{result.results?.dc || '-'}</span>
                </div>
                <div className="bg-[var(--tab-bg)] px-2.5 py-1.5 rounded-md border border-[var(--border-color)]/30 flex justify-between items-center">
                  <span className="text-[10px] text-[var(--text-secondary)]">O/U 2.5</span>
                  <span className="text-[11px] font-bold text-[#D1D5DB]">{result.results?.ou25 || '-'}</span>
                </div>
                <div className="bg-[var(--tab-bg)] px-2.5 py-1.5 rounded-md border border-[var(--border-color)]/30 flex justify-between items-center col-span-2">
                  <span className="text-[10px] text-[var(--text-secondary)]">GG/NG</span>
                  <span className="text-[11px] font-bold text-[#D1D5DB]">{result.results?.ggng || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
