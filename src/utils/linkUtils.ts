/**
 * Utility functions for handling and validating news article links
 */

import { trackLinkClick as trackClick } from '../services/linkAnalytics';

/**
 * Validates if a URL is valid and accessible
 * @param url - The URL to validate
 * @returns boolean indicating if the URL is valid
 */
export function isValidUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    // Check if it's a valid http or https URL
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch (error) {
    return false;
  }
}

/**
 * Gets a fallback URL for when the article link is missing or invalid
 * @param source - The news source
 * @param title - The article title
 * @returns A search URL as fallback
 */
export function getFallbackUrl(source: string, title: string): string {
  // Create a Google search URL as fallback
  const searchQuery = encodeURIComponent(`${title} ${source}`);
  return `https://www.google.com/search?q=${searchQuery}`;
}

/**
 * Ensures a URL has a protocol
 * @param url - The URL to check
 * @returns URL with protocol
 */
export function ensureProtocol(url: string): string {
  if (!url) return '';
  
  // If URL already has a protocol, return as is
  if (url.match(/^https?:\/\//)) {
    return url;
  }
  
  // If URL starts with //, add https:
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  
  // Otherwise, prepend https://
  return `https://${url}`;
}

/**
 * Gets a safe URL for the article
 * @param link - The article link
 * @param source - The article source
 * @param title - The article title
 * @returns A valid URL (original or fallback)
 */
export function getSafeArticleUrl(
  link: string | undefined | null,
  source: string,
  title: string
): string {
  // Debug logging
  if (!link || link.trim() === '') {
    console.info(`Using fallback URL for article: "${title}" from ${source}`);
  }
  
  // First, ensure the link has a protocol
  const processedLink = link ? ensureProtocol(link.trim()) : '';
  
  // If the link is valid, return it
  if (isValidUrl(processedLink)) {
    return processedLink;
  }
  
  // Otherwise, return a fallback search URL
  return getFallbackUrl(source, title);
}

/**
 * Tracks link click events for analytics
 * @param articleId - The article ID
 * @param articleTitle - The article title
 * @param source - The article source
 * @param url - The URL being clicked
 */
export function trackLinkClick(
  articleId: string,
  articleTitle: string,
  source: string,
  url: string
): void {
  const isOriginalLink = isValidUrl(url) && !url.includes('google.com/search');
  
  // Use the analytics service asynchronously without blocking
  // This prevents the tracking from interfering with navigation
  setTimeout(() => {
    trackClick(articleId, articleTitle, source, url, isOriginalLink)
      .catch(error => console.error('Failed to track link click:', error));
  }, 0);
}

/**
 * Opens a URL in a new tab with proper security attributes
 * @param url - The URL to open
 * @param event - The click event (optional)
 */
export function openInNewTab(url: string, event?: React.MouseEvent): void {
  if (event) {
    event.preventDefault();
  }
  
  // Open with security attributes
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Gets the domain name from a URL for display
 * @param url - The URL
 * @returns The domain name or empty string
 */
export function getDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '';
  }
}