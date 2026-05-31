# 📡 API Contracts

**Base URL**: `http://localhost:3001/api`  
**Content-Type**: `application/json`  
**Streaming**: SSE (`text/event-stream`)

---

## 1. POST `/analyze`

**Description**: Submit two video URLs for analysis. Triggers async pipeline.

### Request
```json
{
  "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "instagramUrl": "https://www.instagram.com/reel/B7HrMRxFl2U/"
}
```

### Response — `202 Accepted`
```json
{
  "success": true,
  "analysisId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "jobId": "bull-job-id-123",
  "message": "Analysis started. Poll /status/:jobId for progress."
}
```

### Errors
| Code | Reason |
|---|---|
| `400` | Invalid or missing URL |
| `429` | Rate limit exceeded (10/hr per IP) |
| `502` | YouTube or Instagram API unreachable |

```json
// 400 Error example
{
  "success": false,
  "error": "Invalid YouTube URL format",
  "field": "youtubeUrl"
}
```

---

## 2. GET `/status/:jobId`

**Description**: Poll the progress of an analysis job.

### Response — `200 OK`
```json
{
  "success": true,
  "jobId": "bull-job-id-123",
  "analysisId": "a1b2c3d4-...",
  "status": "processing",
  "progress": {
    "step": "embedding",
    "stepsCompleted": 2,
    "totalSteps": 4,
    "steps": {
      "metadata": "done",
      "transcript": "done",
      "embedding": "processing",
      "analysis": "pending"
    },
    "percent": 50
  }
}
```

When complete:
```json
{
  "success": true,
  "status": "ready",
  "progress": { "percent": 100 },
  "analysisId": "a1b2c3d4-..."
}
```

---

## 3. GET `/analysis/:analysisId`

**Description**: Retrieve full analysis result (metadata + comparison summary).

### Response — `200 OK`
```json
{
  "success": true,
  "analysisId": "a1b2c3d4-...",
  "videos": {
    "youtube": {
      "videoId": "dQw4w9WgXcQ",
      "title": "Never Gonna Give You Up",
      "creator": "Rick Astley",
      "thumbnail": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      "metrics": {
        "views": 1400000000,
        "likes": 15000000,
        "comments": 2100000,
        "duration": 213,
        "engagementRate": 1.22
      },
      "publishedAt": "2009-10-25",
      "hasTranscript": true
    },
    "instagram": {
      "videoId": "B7HrMRxFl2U",
      "creator": "some_creator",
      "caption": "Check out this amazing reel...",
      "metrics": {
        "plays": 340000,
        "likes": 18000,
        "comments": 890,
        "duration": 30,
        "engagementRate": 5.56
      },
      "publishedAt": "2024-11-10",
      "hasTranscript": true
    }
  },
  "comparison": {
    "winner": "instagram",
    "summary": "Instagram video achieved 5.56% engagement vs YouTube's 1.22%...",
    "keyFactors": [
      "Stronger hook in first 5 seconds",
      "Clear CTA in caption",
      "Shorter duration matches platform behavior"
    ]
  }
}
```

---

## 4. POST `/chat`

**Description**: Send a question about the analyzed videos. Returns streamed response.

### Request
```json
{
  "message": "Why did the Instagram video perform better?",
  "analysisId": "a1b2c3d4-...",
  "sessionId": "sess-xyz-789"
}
```

### Response — `200 OK` (SSE Stream)
```
Content-Type: text/event-stream

data: {"type": "token", "content": "Based"}
data: {"type": "token", "content": " on"}
data: {"type": "token", "content": " the"}
...
data: {"type": "done", "sources": [
  {
    "videoLabel": "Video B (Instagram)",
    "platform": "instagram",
    "timestamp": "00:15",
    "excerpt": "POV: you followed these 3 steps",
    "chunkIndex": 1
  }
]}
```

### Errors
```json
// Session not found
{ "success": false, "error": "Session not found", "code": "SESSION_NOT_FOUND" }

// Analysis not ready
{ "success": false, "error": "Analysis still processing", "code": "NOT_READY" }
```

---

## 5. POST `/session`

**Description**: Create a new chat session for an analysis.

### Request
```json
{ "analysisId": "a1b2c3d4-..." }
```

### Response — `201 Created`
```json
{
  "success": true,
  "sessionId": "sess-xyz-789"
}
```

---

## 6. GET `/session/:sessionId`

**Description**: Retrieve full chat history for a session.

### Response — `200 OK`
```json
{
  "success": true,
  "sessionId": "sess-xyz-789",
  "analysisId": "a1b2c3d4-...",
  "messages": [
    {
      "id": "msg_001",
      "role": "user",
      "content": "Why did Video A do better?",
      "timestamp": "2025-01-01T10:00:00Z"
    },
    {
      "id": "msg_002",
      "role": "assistant",
      "content": "Video A's hook strategy was stronger...",
      "sources": [
        {
          "videoLabel": "Video A",
          "timestamp": "01:24",
          "excerpt": "first 30 seconds is everything"
        }
      ],
      "timestamp": "2025-01-01T10:00:05Z"
    }
  ]
}
```

---

## 7. GET `/health`

**Description**: Health check for uptime monitoring.

### Response — `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T10:00:00Z",
  "services": {
    "mongodb": "connected",
    "qdrant": "connected",
    "redis": "connected"
  }
}
```

---

## Common Response Envelope

All endpoints use this wrapper:

```json
// Success
{ "success": true, "data": {...} }

// Error
{ "success": false, "error": "Human-readable message", "code": "SNAKE_CASE_CODE" }
```