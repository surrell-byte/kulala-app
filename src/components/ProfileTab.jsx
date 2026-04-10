import React, { useState } from 'react';

export const ProfileTab = ({ userProfile, favorites, progress, badges, isPremium, onUpgrade, onUpdateProfile, onLogout }) => {
  const [tempName, setTempName] = useState(userProfile?.nickname || "");
  const [tempAge, setTempAge] = useState(userProfile?.age || "4-6");
  const [tempAvatar, setTempAvatar] = useState(userProfile?.avatar || "🌙");
  const avatars = ["🌙", "🦁", "🐘", "🦒", "🐒", "⭐", "🌳", "🦉"];

  const saveProfile = () => {
    onUpdateProfile({ nickname: tempName, age: tempAge, avatar: tempAvatar });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="text-5xl">{tempAvatar}</div>
          <div>
            <h2 className="text-white text-xl md:text-2xl font-bold">{tempName || "Dreamer"}</h2>
            <p className="text-indigo-200 text-sm md:text-base">
              {isPremium ? "✨ Premium Member" : "Free Member"}
            </p>
          </div>
        </div>

        {!isPremium && (
          <button onClick={onUpgrade} className="w-full premium-badge text-indigo-950 font-bold py-2 rounded-full shadow-lg">
            ⭐ Upgrade to Premium (Unlock All Stories)
          </button>
        )}

        <div className="border-t border-white/10 pt-4 space-y-3">
          <div>
            <label className="text-white/80 text-sm md:text-base">Nickname</label>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="w-full mt-1 bg-white/10 rounded-full px-3 py-2 text-white text-sm md:text-base"
            />
          </div>

          <div>
            <label className="text-white/80 text-sm md:text-base">Age</label>
            <select
              value={tempAge}
              onChange={(e) => setTempAge(e.target.value)}
              className="w-full mt-1 bg-white/10 rounded-full px-3 py-2 text-white text-sm md:text-base"
            >
              <option value="2-4">2–4</option>
              <option value="4-6">4–6</option>
              <option value="6-8">6–8</option>
              <option value="8-10">8–10</option>
            </select>
          </div>

          <div>
            <label className="text-white/80 text-sm md:text-base">Avatar</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {avatars.map(av => (
                <button
                  key={av}
                  onClick={() => setTempAvatar(av)}
                  className={`text-2xl p-2 rounded-full ${tempAvatar === av ? 'bg-yellow-400/30 border border-yellow-400' : 'bg-white/10'}`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <button onClick={saveProfile} className="w-full py-2 bg-yellow-400/20 rounded-full text-yellow-300 text-sm md:text-base">
            Save Profile
          </button>
        </div>

        <div className="border-t border-white/10 pt-4">
          <h3 className="text-white font-semibold text-sm md:text-base mb-2">🏆 Achievements & Streaks</h3>
          <div className="flex justify-between mb-2">
            <span className="text-white/70 text-xs md:text-sm">Current Streak</span>
            <span className="text-yellow-400 font-bold text-sm md:text-base">{progress.streak} days 🔥</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-white/70 text-xs md:text-sm">Total Stories Read</span>
            <span className="text-yellow-400 font-bold text-sm md:text-base">{progress.totalStoriesRead}</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {badges.map(badge => (
              <div key={badge.id} className="bg-white/10 rounded-full px-2 py-1 text-xs flex items-center gap-1">
                <span>{badge.icon}</span> <span className="text-white/80">{badge.name}</span>
              </div>
            ))}
            {badges.length === 0 && (
              <span className="text-white/40 text-xs">Complete stories to earn badges ✨</span>
            )}
          </div>
        </div>

        <button onClick={onLogout} className="w-full py-2 bg-red-500/20 rounded-full text-red-300 text-sm md:text-base mt-2">
          Sign Out
        </button>
      </div>
      <div className="mt-4 text-center text-xs text-white/40">⭐ Maji Series · Season 1</div>
    </div>
  );
};