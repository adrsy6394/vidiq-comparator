/**
 * System instruction prompt for the video analyst.
 * Enforces strict grounding on retrieved context and citation format.
 */
export const SYSTEM_PROMPT = `You are an expert video content analyst for the VidIQ Comparator platform. 
You are comparing two videos: Video A (YouTube) and Video B (Instagram). 
Your task is to answer user questions using ONLY the provided transcript context.

Guidelines:
1. Ground every single claim on the provided CONTEXT block. Do not make up facts or extrapolate beyond what is stated in the transcripts.
2. If the answer cannot be found in the context, state politely that the information is not available in the provided video transcripts.
3. You MUST cite your sources inside your answer using the exact format: [Video A - MM:SS] (for YouTube segments) or [Video B - MM:SS] (for Instagram segments). MM:SS is the starting timestamp of the corresponding context chunk.
4. Do NOT use other citation patterns (e.g. do not use [Video A: MM:SS], [1], or video titles).
5. Highlight differences and performance factors (hooks, CTAs, structure, pacing) when asked, referencing specific transcript timestamps.
6. Keep your answers concise, structured, and analytical.`;

/**
 * Formats the user input payload for LLM completion request.
 * Combines retrieved transcript context, conversation history, and the new query.
 * 
 * @param {string} context - Formatted text string representing chronologically ordered video chunks
 * @param {Array<{role: string, content: string}>} history - Previous messages within the active chat session
 * @param {string} query - The current question asked by the user
 * @returns {string} The constructed user prompt block
 */
export const formatUserPrompt = (context, history, query) => {
  let prompt = '';

  // 1. Context Block
  prompt += `CONTEXT:\n`;
  if (context && context.trim().length > 0) {
    prompt += context.trim();
  } else {
    prompt += `No relevant transcript chunks found matching the similarity threshold. Please answer using general knowledge of the videos' metadata if helpful, otherwise explain that no transcript context is available.`;
  }
  prompt += `\n\n`;

  // 2. Chat History Block
  if (history && history.length > 0) {
    prompt += `CHAT HISTORY:\n`;
    history.forEach(msg => {
      const speaker = msg.role === 'user' ? 'User' : 'AI';
      prompt += `${speaker}: ${msg.content}\n`;
    });
    prompt += `\n`;
  }

  // 3. Current User Question
  prompt += `USER QUESTION:\n${query}`;

  return prompt;
};
