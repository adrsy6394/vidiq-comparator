import React, { useEffect, useContext, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar.jsx';
import ChatPanel from '../components/chat/ChatPanel.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import { useChat } from '../hooks/useChat.js';
import { AppContext } from '../context/AppContext.jsx';
import { ArrowLeft, BookOpen, Quote, Sparkles } from 'lucide-react';

const ChatPage = () => {
  const { analysisId } = useParams();
  const navigate = useNavigate();
  const { sessionId } = useContext(AppContext);

  const {
    messages,
    streamingMessage,
    isLoading,
    error,
    loadHistory,
    sendMessage,
  } = useChat();

  const [highlightedRefId, setHighlightedRefId] = useState('');
  const refsContainerRef = useRef({});

  // 1. Initial Load of session logs
  useEffect(() => {
    if (sessionId) {
      loadHistory(sessionId);
    } else {
      // If no session exists in global state context, redirect back
      navigate(`/dashboard/${analysisId}`);
    }
  }, [sessionId, analysisId, loadHistory, navigate]);

  // 2. Extract sources from the last assistant message to populate the right context panel
  const getActiveSources = () => {
    // Traverse backwards to find the latest assistant message with sources
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant' && messages[i].sources && messages[i].sources.length > 0) {
        return messages[i].sources;
      }
    }
    return [];
  };

  const activeSources = getActiveSources();

  // 3. Scroll to reference element and trigger glow animation highlight
  const handleCitationClick = (videoLabel, timestamp) => {
    // Citation pattern clean: e.g. "Video A (YouTube)" -> "Video A"
    const cleanLabel = videoLabel.toLowerCase().includes('video a') ? 'Video A' : 'Video B';
    const targetId = `ref-${cleanLabel}-${timestamp}`;

    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedRefId(targetId);

      // Reset glowing state after 2 seconds
      setTimeout(() => {
        setHighlightedRefId('');
      }, 2000);
    }
  };

  const handleSendMessage = (text) => {
    if (analysisId && sessionId) {
      sendMessage(analysisId, sessionId, text);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden">
      <Navbar />

      {/* Main split viewport layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Column: Chat Dialogue Console */}
        <div className="w-full md:w-1/2 flex flex-col h-[50vh] md:h-[calc(100vh-3.5rem)] overflow-hidden">
          {/* Header Action Bar */}
          <div className="flex items-center gap-3 border-b border-border/80 bg-card/40 px-5 py-3 shrink-0">
            <button
              onClick={() => navigate(`/dashboard/${analysisId}`)}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Dashboard</span>
            </button>
            <span className="text-xs text-border">|</span>
            <span className="text-xs font-semibold text-muted-foreground truncate">
              Session ID: {sessionId ? `${sessionId.substring(0, 14)}...` : 'Connecting'}
            </span>
          </div>

          {error && (
            <div className="px-5 py-3">
              <ErrorBanner message={error} />
            </div>
          )}

          <div className="flex-grow overflow-hidden">
            <ChatPanel
              messages={messages}
              streamingMessage={streamingMessage}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              onCitationClick={handleCitationClick}
            />
          </div>
        </div>

        {/* Right Column: Interactive Context Panel */}
        <div className="w-full md:w-1/2 border-t md:border-t-0 md:border-l border-border/85 bg-card/10 overflow-y-auto h-[50vh] md:h-[calc(100vh-3.5rem)] p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>Reference Context Panel</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Transcript segments referenced by the AI model in the latest answer.
            </p>
          </div>

          {/* List of active source snippets */}
          {activeSources.length > 0 ? (
            <div className="space-y-4">
              {activeSources.map((src, index) => {
                const cleanLabel = src.videoLabel.toLowerCase().includes('video a') ? 'Video A' : 'Video B';
                const cardId = `ref-${cleanLabel}-${src.timestamp}`;
                const isHighlighted = highlightedRefId === cardId;
                const isYouTube = src.platform === 'youtube';

                return (
                  <div
                    key={index}
                    id={cardId}
                    className={`border rounded-xl p-5 shadow-sm transition-all duration-500 flex flex-col justify-between space-y-3 ${
                      isHighlighted
                        ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(52,211,153,0.15)] scale-[1.02]'
                        : 'border-border/80 bg-card hover:bg-accent/15'
                    }`}
                  >
                    {/* Source Header */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isYouTube
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        }`}
                      >
                        {src.videoLabel}
                      </span>
                      
                      <span className="text-xs font-bold font-mono text-muted-foreground/80">
                        Offset: {src.timestamp}
                      </span>
                    </div>

                    {/* Excerpt Excerpt */}
                    <div className="flex gap-2">
                      <Quote className="h-5 w-5 text-muted-foreground/40 shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground leading-relaxed italic">
                        "{src.excerpt}"
                      </p>
                    </div>

                    <div className="text-[10px] text-muted-foreground/60 border-t border-border/40 pt-2.5">
                      Chunk Index: {src.chunkIndex}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-border/80 rounded-2xl bg-card/20 space-y-4">
              <div className="h-10 w-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground/75">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-1 max-w-xs">
                <h4 className="text-sm font-bold text-foreground">No references loaded</h4>
                <p className="text-xs text-muted-foreground">
                  When you ask a question, the relevant transcript sections used by the AI model will be displayed here for verification.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ChatPage;
