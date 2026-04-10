import React from 'react';
import { generateFallbackCover } from '../utils/helpers';

export const StoryCard = ({ story, onOpen, isPremium }) => {
  const handleClick = () => {
    if (story.isPremium && !isPremium) {
      alert("✨ Upgrade to Premium to unlock this magical story!");
      return;
    }
    onOpen(story);
  };

  return (
    <div className="min-w-[148px] cursor-pointer flex-shrink-0" onClick={handleClick}>
      <div className="relative rounded-xl overflow-hidden aspect-[2/3] bg-indigo-950">
        <img
          src={story.cover}
          className="w-full h-full object-cover"
          onError={(e) => (e.target.src = generateFallbackCover(story.title, story.category))}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,5,20,0.92)] via-[rgba(5,5,20,0.1)] to-transparent" />
        <div className="absolute top-2 left-2 bg-black/55 backdrop-blur-sm border border-white/20 text-white/80 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full">
          {story.category}
        </div>
        {story.isPremium && !isPremium && (
          <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-sm">🔒</div>
        )}
        {story.isNew && (
          <div className={`absolute top-2 right-2 bg-yellow-400 text-indigo-950 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full ${story.isPremium && !isPremium ? 'top-[40px]' : ''}`}>
            NEW
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-2.5 pb-3">
          <p className="text-white text-xs font-bold leading-tight line-clamp-2">{story.title}</p>
          <p className="text-white/45 text-[10px] font-semibold mt-1">{story.readTime}</p>
        </div>
      </div>
    </div>
  );
};