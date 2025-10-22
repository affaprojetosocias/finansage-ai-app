
import { type User } from '@supabase/supabase-js';

export interface Category {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category_id: string;
  user_id: string;
  created_at: string;
  categories?: Category; // Supabase can join tables
}

export interface Budget {
    id: string;
    user_id: string;
    category_id: string;
    amount: number;
    created_at: string;
    categories?: Category;
}

export interface UserProfile {
    id: string;
    updated_at: string;
    username: string;
    full_name: string;
    avatar_url: string;
    website: string;
}

export interface AppUser extends User {}
