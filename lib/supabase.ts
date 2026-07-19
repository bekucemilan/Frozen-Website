import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Product = {
  id: string;
  name: string;
  description: string | null;
  usage_info: string | null;
  recipe: string | null;
  recipe_source: string | null;
  price: number;
  photo_url: string | null;
  photo_urls: string[] | null;
  category: string | null;
  tags: string[] | null;
  is_active: boolean;
  sort_order: number;
};

export type SiteInfo = {
  store_name: string;
  tagline: string | null;
  address: string | null;
  open_hours: string | null;
  phone: string | null;
  maps_url: string | null;
  usage_title: string | null;
  usage_subtitle: string | null;
  recipe_title: string | null;
  recipe_subtitle: string | null;
  hero_day_media_type: 'none' | 'image' | 'video' | null;
  hero_day_media_url: string | null;
  hero_night_media_type: 'none' | 'image' | 'video' | null;
  hero_night_media_url: string | null;
};

export type Social = {
  id: string;
  platform: string;
  url: string;
  sort_order: number;
};

export type AboutSection = {
  id: string;
  label: string | null;
  title: string | null;
  body: string | null;
  sort_order: number;
};

export type FeatureBadge = {
  id: string;
  section: 'hero' | 'footer';
  icon: string;
  label: string;
  sort_order: number;
};
