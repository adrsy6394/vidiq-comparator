import React from 'react';
import MetadataCard from './MetadataCard.jsx';
import { Eye, Heart, MessageCircle, Clock, ExternalLink } from 'lucide-react';

const VideoCard = ({ platform, videoData = {} }) => {
  const isYouTube = platform === 'youtube';
  const { title, creator, url, thumbnail, metrics = {} } = videoData;

  // Format seconds to MM:SS or HH:MM:SS
  const formatDuration = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = Math.floor(sec % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Engagement Rate Badge color picker
  const getEngagementBadgeStyle = (rate) => {
    const r = parseFloat(rate || 0);
    if (r >= 5.0) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    } else if (r >= 2.0) {
      return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    }
    return 'bg-destructive/10 text-destructive border-destructive/20';
  };

  return (
    <div className="w-full border border-border/80 bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Thumbnail area */}
        <div className="relative aspect-video w-full bg-muted overflow-hidden">
          {thumbnail ? (
            <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-medium">
              No Thumbnail Available
            </div>
          )}
          {/* Platform Badge Overlay */}
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-sm backdrop-blur-md ${
                isYouTube
                  ? 'bg-red-500/15 text-red-400 border-red-500/20'
                  : 'bg-purple-500/15 text-purple-400 border-purple-500/20'
              }`}
            >
              {isYouTube ? 'YouTube' : 'Instagram'}
            </span>
          </div>
          {/* Duration Badge overlay */}
          {metrics.duration && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded bg-background/80 px-2 py-0.5 text-[10px] font-bold tracking-wide text-foreground backdrop-blur border border-border/40">
              <Clock className="h-3 w-3 shrink-0" />
              <span>{formatDuration(metrics.duration)}</span>
            </div>
          )}
        </div>

        {/* Video textual details */}
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-3">
              <h4 className="font-bold text-base leading-snug tracking-tight text-foreground line-clamp-2">
                {title || (isYouTube ? 'No Title' : 'Instagram Caption')}
              </h4>
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground shrink-0 transition-colors mt-0.5"
                  aria-label="View original video link"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              by <span className="text-foreground/90 font-bold">{creator || 'Unknown Creator'}</span>
            </p>
          </div>

          {/* Engagement Badge display */}
          <div className="flex items-center justify-between border-t border-border/50 pt-3">
            <span className="text-xs font-semibold text-muted-foreground">Engagement Rate:</span>
            <span
              className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-bold tracking-tight ${getEngagementBadgeStyle(
                metrics.engagementRate
              )}`}
            >
              {metrics.engagementRate !== undefined ? `${metrics.engagementRate.toFixed(2)}%` : '0.00%'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of stats */}
      <div className="bg-accent/5 border-t border-border/60 p-4 grid grid-cols-2 gap-2.5">
        <MetadataCard label="Views" value={metrics.views} icon={Eye} />
        <MetadataCard label="Likes" value={metrics.likes} icon={Heart} />
        <MetadataCard label="Comments" value={metrics.comments} icon={MessageCircle} />
        <MetadataCard label="Shares" value={metrics.shares || 0} icon={ExternalLink} />
      </div>
    </div>
  );
};

export default VideoCard;
