import { BracketMatch, KombatOption } from "../components/Kombat/KombatModels";
import { Movie } from "../types";

export const MIN_KOMBAT_MOVIES = 4;
export const MAX_KOMBAT_MOVIES = 32;

export type KombatStartRequirement =
  | {
      status: "ready";
      targetMovieCount: 4 | 8 | 16 | 32;
    }
  | {
      status: "add-movies";
      missingMovies: number;
    }
  | {
      status: "pick-4";
    }
  | {
      status: "pick-8";
    }
  | {
      status: "pick-16";
    };

// A placeholder for empty slots or "BYE" rounds
const TBD_OPTION: KombatOption = {
  id: 'tbd',
  title: 'TBD',
  poster: 'https://placehold.co/400x600/242424/646cff?text=TBD',
};

export const getKombatStartRequirement = (movieCount: number): KombatStartRequirement => {
  // Less than 4: Need to add movies
  if (movieCount < 4) {
    return {
      status: "add-movies",
      missingMovies: 4 - movieCount,
    };
  }

  // Exactly 4: Ready
  if (movieCount === 4) {
    return { status: "ready", targetMovieCount: 4 };
  }

  // 5-7: Show dialog to pick 4
  if (movieCount >= 5 && movieCount <= 7) {
    return { status: "pick-4" };
  }

  // Exactly 8: Ready
  if (movieCount === 8) {
    return { status: "ready", targetMovieCount: 8 };
  }

  // 9-15: Show dialog to pick 8
  if (movieCount >= 9 && movieCount <= 15) {
    return { status: "pick-8" };
  }

  // Exactly 16: Ready
  if (movieCount === 16) {
    return { status: "ready", targetMovieCount: 16 };
  }

  // 17-31: Show dialog to pick 16
  if (movieCount >= 17 && movieCount <= 31) {
    return { status: "pick-16" };
  }

  // Exactly 32 or more: Ready with 32 (more than 32 is prevented elsewhere)
  return { status: "ready", targetMovieCount: 32 };
};

export const selectRandomMovies = <T,>(
  movies: T[],
  maxMovies: number,
  random: () => number = Math.random
): T[] => {
  if (movies.length <= maxMovies) {
    return [...movies];
  }

  const shuffled = [...movies];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled.slice(0, maxMovies);
};

// This is the core function that sets up the kombat
export const createInitialStages = (movies: Movie[]): BracketMatch[][] => {
  // 1. Ensure the number of participants is a power of 2 (2, 4, 8, 16...)
  let participantCount = 2;
  while (participantCount < movies.length) {
    participantCount *= 2;
  }

  // 2. Convert movies to KombatOptions and fill empty slots
  const options: KombatOption[] = [];
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
    if (stagesFromFinal === 0) return '👑';
    return `1/${2 ** stagesFromFinal}`;
}
