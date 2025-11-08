import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin, Phone, MessageCircle } from 'lucide-react-native';
import { Image } from 'expo-image';
import colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function TrackOrder() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orders } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(200)).current;
  const routeProgress = useRef(new Animated.Value(0)).current;

  const ongoingOrder = orders?.find((o) => o.status === 'ongoing' && o.courier);

  useEffect(() => {
    Animated.timing(routeProgress, {
      toValue: 0.6,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  }, [routeProgress]);

  const toggleExpand = () => {
    const toValue = isExpanded ? 200 : 450;
    Animated.spring(animatedHeight, {
      toValue,
      useNativeDriver: false,
    }).start();
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Order</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.mapContainer}>
        <View style={styles.map}>
          <View style={styles.routePath}>
            <View style={styles.startPin}>
              <MapPin size={32} color={colors.red} fill={colors.red} />
            </View>
            <View style={styles.endPin}>
              <MapPin size={32} color={colors.yellow} fill={colors.yellow} />
            </View>
            <Animated.View
              style={[
                styles.routeLine,
                {
                  height: routeProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>
      </View>

      <Animated.View style={[styles.bottomSheet, { height: animatedHeight }]}>
        <TouchableOpacity
          style={styles.dragHandle}
          onPress={toggleExpand}
          activeOpacity={0.8}
        >
          <View style={styles.dragIndicator} />
        </TouchableOpacity>

        {ongoingOrder ? (
          <>
            <View style={styles.orderHeader}>
              <Image
                source={{ uri: ongoingOrder.courier?.avatar }}
                style={styles.courierAvatar}
                contentFit="cover"
              />
              <View style={styles.orderHeaderInfo}>
                <Text style={styles.locationTitle}>{ongoingOrder.courier?.name}'s Location</Text>
                <Text style={styles.orderTime}>Orderd At {ongoingOrder.date}</Text>
              </View>
            </View>

            <View style={styles.orderItems}>
              {ongoingOrder.items.map((item, index) => (
                <Text key={index} style={styles.orderItem}>
                  {item.quantity}x {item.product.name}
                </Text>
              ))}
            </View>

            {isExpanded && (
              <>
                <View style={styles.deliveryTime}>
                  <Text style={styles.deliveryTimeValue}>20 min</Text>
                  <Text style={styles.deliveryTimeLabel}>ESTIMATED DELIVERY TIME</Text>
                </View>

                <View style={styles.statusList}>
                  <View style={styles.statusItem}>
                    <View style={[styles.statusDot, styles.statusDotActive]} />
                    <View style={styles.statusLine} />
                    <Text style={styles.statusText}>Your order has been received</Text>
                  </View>
                  <View style={styles.statusItem}>
                    <View style={[styles.statusDot, styles.statusDotActive]} />
                    <View style={styles.statusLine} />
                    <Text style={styles.statusText}>
                      The restaurant is preparing your food
                    </Text>
                  </View>
                  <View style={styles.statusItem}>
                    <View style={[styles.statusDot, styles.statusDotInactive]} />
                    <View style={styles.statusLine} />
                    <Text style={[styles.statusText, styles.statusTextInactive]}>
                      Your order has been picked up for delivery
                    </Text>
                  </View>
                  <View style={styles.statusItem}>
                    <View style={[styles.statusDot, styles.statusDotInactive]} />
                    <View style={{ height: 0 }} />
                    <Text style={[styles.statusText, styles.statusTextInactive]}>
                      Order arriving soon!
                    </Text>
                  </View>
                </View>

                <View style={styles.courierInfo}>
                  <Image
                    source={{ uri: ongoingOrder.courier?.avatar }}
                    style={styles.courierAvatarLarge}
                    contentFit="cover"
                  />
                  <View style={styles.courierDetails}>
                    <Text style={styles.courierName}>{ongoingOrder.courier?.name}</Text>
                    <Text style={styles.courierLabel}>Courier</Text>
                  </View>
                  <View style={styles.courierActions}>
                    <TouchableOpacity
                      style={styles.courierActionButton}
                      onPress={() => router.push('/courier-call' as never)}
                    >
                      <Phone size={20} color={colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.courierActionButton}
                      onPress={() => router.push('/courier-chat' as never)}
                    >
                      <MessageCircle size={20} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </>
        ) : (
          <Text style={styles.noOrder}>No ongoing orders with courier</Text>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mapBackground,
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
    backgroundColor: colors.darkNavy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.textDark,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
    position: 'relative',
  },
  routePath: {
    position: 'absolute',
    left: '50%',
    top: 100,
    bottom: 100,
    width: 4,
    marginLeft: -2,
  },
  startPin: {
    position: 'absolute',
    bottom: 0,
    left: -14,
  },
  endPin: {
    position: 'absolute',
    top: 0,
    left: -14,
  },
  routeLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: colors.lightGray,
    borderRadius: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  courierAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  orderHeaderInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.textDark,
  },
  orderTime: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  orderItems: {
    marginBottom: 16,
  },
  orderItem: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  deliveryTime: {
    alignItems: 'center',
    marginBottom: 24,
  },
  deliveryTimeValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: colors.textDark,
  },
  deliveryTimeLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textLight,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  statusList: {
    marginBottom: 24,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  statusDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDotActive: {
    backgroundColor: colors.primary,
  },
  statusDotInactive: {
    backgroundColor: colors.lightGray,
  },
  statusLine: {
    width: 2,
    height: 16,
    backgroundColor: colors.lightGray,
    position: 'absolute',
    left: 11,
    top: 24,
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    color: colors.primary,
    lineHeight: 24,
  },
  statusTextInactive: {
    color: colors.textLight,
  },
  courierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  courierAvatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  courierDetails: {
    flex: 1,
  },
  courierName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.textDark,
  },
  courierLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  courierActions: {
    flexDirection: 'row',
    gap: 12,
  },
  courierActionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noOrder: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 20,
  },
});
