import React from 'react';

const MetadataCard = ({ label, value, icon: Icon }) => {
  // Helper to format values cleanly (e.g. adding commas to large numbers)
  const formatValue = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '0';
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <div className="flex items-center gap-3 border border-border/60 bg-accent/20 rounded-lg p-3">
      {Icon && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
          <Icon className="h-4 w-4 shrink-0" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
          {label}
        </p>
        <p className="text-sm font-extrabold text-foreground truncate">
          {formatValue(value)}
        </p>
      </div>
    </div>
  );
};

export default MetadataCard;
