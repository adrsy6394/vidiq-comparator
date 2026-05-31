import React from 'react';

const SourceCitation = ({ videoLabel, timestamp, onCitationClick }) => {
  const isYouTube = videoLabel.toLowerCase().includes('video a') || videoLabel.toLowerCase().includes('youtube');

  const handleClick = (e) => {
    e.preventDefault();
    if (onCitationClick) {
      onCitationClick(videoLabel, timestamp);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-0.5 rounded border px-1.5 py-0.5 text-[10px] font-extrabold select-none cursor-pointer mx-0.5 transition-all focus:outline-none focus:ring-1 focus:ring-ring ${
        isYouTube
          ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
          : 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20'
      }`}
    >
      {/* Simplify label to match citation standard in transcripts e.g. "Video A - 01:24" */}
      <span>{videoLabel.startsWith('Video A') ? 'Video A' : 'Video B'} - {timestamp}</span>
    </button>
  );
};

export default SourceCitation;
