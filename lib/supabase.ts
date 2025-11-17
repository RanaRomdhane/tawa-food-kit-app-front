import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get these from your Supabase project settings
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types (you can generate these with Supabase CLI)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          bio: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          phone?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          name?: string;
          phone?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          image_url: string;
          rating: number;
          cook_time: number;
          servings: number;
          category: string;
          calories: number | null;
          protein: number | null;
          fiber: number | null;
          water: number | null;
          fat: number | null;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      cart: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          size: 'S' | 'M' | 'L' | null;
          cooked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          product_id: string;
          quantity: number;
          size?: 'S' | 'M' | 'L' | null;
          cooked?: boolean;
        };
        Update: {
          quantity?: number;
          size?: 'S' | 'M' | 'L' | null;
          cooked?: boolean;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          order_number: string;
          total: number;
          delivery_fee: number;
          status: 'pending' | 'ongoing' | 'completed' | 'canceled';
          address_id: string | null;
          payment_method_id: string | null;
          courier_name: string | null;
          courier_avatar: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: 'Home' | 'School' | 'Other';
          full_address: string;
          street: string;
          post_code: string;
          apartment: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          label: 'Home' | 'School' | 'Other';
          full_address: string;
          street: string;
          post_code: string;
          apartment?: string | null;
          is_default?: boolean;
        };
      };
    };
  };
}