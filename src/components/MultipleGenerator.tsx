import React, { useState } from 'react';
import { Loader2, RefreshCw, CheckCircle, AlertCircle, Copy } from 'lucide-react';
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
      
      const matchRegex = /^(.*?)\s+(?:vs|v|-|\/)\s+(.*?)\s+(\d+(?:[.,]\d+)?)\s*(?:X|-)?\s*(\d+(?:[.,]\d+)?)\s*(?:2|-)?\s*(\d+(?:[.,]\d+)?)\s*$/i;
      const m = trimmed.match(matchRegex);
      if (m) {
        matches.push({
          home: m[1].trim(),
          away: m[2].trim(),
          odds: [parseFloat(m[3].replace(',', '.')), parseFloat(m[4].replace(',', '.')), parseFloat(m[5].replace(',', '.'))]
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

    try {
      const parsedMatches = parseMatches(inputText);
      if (parsedMatches.length < 2) {
        setError("Veuillez insérer au moins 2 matchs valides au format: Equipe A vs Equipe B 1.50 3.20 4.10");
        return;
      }

      setIsGenerating(true);

      // Simulate analysis time (max 10 seconds, let's do 2-3 seconds for UX)
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Deduct tokens
      if (onAnalyze) {
        onAnalyze(500);
      }

      const numTickets = 10; // EXACTLY 10 TICKETS
      const newTickets: Ticket[] = [];

      for (let i = 0; i < numTickets; i++) {
        // Shuffle parsed matches
        const shuffled = [...parsedMatches].sort(() => 0.5 - Math.random());
        const selectedMatches = shuffled.slice(0, 2); // EXACTLY 2 MATCHES
        
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
          id: (i + 1).toString(),
          matches: ticketMatches,
          totalOdd: Number(totalOdd.toFixed(2))
        });
      }

      setTickets(newTickets);
    } catch (err) {
      console.error(err);
      setError("Erreur analyse, jereo tsara ny format texte na sary");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (ticket: Ticket) => {
    const text = `MULTIPLE ${ticket.id}\n` + 
      ticket.matches.map(m => `${m.home} vs ${m.away} → ${m.pick}`).join('\n');
    
    navigator.clipboard.writeText(text);
    alert('Ticket copié !');
  };

  const copyAllToClipboard = () => {
    const text = tickets.map((ticket) => {
      return `MULTIPLE ${ticket.id}\n` + 
        ticket.matches.map(m => `${m.home} vs ${m.away} → ${m.pick}`).join('\n');
    }).join('\n\n');
    
    navigator.clipboard.writeText(text);
    alert('Tous les tickets copiés !');
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

      <div className="bg-[var(--card-bg)] rounded-2xl theme-shadow p-4 border border-[var(--border-color)] shadow-sm">
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Générateur de Multiples</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">Insérez vos matchs au format :<br/><code>Equipe A vs Equipe B 1.50 3.20 4.10</code></p>
        
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Mozambique vs Zambia 4.38 2.15 2.72&#10;Burkina Faso vs South Africa 2.20 3.69 2.98&#10;Morocco vs Botswana 1.22 5.06 23.18"
          className="w-full h-32 bg-[var(--tab-bg)] border border-[var(--border-color)] rounded-xl p-3 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--input-focus)] mb-4 font-mono transition-colors"
        />

        {error && (
          <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl p-3 mb-4 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
            <p className="text-sm text-[#DC2626]">{error}</p>
          </div>
        )}

        <button 
          onClick={generateTickets}
          disabled={isGenerating}
          className="w-full bg-[var(--btn-primary)] hover:bg-[var(--btn-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text-primary)] font-bold py-3 rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          {isGenerating ? 'Analyse en cours...' : 'Générer (500 Tokens)'}
        </button>
      </div>

      {tickets.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#22C55E]" />
              Tickets Générés ({tickets.length})
            </h4>
            <button 
              onClick={copyAllToClipboard}
              className="px-4 py-2 bg-[var(--tab-bg)] hover:bg-[var(--border-color)] text-[var(--text-primary)] text-sm font-bold rounded-xl active:scale-95 transition-transform flex items-center gap-2"
            >
              <Copy className="w-4 h-4" /> COPY ALL
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="bg-[var(--card-bg)] rounded-2xl theme-shadow border border-[var(--border-color)] overflow-hidden">
                <div className="bg-[var(--tab-bg)] px-4 py-3 border-b border-[var(--border-color)] flex justify-between items-center">
                  <span className="font-bold text-[var(--text-primary)]">MULTIPLE {ticket.id}</span>
                </div>
                
                <div className="divide-y divide-[#E5E7EB]">
                  {ticket.matches.map((match, idx) => (
                    <div key={idx} className="p-4 hover:bg-[var(--tab-bg)] transition-colors flex justify-between items-center">
                      <div className="font-medium text-[var(--text-primary)]">{match.home} <span className="text-[var(--text-secondary)] mx-1">vs</span> {match.away}</div>
                      <span className="font-bold text-[var(--text-primary)] bg-[var(--btn-primary)] px-3 py-1 rounded-lg shadow-sm">{match.pick}</span>
                    </div>
                  ))}
                </div>
                
                <div className="p-3 bg-[var(--tab-bg)] border-t border-[var(--border-color)]">
                  <button 
                    onClick={() => copyToClipboard(ticket)}
                    className="w-full py-2.5 bg-[var(--tab-bg)] hover:bg-[var(--border-color)] text-[var(--text-primary)] text-sm font-bold rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copier le code
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
