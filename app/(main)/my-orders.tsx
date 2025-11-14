import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Star } from 'lucide-react-native';
import { Image } from 'expo-image';
import colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

type Tab = 'ongoing' | 'history';

export default function MyOrders() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orders, addToCart } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('ongoing');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const ongoingOrders = orders?.filter((order) => order.status === 'ongoing') || [];
  const historyOrders = orders?.filter((order) => order.status !== 'ongoing') || [];

  const displayOrders = activeTab === 'ongoing' ? ongoingOrders : historyOrders;

  const foodOrders = displayOrders.filter((order) => 
    order.items.some((item) => item.product.category !== 'Drink')
  );

  const drinkOrders = displayOrders.filter((order) =>
    order.items.every((item) => item.product.category === 'Drink')
  );

  const handleCancelOrder = (orderId: string) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Order Cancelled', 'Your order has been cancelled successfully.');
          },
        },
      ]
    );
  };

  const handleRateOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setRating(0);
    setReview('');
    setShowRatingModal(true);
  };

  const submitRating = () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting.');
      return;
    }

    Alert.alert(
      'Thank You!',
      `Your ${rating}-star rating has been submitted successfully.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setShowRatingModal(false);
            setSelectedOrderId(null);
            setRating(0);
            setReview('');
          },
        },
      ]
    );
  };

  const handleReorder = async (order: typeof orders[0]) => {
    for (const item of order.items) {
      await addToCart(item);
    }
    Alert.alert(
      'Added to Cart',
      'All items from this order have been added to your cart.',
      [
        {
          text: 'View Cart',
          onPress: () => router.push('/cart' as never),
        },
        {
          text: 'OK',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ongoing' && styles.tabActive]}
          onPress={() => setActiveTab('ongoing')}
        >
          <Text style={[styles.tabText, activeTab === 'ongoing' && styles.tabTextActive]}>
            Ongoing
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {foodOrders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Food</Text>
            {foodOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Image
                    source={{ uri: order.items[0].product.image }}
                    style={styles.orderImage}
                    contentFit="cover"
                  />
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderName}>{order.items[0].product.name}</Text>
                    <View style={styles.orderDetails}>
                      <Text style={styles.orderPrice}>{order.total} DT</Text>
                      <Text style={styles.orderSeparator}>•</Text>
                      <Text style={styles.orderItems}>
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)}{' '}
                        {order.items.reduce((sum, item) => sum + item.quantity, 0) === 1
                          ? 'Item'
                          : 'Items'}
                      </Text>
                    </View>
                    {activeTab === 'history' && (
                      <Text style={styles.orderNumber}>#{order.id}</Text>
                    )}
                  </View>
                  {activeTab === 'history' && (
                    <Text
                      style={[
                        styles.orderStatus,
                        order.status === 'completed' && styles.statusCompleted,
                        order.status === 'canceled' && styles.statusCanceled,
                      ]}
                    >
                      {order.status === 'completed' ? 'Completed' : 'Canceled'}
                    </Text>
                  )}
                </View>

                {activeTab === 'history' && (
                  <View style={styles.orderMeta}>
                    <Text style={styles.orderDate}>{order.date}</Text>
                  </View>
                )}

                <View style={styles.orderActions}>
                  {activeTab === 'ongoing' ? (
                    <>
                      <TouchableOpacity
                        style={styles.trackButton}
                        onPress={() => router.push('/track-order' as never)}
                      >
                        <Text style={styles.trackButtonText}>Track Order</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.cancelButton}
                        onPress={() => handleCancelOrder(order.id)}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity 
                        style={styles.rateButton}
                        onPress={() => handleRateOrder(order.id)}
                      >
                        <Text style={styles.rateButtonText}>Rate</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.reorderButton}
                        onPress={() => handleReorder(order)}
                      >
                        <Text style={styles.reorderButtonText}>Re-Order</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {drinkOrders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Drink</Text>
            {drinkOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Image
                    source={{ uri: order.items[0].product.image }}
                    style={styles.orderImage}
                    contentFit="cover"
                  />
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderName}>{order.items[0].product.name}</Text>
                    <View style={styles.orderDetails}>
                      <Text style={styles.orderPrice}>{order.total} DT</Text>
                      <Text style={styles.orderSeparator}>•</Text>
                      <Text style={styles.orderItems}>
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)}{' '}
                        {order.items.reduce((sum, item) => sum + item.quantity, 0) === 1
                          ? 'Item'
                          : 'Items'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.orderActions}>
                  {activeTab === 'ongoing' ? (
                    <>
                      <TouchableOpacity
                        style={styles.trackButton}
                        onPress={() => router.push('/track-order' as never)}
                      >
                        <Text style={styles.trackButtonText}>Track Order</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.cancelButton}
                        onPress={() => handleCancelOrder(order.id)}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity 
                        style={styles.rateButton}
                        onPress={() => handleRateOrder(order.id)}
                      >
                        <Text style={styles.rateButtonText}>Rate</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.reorderButton}
                        onPress={() => handleReorder(order)}
                      >
                        <Text style={styles.reorderButtonText}>Re-Order</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'ongoing' && drinkOrders.length === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Drink</Text>
            <Text style={styles.emptyText}>no drinkable orders</Text>
          </View>
        )}

        {displayOrders.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No {activeTab === 'ongoing' ? 'ongoing' : 'history'} orders
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showRatingModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rate Your Order</Text>
            
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Star
                    size={40}
                    color={star <= rating ? colors.yellow : colors.lightGray}
                    fill={star <= rating ? colors.yellow : colors.lightGray}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reviewInput}
              placeholder="Write your review (optional)"
              placeholderTextColor={colors.mediumGray}
              value={review}
              onChangeText={setReview}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowRatingModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={submitRating}
              >
                <Text style={styles.modalSubmitText}>Submit</Text>
              </TouchableOpacity>
            </View>
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
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.textDark,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textLight,
  },
  tabTextActive: {
    color: colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.textDark,
    marginBottom: 16,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  orderImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textDark,
    marginBottom: 4,
  },
  orderDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  orderPrice: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.textDark,
  },
  orderSeparator: {
    marginHorizontal: 8,
    color: colors.textLight,
  },
  orderItems: {
    fontSize: 14,
    color: colors.textLight,
  },
  orderNumber: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginLeft: 8,
  },
  statusCompleted: {
    color: '#00B884',
  },
  statusCanceled: {
    color: '#E74C3C',
  },
  orderMeta: {
    marginBottom: 16,
  },
  orderDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  trackButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  trackButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.white,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  rateButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  rateButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  reorderButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  reorderButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  starButton: {
    padding: 4,
  },
  reviewInput: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: colors.textDark,
    marginBottom: 24,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.textDark,
  },
  modalSubmitButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalSubmitText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.white,
  },
});