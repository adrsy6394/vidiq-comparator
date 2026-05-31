import React from 'react';
import { Loader2, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

const Loader = ({ steps = {} }) => {
  // Define human-readable labels for our backend processing milestones
  const stepsList = [
    { key: 'metadata', label: 'Extracting video metadata details' },
    { key: 'transcript', label: 'Scraping spoken content & transcripts' },
    { key: 'embedding', label: 'Generating embeddings & indexing vectors' },
    { key: 'analysis', label: 'Running AI comparison metrics summary' },
  ];

  // Helper to render icon for step status
  const getStepIcon = (status) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-emerald-400 animate-spin shrink-0" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-destructive shrink-0" />;
      case 'pending':
      default:
        return <Circle className="h-5 w-5 text-muted-foreground/60 shrink-0" />;
    }
  };

  // Helper for text colors mapping
  const getStepTextColor = (status) => {
    switch (status) {
      case 'done':
        return 'text-muted-foreground line-through';
      case 'processing':
        return 'text-foreground font-semibold';
      case 'failed':
        return 'text-destructive font-medium';
      case 'pending':
      default:
        return 'text-muted-foreground/80';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Dynamic Main Spinner */}
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 shadow-lg shadow-emerald-500/5 animate-pulse mb-8">
        <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
      </div>

      <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">
        Analyzing social content...
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-8">
        Please wait while we extract, chunk, embed, and compare both video formats side-by-side.
      </p>

      {/* Step checklist card */}
      <div className="w-full max-w-md border border-border/80 bg-card rounded-xl p-5 shadow-xl text-left">
        <div className="space-y-4">
          {stepsList.map((step) => {
            const status = steps[step.key] || 'pending';
            return (
              <div key={step.key} className="flex items-center gap-3">
                {getStepIcon(status)}
                <span className={`text-sm transition-all duration-300 ${getStepTextColor(status)}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Loader;
