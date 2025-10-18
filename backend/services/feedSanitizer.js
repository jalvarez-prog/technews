const axios = require('axios');
const Parser = require('rss-parser');

/**
 * Problematic feeds that need special handling
 */
const PROBLEMATIC_FEEDS = {
  'https://www.artificialintelligence-news.com/feed/': {
    method: 'htmlEntityFix',
    fallbackUrl: null
  },
  'https://www.marktechpost.com/feed/': {
    method: 'htmlEntityFix',
    fallbackUrl: null
  },
  'https://venturebeat.com/ai/feed/': {
    method: 'skip',
    fallbackUrl: null,
    reason: '404 - Feed no longer exists'
  }
};

/**
 * Create a parser with custom options for problematic feeds
 */
function createCustomParser(options = {}) {
  return new Parser({
    timeout: 30000,
    customFields: {
      item: ['media:content', 'media:thumbnail', 'enclosure']
    },
    requestOptions: {
      rejectUnauthorized: false,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TechHub RSS Scraper/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      }
    },
    ...options
  });
}

/**
 * Sanitize XML content by fixing common issues
 */
function sanitizeXML(xmlContent) {
  let cleaned = xmlContent;
  
  // Fix unescaped ampersands (but not already escaped ones)
  cleaned = cleaned.replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/gi, '&amp;');
  
  // Fix common HTML entities that might not be valid in XML
  const htmlEntities = {
    '&nbsp;': '&#160;',
    '&copy;': '&#169;',
    '&reg;': '&#174;',
    '&trade;': '&#8482;',
    '&euro;': '&#8364;',
    '&pound;': '&#163;',
    '&yen;': '&#165;',
    '&cent;': '&#162;',
    '&mdash;': '&#8212;',
    '&ndash;': '&#8211;',
    '&hellip;': '&#8230;',
    '&ldquo;': '&#8220;',
    '&rdquo;': '&#8221;',
    '&lsquo;': '&#8216;',
    '&rsquo;': '&#8217;'
  };
  
  for (const [entity, replacement] of Object.entries(htmlEntities)) {
    cleaned = cleaned.replace(new RegExp(entity, 'gi'), replacement);
  }
  
  // Remove control characters except for tabs, newlines, and carriage returns
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Fix CDATA sections with problematic content
  cleaned = cleaned.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (match, content) => {
    // Escape problematic characters inside CDATA
    const escapedContent = content
      .replace(/\]\]>/g, ']]&gt;')
      .replace(/-->/g, '--&gt;');
    return `<![CDATA[${escapedContent}]]>`;
  });
  
  // Remove or fix broken tags
  cleaned = cleaned.replace(/<([^>]*?)=([^>]*?)>/g, '<$1$2>');
  
  return cleaned;
}

/**
 * Fetch and sanitize a feed
 */
async function fetchAndSanitizeFeed(feedUrl) {
  const parser = createCustomParser();
  
  // Check if this is a known problematic feed
  const problemConfig = PROBLEMATIC_FEEDS[feedUrl];
  
  // If this feed should be skipped, return empty structure
  if (problemConfig && problemConfig.method === 'skip') {
    console.log(`Skipping known problematic feed ${feedUrl}: ${problemConfig.reason}`);
    return {
      title: feedUrl,
      description: problemConfig.reason || 'Feed skipped',
      link: feedUrl,
      items: [],
      feedUrl: feedUrl,
      error: true,
      errorMessage: problemConfig.reason || 'Feed skipped'
    };
  }
  
  try {
    // First, try normal parsing
    return await parser.parseURL(feedUrl);
  } catch (parseError) {
    console.log(`Direct parsing failed for ${feedUrl}: ${parseError.message}`);
    
    // If it's an XML parsing error, try to fetch and clean manually
    if (parseError.message.includes('Invalid character') || 
        parseError.message.includes('entity') ||
        parseError.message.includes('XML')) {
      
      console.log(`Attempting to sanitize XML for ${feedUrl}`);
      
      try {
        // Fetch the raw feed content
        const response = await axios.get(feedUrl, {
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache'
          },
          responseType: 'text',
          // Handle different encodings
          transformResponse: [(data) => {
            // Ensure we have string data
            if (typeof data !== 'string') {
              data = data.toString('utf8');
            }
            return data;
          }]
        });
        
        // Sanitize the XML
        const sanitizedXml = sanitizeXML(response.data);
        
        // Try parsing the sanitized XML
        const feed = await parser.parseString(sanitizedXml);
        console.log(`Successfully sanitized and parsed ${feedUrl}`);
        return feed;
        
      } catch (sanitizeError) {
        console.error(`Sanitization failed for ${feedUrl}:`, sanitizeError.message);
        
        // If we have a fallback URL, try that
        if (problemConfig && problemConfig.fallbackUrl) {
          console.log(`Trying fallback URL: ${problemConfig.fallbackUrl}`);
          try {
            return await parser.parseURL(problemConfig.fallbackUrl);
          } catch (fallbackError) {
            console.error(`Fallback also failed:`, fallbackError.message);
          }
        }
        
        // Return a minimal feed structure to prevent complete failure
        return {
          title: feedUrl,
          description: 'Feed temporarily unavailable',
          link: feedUrl,
          items: [],
          feedUrl: feedUrl,
          error: true,
          errorMessage: sanitizeError.message
        };
      }
    }
    
    // For non-XML errors, just throw
    throw parseError;
  }
}

/**
 * Test if a feed is accessible and parseable
 */
async function testFeed(feedUrl) {
  try {
    const feed = await fetchAndSanitizeFeed(feedUrl);
    return {
      success: !feed.error,
      itemCount: feed.items ? feed.items.length : 0,
      title: feed.title,
      error: feed.errorMessage || null
    };
  } catch (error) {
    return {
      success: false,
      itemCount: 0,
      error: error.message
    };
  }
}

module.exports = {
  fetchAndSanitizeFeed,
  sanitizeXML,
  testFeed,
  createCustomParser,
  PROBLEMATIC_FEEDS
};