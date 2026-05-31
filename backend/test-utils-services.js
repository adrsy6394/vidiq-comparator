import { getYouTubeMetadata, getInstagramMetadata } from './services/videoService.js';
import { getYouTubeTranscript, getInstagramTranscript, cleanTranscript } from './services/transcriptService.js';

const runTests = async () => {
  console.log('🧪 Starting Video and Transcript Services Integration Tests...\n');

  const testYtId = 'dQw4w9WgXcQ'; // Rick Astley
  const testIgShortcode = 'B7HrMRxFl2U';

  // 1. Test YouTube Metadata
  console.log('📹 Fetching YouTube Metadata...');
  try {
    const ytMeta = await getYouTubeMetadata(testYtId);
    console.log('✅ YouTube Metadata Result:');
    console.log(`  - Title: "${ytMeta.title}"`);
    console.log(`  - Creator: "${ytMeta.creator}"`);
    console.log(`  - Views: ${ytMeta.metrics.views}`);
    console.log(`  - Duration: ${ytMeta.metrics.duration}s`);
    console.log(`  - Engagement Rate: ${ytMeta.metrics.engagementRate}%`);
  } catch (err) {
    console.error('❌ YouTube Metadata failed:', err.message);
  }

  // 2. Test YouTube Transcript
  console.log('\n🎙️ Fetching Real YouTube Transcript (Network Call)...');
  try {
    const ytTranscript = await getYouTubeTranscript(testYtId);
    console.log(`✅ YouTube Transcript Result: Received ${ytTranscript.length} segments.`);
    if (ytTranscript.length > 0) {
      console.log('  - First segment:', ytTranscript[0]);
      const fullText = cleanTranscript(ytTranscript);
      console.log(`  - Combined Word Count: ${fullText.split(' ').length}`);
    } else {
      console.log('  - No transcript segments returned.');
    }
  } catch (err) {
    console.error('❌ YouTube Transcript failed:', err.message);
  }

  // 3. Test Instagram Metadata Fallback
  console.log('\n📸 Fetching Instagram Metadata (Mock Fallback)...');
  try {
    const igMeta = await getInstagramMetadata(testIgShortcode);
    console.log('✅ Instagram Metadata Result:');
    console.log(`  - Caption excerpt: "${igMeta.title}"`);
    console.log(`  - Creator: "${igMeta.creator}"`);
    console.log(`  - Plays/Views: ${igMeta.metrics.views}`);
    console.log(`  - Engagement Rate: ${igMeta.metrics.engagementRate}%`);
  } catch (err) {
    console.error('❌ Instagram Metadata failed:', err.message);
  }

  // 4. Test Instagram Transcript Fallback
  console.log('\n🎙️ Fetching Instagram Transcript (Mock Fallback)...');
  try {
    const igTranscript = await getInstagramTranscript(testIgShortcode);
    console.log(`✅ Instagram Transcript Result: Received ${igTranscript.length} segments.`);
    if (igTranscript.length > 0) {
      console.log('  - First segment:', igTranscript[0]);
    }
  } catch (err) {
    console.error('❌ Instagram Transcript failed:', err.message);
  }

  console.log('\n🏁 Services test script completed.');
};

runTests();
