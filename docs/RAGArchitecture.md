# 🧠 RAG Architecture

## What is RAG?
**Retrieval-Augmented Generation** — Instead of asking GPT-4 to "remember" the video, we:
1. Store the video transcript as vector embeddings
2. When the user asks a question, we **retrieve** the most relevant transcript chunks
3. Pass those chunks as **context** to GPT-4
4. GPT-4 **generates** an answer grounded in actual video content

This eliminates hallucination and enables source citations.

---

## Complete RAG Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    INDEXING PIPELINE (at analysis time)         │
│                                                                 │
│  Video URLs                                                     │
│      │                                                          │
│      ▼                                                          │
│  Transcript Extraction                                          │
│  ├── YouTube: youtube-transcript npm package                    │
│  └── Instagram: Whisper STT / captions                         │
│      │                                                          │
│      ▼                                                          │
│  Text Cleaning                                                  │
│  └── Remove timestamps, filler, encoding artifacts             │
│      │                                                          │
│      ▼                                                          │
│  Chunking (RecursiveCharacterTextSplitter)                      │
│  ├── Chunk Size: 500 tokens                                     │
│  ├── Overlap: 50 tokens                                         │
│  └── Metadata per chunk: { videoId, platform, chunkIndex }     │
│      │                                                          │
│      ▼                                                          │
│  Embedding Generation (OpenAI API)                              │
│  ├── Model: text-embedding-3-small                              │
│  ├── Dimension: 1536                                            │
│  └── One API call per chunk (batched in groups of 20)          │
│      │                                                          │
│      ▼                                                          │
│  Vector Storage (Qdrant)                                        │
│  ├── Collection: "video_chunks_{analysisId}"                    │
│  ├── Payload: { text, videoId, platform, chunkIndex, start }   │
│  └── Distance: Cosine similarity                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   RETRIEVAL PIPELINE (at chat time)             │
│                                                                 │
│  User Query: "Why did Video A perform better?"                  │
│      │                                                          │
│      ▼                                                          │
│  Query Embedding                                                │
│  └── Same model: text-embedding-3-small                        │
│      │                                                          │
│      ▼                                                          │
│  Vector Search (Qdrant)                                         │
│  ├── top_k: 5 results                                           │
│  ├── Filter: { analysisId: "current" }                          │
│  └── Score threshold: 0.7 (ignore low-relevance chunks)        │
│      │                                                          │
│      ▼                                                          │
│  Context Assembly                                               │
│  ├── Deduplicate overlapping chunks                             │
│  ├── Sort by: [platform, chunkIndex]                            │
│  └── Format: "Video A [01:24]: ...text... \n Video B [00:45]..."│
│      │                                                          │
│      ▼                                                          │
│  Prompt Construction (see below)                                │
│      │                                                          │
│      ▼                                                          │
│  LLM: GPT-4 (with streaming)                                    │
│      │                                                          │
│      ▼                                                          │
│  Streamed Answer + Citations                                    │
│  └── SSE stream → React frontend                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Configuration Reference

| Parameter | Value | Reason |
|---|---|---|
| Chunk Size | 500 tokens | Balances context richness vs embedding cost |
| Chunk Overlap | 50 tokens | Prevents cutting mid-sentence |
| Embedding Model | `text-embedding-3-small` | Best cost/quality ratio |
| Embedding Dimension | 1536 | Default for text-embedding-3-small |
| Top-K Retrieval | 5 chunks | Enough context, avoids prompt overflow |
| Score Threshold | 0.70 | Discard irrelevant results |
| LLM Model | `gpt-4-turbo` | Best reasoning for comparison tasks |
| Max Tokens (response) | 1000 | Enough for detailed answer |
| Temperature | 0.3 | Low = factual, grounded in transcript |
| Splitter | `RecursiveCharacterTextSplitter` | Respects sentence boundaries |

---

## Prompt Template

```
SYSTEM:
You are an expert video content analyst. You have access to transcripts
from two videos. Answer user questions using ONLY the provided transcript
context. Always cite your sources in the format [Video A - MM:SS] or
[Video B - MM:SS].

CONTEXT:
--- Video A (YouTube) ---
[01:24] "Now if you really want to grow your channel, the first 30
seconds is everything. Here's what I do..."
[02:10] "I always end with a question to drive comments..."

--- Video B (Instagram) ---
[00:15] "POV: you followed these 3 steps and got 10K followers..."
[00:45] "The hook matters more than the content itself..."

CHAT HISTORY:
User: What's the main difference in hooks?
AI: Video A uses a direct promise hook while Video B uses a POV format...

USER QUESTION:
Why did Video B get a higher engagement rate despite fewer views?
```

---

## Retrieval Strategy

### Hybrid Retrieval (Phase 2 Enhancement)
For even better results, consider adding BM25 keyword search alongside vector search:

```
Query
  ├── Vector Search (semantic) → top 5 chunks
  ├── BM25 Search (keyword)    → top 5 chunks
  └── Reciprocal Rank Fusion   → final top 5 (deduplicated)
```

### Multi-Query Retrieval
LangChain `MultiQueryRetriever` generates 3 variants of the user question to improve recall:
```
Original: "Why did Video A do better?"
Variant 1: "What factors contributed to Video A's higher views?"
Variant 2: "How did Video A's content quality affect performance?"
Variant 3: "Compare the engagement strategies of both videos"
```

---

## Citation Format

Each answer includes inline citations:

```
AI Answer:
Video B achieved higher engagement because of its hook strategy.
[Video B - 00:15] uses a POV format which triggers emotional 
identification, while [Video A - 01:24] opens with a direct promise.
Research suggests POV hooks generate 40% more comments on average.
```