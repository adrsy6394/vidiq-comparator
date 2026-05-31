process.env.NODE_ENV = 'test';
import app from './app.js';
import { connectDB } from './config/db.js';
import mongoose from 'mongoose';
import Analysis from './models/Analysis.js';
import ChatHistory from './models/ChatHistory.js';
import Video from './models/Video.js';

console.log('🧪 Starting System Performance & Rate Limiting Verification Tests...\n');

// 1. Connect to database
await connectDB();

const testPort = 3004;
const testAnalysisId = 'test-perf-analysis-uuid';

// 2. Setup mock data
await Analysis.findOneAndUpdate(
  { analysisId: testAnalysisId },
  {
    analysisId: testAnalysisId,
    videoA: { videoId: 'yt-perf', platform: 'youtube' },
    videoB: { videoId: 'ig-perf', platform: 'instagram' },
    status: 'ready',
    comparisonSummary: 'Performance test details.',
    metrics: {
      winner: 'youtube',
      engagementDiff: '2%',
      viewsDiff: '1000',
      likesRatioDiff: '1.5%'
    },
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  { upsert: true, new: true }
);

// Setup mock Videos
await Video.findOneAndUpdate(
  { videoId: 'yt-perf', platform: 'youtube' },
  {
    analysisId: testAnalysisId,
    platform: 'youtube',
    videoId: 'yt-perf',
    url: 'https://youtube.com/watch?v=yt-perf',
    title: 'YouTube Perf Video',
    creator: 'YouTube Creator',
    metrics: { views: 1000, likes: 100, comments: 10, duration: 60, engagementRate: 0.11 },
    hasTranscript: true
  },
  { upsert: true, new: true }
);

await Video.findOneAndUpdate(
  { videoId: 'ig-perf', platform: 'instagram' },
  {
    analysisId: testAnalysisId,
    platform: 'instagram',
    videoId: 'ig-perf',
    url: 'https://instagram.com/reel/ig-perf/',
    title: 'Instagram Perf Video',
    creator: 'Instagram Creator',
    metrics: { views: 2000, likes: 200, comments: 20, duration: 30, engagementRate: 0.11 },
    hasTranscript: true
  },
  { upsert: true, new: true }
);

// Setup mock session
const testSessionId = 'test-perf-sess-id';
await ChatHistory.findOneAndUpdate(
  { sessionId: testSessionId },
  {
    sessionId: testSessionId,
    analysisId: testAnalysisId,
    messages: [],
    messageCount: 0
  },
  { upsert: true, new: true }
);

// 3. Launch temporary server
const server = app.listen(testPort, async () => {
  console.log(`📡 Test Server running on port ${testPort}`);
  let exitCode = 0;

  try {
    // --- BENCHMARK 1: METADATA / ANALYSIS RETRIEVAL LATENCY ---
    console.log('\n⏱️ Benchmarking analysis result retrieval latency...');
    const startRet = performance.now();
    const retRes = await fetch(`http://localhost:${testPort}/api/analysis/${testAnalysisId}`);
    const endRet = performance.now();
    const retLatency = endRet - startRet;

    console.log(`  - Retrieval Status: ${retRes.status}`);
    console.log(`  - Retrieval Latency: ${retLatency.toFixed(2)} ms (Limit: < 5000ms)`);
    if (retLatency > 5000) {
      throw new Error(`Retrieval latency exceeded 5s requirement: ${retLatency.toFixed(2)}ms`);
    }
    console.log('  - Benchmark 1: PASS');


    // --- BENCHMARK 2: SSE FIRST-TOKEN STREAMING LATENCY ---
    console.log('\n⏱️ Benchmarking chat SSE first-token streaming latency...');
    const startToken = performance.now();
    const chatRes = await fetch(`http://localhost:${testPort}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Compare pacing',
        analysisId: testAnalysisId,
        sessionId: testSessionId
      })
    });

    if (chatRes.status !== 200) {
      throw new Error(`Chat stream init failed with status: ${chatRes.status}`);
    }

    const reader = chatRes.body.getReader();
    const decoder = new TextDecoder();
    let firstTokenLatency = null;
    let done = false;
    let buffer = '';

    while (!done && firstTokenLatency === null) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunk = decoder.decode(value || new Uint8Array(), { stream: !done });
      buffer += chunk;
      
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim().startsWith('data: ')) {
          const dataStr = line.trim().slice(6);
          try {
            const event = JSON.parse(dataStr);
            if (event.type === 'token') {
              const endToken = performance.now();
              firstTokenLatency = endToken - startToken;
              break;
            }
          } catch (e) {
            // Ignore parse errors on partial streams
          }
        }
      }
    }

    // Cancel reader to stop receiving details and prevent waste
    await reader.cancel();

    if (firstTokenLatency === null) {
      throw new Error('Never received any token chunk in stream.');
    }

    console.log(`  - First-token Latency: ${firstTokenLatency.toFixed(2)} ms (Limit: < 5000ms)`);
    if (firstTokenLatency > 5000) {
      throw new Error(`First-token latency exceeded 5s requirement: ${firstTokenLatency.toFixed(2)}ms`);
    }
    console.log('  - Benchmark 2: PASS');


    // --- BENCHMARK 3: RATE LIMIT CHECK ---
    console.log('\n🚫 Testing IP Rate Limiting triggers on submissions...');
    console.log('  - Sending 11 rapid submissions to POST /api/analyze (Limit: 10/hour per IP)...');
    
    let hitRateLimit = false;
    for (let i = 1; i <= 11; i++) {
      const res = await fetch(`http://localhost:${testPort}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtubeUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
          instagramUrl: 'https://instagram.com/reel/C8Fxg-tN9z8/'
        })
      });

      if (res.status === 429) {
        console.log(`  - Request #${i}: Intercepted with HTTP 429 (Too Many Requests) - SUCCESS`);
        hitRateLimit = true;
        break;
      } else {
        console.log(`  - Request #${i}: Returned HTTP ${res.status}`);
      }
    }

    if (!hitRateLimit) {
      throw new Error('Rate limit (HTTP 429) was not triggered after 11 requests.');
    }
    console.log('  - Benchmark 3: PASS');

  } catch (err) {
    console.error('\n❌ Performance benchmarks failed:', err.message);
    exitCode = 1;
  } finally {
    // 5. Cleanup
    console.log('\n🧹 Cleaning up test database records...');
    await Analysis.deleteOne({ analysisId: testAnalysisId });
    await ChatHistory.deleteOne({ sessionId: testSessionId });
    await Video.deleteMany({ analysisId: testAnalysisId });

    console.log('🧹 Shutting down test server...');
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed.');
    }
    server.close(() => {
      console.log('📡 Test server closed.');
      process.exit(exitCode);
    });
  }
});
