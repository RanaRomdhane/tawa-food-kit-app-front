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
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const onboardingComplete = await AsyncStorage.getItem('onboardingComplete');
      if (onboardingComplete) {
        setHasCompletedOnboarding(true);
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setIsAuthenticated(true);
        await loadUserData(session.user.id);
      }

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
          id,
          quantity,
          size,
          cooked,
          products (*)
        `)
        .eq('user_id', userId);

      if (cartData) {
        const formattedCart: CartItem[] = cartData.map((value: { id: any; quantity: any; size: any; cooked: any; products: any[]; }, index: number) => {
          const product = value.products[0]; // Assuming that the product is the first element in the products array
          return {
            id: value.id,
            product: {
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
            },
            quantity: value.quantity,
            size: value.size as 'S' | 'M' | 'L' | undefined,
            cooked: value.cooked,
          };
        });
        setCart(formattedCart);
      }

      // Load payment methods
      const { data: paymentData } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (paymentData) {
        const formattedPayments: PaymentMethod[] = paymentData.map(pm => ({
          id: pm.id,
          type: pm.type as 'cash' | 'visa' | 'mastercard' | 'paypal',
          cardNumber: pm.card_number,
          cardHolder: pm.card_holder,
        }));
        setPaymentMethods(formattedPayments);
        if (formattedPayments.length > 0) {
          setSelectedPaymentMethod(formattedPayments[0]);
        }
      }

      // Load favorites
      const { data: favoritesData } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', userId);

      if (favoritesData) {
        setFavorites(favoritesData.map(f => f.product_id));
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
    setFavorites([]);
    setPaymentMethods([]);
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: updates.name,
          phone: updates.phone,
          bio: updates.bio,
          avatar_url: updates.avatar,
        })
        .eq('id', user.id);

      if (error) throw error;

      setUser({ ...user, ...updates });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }, [user]);

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
        }, {
          onConflict: 'user_id,product_id,size,cooked'
        })
        .select(`
          id,
          quantity,
          size,
          cooked,
          products (*)
        `)
        .single();

      if (error) throw error;

      await loadUserData(user.id);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }, [user]);

  const updateCartItem = useCallback(async (index: number, quantity: number) => {
    if (!user || !cart[index]) return;

    try {
      const cartItem = cart[index];
      
      if (quantity <= 0) {
        await supabase.from('cart').delete().eq('id', cartItem.id);
      } else {
        await supabase
          .from('cart')
          .update({ quantity })
          .eq('id', cartItem.id);
      }

      await loadUserData(user.id);
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  }, [user, cart]);

  const removeFromCart = useCallback(async (index: number) => {
    if (!user || !cart[index]) return;

    try {
      await supabase.from('cart').delete().eq('id', cart[index].id);
      await loadUserData(user.id);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  }, [user, cart]);

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
      throw error;
    }
  }, [user, addresses]);

  const updateAddress = useCallback(async (id: string, updates: Partial<Address>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('addresses')
        .update({
          label: updates.label,
          full_address: updates.fullAddress,
          street: updates.street,
          post_code: updates.postCode,
          apartment: updates.apartment,
        })
        .eq('id', id);

      if (error) throw error;

      await loadUserData(user.id);
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  }, [user]);

  const deleteAddress = useCallback(async (id: string) => {
    if (!user) return;

    try {
      await supabase.from('addresses').delete().eq('id', id);
      await loadUserData(user.id);
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  }, [user]);

  const addPaymentMethod = useCallback(async (method: Omit<PaymentMethod, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: user.id,
          type: method.type,
          card_number: method.cardNumber,
          card_holder: method.cardHolder,
          is_default: paymentMethods.length === 0,
        })
        .select()
        .single();

      if (error) throw error;

      await loadUserData(user.id);
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }, [user, paymentMethods]);

  const deletePaymentMethod = useCallback(async (id: string) => {
    if (!user) return;

    try {
      await supabase.from('payment_methods').delete().eq('id', id);
      await loadUserData(user.id);
    } catch (error) {
      console.error('Error deleting payment method:', error);
    }
  }, [user]);

  const toggleFavorite = useCallback(async (productId: string) => {
    if (!user) return;

    try {
      const isFavorite = favorites.includes(productId);

      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        setFavorites(favorites.filter(id => id !== productId));
      } else {
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            product_id: productId,
          });
        setFavorites([...favorites, productId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }, [user, favorites]);

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
      favorites,
      cartTotal,
      loading,
      completeOnboarding,
      login,
      signup,
      logout,
      setUser,
      updateUser,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
      addAddress,
      updateAddress,
      deleteAddress,
      setSelectedAddress,
      addPaymentMethod,
      deletePaymentMethod,
      setSelectedPaymentMethod,
      toggleFavorite,
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
      favorites,
      cartTotal,
      loading,
      completeOnboarding,
      login,
      signup,
      logout,
      updateUser,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
      addAddress,
      updateAddress,
      deleteAddress,
      addPaymentMethod,
      deletePaymentMethod,
      toggleFavorite,
    ]
  );
});