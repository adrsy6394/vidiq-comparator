import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  sources: [{
    videoLabel: { type: String, required: true },
    platform: { type: String, enum: ['youtube', 'instagram'], required: true },
    timestamp: { type: String, required: true }, // Format: "MM:SS"
    excerpt: { type: String, required: true },
    chunkIndex: { type: Number, required: true }
  }],
  timestamp: {
    type: Date,
    default: Date.now
  },
  tokensUsed: {
    type: Number
  }
});

const chatHistorySchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  analysisId: {
    type: String,
    required: true,
    index: true
  },
  messages: [messageSchema],
  messageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
export default ChatHistory;
