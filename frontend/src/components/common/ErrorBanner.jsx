import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

const ErrorBanner = ({ message, onRetry }) => {
  return (
    <div className="mx-auto w-full max-w-2xl border border-destructive/20 bg-destructive/10 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/20 text-destructive">
        <AlertCircle className="h-6 w-6" />
      </div>

      <div className="flex-1">
        <h4 className="text-base font-bold text-foreground mb-1">
          Something went wrong
        </h4>
        <p className="text-sm text-muted-foreground">
          {message || 'An unexpected error occurred while communicating with the backend server.'}
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-destructive px-3.5 py-2 text-sm font-medium text-white shadow hover:bg-destructive/90 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;
