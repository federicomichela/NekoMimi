
import React from 'react';
import { PetState, PetAction } from '../types';

interface OverlayProps {
  petState: PetState;
  reasoning: string;
  isProcessing: boolean;
  onToggleAuto: () => void;
  isAuto: boolean;
  onManualTrigger: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({ 
  petState, 
  reasoning, 
  isProcessing, 
  onToggleAuto, 
  isAuto,
  onManualTrigger 
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border-2 border-pink-200">
          <h1 className="text-3xl font-bold text-pink-600 mb-1">NekoMimi Controller</h1>
          <p className="text-gray-600 text-sm">Control your anime cat with gestures!</p>
        </div>
        
        {/* Status Badge */}
        <div className={`px-6 py-3 rounded-full shadow-lg backdrop-blur-md border-2 transition-all duration-300 ${
          petState.action === PetAction.STRIKE ? 'bg-red-100 border-red-400 text-red-600' :
          petState.action === PetAction.PAT ? 'bg-green-100 border-green-400 text-green-600' :
          petState.action === PetAction.CALL ? 'bg-blue-100 border-blue-400 text-blue-600' :
          'bg-white/90 border-pink-300 text-pink-600'
        }`}>
          <div className="text-sm font-semibold uppercase tracking-wider opacity-70">Current Mood</div>
          <div className="text-2xl font-bold flex items-center gap-2">
            {petState.mood} 
            <span className="text-lg opacity-80">({petState.action})</span>
          </div>
        </div>
      </div>

      {/* Center - Reasoning/Logs */}
      <div className="self-center mt-auto mb-8 pointer-events-auto">
         {reasoning && (
             <div className="bg-black/50 backdrop-blur-md text-white px-6 py-3 rounded-xl mb-4 max-w-md text-center shadow-xl">
                 <span className="opacity-70 text-xs uppercase block mb-1">Gemini Analysis</span>
                 "{reasoning}"
             </div>
         )}
      </div>

      {/* Bottom Controls */}
      <div className="pointer-events-auto bg-white/90 backdrop-blur-lg p-6 rounded-3xl shadow-xl border border-pink-100 flex flex-col md:flex-row gap-6 items-center mx-auto max-w-4xl w-full">
        
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 w-full text-xs text-center text-gray-500 font-medium">
             <div className="bg-pink-50 p-2 rounded-lg border border-pink-100">
                <span className="block text-xl mb-1">✌️</span>
                Walk (Steer)
             </div>
             <div className="bg-pink-50 p-2 rounded-lg border border-pink-100">
                <span className="block text-xl mb-1">😗</span>
                Whistle (Come)
             </div>
             <div className="bg-pink-50 p-2 rounded-lg border border-pink-100">
                <span className="block text-xl mb-1">👍</span>
                Jump
             </div>
             <div className="bg-pink-50 p-2 rounded-lg border border-pink-100">
                <span className="block text-xl mb-1">✋</span>
                Sit
             </div>
             <div className="bg-pink-50 p-2 rounded-lg border border-pink-100">
                <span className="block text-xl mb-1">👊</span>
                Strike
             </div>
             <div className="bg-pink-50 p-2 rounded-lg border border-pink-100">
                <span className="block text-xl mb-1">👋</span>
                Pat
             </div>
             <div className="bg-pink-50 p-2 rounded-lg border border-pink-100">
                <span className="block text-xl mb-1">💫</span>
                Roll
             </div>
        </div>

        <div className="flex gap-3 items-center border-l pl-6 border-gray-200">
           
           <button 
             onClick={onToggleAuto}
             className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl transition-all shadow-md ${
                isAuto 
                ? 'bg-gradient-to-br from-green-400 to-emerald-600 text-white ring-4 ring-green-100' 
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
             }`}
           >
             <span className={`text-2xl mb-1 ${isProcessing && isAuto ? 'animate-spin' : ''}`}>
               {isAuto ? '🔄' : '⏸️'}
             </span>
             <span className="text-xs font-bold">{isAuto ? 'LIVE ON' : 'PAUSED'}</span>
           </button>

           <button 
             onClick={onManualTrigger}
             disabled={isAuto || isProcessing}
             className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
           >
              <span className="text-2xl mb-1">📸</span>
              <span className="text-xs font-bold">SNAP</span>
           </button>
        </div>

      </div>
    </div>
  );
};
