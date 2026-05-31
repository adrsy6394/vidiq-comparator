# 🏗️ System Design (High-Level Architecture)

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│                                                                  │
│   React.js SPA (Tailwind CSS + React Query)                      │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│   │  Home    │  │Dashboard │  │  Chat    │  │  Session     │   │
│   │  Page    │  │  Page    │  │  Panel   │  │  History     │   │
│   └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
└───────────────────────────┬──────────────────────────────────────┘
                            │ REST API + SSE (streaming)
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                      API GATEWAY / BACKEND                       │
│                                                                  │
│   Node.js + Express.js                                           │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │  Routes: /analyze  /chat  /session  /health              │   │
│   │  Middleware: Auth, RateLimit, Validate, ErrorHandler      │   │
│   └──────────────────────────────────────────────────────────┘   │
│                            │                                     │
│   ┌────────────┬───────────┼────────────┬─────────────────────┐  │
│   ▼            ▼           ▼            ▼                     │  │
│ Video       Transcript  Embedding    Chat                      │  │
│ Service     Service     Service      Service                   │  │
└──┬──────────────┬────────────┬───────────┬──────────────────────┘
   │              │            │           │
   ▼              ▼            ▼           ▼
┌──────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────────────┐
│YT API│  │Whisper / │  │ OpenAI   │  │  LangChain RAG Pipeline  │
│IG API│  │YT Trans  │  │Embeddings│  │  (Retriever + LLM)       │
└──────┘  └──────────┘  └──────────┘  └──────────────────────────┘
                                                │
                         ┌──────────────────────┼──────────┐
                         ▼                      ▼          ▼
                    ┌─────────┐          ┌──────────┐  ┌───────┐
                    │ Qdrant  │          │ MongoDB  │  │ Redis │
                    │(Vectors)│          │  (Data)  │  │(Queue)│
                    └─────────┘          └──────────┘  └───────┘
```

---

## Component Breakdown

### 1. Frontend (React SPA)

| Component | Responsibility |
|---|---|
| `HomePage` | URL input, trigger analysis |
| `DashboardPage` | Display metadata + comparison |
| `ChatPanel` | Message UI + streaming display |
| `SessionHistory` | List of past analyses |
| `React Query` | Server state management + caching |

### 2. Backend (Node.js + Express)

| Module | Responsibility |
|---|---|
| `VideoService` | Fetch metadata from YT/IG APIs |
| `TranscriptService` | Extract and clean transcript |
| `EmbeddingService` | Chunk text + generate OpenAI embeddings |
| `VectorService` | Store/query Qdrant |
| `ChatService` | Orchestrate RAG, stream LLM response |
| `SessionService` | Save/retrieve chat history |

### 3. External Services

| Service | Purpose |
|---|---|
| **YouTube Data API v3** | Video metadata |
| **youtube-transcript** | Transcript extraction |
| **Instagram Graph API** | Video metadata |
| **OpenAI API** | Embeddings + GPT-4 chat |
| **Qdrant Cloud** | Vector similarity search |

---

## Data Flow

### Analysis Flow

```
User → POST /analyze
  → VideoService: Fetch YT + IG metadata
  → TranscriptService: Get transcript text
  → EmbeddingService: Chunk → Embed
  → VectorService: Store in Qdrant
  → MongoDB: Save video + analysis data
  → Response: { analysisId, metadata, engagement }
```

### Chat Flow

```
User → POST /chat { message, sessionId }
  → EmbeddingService: Embed user query
  → VectorService: Query Qdrant (top-k = 5)
  → ChatService: Build prompt with context
  → OpenAI GPT-4: Stream response
  → SSE: Stream tokens to frontend
  → MongoDB: Save chat message + response
```

---

## Async Job Queue (Bull + Redis)

Heavy operations (embedding generation) run as background jobs:

```
POST /analyze
  → Creates Bull Job (transcription + embedding)
  → Returns { jobId } immediately
  → Frontend polls GET /status/:jobId
  → On completion → Frontend loads dashboard
```

---

## Deployment Architecture

```
Internet
  ↓
Nginx (Reverse Proxy + SSL)
  ↓
  ├── React Build (static files)
  └── Node.js API (port 3001)
          ↓
    Docker Network
    ├── MongoDB container
    ├── Redis container
    └── Qdrant container (or cloud)
```