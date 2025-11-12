import React from 'react';
import { BracketMatch, TournamentOption } from './TournamentModels';
import { getStageName } from '../../utils/tournamentUtils';

interface BracketVisualizationProps {
  stages: BracketMatch[][];
  currentStage: number;
  currentRound: number;
}

const BracketVisualization: React.FC<BracketVisualizationProps> = ({
  stages,
  currentStage,
  currentRound,
}) => {
  if (stages.length === 0) {
    return null;
  }

  const renderTeam = (option: TournamentOption, isWinner: boolean, isLoser: boolean) => {
    const isPlaceholder = option.id.startsWith('tbd');
    
    return (
      <div className={`flex items-center justify-between py-1 border-b border-slate-600/50 last:border-b-0 ${
        isWinner ? 'bg-green-600/20 font-semibold text-green-400' : ''
      } ${isLoser ? 'opacity-60 text-slate-400' : ''} ${
        isPlaceholder ? 'opacity-40 italic text-slate-500' : 'text-slate-200'
      }`}>
        <div className="flex items-center min-w-0" style={{ width: '140px' }}>
          {!isPlaceholder && (
            <img 
              src={option.poster} 
              alt={option.title}
              className="w-6 h-8 object-cover rounded mr-2 flex-shrink-0"
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
    <div className="min-w-max transform origin-top-left overflow-x-auto p-4 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-600">
      {/* Headers */}
      <div 
        className="grid gap-0 mb-4"
        style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}
      >
        {stages.map((_, stageIndex) => (
          <button 
            key={stageIndex} 
            type="button" 
            className={`bg-slate-800 border border-slate-600 text-slate-300 p-3 rounded-t-lg font-medium transition-all w-48 ${
              stageIndex === currentStage ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'
            }`}
          >
            <div>{getStageName(stageIndex, stages.length)}</div>
          </button>
        ))}
      </div>
      
      {/* Tournament Rounds */}
      <div 
        className="grid gap-0"
        style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 2fr))` }}
      >
        {stages.map((round, stageIndex) => renderRound(round, stageIndex))}
      </div>
    </div>
  );
};

export default BracketVisualization;