import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,

} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Heart, Star, Clock, TrendingUp, Utensils } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useApp } from '@/contexts/AppContext';
import { products } from '@/mocks/data';
import colors from '@/constants/colors';

export default function ProductDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { addToCart } = useApp();

  const product = products.find((p) => p.id === id);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L'>('M');
  const [isCooked, setIsCooked] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!product) {
    return null;
  }

  const handleAddToCart = async () => {
    await addToCart({
      product,
      quantity,
      size: selectedSize,
      cooked: isCooked,
    });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.image} contentFit="cover" />

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.textDark} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.favoriteButton}>
          <Heart size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.productName}>{product.name}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Star size={16} color={colors.orange} fill={colors.orange} />
            <Text style={styles.metaText}>{product.rating}</Text>
          </View>

          <View style={styles.metaItem}>
            <TrendingUp size={16} color={colors.primary} />
            <Text style={styles.metaText}>{product.price} DT</Text>
          </View>

          <View style={styles.metaItem}>
            <Clock size={16} color={colors.primary} />
            <Text style={styles.metaText}>{product.cookTime} min</Text>
          </View>

          <View style={styles.metaItem}>
            <Utensils size={16} color={colors.primary} />
            <Text style={styles.metaText}>{product.servings} DT</Text>
          </View>
        </View>

        <Text style={styles.description}>{product.description}</Text>

        <View style={styles.optionsSection}>
          <Text style={styles.optionLabel}>SIZE:</Text>
          <View style={styles.optionsRow}>
            {(['S', 'M', 'L'] as const).map((size) => (
              <TouchableOpacity
                key={size}
                style={[styles.optionButton, selectedSize === size && styles.optionButtonActive]}
                onPress={() => setSelectedSize(size)}
              >
                <Text style={[styles.optionText, selectedSize === size && styles.optionTextActive]}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.optionsSection}>
          <Text style={styles.optionLabel}>COOKED:</Text>
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[styles.optionButton, isCooked && styles.optionButtonActive]}
              onPress={() => setIsCooked(true)}
            >
              <Text style={[styles.optionText, isCooked && styles.optionTextActive]}>YES</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, !isCooked && styles.optionButtonActive]}
              onPress={() => setIsCooked(false)}
            >
              <Text style={[styles.optionText, !isCooked && styles.optionTextActive]}>NO</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>{product.price * quantity} DT</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Text style={styles.addToCartText}>ADD TO CART</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.purchaseButton}>
            <Text style={styles.purchaseText}>PURCHASE</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showSuccess && (
        <View style={styles.successModal}>
          <View style={styles.successContent}>
            <Text style={styles.successTitle}>Added To{'\n'}Cart !</Text>
            <Text style={styles.successSubtitle}>you can review it in your chart</Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setShowSuccess(false);
                router.push('/cart' as never);
              }}
            >
              <Text style={styles.successButtonText}>GOT IT</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative' as const,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.textDark,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: colors.textDark,
    fontWeight: '600' as const,
  },
  description: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
    marginBottom: 24,
  },
  optionsSection: {
    marginBottom: 24,
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textDark,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
  },
  optionButtonActive: {
    backgroundColor: colors.primary,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textDark,
  },
  optionTextActive: {
    color: colors.white,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.lightGray,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.textDark,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkNavy,
    borderRadius: 20,
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  quantityButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    color: colors.white,
    fontWeight: '600' as const,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.white,
    minWidth: 20,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  addToCartText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  purchaseButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  purchaseText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  successModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  successContent: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  successSubtitle: {
    fontSize: 14,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 32,
  },
  successButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderWidth: 2,
    borderColor: colors.white,
  },
  successButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
});
