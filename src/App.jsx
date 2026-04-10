import { useState, useEffect, useRef } from "react";

export default function App() {
  const [started, setStarted] = useState(false);

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      {!started ? (
        <>
          <h1>🌙 Kulala</h1>
          <p>Magical bedtime stories for kids</p>

          <button onClick={() => setStarted(true)}>
            Start Story
          </button>
        </>
      ) : (
        <>
          <h2>✨ Story Time</h2>
          <p>Once upon a time...</p>
        </>
      )}
    </div>
  );
}