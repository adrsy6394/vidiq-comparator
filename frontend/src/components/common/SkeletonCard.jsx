import React from 'react';

const SkeletonCard = ({ variant = 'video' }) => {
  if (variant === 'summary') {
    return (
      <div className="w-full border border-border/80 bg-card rounded-xl p-5 shadow-lg space-y-4 animate-pulse">
        <div className="h-6 w-1/4 rounded bg-muted"></div>
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-muted"></div>
          <div className="h-4 w-11/12 rounded bg-muted"></div>
          <div className="h-4 w-4/5 rounded bg-muted"></div>
        </div>
        <div className="h-10 w-full rounded bg-muted"></div>
      </div>
    );
  }

  // Default 'video' card skeleton
  return (
    <div className="w-full border border-border/80 bg-card rounded-xl overflow-hidden shadow-lg space-y-4 animate-pulse">
      {/* Thumbnail Aspect Ratio Area */}
      <div className="w-full aspect-video bg-muted"></div>
      
      {/* Video Text Metadata */}
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-muted"></div>
            <div className="h-3 w-1/2 rounded bg-muted"></div>
          </div>
        </div>
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="h-8 rounded bg-muted"></div>
          <div className="h-8 rounded bg-muted"></div>
          <div className="h-8 rounded bg-muted"></div>
          <div className="h-8 rounded bg-muted"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
