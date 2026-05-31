import { env } from '../config/env.js';
import logger from '../utils/logger.js';
import { calculateEngagementRate } from '../utils/engagementCalc.js';

/**
 * Parses ISO 8601 duration format (e.g. PT1H2M10S, PT45S) into total seconds.
 * @param {string} durationString 
 * @returns {number} duration in seconds
 */
const parseISO8601Duration = (durationString) => {
  const regex = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
  const matches = durationString.match(regex);
  if (!matches) return 0;
  const hours = parseInt(matches[1] || 0, 10);
  const minutes = parseInt(matches[2] || 0, 10);
  const seconds = parseInt(matches[3] || 0, 10);
  return hours * 3600 + minutes * 60 + seconds;
};

/**
 * Get YouTube metadata for a given video ID
 * @param {string} videoId 
 * @returns {Promise<object>} normalized video metadata
 */
export const getYouTubeMetadata = async (videoId) => {
  logger.info(`Fetching YouTube metadata for ID: ${videoId}`);

  // Check if we are running with mock YouTube keys
  if (env.YOUTUBE_API_KEY.startsWith('AIzaMock')) {
    logger.warn(`Mock YouTube API key detected. Returning mock metadata for video: ${videoId}`);
    const views = 1200000;
    const likes = 45000;
    const comments = 2100;
    return {
      videoId,
      platform: 'youtube',
      url: `https://youtube.com/watch?v=${videoId}`,
      title: 'Why Your Videos Aren\'t Growing (Mock YouTube Video)',
      description: 'In this video we analyze hook structures, CTR optimizations, and retention hacks.',
      creator: 'Content Guru',
      channelId: 'UCmockChannelId123',
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      publishedAt: new Date('2024-11-15T10:30:00Z'),
      metrics: {
        views,
        likes,
        comments,
        shares: 800,
        duration: 847, // 14 mins 7 secs
        engagementRate: calculateEngagementRate(likes, comments, views)
      },
      language: 'en',
      hasTranscript: true
    };
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${env.YOUTUBE_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`YouTube API returned status code: ${res.status}`);
    }

    const data = await res.json();
    if (!data.items || data.items.length === 0) {
      throw new Error(`No YouTube video found for ID: ${videoId}`);
    }

    const item = data.items[0];
    const snippet = item.snippet;
    const stats = item.statistics;
    const contentDetails = item.contentDetails;

    const views = parseInt(stats.viewCount || 0, 10);
    const likes = parseInt(stats.likeCount || 0, 10);
    const comments = parseInt(stats.commentCount || 0, 10);
    const duration = parseISO8601Duration(contentDetails.duration);
    
    // Choose best thumbnail quality
    const thumbnail = snippet.thumbnails.maxres?.url || 
                      snippet.thumbnails.high?.url || 
                      snippet.thumbnails.default?.url || '';

    return {
      videoId,
      platform: 'youtube',
      url: `https://youtube.com/watch?v=${videoId}`,
      title: snippet.title,
      description: snippet.description || '',
      creator: snippet.channelTitle,
      channelId: snippet.channelId,
      thumbnail,
      publishedAt: new Date(snippet.publishedAt),
      metrics: {
        views,
        likes,
        comments,
        shares: 0, // YouTube Data API v3 does not expose shares publicly
        duration,
        engagementRate: calculateEngagementRate(likes, comments, views)
      },
      language: snippet.defaultLanguage || snippet.defaultAudioLanguage || 'en',
      hasTranscript: true // Assumed true until transcript scraper runs
    };
  } catch (error) {
    logger.error(`Error in getYouTubeMetadata for ID ${videoId}: ${error.message}`);
    throw error;
  }
};

/**
 * Get Instagram metadata for a given shortcode
 * @param {string} shortcode 
 * @returns {Promise<object>} normalized video metadata
 */
export const getInstagramMetadata = async (shortcode) => {
  logger.info(`Fetching Instagram metadata for shortcode: ${shortcode}`);

  // Checks if we have an active IG token
  if (!env.INSTAGRAM_ACCESS_TOKEN || env.INSTAGRAM_ACCESS_TOKEN.startsWith('mock')) {
    logger.warn(`Mock Instagram token detected. Returning mock metadata for reel: ${shortcode}`);
    const plays = 340000;
    const likes = 18000;
    const comments = 890;
    return {
      videoId: shortcode,
      platform: 'instagram',
      url: `https://instagram.com/reel/${shortcode}`,
      title: 'POV: You followed these 3 steps to double your social growth #growthhacks',
      description: 'POV: You followed these 3 steps to double your social growth #growthhacks #contentcreator #reels',
      creator: 'social_creator_ninja',
      channelId: 'social_creator_ninja', // Instagram usernames act as channelId
      thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500',
      publishedAt: new Date('2024-11-10T15:30:00Z'),
      metrics: {
        views: plays, // views map to plays for Instagram
        likes,
        comments,
        shares: 1200,
        duration: 30, // 30 seconds
        engagementRate: calculateEngagementRate(likes, comments, plays)
      },
      language: 'en',
      hasTranscript: true
    };
  }

  try {
    // Instagram Graph API endpoint implementation
    const url = `https://graph.facebook.com/v19.0/${shortcode}?fields=caption,media_url,like_count,comments_count,username,timestamp,duration&access_token=${env.INSTAGRAM_ACCESS_TOKEN}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Instagram API returned status: ${res.status}`);
    }

    const data = await res.json();
    const likes = parseInt(data.like_count || 0, 10);
    const comments = parseInt(data.comments_count || 0, 10);
    const duration = parseFloat(data.duration || 0);
    const plays = 0; // Graph API may require premium business insight keys for plays

    return {
      videoId: shortcode,
      platform: 'instagram',
      url: `https://instagram.com/reel/${shortcode}`,
      title: data.caption ? data.caption.split('\n')[0] : 'Instagram Reel',
      description: data.caption || '',
      creator: data.username || 'instagram_user',
      channelId: data.username || 'instagram_user',
      thumbnail: data.media_url || '',
      publishedAt: new Date(data.timestamp),
      metrics: {
        views: plays,
        likes,
        comments,
        shares: 0,
        duration,
        engagementRate: calculateEngagementRate(likes, comments, plays)
      },
      language: 'en',
      hasTranscript: false // Transcript defaults to false unless Whisper runs
    };
  } catch (error) {
    logger.error(`Error in getInstagramMetadata for shortcode ${shortcode}: ${error.message}`);
    throw error;
  }
};
