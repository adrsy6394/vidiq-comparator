import { chunkTranscript, generateEmbeddings } from './services/embeddingService.js';
import { qdrantClient } from './vector/qdrantClient.js';
import { createCollectionIfNotExists, deleteCollection } from './vector/collectionManager.js';

console.log('🧪 Starting Vector & Embedding Services Integration Tests...\n');

// Dummy segments to chunk
const dummySegments = [
  { text: "This is segment 1 of the video.", start: 0, duration: 2 },
  { text: "This is segment 2 of the video. It has more words.", start: 2.5, duration: 3.5 },
  { text: "This is segment 3. We are talking about RAG search strategies.", start: 6, duration: 4 },
  { text: "This is segment 4. It should be combined in the same chunk.", start: 10, duration: 5 }
];

// 1. Test Chunking
console.log('📦 Testing Transcript Chunker...');
const chunks = chunkTranscript(dummySegments, 50); // Set small character limit to force multiple chunks
console.log(`✅ Chunking complete: Generated ${chunks.length} chunks.`);
chunks.forEach((chunk, i) => {
  console.log(`  - Chunk ${i}: "${chunk.text}" [${chunk.startTime}s - ${chunk.endTime}s]`);
});

// 2. Test Embeddings (Mock)
console.log('\n🧠 Testing Embedding Generator...');
try {
  const texts = chunks.map(c => c.text);
  const embeddings = await generateEmbeddings(texts);
  console.log(`✅ Embedding Complete: Generated ${embeddings.length} vectors.`);
  console.log(`  - Vector dimension: ${embeddings[0].length} (Expected: 1536)`);
  console.log(`  - Sample coordinates of first vector: [${embeddings[0].slice(0, 5).join(', ')}, ...]`);
} catch (err) {
  console.error('❌ Embedding failed:', err.message);
}

// 3. Test Qdrant Database Lifecycle
console.log('\n🔌 Testing Qdrant DB Connection...');
const testCollection = 'test_collection_uuid_123';
try {
  const list = await qdrantClient.getCollections();
  console.log('✅ Qdrant Connected! Collections currently in DB:', list.collections.length);

  console.log('✍️ Testing Collection creation and deletion lifecycle...');
  await createCollectionIfNotExists(testCollection);
  await deleteCollection(testCollection);
  console.log('✅ Qdrant CRUD checks: PASS');

} catch (err) {
  console.log(`⚠️ Qdrant Local Service is not active/connected: "${err.message}".`);
  console.log('👉 Bypassing database checks. (You can connect to Qdrant Cloud or start Docker Compose locally later)');
}

console.log('\n🏁 Vector services test script completed.');
