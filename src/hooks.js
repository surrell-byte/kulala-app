import { useState, useEffect, useRef, useCallback } from 'react';

export function useVoiceSynthesis() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const rateRef = useRef(0.88);
  const isPausedRef = useRef(false);
  const synth = window.speechSynthesis;

  useEffect(() => {
    const loadVoices = () => { synth.getVoices(); };
    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }
    return () => {
      synth.cancel();
      isPausedRef.current = false;
    };
  }, []);

  const applyAccent = (text, type) => {
    if (!text) return '';
    if (type === 'west')     return text.replace(/th/g, 'd').replace(/r\b/g, 'rr');
    if (type === 'east')     return text.replace(/th/g, 't');
    if (type === 'southern') return text.replace(/\ba\b/g, 'ah');
    return text;
  };

  const speakSentences = useCallback((sentences, options = {}) => {
    if (!sentences?.length) return;
    synth.cancel();
    isPausedRef.current = false;

    const available = synth.getVoices();
    let voice = null;

    if (options.voiceType === 'female') {
      voice = available.find(v =>
        v.name.toLowerCase().includes('samantha') ||
        v.name.toLowerCase().includes('google uk english female') ||
        v.name.toLowerCase().includes('zira')
      );
    } else if (options.voiceType === 'male') {
      voice = available.find(v =>
        v.name.toLowerCase().includes('daniel') ||
        v.name.toLowerCase().includes('google uk english male') ||
        v.name.toLowerCase().includes('david')
      );
    } else if (options.voiceType === 'elder') {
      voice = available.find(v =>
        v.name.toLowerCase().includes('daniel') ||
        v.name.toLowerCase().includes('alex')
      );
    }
    if (!voice) voice = available[0] || null;

    let idx = 0;

    const next = () => {
      if (idx >= sentences.length) {
        setIsPlaying(false);
        setCurrentIdx(-1);
        return;
      }
      setCurrentIdx(idx);
      const text = applyAccent(sentences[idx], options.accent);
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = rateRef.current;
      utt.pitch = options.voiceType === 'elder' ? 0.65 : 1.0;
      if (voice) utt.voice = voice;
      utt.onend = () => { idx++; if (!isPausedRef.current) next(); };
      utt.onerror = () => { setIsPlaying(false); setCurrentIdx(-1); };
      synth.speak(utt);
    };

    setIsPlaying(true);
    setIsPaused(false);
    next();
  }, []);

  const pause = useCallback(() => {
    if (synth.speaking && !synth.paused) {
      synth.pause();
      isPausedRef.current = true;
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (synth.paused) {
      synth.resume();
      isPausedRef.current = false;
      setIsPaused(false);
    }
  }, []);

  const stop = useCallback(() => {
    synth.cancel();
    isPausedRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentIdx(-1);
  }, []);

  const setRate = useCallback((r) => {
    rateRef.current = Math.max(0.5, Math.min(1.3, r));
  }, []);

  return { isPlaying, isPaused, currentIdx, speakSentences, pause, resume, stop, setRate };
}

export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch { return defaultValue; }
  });

  const setStored = useCallback((val) => {
    setValue(val);
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }, [key]);

  return [value, setStored];
}
