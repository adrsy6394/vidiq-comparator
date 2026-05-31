import app from './app.js';
import { connectDB } from './config/db.js';
import mongoose from 'mongoose';
import Analysis from './models/Analysis.js';
import ChatHistory from './models/ChatHistory.js';

console.log('🧪 Starting RAG Chat SSE Endpoints Verification Tests...\n');

// 1. Establish Database Connection
await connectDB();

const testPort = 3003;
const testAnalysisId = 'test-analysis-uuid-111';

// 2. Setup mock ready analysis document in MongoDB Atlas
await Analysis.findOneAndUpdate(
  { analysisId: testAnalysisId },
  {
    analysisId: testAnalysisId,
    videoA: { videoId: 'yt-111', platform: 'youtube' },
    videoB: { videoId: 'ig-111', platform: 'instagram' },
    status: 'ready',
    comparisonSummary: 'YouTube Video A was outperformed by Instagram Video B due to faster pacing.',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  { upsert: true, new: true }
);

// 3. Start temporary server listener
const server = app.listen(testPort, async () => {
  console.log(`📡 Local Chat Test Server running on port ${testPort}`);
  
  try {
    // 4. Test POST /api/session (Create session)
    console.log('\n💬 Test 1: Initializing chat session via POST /api/session...');
    const sessionRes = await fetch(`http://localhost:${testPort}/api/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysisId: testAnalysisId })
    });
    
    const sessionJson = await sessionRes.json();
    console.log(`  - Response status: ${sessionRes.status} (Expected: 201)`);
    console.log(`  - Session ID: ${sessionJson.sessionId}`);
    const sessionId = sessionJson.sessionId;
    
    if (sessionRes.status !== 201 || !sessionId) {
      throw new Error('Chat session creation failed.');
    }
    console.log('  - Test 1: PASS');

    // 5. Test GET /api/session/:sessionId (Retrieve empty session history)
    console.log('\n📜 Test 2: Polling empty history via GET /api/session/:sessionId...');
    const historyRes = await fetch(`http://localhost:${testPort}/api/session/${sessionId}`);
    const historyJson = await historyRes.json();
    console.log(`  - Messages count: ${historyJson.messages.length} (Expected: 0)`);
    if (historyJson.messages.length !== 0) {
      throw new Error('History should be empty initially.');
    }
    console.log('  - Test 2: PASS');

    // 6. Test POST /api/chat (SSE Stream connection and reading)
    console.log('\n⚡ Test 3: Starting SSE streaming chat via POST /api/chat...');
    const chatRes = await fetch(`http://localhost:${testPort}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Why did the Instagram video perform better?',
        analysisId: testAnalysisId,
        sessionId
      })
    });

    console.log(`  - Response status: ${chatRes.status} (Expected: 200)`);
    console.log(`  - Response Content-Type: ${chatRes.headers.get('content-type')} (Expected: text/event-stream)`);
    
    if (chatRes.status !== 200) {
      throw new Error('Chat stream endpoint returned non-200 status.');
    }

    console.log('  - Streaming tokens response text:');
    process.stdout.write('    [AI]: ');

    const reader = chatRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let done = false;
    let doneReceived = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunk = decoder.decode(value || new Uint8Array(), { stream: !done });
      buffer += chunk;
      
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Hold unfinished line in buffer
      
      for (const line of lines) {
        if (line.trim().startsWith('data: ')) {
          const dataStr = line.trim().slice(6);
          try {
            const parsedEvent = JSON.parse(dataStr);
            if (parsedEvent.type === 'token') {
              process.stdout.write(parsedEvent.content);
            } else if (parsedEvent.type === 'done') {
              doneReceived = true;
              console.log('\n\n  - Stream complete event details:');
              console.log(`    - Sources returned: ${parsedEvent.sources.length}`);
            } else if (parsedEvent.type === 'error') {
              console.error('\n  - Stream error frame:', parsedEvent.error);
            }
          } catch (err) {
            // Ignore parse errors on partial streams
          }
        }
      }
    }

    if (!doneReceived) {
      throw new Error('Done event was never received in SSE stream.');
    }
    console.log('  - Test 3: PASS');

    // 7. Test GET /api/session/:sessionId (Retrieve updated chat history)
    console.log('\n📜 Test 4: Verifying saved history via GET /api/session/:sessionId...');
    const historyUpdatedRes = await fetch(`http://localhost:${testPort}/api/session/${sessionId}`);
    const historyUpdatedJson = await historyUpdatedRes.json();
    console.log(`  - Messages count: ${historyUpdatedJson.messages.length} (Expected: 2)`);
    if (historyUpdatedJson.messages.length !== 2) {
      throw new Error('History should contain exactly 2 messages (user + assistant).');
    }
    console.log(`  - First message role: ${historyUpdatedJson.messages[0].role} (Expected: user)`);
    console.log(`  - Second message role: ${historyUpdatedJson.messages[1].role} (Expected: assistant)`);
    console.log(`  - Assistant sources count: ${historyUpdatedJson.messages[1].sources.length}`);
    console.log('  - Test 4: PASS');

    // 8. Clean up mock database records
    console.log('\n🧹 Cleaning up test database records...');
    await Analysis.deleteOne({ analysisId: testAnalysisId });
    await ChatHistory.deleteOne({ sessionId });
    console.log('  - Database cleanup complete.');

  } catch (err) {
    console.error('\n❌ Integration check failed:', err.message);
    process.exitCode = 1;
  } finally {
    console.log('\n🧹 Shutting down test server...');
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed.');
    }
    server.close(() => {
      console.log('📡 Test server closed.');
      process.exit(process.exitCode || 0);
    });
  }
});
