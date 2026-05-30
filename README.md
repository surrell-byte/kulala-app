# Kulala Stories 🌙

Bedtime stories with African magic — a React app built with Vite.

## Getting Started

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Project Structure

```
kulala-stories/
├── index.html
├── vite.config.js
├── package.json
├── public/
│   ├── favicon.svg
│   └── assets/
│       └── images/
│           └── covers/        ← copy your cover images here
└── src/
    ├── main.jsx               ← entry point
    ├── App.jsx                ← root component
    ├── data.js                ← all story content
    ├── config.js              ← app config + fallback cover generator
    ├── hooks.js               ← useVoiceSynthesis, useLocalStorage
    ├── styles.css             ← all styles
    └── components/
        ├── StarField.jsx
        ├── Header.jsx
        ├── HeroBanner.jsx
        ├── ContinueRow.jsx
        ├── StoryRow.jsx
        ├── StoryCard.jsx
        ├── StoryModal.jsx
        ├── AuthScreen.jsx
        └── ProfileTab.jsx
```

## Cover Images

Copy your cover images into `public/assets/images/covers/`.
Story data references them as `/assets/images/covers/filename.png`.

## Build for Production

```bash
npm run build
```

Output goes to `dist/`.
