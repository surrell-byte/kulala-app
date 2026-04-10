import React from 'react';
import { SOUNDS } from '../data/stories';

export const BackgroundSoundSelector = ({ activeSound, onSelectSound, volume, onVolumeChange, isPlaying }) => {
  const handleVolumeChange = (val) => {
    onVolumeChange(val);
  };

  return (
    <div className="bg-white/5 rounded-xl p-3 mx-4 md:mx-8 mb-6">
      <div className="text-yellow-300 text-xs md:text-sm font-semibold mb-2">🎵 Background Sounds</div>
      <div className="flex gap-2 flex-wrap">
        {Object.keys(SOUNDS).map(sound => (
          <button
            key={sound}
            onClick={() => onSelectSound(sound)}
            className={`px-3 py-1 rounded-full text-xs md:text-sm capitalize transition ${
              activeSound === sound ? 'bg-yellow-400 text-indigo-950' : 'bg-white/10 text-white/80'
            }`}
          >
            {sound}
          </button>
        ))}
        {activeSound && (
          <button
            onClick={() => onSelectSound(null)}
            className="px-3 py-1 rounded-full text-xs bg-red-500/20 text-red-300"
          >
            Stop
          </button>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-white/60 text-xs">Volume</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="flex-1 h-1 bg-white/20 rounded-full"
        />
      </div>
    </div>
  );
};