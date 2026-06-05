import { memo, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { generateFallbackCover } from '../config';

const SLEEP_TIMERS = [
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '45 min', minutes: 45 },
  { label: 'Story end', minutes: null },
];

const StoryModal = memo(({
  story, isOpen, onClose, voiceState, onPlayVoice, userName,
  isFavorite, onFavorite, onSaveProgress, getProgress,
}) => {
  const [voiceType,    setVoiceType]    = useState('female');
  const [accent,       setAccent]       = useState('none');
  const [speed,        setSpeed]        = useState(1.0);
  const [coverSrc,     setCoverSrc]     = useState(story?.cover);
  const [sleepTimer,   setSleepTimer]   = useState(null);   // minutes | null
  const [timerLeft,    setTimerLeft]    = useState(null);   // seconds remaining
  const bodyRef    = useRef(null);
  const timerRef   = useRef(null);

  const sentences = useMemo(() => {
    if (!story?.body) return [];
    return story.body
      .split(/([.!?…])\s+/)
      .reduce((acc, part, i, arr) => {
        if (i % 2 === 0) {
          const punct = arr[i + 1] || '';
          const s = (part + punct).trim();
          if (s.length > 0) acc.push(s);
        }
        return acc;
      }, []);
  }, [story?.body]);

  useEffect(() => {
    if (story) setCoverSrc(story.cover);
    setSleepTimer(null);
    setTimerLeft(null);
    clearInterval(timerRef.current);
  }, [story]);

  // Restore reading position when story opens
  useEffect(() => {
    if (isOpen && story && getProgress) {
      const saved = getProgress(story.id);
      if (saved?.sentenceIndex > 0 && bodyRef.current) {
        setTimeout(() => {
          const el = bodyRef.current?.querySelector(`[data-idx="${saved.sentenceIndex}"]`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 350);
      }
    }
  }, [getProgress, isOpen, story]);

  // Save progress whenever the narrated sentence advances
  useEffect(() => {
    if (!story || !onSaveProgress || voiceState.currentIdx < 0) return;
    const total = sentences.length;
    if (total === 0) return;
    const percent = Math.round(((voiceState.currentIdx + 1) / total) * 100);
    onSaveProgress(story.id, percent, voiceState.currentIdx);
  }, [onSaveProgress, sentences.length, story, voiceState.currentIdx]);

  // Sleep timer countdown
  useEffect(() => {
    clearInterval(timerRef.current);
    if (sleepTimer === null || !voiceState.isPlaying) {
      setTimerLeft(null);
      return;
    }
    const seconds = sleepTimer * 60;
    setTimerLeft(seconds);
    timerRef.current = setInterval(() => {
      setTimerLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          voiceState.stop();
          setSleepTimer(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [sleepTimer, voiceState.isPlaying]);

  const handleSleepTimer = (minutes) => {
    setSleepTimer(prev => prev === minutes ? null : minutes);
  };

  const formatTimer = (secs) => {
    if (secs === null) return null;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (voiceState.currentIdx >= 0 && bodyRef.current) {
      const el = bodyRef.current.querySelector(`[data-idx="${voiceState.currentIdx}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [voiceState.currentIdx]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handlePlay = useCallback(() => {
    if (voiceState.isPlaying && !voiceState.isPaused) {
      voiceState.pause();
    } else if (voiceState.isPaused) {
      voiceState.resume();
    } else {
      onPlayVoice(sentences, { voiceType, accent });
    }
  }, [voiceState, sentences, voiceType, accent, onPlayVoice]);

  const handleSpeed = (s) => {
    setSpeed(s);
    voiceState.setRate(s);
  };

  if (!isOpen || !story) return null;

  const playIcon = voiceState.isPlaying && !voiceState.isPaused ? '⏸' : '▶';
  const titleId = `story-modal-title-${story.id}`;

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-sheet" role="dialog" aria-modal="true" aria-labelledby={titleId}>

        {/* Cover image */}
        <div className="modal-hero">
          <img
            src={coverSrc}
            alt={story.title}
            onError={() => setCoverSrc(generateFallbackCover(story.title, story.category))}
          />
          <div className="modal-hero-overlay" />
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close story">✕</button>
        </div>

        <div className="modal-body">
          {/* Meta pills */}
          <div className="modal-meta">
            <span className="meta-pill">{story.category}</span>
            <span className="meta-pill">⏱ {story.readTime}</span>
            <span className="meta-pill">👶 Age {story.age}</span>
            {story.isPremium && <span className="meta-pill gold">✦ Premium</span>}
          </div>

          <h2 className="modal-title" id={titleId}>{story.title}</h2>

          {/* #5 Story action row: favorite / share / bookmark */}
          <div className="story-action-row">
            <button
              type="button"
              className={`story-action-btn${isFavorite ? ' active' : ''}`}
              onClick={onFavorite}
              aria-label={isFavorite ? 'Remove from saved' : 'Save story'}
              aria-pressed={!!isFavorite}
            >
              {isFavorite ? '⭐' : '☆'} {isFavorite ? 'Saved' : 'Save'}
            </button>
            <button
              type="button"
              className="story-action-btn"
              aria-label="Share story"
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.share) {
                  navigator.share({ title: story.title, text: `Listen to "${story.title}" on Kulala` })
                    .catch(() => {});
                }
              }}
            >
              📤 Share
            </button>
            <button
              type="button"
              className="story-action-btn"
              aria-label="Bookmark story"
              onClick={() => {/* bookmark feature placeholder */}}
            >
              🔖 Bookmark
            </button>
          </div>

          {/* Controls — responsive grid/flex layout */}
          <div className="modal-controls">

            {/* Row 1: play + stop + voice buttons */}
            <div className="modal-controls-playrow">
              <button
                type="button"
                className="play-pause-btn"
                onClick={handlePlay}
                aria-label={voiceState.isPlaying && !voiceState.isPaused ? 'Pause' : 'Play'}
              >
                {playIcon}
              </button>
              {voiceState.isPlaying && (
                <button type="button" className="stop-btn" onClick={voiceState.stop} aria-label="Stop narration">■</button>
              )}
              {[
                { id: 'female', label: '♀ Female' },
                { id: 'male',   label: '♂ Male'   },
                { id: 'elder',  label: '🪵 Elder'  },
              ].map(v => (
                <button
                  type="button"
                  key={v.id}
                  className={`voice-btn${voiceType === v.id ? ' active' : ''}`}
                  onClick={() => setVoiceType(v.id)}
                  aria-pressed={voiceType === v.id}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {/* Row 2: speed */}
            <div className="modal-controls-speed">
              <span className="speed-label">Speed</span>
              {[0.7, 1.0, 1.2].map(s => (
                <button
                  type="button"
                  key={s}
                  className={`speed-btn${speed === s ? ' active' : ''}`}
                  onClick={() => handleSpeed(s)}
                  aria-pressed={speed === s}
                >
                  {s === 0.7 ? '0.7×' : s === 1.0 ? '1×' : '1.2×'}
                </button>
              ))}
            </div>

            {/* #6 Row 3: sleep timer */}
            <div className="sleep-timer-row">
              <span className="speed-label">
                ⏰ Sleep{timerLeft !== null ? ` · ${formatTimer(timerLeft)}` : ''}
              </span>
              {SLEEP_TIMERS.map(t => (
                <button
                  type="button"
                  key={t.label}
                  className={`sleep-timer-btn${sleepTimer === t.minutes ? ' active' : ''}`}
                  onClick={() => handleSleepTimer(t.minutes)}
                  aria-pressed={sleepTimer === t.minutes}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Story body */}
          <div ref={bodyRef} className="story-text">
            {sentences.map((sentence, i) => (
              <span
                key={i}
                data-idx={i}
                className={`sentence${
                  voiceState.currentIdx === i
                    ? ' sentence-active'
                    : voiceState.currentIdx > i
                    ? ' sentence-inactive'
                    : ''
                }`}
              >
                {sentence}{' '}
              </span>
            ))}
          </div>

          {story.moral && (
            <div className="story-moral">✦ {story.moral}</div>
          )}
          <div style={{ height: 24 }} />
        </div>
      </div>
    </div>
  );
});

export default StoryModal;
