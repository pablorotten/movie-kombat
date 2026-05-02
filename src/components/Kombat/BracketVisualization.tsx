import React from 'react';
import { BracketMatch, KombatOption } from './KombatModels';
import { getStageName } from '../../utils/kombatUtils';

interface BracketVisualizationProps {
  stages: BracketMatch[][];
  currentStage: number;
  currentRound: number;
  onMovieClick?: (option: KombatOption) => void;
}

const BracketVisualization: React.FC<BracketVisualizationProps> = ({
  stages,
  currentStage,
  currentRound,
  onMovieClick,
}) => {
  if (stages.length === 0) {
    return null;
  }

  const renderTeam = (option: KombatOption, isWinner: boolean, isLoser: boolean) => {
    const isPlaceholder = option.id.startsWith('tbd');
    const isClickable = !isPlaceholder && Boolean(onMovieClick);
    
    return (
      <div className={`flex items-center justify-center sm:justify-between py-1 border-b border-slate-600/50 last:border-b-0 ${
        isWinner ? 'bg-green-600/20 font-semibold text-green-400' : ''
      } ${isLoser ? 'opacity-60 text-slate-400' : ''} ${
        isPlaceholder ? 'opacity-40 italic text-slate-500' : 'text-slate-200'
      }`}>
        <div
          className={`flex w-fit min-w-0 items-center justify-center sm:w-[140px] sm:justify-start ${isClickable ? 'cursor-pointer hover:text-blue-300 transition-colors' : ''}`}
          onClick={isClickable ? () => onMovieClick?.(option) : undefined}
          title={isClickable ? option.title : undefined}
        >
          {!isPlaceholder && (
            <img 
              src={option.poster} 
              alt={option.title}
              className="h-12 w-8 flex-shrink-0 rounded object-cover sm:h-8 sm:w-6 sm:mr-2"
            />
          )}
          <span className="text-sm font-medium truncate">
            {isPlaceholder ? 'TBD' : option.title}
          </span>
        </div>
      </div>
    );
  };

  const renderMatch = (match: BracketMatch, stageIndex: number, matchIndex: number) => {
    const isCurrentMatch = stageIndex === currentStage && matchIndex === currentRound;
    const isFinished = match.winnerTitle !== '';
    const isWinnerFirst = match.winnerTitle === match.first.title;
    const isWinnerSecond = match.winnerTitle === match.second.title;

    return (
      <div
        key={`${stageIndex}-${matchIndex}`}
        className="flex items-center justify-center h-full"
      >
        <div 
          className={`bg-slate-800 border rounded-md transition-all w-full mx-0.5 ${
            isCurrentMatch && !isFinished ? 'border-blue-500 bg-blue-900/30 ring-2 ring-blue-500/50' : 
            isFinished ? 'border-green-600 bg-slate-800' :
            'border-slate-600 hover:border-blue-500'
          }`}
        >
          <div className="p-2 cursor-pointer">
            {renderTeam(match.first, isWinnerFirst, isWinnerSecond)}
            {renderTeam(match.second, isWinnerSecond, isWinnerFirst)}
          </div>
        </div>
      </div>
    );
  };

  const renderRound = (round: BracketMatch[], stageIndex: number) => {
    const isFinalRound = stageIndex === stages.length - 1;

    return (
      <div 
        key={stageIndex}
        className={`flex flex-col justify-evenly h-full ${isFinalRound ? 'pr-0' : 'px-2'}`}
      >
        {round.map((match, matchIndex) => 
          renderMatch(match, stageIndex, matchIndex)
        )}
      </div>
    );
  };

  return (
    <div className="min-w-0 sm:min-w-max transform origin-top-left overflow-x-auto p-4 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-600">
      {/* Headers */}
      <div 
        className="grid gap-0 mb-4"
        style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}
      >
        {stages.map((_, stageIndex) => (
          <button 
            key={stageIndex} 
            type="button" 
            className={`w-full rounded-t-lg border border-slate-600 bg-slate-800 p-2 text-center text-xs font-medium text-slate-300 transition-all sm:w-48 sm:p-3 sm:text-base ${
              stageIndex === currentStage ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'
            }`}
          >
            <div>{getStageName(stageIndex, stages.length)}</div>
          </button>
        ))}
      </div>
      
      {/* Kombat Rounds */}
      <div 
        className="grid gap-0"
        style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}
      >
        {stages.map((round, stageIndex) => renderRound(round, stageIndex))}
      </div>
    </div>
  );
};

export default BracketVisualization;
