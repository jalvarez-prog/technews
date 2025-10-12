/**
 * Tests for link utility functions
 */

import {
  isValidUrl,
  getFallbackUrl,
  ensureProtocol,
  getSafeArticleUrl,
  getDomainFromUrl
} from './linkUtils';

describe('Link Utilities', () => {
  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('https://example.com/path/to/article')).toBe(true);
      expect(isValidUrl('https://example.com?param=value')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl(null)).toBe(false);
      expect(isValidUrl(undefined)).toBe(false);
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
      expect(isValidUrl('//example.com')).toBe(false);
    });
  });

  describe('getFallbackUrl', () => {
    it('should generate Google search URLs', () => {
      const url = getFallbackUrl('TechCrunch', 'Breaking: New AI Model Released');
      expect(url).toContain('https://www.google.com/search?q=');
      expect(url).toContain('Breaking%3A%20New%20AI%20Model%20Released');
      expect(url).toContain('TechCrunch');
    });

    it('should handle special characters', () => {
      const url = getFallbackUrl('Source & News', 'Article with "quotes"');
      expect(url).toContain('Article%20with%20%22quotes%22');
      expect(url).toContain('Source%20%26%20News');
    });
  });

  describe('ensureProtocol', () => {
    it('should add https:// to URLs without protocol', () => {
      expect(ensureProtocol('example.com')).toBe('https://example.com');
      expect(ensureProtocol('www.example.com')).toBe('https://www.example.com');
    });

    it('should not modify URLs with existing protocol', () => {
      expect(ensureProtocol('https://example.com')).toBe('https://example.com');
      expect(ensureProtocol('http://example.com')).toBe('http://example.com');
    });

    it('should handle protocol-relative URLs', () => {
      expect(ensureProtocol('//example.com')).toBe('https://example.com');
    });

    it('should handle empty strings', () => {
      expect(ensureProtocol('')).toBe('');
    });
  });

  describe('getSafeArticleUrl', () => {
    it('should return valid URLs as-is', () => {
      const url = getSafeArticleUrl(
        'https://example.com/article',
        'Example News',
        'Test Article'
      );
      expect(url).toBe('https://example.com/article');
    });

    it('should fix URLs without protocol', () => {
      const url = getSafeArticleUrl(
        'example.com/article',
        'Example News',
        'Test Article'
      );
      expect(url).toBe('https://example.com/article');
    });

    it('should return fallback for invalid URLs', () => {
      const url = getSafeArticleUrl(
        '',
        'TechCrunch',
        'Breaking News'
      );
      expect(url).toContain('google.com/search');
      expect(url).toContain('Breaking%20News');
      expect(url).toContain('TechCrunch');
    });

    it('should return fallback for null/undefined URLs', () => {
      const url1 = getSafeArticleUrl(null, 'Source', 'Title');
      const url2 = getSafeArticleUrl(undefined, 'Source', 'Title');
      
      expect(url1).toContain('google.com/search');
      expect(url2).toContain('google.com/search');
    });
  });

  describe('getDomainFromUrl', () => {
    it('should extract domain from valid URLs', () => {
      expect(getDomainFromUrl('https://example.com/path')).toBe('example.com');
      expect(getDomainFromUrl('https://www.example.com/path')).toBe('example.com');
      expect(getDomainFromUrl('https://blog.example.com/path')).toBe('blog.example.com');
    });

    it('should handle invalid URLs', () => {
      expect(getDomainFromUrl('not a url')).toBe('');
      expect(getDomainFromUrl('')).toBe('');
    });
  });
});

// Example test scenarios for components
export const testArticles = [
  // Valid article with all fields
  {
    id: '1',
    title: 'Valid Article with Link',
    description: 'This article has a valid link',
    link: 'https://techcrunch.com/2024/01/01/valid-article',
    pubDate: new Date().toISOString(),
    source: 'TechCrunch',
    category: 'ai' as const
  },
  // Article with missing link
  {
    id: '2',
    title: 'Article Without Link',
    description: 'This article is missing a link',
    link: '',
    pubDate: new Date().toISOString(),
    source: 'The Verge',
    category: 'ai' as const
  },
  // Article with link without protocol
  {
    id: '3',
    title: 'Article with Protocol-less Link',
    description: 'This article has a link without protocol',
    link: 'example.com/article',
    pubDate: new Date().toISOString(),
    source: 'Example News',
    category: 'ai' as const
  },
  // Article with null link
  {
    id: '4',
    title: 'Article with Null Link',
    description: 'This article has a null link',
    link: null as any,
    pubDate: new Date().toISOString(),
    source: 'Null News',
    category: 'ai' as const
  },
  // Article with malformed URL
  {
    id: '5',
    title: 'Article with Malformed URL',
    description: 'This article has a malformed URL',
    link: 'not-a-valid-url',
    pubDate: new Date().toISOString(),
    source: 'Bad URL News',
    category: 'ai' as const
  }
];