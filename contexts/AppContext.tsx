import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { User, Address, CartItem, PaymentMethod, Order } from '@/types';
import { mockOrders } from '@/mocks/data';

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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [
        onboardingComplete,
        authenticated,
        userData,
        addressesData,
        cartData,
        paymentMethodsData,
        ordersData,
      ] = await Promise.all([
        AsyncStorage.getItem('onboardingComplete'),
        AsyncStorage.getItem('authenticated'),
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('addresses'),
        AsyncStorage.getItem('cart'),
        AsyncStorage.getItem('paymentMethods'),
        AsyncStorage.getItem('orders'),
      ]);

      if (onboardingComplete) setHasCompletedOnboarding(true);
      if (authenticated) setIsAuthenticated(true);
      if (userData) setUser(JSON.parse(userData));
      if (addressesData) {
        const parsedAddresses = JSON.parse(addressesData);
        setAddresses(parsedAddresses);
        if (parsedAddresses.length > 0) setSelectedAddress(parsedAddresses[0]);
      }
      if (cartData) setCart(JSON.parse(cartData));
      if (paymentMethodsData) setPaymentMethods(JSON.parse(paymentMethodsData));
      if (ordersData) {
        setOrders(JSON.parse(ordersData));
      } else {
        setOrders(mockOrders);
        await AsyncStorage.setItem('orders', JSON.stringify(mockOrders));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const completeOnboarding = useCallback(async () => {
    setHasCompletedOnboarding(true);
    await AsyncStorage.setItem('onboardingComplete', 'true');
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const mockUser: User = {
      id: '1',
      name: 'Rana Romdhane',
      email,
      phone: '22 14 14 39',
      bio: 'I love fast food',
    };
    setUser(mockUser);
    setIsAuthenticated(true);
    await AsyncStorage.setItem('authenticated', 'true');
    await AsyncStorage.setItem('user', JSON.stringify(mockUser));
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setIsAuthenticated(false);
    await AsyncStorage.removeItem('authenticated');
    await AsyncStorage.removeItem('user');
  }, []);

  const addToCart = useCallback(async (item: CartItem) => {
    const existingIndex = cart.findIndex(
      (i) =>
        i.product.id === item.product.id &&
        i.size === item.size &&
        i.cooked === item.cooked
    );

    let newCart: CartItem[];
    if (existingIndex >= 0) {
      newCart = [...cart];
      newCart[existingIndex].quantity += item.quantity;
    } else {
      newCart = [...cart, item];
    }

    setCart(newCart);
    await AsyncStorage.setItem('cart', JSON.stringify(newCart));
  }, [cart]);

  const updateCartItem = useCallback(async (index: number, quantity: number) => {
    const newCart = [...cart];
    if (quantity <= 0) {
      newCart.splice(index, 1);
    } else {
      newCart[index].quantity = quantity;
    }
    setCart(newCart);
    await AsyncStorage.setItem('cart', JSON.stringify(newCart));
  }, [cart]);

  const removeFromCart = useCallback(async (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    await AsyncStorage.setItem('cart', JSON.stringify(newCart));
  }, [cart]);

  const clearCart = useCallback(async () => {
    setCart([]);
    await AsyncStorage.removeItem('cart');
  }, []);

  const addAddress = useCallback(async (address: Address) => {
    const newAddresses = [...addresses, address];
    setAddresses(newAddresses);
    if (!selectedAddress) setSelectedAddress(address);
    await AsyncStorage.setItem('addresses', JSON.stringify(newAddresses));
  }, [addresses, selectedAddress]);

  const updateAddress = useCallback(async (id: string, address: Address) => {
    const newAddresses = addresses.map((a) => (a.id === id ? address : a));
    setAddresses(newAddresses);
    if (selectedAddress?.id === id) setSelectedAddress(address);
    await AsyncStorage.setItem('addresses', JSON.stringify(newAddresses));
  }, [addresses, selectedAddress]);

  const deleteAddress = useCallback(async (id: string) => {
    const newAddresses = addresses.filter((a) => a.id !== id);
    setAddresses(newAddresses);
    if (selectedAddress?.id === id) {
      setSelectedAddress(newAddresses.length > 0 ? newAddresses[0] : null);
    }
    await AsyncStorage.setItem('addresses', JSON.stringify(newAddresses));
  }, [addresses, selectedAddress]);

  const addPaymentMethod = useCallback(async (method: PaymentMethod) => {
    const newMethods = [...paymentMethods, method];
    setPaymentMethods(newMethods);
    if (!selectedPaymentMethod) setSelectedPaymentMethod(method);
    await AsyncStorage.setItem('paymentMethods', JSON.stringify(newMethods));
  }, [paymentMethods, selectedPaymentMethod]);

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
    completeOnboarding,
    login,
    logout,
    setUser,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    addAddress,
    updateAddress,
    deleteAddress,
    setSelectedAddress,
    addPaymentMethod,
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
      completeOnboarding,
      login,
      logout,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
      addAddress,
      updateAddress,
      deleteAddress,
      addPaymentMethod,
    ]
  );
});
