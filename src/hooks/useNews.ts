import { useState, useEffect } from 'react';
import { NewsArticle, NewsCategory } from '../types';
import { supabase } from '../lib/supabase';
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

      // Check cache first (5 minutes)
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
        // Fetch from Supabase
        const { data, error: supabaseError } = await supabase
          .from('news')
          .select('*')
          .eq('category', category)
          .order('pub_date', { ascending: false })
          .limit(20);

        if (supabaseError) {
          console.error('Supabase error:', supabaseError);
          // Fallback to mock data if Supabase fails
          const fallbackNews = mockNewsByCategory[category] || [];
          if (mounted) {
            setArticles(fallbackNews);
            setError('Using cached data. Live updates temporarily unavailable.');
          }
          return;
        }

        // Transform Supabase data to match NewsArticle interface
        const news: NewsArticle[] = (data || []).map(item => {
          // Debug logging
          if (!item.link) {
            console.warn(`Article "${item.title}" has no link, will use fallback`);
          }
          
          return {
            id: item.id,
            title: item.title,
            description: item.description,
            link: item.link || '', // Ensure link is at least an empty string
            pubDate: item.pub_date,
            source: item.source,
            category: item.category,
            imageUrl: item.image_url
          };
        });

        if (mounted) {
          setArticles(news);
          // Cache the results
          sessionStorage.setItem(cacheKey, JSON.stringify(news));
          sessionStorage.setItem(`${cacheKey}-time`, Date.now().toString());
        }
      } catch (err) {
        if (mounted) {
          // Fallback to mock data on error
          const fallbackNews = mockNewsByCategory[category] || [];
          setArticles(fallbackNews);
          setError('Error loading news. Showing cached content.');
          console.error('Error fetching news:', err);
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
