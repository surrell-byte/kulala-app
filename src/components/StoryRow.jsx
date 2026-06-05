import { memo } from 'react';
import StoryCard from './StoryCard';

const StoryRow = memo(({ title, stories, onOpen, isFavorite, onFavorite }) => {
  const headingId = `story-row-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <section className="story-row" aria-labelledby={headingId}>
      <div className="story-row-header">
        <h2 className="section-title" id={headingId}>{title}</h2>
      </div>
      <div className="scroll-row">
        <div className="story-scroll scrollbar-hide">
          {stories.map(story => (
            <StoryCard
              key={story.id}
              story={story}
              onOpen={onOpen}
              isFavorite={isFavorite}
              onFavorite={onFavorite}
            />
          ))}
        </div>
      </div>
    </section>
  );
});

export default StoryRow;
