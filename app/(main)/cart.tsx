import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, X, MapPin } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useApp } from '@/contexts/AppContext';
import colors from '@/constants/colors';

export default function Cart() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { 
    cart, 
    updateCartItem, 
    removeFromCart, 
    cartTotal, 
    selectedAddress, 
    refreshCart 
  } = useApp();

  // Refresh cart when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 CART - Screen focused, refreshing cart');
      refreshCart();
    }, [refreshCart])
  );

  const handleUpdateQuantity = async (cartItemId: string, currentQuantity: number, newQuantity: number) => {
    if (newQuantity < 1) {
      Alert.alert(
        'Remove Item',
        'Do you want to remove this item from cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => removeFromCart(cartItemId),
          },
        ]
      );
      return;
    }
    await updateCartItem(cartItemId, newQuantity);
  };

  const handleRemove = (cartItemId: string, productName: string) => {
    Alert.alert(
      'Remove Item',
      `Are you sure you want to remove "${productName}" from cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromCart(cartItemId),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ 
          paddingBottom: insets.bottom + 20,
          flexGrow: cart.length === 0 ? 1 : 0 
        }}
        showsVerticalScrollIndicator={false}
      >
        {cart.map((item, index) => (
          <View key={`${item.id}-${index}`} style={styles.cartItem}>
            <Image
              source={{ uri: item.product.image }}
              style={styles.itemImage}
              contentFit="cover"
            />

            <View style={styles.itemDetails}>
              <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
              <Text style={styles.itemPrice}>{item.product.price} DT</Text>
              
              <View style={styles.itemMetaContainer}>
                {item.size && (
                  <Text style={styles.itemMeta}>Size: {item.size}</Text>
                )}
                {item.cooked && (
                  <Text style={styles.itemMeta}>Cooked (+2 DT)</Text>
                )}
              </View>

              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => item.id && handleUpdateQuantity(item.id, item.quantity, item.quantity - 1)}
                >
                  <Text style={styles.quantityButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => item.id && handleUpdateQuantity(item.id, item.quantity, item.quantity + 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => item.id && handleRemove(item.id, item.product.name)}
            >
              <X size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        ))}

        {cart.length === 0 && (
          <View style={styles.emptyCart}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <Text style={styles.emptySubtext}>Add some delicious meal kits!</Text>
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => router.push('/search' as never)}
            >
              <Text style={styles.browseButtonText}>Browse Products</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {cart.length > 0 && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.addressSection}>
            <View style={styles.addressHeader}>
              <MapPin size={16} color={colors.primary} />
              <Text style={styles.addressLabel}>DELIVERY ADDRESS</Text>
            </View>
            <View style={styles.addressRow}>
              <Text style={styles.addressText} numberOfLines={2}>
                {selectedAddress?.fullAddress || 'Borj Baccouche, Ariana'}
              </Text>
              <TouchableOpacity onPress={() => router.push('/my-address' as never)}>
                <Text style={styles.editText}>EDIT</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>{cartTotal.toFixed(2)} DT</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Delivery:</Text>
              <Text style={styles.totalValue}>2.00 DT</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabelBold}>TOTAL:</Text>
              <Text style={styles.totalValueBold}>{(cartTotal + 2).toFixed(2)} DT</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.placeOrderButton}
            onPress={() => router.push('/payment' as never)}
          >
            <Text style={styles.placeOrderText}>PLACE ORDER</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkNavy,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.white,
  },
  content: {
    flex: 1,
    backgroundColor: colors.darkNavy,
    paddingHorizontal: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.white,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.white,
    marginBottom: 4,
  },
  itemMetaContainer: {
    marginBottom: 8,
  },
  itemMeta: {
    fontSize: 12,
    color: colors.mediumGray,
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkBlue,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quantityButton: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600' as const,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.white,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.white,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.mediumGray,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  browseButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  footer: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  addressSection: {
    marginBottom: 20,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textLight,
    letterSpacing: 0.5,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: colors.textDark,
    marginRight: 12,
  },
  editText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700' as const,
  },
  totalSection: {
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textDark,
  },
  divider: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginVertical: 8,
  },
  totalLabelBold: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textLight,
    letterSpacing: 0.5,
  },
  totalValueBold: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.textDark,
  },
  placeOrderButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  placeOrderText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
});