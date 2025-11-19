import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Star, ThumbsUp } from 'lucide-react-native';
import { Image } from 'expo-image';
import colors from '@/constants/colors';
import { Review } from '@/types';

// Mock reviews with like functionality
const mockReviews: Review[] = [
  {
    id: '1',
    user: {
      name: 'Rana Romdhane',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    },
    rating: 5,
    comment: 'I Absolutely Love This App!',
    date: '2023-10-01',
    likes: 24,
    likedByUser: false,
  },
  {
    id: '2',
    user: {
      name: 'Oulimata Sall',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    },
    rating: 5,
    comment: 'I Like The Concept Of The App, And The Interface Is User-Friendly.',
    date: '2023-10-02',
    likes: 18,
    likedByUser: false,
  },
  {
    id: '3',
    user: {
      name: 'Maha Romdhane',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200',
    },
    rating: 5,
    comment: "I've Been Using This App For A Few Months Now, And I Have To Say It's One Of The Most Reliable",
    date: '2023-10-03',
    likes: 32,
    likedByUser: false,
  },
  {
    id: '4',
    user: {
      name: 'Ahmed Hassan',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    },
    rating: 4,
    comment: 'Great selection of meal kits. Delivery is always on time!',
    date: '2023-10-04',
    likes: 15,
    likedByUser: false,
  },
  {
    id: '5',
    user: {
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    },
    rating: 4,
    comment: 'Love the variety of cuisines available. Would recommend!',
    date: '2023-10-05',
    likes: 21,
    likedByUser: false,
  },
];

export default function UserReviews() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<'all' | number>('all');
  const [reviews, setReviews] = useState<Review[]>(mockReviews);

  const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter(r => r.rating === filter);

  const averageRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

  const handleLikeReview = async (reviewId: string) => {
    setReviews(prevReviews =>
      prevReviews.map(review => {
        if (review.id === reviewId) {
          const isLiked = review.likedByUser;
          return {
            ...review,
            likes: isLiked ? (review.likes || 0) - 1 : (review.likes || 0) + 1,
            likedByUser: !isLiked,
          };
        }
        return review;
      })
    );

    // Here you would normally save to database
    // await supabase.from('review_likes').upsert({ review_id: reviewId, user_id: userId })
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={16}
        color={i < rating ? colors.yellow : colors.lightGray}
        fill={i < rating ? colors.yellow : colors.lightGray}
      />
    ));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Reviews</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsSection}>
          <View style={styles.ratingCard}>
            <Text style={styles.ratingValue}>{averageRating}</Text>
            <View style={styles.starsRow}>{renderStars(5)}</View>
            <Text style={styles.ratingCount}>Based on {reviews.length} reviews</Text>
          </View>
        </View>

        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            <TouchableOpacity
              style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {[5, 4, 3, 2, 1].map((rating) => (
              <TouchableOpacity
                key={rating}
                style={[styles.filterChip, filter === rating && styles.filterChipActive]}
                onPress={() => setFilter(rating)}
              >
                <Star
                  size={14}
                  color={filter === rating ? colors.white : colors.yellow}
                  fill={filter === rating ? colors.white : colors.yellow}
                />
                <Text style={[styles.filterText, filter === rating && styles.filterTextActive]}>
                  {rating}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.reviewsList}>
          {filteredReviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Image
                  source={{ uri: review.user.avatar }}
                  style={styles.avatar}
                  contentFit="cover"
                />
                <View style={styles.reviewHeaderInfo}>
                  <Text style={styles.reviewerName}>{review.user.name}</Text>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
                <TouchableOpacity 
                  style={[
                    styles.likeButton,
                    review.likedByUser && styles.likeButtonActive
                  ]}
                  onPress={() => handleLikeReview(review.id)}
                >
                  <ThumbsUp 
                    size={18} 
                    color={review.likedByUser ? colors.white : colors.primary}
                    fill={review.likedByUser ? colors.white : 'transparent'}
                  />
                  {review.likes && review.likes > 0 && (
                    <Text style={[
                      styles.likeCount,
                      review.likedByUser && styles.likeCountActive
                    ]}>
                      {review.likes}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
              <View style={styles.ratingRow}>{renderStars(review.rating)}</View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}
        </View>

        {filteredReviews.length === 0 && (
          <View style={styles.emptyState}>
            <Star size={64} color={colors.lightGray} />
            <Text style={styles.emptyText}>No reviews with this rating yet</Text>
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
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  ratingCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    width: '100%',
  },
  ratingValue: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: colors.textDark,
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  ratingCount: {
    fontSize: 14,
    color: colors.textLight,
  },
  filterSection: {
    marginBottom: 20,
  },
  filters: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textDark,
  },
  filterTextActive: {
    color: colors.white,
  },
  reviewsList: {
    paddingHorizontal: 20,
  },
  reviewCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  reviewHeaderInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.textDark,
  },
  reviewDate: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  likeButtonActive: {
    backgroundColor: colors.primary,
  },
  likeCount: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  likeCountActive: {
    color: colors.white,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  reviewComment: {
    fontSize: 14,
    color: colors.textDark,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 16,
  },
});