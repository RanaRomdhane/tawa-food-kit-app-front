import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function AddCard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addPaymentMethod } = useApp();

  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardType, setCardType] = useState<'visa' | 'mastercard' | null>(null);

  const detectCardType = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) {
      setCardType('visa');
    } else if (cleaned.startsWith('5')) {
      setCardType('mastercard');
    } else {
      setCardType(null);
    }
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted);
    detectCardType(cleaned);
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      setExpiryDate(cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4));
    } else {
      setExpiryDate(cleaned);
    }
  };

  const validateCard = () => {
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      Alert.alert('Validation Error', 'Please enter a valid 16-digit card number');
      return false;
    }
    if (!cardHolder.trim()) {
      Alert.alert('Validation Error', 'Please enter the card holder name');
      return false;
    }
    if (!expiryDate || expiryDate.length < 5) {
      Alert.alert('Validation Error', 'Please enter a valid expiry date (MM/YY)');
      return false;
    }
    if (!cvv || cvv.length < 3) {
      Alert.alert('Validation Error', 'Please enter a valid CVV');
      return false;
    }
    if (!cardType) {
      Alert.alert('Validation Error', 'Card type not recognized. Please use Visa or Mastercard');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateCard()) return;

    try {
      await addPaymentMethod({
        type: cardType!,
        cardNumber: cardNumber.replace(/\s/g, '').slice(-4), // Store only last 4 digits
        cardHolder: cardHolder,
        expiryDate: expiryDate,
      });
      Alert.alert('Success', 'Card added successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add card');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Card</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardPreview}>
          <View style={[styles.card, cardType === 'mastercard' && styles.cardMastercard]}>
            <View style={styles.cardTop}>
              <View style={styles.cardChip} />
              {cardType && (
                <Text style={styles.cardBrand}>
                  {cardType === 'visa' ? 'VISA' : 'Mastercard'}
                </Text>
              )}
            </View>
            <Text style={styles.cardNumberPreview}>
              {cardNumber || '●●●● ●●●● ●●●● ●●●●'}
            </Text>
            <View style={styles.cardBottom}>
              <View>
                <Text style={styles.cardLabel}>CARD HOLDER</Text>
                <Text style={styles.cardValue}>{cardHolder || 'YOUR NAME'}</Text>
              </View>
              <View>
                <Text style={styles.cardLabel}>EXPIRES</Text>
                <Text style={styles.cardValue}>{expiryDate || 'MM/YY'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Card Number</Text>
            <TextInput
              style={styles.input}
              value={cardNumber}
              onChangeText={formatCardNumber}
              placeholder="0000 0000 0000 0000"
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
              maxLength={19}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Card Holder Name</Text>
            <TextInput
              style={styles.input}
              value={cardHolder}
              onChangeText={setCardHolder}
              placeholder="Full name on card"
              placeholderTextColor={colors.textLight}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
              <Text style={styles.label}>Expiry Date</Text>
              <TextInput
                style={styles.input}
                value={expiryDate}
                onChangeText={formatExpiryDate}
                placeholder="MM/YY"
                placeholderTextColor={colors.textLight}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>CVV</Text>
              <TextInput
                style={styles.input}
                value={cvv}
                onChangeText={setCvv}
                placeholder="123"
                placeholderTextColor={colors.textLight}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>ADD CARD</Text>
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
  closeButton: {
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
  cardPreview: {
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  card: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 24,
    minHeight: 200,
    justifyContent: 'space-between',
  },
  cardMastercard: {
    backgroundColor: '#1A1A2E',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardChip: {
    width: 48,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#FFD700',
  },
  cardBrand: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.white,
  },
  cardNumberPreview: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.white,
    letterSpacing: 2,
    marginVertical: 20,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: colors.white,
    opacity: 0.7,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.white,
  },
  form: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textDark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.textDark,
  },
  row: {
    flexDirection: 'row',
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
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
});