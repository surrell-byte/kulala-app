import { memo, useState } from 'react';
import { generateFallbackCover } from '../config';

const HeroBanner = memo(({ story, onPlay, onMoreInfo }) => {
  const [bg, setBg] = useState(story?.cover);
  if (!story) return null;
  const headingId = `featured-story-${story.id}`;

  return (
    <section className="hero-section" aria-labelledby={headingId}>
      <div className="hero-bg" aria-hidden="true">
        <img
          src={bg}
          alt=""
          onError={() => setBg(generateFallbackCover(story.title, story.category))}
        />
        <div className="hero-gradient" />
        <div className="hero-gradient-side" />
      </div>
      <div className="hero-content fade-in-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <span className="hero-badge">Featured Story</span>
          <span style={{ color: 'rgba(242,234,216,0.7)', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="pulse-dot" style={{ width: 6, height: 6, background: '#5cb87a', borderRadius: '50%', display: 'inline-block' }} />
            New Release
          </span>
        </div>
        <h1 className="hero-title" id={headingId}>{story.title}</h1>
        <div className="hero-meta">
          <span>⏱ {story.readTime}</span>
          <span>👶 Age {story.age}</span>
          <span className="hero-tag">{story.category}</span>
        </div>
        <div className="hero-actions">
          <button type="button" className="btn-primary" onClick={onPlay}>
            <span style={{ fontSize: '0.9rem' }}>▶</span>
            Begin Journey
          </button>
          <button type="button" className="btn-secondary" onClick={onMoreInfo || onPlay}>More Info</button>
        </div>
      </div>
    </section>
  );
});

export default HeroBanner;
