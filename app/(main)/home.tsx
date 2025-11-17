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
import { Search, ShoppingBag, User, Mic, X } from 'lucide-react-native';
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

  const featuredProducts = products?.slice(0, 3) || [];

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        console.log('Permission to access microphone was denied');
        return;
      }

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
      console.log('Recording stopped');
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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Dishes</Text>
            <TouchableOpacity onPress={() => router.push('/search' as never)}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading delicious meals...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load products</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => window.location.reload()}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : featuredProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products available yet</Text>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.categoriesScroll}
            >
              {featuredProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.categoryCard}
                  onPress={() => router.push(`/product/${product.id}` as never)}
                >
                  <Image 
                    source={{ uri: product.image }} 
                    style={styles.categoryImage} 
                    contentFit="cover" 
                  />
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={styles.categoryPrice}>
                      Starting {product.price} DT
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Popular Categories Section */}
        {!isLoading && products && products.length > 3 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Categories</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesRow}
            >
              {['Tunisian', 'Italian', 'American', 'Seafood'].map((category) => {
                const categoryProducts = products.filter(p => p.category === category);
                if (categoryProducts.length === 0) return null;
                
                return (
                  <TouchableOpacity
                    key={category}
                    style={styles.categoryBadge}
                    onPress={() => router.push('/search' as never)}
                  >
                    <Text style={styles.categoryBadgeText}>{category}</Text>
                    <Text style={styles.categoryBadgeCount}>
                      {categoryProducts.length} items
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Quick Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{products?.length || 0}</Text>
            <Text style={styles.statLabel}>Available Dishes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>4.8★</Text>
            <Text style={styles.statLabel}>Average Rating</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>20-45min</Text>
            <Text style={styles.statLabel}>Delivery Time</Text>
          </View>
        </View>

        {/* Why Choose Us Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Tawa?</Text>
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>🍳</Text>
              </View>
              <Text style={styles.featureTitle}>Fresh Ingredients</Text>
              <Text style={styles.featureDesc}>
                All ingredients are fresh and locally sourced
              </Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>⚡</Text>
              </View>
              <Text style={styles.featureTitle}>Fast Delivery</Text>
              <Text style={styles.featureDesc}>
                Get your meal kits delivered in 20-45 minutes
              </Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>📖</Text>
              </View>
              <Text style={styles.featureTitle}>Easy Recipes</Text>
              <Text style={styles.featureDesc}>
                Step-by-step instructions for perfect meals
              </Text>
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
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textLight,
  },
  errorContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
  },
  categoriesScroll: {
    paddingLeft: 20,
  },
  categoryCard: {
    width: 140,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryImage: {
    width: '100%',
    height: 120,
  },
  categoryInfo: {
    padding: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textDark,
    marginBottom: 4,
  },
  categoryPrice: {
    fontSize: 12,
    color: colors.textLight,
  },
  categoriesRow: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryBadge: {
    backgroundColor: colors.lightBlue,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  categoryBadgeText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.textDark,
    marginBottom: 4,
  },
  categoryBadgeCount: {
    fontSize: 12,
    color: colors.textLight,
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'center',
  },
  featuresContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.textDark,
    marginBottom: 2,
    flex: 1,
  },
  featureDesc: {
    fontSize: 12,
    color: colors.textLight,
    lineHeight: 16,
    flex: 1,
    position: 'absolute',
    left: 76,
    right: 16,
    top: 34,
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