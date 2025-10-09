import { LucideIcon } from 'lucide-react';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
  imageUrl?: string;
}

export type NewsCategory =
  | 'cybersecurity'
  | 'ai'
  | 'finance-crypto'
  | 'software-devops'
  | 'iot'
  | 'cloud'
  | 'data-science'
  | 'quantum';

export interface CategoryConfig {
  id: NewsCategory;
  name: string;
  icon: LucideIcon;
  color: string;
  feeds: string[];
}
