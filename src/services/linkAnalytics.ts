/**
 * Link Analytics Service
 * Tracks article link clicks and provides analytics data
 */

import { supabase } from '../lib/supabase';

interface LinkClickData {
  articleId: string;
  articleTitle: string;
  source: string;
  url: string;
  timestamp: string;
  userId?: string;
  sessionId: string;
  isOriginalLink: boolean;
}

interface LinkAnalytics {
  totalClicks: number;
  uniqueUsers: number;
  clicksBySource: Record<string, number>;
  brokenLinks: string[];
  popularArticles: Array<{
    articleId: string;
    title: string;
    clicks: number;
  }>;
}

// Generate or get session ID
function getSessionId(): string {
  const SESSION_KEY = 'techhub_session_id';
  
  try {
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    
    return sessionId;
  } catch (error) {
    // Fallback if sessionStorage is not available
    console.warn('sessionStorage not available, using fallback session ID');
    return `session_fallback_${Date.now()}`;
  }
}

/**
 * Track a link click event
 */
export async function trackLinkClick(
  articleId: string,
  articleTitle: string,
  source: string,
  url: string,
  isOriginalLink: boolean = true
): Promise<void> {
  try {
    const clickData: LinkClickData = {
      articleId,
      articleTitle,
      source,
      url,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      isOriginalLink
    };

    // Only log to console for now to avoid any issues
    console.log('Link click tracked:', {
      title: articleTitle,
      source,
      url,
      isOriginal: isOriginalLink
    });

    // Store in localStorage for offline support (wrapped in try-catch)
    try {
      const localStorageKey = 'pending_link_clicks';
      const existingClicks = localStorage.getItem(localStorageKey);
      const pendingClicks = existingClicks ? JSON.parse(existingClicks) : [];
      pendingClicks.push(clickData);
      localStorage.setItem(localStorageKey, JSON.stringify(pendingClicks));
    } catch (storageError) {
      console.warn('Could not save to localStorage:', storageError);
    }

    // Defer Supabase sync to avoid blocking navigation
    // TEMPORARILY DISABLED to prevent 404 errors
    /*
    setTimeout(() => {
      sendClicksToSupabase([clickData]).catch(error => {
        console.debug('Background sync failed:', error);
      });
    }, 100);
    */
  } catch (error) {
    // Don't let any error in tracking prevent navigation
    console.error('Error in trackLinkClick:', error);
  }
}

/**
 * Send click data to Supabase
 */
async function sendClicksToSupabase(clicks: LinkClickData[]): Promise<void> {
  if (!clicks.length) return;

  try {
    const { error } = await supabase
      .from('link_analytics')
      .insert(clicks.map(click => ({
        article_id: click.articleId,
        article_title: click.articleTitle,
        source: click.source,
        url: click.url,
        clicked_at: click.timestamp,
        session_id: click.sessionId,
        is_original_link: click.isOriginalLink
      })));

    if (error) throw error;
  } catch (error) {
    // If table doesn't exist, create it
    if ((error as any).code === '42P01') {
      await createAnalyticsTable();
      // Retry sending
      await sendClicksToSupabase(clicks);
    } else {
      throw error;
    }
  }
}

/**
 * Create analytics table if it doesn't exist
 */
async function createAnalyticsTable(): Promise<void> {
  const { error } = await supabase.rpc('create_link_analytics_table', {
    query: `
      CREATE TABLE IF NOT EXISTS link_analytics (
        id SERIAL PRIMARY KEY,
        article_id TEXT NOT NULL,
        article_title TEXT NOT NULL,
        source TEXT NOT NULL,
        url TEXT NOT NULL,
        clicked_at TIMESTAMP NOT NULL,
        session_id TEXT NOT NULL,
        is_original_link BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX idx_link_analytics_article_id ON link_analytics(article_id);
      CREATE INDEX idx_link_analytics_source ON link_analytics(source);
      CREATE INDEX idx_link_analytics_clicked_at ON link_analytics(clicked_at);
    `
  });

  if (error) {
    console.error('Failed to create analytics table:', error);
  }
}

