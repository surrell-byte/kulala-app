import React from 'react';
import { StoryCard } from './StoryCard';

export const StoryRow = ({ title, stories, onOpen, isPremium }) => {
  if (!stories.length) return null;
  return (
    <div className="mb-8 px-4 md:px-8">
      <h3 className="font-quicksand text-[17px] font-extrabold text-white mb-3 px-4">{title}</h3>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
        {stories.map(story => (
          <StoryCard key={story.id} story={story} onOpen={onOpen} isPremium={isPremium} />
        ))}
      </div>
    </div>
  );
};