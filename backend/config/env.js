import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Map OPENROUT_API_KEY to OPENROUTER_API_KEY if that was specified in the .env
if (process.env.OPENROUT_API_KEY && !process.env.OPENROUTER_API_KEY) {
  process.env.OPENROUTER_API_KEY = process.env.OPENROUT_API_KEY;
}

const envSchema = z.object({
  PORT: z.string().transform((val) => parseInt(val, 10)).default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  OPENROUTER_API_KEY: z.string().min(1, 'OPENROUTER_API_KEY is required').refine(val => val !== 'your_openrouter_api_key_here', {
    message: 'Please replace the placeholder with a valid OpenRouter API Key'
  }),
  YOUTUBE_API_KEY: z.string().min(1, 'YOUTUBE_API_KEY is required').refine(val => val !== 'your_youtube_api_key_here', {
    message: 'Please replace the placeholder with a valid YouTube API Key'
  }),
  INSTAGRAM_ACCESS_TOKEN: z.string().optional(),
  MONGODB_URI: z.string().url('Invalid MONGODB_URI format'),
  QDRANT_URL: z.string().url('Invalid QDRANT_URL format'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Environment validation failed:\n');
  parsed.error.errors.forEach(err => {
    console.error(`- ${err.path.join('.')}: ${err.message}`);
  });
  console.error('\nExiting application...\n');
  process.exit(1);
}

export const env = parsed.data;
