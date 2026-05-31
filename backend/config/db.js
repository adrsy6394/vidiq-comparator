import mongoose from 'mongoose';
import { env } from './env.js';
import logger from '../utils/logger.js';
import Video from '../models/Video.js';
import Analysis from '../models/Analysis.js';
import { pathToFileURL } from 'url';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Check if run directly (Integration testing script)
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const runTest = async () => {
    console.log('🔌 Connecting to MongoDB for integration test...');
    let conn;
    try {
      conn = await connectDB();
      
      const testAnalysisId = 'test-analysis-uuid-1234';
      
      console.log('🧹 Cleaning up old test data...');
      await Analysis.deleteOne({ analysisId: testAnalysisId });
      await Video.deleteMany({ analysisId: testAnalysisId });

      console.log('✍️ Writing dummy Analysis record...');
      const testAnalysis = await Analysis.create({
        analysisId: testAnalysisId,
        videoA: { videoId: 'dQw4w9WgXcQ', platform: 'youtube' },
        videoB: { videoId: 'B7HrMRxFl2U', platform: 'instagram' },
        comparisonSummary: 'Test comparison description text',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day TTL
      });
      console.log('✅ Analysis write successful:', testAnalysis._id);

      console.log('✍️ Writing dummy Video record...');
      const testVideo = await Video.create({
        analysisId: testAnalysisId,
        platform: 'youtube',
        videoId: 'dQw4w9WgXcQ',
        url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Test YouTube Title',
        creator: 'Test Creator',
        metrics: { views: 100, likes: 10, comments: 2, shares: 1, duration: 120, engagementRate: 12 }
      });
      console.log('✅ Video write successful:', testVideo._id);

      console.log('📖 Reading records back...');
      const readAnalysis = await Analysis.findOne({ analysisId: testAnalysisId });
      const readVideo = await Video.findOne({ analysisId: testAnalysisId, platform: 'youtube' });
      
      console.log('🔍 Verified Analysis:', readAnalysis.videoA.videoId === 'dQw4w9WgXcQ' ? 'PASS' : 'FAIL');
      console.log('🔍 Verified Video:', readVideo.title === 'Test YouTube Title' ? 'PASS' : 'FAIL');

      console.log('🧹 Cleaning up test data...');
      await Analysis.deleteOne({ analysisId: testAnalysisId });
      await Video.deleteMany({ analysisId: testAnalysisId });
      console.log('✅ Cleanup successful.');

    } catch (err) {
      console.error('❌ Test failed with error:', err.message);
    } finally {
      if (conn) {
        await mongoose.connection.close();
        console.log('🔌 Connection closed.');
      }
    }
  };

  runTest();
}
