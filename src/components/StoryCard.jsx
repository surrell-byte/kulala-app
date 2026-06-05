import { memo, useState } from 'react';
import { generateFallbackCover } from '../config';

const StoryCard = memo(({ story, onOpen, isFavorite, onFavorite }) => {
  const [cover, setCover] = useState(story.cover);
  const favorite = isFavorite?.(story.id);

  const handleFavClick = (e) => {
    e.stopPropagation();
    onFavorite?.(story.id);
  };

  return (
    <div className="story-card">
      <div className="story-card-inner">
        <button
          type="button"
          className="story-card-open"
          onClick={() => onOpen(story)}
          aria-label={`Open ${story.title}`}
        >
          <img
            className="story-card-img"
            src={cover}
            alt=""
            loading="lazy"
            onError={() => setCover(generateFallbackCover(story.title, story.category))}
          />
          <div className="story-card-overlay" />
          {story.isPremium && <div className="premium-badge">✦ Premium</div>}
          <div className="story-card-icon" aria-hidden="true">{story.icon}</div>
          <div className="story-card-bottom">
            <span className="story-card-cat">{story.category}</span>
          </div>
        </button>

        <button
          type="button"
          className={`card-fav-btn${favorite ? ' is-favorite' : ''}`}
          onClick={handleFavClick}
          aria-label={favorite ? `Remove ${story.title} from saved` : `Save ${story.title}`}
          aria-pressed={!!favorite}
        >
          {favorite ? '⭐' : '☆'}
        </button>
      </div>
      <button type="button" className="story-card-text-btn" onClick={() => onOpen(story)}>
        <span className="story-card-title">{story.title}</span>
        <span className="story-card-meta">⏱ {story.readTime} · Age {story.age}</span>
      </button>
    </div>
  );
});

export default StoryCard;
