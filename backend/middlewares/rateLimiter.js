import rateLimit from 'express-rate-limit';

// Restrict to 10 submissions per hour per IP address
export const analyzeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10,
  message: {
    success: false,
    error: 'Rate limit exceeded. You can only run 10 analysis tasks per hour.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default analyzeLimiter;
