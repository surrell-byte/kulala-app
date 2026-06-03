import { memo } from 'react';
import StoryCard from './StoryCard';

const StoryRow = memo(({ title, stories, onOpen, isFavorite, onFavorite }) => (
  <section className="story-row">
    <div className="story-row-header">
      <h2 className="section-title">{title}</h2>
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
));

export default StoryRow;