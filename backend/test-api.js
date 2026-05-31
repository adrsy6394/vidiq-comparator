import app from './app.js';
import { connectDB } from './config/db.js';
import mongoose from 'mongoose';

console.log('🧪 Starting REST API Endpoints Verification Tests...\n');

// Connect to MongoDB Atlas
await connectDB();

const testPort = 3002;

// Listen on temporary test port 3002
const server = app.listen(testPort, async () => {
  console.log(`📡 Local Test Server running on port ${testPort}`);
  
  try {
    // 1. Test POST /api/analyze with invalid URLs (Zod validation check)
    console.log('\n❌ Test 1: Sending invalid URLs to POST /api/analyze...');
    const res1 = await fetch(`http://localhost:${testPort}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ youtubeUrl: 'invalid-url', instagramUrl: 'invalid-url' })
    });
    
    const json1 = await res1.json();
    console.log(`  - Response status: ${res1.status} (Expected: 400)`);
    console.log(`  - Response fields code: ${json1.code} (Expected: VALIDATION_ERROR)`);
    console.log(`  - Validation errors parsed:`, json1.fields);
    console.log(`  - Intercept check: ${res1.status === 400 && json1.code === 'VALIDATION_ERROR' ? 'PASS' : 'FAIL'}`);

    // 2. Test GET /api/analysis/:analysisId with non-existent ID
    console.log('\n🔍 Test 2: Sending request for non-existent analysisId to GET /api/analysis/:id...');
    const fakeAnalysisId = 'fake-analysis-uuid-999';
    const res2 = await fetch(`http://localhost:${testPort}/api/analysis/${fakeAnalysisId}`);
    const json2 = await res2.json();
    console.log(`  - Response status: ${res2.status} (Expected: 404)`);
    console.log(`  - Response code: ${json2.code} (Expected: NOT_FOUND)`);
    console.log(`  - Intercept check: ${res2.status === 404 && json2.code === 'NOT_FOUND' ? 'PASS' : 'FAIL'}`);

  } catch (err) {
    console.error('❌ Integration check failed:', err.message);
  } finally {
    console.log('\n🧹 Shutting down test server...');
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed.');
    }
    server.close(() => {
      console.log('📡 Test server closed.');
      process.exit(0);
    });
  }
});
