import { memo, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { generateFallbackCover } from '../config';

const StoryModal = memo(({ story, isOpen, onClose, voiceState, onPlayVoice, userName }) => {
  const [voiceType, setVoiceType] = useState('female');
  const [accent, setAccent]       = useState('none');
  const [speed, setSpeed]         = useState(1.0);
  const [coverSrc, setCoverSrc]   = useState(story?.cover);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (story) setCoverSrc(story.cover);
  }, [story]);

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

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-sheet">
        <div className="modal-hero">
          <img
            src={coverSrc}
            alt={story.title}
            onError={() => setCoverSrc(generateFallbackCover(story.title, story.category))}
          />
          <div className="modal-hero-overlay" />
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-meta">
            <span className="meta-pill">{story.category}</span>
            <span className="meta-pill">⏱ {story.readTime}</span>
            <span className="meta-pill">👶 Age {story.age}</span>
            {story.isPremium && <span className="meta-pill gold">✦ Premium</span>}
          </div>
          <h2 className="modal-title">{story.title}</h2>
          <div className="modal-controls">
            <button className="play-pause-btn" onClick={handlePlay}>{playIcon}</button>
            {voiceState.isPlaying && (
              <button className="stop-btn" onClick={voiceState.stop} title="Stop">■</button>
            )}
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { id: 'female', label: '♀ Female' },
                { id: 'male',   label: '♂ Male' },
                { id: 'elder',  label: '🪵 Elder' },
              ].map(v => (
                <button
                  key={v.id}
                  className={`voice-btn${voiceType === v.id ? ' active' : ''}`}
                  onClick={() => setVoiceType(v.id)}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <div className="speed-row">
              <span className="speed-label">Speed</span>
              {[0.7, 1.0, 1.2].map(s => (
                <button
                  key={s}
                  className={`speed-btn${speed === s ? ' active' : ''}`}
                  onClick={() => handleSpeed(s)}
                >
                  {s === 0.7 ? '0.7×' : s === 1.0 ? '1×' : '1.2×'}
                </button>
              ))}
            </div>
          </div>
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
