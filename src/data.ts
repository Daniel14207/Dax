import { League, Team } from './types';

export const LEAGUES: League[] = [
  { id: 'eng', name: 'English League', logo: 'https://crests.football-data.org/PL.png' },
  { id: 'cl', name: 'Champions League', logo: 'https://crests.football-data.org/CL.png' },
  { id: 'afr', name: 'Africa Cup', logo: 'https://crests.football-data.org/CLI.png' },
  { id: 'ita', name: 'Italian League', logo: 'https://crests.football-data.org/SA.png' },
  { id: 'spa', name: 'Spanish League', logo: 'https://crests.football-data.org/PD.png' },
  { id: 'fra', name: 'French League', logo: 'https://crests.football-data.org/FL1.png' },
  { id: 'ger', name: 'German League', logo: 'https://crests.football-data.org/BL1.png' },
  { id: 'por', name: 'Portuguese League', logo: 'https://crests.football-data.org/PPL.png' },
];

export const TEAMS_BY_LEAGUE: Record<string, string[]> = {
  'afr': ['DR Congo', 'Ivory Coast', 'Mozambique', 'Tunisia', 'Morocco', 'Zimbabwe', 'Zambia', 'Tanzania', 'Sudan', 'Equatorial Guinea', 'Burkina Faso', 'Algeria', 'Mali', 'Senegal', 'Comoros', 'Angola', 'South Africa', 'Benin', 'Uganda', 'Cameroon', 'Nigeria', 'Egypt', 'Botswana', 'Gabon'],
  'eng': ['Manchester Blue', 'Bournemouth', 'Wolverhampton', 'Everton', 'C. Palace', 'Sunderland', 'N. Forest', 'A. Villa', 'Spurs', 'Burnley', 'Newcastle', 'Liverpool', 'Manchester Red', 'London Blues', 'Fulham', 'London Reds', 'Leeds', 'Brighton', 'Brentford', 'West Ham'],
  'cl': ['Monaco', 'Brest', 'Munich', 'Turin', 'Leverkusen', 'Bern', 'Atalanta', 'Eindhoven', 'Lille', 'London Reds', 'Belgrade', 'Feyenoord', 'Manchester Blue', 'Barca', 'Milan Reds', 'Leipzig', 'A. Madrid', 'Dortmund', 'Stuttgart', 'Bratislava', 'Girona', 'Salzburg', 'Bologna', 'Milan Blues', 'Donetsk', 'A. Villa', 'R. Madrid', 'Zagreb', 'Graz', 'Lisboa Green', 'Prague', 'Bruges', 'Liverpool', 'Celtic', 'Lisboa Red', 'Paris SG'],
  'ita': ['Roma', 'Udinese', 'Turin', 'Atalanta', 'Cremonese', 'Torino', 'Como', 'Verona', 'Milan Blues', 'Parma', 'Fiorentina', 'Pisa', 'Sassuolo', 'Genoa', 'Cagliari', 'Lecce', 'Napoli', 'Milan Reds', 'Bologna', 'Lazio'],
  'spa': ['Barca', 'Alavés', 'Villarreal', 'Sevilla', 'Real Oviedo', 'Mallorca', 'Elche', 'Bilbao', 'Betis', 'A. Madrid', 'R. Vallecano', 'Valencia', 'Getafe', 'Levante', 'Vigo', 'R. Madrid', 'Girona', 'R. Sociedad', 'Osasuna', 'Espanyol'],
  'fra': ['Marseille', 'Rennes', 'Paris FC', 'Lorient', 'Auxerre', 'Nice', 'Angers', 'Le Havre', 'Metz', 'Nantes', 'Lille', 'Paris SG', 'Monaco', 'Strasbourg', 'Brest', 'Toulouse', 'Lyon', 'Lens'],
  'ger': ['Mönchengladbach', 'Heidenheim', 'Freiburg', 'Leverkusen', 'Hambourg', 'Pauli', 'Stuttgart', 'Bremen', 'Leipzig', 'Munich', 'Berlin', 'Mainz', 'Dortmund', 'Frankfurt', 'Köln', 'Wolfsburg', 'Augsburg', 'Hoffenheim'],
  'por': ['Gil Vicente', 'Guimaraes', 'Famalicao', 'Porto', 'Alverca', 'Tondela', 'Estrela', 'Santa Clara', 'AFS', 'Moreirense', 'Estoril', 'Rio Ave', 'Lisboa Green', 'Nacional', 'Lisboa Red', 'Braga', 'Casa Pia', 'Arouca']
};

const AFRICA_CUP_CODES: Record<string, string> = {
  'DR Congo': 'cd', 'Ivory Coast': 'ci', 'Mozambique': 'mz', 'Tunisia': 'tn', 'Morocco': 'ma', 'Zimbabwe': 'zw', 'Zambia': 'zm', 'Tanzania': 'tz', 'Sudan': 'sd', 'Equatorial Guinea': 'gq', 'Burkina Faso': 'bf', 'Algeria': 'dz', 'Mali': 'ml', 'Senegal': 'sn', 'Comoros': 'km', 'Angola': 'ao', 'South Africa': 'za', 'Benin': 'bj', 'Uganda': 'ug', 'Cameroon': 'cm', 'Nigeria': 'ng', 'Egypt': 'eg', 'Botswana': 'bw', 'Gabon': 'ga'
};

export const getTeamLogo = (teamName: string, leagueId?: string) => {
  if (leagueId === 'afr' || AFRICA_CUP_CODES[teamName]) {
    const code = AFRICA_CUP_CODES[teamName];
    if (code) return `https://flagcdn.com/w40/${code}.png`;
  }
  
  // Custom fallback for clubs to make it look professional
  const colors = ['1e293b', '0f172a', '334155', '1e1b4b', '312e81'];
  const randomColor = colors[teamName.length % colors.length];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName)}&background=${randomColor}&color=fff&bold=true&font-size=0.4`;
};
