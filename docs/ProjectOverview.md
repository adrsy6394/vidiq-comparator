# 📌 Project Overview

## Project Name
**VidIQ Comparator** — AI-powered Social Video Intelligence Platform

---

## 🧩 Problem Statement

Content creators on YouTube and Instagram struggle to understand **why** one video performs better than another. They lack tools that can:
- Compare engagement metrics side-by-side intelligently
- Analyze transcript content for topic quality
- Give AI-backed reasoning, not just raw numbers

There is no single platform that combines **video metadata analysis + transcript intelligence + conversational AI** to explain performance differences.

---

## 💡 Solution

A full-stack AI platform where users paste **two video URLs** (YouTube + Instagram) and the system:
1. Extracts transcripts and metadata
2. Generates vector embeddings using RAG
3. Lets users **chat** with both videos using natural language
4. Provides AI-driven insights with **source citations**

---

## ✨ Main Features

| Feature | Description |
|---|---|
| Dual URL Input | Accept one YouTube and one Instagram URL |
| Metadata Extraction | Title, views, likes, comments, creator info |
| Transcript Intelligence | Auto-extract and process spoken content |
| Engagement Comparison | Side-by-side metric analysis |
| RAG Chat Interface | Ask questions about both videos |
| Source Citations | AI answers backed by transcript references |
| Session History | Save and revisit past analysis sessions |

---

## 🛠️ Tech Stack

### Frontend
- **React.js** — UI framework
- **Tailwind CSS** — Styling
- **Axios** — API calls
- **React Query** — State & caching

### Backend
- **Node.js + Express** — REST API server
- **LangChain** — RAG orchestration
- **OpenAI GPT-4** — Language model
- **Qdrant** — Vector database
- **MongoDB** — Persistent storage
- **Bull / Redis** — Job queue for async processing

### External APIs
- **YouTube Data API v3** — Metadata + transcript
- **Instagram Graph API / Apify scraper** — Instagram metadata
- **OpenAI Embeddings API** — text-embedding-3-small

---

## 🎯 Expected Outcome

- Creators get a **clear AI explanation** of performance differences
- Fully functional **chat interface** that references actual video content
- Production-ready app with streaming responses
- Demonstrates advanced RAG + LLM + vector search integration
- Strong portfolio/interview-ready project