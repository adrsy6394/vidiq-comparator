import { parseYouTubeUrl, parseInstagramUrl } from './utils/urlParser.js';
import { calculateEngagementRate, compareEngagementRates } from './utils/engagementCalc.js';

console.log('🧪 Running Utilities Validation Tests...\n');

// 1. Test YouTube URL parser
const ytUrls = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtu.be/dQw4w9WgXcQ',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'https://www.youtube.com/shorts/dQw4w9WgXcQ'
];

console.log('📹 Testing YouTube URL Parser:');
ytUrls.forEach(url => {
  const id = parseYouTubeUrl(url);
  console.log(`  - URL: ${url} => ID: ${id} [${id === 'dQw4w9WgXcQ' ? 'PASS' : 'FAIL'}]`);
});

// 2. Test Instagram URL parser
const igUrls = [
  'https://www.instagram.com/reel/B7HrMRxFl2U/',
  'https://instagram.com/reel/B7HrMRxFl2U',
  'https://www.instagram.com/p/B7HrMRxFl2U/',
  'https://www.instagram.com/reels/B7HrMRxFl2U'
];

console.log('\n📸 Testing Instagram URL Parser:');
igUrls.forEach(url => {
  const shortcode = parseInstagramUrl(url);
  console.log(`  - URL: ${url} => Shortcode: ${shortcode} [${shortcode === 'B7HrMRxFl2U' ? 'PASS' : 'FAIL'}]`);
});

// 3. Test Invalid URLs
console.log('\n❌ Testing Invalid URLs:');
try {
  parseYouTubeUrl('https://example.com');
  console.log('  - Invalid YouTube URL check: FAIL (did not throw)');
} catch (err) {
  console.log('  - Invalid YouTube URL check: PASS (threw as expected)');
}

try {
  parseInstagramUrl('https://example.com');
  console.log('  - Invalid Instagram URL check: FAIL (did not throw)');
} catch (err) {
  console.log('  - Invalid Instagram URL check: PASS (threw as expected)');
}

// 4. Test Engagement Rate
console.log('\n📊 Testing Engagement Calculator:');
const rate = calculateEngagementRate(18000, 890, 340000);
console.log(`  - Rate: ${rate}% [${rate === 5.56 ? 'PASS' : 'FAIL'}]`);

const zeroViewsRate = calculateEngagementRate(10, 5, 0);
console.log(`  - Zero views fallback: ${zeroViewsRate}% [${zeroViewsRate === 0 ? 'PASS' : 'FAIL'}]`);

// 5. Test Comparison
console.log('\n🥊 Testing Engagement Rate Comparator:');
const comparison = compareEngagementRates(1.22, 5.56, 'youtube', 'instagram');
console.log(`  - Winner: ${comparison.winner} [${comparison.winner === 'instagram' ? 'PASS' : 'FAIL'}]`);
console.log(`  - Difference: ${comparison.diff} [${comparison.diff === '-4.34%' ? 'PASS' : 'FAIL'}]`);

console.log('\n✅ All utility validation checks completed.');
