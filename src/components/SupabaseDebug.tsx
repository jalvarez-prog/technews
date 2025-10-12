import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface RawArticle {
  id: string;
  title: string;
  link: any; // Accepting any type to see what Supabase returns
  source: string;
  category: string;
}

export function SupabaseDebug() {
  const [articles, setArticles] = useState<RawArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('id, title, link, source, category')
          .limit(10);

        if (error) {
          setError(error.message);
          console.error('Supabase error:', error);
        } else {
          console.log('Raw Supabase data:', data);
          setArticles(data || []);
        }
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div className="p-4">Loading Supabase data...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Supabase Data Debug</h2>
      
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded mb-6">
        <p className="text-sm">This component shows raw data from Supabase to debug link issues.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="border p-2 text-left">Title</th>
              <th className="border p-2 text-left">Source</th>
              <th className="border p-2 text-left">Link Value</th>
              <th className="border p-2 text-left">Link Type</th>
              <th className="border p-2 text-left">Link Length</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                <td className="border p-2 text-sm">{article.title.substring(0, 50)}...</td>
                <td className="border p-2 text-sm">{article.source}</td>
                <td className="border p-2">
                  <code className="text-xs bg-gray-100 dark:bg-gray-900 p-1 rounded">
                    {JSON.stringify(article.link)}
                  </code>
                </td>
                <td className="border p-2 text-sm">{typeof article.link}</td>
                <td className="border p-2 text-sm">
                  {article.link ? String(article.link).length : 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-900 rounded">
        <h3 className="font-semibold mb-2">Analysis:</h3>
        <ul className="text-sm space-y-1">
          <li>Total articles: {articles.length}</li>
          <li>Articles with null links: {articles.filter(a => a.link === null).length}</li>
          <li>Articles with empty links: {articles.filter(a => a.link === '').length}</li>
          <li>Articles with valid links: {articles.filter(a => a.link && a.link.length > 0).length}</li>
        </ul>
      </div>
    </div>
  );
}