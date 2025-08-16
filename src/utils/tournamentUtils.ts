// src/utils/tournamentUtils.ts

import { BracketMatch, TournamentOption } from "../components/Tournament/TournamentModels";
import { Movie } from "../types";

// A placeholder for empty slots or "BYE" rounds
const TBD_OPTION: TournamentOption = {
  id: 'tbd',
  title: 'TBD',
  poster: 'https://placehold.co/400x600/242424/646cff?text=TBD',
};

// This is the core function that sets up the tournament
export const createInitialStages = (movies: Movie[]): BracketMatch[][] => {
  // 1. Ensure the number of participants is a power of 2 (2, 4, 8, 16...)
  let participantCount = 2;
  while (participantCount < movies.length) {
    participantCount *= 2;
  }

  // 2. Convert movies to TournamentOptions and fill empty slots
  const options: TournamentOption[] = [];
  for (let i = 0; i < participantCount; i++) {
    if (i < movies.length) {
      options.push({
        id: movies[i].imdbID,
        title: movies[i].Title,
        poster: movies[i].Poster,
      });
    } else {
      // If we have fewer movies than slots, add a placeholder
      options.push({ ...TBD_OPTION, id: `tbd-${i}` });
    }
  }

  // 3. Create the first round of matches
  const firstRound: BracketMatch[] = [];
  for (let i = 0; i < options.length; i += 2) {
    firstRound.push({
      first: options[i],
      second: options[i + 1],
      winnerTitle: '',
    });
  }

  // 4. Create the data structure for all stages
  const totalStages = Math.log2(participantCount);
  const stages: BracketMatch[][] = [firstRound];

  for (let i = 1; i < totalStages; i++) {
    const previousRound = stages[i - 1];
    const nextRound: BracketMatch[] = [];
    for (let j = 0; j < previousRound.length; j += 2) {
      nextRound.push({
        first: TBD_OPTION,
        second: TBD_OPTION,
        winnerTitle: '',
      });
    }
    stages.push(nextRound);
  }

  // Handle BYE rounds automatically advancing
  stages[0].forEach((match, roundIndex) => {
    if (match.second.id.startsWith('tbd')) {
      const winner = match.first;
      match.winnerTitle = winner.title;
      const nextMatchIndex = Math.floor(roundIndex / 2);
      if (stages[1]) {
        if (roundIndex % 2 === 0) {
          stages[1][nextMatchIndex].first = winner;
        } else {
          stages[1][nextMatchIndex].second = winner;
        }
      }
    }
  });

  return stages;
};

// Helper to get stage names
export const getStageName = (stageIndex: number, totalStages: number): string => {
    const stagesFromFinal = totalStages - 1 - stageIndex;
    if (stagesFromFinal === 0) return 'Final';
    if (stagesFromFinal === 1) return 'Semi-Finals';
    if (stagesFromFinal === 2) return 'Quarter-Finals';
    return `Round ${stageIndex + 1}`;
}