export interface User {
  id: string;
  phone: string;
  password: string;
  tokens: number;
  status: 'active' | 'inactive';
}

export interface Match {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  time: string;
  status: 'NS' | 'LIVE' | 'FT';
  odds: {
    home: number;
    draw: number;
    away: number;
  };
  prediction?: string;
  isVip?: boolean;
}

export interface League {
  id: string;
  name: string;
  logo: string;
  countryCode?: string;
}

export interface Team {
  name: string;
  logo: string;
}

export interface VirtualAnalysisResult {
  batchId: string;
  matchId: string;
  leagueId: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  results: {
    ft1x2: string;
    ht1x2: string;
    dc: string;
    dcHt: string;
    exactScore: string;
    htScore: string;
    ou05: string;
    ou15: string;
    ou25: string;
    ou35: string;
    htft: string;
    totalGoals: string;
    ggng: string;
    btts: string;
    teamTotals: string;
    oddEven: string;
    firstGoalMin: string;
    multiGoals: string;
    ftts: string;
  };
}

export interface AviatorRound {
  time: string;
  multiplier1: number;
  multiplier2: number;
  risk: number;
}
