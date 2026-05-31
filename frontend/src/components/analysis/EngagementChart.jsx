import React from 'react';
import { BarChart3 } from 'lucide-react';

const EngagementChart = ({ youtubeRate = 0, instagramRate = 0 }) => {
  const yt = parseFloat(youtubeRate || 0);
  const ig = parseFloat(instagramRate || 0);
  
  // Determine max rate for scale base (cap at minimum 5% to show relative scale)
  const maxVal = Math.max(yt, ig, 5.0);
  
  // Calculate percentage width/height relative to max
  const ytPercent = `${(yt / maxVal) * 100}%`;
  const igPercent = `${(ig / maxVal) * 100}%`;

  return (
    <div className="w-full border border-border/80 bg-card rounded-2xl p-6 sm:p-8 shadow-lg space-y-6">
      
      {/* Title section */}
      <div className="space-y-1">
        <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>Engagement Comparison</span>
        </h3>
        <p className="text-sm text-muted-foreground">
          Visualizing audience interaction ratios between both channels.
        </p>
      </div>

      {/* Chart Canvas Area */}
      <div className="space-y-5 pt-2">
        {/* YouTube Row */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-red-500">YouTube (Video A)</span>
            <span className="font-bold text-foreground">{yt.toFixed(2)}%</span>
          </div>
          <div className="w-full h-8 bg-muted/65 rounded-lg overflow-hidden border border-border/40">
            <div
              style={{ width: ytPercent }}
              className="h-full bg-gradient-to-r from-red-500 to-rose-600 rounded-lg transition-all duration-1000 shadow-[0_0_12px_rgba(239,68,68,0.2)] hover:brightness-110"
            />
          </div>
        </div>

        {/* Instagram Row */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-purple-500">Instagram (Video B)</span>
            <span className="font-bold text-foreground">{ig.toFixed(2)}%</span>
          </div>
          <div className="w-full h-8 bg-muted/65 rounded-lg overflow-hidden border border-border/40">
            <div
              style={{ width: igPercent }}
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg transition-all duration-1000 shadow-[0_0_12px_rgba(168,85,247,0.2)] hover:brightness-110"
            />
          </div>
        </div>
      </div>

      {/* Helper Legend */}
      <div className="text-[10px] text-muted-foreground flex justify-between border-t border-border/60 pt-3.5">
        <span>Formula: (Likes + Comments) / Views * 100</span>
        <span>Relative Scaling: {maxVal.toFixed(1)}% Max Scale</span>
      </div>

    </div>
  );
};

export default EngagementChart;
