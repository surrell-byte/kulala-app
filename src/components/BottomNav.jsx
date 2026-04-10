import React from 'react';

const NAV_TABS = [
  { id: "home", label: "Home", icon: (active) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#f5b042" : "rgba(255,255,255,0.45)"} strokeWidth={active ? 2.5 : 1.8}>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  ) },
  { id: "library", label: "Library", icon: (active) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#f5b042" : "rgba(255,255,255,0.45)"} strokeWidth={active ? 2.5 : 1.8}>
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  ) },
  null, // centre slot
  { id: "favorites", label: "Saved", icon: (active) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "#f5b042" : "none"} stroke={active ? "#f5b042" : "rgba(255,255,255,0.45)"} strokeWidth={active ? 2.5 : 1.8}>
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  ) },
  { id: "profile", label: "Profile", icon: (active) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#f5b042" : "rgba(255,255,255,0.45)"} strokeWidth={active ? 2.5 : 1.8}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ) },
];

export const BottomNav = ({ activeTab, setActiveTab, nowPlaying, voiceState, onPillTap, onPlayPause, onCentrePress }) => {
  const pillVisible = !!nowPlaying;
  return (
    <>
      {/* Now-Playing Pill */}
      <div
        className={`fixed left-4 right-4 bg-[rgba(26,22,54,0.97)] border border-yellow-400/25 rounded-2xl p-2.5 flex items-center gap-2.5 z-45 cursor-pointer backdrop-blur-xl transition-all duration-400 ${
          pillVisible ? 'bottom-[calc(72px+env(safe-area-inset-bottom,0px)+10px)] opacity-100' : 'bottom-[calc(72px+env(safe-area-inset-bottom,0px)-80px)] opacity-0 pointer-events-none'
        }`}
        onClick={onPillTap}
      >
        <div className="w-9 h-9 rounded-xl bg-yellow-400/20 border border-yellow-400/20 flex items-center justify-center text-lg flex-shrink-0">
          {nowPlaying?.icon || "📖"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-[13px] font-bold truncate">{nowPlaying?.title || ""}</p>
          <div className="mt-1 h-0.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-400 rounded-full transition-width duration-1000" style={{ width: `${nowPlaying?.progress || 0}%` }} />
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onPlayPause(); }}
          className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0 transition-transform active:scale-90"
        >
          {voiceState.isPlaying && !voiceState.isPaused ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#1a1a2e"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#1a1a2e"><polygon points="6,3 20,12 6,21" /></svg>
          )}
        </button>
      </div>

      {/* Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-[calc(64px+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)] bg-[rgba(8,8,24,0.96)] border-t border-white/10 backdrop-blur-2xl flex items-center justify-around z-50">
        {NAV_TABS.map((tab, i) => {
          if (tab === null) {
            return (
              <button
                key="centre"
                onClick={onCentrePress}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 border-3 border-[rgba(8,8,24,1)] shadow-[0_0_0_1px_rgba(245,176,66,0.3)] flex items-center justify-center cursor-pointer -mt-5 transition-transform active:scale-90"
                aria-label="Play"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1a1a2e"><polygon points="6,3 20,12 6,21" /></svg>
              </button>
            );
          }
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[44px]"
              aria-label={tab.label}
            >
              {tab.icon(isActive)}
              <div className={`w-1 h-1 rounded-full transition-colors ${isActive ? 'bg-yellow-400' : 'bg-transparent'}`} />
            </button>
          );
        })}
      </div>
    </>
  );
};