// src/pages/TournamentPage.tsx

import { useEffect, useState } from "react";
import { useMovies } from "../context/MovieContext";
import {
  BracketMatch,
  TournamentOption,
} from "../components/Tournament/TournamentModels";
import { createInitialStages, getStageName } from "../utils/tournamentUtils";
import { Link, useNavigate } from "react-router-dom"; // 👈 Add useNavigate
import Button from "../components/Button"; // 👈 Add your custom Button

// A simplified component to show the two movie choices
const TournamentMatchup = ({
  match,
  onChooseWinner,
}: {
  match: BracketMatch;
  onChooseWinner: (winner: TournamentOption) => void;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-start">
      {/* First Movie */}
      <div className="flex flex-col items-center gap-4">
        <h3 className="text-xl font-bold text-center h-16">
          {match.first.title}
        </h3>
        <img
          src={match.first.poster}
          alt={match.first.title}
          className="rounded-lg shadow-lg max-h-96"
        />
        <button
          onClick={() => onChooseWinner(match.first)}
          className="btn-primary w-full mt-2"
        >
          Choose
        </button>
      </div>
      {/* Second Movie */}
      <div className="flex flex-col items-center gap-4">
        <h3 className="text-xl font-bold text-center h-16">
          {match.second.title}
        </h3>
        <img
          src={match.second.poster}
          alt={match.second.title}
          className="rounded-lg shadow-lg max-h-96"
        />
        <button
          onClick={() => onChooseWinner(match.second)}
          className="btn-primary w-full mt-2"
        >
          Choose
        </button>
      </div>
    </div>
  );
};

export default function TournamentPage() {
  const { movieList } = useMovies();
  const navigate = useNavigate(); // 👈 Add this line

  const [stages, setStages] = useState<BracketMatch[][]>([]);
  const [currentStage, setCurrentStage] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [winner, setWinner] = useState<TournamentOption | null>(null);

  useEffect(() => {
    if (movieList.length > 0) {
      const initialStages = createInitialStages(movieList);
      setStages(initialStages);

      // Find the first playable match
      const firstPlayableRound = initialStages[0].findIndex(
        (match) => !match.winnerTitle
      );
      setCurrentRound(firstPlayableRound >= 0 ? firstPlayableRound : 0);
    }
  }, [movieList]);

  const handleChooseWinner = (roundWinner: TournamentOption) => {
    const updatedStages = [...stages];
    const currentMatch = updatedStages[currentStage][currentRound];

    // Set the winner for the current match
    currentMatch.winnerTitle = roundWinner.title;

    // Is there a next stage?
    const isFinalStage = currentStage === stages.length - 1;

    if (!isFinalStage) {
      const nextMatchIndex = Math.floor(currentRound / 2);
      const nextStageMatch = updatedStages[currentStage + 1][nextMatchIndex];

      // Place winner in the 'first' or 'second' slot of the next match
      if (currentRound % 2 === 0) {
        nextStageMatch.first = roundWinner;
      } else {
        nextStageMatch.second = roundWinner;
      }
    } else {
      // This was the final match, we have a tournament winner!
      setWinner(roundWinner);
      setStages(updatedStages);
      return;
    }

    setStages(updatedStages);

    // Move to the next round or next stage
    const nextRoundIndex = currentRound + 1;
    if (nextRoundIndex < stages[currentStage].length) {
      // If the next match is a BYE, resolve it and skip
      const nextMatch = stages[currentStage][nextRoundIndex];
      if (nextMatch.second.id.startsWith("tbd")) {
        handleChooseWinner(nextMatch.first);
      } else {
        setCurrentRound(nextRoundIndex);
      }
    } else {
      // End of stage, move to the next one
      setCurrentStage(currentStage + 1);
      setCurrentRound(0);
    }
  };

  if (movieList.length < 2) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold mb-4">Tournament Mode</h1>
        <p className="text-lg text-gray-400">
          You need to add at least 2 movies to start a tournament.
        </p>
        <div className="flex justify-center p-4">
          <Button variant="danger" onClick={() => navigate("/")}>
            &larr; Back to Search
          </Button>
        </div>
      </div>
    );
  }
  if (stages.length === 0) {
    return <div className="text-center p-8">Loading Tournament...</div>;
  }

  const currentMatch = stages[currentStage]?.[currentRound];
  const totalStages = stages.length;
  const stageName = getStageName(currentStage, totalStages);

  return (
    <div className="container mx-auto p-4 md:p-8">
      {winner ? (
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-black">
            🏆 The Winner Is! 🏆
          </h1>

          {/* IMDb link - #Issue 19 */}
          <div className="flex justify-center">
            <a
              href={`https://www.imdb.com/title/${winner.id}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-48"
            >
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="relative flex items-center justify-center space-x-2 text-white">
                <span>🎬</span>
                <span>View on IMDb</span>
              </div>
            </a>
          </div>

          <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
            <h3 className="text-3xl font-bold text-black">{winner.title}</h3>
            <img
              src={winner.poster}
              alt={winner.title}
              className="rounded-lg shadow-2xl"
            />

            <Link to="/" className="btn-secondary mt-6">
              Start a New Tournament
            </Link>
          </div>
        </div>
      ) : (
        currentMatch && (
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">{stageName}</h1>
            <p className="text-gray-400 mb-8">
              Round {currentRound + 1} of {stages[currentStage].length}
            </p>
            <TournamentMatchup
              match={currentMatch}
              onChooseWinner={handleChooseWinner}
            />
          </div>
        )
      )}
    </div>
  );
}
