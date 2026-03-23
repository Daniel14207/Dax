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

const TEAM_LOGOS: Record<string, string> = {
  'Manchester Blue': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/1200px-Manchester_City_FC_badge.svg.png',
  'Manchester Red': 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/1200px-Manchester_United_FC_crest.svg.png',
  'London Blues': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/1200px-Chelsea_FC.svg.png',
  'London Reds': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/1200px-Arsenal_FC.svg.png',
  'Liverpool': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/1200px-Liverpool_FC.svg.png',
  'Spurs': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Tottenham_Hotspur.svg/1200px-Tottenham_Hotspur.svg.png',
  'R. Madrid': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png',
  'Barca': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/1200px-FC_Barcelona_%28crest%29.svg.png',
  'A. Madrid': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/Atletico_Madrid_2017_logo.svg/1200px-Atletico_Madrid_2017_logo.svg.png',
  'Munich': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/1200px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png',
  'Dortmund': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Borussia_Dortmund_logo.svg/1200px-Borussia_Dortmund_logo.svg.png',
  'Paris SG': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/1200px-Paris_Saint-Germain_F.C..svg.png',
  'Marseille': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Olympique_Marseille_logo.svg/1200px-Olympique_Marseille_logo.svg.png',
  'Milan Reds': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_AC_Milan.svg/1200px-Logo_of_AC_Milan.svg.png',
  'Milan Blues': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/FC_Internazionale_Milano_2021.svg/1200px-FC_Internazionale_Milano_2021.svg.png',
  'Turin': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Juventus_FC_2017_icon_%28black%29.svg/1200px-Juventus_FC_2017_icon_%28black%29.svg.png',
  'Roma': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f7/AS_Roma_logo_%282017%29.svg/1200px-AS_Roma_logo_%282017%29.svg.png',
  'Napoli': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/SSC_Napoli_2021.svg/1200px-SSC_Napoli_2021.svg.png',
  'Leverkusen': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/59/Bayer_04_Leverkusen_logo.svg/1200px-Bayer_04_Leverkusen_logo.svg.png',
  'Leipzig': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/04/RB_Leipzig_2014_logo.svg/1200px-RB_Leipzig_2014_logo.svg.png',
  'Monaco': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/ba/AS_Monaco_FC.svg/1200px-AS_Monaco_FC.svg.png',
  'Lille': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6f/LOSC_Lille_logo.svg/1200px-LOSC_Lille_logo.svg.png',
  'Lyon': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c6/Olympique_Lyonnais.svg/1200px-Olympique_Lyonnais.svg.png',
  'Porto': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f1/FC_Porto.svg/1200px-FC_Porto.svg.png',
  'Lisboa Red': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/SL_Benfica_logo.svg/1200px-SL_Benfica_logo.svg.png',
  'Lisboa Green': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e2/Sporting_CP_logo.svg/1200px-Sporting_CP_logo.svg.png',
  'Newcastle': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Newcastle_United_Logo.svg/1200px-Newcastle_United_Logo.svg.png',
  'A. Villa': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f9/Aston_Villa_FC_crest_%282016%29.svg/1200px-Aston_Villa_FC_crest_%282016%29.svg.png',
  'West Ham': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c2/West_Ham_United_FC_logo.svg/1200px-West_Ham_United_FC_logo.svg.png',
  'Everton': 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/Everton_FC_logo.svg/1200px-Everton_FC_logo.svg.png',
  'Atalanta': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/66/AtalantaBC.svg/1200px-AtalantaBC.svg.png',
  'Lazio': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e4/S.S._Lazio_badge.svg/1200px-S.S._Lazio_badge.svg.png',
  'Sevilla': 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/Sevilla_FC_logo.svg/1200px-Sevilla_FC_logo.svg.png',
  'Valencia': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/ce/Valencia_CF_logo.svg/1200px-Valencia_CF_logo.svg.png',
  'Bilbao': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/98/Club_Athletic_Bilbao_logo.svg/1200px-Club_Athletic_Bilbao_logo.svg.png',
  'R. Sociedad': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f1/Real_Sociedad_logo.svg/1200px-Real_Sociedad_logo.svg.png',
  'Betis': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/13/Real_Betis_logo.svg/1200px-Real_Betis_logo.svg.png',
  'Villarreal': 'https://upload.wikimedia.org/wikipedia/en/thumb/7/70/Villarreal_CF_logo.svg/1200px-Villarreal_CF_logo.svg.png',
  'Eindhoven': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/05/PSV_Eindhoven.svg/1200px-PSV_Eindhoven.svg.png',
  'Feyenoord': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e3/Feyenoord_logo.svg/1200px-Feyenoord_logo.svg.png',
  'Celtic': 'https://upload.wikimedia.org/wikipedia/en/thumb/3/35/Celtic_FC.svg/1200px-Celtic_FC.svg.png',
  'Bruges': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d0/Club_Brugge_KV_logo.svg/1200px-Club_Brugge_KV_logo.svg.png',
  'Salzburg': 'https://upload.wikimedia.org/wikipedia/en/thumb/7/77/FC_Red_Bull_Salzburg_logo.svg/1200px-FC_Red_Bull_Salzburg_logo.svg.png',
  'Donetsk': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a1/FC_Shakhtar_Donetsk.svg/1200px-FC_Shakhtar_Donetsk.svg.png',
};

export const getTeamLogo = (teamName: string, leagueId?: string) => {
  if (leagueId === 'afr' || AFRICA_CUP_CODES[teamName]) {
    const code = AFRICA_CUP_CODES[teamName];
    if (code) return `https://flagcdn.com/w40/${code}.png`;
  }
  
  if (TEAM_LOGOS[teamName]) {
    return TEAM_LOGOS[teamName];
  }
  
  // Custom fallback for clubs to make it look professional
  const colors = ['1e293b', '0f172a', '334155', '1e1b4b', '312e81'];
  const randomColor = colors[teamName.length % colors.length];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName)}&background=${randomColor}&color=fff&bold=true&font-size=0.4`;
};
