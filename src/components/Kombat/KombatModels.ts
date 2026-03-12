// Represents one participant in the kombat.
export interface KombatOption {
  id: string;
  title: string;
  poster: string;
}

// Represents one head-to-head match in the bracket.
export interface BracketMatch {
  first: KombatOption;
  second: KombatOption;
  winnerTitle: string;
}
