import { useEffect, useState } from "react";
import { useMovies } from "../context/MovieContext";
import {
  BracketMatch,
  TournamentOption,
} from "../components/Tournament/TournamentModels";
import { createInitialStages, getStageName } from "../utils/tournamentUtils";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import PosterImage from "../components/PosterImage";
import BracketVisualization from "../components/Tournament/BracketVisualization";

const TournamentMatchup = ({
  match,
  onChooseWinner,
  chooseLabel,
}: {
  match: BracketMatch;
  onChooseWinner: (winner: TournamentOption) => void;
  chooseLabel: string;
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 md:gap-8 items-start">
      {/* First Movie */}
      <div className="flex flex-col items-center gap-4">
        <h3 className="text-xl font-bold text-center h-8">
          {match.first.title}
        </h3>
        {/* Container for the first movie's poster */}
        <div className="w-full max-w-xs mx-auto aspect-[2/3] rounded-lg overflow-hidden bg-gray-700 shadow-lg">
          <PosterImage
            className="w-full h-full object-cover"
            src={match.first.poster}
            alt={match.first.title}
            title={match.first.title}
          />
        </div>
        <div className="mt-4">
          <Button variant="primary" onClick={() => onChooseWinner(match.first)}>
            {chooseLabel}
          </Button>
        </div>
      </div>
      {/* Second Movie */}
      <div className="flex flex-col items-center gap-4">
        <h3 className="text-xl font-bold text-center h-8">
          {match.second.title}
        </h3>
        <div className="w-full max-w-xs mx-auto aspect-[2/3] rounded-lg overflow-hidden bg-gray-700 shadow-lg">
          <PosterImage
            className="w-full h-full object-cover"
            src={match.second.poster}
            alt={match.second.title}
            title={match.second.title}
          />
        </div>
        <div className="mt-4">
          <Button
            variant="primary"
            onClick={() => onChooseWinner(match.second)}
          >
            {chooseLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function TournamentPage() {
  const { movieList, setMovieList, searchLanguage } = useMovies();
  const navigate = useNavigate();
  const isSpanish = searchLanguage === "es-ES";
  const ui = isSpanish
    ? {
        choose: "Elegir",
        tournamentMode: "Modo Torneo",
        needAtLeastTwo: "Necesitas agregar al menos 2 peliculas para empezar un torneo.",
        backToSearch: "Volver a Buscar",
        loadingTournament: "Cargando torneo...",
        winnerTitle: "🏆 El ganador es! 🏆",
        startNewTournament: "Empezar un nuevo torneo",
        finalBracket: "Bracket final del torneo",
        round: "Ronda",
        of: "de",
        bracket: "Bracket del torneo",
      }
    : {
        choose: "Choose",
        tournamentMode: "Tournament Mode",
        needAtLeastTwo: "You need to add at least 2 movies to start a tournament.",
        backToSearch: "Back to Search",
        loadingTournament: "Loading Tournament...",
        winnerTitle: "🏆 The Winner Is! 🏆",
        startNewTournament: "Start a New Tournament",
        finalBracket: "Final Tournament Bracket",
        round: "Round",
        of: "of",
        bracket: "Tournament Bracket",
      };

  const [stages, setStages] = useState<BracketMatch[][]>([]);
  const [currentStage, setCurrentStage] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [winner, setWinner] = useState<TournamentOption | null>(null);

  const shuffleMovies = <T,>(movies: T[]): T[] => {
    const shuffled = [...movies];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    if (movieList.length > 0) {
      const initialStages = createInitialStages(shuffleMovies(movieList));
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
        <h1 className="text-2xl font-bold mb-4">{ui.tournamentMode}</h1>
        <p className="text-lg text-gray-400">{ui.needAtLeastTwo}</p>
        <div className="flex justify-center p-4">
          <Button variant="danger" onClick={() => navigate("/")}>
            &larr; {ui.backToSearch}
          </Button>
        </div>
      </div>
    );
  }
  if (stages.length === 0) {
    return <div className="text-center p-8">{ui.loadingTournament}</div>;
  }

  const currentMatch = stages[currentStage]?.[currentRound];
  const totalStages = stages.length;
  const stageName = getStageName(currentStage, totalStages);

  return (
    <div className="container mx-auto p-4 md:p-8">
      {winner ? (
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-black dark:text-white">
            {ui.winnerTitle}
          </h1>

          <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
            <h3 className="text-3xl font-bold text-black dark:text-white">
              {winner.title}
            </h3>
            <img
              src={winner.poster}
              alt={winner.title}
              className="rounded-lg shadow-2xl"
            />
            <div className="flex justify-center mb-4">
              <Button
                variant="success"
                onClick={() => {
                  setMovieList([]); // Clear all movies
                  navigate("/");
                }}
              >
                {ui.startNewTournament}
              </Button>
            </div>
          </div>

          {/* Show final bracket with winner */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-center mb-4">
              {ui.finalBracket}
            </h2>
            <div className="overflow-x-auto max-w-full">
              <div className="flex justify-center">
                <BracketVisualization
                  stages={stages}
                  currentStage={stages.length - 1}
                  currentRound={0}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        currentMatch && (
          <div>
            {/* Current Match */}
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">{stageName}</h1>
              <p className="text-gray-400 mb-8">
                {ui.round} {currentRound + 1} {ui.of} {stages[currentStage].length}
              </p>
              <TournamentMatchup
                match={currentMatch}
                onChooseWinner={handleChooseWinner}
                chooseLabel={ui.choose}
              />
            </div>

            {/* Tournament Bracket Visualization */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-center mb-4">
                {ui.bracket}
              </h2>
              <div className="overflow-x-auto max-w-full">
                <div className="flex justify-center">
                  <BracketVisualization
                    stages={stages}
                    currentStage={currentStage}
                    currentRound={currentRound}
                  />
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
