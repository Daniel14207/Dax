import React, { useState } from 'react';
import { Loader2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { TutorialCard } from './TutorialCard';

interface ParsedMatch {
  home: string;
  away: string;
  odds: [number, number, number];
}

interface TicketMatch {
  home: string;
  away: string;
  pick: string;
  odd: number;
}

interface Ticket {
  id: string;
  matches: TicketMatch[];
  totalOdd: number;
}

interface MultipleGeneratorProps {
  userTokens?: number;
  onAnalyze?: (amount: number) => void;
  isVip?: boolean;
}

export function MultipleGenerator({ userTokens = 0, onAnalyze, isVip = false }: MultipleGeneratorProps) {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState<string | null>(null);

  const parseMatches = (text: string): ParsedMatch[] => {
    const matches: ParsedMatch[] = [];
    const lines = text.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      const matchRegex = /^(.*?)\s+vs\.?\s+(.*?)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)$/i;
      const m = trimmed.match(matchRegex);
      if (m) {
        matches.push({
          home: m[1].trim(),
          away: m[2].trim(),
          odds: [parseFloat(m[3]), parseFloat(m[4]), parseFloat(m[5])]
        });
      }
    }
    return matches;
  };

  const getBestPick = (odds: [number, number, number], isVipMode: boolean) => {
    const [home, draw, away] = odds;
    const options = [
      { pick: '1', odd: home },
      { pick: 'X', odd: draw },
      { pick: '2', odd: away },
    ];
    
    options.sort((a, b) => a.odd - b.odd);
    
    if (isVipMode) {
      // VIP: higher probability, smarter grouping. 
      // 85% chance of picking the absolute favorite, 15% chance of picking the second best (medium risk)
      const rand = Math.random();
      if (rand < 0.85) return options[0];
      return options[1];
    } else {
      const rand = Math.random();
      if (rand < 0.6) return options[0];
      if (rand < 0.9) return options[1];
      return options[2];
    }
  };

  const generateTickets = async () => {
    setError(null);
    
    if (userTokens < 500) {
      setError("Fonds insuffisants. 500 tokens requis.");
      return;
    }

    const parsedMatches = parseMatches(inputText);
    if (parsedMatches.length < 3) {
      setError("Veuillez insérer au moins 3 matchs valides au format: Equipe A vs Equipe B 1.50 3.20 4.10");
      return;
    }

    setIsGenerating(true);

    // Simulate analysis time (max 10 seconds, let's do 2-3 seconds for UX)
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Deduct tokens
    if (onAnalyze) {
      onAnalyze(500);
    }

    const numTickets = isVip ? 10 : (Math.floor(Math.random() * 11) + 10); // VIP generates exactly 10 premium tickets
    const newTickets: Ticket[] = [];

    for (let i = 0; i < numTickets; i++) {
      // Shuffle parsed matches
      const shuffled = [...parsedMatches].sort(() => 0.5 - Math.random());
      const selectedMatches = shuffled.slice(0, 3); // EXACTLY 3 MATCHES
      
      const ticketMatches: TicketMatch[] = [];
      let totalOdd = 1;

      for (const match of selectedMatches) {
        const pick = getBestPick(match.odds, isVip);
        ticketMatches.push({
          home: match.home,
          away: match.away,
          pick: pick.pick,
          odd: pick.odd
        });
        totalOdd *= pick.odd;
      }

      newTickets.push({
        id: Math.random().toString(36).substring(2, 8).toUpperCase(),
        matches: ticketMatches,
        totalOdd: Number(totalOdd.toFixed(2))
      });
    }

    setTickets(newTickets);
    setIsGenerating(false);
  };

  const copyToClipboard = (ticket: Ticket) => {
    const text = `Ticket #${ticket.id}\n\n` + 
      ticket.matches.map((m, i) => `Match ${i + 1}:\n${m.home} vs ${m.away}\n→ Pick: ${m.pick}\n→ Odd: ${m.odd.toFixed(2)}`).join('\n\n') +
      `\n\n💰 Total Odds: ${ticket.totalOdd.toFixed(2)}`;
    
    navigator.clipboard.writeText(text);
    alert('Ticket copié !');
  };

  return (
    <div className="space-y-4 p-4">
      <TutorialCard 
        title="Ahoana ny fampidirana texte (Multiple)"
        content={
          <ul className="list-disc pl-5 space-y-1">
            <li>Ampidiro eto ny match amin'ny format:<br/><code>Ekipa1 vs Ekipa2 cote1 coteX cote2</code></li>
            <li>Ohatra:<br/><code>Mozambique vs Zambia 4.38 2.15 2.72</code></li>
          </ul>
        }
        explanation={
          <ul className="list-disc pl-5 space-y-1">
            <li>Tsy tokony hisy diso ny anaran'ny équipe</li>
            <li>Tsy tokony hiova ny ordre</li>
            <li>Ny cote dia tsy maintsy 3 (1 / X / 2)</li>
          </ul>
        }
      />

      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Générateur de Multiples</h3>
        <p className="text-sm text-slate-600 mb-4">Insérez vos matchs au format :<br/><code>Equipe A vs Equipe B 1.50 3.20 4.10</code></p>
        
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Mozambique vs Zambia 4.38 2.15 2.72&#10;Burkina Faso vs South Africa 2.20 3.69 2.98&#10;Morocco vs Botswana 1.22 5.06 23.18"
          className="w-full h-32 bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 text-sm focus:outline-none focus:border-[#eab308] mb-4 font-mono"
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button 
          onClick={generateTickets}
          disabled={isGenerating}
          className="w-full bg-[#eab308] hover:bg-[#ca8a04] disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          {isGenerating ? 'Analyse en cours...' : 'Générer (500 Tokens)'}
        </button>
      </div>

      {tickets.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#2dd4bf]" />
            Tickets Générés ({tickets.length})
          </h4>
          
          <div className="grid grid-cols-1 gap-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-900">Ticket #{ticket.id}</span>
                  <div className="bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                    <span className="text-slate-500 text-xs mr-1">Cote Totale:</span>
                    <span className="text-[#eab308] font-bold">{ticket.totalOdd.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="divide-y divide-slate-100">
                  {ticket.matches.map((match, idx) => (
                    <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">Match {idx + 1}</div>
                      <div className="font-medium text-slate-900 mb-2">{match.home} <span className="text-slate-400 mx-1">vs</span> {match.away}</div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-sm">Pick:</span>
                          <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded border border-slate-200">{match.pick}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-sm">Odd:</span>
                          <span className="font-bold text-[#eab308]">{match.odd.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-3 bg-slate-50 border-t border-slate-200">
                  <button 
                    onClick={() => copyToClipboard(ticket)}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Copier le code
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
