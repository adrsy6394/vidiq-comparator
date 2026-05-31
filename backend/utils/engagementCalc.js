/**
 * Calculate engagement rate for a video
 * Formula: ((Likes + Comments) / Views) * 100
 * 
 * @param {number} likes 
 * @param {number} comments 
 * @param {number} views - Views (YouTube) or Plays (Instagram)
 * @returns {number} Engagement rate rounded to 2 decimal places
 */
export const calculateEngagementRate = (likes = 0, comments = 0, views = 0) => {
  const safeLikes = Number(likes) || 0;
  const safeComments = Number(comments) || 0;
  const safeViews = Number(views) || 0;

  if (safeViews <= 0) {
    return 0;
  }

  const rate = ((safeLikes + safeComments) / safeViews) * 100;
  return Math.round((rate + Number.EPSILON) * 100) / 100; // Round safely to 2 decimal places
};

/**
 * Compare two engagement rates and return the difference details
 * @param {number} rateA 
 * @param {number} rateB 
 * @param {string} platformA 
 * @param {string} platformB 
 * @returns {{ winner: string, diff: string }}
 */
export const compareEngagementRates = (rateA = 0, rateB = 0, platformA = 'youtube', platformB = 'instagram') => {
  const diff = Math.abs(rateA - rateB).toFixed(2);
  let winner = 'tie';
  
  if (rateA > rateB) {
    winner = platformA;
  } else if (rateB > rateA) {
    winner = platformB;
  }

  return {
    winner,
    diff: `${rateA > rateB ? '+' : '-'}${diff}%`
  };
};
