import { NewsArticle } from '../types';

export async function fetchRSSFeed(feedUrl: string, category: string): Promise<NewsArticle[]> {
  try {
    const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&api_key=your_key&count=20`);

    if (!response.ok) {
      throw new Error('Failed to fetch RSS feed');
    }

    const data = await response.json();

    if (data.status !== 'ok') {
      throw new Error('RSS feed error');
    }

    return data.items.map((item: any, index: number) => ({
      id: `${category}-${Date.now()}-${index}`,
      title: item.title,
      description: item.description?.replace(/<[^>]*>/g, '').substring(0, 200) || '',
      link: item.link,
      pubDate: item.pubDate,
      source: data.feed.title || feedUrl,
      category,
      imageUrl: item.thumbnail || item.enclosure?.link
    }));
  } catch (error) {
    console.error(`Error fetching RSS feed ${feedUrl}:`, error);
    return [];
  }
}

export async function fetchMultipleFeeds(feeds: string[], category: string): Promise<NewsArticle[]> {
  const results = await Promise.allSettled(
    feeds.map(feed => fetchRSSFeed(feed, category))
  );

  const articles = results
    .filter((result): result is PromiseFulfilledResult<NewsArticle[]> => result.status === 'fulfilled')
    .flatMap(result => result.value);

  return articles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
}
