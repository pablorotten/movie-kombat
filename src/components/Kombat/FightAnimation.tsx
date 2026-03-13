import { useEffect, useRef, useState } from "react";
import { KombatOption } from "./KombatModels";
import PosterImage from "../PosterImage";

type Fatality = "slice" | "explode" | "smash";

const ALL_FATALITIES: Fatality[] = ["slice", "explode", "smash"];

// Animation phase schedule (delay in ms from component mount)
const PHASE_SCHEDULE = [
  { phase: 1, delay: 300 },   // "FINISH HIM!" text appears
  { phase: 2, delay: 900 },   // winner charges toward loser
  { phase: 3, delay: 1400 },  // fatality plays on loser
  { phase: 4, delay: 2000 },  // "FATALITY!" text appears
  { phase: 5, delay: 3000 },  // fade-out begins
] as const;

const ANIMATION_COMPLETE_DELAY = 3300; // total duration before onComplete fires

interface FightAnimationProps {
  winner: KombatOption;
  loser: KombatOption;
  onComplete: () => void;
  isSpanish?: boolean;
}

// Animation phases:
// 0 – fighters appear
// 1 – "FINISH HIM!" flashes
// 2 – winner charges toward loser
// 3 – fatality plays on loser
// 4 – "FATALITY!" text
// 5 – fade out & trigger onComplete
export default function FightAnimation({
  winner,
  loser,
  onComplete,
  isSpanish,
}: FightAnimationProps) {
  const [phase, setPhase] = useState(0);
  const [fatality] = useState<Fatality>(
    () => ALL_FATALITIES[Math.floor(Math.random() * ALL_FATALITIES.length)]
  );

  // Keep a stable ref so the timeout closure always calls the latest callback.
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  useEffect(() => {
    const timers = PHASE_SCHEDULE.map(({ phase: p, delay }) =>
      setTimeout(() => setPhase(p), delay)
    );
    const doneTimer = setTimeout(() => completeRef.current(), ANIMATION_COMPLETE_DELAY);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(doneTimer);
    };
  }, []);

  const ui = isSpanish
    ? { finishHim: "¡TERMÍNALO!", fatality: "¡FATALIDAD!" }
    : { finishHim: "FINISH HIM!!", fatality: "FATALITY!" };

  // Winner is always displayed on the left, loser on the right (mirrored).
  const winnerChargeClass = phase >= 2 ? "kombat-winner-charge" : "";
  const loserFatalityClass =
    phase >= 3
      ? fatality === "explode"
        ? "kombat-loser-explode"
        : fatality === "smash"
        ? "kombat-loser-smash"
        : "" // slice uses inner half-divs
      : "";

  const showSliceHalves = fatality === "slice" && phase >= 3;

  return (
    /* Semi-transparent backdrop */
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isSpanish ? "Animación de pelea" : "Fight animation"}
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 bg-black/70 ${
        phase >= 5 ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Popup card */}
      <div className="kombat-arena rounded-2xl border border-purple-900/60 shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Text area */}
        <div className="flex items-center justify-center h-16">
          {phase >= 1 && phase < 4 && (
            <p className="kombat-finish-him">{ui.finishHim}</p>
          )}
          {phase >= 4 && <p className="kombat-fatality">{ui.fatality}</p>}
        </div>

        {/* Fighters */}
        <div className="flex items-end justify-around w-full px-6 pb-6 gap-2">
          {/* Left fighter – winner */}
          <div className="flex flex-col items-center gap-1 flex-1">
            <p className="text-white font-bold text-xs text-center line-clamp-2 max-w-24">
              {winner.title}
            </p>
            <div className={`w-24 ${winnerChargeClass}`}>
              <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
                <PosterImage
                  className="w-full h-full object-cover"
                  src={winner.poster}
                  alt={winner.title}
                  title={winner.title}
                />
              </div>
            </div>
          </div>

          {/* VS separator */}
          <div className="text-white/30 font-black text-lg self-center pb-8 flex-shrink-0">
            VS
          </div>

          {/* Right fighter – loser (inner div mirrored so it "faces" the winner) */}
          <div className="flex flex-col items-center gap-1 flex-1">
            <p className="text-white font-bold text-xs text-center line-clamp-2 max-w-24">
              {loser.title}
            </p>
            {/* Outer wrapper: handles fatality movement in screen coordinates */}
            <div className={`w-24 ${loserFatalityClass}`}>
              {/* Inner mirror: flips poster so loser faces the winner */}
              <div style={{ transform: "scaleX(-1)" }}>
                {showSliceHalves ? (
                  /* Slice fatality: two clipped halves that fly apart */
                  <div className="relative aspect-[2/3] rounded-lg">
                    {/* Top half */}
                    <div className="kombat-slice-top">
                      <PosterImage
                        className="w-full h-full object-cover"
                        src={loser.poster}
                        alt={loser.title}
                        title={loser.title}
                      />
                    </div>
                    {/* Bottom half */}
                    <div className="kombat-slice-bottom">
                      <PosterImage
                        className="w-full h-full object-cover"
                        src={loser.poster}
                        alt={loser.title}
                        title={loser.title}
                      />
                    </div>
                    {/* Red slash line between the halves */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-red-500 shadow-[0_0_8px_4px_rgba(239,68,68,0.8)] z-10" />
                  </div>
                ) : (
                  <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
                    <PosterImage
                      className="w-full h-full object-cover"
                      src={loser.poster}
                      alt={loser.title}
                      title={loser.title}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
