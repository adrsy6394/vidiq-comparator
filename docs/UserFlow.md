# 🔄 User Flow

## Complete User Journey

---

## Step-by-Step Flow

```
┌─────────────────────────────────────────────┐
│                  USER                       │
│        Opens the Web Application            │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│            HOME PAGE (URL Input)            │
│  ┌───────────────────────────────────────┐  │
│  │  YouTube URL: [________________]      │  │
│  │  Instagram URL: [______________]      │  │
│  │          [ Analyze Videos ]           │  │
│  └───────────────────────────────────────┘  │
└─────────────────────┬───────────────────────┘
                      │  User clicks "Analyze"
                      ▼
┌─────────────────────────────────────────────┐
│           URL VALIDATION                    │
│  - Check YouTube URL format                 │
│  - Check Instagram URL format               │
│  - Show inline errors if invalid            │
└─────────────────────┬───────────────────────┘
                      │  Valid URLs
                      ▼
┌─────────────────────────────────────────────┐
│         ANALYSIS PIPELINE (Backend)         │
│                                             │
│  Phase 1: Metadata Extraction               │
│  ├── Fetch YouTube metadata (API v3)        │
│  └── Fetch Instagram metadata (Graph API)   │
│                                             │
│  Phase 2: Transcript Processing             │
│  ├── Extract YouTube transcript             │
│  ├── Extract Instagram captions/audio       │
│  └── Clean & segment transcript text        │
│                                             │
│  Phase 3: RAG Setup                         │
│  ├── Chunk transcripts (500 tokens)         │
│  ├── Generate embeddings (OpenAI)           │
│  └── Store in Qdrant vector DB              │
│                                             │
│  Phase 4: Engagement Analysis               │
│  └── Calculate & compare metrics            │
└─────────────────────┬───────────────────────┘
                      │  analysisId returned
                      ▼
┌─────────────────────────────────────────────┐
│         ANALYSIS DASHBOARD                  │
│                                             │
│  ┌──────────────┐    ┌──────────────┐       │
│  │  YouTube     │    │  Instagram   │       │
│  │  Video Card  │    │  Video Card  │       │
│  │  - Title     │    │  - Caption   │       │
│  │  - Views     │    │  - Plays     │       │
│  │  - Likes     │    │  - Likes     │       │
│  │  - Comments  │    │  - Comments  │       │
│  │  - Eng Rate  │    │  - Eng Rate  │       │
│  └──────────────┘    └──────────────┘       │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │     COMPARISON SUMMARY CARD         │    │
│  │  "Video A has 3x higher engagement  │    │
│  │   due to stronger hook in first     │    │
│  │   30 seconds..."                    │    │
│  └─────────────────────────────────────┘    │
└─────────────────────┬───────────────────────┘
                      │  User scrolls / clicks chat
                      ▼
┌─────────────────────────────────────────────┐
│           CHAT INTERFACE                    │
│                                             │
│  [Chat History Area]                        │
│  ┌─────────────────────────────────────┐    │
│  │ User: Why did Video A do better?    │    │
│  │                                     │    │
│  │ AI: Video A's transcript shows a    │    │
│  │ strong CTA at 1:24...               │    │
│  │ [Video A - 01:24] "Subscribe now"   │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  [Type your question...        ] [Send]     │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│              RAG PIPELINE                   │
│  1. Embed user query                        │
│  2. Search Qdrant for top-k chunks          │
│  3. Pass context to GPT-4                   │
│  4. Stream response with citations          │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│         AI INSIGHTS (Streamed)              │
│  - Answer with source citations             │
│  - Referenced transcript segments           │
│  - Actionable creator recommendations      │
└─────────────────────────────────────────────┘
```

---

## Error States in User Flow

| Step | Possible Error | User Sees |
|---|---|---|
| URL Validation | Invalid URL format | Inline red error |
| Metadata Fetch | Video is private/deleted | Toast: "Video not accessible" |
| Transcript | No transcript available | Warning: "Limited analysis" |
| Embedding | OpenAI API failure | Retry button |
| Chat | LLM timeout | "Please try again" |

---

## Happy Path Summary

```
Open App
  → Paste 2 URLs
    → Click Analyze
      → See Loading Progress
        → View Dashboard with Metadata + Metrics
          → Ask AI Questions in Chat
            → Get Streamed Answers with Citations
              → Save / Share Session
```