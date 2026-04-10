import React from 'react';
import { StoryCard } from './StoryCard';

export const ContinueRow = ({ items, stories, onOpen, isPremium }) => {
  if (!items.length) return null;
  const continueStories = items.map(item => stories.find(s => s.id === item.id)).filter(Boolean);
  return (
    <div className="mb-8 px-4 md:px-8">
      <h3 className="font-quicksand text-[17px] font-extrabold text-white mb-3 px-4">Continue Listening</h3>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
        {continueStories.map(story => (
          <StoryCard key={story.id} story={story} onOpen={onOpen} isPremium={isPremium} />
        ))}
      </div>
    </div>
  );
};