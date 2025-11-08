import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Search as SearchIcon, SlidersHorizontal } from 'lucide-react-native';
import { Image } from 'expo-image';
import colors from '@/constants/colors';
import { products } from '@/mocks/data';

type Cuisine = 'Tunisian' | 'French' | 'Italian' | 'American' | 'Seafood';
type MealType = 'Breakfast' | 'Lunch' | 'Dinner';
type DeliverTime = '10-15 min' | '60 min' | '120 min';

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [selectedCuisine, setSelectedCuisine] = useState<Cuisine | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const [selectedDeliverTime, setSelectedDeliverTime] = useState<DeliverTime | null>(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50 });
  const [selectedRating, setSelectedRating] = useState<number>(0);

  const cuisines: Cuisine[] = ['Tunisian', 'French', 'Italian', 'American', 'Seafood'];
  const mealTypes: MealType[] = ['Breakfast', 'Lunch', 'Dinner'];
  const deliverTimes: DeliverTime[] = ['10-15 min', '60 min', '120 min'];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = !selectedCuisine || product.category === selectedCuisine;
    const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
    const matchesRating = selectedRating === 0 || product.rating >= selectedRating;
    return matchesSearch && matchesCuisine && matchesPrice && matchesRating;
  });

  const resetFilters = () => {
    setSelectedCuisine(null);
    setSelectedMealType(null);
    setSelectedDeliverTime(null);
    setPriceRange({ min: 0, max: 50 });
    setSelectedRating(0);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PRODUCTS</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <SearchIcon size={20} color={colors.mediumGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search dishes"
            placeholderTextColor={colors.mediumGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <SlidersHorizontal size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <Text style={styles.sectionTitle}>Our Food Kits</Text>

        <View style={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() => router.push(`/product/${product.id}` as never)}
            >
              <Image source={{ uri: product.image }} style={styles.productImage} contentFit="cover" />
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>
                  {product.name}
                </Text>
                <View style={styles.productFooter}>
                  <Text style={styles.productPrice}>{product.price} DT</Text>
                  <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showFilters}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter your search</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>CUISINE</Text>
                <View style={styles.filterOptions}>
                  {cuisines.map((cuisine) => (
                    <TouchableOpacity
                      key={cuisine}
                      style={[
                        styles.filterOption,
                        selectedCuisine === cuisine && styles.filterOptionActive,
                      ]}
                      onPress={() => setSelectedCuisine(cuisine === selectedCuisine ? null : cuisine)}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedCuisine === cuisine && styles.filterOptionTextActive,
                        ]}
                      >
                        {cuisine}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>MEALTYPE</Text>
                <View style={styles.filterOptions}>
                  {mealTypes.map((mealType) => (
                    <TouchableOpacity
                      key={mealType}
                      style={[
                        styles.filterOption,
                        selectedMealType === mealType && styles.filterOptionActive,
                      ]}
                      onPress={() => setSelectedMealType(mealType === selectedMealType ? null : mealType)}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedMealType === mealType && styles.filterOptionTextActive,
                        ]}
                      >
                        {mealType}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>DELIVER TIME</Text>
                <View style={styles.filterOptions}>
                  {deliverTimes.map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.filterOption,
                        selectedDeliverTime === time && styles.filterOptionActive,
                      ]}
                      onPress={() => setSelectedDeliverTime(time === selectedDeliverTime ? null : time)}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedDeliverTime === time && styles.filterOptionTextActive,
                        ]}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>PRICING</Text>
                <View style={styles.priceRangeContainer}>
                  <View style={styles.priceRangeBar}>
                    <View
                      style={[
                        styles.priceRangeFill,
                        {
                          width: `${((priceRange.max - priceRange.min) / 50) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.priceLabels}>
                    <Text style={styles.priceLabel}>{priceRange.min} DT</Text>
                    <Text style={styles.priceLabel}>{priceRange.max} DT</Text>
                  </View>
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>RATING</Text>
                <View style={styles.ratingOptions}>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <TouchableOpacity
                      key={rating}
                      style={styles.ratingOption}
                      onPress={() => setSelectedRating(rating === selectedRating ? 0 : rating)}
                    >
                      <Text
                        style={[
                          styles.ratingStar,
                          rating <= selectedRating && styles.ratingStarActive,
                        ]}
                      >
                        ★
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.filterButton2} onPress={() => setShowFilters(false)}>
                <Text style={styles.filterButtonText}>FILTER</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textDark,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.darkNavy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.textDark,
    marginBottom: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  productCard: {
    width: '47%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 120,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textDark,
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.textDark,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 20,
    color: colors.white,
    fontWeight: '700' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(107, 142, 168, 0.8)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.textDark,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.textDark,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.textDark,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: colors.lightGray,
  },
  filterOptionActive: {
    backgroundColor: colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textDark,
  },
  filterOptionTextActive: {
    color: colors.white,
  },
  priceRangeContainer: {
    paddingVertical: 8,
  },
  priceRangeBar: {
    height: 6,
    backgroundColor: colors.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  priceRangeFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  priceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 12,
    color: colors.textDark,
    fontWeight: '600' as const,
  },
  ratingOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  ratingOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingStar: {
    fontSize: 24,
    color: colors.lightGray,
  },
  ratingStarActive: {
    color: colors.primary,
  },
  filterButton2: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.white,
    letterSpacing: 0.5,
  },
});
