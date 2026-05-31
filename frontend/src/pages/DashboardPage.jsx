import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar.jsx';
import VideoCard from '../components/video/VideoCard.jsx';
import ComparisonCard from '../components/analysis/ComparisonCard.jsx';
import EngagementChart from '../components/analysis/EngagementChart.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import SkeletonCard from '../components/common/SkeletonCard.jsx';
import { getAnalysisResult } from '../services/analysisService.js';
import { createChatSession } from '../services/chatService.js';
import { AppContext } from '../context/AppContext.jsx';
import { MessageSquare, ArrowLeft } from 'lucide-react';

const DashboardPage = () => {
  const { analysisId } = useParams();
  const navigate = useNavigate();
  const { setSessionId } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  // Fetch comparative analysis payload
  const fetchResult = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAnalysisResult(analysisId);
      if (res.success) {
        setData(res);
      } else {
        throw new Error(res.error || 'Failed to retrieve analysis.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Server error loading analysis results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (analysisId) {
      fetchResult();
    }
  }, [analysisId]);

  // Initiate Chat session lifecycle
  const handleOpenChat = async () => {
    setChatLoading(true);
    try {
      const sessionData = await createChatSession(analysisId);
      if (sessionData.success && sessionData.sessionId) {
        setSessionId(sessionData.sessionId); // Store globally
        navigate(`/chat/${analysisId}`);
      } else {
        throw new Error(sessionData.error || 'Failed to create chat session.');
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Error establishing chat connection.');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Go Back CTA */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <SkeletonCard variant="video" />
              <SkeletonCard variant="video" />
            </div>
            <SkeletonCard variant="summary" />
          </div>
        )}

        {/* Error Banner with Retry */}
        {!loading && error && (
          <ErrorBanner message={error} onRetry={fetchResult} />
        )}

        {/* Loaded Dashboard Content */}
        {!loading && !error && data && (
          <div className="space-y-8">
            
            {/* Header info */}
            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight">Analysis Dashboard</h2>
              <p className="text-sm text-muted-foreground">
                Comparing channels metrics details side-by-side.
              </p>
            </div>

            {/* Side-by-side Video Cards Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <VideoCard platform="youtube" videoData={data.videos?.youtube} />
              <VideoCard platform="instagram" videoData={data.videos?.instagram} />
            </div>

            {/* Chart and AI Comparative Card Grid */}
            <div className="grid lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2">
                <ComparisonCard comparison={data.comparison} />
              </div>
              <div>
                <EngagementChart
                  youtubeRate={data.videos?.youtube?.metrics?.engagementRate}
                  instagramRate={data.videos?.instagram?.metrics?.engagementRate}
                />
              </div>
            </div>

            {/* Start Chat session CTA panel */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleOpenChat}
                disabled={chatLoading}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:brightness-110 disabled:opacity-50 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <MessageSquare className="h-4.5 w-4.5 shrink-0" />
                <span>{chatLoading ? 'Starting Chat Session...' : 'Open Chat to Dig Deeper'}</span>
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
};

export default DashboardPage;
