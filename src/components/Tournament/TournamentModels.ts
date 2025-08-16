// src/components/Tournament/TournamentModels.ts

// Represents one participant in the tournament.
// We'll convert our `Movie` type to this.
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