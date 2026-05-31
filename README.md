# 📊 VidIQ Comparator - Social Video Intelligence Dashboard

VidIQ Comparator is a state-of-the-art full-stack web application designed for social media creators and content analysts. It allows side-by-side comparative metadata analysis of a YouTube video and an Instagram Reel, coupled with an interactive RAG (Retrieval-Augmented Generation) chatbot to converse directly with video transcripts.

---

## ✨ Key Features

*   **Side-by-Side Metrics Cards:** Compares thumbnail, titles, plays/views, likes, comments, and duration side-by-side with automatic engagement rate calculation.
*   **Custom SVG Engagement Chart:** Visualizes audience interaction ratios dynamically using real mathematical scaling.
*   **AI Comparative Report:** Leverages **Gemini 2.0 Flash** (via OpenRouter) to write an expert content analysis comparing the hook strategies, Call to Actions (CTAs), content density, and platform alignment.
*   **SSE Streaming RAG Chatbot:** Converses about the video transcripts with real-time word-by-word token streaming using Server-Sent Events (SSE).
*   **Interactive Citation Links:** Clicking on AI citation references (e.g. `[Video A - 01:23]`) automatically scrolls the corresponding segment into view and highlights it in a glowing animation on the reference panel.
*   **Smart Offline Fallbacks (Zero-Install Local Dev):**
    *   **In-Memory Background Queue:** Bypasses Bull Queue/Redis and executes metadata scraping and AI summaries in memory if Redis is down.
    *   **MongoDB Transcript RAG:** Bypasses vector searches and queries MongoDB transcripts directly if Qdrant is offline, keeping the RAG chatbot fully functional.

---

## 🛠️ Technology Stack

*   **Frontend:** React 19, Vite, Tailwind CSS v3, ShadCN UI, Lucide React, Axios.
*   **Backend:** Node.js, Express, Mongoose (MongoDB Atlas), Winston Logger, Zod validator.
*   **Databases & Caches:** MongoDB, Redis (Bull), Qdrant (Vector DB).
*   **AI Integration:** OpenRouter (`google/gemini-2.0-flash-001` and `openai/text-embedding-3-small`).

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
PORT=3001
NODE_ENV=development

# OpenAI API / OpenRouter Settings
OPENROUTER_API_KEY=your-openrouter-api-key

# YouTube Data API v3 Settings
YOUTUBE_API_KEY=your-youtube-api-key

# Instagram Scraper / Graph Token
INSTAGRAM_ACCESS_TOKEN=your-instagram-token

# Mongoose Database URI
MONGODB_URI=your-mongodb-atlas-connection-uri

# Qdrant Vector Search Settings
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=

# Redis Event Queue Settings
REDIS_URL=redis://localhost:6379
```

---

## 🚀 How to Run the Project

### Option A: Natively Without Docker (Simplest Local Development)
Thanks to the custom in-memory fallbacks, you can run the project without installing Redis or Qdrant locally:

1.  **Start the Backend API:**
    ```bash
    cd backend
    npm install
    npm run dev
    ```
2.  **Start the Frontend Client:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
3.  Open `http://localhost:5173` in your browser.

---

### Option B: Docker Compose (Full-Stack Setup)
If Docker Desktop is running on your system, you can spin up all required databases (Redis, Qdrant, MongoDB) in containers:

1.  **Spin up infrastructure containers:**
    ```bash
    docker compose up -d
    ```
2.  **Run local servers:** Start your local backend and frontend dev servers using `npm run dev` in both folders. They will automatically connect to the Docker containers.

---

### Option C: Production Docker Profile
To run everything (including backend & frontend) inside production Docker containers:
```bash
docker compose -f docker-compose.prod.yml up --build -d
```
*   Frontend: `http://localhost` (Port 80)
*   Backend: `http://localhost:3001`

---

## 🌐 Production Deployment Guide

### Frontend (Vercel)
The client includes a custom [vercel.json](frontend/vercel.json) rewrite rule to handle React Router client-side URL reloads:
1.  Import your repository into Vercel.
2.  Set the **Root Directory** as `frontend`.
3.  Add the environment variable `VITE_API_BASE_URL` pointing to your deployed backend URL (e.g. `https://vidiq-backend.onrender.com/api`).
4.  Click **Deploy**.

### Backend (Render or Railway)
For persistent servers supporting SSE streams:
1.  Create a Web Service on Render pointing to your repository.
2.  Set **Root Directory** to `backend`.
3.  Configure environment variables from the backend `.env` file (ensure `NODE_ENV=production`).
4.  Build command: `npm install`, Start command: `npm start`.
