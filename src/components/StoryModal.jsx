import React, { useState, useEffect } from 'react';
import { VoicePlayer } from './VoicePlayer';
import { generateFallbackCover } from '../utils/helpers';

export const StoryModal = ({ story, isOpen, onClose, onPlayVoice, voiceState, onSetTimer, userName, voiceType, setVoiceType, accent, setAccent, showMoral, setShowMoral, sleepTimerRemaining, calmMode, onComplete, onProgressUpdate, onBedtimeMode }) => {
  const [sentences, setSentences] = useState([]);
  const [moralText, setMoralText] = useState("");

  useEffect(() => {
    if (story) {
      const personalizedBody = story.body.replace(/\{name\}/g, userName || "little one");
      const split = personalizedBody.match(/[^.!?]+[.!?]+/g) || [personalizedBody];
      setSentences(split);
      setMoralText(story.moral || "");
    }
  }, [story, userName]);

  const handleSentenceChange = (idx) => {
    if (onProgressUpdate) onProgressUpdate(idx / sentences.length);
  };

  const handleComplete = () => {
    if (onComplete) onComplete();
  };

  if (!isOpen || !story) return null;

  const modalBg = story.cover || generateFallbackCover(story.title, story.category);

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="story-modal" onClick={e => e.stopPropagation()}>
        <div className="relative h-44 md:h-56 bg-cover bg-center rounded-t-2xl" style={{ backgroundImage: `url(${modalBg})` }}>
          <div className="absolute inset-0 bg-gradient-to-t from-[#12122c] to-transparent rounded-t-2xl" />
          <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white" onClick={onClose}>✕</button>
          <h2 className="absolute bottom-4 left-4 text-white text-xl md:text-2xl font-bold">{story.title}</h2>
        </div>
        <VoicePlayer
          sentences={sentences}
          isPlaying={voiceState.isPlaying}
          isPaused={voiceState.isPaused}
          isLoading={voiceState.isLoading}
          currentIndex={voiceState.currentSentenceIndex}
          onPlay={() => onPlayVoice(sentences, voiceType, accent, handleSentenceChange, handleComplete)}
          onPause={voiceState.pause}
          onResume={voiceState.resume}
          onSetTimer={onSetTimer}
          voiceType={voiceType}
          setVoiceType={setVoiceType}
          accent={accent}
          setAccent={setAccent}
          showMoral={showMoral}
          setShowMoral={setShowMoral}
          moralText={moralText}
          sleepTimerRemaining={sleepTimerRemaining}
          onBedtimeMode={onBedtimeMode}
        />
        <div className="story-text px-5 pb-6 text-white/90 text-[15px] leading-relaxed">
          {sentences.map((s, i) => (
            <p key={i} className={`mb-3 transition-colors ${voiceState.currentSentenceIndex === i ? 'active-sentence' : ''}`}>{s}</p>
          ))}
        </div>
      </div>
    </div>
  );
};