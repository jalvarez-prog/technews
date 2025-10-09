import { useState, useEffect } from 'react';
import { NewsArticle, NewsCategory } from '../types';
import { fetchMultipleFeeds } from '../utils/rssParser';
import { categories } from '../config/categories';
import { mockNewsByCategory } from '../data/mockNews';

export function useNews(category: NewsCategory) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadNews() {
      setLoading(true);
      setError(null);

      const cacheKey = `news-${category}`;
      const cached = sessionStorage.getItem(cacheKey);
      const cacheTime = sessionStorage.getItem(`${cacheKey}-time`);

      if (cached && cacheTime) {
        const age = Date.now() - parseInt(cacheTime);
        if (age < 300000) {
          if (mounted) {
            setArticles(JSON.parse(cached));
            setLoading(false);
          }
          return;
        }
      }

      try {
        const categoryConfig = categories.find(c => c.id === category);
        if (!categoryConfig) {
          throw new Error('Category not found');
        }

        // Temporarily use mock data
        // TODO: Replace with real API call when API key is configured
        const USE_MOCK_DATA = true;
        
        let news: NewsArticle[];
        if (USE_MOCK_DATA) {
          // Simulate loading delay
          await new Promise(resolve => setTimeout(resolve, 500));
          news = mockNewsByCategory[category] || [];
        } else {
          news = await fetchMultipleFeeds(categoryConfig.feeds, category);
        }

        if (mounted) {
          setArticles(news);
          sessionStorage.setItem(cacheKey, JSON.stringify(news));
          sessionStorage.setItem(`${cacheKey}-time`, Date.now().toString());
        }
      } catch (err) {
        if (mounted) {
          setError('Error loading news');
          console.error(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadNews();

    return () => {
      mounted = false;
    };
  }, [category]);

  return { articles, loading, error };
}
