import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar.jsx';
import VideoInput from '../components/video/VideoInput.jsx';
import LoadingOverlay from '../components/video/LoadingOverlay.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import { useAnalysis } from '../hooks/useAnalysis.js';
import { AppContext } from '../context/AppContext.jsx';
import { Clock, ArrowRight, Trash2 } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { recentSessions, setAnalysisId } = useContext(AppContext);
  const { status, error, steps, analysisId, startAnalysis, resetAnalysis } = useAnalysis();

  // Redirect to dashboard when analysis is ready
  useEffect(() => {
    if (status === 'success' && analysisId) {
      navigate(`/dashboard/${analysisId}`);
    }
  }, [status, analysisId, navigate]);

  const handleUrlSubmit = (youtubeUrl, instagramUrl) => {
    startAnalysis(youtubeUrl, instagramUrl);
  };

  const handleSessionClick = (id) => {
    setAnalysisId(id);
    navigate(`/dashboard/${id}`);
  };

  const handleClearHistory = () => {
    localStorage.removeItem('vidiq_recent_sessions');
    window.location.reload(); // Refresh to flush state
  };

  // Helper to truncate URLs for UI display
  const truncateUrl = (url) => {
    if (!url) return '';
    try {
      const parsed = new URL(url);
      const pathname = parsed.pathname.length > 25 ? `${parsed.pathname.substring(0, 25)}...` : parsed.pathname;
      return `${parsed.hostname}${pathname}`;
    } catch {
      return url.length > 35 ? `${url.substring(0, 35)}...` : url;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      {/* Main Container */}
      <main className="flex-grow flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Hero Headline Section */}
        <div className="text-center space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400">
            <span>Powered by Gemini 2.0 & Vector RAG</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Compare Any Two Videos with{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
              AI Intelligence
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Paste one YouTube link and one Instagram link to compare metadata, scrape transcripts, generate similarity embeddings, and analyze hooks side-by-side.
          </p>
        </div>

        {/* Input Form & Error Display */}
        <div className="w-full flex flex-col items-center space-y-6">
          {status === 'error' && (
            <div className="w-full max-w-2xl">
              <ErrorBanner message={error} onRetry={resetAnalysis} />
            </div>
          )}

          <VideoInput onSubmit={handleUrlSubmit} disabled={status === 'loading'} />
        </div>

        {/* Loading overlay tracker */}
        {status === 'loading' && <LoadingOverlay steps={steps} />}

        {/* Recent Sessions list panel */}
        {recentSessions.length > 0 && (
          <div className="w-full max-w-4xl pt-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>Recent Analyses</span>
              </h2>
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 shrink-0" />
                <span>Clear History</span>
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recentSessions.map((session) => (
                <div
                  key={session.analysisId}
                  onClick={() => handleSessionClick(session.analysisId)}
                  className="group relative cursor-pointer border border-border/80 bg-card hover:bg-accent/40 rounded-xl p-4 shadow hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    {/* YouTube Source details */}
                    <div className="text-xs space-y-1">
                      <span className="font-semibold text-red-500 block">YouTube</span>
                      <p className="text-muted-foreground font-mono truncate">
                        {truncateUrl(session.youtubeUrl)}
                      </p>
                    </div>
                    {/* Instagram Source details */}
                    <div className="text-xs space-y-1">
                      <span className="font-semibold text-purple-500 block">Instagram</span>
                      <p className="text-muted-foreground font-mono truncate">
                        {truncateUrl(session.instagramUrl)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-[10px] text-muted-foreground/80 border-t border-border/40">
                    <span>
                      {new Date(session.timestamp).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span className="flex items-center gap-0.5 font-medium text-emerald-400 group-hover:translate-x-1 transition-transform">
                      <span>View</span>
                      <ArrowRight className="h-3 w-3 shrink-0" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default HomePage;
