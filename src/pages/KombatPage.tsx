import { useEffect, useRef, useState } from "react";
import { useMovies } from "../context/MovieContext";
import {
  BracketMatch,
  KombatOption,
} from "../components/Kombat/KombatModels";
import { createInitialStages, getStageName } from "../utils/kombatUtils";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import PosterImage from "../components/PosterImage";
import BracketVisualization from "../components/Kombat/BracketVisualization";
import {
  getMovieProvidersForRegion,
  getRegionByCode,
  type WatchProvider,
} from "../services/tmdbService";
import { ProviderLogo } from "../components/ProviderLogo";

type Fatality = "slice" | "explode" | "smash";
const ALL_FATALITIES: Fatality[] = ["slice", "explode", "smash"];

// Animation phase delays (ms from click)
const FINISH_HIM_DELAY  = 200;  // "FINISH HIM!" text appears
const CHARGE_DELAY      = 700;  // winner charges toward loser
const FATALITY_DELAY    = 1200; // fatality plays on loser
const FATALITY_TEXT_DELAY = 1700; // "FATALITY!" text appears
const ADVANCE_DELAY     = 2300; // bracket advances to next match

// Animation phases:
// -1 – idle (no animation)
//  0 – animation started, buttons hidden
//  1 – "FINISH HIM!" text
//  2 – winner charges toward loser
//  3 – fatality plays on loser
//  4 – "FATALITY!" text
const KombatMatchup = ({
  match,
  onChooseWinner,
  chooseLabel,
}: {
  match: BracketMatch;
  onChooseWinner: (winner: KombatOption) => void;
  chooseLabel: string;
  isSpanish?: boolean;
}) => {
  const [phase, setPhase] = useState(-1);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [fatality, setFatality] = useState<Fatality>("explode");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const onChooseWinnerRef = useRef(onChooseWinner);
  onChooseWinnerRef.current = onChooseWinner;

  // Clean up timers when unmounted
  useEffect(() => {
    return () => { timersRef.current.forEach(clearTimeout); };
  }, []);

  const handleChoose = (winner: KombatOption) => {
    timersRef.current.forEach(clearTimeout);
    setFatality(ALL_FATALITIES[Math.floor(Math.random() * ALL_FATALITIES.length)]);
    setWinnerId(winner.id);
    setPhase(0);
    timersRef.current = [
      setTimeout(() => setPhase(1), FINISH_HIM_DELAY),
      setTimeout(() => setPhase(2), CHARGE_DELAY),
      setTimeout(() => setPhase(3), FATALITY_DELAY),
      setTimeout(() => setPhase(4), FATALITY_TEXT_DELAY),
      // Advance the bracket after the animation completes
      setTimeout(() => { onChooseWinnerRef.current(winner); }, ADVANCE_DELAY),
    ];
  };

  const animating = phase >= 0;
  const isFirstWinner = winnerId === match.first.id;

  const ui = { finishHim: "FINISH HIM!!", fatality: "FATALITY!" };

  // Determine which CSS class to apply to the loser's poster wrapper.
  // Slice fatality doesn't need a wrapper class — it's handled with split JSX halves below.
  const loserFatalityClass = phase >= 3
    ? fatality === "explode"
      ? "kombat-loser-explode"
      : fatality === "smash"
        // Smash direction: loser on right → smash right; loser on left → smash left
        ? isFirstWinner ? "kombat-loser-smash-right" : "kombat-loser-smash-left"
        : "" // slice: no wrapper class needed
    : "";

  const showSlice = fatality === "slice" && phase >= 3;

  const renderPoster = (movie: KombatOption, side: "first" | "second") => {
    const isThisWinner = animating && ((side === "first") === isFirstWinner);
    const isThisLoser = animating && !isThisWinner;

    const wrapperClass = isThisWinner && phase >= 2
      ? (side === "first" ? "kombat-winner-charge-right" : "kombat-winner-charge-left")
      : isThisLoser
        ? loserFatalityClass
        : "";

    return (
      <div className={`w-full max-w-xs mx-auto ${wrapperClass}`}>
        {isThisLoser && showSlice ? (
          /* Slice fatality: two clipped halves that fly apart */
          <div className="relative aspect-[2/3] rounded-lg">
            <div className="kombat-slice-top">
              <PosterImage className="w-full h-full object-cover" src={movie.poster} alt={movie.title} title={movie.title} />
            </div>
            <div className="kombat-slice-bottom">
              <PosterImage className="w-full h-full object-cover" src={movie.poster} alt={movie.title} title={movie.title} />
            </div>
            {/* Red slash line */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-red-500 shadow-[0_0_8px_4px_rgba(239,68,68,0.8)] z-10" />
          </div>
        ) : (
          <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-700 shadow-lg">
            <PosterImage className="w-full h-full object-cover" src={movie.poster} alt={movie.title} title={movie.title} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative grid grid-cols-2 gap-4 md:gap-8 items-start">
      {/* "FINISH HIM!" / "FATALITY!" text — floats above the posters */}
      {animating && (
        <div className="absolute inset-x-0 top-1/3 flex items-center justify-center z-10 pointer-events-none">
          {phase >= 1 && phase < 4 && <p className="kombat-finish-him">{ui.finishHim}</p>}
          {phase >= 4 && <p className="kombat-fatality">{ui.fatality}</p>}
        </div>
      )}

      {/* First Movie */}
      <div className="flex flex-col items-center gap-4">
        <h3 className="text-xl font-bold text-center h-8 w-full overflow-hidden whitespace-nowrap text-ellipsis">
          {match.first.title}
        </h3>
        {renderPoster(match.first, "first")}
        {!animating && (
          <div className="mt-4">
            <Button variant="primary" onClick={() => handleChoose(match.first)}>
              {chooseLabel}
            </Button>
          </div>
        )}
      </div>

      {/* Second Movie */}
      <div className="flex flex-col items-center gap-4">
        <h3 className="text-xl font-bold text-center h-8 w-full overflow-hidden whitespace-nowrap text-ellipsis">
          {match.second.title}
        </h3>
        {renderPoster(match.second, "second")}
        {!animating && (
          <div className="mt-4">
            <Button variant="primary" onClick={() => handleChoose(match.second)}>
              {chooseLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function KombatPage() {
  const { movieList, setMovieList, searchLanguage, selectedRegion } = useMovies();
  const navigate = useNavigate();
  const isSpanish = searchLanguage === "es-ES";
  const ui = isSpanish
    ? {
        choose: "Elegir",
        kombatMode: "Modo Kombat",
        needAtLeastTwo: "Necesitas agregar al menos 2 peliculas para empezar un Kombat.",
        backToSearch: "Volver a Buscar",
        loadingKombat: "Cargando Kombat...",
        winnerTitle: "🏆 El ganador es! 🏆",
        startNewKombat: "Empezar un nuevo Kombat",
        finalBracket: "Bracket final del Kombat",
        availableOn: "Disponible en",
        noPlatforms: "No hay plataformas disponibles para este pais.",
        round: "Ronda",
        of: "de",
        bracket: "Bracket del Kombat",
      }
    : {
        choose: "Choose",
        kombatMode: "Kombat Mode",
        needAtLeastTwo: "You need to add at least 2 movies to start a Kombat.",
        backToSearch: "Back to Search",
        loadingKombat: "Loading Kombat...",
        winnerTitle: "🏆 The Winner Is! 🏆",
        startNewKombat: "Start a New Kombat",
        finalBracket: "Final Kombat Bracket",
        availableOn: "Available on",
        noPlatforms: "No platforms available in this country.",
        round: "Round",
        of: "of",
        bracket: "Kombat Bracket",
      };

  const [stages, setStages] = useState<BracketMatch[][]>([]);
  const [currentStage, setCurrentStage] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [winner, setWinner] = useState<KombatOption | null>(null);
  const [winnerProviders, setWinnerProviders] = useState<WatchProvider[]>([]);
  const [isBracketOpen, setIsBracketOpen] = useState(false);

  const getTMDBMovieUrl = (option: KombatOption): string => {
    if (option.id.startsWith("tmdb_")) {
      const tmdbId = Number(option.id.slice(5));
      if (Number.isFinite(tmdbId)) {
        return `https://www.themoviedb.org/movie/${tmdbId}`;
      }
    }

    return `https://www.themoviedb.org/search?query=${encodeURIComponent(option.title)}`;
  };

  const handleOpenMovieInTMDB = (option: KombatOption) => {
    window.open(getTMDBMovieUrl(option), "_blank", "noopener,noreferrer");
  };

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

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    if (!winner || !winner.id.startsWith("tmdb_")) {
      setWinnerProviders([]);
      return;
    }

    const tmdbId = Number(winner.id.slice(5));
    if (!Number.isFinite(tmdbId)) {
      setWinnerProviders([]);
      return;
    }

    let isActive = true;
    const loadProviders = async () => {
      try {
        const providers = await getMovieProvidersForRegion(tmdbId, selectedRegion);
        if (isActive) {
          setWinnerProviders(providers);
        }
      } catch {
        if (isActive) {
          setWinnerProviders([]);
        }
      }
    };

    loadProviders();
    return () => {
      isActive = false;
    };
  }, [winner, selectedRegion]);

  const handleChooseWinner = (roundWinner: KombatOption) => {
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
      // This was the final match, we have a kombat winner!
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
        <h1 className="text-2xl font-bold mb-4">{ui.kombatMode}</h1>
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
    return <div className="text-center p-8">{ui.loadingKombat}</div>;
  }

  const currentMatch = stages[currentStage]?.[currentRound];
  const totalStages = stages.length;
  const stageName = getStageName(currentStage, totalStages);
  const regionName = getRegionByCode(selectedRegion)?.english_name || selectedRegion;

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
            <a
              href={getTMDBMovieUrl(winner)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:text-blue-400 underline"
            >
              TMDB
            </a>
            <div className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-3 bg-white/70 dark:bg-gray-800/60">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {ui.availableOn} ({regionName})
              </p>
              {winnerProviders.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-2">
                  {winnerProviders.map((provider) => (
                    <div
                      key={provider.provider_id}
                      title={provider.provider_name}
                      className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 rounded-md px-2 py-1"
                    >
                      <ProviderLogo
                        logoPath={provider.logo_path}
                        providerName={provider.provider_name}
                        className="w-5 h-5"
                      />
                      <span className="text-xs text-gray-700 dark:text-gray-200">
                        {provider.provider_name}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">{ui.noPlatforms}</p>
              )}
            </div>
            <div className="flex justify-center mb-4">
              <Button
                variant="success"
                onClick={() => {
                  setMovieList([]); // Clear all movies
                  navigate("/");
                }}
              >
                {ui.startNewKombat}
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
                  onMovieClick={handleOpenMovieInTMDB}
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
              <KombatMatchup
                key={`${currentMatch.first.id}-${currentMatch.second.id}`}
                match={currentMatch}
                onChooseWinner={handleChooseWinner}
                chooseLabel={ui.choose}
              />
            </div>

            {/* Kombat Bracket Visualization */}
            <div className="mt-12 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg dark:border-gray-600 dark:from-gray-800 dark:to-gray-700">
              <button
                type="button"
                onClick={() => setIsBracketOpen((current) => !current)}
                className="w-full rounded-xl p-6 text-left transition-colors hover:bg-blue-100 dark:hover:bg-gray-600"
              >
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {ui.bracket}
                  </h2>
                  <svg
                    className={`h-6 w-6 text-gray-600 transition-transform dark:text-gray-300 ${isBracketOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {isBracketOpen && (
                <div className="px-6 pb-6">
                  <div className="overflow-x-auto max-w-full">
                    <div className="flex justify-center">
                      <BracketVisualization
                        stages={stages}
                        currentStage={currentStage}
                        currentRound={currentRound}
                        onMovieClick={handleOpenMovieInTMDB}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}
