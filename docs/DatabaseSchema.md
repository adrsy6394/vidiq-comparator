# 🗄️ Database Schema

## Database: MongoDB (via Mongoose)

---

## Collection 1: `videos`

Stores extracted metadata for each analyzed video.

```json
{
  "_id": "ObjectId",
  "analysisId": "uuid-string",
  "platform": "youtube | instagram",
  "videoId": "dQw4w9WgXcQ",
  "url": "https://youtube.com/watch?v=dQw4w9WgXcQ",

  "title": "Why Your Videos Aren't Growing",
  "description": "In this video I explain...",
  "creator": "MrBeast",
  "channelId": "UC123abc",
  "thumbnail": "https://img.youtube.com/vi/xxx/maxresdefault.jpg",

  "metrics": {
    "views": 1200000,
    "likes": 45000,
    "comments": 2100,
    "shares": 800,
    "duration": 847,
    "engagementRate": 3.93
  },

  "publishedAt": "2024-11-15T10:30:00Z",
  "language": "en",
  "hasTranscript": true,

  "transcriptRaw": "[{ text, start, duration }, ...]",
  "transcriptClean": "Full cleaned transcript text...",
  "wordCount": 3421,

  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

**Indexes**:
- `analysisId` (for fast lookup by session)
- `videoId + platform` (unique — prevent duplicate storage)

---

## Collection 2: `analyses`

Stores the result of comparing two videos.

```json
{
  "_id": "ObjectId",
  "analysisId": "uuid-string",

  "videoA": {
    "videoId": "dQw4w9WgXcQ",
    "platform": "youtube"
  },
  "videoB": {
    "videoId": "B7HrMRxFl2U",
    "platform": "instagram"
  },

  "comparisonSummary": "Video B achieved higher engagement despite fewer views because its POV hook triggered stronger emotional responses. [Video B - 00:15]...",

  "metrics": {
    "winner": "instagram",
    "engagementDiff": "+1.63%",
    "viewsDiff": "-860000",
    "likesRatioDiff": "+1.1%"
  },

  "qdrantCollection": "video_chunks_uuid-string",
  "status": "ready | processing | failed",
  "processingSteps": {
    "metadata": "done",
    "transcript": "done",
    "embedding": "done",
    "analysis": "done"
  },

  "createdAt": "2025-01-01T00:00:00Z",
  "expiresAt": "2025-02-01T00:00:00Z"
}
```

**Indexes**:
- `analysisId` (primary lookup)
- `createdAt` (for TTL cleanup — auto-expire after 30 days)

---

## Collection 3: `chatHistory`

Stores conversation history per session.

```json
{
  "_id": "ObjectId",
  "sessionId": "uuid-string",
  "analysisId": "uuid-string",

  "messages": [
    {
      "id": "msg_001",
      "role": "user",
      "content": "Why did Video A perform better?",
      "timestamp": "2025-01-01T10:00:00Z"
    },
    {
      "id": "msg_002",
      "role": "assistant",
      "content": "Based on the transcripts, Video A's hook strategy...",
      "sources": [
        {
          "videoLabel": "Video A",
          "platform": "youtube",
          "timestamp": "01:24",
          "excerpt": "the first 30 seconds is everything",
          "chunkIndex": 3
        }
      ],
      "timestamp": "2025-01-01T10:00:05Z",
      "tokensUsed": 420
    }
  ],

  "messageCount": 2,
  "createdAt": "2025-01-01T10:00:00Z",
  "updatedAt": "2025-01-01T10:00:05Z"
}
```

**Indexes**:
- `sessionId` (primary lookup)
- `analysisId` (for session listing per analysis)

---

## Vector Storage: Qdrant

Not MongoDB — Qdrant is a separate vector database.

### Collection Name
`video_chunks_{analysisId}`

### Point Schema (per chunk)
```json
{
  "id": "uuid",
  "vector": [0.023, -0.041, ...],  // 1536 dimensions

  "payload": {
    "analysisId": "uuid-string",
    "videoId": "dQw4w9WgXcQ",
    "platform": "youtube",
    "chunkIndex": 3,
    "text": "the first 30 seconds is everything. Here's what I do...",
    "startTime": 84.5,
    "endTime": 99.2,
    "wordCount": 47
  }
}
```

**Similarity Metric**: Cosine  
**Dimension**: 1536 (text-embedding-3-small)

---

## Mongoose Model Snippets

```js
// models/Video.js
const videoSchema = new mongoose.Schema({
  analysisId: { type: String, required: true, index: true },
  platform: { type: String, enum: ['youtube', 'instagram'] },
  videoId: String,
  title: String,
  creator: String,
  metrics: {
    views: Number, likes: Number, comments: Number,
    duration: Number, engagementRate: Number
  },
  transcriptClean: String,
  hasTranscript: Boolean,
}, { timestamps: true })

// models/ChatHistory.js
const chatSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  analysisId: String,
  messages: [{
    id: String, role: String, content: String,
    sources: Array, timestamp: Date
  }]
}, { timestamps: true })
```