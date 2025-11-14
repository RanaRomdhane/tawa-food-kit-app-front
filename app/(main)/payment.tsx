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
import { ChevronLeft } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import colors from '@/constants/colors';

const paymentMethods = [
  { id: 'cash', label: 'Cash' },
  { id: 'visa', label: 'Visa' },
  { id: 'mastercard', label: 'Mastercard' },
];

export default function Payment() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cartTotal, clearCart } = useApp();
  const [selectedMethod, setSelectedMethod] = useState('cash');

  const handlePayment = async () => {
    if (selectedMethod === 'cash') {
      Alert.alert(
        'Cash Payment',
        'Please give the money to the courier when your order arrives.',
        [
          {
            text: 'OK',
            onPress: async () => {
              await clearCart();
              router.replace('/order-success' as never);
            },
          },
        ]
      );
    } else if (selectedMethod === 'visa' || selectedMethod === 'mastercard') {
      Alert.alert(
        'Card Payment',
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

        <View style={styles.methodsRow}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.methodCardActive,
              ]}
              onPress={() => setSelectedMethod(method.id)}
            >
              {selectedMethod === method.id && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
              {method.id === 'cash' && (
                <Text style={styles.cashIcon}>💵</Text>
              )}
              {method.id === 'visa' && (
                <View style={styles.visaIcon}>
                  <Text style={styles.visaText}>VISA</Text>
                </View>
              )}
              {method.id === 'mastercard' && (
                <View style={styles.mastercardIcon}>
                  <View style={styles.mastercardCircle1} />
                  <View style={styles.mastercardCircle2} />
                </View>
              )}
              <Text style={styles.methodLabel}>{method.label}</Text>
            </TouchableOpacity>
          ))}
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

          {selectedMethod === 'visa' && (
            <View style={styles.detailsCard}>
              <Text style={styles.detailsTitle}>💳 Visa Card</Text>
              <Text style={styles.detailsText}>
                Pay securely with your Visa card. Your card details are encrypted and safe.
              </Text>
              <TouchableOpacity 
                style={styles.addCardButton}
                onPress={() => router.push('/add-card' as never)}
              >
                <Text style={styles.addCardText}>+ ADD VISA CARD</Text>
              </TouchableOpacity>
              <View style={styles.securityBadge}>
                <Text style={styles.securityText}>🔒 Secure Payment</Text>
              </View>
            </View>
          )}

          {selectedMethod === 'mastercard' && (
            <View style={styles.detailsCard}>
              <Text style={styles.detailsTitle}>💳 Mastercard</Text>
              <Text style={styles.detailsText}>
                Pay securely with your Mastercard. Your card details are encrypted and safe.
              </Text>
              <TouchableOpacity 
                style={styles.addCardButton}
                onPress={() => router.push('/add-card' as never)}
              >
                <Text style={styles.addCardText}>+ ADD MASTERCARD</Text>
              </TouchableOpacity>
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

        <TouchableOpacity style={styles.confirmButton} onPress={handlePayment}>
          <Text style={styles.confirmButtonText}>
            {selectedMethod === 'cash' ? 'CONFIRM ORDER' : 'PAY & CONFIRM'}
          </Text>
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
  methodsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  methodCard: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: colors.lightGray,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative' as const,
  },
  methodCardActive: {
    borderColor: colors.primary,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
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
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textDark,
    marginTop: 8,
  },
  cashIcon: {
    fontSize: 40,
  },
  visaIcon: {
    backgroundColor: '#1A1F71',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  visaText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  mastercardIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mastercardCircle1: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EB001B',
  },
  mastercardCircle2: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F79E1B',
    marginLeft: -12,
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
  addCardButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: 12,
  },
  addCardText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
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
  confirmButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
});