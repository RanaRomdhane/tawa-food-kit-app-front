import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, CreditCard } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import colors from '@/constants/colors';

export default function Payment() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cartTotal, createOrder, paymentMethods, selectedPaymentMethod, setSelectedPaymentMethod } = useApp();
  const [selectedMethod, setSelectedMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);

  // Load saved payment methods
  useEffect(() => {
    if (selectedPaymentMethod) {
      setSelectedMethod(selectedPaymentMethod.type);
    }
  }, [selectedPaymentMethod]);

  const handlePayment = async () => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      if (selectedMethod === 'cash') {
        // Create order with cash payment
        const orderNumber = await createOrder();
        
        Alert.alert(
          'Order Placed!',
          'Please prepare cash for the courier when your order arrives.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/order-success' as never),
            },
          ]
        );
      } else if (selectedMethod === 'visa' || selectedMethod === 'mastercard') {
        // Check if card is saved
        const savedCard = paymentMethods.find(pm => pm.type === selectedMethod);
        
        if (!savedCard) {
          Alert.alert(
            'Card Required',
            'Please add your card details first.',
            [
              {
                text: 'Add Card',
                onPress: () => router.push('/add-card' as never),
              },
              {
                text: 'Cancel',
                style: 'cancel',
              },
            ]
          );
        } else {
          // Process card payment
          const orderNumber = await createOrder();
          
          Alert.alert(
            'Payment Successful!',
            'Your order has been placed successfully.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/order-success' as never),
              },
            ]
          );
        }
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      Alert.alert('Payment Failed', error.message || 'Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>SELECT PAYMENT METHOD</Text>

        <View style={styles.methodsSection}>
          {/* Cash Option */}
          <TouchableOpacity
            style={[
              styles.methodCard,
              selectedMethod === 'cash' && styles.methodCardActive,
            ]}
            onPress={() => setSelectedMethod('cash')}
          >
            {selectedMethod === 'cash' && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
            <Text style={styles.cashIcon}>💵</Text>
            <Text style={styles.methodLabel}>Cash</Text>
            <Text style={styles.methodSubtext}>Pay on delivery</Text>
          </TouchableOpacity>

          {/* Saved Cards */}
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.type && styles.methodCardActive,
              ]}
              onPress={() => {
                setSelectedMethod(method.type);
                setSelectedPaymentMethod(method);
              }}
            >
              {selectedMethod === method.type && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
              <CreditCard size={32} color={colors.primary} />
              <Text style={styles.methodLabel}>
                {method.type === 'visa' ? 'Visa' : 'Mastercard'}
              </Text>
              <Text style={styles.methodSubtext}>
                •••• {method.cardNumber}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Add New Card Option */}
          <TouchableOpacity
            style={styles.addCardButton}
            onPress={() => router.push('/add-card' as never)}
          >
            <Text style={styles.addCardIcon}>+</Text>
            <Text style={styles.addCardText}>Add New Card</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.paymentDetails}>
          {selectedMethod === 'cash' && (
            <View style={styles.detailsCard}>
              <Text style={styles.detailsTitle}>💵 Cash Payment</Text>
              <Text style={styles.detailsText}>
                Please prepare the exact amount or change for the courier when your order arrives.
                Our delivery partner will collect the payment upon delivery.
              </Text>
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>💡 Tip: Have exact change ready for faster delivery!</Text>
              </View>
            </View>
          )}

          {(selectedMethod === 'visa' || selectedMethod === 'mastercard') && (
            <View style={styles.detailsCard}>
              <Text style={styles.detailsTitle}>💳 Card Payment</Text>
              <Text style={styles.detailsText}>
                Your card will be charged immediately. All transactions are secure and encrypted.
              </Text>
              <View style={styles.securityBadge}>
                <Text style={styles.securityText}>🔒 Secure Payment</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.orderSummary}>
          <Text style={styles.summaryTitle}>ORDER SUMMARY</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{cartTotal.toFixed(2)} DT</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>2.00 DT</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabelBold}>Total</Text>
            <Text style={styles.summaryValueBold}>{(cartTotal + 2).toFixed(2)} DT</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL:</Text>
          <Text style={styles.totalValue}>{(cartTotal + 2).toFixed(2)} DT</Text>
        </View>

        <TouchableOpacity 
          style={[styles.confirmButton, isProcessing && styles.confirmButtonDisabled]} 
          onPress={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.confirmButtonText}>
              {selectedMethod === 'cash' ? 'CONFIRM ORDER' : 'PAY & CONFIRM'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.textDark,
    paddingHorizontal: 20,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  methodsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  methodCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative' as const,
  },
  methodCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.textDark,
    marginTop: 8,
  },
  methodSubtext: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  cashIcon: {
    fontSize: 40,
  },
  addCardButton: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addCardIcon: {
    fontSize: 32,
    color: colors.primary,
    marginBottom: 8,
  },
  addCardText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  paymentDetails: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  detailsCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 16,
    padding: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.textDark,
    marginBottom: 12,
  },
  detailsText: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoText: {
    fontSize: 12,
    color: colors.textDark,
  },
  securityBadge: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  securityText: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600' as const,
  },
  orderSummary: {
    marginHorizontal: 20,
    backgroundColor: colors.lightGray,
    borderRadius: 16,
    padding: 20,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.textDark,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.textDark,
    fontWeight: '600' as const,
  },
  summaryLabelBold: {
    fontSize: 16,
    color: colors.textDark,
    fontWeight: '700' as const,
  },
  summaryValueBold: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '700' as const,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.mediumGray,
    marginVertical: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textLight,
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.textDark,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
});