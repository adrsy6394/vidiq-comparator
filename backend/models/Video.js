import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  analysisId: {
    type: String,
    required: true,
    index: true
  },
  platform: {
    type: String,
    enum: ['youtube', 'instagram'],
    required: true
  },
  videoId: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  creator: {
    type: String,
    required: true
  },
  channelId: {
    type: String,
    default: ''
  },
  thumbnail: {
    type: String,
    default: ''
  },
  metrics: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    duration: { type: Number, default: 0 }, // In seconds
    engagementRate: { type: Number, default: 0 }
  },
  publishedAt: {
    type: Date
  },
  language: {
    type: String,
    default: 'en'
  },
  hasTranscript: {
    type: Boolean,
    default: false
  },
  transcriptRaw: {
    type: String, // Stringified JSON array of transcript segments
    default: '[]'
  },
  transcriptClean: {
    type: String,
    default: ''
  },
  wordCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound unique index to prevent duplicate storage
videoSchema.index({ videoId: 1, platform: 1 }, { unique: true });

const Video = mongoose.model('Video', videoSchema);
export default Video;
