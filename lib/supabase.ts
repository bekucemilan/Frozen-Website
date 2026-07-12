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
  price: number;
  photo_url: string | null;
  photo_urls: string[] | null;
  category: string | null;
  is_active: boolean;
  sort_order: number;
};

export type SiteInfo = {
  store_name: string;
  tagline: string | null;
  about_text: string | null;
  address: string | null;
  open_hours: string | null;
  phone: string | null;
  maps_url: string | null;
};

export type Social = {
  id: string;
  platform: string;
  url: string;
};
