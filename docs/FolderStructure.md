# 📁 Folder Structure

## Complete Project Layout

```
vidiq-comparator/
│
├── frontend/                          # React.js Application
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── pages/                     # Route-level components
│   │   │   ├── HomePage.jsx           # URL input + landing
│   │   │   ├── DashboardPage.jsx      # Metadata + comparison
│   │   │   └── ChatPage.jsx           # Chat interface
│   │   │
│   │   ├── components/                # Reusable UI components
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Loader.jsx
│   │   │   │   ├── ErrorBanner.jsx
│   │   │   │   └── SkeletonCard.jsx
│   │   │   │
│   │   │   ├── video/
│   │   │   │   ├── VideoInput.jsx     # URL input fields
│   │   │   │   ├── VideoCard.jsx      # Metadata display
│   │   │   │   └── MetadataCard.jsx   # Individual stat tile
│   │   │   │
│   │   │   ├── analysis/
│   │   │   │   ├── ComparisonCard.jsx # AI summary card
│   │   │   │   └── EngagementChart.jsx
│   │   │   │
│   │   │   └── chat/
│   │   │       ├── ChatPanel.jsx      # Full chat UI
│   │   │       ├── MessageBubble.jsx  # Single message
│   │   │       └── SourceCitation.jsx # Citation badge
│   │   │
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── useAnalysis.js         # Trigger + poll analysis
│   │   │   ├── useChat.js             # SSE chat handler
│   │   │   ├── useSession.js          # Session management
│   │   │   └── useStreamingSSE.js     # Generic SSE hook
│   │   │
│   │   ├── services/                  # API client functions
│   │   │   ├── api.js                 # Axios instance + interceptors
│   │   │   ├── analysisService.js     # /analyze, /status, /analysis
│   │   │   ├── chatService.js         # /chat, /session
│   │   │   └── videoService.js        # Video-specific calls
│   │   │
│   │   ├── context/                   # React Context providers
│   │   │   └── AppContext.jsx         # Global state (analysis, session)
│   │   │
│   │   ├── utils/                     # Helpers
│   │   │   ├── urlValidator.js        # YT/IG URL regex validation
│   │   │   ├── formatters.js          # Number, time, % formatters
│   │   │   └── constants.js           # Shared constants
│   │   │
│   │   ├── App.jsx                    # Router setup
│   │   ├── main.jsx                   # React entry point
│   │   └── index.css                  # Tailwind base
│   │
│   ├── .env.local
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
│
├── backend/                           # Node.js + Express API
│   │
│   ├── controllers/                   # Request handlers (thin layer)
│   │   ├── analyzeController.js       # POST /analyze
│   │   ├── statusController.js        # GET /status/:jobId
│   │   ├── analysisController.js      # GET /analysis/:id
│   │   ├── chatController.js          # POST /chat (SSE)
│   │   └── sessionController.js       # Session CRUD
│   │
│   ├── routes/                        # Express routers
│   │   ├── index.js                   # Mount all routers
│   │   ├── analyzeRoutes.js
│   │   ├── chatRoutes.js
│   │   └── sessionRoutes.js
│   │
│   ├── services/                      # Business logic
│   │   ├── videoService.js            # YT + IG metadata fetch
│   │   ├── transcriptService.js       # Transcript extraction
│   │   ├── embeddingService.js        # Chunking + OpenAI embeddings
│   │   ├── vectorService.js           # Qdrant CRUD
│   │   ├── chatService.js             # RAG + streaming LLM
│   │   └── sessionService.js          # Chat history management
│   │
│   ├── middlewares/                   # Express middleware
│   │   ├── errorHandler.js            # Central error handler
│   │   ├── rateLimiter.js             # express-rate-limit config
│   │   ├── validateRequest.js         # Zod schema validation
│   │   └── requestLogger.js           # Winston request logging
│   │
│   ├── models/                        # Mongoose schemas
│   │   ├── Video.js
│   │   ├── Analysis.js
│   │   └── ChatHistory.js
│   │
│   ├── vector/                        # Qdrant-specific code
│   │   ├── qdrantClient.js            # Initialize Qdrant connection
│   │   ├── collectionManager.js       # Create/delete collections
│   │   └── vectorSearch.js            # Query logic
│   │
│   ├── rag/                           # LangChain RAG pipeline
│   │   ├── ragPipeline.js             # Main RAG orchestration
│   │   ├── promptTemplates.js         # System + user prompt templates
│   │   ├── retriever.js               # Qdrant-backed retriever
│   │   └── chunker.js                 # Text splitting logic
│   │
│   ├── jobs/                          # Bull job definitions
│   │   ├── queue.js                   # Redis + Bull setup
│   │   └── analysisJob.js             # Full analysis job processor
│   │
│   ├── config/                        # App configuration
│   │   ├── db.js                      # MongoDB connection
│   │   ├── env.js                     # Env validation (Zod)
│   │   └── constants.js               # Shared backend constants
│   │
│   ├── utils/                         # Utility functions
│   │   ├── logger.js                  # Winston logger instance
│   │   ├── asyncHandler.js            # try/catch wrapper for controllers
│   │   ├── urlParser.js               # Extract video ID from URL
│   │   └── engagementCalc.js          # Engagement rate formula
│   │
│   ├── app.js                         # Express app setup
│   ├── server.js                      # Listen + graceful shutdown
│   ├── package.json
│   └── .env
│
│
├── docs/                              # Project documentation
│   ├── 01-project-overview.md
│   ├── 02-requirements.md
│   ├── 03-user-flow.md
│   ├── 04-system-design.md
│   ├── 05-frontend-spec.md
│   ├── 06-backend-spec.md
│   ├── 07-rag-architecture.md
│   ├── 08-database-schema.md
│   ├── 09-api-contracts.md
│   └── 10-folder-structure.md
│
│
├── docker-compose.yml                 # MongoDB + Redis + Qdrant
├── .env.example                       # Template for all env vars
├── .gitignore
└── README.md
```

---

## Key File Responsibilities (Quick Ref)

| File | What it does |
|---|---|
| `backend/rag/ragPipeline.js` | Orchestrates full RAG chain |
| `backend/rag/promptTemplates.js` | System prompt + context format |
| `backend/vector/qdrantClient.js` | Qdrant initialization |
| `backend/jobs/analysisJob.js` | Full async pipeline (metadata → embed) |
| `backend/services/chatService.js` | Embed query → retrieve → stream LLM |
| `frontend/hooks/useChat.js` | SSE connection + message state |
| `frontend/hooks/useAnalysis.js` | Poll job status until ready |
| `frontend/components/chat/SourceCitation.jsx` | Inline citation badge |

---

## `docker-compose.yml` Preview

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: [mongo-data:/data/db]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  qdrant:
    image: qdrant/qdrant
    ports: ["6333:6333"]
    volumes: [qdrant-data:/qdrant/storage]

volumes:
  mongo-data:
  qdrant-data:
```

---

## `.env.example`

```env
# Backend
PORT=3001
NODE_ENV=development

# OpenAI
OPENAI_API_KEY=sk-...

# YouTube
YOUTUBE_API_KEY=AIza...

# Instagram
INSTAGRAM_ACCESS_TOKEN=...

# MongoDB
MONGODB_URI=mongodb://localhost:27017/vidiq

# Qdrant
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=

# Redis
REDIS_URL=redis://localhost:6379

# Frontend
VITE_API_BASE_URL=http://localhost:3001/api
```