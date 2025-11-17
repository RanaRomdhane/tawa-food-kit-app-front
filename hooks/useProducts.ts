import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          ingredients (*)
        `)
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const products: Product[] = data.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: Number(product.price),
        image: product.image_url,
        rating: Number(product.rating),
        cookTime: product.cook_time,
        servings: product.servings,
        category: product.category,
        calories: product.calories,
        protein: product.protein,
        fiber: product.fiber,
        water: product.water,
        fat: product.fat,
        ingredients: product.ingredients?.map((ing: any) => ({
          name: ing.name,
          cooked: ing.cooked,
          calories: ing.calories,
          protein: ing.protein,
          fiber: ing.fiber,
          water: ing.water,
          fat: ing.fat,
        })),
      }));

      return products;
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          ingredients (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      const product: Product = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        price: Number(data.price),
        image: data.image_url,
        rating: Number(data.rating),
        cookTime: data.cook_time,
        servings: data.servings,
        category: data.category,
        calories: data.calories,
        protein: data.protein,
        fiber: data.fiber,
        water: data.water,
        fat: data.fat,
        ingredients: data.ingredients?.map((ing: any) => ({
          name: ing.name,
          cooked: ing.cooked,
          calories: ing.calories,
          protein: ing.protein,
          fiber: ing.fiber,
          water: ing.water,
          fat: ing.fat,
        })),
      };

      return product;
    },
    enabled: !!id,
  });
};

export const useProductsByCategory = (category: string) => {
  return useQuery({
    queryKey: ['products', 'category', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .eq('is_available', true);

      if (error) throw error;

      return data.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: Number(product.price),
        image: product.image_url,
        rating: Number(product.rating),
        cookTime: product.cook_time,
        servings: product.servings,
        category: product.category,
      }));
    },
    enabled: !!category,
  });
};