/**
 * Sync pending clicks from localStorage
 */
export async function syncPendingClicks(): Promise<void> {
  const localStorageKey = 'pending_link_clicks';
  const pendingClicks = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
  
  if (pendingClicks.length === 0) return;

  try {
    await sendClicksToSupabase(pendingClicks);
    localStorage.setItem(localStorageKey, '[]');
  } catch (error) {
    console.error('Failed to sync pending clicks:', error);
  }
}

/**
 * Get link analytics for a specific time period
 */
export async function getLinkAnalytics(
  startDate?: Date,
  endDate?: Date
): Promise<LinkAnalytics> {
  try {
    let query = supabase
      .from('link_analytics')
      .select('*');

    if (startDate) {
      query = query.gte('clicked_at', startDate.toISOString());
    }
    if (endDate) {
      query = query.lte('clicked_at', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    // Process analytics
    const analytics: LinkAnalytics = {
      totalClicks: data?.length || 0,
      uniqueUsers: new Set(data?.map(d => d.session_id) || []).size,
      clicksBySource: {},
      brokenLinks: [],
      popularArticles: []
    };

    // Count clicks by source
    data?.forEach(click => {
      analytics.clicksBySource[click.source] = 
        (analytics.clicksBySource[click.source] || 0) + 1;
      
      // Track broken links (fallback URLs)
      if (!click.is_original_link) {
        analytics.brokenLinks.push(click.article_id);
      }
    });

    // Get popular articles
    const articleClicks: Record<string, { title: string; clicks: number }> = {};
    data?.forEach(click => {
      if (!articleClicks[click.article_id]) {
        articleClicks[click.article_id] = { title: click.article_title, clicks: 0 };
      }
      articleClicks[click.article_id].clicks++;
    });

    analytics.popularArticles = Object.entries(articleClicks)
      .map(([articleId, data]) => ({
        articleId,
        title: data.title,
        clicks: data.clicks
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    return analytics;
  } catch (error) {
    console.error('Failed to get link analytics:', error);
    // Return empty analytics on error
    return {
      totalClicks: 0,
      uniqueUsers: 0,
      clicksBySource: {},
      brokenLinks: [],
      popularArticles: []
    };
  }
}

/**
 * Report a broken link
 */
export async function reportBrokenLink(
  articleId: string,
  articleTitle: string,
  source: string,
  brokenUrl: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('broken_links')
      .insert({
        article_id: articleId,
        article_title: articleTitle,
        source,
        broken_url: brokenUrl,
        reported_at: new Date().toISOString(),
        session_id: getSessionId()
      });

    if (error && error.code === '42P01') {
      // Create table if doesn't exist
      await createBrokenLinksTable();
      // Retry
      await reportBrokenLink(articleId, articleTitle, source, brokenUrl);
    }
  } catch (error) {
    console.error('Failed to report broken link:', error);
  }
}

/**
 * Create broken links table
 */
async function createBrokenLinksTable(): Promise<void> {
  const { error } = await supabase.rpc('create_broken_links_table', {
    query: `
      CREATE TABLE IF NOT EXISTS broken_links (
        id SERIAL PRIMARY KEY,
        article_id TEXT NOT NULL,
        article_title TEXT NOT NULL,
        source TEXT NOT NULL,
        broken_url TEXT NOT NULL,
        reported_at TIMESTAMP NOT NULL,
        session_id TEXT NOT NULL,
        resolved BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX idx_broken_links_article_id ON broken_links(article_id);
      CREATE INDEX idx_broken_links_resolved ON broken_links(resolved);
    `
  });

  if (error) {
    console.error('Failed to create broken links table:', error);
  }
}

// Auto-sync pending clicks on page load
// TEMPORARILY DISABLED to prevent 404 errors
/*
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    syncPendingClicks();
  });

  // Sync periodically
  setInterval(() => {
    syncPendingClicks();
  }, 60000); // Every minute
}
*/
