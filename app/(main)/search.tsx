import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
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
import { ChevronLeft, Search as SearchIcon, SlidersHorizontal, X, Star } from 'lucide-react-native';
import { Image } from 'expo-image';
import colors from '@/constants/colors';
import { useProducts } from '@/hooks/useProducts';

type Cuisine = 'Tunisian' | 'French' | 'Italian' | 'American' | 'Seafood';
type MealType = 'Breakfast' | 'Lunch' | 'Dinner';
type DeliverTime = '10-15 min' | '20-30 min' | '30-45 min';

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { data: products } = useProducts();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [selectedCuisine, setSelectedCuisine] = useState<Cuisine | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const [selectedDeliverTime, setSelectedDeliverTime] = useState<DeliverTime | null>(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50 });
  const [selectedRating, setSelectedRating] = useState<number>(0);

  const cuisines: Cuisine[] = ['Tunisian', 'French', 'Italian', 'American', 'Seafood'];
  const mealTypes: MealType[] = ['Breakfast', 'Lunch', 'Dinner'];
  const deliverTimes: DeliverTime[] = ['10-15 min', '20-30 min', '30-45 min'];

  useEffect(() => {
    if (params.category && typeof params.category === 'string') {
      setSelectedCuisine(params.category as Cuisine);
    }
  }, [params.category]);

  const filteredProducts = products?.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = !selectedCuisine || product.category === selectedCuisine;
    const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
    const matchesRating = selectedRating === 0 || product.rating >= selectedRating;
    
    // Filter by delivery time (based on cookTime)
    let matchesDeliveryTime = true;
    if (selectedDeliverTime) {
      if (selectedDeliverTime === '10-15 min') {
        matchesDeliveryTime = product.cookTime <= 15;
      } else if (selectedDeliverTime === '20-30 min') {
        matchesDeliveryTime = product.cookTime > 15 && product.cookTime <= 30;
      } else if (selectedDeliverTime === '30-45 min') {
        matchesDeliveryTime = product.cookTime > 30;
      }
    }
    
    return matchesSearch && matchesCuisine && matchesPrice && matchesRating && matchesDeliveryTime;
  }) || [];

  const resetFilters = () => {
    setSelectedCuisine(null);
    setSelectedMealType(null);
    setSelectedDeliverTime(null);
    setPriceRange({ min: 0, max: 50 });
    setSelectedRating(0);
    setSearchQuery('');
  };

  const activeFiltersCount = [
    selectedCuisine,
    selectedMealType,
    selectedDeliverTime,
    selectedRating > 0 ? selectedRating : null,
  ].filter(Boolean).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedCuisine ? `${selectedCuisine} DISHES` : 'PRODUCTS'}
        </Text>
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
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={colors.mediumGray} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <SlidersHorizontal size={20} color={colors.white} />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {activeFiltersCount > 0 && (
        <View style={styles.activeFiltersBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedCuisine && (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterText}>{selectedCuisine}</Text>
                <TouchableOpacity onPress={() => setSelectedCuisine(null)}>
                  <X size={14} color={colors.white} />
                </TouchableOpacity>
              </View>
            )}
            {selectedDeliverTime && (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterText}>{selectedDeliverTime}</Text>
                <TouchableOpacity onPress={() => setSelectedDeliverTime(null)}>
                  <X size={14} color={colors.white} />
                </TouchableOpacity>
              </View>
            )}
            {selectedRating > 0 && (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterText}>{selectedRating}★+</Text>
                <TouchableOpacity onPress={() => setSelectedRating(0)}>
                  <X size={14} color={colors.white} />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
          <TouchableOpacity onPress={resetFilters} style={styles.clearAllButton}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <View style={styles.resultsHeader}>
          <Text style={styles.sectionTitle}>
            {filteredProducts.length} Results
          </Text>
        </View>

        <View style={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() => router.push(`/product/${product.id}` as never)}
            >
              <Image source={{ uri: product.image }} style={styles.productImage} contentFit="cover" />
              <View style={styles.ratingBadge}>
                <Star size={12} color={colors.yellow} fill={colors.yellow} />
                <Text style={styles.ratingText}>{product.rating}</Text>
              </View>
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

        {filteredProducts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
            <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
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
                <X size={24} color={colors.textDark} />
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
                <Text style={styles.filterLabel}>MINIMUM RATING</Text>
                <View style={styles.ratingOptions}>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <TouchableOpacity
                      key={rating}
                      style={[
                        styles.ratingOption,
                        selectedRating >= rating && styles.ratingOptionActive,
                      ]}
                      onPress={() => setSelectedRating(rating === selectedRating ? 0 : rating)}
                    >
                      <Star
                        size={24}
                        color={selectedRating >= rating ? colors.white : colors.yellow}
                        fill={selectedRating >= rating ? colors.white : colors.yellow}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                {selectedRating > 0 && (
                  <Text style={styles.ratingHelpText}>
                    Showing items with {selectedRating}★ rating and above
                  </Text>
                )}
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>PRICE RANGE</Text>
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

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.resetFiltersButton} onPress={resetFilters}>
                  <Text style={styles.resetFiltersText}>Reset All</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.applyButton} onPress={() => setShowFilters(false)}>
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
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
    marginBottom: 16,
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
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700' as const,
  },
  activeFiltersBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 12,
    alignItems: 'center',
    gap: 12,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  activeFilterText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.white,
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultsHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.textDark,
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
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 120,
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.textDark,
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
  emptyState: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.textDark,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  resetButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
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
  ratingOptions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  ratingOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ratingOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  ratingHelpText: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 12,
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
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  resetFiltersButton: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  resetFiltersText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.textDark,
  },
  applyButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.white,
  },
});