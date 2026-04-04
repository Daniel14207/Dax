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
        <Activity className="w-12 h-12 text-slate-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Aucun historique</h2>
        <p className="text-slate-400 text-sm">Vos analyses précédentes apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-slate-800 p-2 rounded-lg">
          <History className="w-6 h-6 text-[#eab308]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Historique des Résultats</h2>
          <p className="text-sm text-slate-400">Consultez les résultats de vos matchs analysés.</p>
        </div>
      </div>

      {results.map((result, index) => (
        <div key={index} className="bg-[#1e293b] rounded-xl overflow-hidden border border-slate-800 shadow-lg relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
          
          {/* Header */}
          <div className="bg-slate-800/50 px-4 py-2.5 flex justify-between items-center border-b border-slate-700/50">
            <div className="flex items-center gap-1.5 bg-slate-900/50 px-2 py-1 rounded-md border border-slate-700/50">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{result.leagueId || 'COMPETITION'}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-bold">{new Date(result.timestamp || Date.now()).toLocaleString('fr-FR')}</div>
          </div>

          {/* Match Teams */}
          <div className="px-4 py-3 flex items-center justify-center gap-3">
            <span className="font-bold text-white text-sm text-right flex-1">{result.homeTeam}</span>
            <span className="text-[10px] font-black text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">VS</span>
            <span className="font-bold text-white text-sm text-left flex-1">{result.awayTeam}</span>
          </div>

          {/* Odds */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Activity className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cotes (Extraites)</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-slate-900/50 rounded-lg p-2 flex justify-between items-center border border-slate-700/50">
                <span className="text-[10px] text-slate-500 font-bold">1</span>
                <span className="text-xs font-bold text-white">{result.extractedOdds?.home?.toFixed(2) || '-'}</span>
              </div>
              <div className="flex-1 bg-slate-900/50 rounded-lg p-2 flex justify-between items-center border border-slate-700/50">
                <span className="text-[10px] text-slate-500 font-bold">X</span>
                <span className="text-xs font-bold text-white">{result.extractedOdds?.draw?.toFixed(2) || '-'}</span>
              </div>
              <div className="flex-1 bg-slate-900/50 rounded-lg p-2 flex justify-between items-center border border-slate-700/50">
                <span className="text-[10px] text-slate-500 font-bold">2</span>
                <span className="text-xs font-bold text-white">{result.extractedOdds?.away?.toFixed(2) || '-'}</span>
              </div>
            </div>
          </div>

          {/* Prediction & Details */}
          <div className="bg-slate-800/30 p-4 border-t border-slate-700/50">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pronostic</span>
                </div>
                <div className="text-lg font-black text-white bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 inline-block">
                  {result.results?.ft1x2 || '-'}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end mb-1">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confiance</span>
                </div>
                <div className={`text-lg font-black ${(result.confidence || 0) >= 85 ? 'text-[#2dd4bf]' : 'text-amber-500'}`}>
                  {result.confidence || 0}%
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Menu className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Détails</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-900/50 px-2.5 py-1.5 rounded-md border border-slate-700/30 flex justify-between items-center">
                  <span className="text-[10px] text-slate-500">Double Chance</span>
                  <span className="text-[11px] font-bold text-slate-300">{result.results?.dc || '-'}</span>
                </div>
                <div className="bg-slate-900/50 px-2.5 py-1.5 rounded-md border border-slate-700/30 flex justify-between items-center">
                  <span className="text-[10px] text-slate-500">O/U 2.5</span>
                  <span className="text-[11px] font-bold text-slate-300">{result.results?.ou25 || '-'}</span>
                </div>
                <div className="bg-slate-900/50 px-2.5 py-1.5 rounded-md border border-slate-700/30 flex justify-between items-center col-span-2">
                  <span className="text-[10px] text-slate-500">GG/NG</span>
                  <span className="text-[11px] font-bold text-slate-300">{result.results?.ggng || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
