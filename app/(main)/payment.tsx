import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
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
  const [selectedMethod, setSelectedMethod] = useState('mastercard');

  const handlePayment = async () => {
    await clearCart();
    router.replace('/order-success' as never);
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

        {selectedMethod === 'mastercard' && (
          <View style={styles.cardPreview}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Master Card</Text>
              <Text style={styles.cardNumber}>●●●●●●●●●●●● 436</Text>
            </View>
            <TouchableOpacity 
              style={styles.addNewButton}
              onPress={() => router.push('/add-card' as never)}
            >
              <Text style={styles.addNewText}>+ ADD NEW</Text>
            </TouchableOpacity>
          </View>
        )}

        {selectedMethod === 'cash' && (
          <View style={styles.noCardSection}>
            <Text style={styles.noCardTitle}>No master card added</Text>
            <Text style={styles.noCardSubtitle}>
              You can add a mastercard and save it for later
            </Text>
            <TouchableOpacity 
              style={styles.addNewButton}
              onPress={() => router.push('/add-card' as never)}
            >
              <Text style={styles.addNewText}>+ ADD NEW</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL:</Text>
          <Text style={styles.totalValue}>{cartTotal} DT</Text>
        </View>

        <TouchableOpacity style={styles.confirmButton} onPress={handlePayment}>
          <Text style={styles.confirmButtonText}>PAY & CONFIRM</Text>
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
  cardPreview: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.white,
    marginBottom: 32,
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.white,
    letterSpacing: 2,
  },
  addNewButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  addNewText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  noCardSection: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  noCardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.textDark,
    marginBottom: 8,
  },
  noCardSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
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
});
