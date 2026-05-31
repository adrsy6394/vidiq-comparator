# ⚙️ Backend Specification

## Tech Stack
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: JavaScript (ES Modules) or TypeScript
- **Queue**: Bull + Redis
- **Logging**: Winston
- **Validation**: Zod
- **ORM/ODM**: Mongoose (MongoDB)

---

## Project Entry Point

```
backend/
  └── server.js       ← Express app initialization + listen
  └── app.js          ← Middleware, routes, error handling
```

---

## Modules & Responsibilities

### 1. `VideoService`
**File**: `services/videoService.js`

**Responsibilities**:
- Call YouTube Data API v3 to fetch video metadata
- Call Instagram Graph API (or Apify scraper) for IG metadata
- Normalize response into a unified `VideoMetadata` schema
- Handle private/deleted/geo-restricted videos

```js
// Methods
getYouTubeMetadata(videoId) → Promise<VideoMetadata>
getInstagramMetadata(shortcode) → Promise<VideoMetadata>
extractVideoId(url) → string
```

---

### 2. `TranscriptService`
**File**: `services/transcriptService.js`

**Responsibilities**:
- Fetch YouTube transcript using `youtube-transcript` npm package
- For Instagram: extract captions from API or use OpenAI Whisper STT
- Clean raw transcript (remove filler words, fix encoding)
- Return structured segments: `[{ text, start, duration }]`

```js
// Methods
getYouTubeTranscript(videoId) → Promise<TranscriptSegment[]>
getInstagramTranscript(videoUrl) → Promise<TranscriptSegment[]>
cleanTranscript(segments) → string
```

---

### 3. `EmbeddingService`
**File**: `services/embeddingService.js`

**Responsibilities**:
- Accept raw transcript text
- Split into chunks (500 tokens, 50 overlap) using LangChain `RecursiveCharacterTextSplitter`
- Generate embeddings via OpenAI `text-embedding-3-small`
- Return array of `{ text, embedding, metadata }`

```js
// Methods
chunkText(text, chunkSize, overlap) → string[]
generateEmbeddings(chunks, metadata) → Promise<EmbeddedChunk[]>
```

---

### 4. `VectorService`
**File**: `services/vectorService.js`

**Responsibilities**:
- Connect to Qdrant instance
- Create collection if not exists (dimension: 1536)
- Upsert vectors with payload: `{ text, videoId, platform, chunkIndex, timestamp }`
- Query top-k similar chunks given a query embedding
- Delete vectors by analysisId (cleanup)

```js
// Methods
upsertVectors(collectionName, vectors) → Promise<void>
queryVectors(collectionName, queryEmbedding, topK) → Promise<SearchResult[]>
deleteByFilter(collectionName, filter) → Promise<void>
```

---

### 5. `ChatService`
**File**: `services/chatService.js`

**Responsibilities**:
- Receive user query + sessionId
- Embed user query using EmbeddingService
- Retrieve top-5 chunks from VectorService
- Build RAG prompt (system + context + history + query)
- Call OpenAI GPT-4 with streaming enabled
- Pipe SSE stream to Express response
- Save chat turn to MongoDB

```js
// Methods
handleChat(sessionId, userMessage, res) → void (streams to res)
buildPrompt(context, history, query) → ChatMessage[]
```

---

### 6. `SessionService`
**File**: `services/sessionService.js`

**Responsibilities**:
- Create new session with unique UUID
- Save message pairs (user + AI) to `chatHistory` collection
- Retrieve full session history
- List sessions by userId (if auth added later)

```js
// Methods
createSession(analysisId) → Promise<string>  // returns sessionId
saveMessage(sessionId, userMsg, aiMsg) → Promise<void>
getHistory(sessionId) → Promise<Message[]>
```

---

## Middleware Stack

```js
app.use(cors())
app.use(express.json())
app.use(helmet())
app.use(rateLimit({ windowMs: 60*60*1000, max: 10 }))   // 10/hr
app.use(requestLogger)    // Winston logs
app.use(validateEnv)      // Fail fast if env vars missing
```

---

## Route Map

| Method | Endpoint | Handler | Description |
|---|---|---|---|
| POST | `/api/analyze` | `analyzeController` | Start full analysis |
| GET | `/api/status/:jobId` | `statusController` | Poll job progress |
| POST | `/api/chat` | `chatController` | Send chat message |
| GET | `/api/session/:id` | `sessionController` | Get chat history |
| GET | `/api/health` | inline | Health check |

---

## Error Handling

All errors go through a central error handler:

```js
// middleware/errorHandler.js
app.use((err, req, res, next) => {
  logger.error(err.message)
  res.status(err.status || 500).json({
    success: false,
    error: err.message
  })
})
```

Custom error classes:
```
AppError extends Error
  ├── ValidationError (400)
  ├── NotFoundError (404)
  ├── ExternalAPIError (502)
  └── RateLimitError (429)
```

---

## Environment Variables

```env
# Server
PORT=3001
NODE_ENV=production

# OpenAI
OPENAI_API_KEY=

# YouTube
YOUTUBE_API_KEY=

# Instagram
INSTAGRAM_ACCESS_TOKEN=

# MongoDB
MONGODB_URI=

# Qdrant
QDRANT_URL=
QDRANT_API_KEY=

# Redis
REDIS_URL=
```