import { useState, useEffect } from 'react';
import { NewsCategory } from '../types';
import { supabase } from '../lib/supabase';
import { getTickerDataForCategory } from '../data/tickerData';
import { getSafeArticleUrl } from '../utils/linkUtils';

interface TickerNewsItem {
  id: string;
  title: string;
  category: string;
  severity: string;
  source: string;
  time: string;
  icon: string;
  link: string;
}

export interface TickerNewsItemExtended {
  id: string;
  title: string;
  category: string;
  severity: string;
  source: string;
  time: string;
  icon: string;
  link: string;
}

export function useTicker(category: NewsCategory) {
  const [tickerItems, setTickerItems] = useState<TickerNewsItemExtended[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadTickerNews() {
      try {
        // Fetch featured news from Supabase
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('category', category)
          .eq('is_featured', true)
          .order('pub_date', { ascending: false })
          .limit(6);

        if (error) {
          console.error('Error fetching ticker news:', error);
          // Fallback to mock data
          if (mounted) {
            setTickerItems(getTickerDataForCategory(category));
          }
          return;
        }

        // Transform data to ticker format
        const transformedData: TickerNewsItemExtended[] = (data || []).map(item => {
          // Calculate time ago
          const timeAgo = getTimeAgo(new Date(item.pub_date));
          
          // Map severity to icon
          const iconMap: Record<string, string> = {
            'critical': '🔴',
            'high': '⚠️',
            'medium': '🔹',
            'hot': '🔥',
            'trending': '📈',
            'low': '📰'
          };

          return {
            id: item.id,
            title: item.title,
            category: item.category,
            severity: item.severity,
            source: item.source,
            time: timeAgo,
            icon: iconMap[item.severity] || '📰',
            link: item.link
          };
        });

        if (mounted) {
          // Si hay datos de Supabase, usarlos
          if (transformedData.length > 0) {
            setTickerItems(transformedData);
          } else {
            // Si no hay datos, usar mock con links seguros
            const mockData = getTickerDataForCategory(category).map(item => ({
              ...item,
              id: String(item.id),
              link: item.link || getSafeArticleUrl(item.link, item.source, item.title)
            }));
            setTickerItems(mockData);
          }
        }
      } catch (err) {
        console.error('Error in ticker hook:', err);
        // Fallback to mock data
        if (mounted) {
          const mockData = getTickerDataForCategory(category).map(item => ({
            ...item,
            id: String(item.id),
            link: item.link || getSafeArticleUrl(item.link, item.source, item.title)
          }));
          setTickerItems(mockData);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadTickerNews();

    // Refresh ticker every 5 minutes
    const interval = setInterval(loadTickerNews, 5 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [category]);

  return { tickerItems, loading };
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Ahora';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}