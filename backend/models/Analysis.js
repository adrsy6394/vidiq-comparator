import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
  analysisId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  videoA: {
    videoId: { type: String, required: true },
    platform: { type: String, required: true, enum: ['youtube', 'instagram'] }
  },
  videoB: {
    videoId: { type: String, required: true },
    platform: { type: String, required: true, enum: ['youtube', 'instagram'] }
  },
  comparisonSummary: {
    type: String,
    default: ''
  },
  metrics: {
    winner: { type: String, enum: ['youtube', 'instagram', 'tie', 'none'], default: 'none' },
    engagementDiff: { type: String, default: '0%' },
    viewsDiff: { type: String, default: '0' },
    likesRatioDiff: { type: String, default: '0%' }
  },
  qdrantCollection: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['ready', 'processing', 'failed'],
    default: 'processing'
  },
  processingSteps: {
    metadata: { type: String, enum: ['pending', 'processing', 'done', 'failed'], default: 'pending' },
    transcript: { type: String, enum: ['pending', 'processing', 'done', 'failed'], default: 'pending' },
    embedding: { type: String, enum: ['pending', 'processing', 'done', 'failed'], default: 'pending' },
    analysis: { type: String, enum: ['pending', 'processing', 'done', 'failed'], default: 'pending' }
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // Document automatically expires at the exact date stored in expiresAt
  }
}, {
  timestamps: true
});

const Analysis = mongoose.model('Analysis', analysisSchema);
export default Analysis;
