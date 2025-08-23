// Represents one participant in the tournament.
export interface TournamentOption {
  id: string;
  title: string;
  poster: string;
}

// Represents one head-to-head match in the bracket.
export interface BracketMatch {
  first: TournamentOption;
  second: TournamentOption;
  winnerTitle: string;
}