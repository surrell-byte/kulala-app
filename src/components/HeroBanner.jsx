import React from 'react';
import { generateFallbackCover } from '../utils/helpers';

export const HeroBanner = ({ story, onPlay }) => (
  <div className="relative h-[58vh] min-h-[300px] max-h-[480px] rounded-2xl overflow-hidden mx-4 mb-6">
    <img
      src={story.cover}
      className="absolute inset-0 w-full h-full object-cover"
      onError={(e) => (e.target.src = generateFallbackCover(story.title, story.category))}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,5,20,0.98)] via-[rgba(5,5,20,0.5)] to-transparent" />
    <div className="absolute top-4 left-4 bg-black/55 backdrop-blur-md border border-yellow-400/30 rounded-full px-3 py-1 text-[10px] font-extrabold text-yellow-400 uppercase tracking-wider">
      {story.author}
    </div>
    <div className="absolute bottom-0 left-0 right-0 p-5 pb-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] text-white/50 font-semibold">{story.category}</span>
        <span className="w-0.5 h-0.5 rounded-full bg-white/30" />
        <span className="text-[11px] text-white/50 font-semibold">{story.readTime}</span>
        <span className="w-0.5 h-0.5 rounded-full bg-white/30" />
        <span className="text-[11px] text-white/50 font-semibold">Ages {story.age}</span>
      </div>
      <h1 className="font-quicksand text-[clamp(20px,5vw,28px)] font-extrabold text-white leading-tight max-w-[300px] mb-4">
        {story.title}
      </h1>
      <div className="flex gap-2.5">
        <button onClick={onPlay} className="py-2.5 px-6 bg-white text-indigo-950 font-extrabold text-sm rounded-full flex items-center gap-1.5 min-h-[44px]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#0a0a1a"><polygon points="5,3 19,12 5,21" /></svg>
          Play
        </button>
        <button className="py-2.5 px-5 bg-white/20 text-white font-bold text-sm rounded-full border border-white/20 min-h-[44px]">
          + List
        </button>
      </div>
    </div>
  </div>
);