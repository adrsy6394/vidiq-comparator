import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble.jsx';
import { Send, ArrowRight, Loader2 } from 'lucide-react';

const ChatPanel = ({ messages = [], streamingMessage = '', isLoading, onSendMessage, onCitationClick }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // Suggested questions list
  const suggestions = [
    'Compare the hook strategies.',
    'Pacing differences in first 30s?',
    'Which video has a stronger CTA?'
  ];

  // Auto-scroll on content updates
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (text && !isLoading) {
      onSendMessage(text);
      setInputText('');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (!isLoading) {
      onSendMessage(suggestion);
    }
  };

  return (
    <div className="flex flex-col h-full border-r border-border/80 bg-background">
      
      {/* Scrollable messages area */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/30">
        {messages.length === 0 && !streamingMessage && (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
              <MessageSquarePlaceholder className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-foreground">Interactive RAG Chat</h4>
              <p className="text-sm text-muted-foreground max-w-sm">
                Ask specific questions about hooks, retention pacing, and CTAs. We will query context chunks directly from transcripts.
              </p>
            </div>
          </div>
        )}

        {/* Existing Messages list */}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onCitationClick={onCitationClick} />
        ))}

        {/* Active streaming message bubble */}
        {streamingMessage && (
          <MessageBubble
            message={{
              id: 'streaming',
              role: 'assistant',
              content: streamingMessage
            }}
            onCitationClick={onCitationClick}
          />
        )}

        {/* Active connection thinking indicator */}
        {isLoading && !streamingMessage && (
          <div className="flex items-center gap-3 py-6 px-5 bg-accent/15 border-y border-border/40 text-muted-foreground text-xs">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
            <span>AI Analyst is compiling context chunks...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {!isLoading && messages.length === 0 && (
        <div className="px-5 py-3 border-t border-border/40 bg-accent/5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90 mb-2">
            Suggested Prompts
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(s)}
                className="flex items-center gap-1 rounded-lg border border-border/80 bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-all cursor-pointer focus:outline-none"
              >
                <span>{s}</span>
                <ArrowRight className="h-3 w-3 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Submit box */}
      <form onSubmit={handleSubmit} className="border-t border-border/80 p-4 bg-card/60 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask a question about both videos..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            className="flex-grow rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 transition-all duration-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-600 text-white shadow shadow-emerald-500/10 hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>

    </div>
  );
};

// Internal icon placeholder
const MessageSquarePlaceholder = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export default ChatPanel;
