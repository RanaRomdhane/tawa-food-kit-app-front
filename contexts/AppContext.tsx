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
  const [error, setError] = useState<string | null>(null);

  // Separate function for loading cart data
  const loadCartData = useCallback(async (userId: string) => {
    try {
      console.log('🛒 LOAD CART DATA - Loading cart for user:', userId);
      
      const { data: cartData, error: cartError } = await supabase
        .from('cart')
        .select(`
          id,
          quantity,
          size,
          cooked,
          product_id,
          products (
            id,
            name,
            description,
            price,
            image_url,
            rating,
            cook_time,
            servings,
            category,
            calories,
            protein,
            fiber,
            water,
            fat
          )
        `)
        .eq('user_id', userId);
  
      console.log('🛒 LOAD CART DATA - Raw DB response:', {
        data: cartData,
        error: cartError,
        count: cartData?.length || 0
      });
  
      if (cartError) {
        console.error('Cart loading error:', cartError);
        setCart([]);
        return;
      }
  
      if (!cartData || cartData.length === 0) {
        console.log('🛒 LOAD CART DATA - No cart items found');
        setCart([]);
        return;
      }
  
      // Process cart items - FIXED: Handle both array and object formats
      const validCartItems = cartData.filter(item => {
        // Check if products exists and is not null/undefined
        const hasProducts = item.products && typeof item.products === 'object';
        
        if (!hasProducts) {
          console.warn('🛒 LOAD CART DATA - Filtering invalid item (no products):', item);
          return false;
        }
        
        // Check if the product has required fields
        const product = item.products;
        const isValidProduct = product.id && product.name && product.price !== undefined;
        
        if (!isValidProduct) {
          console.warn('🛒 LOAD CART DATA - Filtering invalid product data:', item);
          return false;
        }
        
        return true;
      });
  
      console.log('🛒 LOAD CART DATA - Valid items after filtering:', validCartItems.length);
  
      const formattedCart: CartItem[] = validCartItems.map(item => {
        // FIX: products is an object, not an array
        const product = item.products;
        console.log('🛒 LOAD CART DATA - Processing product:', product);
        
        return {
          id: item.id,
          product: {
            id: product.id,
            name: product.name,
            description: product.description || '',
            price: Number(product.price) || 0,
            image: product.image_url,
            rating: Number(product.rating) || 0,
            cookTime: product.cook_time,
            servings: product.servings,
            category: product.category,
            calories: product.calories,
            protein: product.protein,
            fiber: product.fiber,
            water: product.water,
            fat: product.fat,
          },
          quantity: item.quantity,
          size: item.size as 'S' | 'M' | 'L' | undefined,
          cooked: item.cooked,
        };
      });
  
      console.log('🛒 LOAD CART DATA - Final cart to set:', formattedCart);
      setCart(formattedCart);
      
    } catch (error) {
      console.error('Error loading cart data:', error);
      setCart([]);
    }
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      console.log('🔄 LOAD USER DATA - Starting for user:', userId);
      
      // Load user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error loading user profile:', userError);
        throw userError;
      }
      
      if (userData) {
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone || '',
          bio: userData.bio || '',
          avatar: userData.avatar_url,
        });
      }

      // Load cart data
      await loadCartData(userId);

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
          expiryDate: pm.expiry_date,
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
      setError('Failed to load user data');
    }
  };

  const refreshCart = useCallback(async () => {
    if (user) {
      console.log('🔄 MANUAL CART REFRESH - Triggered');
      await loadCartData(user.id);
    }
  }, [user, loadCartData]);

  useEffect(() => {
    initializeApp();
  }, []);

  // Add this function to contexts/AppContext.tsx in the hook

  const cancelOrder = useCallback(async (orderId: string) => {
    if (!user) {
      console.error('No user found');
      throw new Error('User must be logged in');
    }
  
    try {
      console.log('🚫 CANCEL ORDER - Canceling order:', orderId);
  
      const { error } = await supabase
        .from('orders')
        .update({ status: 'canceled' })
        .eq('order_number', orderId)
        .eq('user_id', user.id);
  
      if (error) throw error;
  
      console.log('🚫 CANCEL ORDER - Order canceled successfully');
      await loadUserData(user.id);
    } catch (error) {
      console.error('Error in cancelOrder:', error);
      throw error;
    }
  }, [user, loadUserData]);

  const initializeApp = async () => {
    try {
      setError(null);
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
            setCart([]);
            setAddresses([]);
            setOrders([]);
            setFavorites([]);
            setPaymentMethods([]);
          }
        }
      );

      setLoading(false);

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error initializing app:', error);
      setError('Failed to initialize app');
      setLoading(false);
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

  const addToCart = useCallback(async (item: Omit<CartItem, 'id'>) => {
    if (!user) {
      console.error('No user found - cannot add to cart');
      throw new Error('User must be logged in to add to cart');
    }
  
    try {
      console.log('🛒 ADD TO CART - User:', user.id, 'Product:', item.product.id);
      
      // First check if item already exists with the same attributes
      const { data: existingItems, error: checkError } = await supabase
        .from('cart')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', item.product.id)
        .eq('size', item.size || null)
        .eq('cooked', item.cooked || false);
  
      if (checkError) {
        console.error('Error checking existing cart items:', checkError);
        throw checkError;
      }
  
      if (existingItems && existingItems.length > 0) {
        // Update existing item
        const { error } = await supabase
          .from('cart')
          .update({ 
            quantity: existingItems[0].quantity + item.quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItems[0].id);
  
        if (error) {
          console.error('Error updating cart item:', error);
          throw error;
        }
        console.log('🛒 ADD TO CART - Updated existing item');
      } else {
        // Insert new item
        const { error } = await supabase
          .from('cart')
          .insert({
            user_id: user.id,
            product_id: item.product.id,
            quantity: item.quantity,
            size: item.size || null,
            cooked: item.cooked || false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
  
        if (error) {
          console.error('Error inserting cart item:', error);
          throw error;
        }
        console.log('🛒 ADD TO CART - Inserted new item');
      }
  
      // Force reload cart data with a small delay to ensure DB consistency
      setTimeout(async () => {
        await loadCartData(user.id);
      }, 200);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }, [user, loadCartData]);

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

      await loadCartData(user.id);
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  }, [user, loadCartData]);

  const removeFromCart = useCallback(async (cartItemId: string) => {
    if (!user) return;

    try {
      await supabase.from('cart').delete().eq('id', cartItemId);
      await loadCartData(user.id);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  }, [user, loadCartData]);

  const clearCart = useCallback(async () => {
    if (!user) return;

    try {
      await supabase.from('cart').delete().eq('user_id', user.id);
      setCart([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }, [user]);

  // contexts/AppContext.tsx - FIXED createOrder function

  const createOrder = useCallback(async () => {
    if (!user || cart.length === 0) {
      console.error('Cannot create order: No user or empty cart');
      throw new Error('Cannot create order with empty cart');
    }

    try {
      const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
      const orderNumber = `ORD-${Date.now()}`;
      const total = cartTotal + 2; // Including delivery fee

      // Create order with 'ongoing' status instead of 'pending'
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          total: total,
          delivery_fee: 2.00,
          status: 'ongoing', // FIXED: Changed from 'pending' to 'ongoing'
          address_id: selectedAddress?.id || null,
          payment_method_id: selectedPaymentMethod?.id || null,
          courier_name: 'Ahmed Fadhel', // FIXED: Add default courier
          courier_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', // FIXED: Add default avatar
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items with proper structure
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.product.id,
        quantity: item.quantity,
        size: item.size || null,
        cooked: item.cooked || false,
        price: item.product.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      await clearCart();

      // Reload user data to get updated orders
      await loadUserData(user.id);

      return orderNumber;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }, [user, cart, selectedAddress, selectedPaymentMethod, clearCart]);

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
          expiry_date: method.expiryDate,
          is_default: paymentMethods.length === 0,
        })
        .select()
        .single();

      if (error) throw error;

      await loadUserData(user.id);
      return data;
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
      error,
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
      createOrder,
      cancelOrder,
      addAddress,
      updateAddress,
      deleteAddress,
      setSelectedAddress,
      addPaymentMethod,
      deletePaymentMethod,
      setSelectedPaymentMethod,
      toggleFavorite,
      refreshCart,
      loadUserData,
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
      error,
      completeOnboarding,
      login,
      signup,
      logout,
      updateUser,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
      createOrder,
      cancelOrder,
      addAddress,
      updateAddress,
      deleteAddress,
      addPaymentMethod,
      deletePaymentMethod,
      toggleFavorite,
      refreshCart,
    ]
  );
});