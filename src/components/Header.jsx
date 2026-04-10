import React, { useRef, useState } from 'react';

export const Header = ({ isPremium, onUpgrade, calmMode, setCalmMode }) => {
  const pressTimer = useRef(null);
  const [moonPressed, setMoonPressed] = useState(false);

  const startPress = () => {
    setMoonPressed(true);
    pressTimer.current = setTimeout(() => {
      setCalmMode(c => !c);
      setMoonPressed(false);
    }, 600);
  };
  const cancelPress = () => {
    clearTimeout(pressTimer.current);
    setMoonPressed(false);
  };

  return (
    <div className="sticky top-0 z-20 py-4 px-5 flex justify-between items-center bg-gradient-to-b from-black/75 to-transparent">
      <div className="flex items-center gap-2">
        <button
          onMouseDown={startPress}
          onMouseUp={cancelPress}
          onMouseLeave={cancelPress}
          onTouchStart={startPress}
          onTouchEnd={cancelPress}
          className={`text-2xl transition-transform ${moonPressed ? 'scale-85' : 'scale-100'} ${calmMode ? 'brightness-70' : ''}`}
          title="Hold for calm mode"
        >
          🌙
        </button>
        <span className="font-quicksand text-xl font-extrabold text-white tracking-wide">Kulala</span>
        {calmMode && <span className="text-[10px] text-white/50 font-semibold tracking-wide ml-1">CALM</span>}
      </div>
      {!isPremium && (
        <button
          onClick={onUpgrade}
          className="bg-gradient-to-r from-yellow-500 to-orange-600 text-indigo-950 text-[11px] font-extrabold py-1.5 px-4 rounded-full"
        >
          ✨ Upgrade
        </button>
      )}
    </div>
  );
};