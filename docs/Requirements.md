# 📋 Requirements

## 1. Functional Requirements

These are the **core things the system must do**.

---

### FR-01: Accept Dual Video URLs
- System must accept exactly **one YouTube URL** and **one Instagram URL**
- URLs must be validated before processing begins
- Invalid or unsupported URLs must return a clear error message

### FR-02: Extract Metadata
- For YouTube:
  - Title, description, view count, like count, comment count
  - Channel name, subscriber count, upload date, duration
- For Instagram:
  - Caption, play count, like count, comment count
  - Username, post date, video duration

### FR-03: Extract Transcript
- YouTube: Use YouTube Transcript API or `youtube-transcript` npm package
- Instagram: Extract captions or use Whisper STT if no captions available
- Transcript must be segmented (with timestamps if available)
- Handle videos with no transcript gracefully

### FR-04: Calculate Engagement Metrics
- Engagement Rate = (Likes + Comments) / Views × 100
- Display per-platform benchmarks
- Generate comparative engagement summary

### FR-05: Store Embeddings in Vector DB
- Chunk transcript text into 500-token chunks with 50-token overlap
- Generate embeddings using OpenAI `text-embedding-3-small`
- Store in Qdrant with metadata: `{videoId, platform, chunkIndex, timestamp}`
- Tag each chunk with which video it belongs to

### FR-06: Chat with Videos
- User can ask natural language questions about both videos
- System uses RAG to retrieve relevant transcript chunks
- LLM generates an answer with context from both videos
- Questions like:
  - "Why did Video A get more views?"
  - "What topics did Video B cover that A didn't?"

### FR-07: Source Citations
- Every AI answer must include citations
- Citations reference the exact transcript chunk used
- Display format: `[Video A - 02:34] "...transcript text..."`

### FR-08: Session Management
- Each analysis gets a unique `sessionId`
- Chat history is saved per session
- Users can continue previous sessions

---

## 2. Non-Functional Requirements

These define **how the system must perform**.

---

### NFR-01: Performance
- Metadata extraction: < 5 seconds
- Embedding generation: < 30 seconds for full transcript
- Chat response (first token): < 3 seconds with streaming

### NFR-02: Scalability
- Backend must support horizontal scaling
- Vector DB (Qdrant) must handle 100K+ vectors
- Job queue (Bull + Redis) for async transcript/embedding tasks

### NFR-03: Responsiveness
- UI must be fully responsive: mobile, tablet, desktop
- Chat interface must support keyboard shortcuts
- Loading states and skeleton screens on all async operations

### NFR-04: Streaming
- AI responses must stream token-by-token (SSE or WebSocket)
- User sees partial answers in real-time
- Streaming must handle connection drops gracefully

### NFR-05: Production Readiness
- `.env` based configuration — no hardcoded secrets
- Error logging with structured logs (Winston / Pino)
- Input sanitization and rate limiting on all endpoints
- CORS configured correctly
- Docker-ready with `docker-compose.yml`

### NFR-06: Reliability
- System must handle YouTube/Instagram API failures gracefully
- Retry logic for transient errors (3 retries with exponential backoff)
- Partial success: if one video fails, show error for that video only

### NFR-07: Security
- API keys stored in environment variables only
- Rate limit: 10 analysis requests per IP per hour
- Input validation on all endpoints (Joi / Zod)