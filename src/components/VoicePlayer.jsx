import React, { useState } from 'react';

export const VoicePlayer = ({
  sentences,
  isPlaying,
  isPaused,
  isLoading,
  currentIndex,
  onPlay,
  onPause,
  onResume,
  onSetTimer,
  voiceType,
  setVoiceType,
  accent,
  setAccent,
  showMoral,
  setShowMoral,
  moralText,
  sleepTimerRemaining,
  onBedtimeMode,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const progress = sentences.length ? (currentIndex / sentences.length) * 100 : 0;
  const minutesLeft = sentences.length
    ? Math.max(0, Math.ceil(((sentences.length - currentIndex) / sentences.length) * 7))
    : 0;

  return (
    <div style={{ padding: "0 16px 16px" }}>
      {/* Progress bar */}
      <div
        style={{
          height: "3px",
          background: "rgba(255,255,255,0.08)",
          borderRadius: "3px",
          margin: "0 0 20px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(to right, #f5b042, #e67e22)",
            borderRadius: "3px",
            transition: "width 0.8s linear",
          }}
        />
      </div>

      {/* Main controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          onClick={isPlaying ? (isPaused ? onResume : onPause) : onPlay}
          disabled={isLoading}
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "linear-gradient(145deg, #f5c048, #e07b18)",
            border: "none",
            cursor: isLoading ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "transform 0.15s ease",
            boxShadow: "0 4px 20px rgba(245,176,66,0.35)",
            opacity: isLoading ? 0.7 : 1,
          }}
          onMouseDown={(e) => {
            if (!isLoading) e.currentTarget.style.transform = "scale(0.9)";
          }}
          onMouseUp={(e) => {
            if (!isLoading) e.currentTarget.style.transform = "scale(1)";
          }}
          onTouchStart={(e) => {
            if (!isLoading) e.currentTarget.style.transform = "scale(0.9)";
          }}
          onTouchEnd={(e) => {
            if (!isLoading) e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {isLoading ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
              <path d="M12 3a9 9 0 019 9">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
              </path>
            </svg>
          ) : isPlaying && !isPaused ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1a1a2e">
              <rect x="6" y="4" width="4" height="16" rx="1.5" />
              <rect x="14" y="4" width="4" height="16" rx="1.5" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1a1a2e">
              <polygon points="7,3 21,12 7,21" />
            </svg>
          )}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#fff" }}>
            {isPlaying
              ? isPaused
                ? "Paused"
                : "Playing…"
              : isLoading
              ? "Loading…"
              : "Tap to begin"}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
            {minutesLeft > 0 ? `~${minutesLeft} min left` : "Ready"} · {currentIndex}/{sentences.length} sentences
          </p>
        </div>

        <button
          onClick={() => onSetTimer(15)}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            padding: "6px 10px",
            color: sleepTimerRemaining > 0 ? "#f5b042" : "rgba(255,255,255,0.5)",
            fontSize: "11px",
            fontWeight: 700,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {sleepTimerRemaining > 0 ? `⏳ ${sleepTimerRemaining}m` : "⏱ 15m"}
        </button>

        <button
          onClick={() => setShowSettings((s) => !s)}
          style={{
            background: showSettings ? "rgba(245,176,66,0.15)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${showSettings ? "rgba(245,176,66,0.3)" : "rgba(255,255,255,0.1)"}`,
            borderRadius: "10px",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
          aria-label="Voice settings"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={showSettings ? "#f5b042" : "rgba(255,255,255,0.5)"} strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* Expandable settings panel */}
      {showSettings && (
        <div
          style={{
            marginTop: "16px",
            padding: "14px",
            background: "rgba(255,255,255,0.04)",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", fontWeight: 700, width: "52px", flexShrink: 0 }}>
              VOICE
            </span>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {[
                ["female", "Female"],
                ["male", "Male"],
                ["elder", "Elder"],
              ].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setVoiceType(val)}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: 700,
                    border: "1px solid",
                    cursor: "pointer",
                    background: voiceType === val ? "rgba(245,176,66,0.18)" : "transparent",
                    borderColor: voiceType === val ? "#f5b042" : "rgba(255,255,255,0.15)",
                    color: voiceType === val ? "#f5b042" : "rgba(255,255,255,0.5)",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", fontWeight: 700, width: "52px", flexShrink: 0 }}>
              ACCENT
            </span>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {[
                ["west", "West"],
                ["east", "East"],
                ["southern", "South"],
              ].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setAccent(val)}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: 700,
                    border: "1px solid",
                    cursor: "pointer",
                    background: accent === val ? "rgba(245,176,66,0.18)" : "transparent",
                    borderColor: accent === val ? "#f5b042" : "rgba(255,255,255,0.15)",
                    color: accent === val ? "#f5b042" : "rgba(255,255,255,0.5)",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", fontWeight: 700, width: "52px", flexShrink: 0 }}>
              TIMER
            </span>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {[
                [0, "Off"],
                [5, "5m"],
                [10, "10m"],
                [15, "15m"],
                [30, "30m"],
              ].map(([mins, label]) => (
                <button
                  key={mins}
                  onClick={() => onSetTimer(mins)}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: 700,
                    border: "1px solid rgba(255,255,255,0.15)",
                    cursor: "pointer",
                    background: "transparent",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", fontWeight: 700 }}>
              SHOW MORAL AT END
            </span>
            <button
              onClick={() => setShowMoral((s) => !s)}
              style={{
                width: "40px",
                height: "22px",
                borderRadius: "999px",
                background: showMoral ? "#f5b042" : "rgba(255,255,255,0.12)",
                border: "none",
                cursor: "pointer",
                position: "relative",
                transition: "background 0.2s ease",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "3px",
                  left: showMoral ? "21px" : "3px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left 0.2s ease",
                }}
              />
            </button>
          </div>

          <button
            onClick={onBedtimeMode}
            style={{
              width: "100%",
              padding: "10px",
              background: "rgba(100, 80, 200, 0.15)",
              border: "1px solid rgba(100,80,200,0.3)",
              borderRadius: "12px",
              color: "rgba(200,180,255,0.9)",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.04em",
            }}
          >
            🌙 Start Bedtime Wind‑Down
          </button>
        </div>
      )}

      {/* Moral reveal */}
      {showMoral && moralText && !isPlaying && currentIndex >= sentences.length && (
        <div
          style={{
            marginTop: "16px",
            padding: "14px 16px",
            background: "rgba(245,176,66,0.07)",
            borderRadius: "12px",
            border: "1px solid rgba(245,176,66,0.2)",
            color: "#f5b042",
            fontSize: "13px",
            fontWeight: 600,
            lineHeight: 1.5,
            fontStyle: "italic",
          }}
        >
          {moralText}
        </div>
      )}
    </div>
  );
};