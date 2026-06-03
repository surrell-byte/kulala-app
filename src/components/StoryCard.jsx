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
    <div className="story-card" onClick={() => onOpen(story)}>
      <div className="story-card-inner">
        <img
          className="story-card-img"
          src={cover}
          alt={story.title}
          loading="lazy"
          onError={() => setCover(generateFallbackCover(story.title, story.category))}
        />
        <div className="story-card-overlay" />

        {/* Favorite button */}
        <button
          className={`card-fav-btn${favorite ? ' is-favorite' : ''}`}
          onClick={handleFavClick}
          aria-label={favorite ? `Remove ${story.title} from saved` : `Save ${story.title}`}
          aria-pressed={!!favorite}
        >
          {favorite ? '⭐' : '☆'}
        </button>

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