import { memo, useState } from 'react';
import { generateFallbackCover } from '../config';

const StoryCard = memo(({ story, onOpen }) => {
  const [cover, setCover] = useState(story.cover);
  return (
    <div className="story-card" onClick={() => onOpen(story)}>
      <div className="story-card-inner">
        <img
          className="story-card-img"
          src={cover}
          alt={story.title}
          onError={() => setCover(generateFallbackCover(story.title, story.category))}
        />
        <div className="story-card-overlay" />
        {story.isPremium && <div className="premium-badge">✦ Premium</div>}
        <div className="story-card-icon">{story.icon}</div>
        <div className="story-card-bottom">
          <p className="story-card-cat">{story.category}</p>
        </div>
      </div>
      <p className="story-card-title">{story.title}</p>
      <p className="story-card-meta">⏱ {story.readTime} · Age {story.age}</p>
    </div>
  );
});

export default StoryCard;
