import { useState, useCallback } from 'react';
import { fetchChatHistory, sendChatMessageStream } from '../services/chatService.js';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Load past conversation logs for a session
  const loadHistory = useCallback(async (sessionId) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchChatHistory(sessionId);
      if (data.success && data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load chat history.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send a message and read SSE token stream response
  const sendMessage = async (analysisId, sessionId, userText) => {
    if (!userText.trim()) return;

    setIsLoading(true);
    setError('');
    setStreamingMessage('');

    // Form user message representation
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString(),
    };

    // Optimistically update message list
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Trigger native fetch stream request
      const response = await sendChatMessageStream(analysisId, sessionId, userText);

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || 'Server stream connection failed.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let buffer = '';
      let accumulatedText = '';
      let sources = [];
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value || new Uint8Array(), { stream: !done });
        buffer += chunk;

        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Hold partial line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            try {
              const event = JSON.parse(dataStr);
              
              if (event.type === 'token') {
                accumulatedText += event.content;
                setStreamingMessage(accumulatedText);
              } else if (event.type === 'done') {
                sources = event.sources || [];
              } else if (event.type === 'error') {
                throw new Error(event.error || 'Stream generated an error.');
              }
            } catch (err) {
              // Ignore parse errors on partial streams
            }
          }
        }
      }

      // Append completed assistant message response to standard state list
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: accumulatedText,
        sources,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingMessage('');

    } catch (err) {
      setError(err.message || 'Connection lost during stream transmission.');
      // Remove last optimistic user message if we fail on the initial connection
      setMessages((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].role === 'user') {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setStreamingMessage('');
    setError('');
    setIsLoading(false);
  };

  return {
    messages,
    streamingMessage,
    isLoading,
    error,
    loadHistory,
    sendMessage,
    clearChat,
  };
};
