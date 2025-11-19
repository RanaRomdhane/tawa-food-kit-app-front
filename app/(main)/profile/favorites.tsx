import { useRouter } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Heart, Star } from 'lucide-react-native';
import { Image } from 'expo-image';
import colors from '@/constants/colors';
import { useProducts } from '@/hooks/useProducts';
import { useApp } from '@/contexts/AppContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

export default function Favorites() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: products } = useProducts();
  const { favorites, toggleFavorite, addToCart } = useApp();

  const favoriteProducts = products?.filter(p => favorites.includes(p.id)) || [];

  const handleToggleFavorite = async (productId: string) => {
    await toggleFavorite(productId);
  };

  const handleAddToCart = async (product: any) => {
    await addToCart({
      product,
      quantity: 1,
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favourites</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {favoriteProducts.length > 0 ? (
          <View style={styles.grid}>
            {favoriteProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.card}
                onPress={() => router.push(`/product/${product.id}` as never)}
              >
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: product.image }}
                    style={styles.image}
                    contentFit="cover"
                  />
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => handleToggleFavorite(product.id)}
                  >
                    <Heart size={18} color={colors.red} fill={colors.red} />
                  </TouchableOpacity>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <View style={styles.ratingRow}>
                    <Star size={14} color={colors.yellow} fill={colors.yellow} />
                    <Text style={styles.rating}>{product.rating}</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>{product.price} DT</Text>
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={() => handleAddToCart(product)}
                    >
                      <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Heart size={64} color={colors.lightGray} />
            <Text style={styles.emptyTitle}>No Favourites Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start adding your favorite items by tapping the heart icon!
            </Text>
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => router.push('/search' as never)}
            >
              <Text style={styles.browseButtonText}>Browse Products</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.textDark,
  },
  content: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: CARD_WIDTH,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.textDark,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  rating: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600' as const,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.textDark,
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
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
});