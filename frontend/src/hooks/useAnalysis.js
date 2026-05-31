import { useState, useEffect, useRef, useContext } from 'react';
import { submitAnalysis, getAnalysisStatus } from '../services/analysisService.js';
import { AppContext } from '../context/AppContext.jsx';

export const useAnalysis = () => {
  const { addRecentSession, setAnalysisId } = useContext(AppContext);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState('');
  const [jobId, setJobId] = useState('');
  const [activeAnalysisId, setActiveAnalysisId] = useState('');
  const [steps, setSteps] = useState({
    metadata: 'pending',
    transcript: 'pending',
    embedding: 'pending',
    analysis: 'pending'
  });

  const pollIntervalRef = useRef(null);

  // Clear polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const startAnalysis = async (youtubeUrl, instagramUrl) => {
    setStatus('loading');
    setError('');
    setJobId('');
    setSteps({
      metadata: 'pending',
      transcript: 'pending',
      embedding: 'pending',
      analysis: 'pending'
    });

    try {
      // 1. Trigger analysis on backend
      const result = await submitAnalysis(youtubeUrl, instagramUrl);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit analysis.');
      }

      setJobId(result.jobId);
      setActiveAnalysisId(result.analysisId);
      setAnalysisId(result.analysisId); // Sync to global context

      // Add to recent sessions list in context
      addRecentSession({
        analysisId: result.analysisId,
        youtubeUrl,
        instagramUrl,
        timestamp: new Date().toISOString()
      });

      // 2. Start status polling
      pollIntervalRef.current = setInterval(async () => {
        try {
          const statusData = await getAnalysisStatus(result.jobId);
          
          if (!statusData.success) {
            throw new Error(statusData.error || 'Failed to poll status.');
          }

          // Update individual step states from response
          if (statusData.progress && statusData.progress.steps) {
            setSteps(statusData.progress.steps);
          }

          if (statusData.status === 'ready') {
            // Processing complete
            setStatus('success');
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
            }
          } else if (statusData.status === 'failed') {
            // Background processing failed
            throw new Error('Analysis job failed during execution.');
          }
        } catch (pollErr) {
          setError(pollErr.message || 'Error tracking processing progress.');
          setStatus('error');
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
        }
      }, 1500); // Poll every 1.5 seconds

    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Server connection error.');
      setStatus('error');
    }
  };

  const resetAnalysis = () => {
    setStatus('idle');
    setError('');
    setJobId('');
    setActiveAnalysisId('');
    setSteps({
      metadata: 'pending',
      transcript: 'pending',
      embedding: 'pending',
      analysis: 'pending'
    });
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
  };

  return {
    status,
    error,
    steps,
    analysisId: activeAnalysisId,
    startAnalysis,
    resetAnalysis
  };
};
