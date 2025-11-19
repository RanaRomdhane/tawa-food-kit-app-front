import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Animated,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, ShoppingBag, User, Mic, X, Clock, TrendingUp, Award } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { Image } from 'expo-image';
import { useApp } from '@/contexts/AppContext';
import { useProducts } from '@/hooks/useProducts';
import colors from '@/constants/colors';

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, selectedAddress, cart } = useApp();
  const { data: products, isLoading, error } = useProducts();
  const [showMicModal, setShowMicModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const pulseAnim = useState(new Animated.Value(1))[0];

  const featuredProducts = products?.slice(0, 4) || [];

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) return;

      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      }

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      
      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });
      }

      setIsRecording(false);
      setRecording(null);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      setShowMicModal(false);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const handleMicPress = () => {
    setShowMicModal(true);
    setTimeout(() => {
      startRecording();
    }, 300);
  };

  const handleCloseMic = () => {
    if (isRecording) {
      stopRecording();
    } else {
      setShowMicModal(false);
    }
  };

  const categories = React.useMemo(() => {
    if (!products) return [];
    const categoryMap = new Map<string, number>();
    products.forEach(p => {
      categoryMap.set(p.category, (categoryMap.get(p.category) || 0) + 1);
    });
    return Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count }));
  }, [products]);

  const handleCategoryPress = (categoryName: string) => {
    router.push({
      pathname: '/search',
      params: { category: categoryName }
    } as never);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/profile' as never)}>
          <User size={24} color={colors.textDark} />
        </TouchableOpacity>

        <View style={styles.deliverTo}>
          <Text style={styles.deliverLabel}>DELIVER TO</Text>
          <Text style={styles.location}>
            {selectedAddress?.label || 'Ariana'}
          </Text>
        </View>

        <TouchableOpacity onPress={() => router.push('/cart' as never)}>
          <View>
            <ShoppingBag size={24} color={colors.white} style={styles.cartIcon} />
            {cart.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cart.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>
            Hey {user?.name?.split(' ')[0] || 'there'},{' '}
            <Text style={styles.greetingBold}>Good Afternoon!</Text>
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => router.push('/search' as never)}
            activeOpacity={0.7}
          >
            <Search size={20} color={colors.mediumGray} />
            <Text style={styles.searchPlaceholder}>Search dishes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.micButton} onPress={handleMicPress}>
            <Mic size={20} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Quick Stats Cards - REDESIGNED */}
        <View style={styles.quickStatsContainer}>
          <View style={styles.statCardPrimary}>
            <View style={styles.statIconContainer}>
              <TrendingUp size={24} color={colors.white} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{products?.length || 0}</Text>
              <Text style={styles.statLabel}>Available Dishes</Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statCardSecondary}>
              <Award size={20} color={colors.primary} />
              <Text style={styles.statValueSmall}>4.8★</Text>
              <Text style={styles.statLabelSmall}>Avg Rating</Text>
            </View>
            
            <View style={styles.statCardSecondary}>
              <Clock size={20} color={colors.primary} />
              <Text style={styles.statValueSmall}>25-35</Text>
              <Text style={styles.statLabelSmall}>Minutes</Text>
            </View>
          </View>
        </View>

        {/* Featured Dishes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Dishes</Text>
            <TouchableOpacity onPress={() => router.push('/search' as never)}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.featuredScroll}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {featuredProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.featuredCard}
                  onPress={() => router.push(`/product/${product.id}` as never)}
                >
                  <Image 
                    source={{ uri: product.image }} 
                    style={styles.featuredImage} 
                    contentFit="cover" 
                  />
                  <View style={styles.featuredOverlay}>
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredBadgeText}>★ {product.rating}</Text>
                    </View>
                  </View>
                  <View style={styles.featuredInfo}>
                    <Text style={styles.featuredName} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <View style={styles.featuredFooter}>
                      <Text style={styles.featuredPrice}>{product.price} DT</Text>
                      <View style={styles.featuredTime}>
                        <Clock size={12} color={colors.textLight} />
                        <Text style={styles.featuredTimeText}>{product.cookTime}min</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Popular Categories */}
        {!isLoading && categories.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Categories</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesRow}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.name}
                  style={styles.categoryChip}
                  onPress={() => handleCategoryPress(category.name)}
                >
                  <Text style={styles.categoryChipEmoji}>
                    {category.name === 'Tunisian' ? '🇹🇳' : 
                     category.name === 'Italian' ? '🇮🇹' :
                     category.name === 'American' ? '🇺🇸' : 
                     category.name === 'Seafood' ? '🦞' : '🍽️'}
                  </Text>
                  <Text style={styles.categoryChipText}>{category.name}</Text>
                  <Text style={styles.categoryChipCount}>{category.count}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Why Choose Us - ELEGANT REDESIGN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Tawa?</Text>
          <View style={styles.whyChooseContainer}>
            <View style={styles.featureCard}>
              <View style={styles.featureIconLarge}>
                <Text style={styles.featureEmojiLarge}>🍳</Text>
              </View>
              <Text style={styles.featureTitleLarge}>Fresh Ingredients</Text>
              <Text style={styles.featureDescLarge}>
                All ingredients are fresh and locally sourced daily
              </Text>
            </View>

            <View style={styles.featureRow}>
              <View style={styles.featureCardSmall}>
                <View style={styles.featureIconSmall}>
                  <Text style={styles.featureEmojiSmall}>⚡</Text>
                </View>
                <Text style={styles.featureTitleSmall}>Fast Delivery</Text>
                <Text style={styles.featureDescSmall}>
                  25-35 min delivery
                </Text>
              </View>

              <View style={styles.featureCardSmall}>
                <View style={styles.featureIconSmall}>
                  <Text style={styles.featureEmojiSmall}>📖</Text>
                </View>
                <Text style={styles.featureTitleSmall}>Easy Recipes</Text>
                <Text style={styles.featureDescSmall}>
                  Step-by-step guide
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showMicModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseMic}
      >
        <View style={styles.micModalOverlay}>
          <View style={styles.micModalContent}>
            <TouchableOpacity style={styles.micCloseButton} onPress={handleCloseMic}>
              <X size={24} color={colors.textDark} />
            </TouchableOpacity>

            <Animated.View
              style={[
                styles.micCircle,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Mic size={48} color={colors.white} />
            </Animated.View>

            <Text style={styles.micText}>
              {isRecording ? 'Listening...' : 'Tap to start'}
            </Text>
            <Text style={styles.micSubtext}>
              Try saying "Show me Tunisian dishes"
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6B8EA8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  deliverTo: {
    alignItems: 'center',
  },
  deliverLabel: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  location: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '700' as const,
    marginTop: 2,
  },
  cartIcon: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.darkNavy,
  },
  cartBadge: {
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
  cartBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700' as const,
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
  },
  greeting: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 16,
    color: colors.textLight,
  },
  greetingBold: {
    color: colors.textDark,
    fontWeight: '700' as const,
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
    paddingVertical: 12,
    gap: 8,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: colors.mediumGray,
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickStatsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCardPrimary: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.white,
  },
  statLabel: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCardSecondary: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValueSmall: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.textDark,
    marginTop: 8,
  },
  statLabelSmall: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.textDark,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600' as const,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  featuredScroll: {
    marginLeft: 0,
  },
  featuredCard: {
    width: 180,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  featuredImage: {
    width: '100%',
    height: 140,
  },
  featuredOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  featuredBadge: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  featuredBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.textDark,
  },
  featuredInfo: {
    padding: 12,
  },
  featuredName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.textDark,
    marginBottom: 8,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredPrice: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  featuredTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredTimeText: {
    fontSize: 12,
    color: colors.textLight,
  },
  categoriesRow: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryChip: {
    backgroundColor: colors.lightGray,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minWidth: 100,
  },
  categoryChipEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.textDark,
    marginBottom: 4,
  },
  categoryChipCount: {
    fontSize: 11,
    color: colors.textLight,
  },
  whyChooseContainer: {
    paddingHorizontal: 20,
  },
  featureCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 12,
    alignItems: 'center',
  },
  featureIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureEmojiLarge: {
    fontSize: 32,
  },
  featureTitleLarge: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescLarge: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 20,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 12,
  },
  featureCardSmall: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  featureIconSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureEmojiSmall: {
    fontSize: 24,
  },
  featureTitleSmall: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.textDark,
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescSmall: {
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 16,
  },
  micModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micModalContent: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    width: 280,
  },
  micCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
  },
  micText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textDark,
    marginBottom: 8,
  },
  micSubtext: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
});