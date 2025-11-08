import { useRouter } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';

export default function OrderSuccess() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>TAWA</Text>
          <Text style={styles.logoSubtext}>Food Kit</Text>
        </View>

        <Text style={styles.thankYouText}>thank you for your</Text>
        <Text style={styles.orderText}>order</Text>

        <Text style={styles.message}>
          You successfully made a payment,{'\n'}enjoy our service!
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { marginBottom: insets.bottom + 20 }]}
        onPress={() => router.replace('/track-order' as never)}
      >
        <Text style={styles.buttonText}>TRACK ORDER</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: colors.textDark,
  },
  logoSubtext: {
    fontSize: 16,
    color: colors.orange,
    fontWeight: '600' as const,
  },
  thankYouText: {
    fontSize: 24,
    color: colors.orange,
    fontWeight: '400' as const,
    marginBottom: 8,
  },
  orderText: {
    fontSize: 32,
    color: colors.orange,
    fontWeight: '700' as const,
    marginBottom: 32,
  },
  message: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
});
