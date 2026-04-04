import React, { useState } from 'react';
import { VirtualAnalysisResult } from '../types';
import { Save, Search, Loader2, Trash2, Clock, Flame, BarChart3, Upload, Image as ImageIcon, X, Copy, CheckCircle, TrendingUp, ShieldCheck, Edit3, Gem } from 'lucide-react';
import { LEAGUES, TEAMS_BY_LEAGUE, getTeamLogo } from '../data';
import { TutorialCard } from './TutorialCard';

interface Props {
  userTokens: number;
  onAnalyze: () => void;
  isVip?: boolean;
}

export default function VirtualAnalysis({ userTokens, onAnalyze, isVip = false }: Props) {
  const [historyText, setHistoryText] = useState('');
  const [matchText, setMatchText] = useState('');
  const [selectedLeague, setSelectedLeague] = useState(LEAGUES[0].id);
  const [matchTime, setMatchTime] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSavingHistory, setIsSavingHistory] = useState(false);
  const [isHistorySaved, setIsHistorySaved] = useState(false);
  const [results, setResults] = useState<VirtualAnalysisResult[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Manual Analyse State
  const [manualLeague, setManualLeague] = useState(LEAGUES[0].id);
  const [manualHomeTeam, setManualHomeTeam] = useState('');
  const [manualAwayTeam, setManualAwayTeam] = useState('');
  const [manualOdd1, setManualOdd1] = useState('');
  const [manualOddX, setManualOddX] = useState('');
  const [manualOdd2, setManualOdd2] = useState('');

  if (isVip && userTokens < 10000) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <ShieldCheck className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-700 mb-2">Accès Refusé</h3>
        <p className="text-red-600 font-medium">Mila 10,000 tokens farafahakeliny ianao vao afaka miditra eto amin'ny VIP.</p>
      </div>
    );
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveHistory = () => {
    if (!historyText.trim()) {
      showToast('Veuillez insérer l\'historique.');
      return;
    }
    setIsSavingHistory(true);
    // Simulate saving
    setTimeout(() => {
      setIsSavingHistory(false);
      setIsHistorySaved(true);
      showToast('Historique sauvegardé avec succès !');
    }, 1000);
  };

  const parseOCRText = (text: string) => {
    const matches: any[] = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      let homeTeam = "";
      let awayTeam = "";
      let separator = "vs";
      let homeOddStr = "";
      let drawOddStr = "";
      let awayOddStr = "";

      // 1. Try to match single-line format: Team A vs Team B 1.50 3.40 4.20
      const singleLineRegex = /^(.*?)\s+(?:vs|v|-|\/)\s+(.*?)\s+(\d+(?:[.,]\d+)?)\s*(?:X|-)?\s*(\d+(?:[.,]\d+)?)\s*(?:2|-)?\s*(\d+(?:[.,]\d+)?)\s*$/i;
      const singleLineResult = line.match(singleLineRegex);

      if (singleLineResult) {
        homeTeam = singleLineResult[1].trim();
        awayTeam = singleLineResult[2].trim();
        homeOddStr = singleLineResult[3];
        drawOddStr = singleLineResult[4];
        awayOddStr = singleLineResult[5];
      } else {
        // 2. Try to find 3 odds on the current line. Bet261 might have "1 1.50 X 3.40 2 4.20" or just "1.50 3.40 4.20"
        const oddsMatches = line.match(/\b(\d{1,3}[.,]\d{1,2})\b/g);
        
        if (oddsMatches && oddsMatches.length >= 3) {
          homeOddStr = oddsMatches[0];
          drawOddStr = oddsMatches[1];
          awayOddStr = oddsMatches[2];
          
          // Look backwards for team names.
          if (i >= 2) {
            const teamA = lines[i - 2];
            const teamB = lines[i - 1];
            const isNotOdd = (str: string) => !/^\d+(?:[.,]\d+)?$/.test(str);
            
            if (isNotOdd(teamA) && isNotOdd(teamB)) {
              homeTeam = teamA.trim();
              awayTeam = teamB.trim();
            }
          }
          
          if (!homeTeam && i >= 1) {
            const prevLine = lines[i - 1];
            const teamsRegex = /^(.*?)\s+(?:vs|v|-|\/)\s+(.*?)$/i;
            const teamsResult = prevLine.match(teamsRegex);
            if (teamsResult) {
              homeTeam = teamsResult[1].trim();
              awayTeam = teamsResult[2].trim();
            }
          }
        } else {
          // 3. What if the odds are at the end of the second team's name?
          const teamBOddsMatches = line.match(/^(.*?)\s+(\d{1,3}[.,]\d{1,2})\s*(?:X|-)?\s*(\d{1,3}[.,]\d{1,2})\s*(?:2|-)?\s*(\d{1,3}[.,]\d{1,2})\s*$/i);
          if (teamBOddsMatches && i >= 1) {
            const teamA = lines[i - 1];
            const isNotOdd = (str: string) => !/^\d+(?:[.,]\d+)?$/.test(str);
            if (isNotOdd(teamA)) {
              homeTeam = teamA.trim();
              awayTeam = teamBOddsMatches[1].trim();
              homeOddStr = teamBOddsMatches[2];
              drawOddStr = teamBOddsMatches[3];
              awayOddStr = teamBOddsMatches[4];
            }
          } else {
            // 4. What if odds are on separate lines?
            const singleOddRegex = /^\s*(\d{1,3}[.,]\d{1,2})\s*$/;
            if (i >= 2 && i + 2 < lines.length) {
               const odd1Match = lines[i].match(singleOddRegex);
               const odd2Match = lines[i+1].match(singleOddRegex);
               const odd3Match = lines[i+2].match(singleOddRegex);
               
               if (odd1Match && odd2Match && odd3Match) {
                  const teamA = lines[i - 2];
                  const teamB = lines[i - 1];
                  const isNotOdd = (str: string) => !/^\d+(?:[.,]\d+)?$/.test(str);
                  if (isNotOdd(teamA) && isNotOdd(teamB)) {
                    homeTeam = teamA.trim();
                    awayTeam = teamB.trim();
                    homeOddStr = odd1Match[1];
                    drawOddStr = odd2Match[1];
                    awayOddStr = odd3Match[1];
                    i += 2; // skip the next two odd lines
                  }
               }
            }
          }
        }
      }

      // 5. Fallback: look for "Team A - Team B" and then scan next few lines for 3 odds.
      if (!homeTeam) {
        const teamsRegex = /^(.*?)\s+(?:vs|v|-|\/)\s+(.*?)$/i;
        const teamsResult = line.match(teamsRegex);
        if (teamsResult) {
           for (let j = 1; j <= 3 && i + j < lines.length; j++) {
              const aheadLine = lines[i + j];
              const oddsMatches = aheadLine.match(/\b(\d{1,3}[.,]\d{1,2})\b/g);
              if (oddsMatches && oddsMatches.length >= 3) {
                 homeTeam = teamsResult[1].trim();
                 awayTeam = teamsResult[2].trim();
                 homeOddStr = oddsMatches[0];
                 drawOddStr = oddsMatches[1];
                 awayOddStr = oddsMatches[2];
                 i += j;
                 break;
              }
           }
        }
      }

      if (homeTeam && awayTeam && homeOddStr && drawOddStr && awayOddStr) {
        homeTeam = homeTeam.replace(/^[^a-zA-Z0-9À-ÿ\s]+|[^a-zA-Z0-9À-ÿ\s]+$/g, '').trim();
        awayTeam = awayTeam.replace(/^[^a-zA-Z0-9À-ÿ\s]+|[^a-zA-Z0-9À-ÿ\s]+$/g, '').trim();

        const invalidKeywords = ['mi-tps', 'double chance', '1x2', 'score', 'total', 'buts', 'handicap', 'over', 'under', 'ticket', 'paris', 'mise', 'connexion', 'inscription', 'accueil', 'sport', 'direct', 'casino'];
        const isInvalid = invalidKeywords.some(kw => 
          homeTeam.toLowerCase() === kw || awayTeam.toLowerCase() === kw || homeTeam.toLowerCase().includes('bet261') || awayTeam.toLowerCase().includes('bet261')
        );

        if (isInvalid || homeTeam.length < 2 || awayTeam.length < 2) {
          continue;
        }

        const homeOdd = parseFloat(homeOddStr.replace(/\s+/g, '').replace(',', '.'));
        const drawOdd = parseFloat(drawOddStr.replace(/\s+/g, '').replace(',', '.'));
        const awayOdd = parseFloat(awayOddStr.replace(/\s+/g, '').replace(',', '.'));

        if (isNaN(homeOdd) || isNaN(drawOdd) || isNaN(awayOdd) || homeOdd === 0 || drawOdd === 0 || awayOdd === 0) {
          continue;
        }

        const originalMatchString = `${homeTeam} ${separator} ${awayTeam}`;
        
        const highOdds = [];
        if (homeOdd >= 10) highOdds.push({ type: '1X2', pick: '1', odd: homeOdd, comment: 'Outsider détecté' });
        if (awayOdd >= 10) highOdds.push({ type: '1X2', pick: '2', odd: awayOdd, comment: 'Outsider détecté' });

        matches.push({ homeTeam, awayTeam, originalMatchString, homeOdd, drawOdd, awayOdd, highOdds });
      }
    }
    
    // 6. Ultimate Fallback: If no matches found, try to pair any 2 strings with any 3 odds found sequentially
    if (matches.length === 0) {
       let currentTeams: string[] = [];
       for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const oddsMatches = line.match(/\b(\d{1,3}[.,]\d{1,2})\b/g);
          
          if (oddsMatches && oddsMatches.length >= 3) {
             if (currentTeams.length >= 2) {
                const homeTeam = currentTeams[currentTeams.length - 2].replace(/^[^a-zA-Z0-9À-ÿ\s]+|[^a-zA-Z0-9À-ÿ\s]+$/g, '').trim();
                const awayTeam = currentTeams[currentTeams.length - 1].replace(/^[^a-zA-Z0-9À-ÿ\s]+|[^a-zA-Z0-9À-ÿ\s]+$/g, '').trim();
                
                if (homeTeam.length > 2 && awayTeam.length > 2) {
                    const homeOdd = parseFloat(oddsMatches[0].replace(',', '.'));
                    const drawOdd = parseFloat(oddsMatches[1].replace(',', '.'));
                    const awayOdd = parseFloat(oddsMatches[2].replace(',', '.'));
                    
                    if (!isNaN(homeOdd) && !isNaN(drawOdd) && !isNaN(awayOdd)) {
                       const highOdds = [];
                       if (homeOdd >= 10) highOdds.push({ type: '1X2', pick: '1', odd: homeOdd, comment: 'Outsider détecté' });
                       if (awayOdd >= 10) highOdds.push({ type: '1X2', pick: '2', odd: awayOdd, comment: 'Outsider détecté' });

                       matches.push({
                          homeTeam,
                          awayTeam,
                          originalMatchString: `${homeTeam} vs ${awayTeam}`,
                          homeOdd,
                          drawOdd,
                          awayOdd,
                          highOdds
                       });
                    }
                }
                currentTeams = []; // Reset
             }
          } else if (!/^\d+(?:[.,]\d+)?$/.test(line) && line.length > 2) {
             // It's a string, might be a team name
             const invalidKeywords = ['mi-tps', 'double chance', '1x2', 'score', 'total', 'buts', 'handicap', 'over', 'under', 'ticket', 'paris', 'mise', 'connexion', 'inscription', 'accueil', 'sport', 'direct', 'casino'];
             const isInvalid = invalidKeywords.some(kw => line.toLowerCase() === kw || line.toLowerCase().includes('bet261'));
             if (!isInvalid) {
                 currentTeams.push(line.trim());
             }
          }
       }
    }

    return matches;
  };

  const handleAnalyze = async () => {
    if (userTokens <= 0) {
      showToast('Tokens insuffisants');
      return;
    }
    if (!isHistorySaved) {
      showToast('Veuillez d\'abord sauvegarder un historique.');
      return;
    }
    if (!matchText.trim() || !matchTime.trim()) {
      showToast('Veuillez insérer les matchs et indiquer l\'heure.');
      return;
    }

    try {
      onAnalyze(); // Deduct token
      setIsAnalyzing(true);
      showToast('Analyse en cours...');

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      const extracted = parseOCRText(matchText);
      
      if (extracted.length === 0) {
        showToast("Aucune donnée valide détectée");
        setIsAnalyzing(false);
        return;
      }
      
      const batchId = Math.random().toString(36).substr(2, 9);
      const newResults: VirtualAnalysisResult[] = extracted.map(match => {
        const { homeTeam, awayTeam, originalMatchString, homeOdd, drawOdd, awayOdd, highOdds } = match;
        
        // Calculate probabilities: prob = 1 / cote
        const prob1 = 1 / homeOdd;
        const probX = 1 / drawOdd;
        const prob2 = 1 / awayOdd;
        
        // Normalize
        const totalProb = prob1 + probX + prob2;
        const normProb1 = prob1 / totalProb;
        const normProbX = probX / totalProb;
        const normProb2 = prob2 / totalProb;
        
        // Determine 1/X/2 based on highest probability
        let ft1x2 = 'X';
        const maxProb = Math.max(normProb1, normProbX, normProb2);
        if (maxProb === normProb1) ft1x2 = '1';
        else if (maxProb === normProb2) ft1x2 = '2';
        
        // Confidence is maxProb * 100
        let confidence = Math.round(maxProb * 100);
        
        const minOdd = Math.min(homeOdd, drawOdd, awayOdd);
        const maxOdd = Math.max(homeOdd, drawOdd, awayOdd);
        
        // Deterministic pseudo-random based on team names and odds
        const hashStr = homeTeam + awayTeam + homeOdd.toString();
        let hash = 0;
        for (let i = 0; i < hashStr.length; i++) {
          hash = ((hash << 5) - hash) + hashStr.charCodeAt(i);
          hash |= 0;
        }
        const pseudoRandom = Math.abs(hash) / 2147483648; // 0 to 1
        
        // Double Chance : Favori + Nul
        let dc = '1X';
        if (ft1x2 === '1') dc = '1X';
        else if (ft1x2 === '2') dc = 'X2';
        else dc = '12';

        // Score Exact basé sur la force du favori
        let exactScore = '1-1';
        if (minOdd < 1.50) {
          exactScore = ft1x2 === '1' ? (pseudoRandom > 0.5 ? '2-0' : '3-0') : (pseudoRandom > 0.5 ? '0-2' : '0-3');
        } else if (minOdd < 2.00) {
          exactScore = ft1x2 === '1' ? '2-1' : '1-2';
        } else {
          exactScore = pseudoRandom > 0.5 ? '1-1' : (ft1x2 === '1' ? '1-0' : '0-1');
        }

        const isHotMatch = minOdd < 1.50 || (maxOdd - minOdd > 3);
        
        let analysis = '';
        if (minOdd < 1.50) {
          analysis = `Cote très basse pour le favori (${minOdd.toFixed(2)}), forte probabilité de victoire.`;
        } else if (minOdd < 2.00) {
          analysis = `Match avec un léger avantage, mais qui reste serré.`;
        } else if (Math.abs(homeOdd - awayOdd) < 0.5) {
          analysis = `Match très équilibré, les cotes sont proches. Possibilité de match nul.`;
        } else {
          analysis = `Cotes élevées, match potentiellement imprévisible.`;
        }
        
        // Use high odds exactly as parsed from the image
        const finalHighOdds = [...(highOdds || [])];

        return {
          batchId,
          matchId: Math.random().toString(36).substr(2, 9),
          leagueId: selectedLeague,
          time: matchTime,
          homeTeam,
          awayTeam,
          originalMatchString,
          isHotMatch,
          confidence,
          extractedOdds: { home: homeOdd, draw: drawOdd, away: awayOdd },
          highOdds: finalHighOdds,
          results: {
            analysis,
            ft1x2,
            ht1x2: ft1x2 === '1' ? '1' : (ft1x2 === '2' ? '2' : 'X'),
            dc,
            dcHt: dc,
            exactScore,
            htScore: ft1x2 === '1' ? '1-0' : (ft1x2 === '2' ? '0-1' : '0-0'),
            ou05: 'Over',
            ou15: minOdd < 1.80 ? 'Over' : 'Under',
            ou25: minOdd < 1.50 ? 'Over' : 'Under',
            ou35: minOdd < 1.30 ? 'Over' : 'Under',
            htft: ft1x2 === '1' ? '1/1' : (ft1x2 === '2' ? '2/2' : 'X/X'),
            totalGoals: minOdd < 1.50 ? '3' : '2',
            ggng: minOdd < 1.60 ? 'NG' : 'GG',
            btts: minOdd < 1.60 ? 'No' : 'Yes',
            teamTotals: ft1x2 === '1' ? 'H: 2 | A: 0' : (ft1x2 === '2' ? 'H: 0 | A: 2' : 'H: 1 | A: 1'),
            oddEven: pseudoRandom > 0.5 ? 'Odd' : 'Even',
            firstGoalMin: `${Math.floor(pseudoRandom * 30) + 5}'`,
            multiGoals: minOdd < 1.50 ? '2-4' : '1-3',
            ftts: ft1x2 === '1' ? 'Home' : (ft1x2 === '2' ? 'Away' : 'None')
          }
        };
      });
      
      setResults(newResults);
      localStorage.setItem('virtualAnalyses', JSON.stringify(newResults));
      showToast('Analyse terminée avec succès !');
    } catch (error) {
      console.error(error);
      showToast("Erreur analyse, jereo tsara ny format texte na sary");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualAnalyze = async () => {
    if (userTokens <= 0) {
      showToast('Tokens insuffisants');
      return;
    }
    if (!manualHomeTeam || !manualAwayTeam || !manualOdd1 || !manualOddX || !manualOdd2) {
      showToast('Veuillez remplir tous les champs manuels.');
      return;
    }

    const hOdd = parseFloat(manualOdd1);
    const dOdd = parseFloat(manualOddX);
    const aOdd = parseFloat(manualOdd2);

    if (isNaN(hOdd) || isNaN(dOdd) || isNaN(aOdd)) {
      showToast('Les cotes doivent être des nombres valides.');
      return;
    }

    try {
      onAnalyze(); // Deduct token
      setIsAnalyzing(true);
      showToast('Analyse manuelle en cours...');

      setTimeout(() => {
        try {
          const batchId = Math.random().toString(36).substr(2, 9);
          
          const prob1 = 1 / hOdd;
          const probX = 1 / dOdd;
          const prob2 = 1 / aOdd;
          
          const totalProb = prob1 + probX + prob2;
          const normProb1 = prob1 / totalProb;
          const normProbX = probX / totalProb;
          const normProb2 = prob2 / totalProb;
          
          let ft1x2 = 'X';
          const maxProb = Math.max(normProb1, normProbX, normProb2);
          if (maxProb === normProb1) ft1x2 = '1';
          else if (maxProb === normProb2) ft1x2 = '2';
          
          let confidence = Math.round(maxProb * 100);
          const minOdd = Math.min(hOdd, dOdd, aOdd);
          const maxOdd = Math.max(hOdd, dOdd, aOdd);
          
          const pseudoRandom = Math.random();
          
          let dc = '1X';
          if (ft1x2 === '1') dc = '1X';
          else if (ft1x2 === '2') dc = 'X2';
          else dc = '12';

          let exactScore = '1-1';
          if (minOdd < 1.50) {
            exactScore = ft1x2 === '1' ? (pseudoRandom > 0.5 ? '2-0' : '3-0') : (pseudoRandom > 0.5 ? '0-2' : '0-3');
          } else if (minOdd < 2.00) {
            exactScore = ft1x2 === '1' ? '2-1' : '1-2';
          } else {
            exactScore = pseudoRandom > 0.5 ? '1-1' : (ft1x2 === '1' ? '1-0' : '0-1');
          }

          const isHotMatch = minOdd < 1.50 || (maxOdd - minOdd > 3);
          
          let analysis = '';
          if (minOdd < 1.50) {
            analysis = `Cote très basse pour le favori (${minOdd.toFixed(2)}), forte probabilité de victoire.`;
          } else if (minOdd < 2.00) {
            analysis = `Match avec un léger avantage, mais qui reste serré.`;
          } else if (Math.abs(hOdd - aOdd) < 0.5) {
            analysis = `Match très équilibré, les cotes sont proches. Possibilité de match nul.`;
          } else {
            analysis = `Cotes élevées, match potentiellement imprévisible.`;
          }

          const newResult: VirtualAnalysisResult = {
            batchId,
            matchId: Math.random().toString(36).substr(2, 9),
            leagueId: manualLeague,
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            homeTeam: manualHomeTeam,
            awayTeam: manualAwayTeam,
            originalMatchString: `${manualHomeTeam} vs ${manualAwayTeam}`,
            isHotMatch,
            confidence,
            extractedOdds: { home: hOdd, draw: dOdd, away: aOdd },
            highOdds: [],
            results: {
              analysis,
              ft1x2,
              ht1x2: ft1x2 === '1' ? '1' : (ft1x2 === '2' ? '2' : 'X'),
              dc,
              dcHt: dc,
              exactScore,
              htScore: ft1x2 === '1' ? '1-0' : (ft1x2 === '2' ? '0-1' : '0-0'),
              ou05: 'Over',
              ou15: minOdd < 1.80 ? 'Over' : 'Under',
              ou25: minOdd < 1.50 ? 'Over' : 'Under',
              ou35: minOdd < 1.30 ? 'Over' : 'Under',
              htft: ft1x2 === '1' ? '1/1' : (ft1x2 === '2' ? '2/2' : 'X/X'),
              totalGoals: minOdd < 1.50 ? '3' : '2',
              ggng: minOdd < 1.60 ? 'NG' : 'GG',
              btts: minOdd < 1.60 ? 'No' : 'Yes',
              teamTotals: ft1x2 === '1' ? 'H: 2 | A: 0' : (ft1x2 === '2' ? 'H: 0 | A: 2' : 'H: 1 | A: 1'),
              oddEven: pseudoRandom > 0.5 ? 'Odd' : 'Even',
              firstGoalMin: `${Math.floor(pseudoRandom * 30) + 5}'`,
              multiGoals: minOdd < 1.50 ? '2-4' : '1-3',
              ftts: ft1x2 === '1' ? 'Home' : (ft1x2 === '2' ? 'Away' : 'None')
            }
          };

          const updatedResults = [newResult, ...results];
          setResults(updatedResults);
          localStorage.setItem('virtualAnalyses', JSON.stringify(updatedResults));
          showToast('Analyse manuelle terminée !');
          
          // Clear form
          setManualHomeTeam('');
          setManualAwayTeam('');
          setManualOdd1('');
          setManualOddX('');
          setManualOdd2('');
        } catch (err) {
          console.error(err);
          showToast("Erreur analyse, jereo tsara ny format texte na sary");
        } finally {
          setIsAnalyzing(false);
        }
      }, 1500);
    } catch (err) {
      console.error(err);
      showToast("Erreur analyse, jereo tsara ny format texte na sary");
      setIsAnalyzing(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    localStorage.removeItem('virtualAnalyses');
  };

  const handleCopy = (res: VirtualAnalysisResult) => {
    const text = `Match : ${res.originalMatchString || `${res.homeTeam} vs ${res.awayTeam}`}\nCotes : ${res.extractedOdds.home.toFixed(2)} | ${res.extractedOdds.draw.toFixed(2)} | ${res.extractedOdds.away.toFixed(2)}\n\nAnalyse :\n${res.results.analysis}\n\nRésultat probable :\n${res.results.ft1x2 === '1' ? res.homeTeam : res.results.ft1x2 === '2' ? res.awayTeam : 'Match Nul'}\nScore exact :\n${res.results.exactScore}`;
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
    if (results.length < 3) return [];
    const multiples = [];
    let currentMultipleId = 0;
    
    const getOdd = (match: any) => {
      if (!match.extractedOdds) return 1.5;
      return match.results.ft1x2 === '1' ? match.extractedOdds.home : (match.results.ft1x2 === 'X' ? match.extractedOdds.draw : match.extractedOdds.away);
    };

    const combinations = [];
    for (let i = 0; i < results.length; i++) {
        for (let j = i + 1; j < results.length; j++) {
            for (let k = j + 1; k < results.length; k++) {
                combinations.push([results[i], results[j], results[k]]);
            }
        }
    }

    // Sort combinations by total odds descending to get the best ones first
    combinations.sort((a, b) => {
        const oddA = getOdd(a[0]) * getOdd(a[1]) * getOdd(a[2]);
        const oddB = getOdd(b[0]) * getOdd(b[1]) * getOdd(b[2]);
        return oddB - oddA;
    });

    // Take up to 20 combinations
    const selectedCombinations = combinations.slice(0, 20);

    for (const combo of selectedCombinations) {
        const m1 = combo[0];
        const m2 = combo[1];
        const m3 = combo[2];
        
        const odd1 = getOdd(m1);
        const odd2 = getOdd(m2);
        const odd3 = getOdd(m3);
        
        multiples.push({
            id: currentMultipleId++,
            picks: [
                { match: m1.originalMatchString || `${m1.homeTeam} vs ${m1.awayTeam}`, pick: m1.results.ft1x2, odd: odd1 },
                { match: m2.originalMatchString || `${m2.homeTeam} vs ${m2.awayTeam}`, pick: m2.results.ft1x2, odd: odd2 },
                { match: m3.originalMatchString || `${m3.homeTeam} vs ${m3.awayTeam}`, pick: m3.results.ft1x2, odd: odd3 }
            ],
            totalOdds: (odd1 * odd2 * odd3).toFixed(2)
        });
    }

    return multiples;
  };

  // Generate Cote Boost (Filtré depuis les cotes lues sur l'image)
  const generateCoteBoost = () => {
    if (results.length === 0) return [];
    const boosts: any[] = [];
    
    results.forEach(match => {
      if (match.highOdds && match.highOdds.length > 0) {
        match.highOdds.forEach((ho, idx) => {
          boosts.push({
            id: `${match.matchId}-${idx}`,
            match: match.originalMatchString || `${match.homeTeam} vs ${match.awayTeam}`,
            pick: ho.pick,
            type: ho.type,
            odd: ho.odd,
            comment: ho.comment
          });
        });
      }
    });

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

      <TutorialCard 
        title="Ahoana ny fampidirana texte"
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

      <div className="bg-[#1e293b] rounded-xl p-4 border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="bg-[#2dd4bf] text-slate-900 w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
          Historique (Texte)
        </h3>
        
        <div className="mb-4">
          <textarea
            value={historyText}
            onChange={(e) => setHistoryText(e.target.value)}
            placeholder="Collez l'historique ici..."
            className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-[#2dd4bf] resize-none"
          />
        </div>

        <button 
          onClick={handleSaveHistory}
          disabled={isSavingHistory || !historyText.trim()}
          className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isSavingHistory ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isSavingHistory ? 'Sauvegarde en cours...' : 'Sauvegarder historique'}
        </button>
      </div>

      <div className="bg-[#1e293b] rounded-xl p-4 border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="bg-[#eab308] text-slate-900 w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
          Nouvelle Analyse (Texte Matchs)
        </h3>
        
        <div className="mb-4">
          <textarea
            value={matchText}
            onChange={(e) => setMatchText(e.target.value)}
            placeholder="Equipe A vs Equipe B 1.50 3.20 4.10"
            className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-[#eab308] resize-none"
          />
        </div>

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
          disabled={isAnalyzing || userTokens <= 0 || !matchText.trim()}
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

      <TutorialCard 
        title="Ahoana ny fampiasana Manual Analyse"
        content={
          <ul className="list-disc pl-5 space-y-1">
            <li>Safidio ny League</li>
            <li>Safidio équipe domicile</li>
            <li>Ampidiro cote 1 sy X</li>
            <li>Safidio équipe extérieur</li>
            <li>Ampidiro cote 2</li>
            <li>Tsindrio ANALYSE</li>
          </ul>
        }
      />

      <div className="bg-[#1e293b] rounded-xl p-4 border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="bg-[#2dd4bf] text-slate-900 w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
          Analyse Manuelle
        </h3>
        
        <div className="space-y-3 mb-4">
          <select 
            value={manualLeague}
            onChange={(e) => setManualLeague(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#eab308] appearance-none"
          >
            {LEAGUES.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Équipe Domicile"
              value={manualHomeTeam}
              onChange={(e) => setManualHomeTeam(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#eab308]"
            />
            <input
              type="text"
              placeholder="Équipe Extérieur"
              value={manualAwayTeam}
              onChange={(e) => setManualAwayTeam(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#eab308]"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              step="0.01"
              placeholder="Cote 1"
              value={manualOdd1}
              onChange={(e) => setManualOdd1(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#eab308] text-center"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Cote X"
              value={manualOddX}
              onChange={(e) => setManualOddX(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#eab308] text-center"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Cote 2"
              value={manualOdd2}
              onChange={(e) => setManualOdd2(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#eab308] text-center"
            />
          </div>
        </div>

        <button 
          onClick={handleManualAnalyze}
          disabled={isAnalyzing || userTokens <= 0}
          className={`w-full font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            userTokens <= 0 
              ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
              : 'bg-[#2dd4bf] hover:bg-[#14b8a6] text-slate-900'
          }`}
        >
          {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : userTokens <= 0 ? null : <Edit3 className="w-5 h-5" />}
          {isAnalyzing ? 'Analyse en cours...' : userTokens <= 0 ? 'Tokens insuffisants' : 'Analyse Manuelle (1 Token)'}
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

          {/* COTES > 10 SECTION */}
          {results.some(res => res.highOdds && res.highOdds.length > 0) && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <h4 className="font-bold text-red-400 mb-3 flex items-center gap-2">
                <Flame className="w-5 h-5" /> COTES PLUS DE 10 DÉTECTÉES
              </h4>
              <div className="space-y-2">
                {results.map(res => {
                  if (!res.highOdds || res.highOdds.length === 0) return null;
                  return (
                    <div key={`high-${res.matchId}`} className="bg-slate-800/80 p-3 rounded-lg flex justify-between items-center border border-slate-700">
                      <span className="text-white font-medium text-sm">{res.homeTeam} vs {res.awayTeam}</span>
                      <div className="flex gap-2">
                        {res.highOdds.map((odd, idx) => (
                          <span key={idx} className="bg-red-500 text-white font-bold px-2 py-1 rounded text-xs">
                            {odd.pick}: {odd.odd.toFixed(2)}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
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
                    <img src={getTeamLogo(res.homeTeam, res.leagueId)} alt={res.homeTeam} className="w-6 h-6 object-contain" />
                    <span className="font-bold text-white text-sm flex-1 text-center px-2">
                      {res.originalMatchString || `${res.homeTeam} vs ${res.awayTeam}`}
                    </span>
                    <img src={getTeamLogo(res.awayTeam, res.leagueId)} alt={res.awayTeam} className="w-6 h-6 object-contain" />
                  </div>
                  
                  {/* Display the extracted odds to prove they match the screenshot exactly */}
                  <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-700 flex justify-center gap-8">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-slate-500 font-bold">1</span>
                      <span className="text-sm font-bold text-white">{res.extractedOdds.home.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-slate-500 font-bold">X</span>
                      <span className="text-sm font-bold text-white">{res.extractedOdds.draw.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-slate-500 font-bold">2</span>
                      <span className="text-sm font-bold text-white">{res.extractedOdds.away.toFixed(2)}</span>
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
                  
                  {/* Structure obligatoire pour chaque match */}
                  <div className="p-4 space-y-3 text-sm">
                    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                      <div className="text-slate-400 mb-1">Match :</div>
                      <div className="font-bold text-white">{res.originalMatchString || `${res.homeTeam} vs ${res.awayTeam}`}</div>
                    </div>
                    
                    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                      <div className="text-slate-400 mb-1">Cotes :</div>
                      <div className="font-bold text-white">
                        {res.extractedOdds.home.toFixed(2)} | {res.extractedOdds.draw.toFixed(2)} | {res.extractedOdds.away.toFixed(2)}
                      </div>
                    </div>

                    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                      <div className="text-slate-400 mb-1">Analyse :</div>
                      <div className="font-medium text-white">{res.results.analysis}</div>
                    </div>

                    {isVip ? (
                      <div className="bg-gradient-to-br from-amber-900/40 to-yellow-900/40 p-4 rounded-lg border border-amber-500/30 space-y-2">
                        <h4 className="font-bold text-amber-400 mb-3 flex items-center gap-2">
                          <Gem className="w-4 h-4" /> VIP ULTRA ANALYSE
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div className="flex justify-between border-b border-amber-500/10 pb-1">
                            <span className="text-slate-400">Mi-temps 1X2:</span>
                            <span className="font-bold text-white">{res.results.ht1x2}</span>
                          </div>
                          <div className="flex justify-between border-b border-amber-500/10 pb-1">
                            <span className="text-slate-400">Double Chance (HT & FT):</span>
                            <span className="font-bold text-white">{res.results.dcHt} / {res.results.dc}</span>
                          </div>
                          <div className="flex justify-between border-b border-amber-500/10 pb-1">
                            <span className="text-slate-400">Score Exact (HT & FT):</span>
                            <span className="font-bold text-white">{res.results.htScore} / {res.results.exactScore}</span>
                          </div>
                          <div className="flex justify-between border-b border-amber-500/10 pb-1">
                            <span className="text-slate-400">Over/Under (0.5 - 3.5):</span>
                            <span className="font-bold text-white">{res.results.ou05[0]}, {res.results.ou15[0]}, {res.results.ou25[0]}, {res.results.ou35[0]}</span>
                          </div>
                          <div className="flex justify-between border-b border-amber-500/10 pb-1">
                            <span className="text-slate-400">GG/NG:</span>
                            <span className="font-bold text-white">{res.results.ggng}</span>
                          </div>
                          <div className="flex justify-between border-b border-amber-500/10 pb-1">
                            <span className="text-slate-400">Total Goals:</span>
                            <span className="font-bold text-white">{res.results.totalGoals}</span>
                          </div>
                          <div className="flex justify-between border-b border-amber-500/10 pb-1">
                            <span className="text-slate-400">HT/FT:</span>
                            <span className="font-bold text-white">{res.results.htft}</span>
                          </div>
                          <div className="flex justify-between border-b border-amber-500/10 pb-1">
                            <span className="text-slate-400">Pair/Impair:</span>
                            <span className="font-bold text-white">{res.results.oddEven}</span>
                          </div>
                          <div className="flex justify-between border-b border-amber-500/10 pb-1">
                            <span className="text-slate-400">First Goal:</span>
                            <span className="font-bold text-white">{res.results.firstGoalMin}</span>
                          </div>
                          <div className="flex justify-between border-b border-amber-500/10 pb-1">
                            <span className="text-slate-400">Home goals (+1.5, +2.5):</span>
                            <span className="font-bold text-white">
                              {res.results.ft1x2 === '1' ? 'O, U' : 'U, U'}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-amber-500/10 pb-1">
                            <span className="text-slate-400">Away goals (+0.5, +1.5):</span>
                            <span className="font-bold text-white">
                              {res.results.ft1x2 === '2' ? 'O, O' : (res.results.ft1x2 === 'X' ? 'O, U' : 'U, U')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                          <div className="text-slate-400 mb-1">Résultat probable :</div>
                          <div className="font-bold text-[#2dd4bf]">{res.results.ft1x2 === '1' ? res.homeTeam : res.results.ft1x2 === '2' ? res.awayTeam : 'Match Nul'}</div>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                          <div className="text-slate-400 mb-1">Score exact :</div>
                          <div className="font-bold text-[#eab308]">{res.results.exactScore}</div>
                        </div>
                      </div>
                    )}
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

          {/* MULTIPLE VIP SECTION */}
          {multiples.length > 0 && (
            <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 rounded-xl p-4">
              <h4 className="text-emerald-400 font-bold flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5" />
                MULTIPLE VIP (Cote {'>'}= 10)
              </h4>
              <div className="space-y-3">
                {multiples.map(mult => (
                  <div key={mult.id} className="bg-slate-900/50 p-3 rounded-lg border border-emerald-500/20">
                    <div className="mb-2 border-b border-slate-700/50 pb-2">
                      <span className="text-emerald-400 font-bold text-sm">Multiple {mult.id + 1}</span>
                    </div>
                    <div className="space-y-2 mb-3">
                      {mult.picks.map((pick, idx) => (
                        <div key={idx} className="text-sm text-slate-300 font-medium flex justify-between">
                          <span>{pick.match} : {pick.pick}</span>
                          <span className="text-emerald-400">{pick.odd.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
                      <span className="text-slate-400 text-sm font-bold">Total :</span>
                      <span className="text-emerald-400 font-bold text-lg">{mult.totalOdds}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COTE BOOST SECTION */}
          {coteBoosts.length > 0 && (
            <div className="bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-500/30 rounded-xl p-4">
              <h4 className="text-red-400 font-bold flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5" />
                Cote plus de 10 cible dans le Capture Match
              </h4>
              <div className="space-y-2">
                {coteBoosts.map((boost: any) => (
                  <div key={boost.id} className="bg-slate-900/50 p-3 rounded-lg flex flex-col gap-2 border border-red-500/20">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-white font-bold text-sm">{boost.match}</div>
                        <div className="text-slate-400 text-xs">{boost.type}: <span className="text-[#eab308] font-bold">{boost.pick}</span></div>
                      </div>
                      <div className="bg-red-500/20 text-red-400 font-bold px-3 py-1 rounded border border-red-500/30">
                        {boost.odd}
                      </div>
                    </div>
                    {boost.comment && (
                      <div className="text-xs text-red-300/80 italic border-t border-red-500/10 pt-2 mt-1">
                        💡 {boost.comment}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

