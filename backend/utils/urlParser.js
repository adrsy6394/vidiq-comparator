/**
 * Regular expressions for video URLs
 */
const YOUTUBE_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/;
const INSTAGRAM_REGEX = /instagram\.com\/(?:p|reel|reels)\/([a-zA-Z0-9_-]+)/;

/**
 * Extract YouTube 11-character video ID from URL
 * @param {string} url - YouTube URL
 * @returns {string} YouTube video ID
 * @throws {Error} If URL format is invalid
 */
export const parseYouTubeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    throw new Error('YouTube URL is required and must be a string');
  }
  
  const match = url.match(YOUTUBE_REGEX);
  if (!match || !match[1]) {
    throw new Error('Invalid YouTube URL format');
  }
  
  return match[1];
};

/**
 * Extract Instagram shortcode from Reel or Post URL
 * @param {string} url - Instagram URL
 * @returns {string} Instagram shortcode
 * @throws {Error} If URL format is invalid
 */
export const parseInstagramUrl = (url) => {
  if (!url || typeof url !== 'string') {
    throw new Error('Instagram URL is required and must be a string');
  }
  
  const match = url.match(INSTAGRAM_REGEX);
  if (!match || !match[1]) {
    throw new Error('Invalid Instagram URL format');
  }
  
  return match[1];
};

/**
 * Validate both YouTube and Instagram URLs
 * @param {string} youtubeUrl 
 * @param {string} instagramUrl 
 * @returns {{ youtubeId: string, instagramId: string }}
 */
export const validateUrls = (youtubeUrl, instagramUrl) => {
  const errors = {};
  let youtubeId, instagramId;

  try {
    youtubeId = parseYouTubeUrl(youtubeUrl);
  } catch (err) {
    errors.youtubeUrl = err.message;
  }

  try {
    instagramId = parseInstagramUrl(instagramUrl);
  } catch (err) {
    errors.instagramUrl = err.message;
  }

  if (Object.keys(errors).length > 0) {
    const error = new Error('URL Validation Failed');
    error.validationErrors = errors;
    throw error;
  }

  return { youtubeId, instagramId };
};
