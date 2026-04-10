import { useState, useRef, useEffect } from 'react';

const NARRATE_URL = "https://us-central1-kulala-app.cloudfunctions.net/narrateStory";

export default function useVoiceSynthesis() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [error, setError] = useState(null);

  const audioRef = useRef(new Audio());
  const sentencesRef = useRef([]);
  const indexRef = useRef(0);
  const optionsRef = useRef({});
  const onSentenceRef = useRef(null);
  const onCompleteRef = useRef(null);
  const rateRef = useRef(1.0);
  const abortRef = useRef(false);
  const audioUrlsRef = useRef({}); // sentence-index → blob URL cache

  useEffect(() => {
    return () => {
      Object.values(audioUrlsRef.current).forEach(URL.revokeObjectURL);
      audioRef.current.pause();
    };
  }, []);

  const setRate = (r) => {
    rateRef.current = Math.max(0.7, Math.min(1.3, r));
    audioRef.current.playbackRate = rateRef.current;
  };

  const fetchSentenceAudio = async (sentence, storyId, voiceType) => {
    const cacheKey = `${storyId}_${voiceType}_${sentence.length}_${sentence.slice(0, 20)}`;
    if (audioUrlsRef.current[cacheKey]) return audioUrlsRef.current[cacheKey];

    const res = await fetch(NARRATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storyId: `${storyId}_s${indexRef.current}`,
        voiceType,
        text: sentence,
      }),
    });

    if (!res.ok) throw new Error(`Narration fetch failed: ${res.status}`);
    const { url } = await res.json();
    audioUrlsRef.current[cacheKey] = url;
    return url;
  };

  const prefetchNext = (sentences, index, storyId, voiceType) => {
    const next = sentences[index + 1];
    if (!next) return;
    const key = `${storyId}_${voiceType}_${next.length}_${next.slice(0, 20)}`;
    if (!audioUrlsRef.current[key]) {
      fetchSentenceAudio(next, storyId, voiceType).catch(() => {});
    }
  };

  const playSentence = async (sentences, index, storyId, voiceType) => {
    if (abortRef.current || index >= sentences.length) {
      setIsPlaying(false);
      setCurrentSentenceIndex(index);
      if (onCompleteRef.current) onCompleteRef.current();
      return;
    }

    setCurrentSentenceIndex(index);
    indexRef.current = index;
    if (onSentenceRef.current) onSentenceRef.current(index);

    setIsLoading(true);
    try {
      const url = await fetchSentenceAudio(sentences[index], storyId, voiceType);
      if (abortRef.current) return;

      audioRef.current.src = url;
      audioRef.current.playbackRate = rateRef.current;

      setIsLoading(false);

      prefetchNext(sentences, index, storyId, voiceType);

      await audioRef.current.play();

      await new Promise((resolve, reject) => {
        audioRef.current.onended = resolve;
        audioRef.current.onerror = reject;
      });

      if (!abortRef.current && !isPaused) {
        await new Promise((r) => setTimeout(r, 320));
        playSentence(sentences, index + 1, storyId, voiceType);
      }
    } catch (err) {
      setIsLoading(false);
      setError(err.message);
      console.error("Playback error:", err);
      setIsPlaying(false);
    }
  };

  const speakSentences = async (
    sentences,
    options = { rate: 1.0, voiceType: "female", storyId: "unknown" },
    onSentenceChange,
    onComplete
  ) => {
    if (!sentences.length) return;

    abortRef.current = true;
    audioRef.current.pause();
    await new Promise((r) => setTimeout(r, 80));
    abortRef.current = false;

    sentencesRef.current = sentences;
    optionsRef.current = options;
    onSentenceRef.current = onSentenceChange;
    onCompleteRef.current = onComplete;
    rateRef.current = options.rate || 1.0;

    setIsPlaying(true);
    setIsPaused(false);
    setError(null);
    setCurrentSentenceIndex(0);

    playSentence(sentences, 0, options.storyId || "story", options.voiceType || "female");
  };

  const pause = () => {
    audioRef.current.pause();
    setIsPaused(true);
  };

  const resume = () => {
    audioRef.current.play();
    setIsPaused(false);
  };

  const stop = () => {
    abortRef.current = true;
    audioRef.current.pause();
    audioRef.current.src = "";
    setIsPlaying(false);
    setIsPaused(false);
    setIsLoading(false);
    setCurrentSentenceIndex(0);
    indexRef.current = 0;
  };

  return {
    voices: [],
    isPlaying,
    isPaused,
    isLoading,
    currentSentenceIndex,
    error,
    speakSentences,
    pause,
    resume,
    stop,
    setRate,
  };
}