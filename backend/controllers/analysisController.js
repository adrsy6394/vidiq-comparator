import Analysis from '../models/Analysis.js';
import Video from '../models/Video.js';
import { NotFoundError, AppError } from '../utils/errors.js';

/**
 * Extracts bulleted key factors from the AI markdown summary
 * @param {string} summaryText 
 * @returns {string[]} list of key comparison factors
 */
const parseKeyFactors = (summaryText) => {
  if (!summaryText) return [];
  const lines = summaryText.split('\n');
  const factors = [];
  
  lines.forEach(line => {
    const trimmed = line.trim();
    // Matches "- Factor Text" or "* Factor Text"
    if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
      const cleaned = trimmed.replace(/^[-*]\s+/, '').replace(/\*\*/g, '').trim();
      if (cleaned) factors.push(cleaned);
    } else {
      // Matches "1. Factor Text"
      const match = trimmed.match(/^\d+\.\s+(.+)$/);
      if (match) {
        const cleaned = match[1].replace(/\*\*/g, '').trim();
        if (cleaned) factors.push(cleaned);
      }
    }
  });

  // Fallback defaults if no lists parsed
  if (factors.length === 0) {
    return [
      'Hook strategy effectiveness',
      'Content density and duration alignment',
      'Call to Action (CTA) positioning'
    ];
  }

  return factors.slice(0, 5); // Return top 5 factors
};

/**
 * Retrieve full video metrics and comparison analysis data
 * GET /api/analysis/:analysisId
 */
export const getAnalysisResult = async (req, res, next) => {
  try {
    const { analysisId } = req.params;

    // 1. Fetch analysis details from database
    const analysis = await Analysis.findOne({ analysisId });
    if (!analysis) {
      throw new NotFoundError(`No analysis record found for ID: ${analysisId}`);
    }

    // 2. Reject request if the job is not ready
    if (analysis.status !== 'ready') {
      return res.status(400).json({
        success: false,
        error: 'Analysis is still processing. Please poll status.',
        code: 'NOT_READY'
      });
    }

    // 3. Retrieve normalized metadata for both videos
    const videos = await Video.find({ analysisId });
    const youtubeVideo = videos.find(v => v.platform === 'youtube');
    const instagramVideo = videos.find(v => v.platform === 'instagram');

    if (!youtubeVideo || !instagramVideo) {
      throw new NotFoundError(`Normalized video metadata records missing for analysis: ${analysisId}`);
    }

    // 4. Formulate response payload envelope matching API contracts
    return res.status(200).json({
      success: true,
      analysisId,
      videos: {
        youtube: {
          videoId: youtubeVideo.videoId,
          title: youtubeVideo.title,
          creator: youtubeVideo.creator,
          thumbnail: youtubeVideo.thumbnail,
          metrics: {
            views: youtubeVideo.metrics.views,
            likes: youtubeVideo.metrics.likes,
            comments: youtubeVideo.metrics.comments,
            duration: youtubeVideo.metrics.duration,
            engagementRate: youtubeVideo.metrics.engagementRate
          },
          publishedAt: youtubeVideo.publishedAt ? youtubeVideo.publishedAt.toISOString().split('T')[0] : '',
          hasTranscript: youtubeVideo.hasTranscript
        },
        instagram: {
          videoId: instagramVideo.videoId,
          creator: instagramVideo.creator,
          caption: instagramVideo.description,
          thumbnail: instagramVideo.thumbnail,
          metrics: {
            plays: instagramVideo.metrics.views, // Views mapped to plays for Instagram
            likes: instagramVideo.metrics.likes,
            comments: instagramVideo.metrics.comments,
            duration: instagramVideo.metrics.duration,
            engagementRate: instagramVideo.metrics.engagementRate
          },
          publishedAt: instagramVideo.publishedAt ? instagramVideo.publishedAt.toISOString().split('T')[0] : '',
          hasTranscript: instagramVideo.hasTranscript
        }
      },
      comparison: {
        winner: analysis.metrics.winner,
        summary: analysis.comparisonSummary,
        keyFactors: parseKeyFactors(analysis.comparisonSummary)
      }
    });

  } catch (error) {
    next(error);
  }
};
