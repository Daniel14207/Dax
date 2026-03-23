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
  prediction: string;
  isVip?: boolean;
}
