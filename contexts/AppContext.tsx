import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Address, CartItem, PaymentMethod, Order, Product } from '@/types';

export const [AppContext, useApp] = createContextHook(() => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check onboarding status
      const onboardingComplete = await AsyncStorage.getItem('onboardingComplete');
      if (onboardingComplete) {
        setHasCompletedOnboarding(true);
      }

      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setIsAuthenticated(true);
        await loadUserData(session.user.id);
      }

      // Listen to auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (session?.user) {
            setIsAuthenticated(true);
            await loadUserData(session.user.id);
          } else {
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      );

      setLoading(false);

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error initializing app:', error);
      setLoading(false);
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      // Load user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      
      setUser({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        bio: userData.bio || '',
        avatar: userData.avatar_url,
      });

      // Load addresses
      const { data: addressesData } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (addressesData) {
        const formattedAddresses: Address[] = addressesData.map(addr => ({
          id: addr.id,
          label: addr.label as 'Home' | 'School' | 'Other',
          fullAddress: addr.full_address,
          street: addr.street,
          postCode: addr.post_code,
          apartment: addr.apartment || '',
        }));
        setAddresses(formattedAddresses);
        if (formattedAddresses.length > 0) {
          setSelectedAddress(formattedAddresses[0]);
        }
      }

      // Load cart with product details
      const { data: cartData } = await supabase
        .from('cart')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', userId);

      if (cartData) {
        const formattedCart: CartItem[] = cartData.map(item => ({
          product: {
            id: item.products.id,
            name: item.products.name,
            description: item.products.description || '',
            price: Number(item.products.price),
            image: item.products.image_url,
            rating: Number(item.products.rating),
            cookTime: item.products.cook_time,
            servings: item.products.servings,
            category: item.products.category,
            calories: item.products.calories,
            protein: item.products.protein,
            fiber: item.products.fiber,
            water: item.products.water,
            fat: item.products.fat,
          },
          quantity: item.quantity,
          size: item.size as 'S' | 'M' | 'L' | undefined,
          cooked: item.cooked,
        }));
        setCart(formattedCart);
      }

      // Load orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (*)
          ),
          addresses (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (ordersData) {
        const formattedOrders: Order[] = ordersData.map(order => ({
          id: order.order_number,
          items: order.order_items.map((item: any) => ({
            product: {
              id: item.products.id,
              name: item.products.name,
              description: item.products.description || '',
              price: Number(item.products.price),
              image: item.products.image_url,
              rating: Number(item.products.rating),
              cookTime: item.products.cook_time,
              servings: item.products.servings,
              category: item.products.category,
            },
            quantity: item.quantity,
            size: item.size,
            cooked: item.cooked,
          })),
          total: Number(order.total),
          status: order.status,
          date: new Date(order.created_at).toLocaleDateString(),
          address: order.addresses?.full_address || '',
          courier: order.courier_name ? {
            name: order.courier_name,
            avatar: order.courier_avatar || '',
          } : undefined,
        }));
        setOrders(formattedOrders);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const completeOnboarding = useCallback(async () => {
    setHasCompletedOnboarding(true);
    await AsyncStorage.setItem('onboardingComplete', 'true');
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    setIsAuthenticated(true);
    if (data.user) {
      await loadUserData(data.user.id);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) throw error;
    return data;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    setCart([]);
    setAddresses([]);
    setOrders([]);
  }, []);

  const addToCart = useCallback(async (item: CartItem) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cart')
        .upsert({
          user_id: user.id,
          product_id: item.product.id,
          quantity: item.quantity,
          size: item.size || null,
          cooked: item.cooked || false,
        })
        .select(`
          *,
          products (*)
        `)
        .single();

      if (error) throw error;

      // Reload cart
      await loadUserData(user.id);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }, [user]);

  const updateCartItem = useCallback(async (cartItemId: string, quantity: number) => {
    if (!user) return;

    try {
      if (quantity <= 0) {
        await supabase.from('cart').delete().eq('id', cartItemId);
      } else {
        await supabase
          .from('cart')
          .update({ quantity })
          .eq('id', cartItemId);
      }

      await loadUserData(user.id);
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  }, [user]);

  const removeFromCart = useCallback(async (cartItemId: string) => {
    if (!user) return;

    try {
      await supabase.from('cart').delete().eq('id', cartItemId);
      await loadUserData(user.id);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  }, [user]);

  const clearCart = useCallback(async () => {
    if (!user) return;

    try {
      await supabase.from('cart').delete().eq('user_id', user.id);
      setCart([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }, [user]);

  const addAddress = useCallback(async (address: Omit<Address, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('addresses')
        .insert({
          user_id: user.id,
          label: address.label,
          full_address: address.fullAddress,
          street: address.street,
          post_code: address.postCode,
          apartment: address.apartment,
          is_default: addresses.length === 0,
        })
        .select()
        .single();

      if (error) throw error;

      await loadUserData(user.id);
    } catch (error) {
      console.error('Error adding address:', error);
    }
  }, [user, addresses]);

  const deleteAddress = useCallback(async (id: string) => {
    if (!user) return;

    try {
      await supabase.from('addresses').delete().eq('id', id);
      await loadUserData(user.id);
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  }, [user]);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart]
  );

  return useMemo(
    () => ({
      isAuthenticated,
      hasCompletedOnboarding,
      user,
      addresses,
      selectedAddress,
      cart,
      paymentMethods,
      selectedPaymentMethod,
      orders,
      cartTotal,
      loading,
      completeOnboarding,
      login,
      signup,
      logout,
      setUser,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
      addAddress,
      deleteAddress,
      setSelectedAddress,
      setSelectedPaymentMethod,
    }),
    [
      isAuthenticated,
      hasCompletedOnboarding,
      user,
      addresses,
      selectedAddress,
      cart,
      paymentMethods,
      selectedPaymentMethod,
      orders,
      cartTotal,
      loading,
      completeOnboarding,
      login,
      signup,
      logout,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
      addAddress,
      deleteAddress,
    ]
  );
});