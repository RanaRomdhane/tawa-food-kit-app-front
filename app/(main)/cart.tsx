import { useRouter } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, X } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useApp } from '@/contexts/AppContext';
import colors from '@/constants/colors';

export default function Cart() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cart, updateCartItem, removeFromCart, cartTotal, selectedAddress } = useApp();

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
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {cart.map((item, index) => (
          <View key={`${item.product.id}-${index}`} style={styles.cartItem}>
            <Image
              source={{ uri: item.product.image }}
              style={styles.itemImage}
              contentFit="cover"
            />

            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.product.name}</Text>
              <Text style={styles.itemPrice}>{item.product.price} DT</Text>
              {item.size && <Text style={styles.itemMeta}>Size: {item.size}</Text>}

              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateCartItem(index, item.quantity - 1)}
                >
                  <Text style={styles.quantityButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateCartItem(index, item.quantity + 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeFromCart(index)}
            >
              <X size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        ))}

        {cart.length === 0 && (
          <View style={styles.emptyCart}>
            <Text style={styles.emptyText}>Your cart is empty</Text>
          </View>
        )}
      </ScrollView>

      {cart.length > 0 && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.addressSection}>
            <Text style={styles.addressLabel}>DELIVERY ADDRESS</Text>
            <View style={styles.addressRow}>
              <Text style={styles.addressText}>{selectedAddress?.fullAddress || 'Borj Baccouche, Ariana'}</Text>
              <TouchableOpacity>
                <Text style={styles.editText}>EDIT</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL:</Text>
              <Text style={styles.totalValue}>{cartTotal} DT</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.breakdownLink}>Breakdown &gt;</Text>
            </TouchableOpacity>
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
  },
  itemMeta: {
    fontSize: 12,
    color: colors.mediumGray,
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
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.mediumGray,
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
  addressLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textLight,
    marginBottom: 8,
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
  },
  editText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700' as const,
    marginLeft: 12,
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
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textLight,
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.textDark,
  },
  breakdownLink: {
    fontSize: 14,
    color: colors.primary,
    textAlign: 'right',
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
