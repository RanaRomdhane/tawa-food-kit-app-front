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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, ShoppingBag, User, Mic, X } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { Image } from 'expo-image';
import { useApp } from '@/contexts/AppContext';
import { products, reviews } from '@/mocks/data';
import colors from '@/constants/colors';

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, selectedAddress, cart } = useApp();
  const [showMicModal, setShowMicModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const pulseAnim = useState(new Animated.Value(1))[0];

  const featuredProducts = products.slice(0, 3);

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
          <Text style={styles.location}>{selectedAddress?.label || 'Ariana'}</Text>
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
            Hey {user?.name?.split(' ')[0] || 'Rana'}, <Text style={styles.greetingBold}>Good Afternoon!</Text>
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
            <Text style={styles.sectionTitle}>All Categories</Text>
            <TouchableOpacity onPress={() => router.push('/search' as never)}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {featuredProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.categoryCard}
                onPress={() => router.push(`/product/${product.id}` as never)}
              >
                <Image source={{ uri: product.image }} style={styles.categoryImage} contentFit="cover" />
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={styles.categoryPrice}>Starting {product.price} DT</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews</Text>

          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <Image source={{ uri: review.user.avatar }} style={styles.reviewAvatar} contentFit="cover" />
              <View style={styles.reviewContent}>
                <Text style={styles.reviewName}>{review.user.name}</Text>
                <Text style={styles.reviewComment} numberOfLines={2}>
                  {review.comment}
                </Text>
              </View>
            </View>
          ))}
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
  reviewCard: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    marginBottom: 8,
    borderRadius: 12,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  reviewAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  reviewContent: {
    flex: 1,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textDark,
    marginBottom: 4,
  },
  reviewComment: {
    fontSize: 12,
    color: colors.textLight,
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
  },
});
