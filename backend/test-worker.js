import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { analysisQueue } from './jobs/queue.js';
import { processAnalysisJob } from './jobs/analysisJob.js';
import Analysis from './models/Analysis.js';
import Video from './models/Video.js';
import { randomUUID } from 'crypto';

const runWorkerTest = async () => {
  console.log('🧪 Starting Async Analysis Pipeline Worker Integration Test...\n');

  let conn;
  try {
    // 1. Connect to MongoDB Atlas
    conn = await connectDB();

    const testAnalysisId = randomUUID();
    const testYoutubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const testInstagramUrl = 'https://www.instagram.com/reel/B7HrMRxFl2U/';

    // 2. Create Analysis record in Mongoose
    console.log('✍️ Creating MongoDB Analysis document...');
    await Analysis.create({
      analysisId: testAnalysisId,
      videoA: { videoId: 'dQw4w9WgXcQ', platform: 'youtube' },
      videoB: { videoId: 'B7HrMRxFl2U', platform: 'instagram' },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
    });
    console.log('✅ Analysis document created successfully.');

    // 3. Register Bull processor
    console.log('\n⚙️ Initializing Bull Queue processor...');
    analysisQueue.process(processAnalysisJob);

    // 4. Enqueue Job
    console.log('📦 Enqueuing video analysis job...');
    const job = await analysisQueue.add({
      analysisId: testAnalysisId,
      youtubeUrl: testYoutubeUrl,
      instagramUrl: testInstagramUrl
    });
    console.log(`✅ Job enqueued successfully. JobID: ${job.id}`);

    // 5. Poll database progress
    console.log('\n⏳ Polling database record progress steps...');
    const maxPollAttempts = 15;
    let pollCount = 0;
    
    const interval = setInterval(async () => {
      pollCount++;
      try {
        const doc = await Analysis.findOne({ analysisId: testAnalysisId });
        console.log(`  [Poll #${pollCount}] Status: ${doc.status} | Steps: Metadata: ${doc.processingSteps.metadata}, Transcript: ${doc.processingSteps.transcript}, Embedding: ${doc.processingSteps.embedding}, Analysis: ${doc.processingSteps.analysis}`);

        if (doc.status === 'ready' || doc.status === 'failed' || pollCount >= maxPollAttempts) {
          clearInterval(interval);
          
          if (doc.status === 'ready') {
            console.log('\n🎉 Pipeline success! Verified outcomes:');
            console.log(`  - Winner: ${doc.metrics.winner}`);
            console.log(`  - Engagement difference: ${doc.metrics.engagementDiff}`);
            console.log(`  - Comparative Summary:\n${doc.comparisonSummary}`);

            // Fetch stored videos
            const videos = await Video.find({ analysisId: testAnalysisId });
            console.log(`  - Videos written in DB: ${videos.length} (Expected: 2)`);
          } else if (doc.status === 'failed') {
            console.error('\n❌ Pipeline job execution failed.');
          } else {
            console.log('\n⏳ Polling timed out before job completion.');
          }

          // Clean up database test data
          console.log('\n🧹 Cleaning up test database records...');
          await Analysis.deleteOne({ analysisId: testAnalysisId });
          await Video.deleteMany({ analysisId: testAnalysisId });
          console.log('✅ DB Cleanup complete.');

          // Close connections
          await analysisQueue.close();
          await mongoose.connection.close();
          console.log('🔌 Connections closed. Test finished.');
        }
      } catch (err) {
        clearInterval(interval);
        console.error('Error during polling:', err.message);
        await analysisQueue.close();
        await mongoose.connection.close();
      }
    }, 2000);

  } catch (error) {
    console.log(`\n⚠️ Redis connection failed: "${error.message}".`);
    console.log('👉 Since local Redis container is not running, Bull Queue cannot connect.');
    console.log('👉 To resolve this, you can setup a free serverless Redis DB on Upstash (https://upstash.com) and paste the URL in backend/.env:');
    console.log('   Example: REDIS_URL=redis://default:password@host:port\n');
    
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
};

runWorkerTest();
