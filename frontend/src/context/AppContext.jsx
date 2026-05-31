import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [analysisId, setAnalysisId] = useState(
    localStorage.getItem('vidiq_analysisId') || ''
  );
  
  const [sessionId, setSessionId] = useState(
    localStorage.getItem('vidiq_sessionId') || ''
  );
  
  const [theme, setTheme] = useState(
    localStorage.getItem('vidiq_theme') || 'dark' // Dark mode by default
  );

  const [recentSessions, setRecentSessions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('vidiq_recent_sessions') || '[]');
    } catch {
      return [];
    }
  });

  // Synchronize state parameter updates into localStorage
  useEffect(() => {
    if (analysisId) {
      localStorage.setItem('vidiq_analysisId', analysisId);
    } else {
      localStorage.removeItem('vidiq_analysisId');
    }
  }, [analysisId]);

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('vidiq_sessionId', sessionId);
    } else {
      localStorage.removeItem('vidiq_sessionId');
    }
  }, [sessionId]);

  // Toggle CSS class mappings on documentElement
  useEffect(() => {
    localStorage.setItem('vidiq_theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  /**
   * Add session metadata to local history list
   * @param {{analysisId: string, youtubeUrl: string, instagramUrl: string, timestamp: string}} session 
   */
  const addRecentSession = (session) => {
    if (!session || !session.analysisId) return;

    setRecentSessions((prev) => {
      // Remove any existing duplication
      const filtered = prev.filter((s) => s.analysisId !== session.analysisId);
      const updated = [
        { ...session, timestamp: session.timestamp || new Date().toISOString() },
        ...filtered
      ].slice(0, 10); // Hold top 10 recent analyses
      
      localStorage.setItem('vidiq_recent_sessions', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <AppContext.Provider
      value={{
        analysisId,
        setAnalysisId,
        sessionId,
        setSessionId,
        theme,
        toggleTheme,
        recentSessions,
        addRecentSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
