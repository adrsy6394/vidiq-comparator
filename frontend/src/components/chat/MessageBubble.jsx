import React from 'react';
import SourceCitation from './SourceCitation.jsx';
import { User, Sparkles } from 'lucide-react';

const MessageBubble = ({ message = {}, onCitationClick }) => {
  const { role, content } = message;
  const isUser = role === 'user';

  // Parser helper to scan message string and replace citations with interactive buttons
  const parseContent = (text) => {
    if (!text) return '';

    // Match patterns like [Video A - 01:24] or [Video B - 00:45]
    const regex = /\[(Video [A|B])\s*-\s*(\d{2}:\d{2})\]/g;
    const elements = [];
    
    let lastIdx = 0;
    let match;

    // Reset cursor index
    regex.lastIndex = 0;

    while ((match = regex.exec(text)) !== null) {
      const matchIdx = match.index;

      // Append text segment leading up to match
      if (matchIdx > lastIdx) {
        elements.push(text.substring(lastIdx, matchIdx));
      }

      const [fullMatch, videoLabel, timestamp] = match;

      // Append clickable source badge
      elements.push(
        <SourceCitation
          key={matchIdx}
          videoLabel={videoLabel}
          timestamp={timestamp}
          onCitationClick={onCitationClick}
        />
      );

      lastIdx = regex.lastIndex;
    }

    // Append trailing text if any
    if (lastIdx < text.length) {
      elements.push(text.substring(lastIdx));
    }

    return elements.length > 0 ? elements : text;
  };

  return (
    <div className={`flex w-full gap-4 py-4 px-5 transition-colors ${
      isUser ? 'bg-background' : 'bg-accent/15 border-y border-border/40'
    }`}>
      
      {/* Icon Avatar */}
      <div className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg border shadow-sm ${
        isUser
          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-emerald-500/20'
          : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-cyan-500/20'
      }`}>
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>

      {/* Message content */}
      <div className="flex-1 space-y-1.5 min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90">
          {isUser ? 'You' : 'AI Analyst'}
        </span>
        <div className="text-sm text-foreground/95 leading-relaxed whitespace-pre-wrap">
          {parseContent(content)}
        </div>
      </div>

    </div>
  );
};

export default MessageBubble;
