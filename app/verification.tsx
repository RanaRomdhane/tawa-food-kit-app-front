import { useRouter } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import colors from '@/constants/colors';

export default function Verification() {
  const router = useRouter();
  const insets = useSafeAreaInsets();


  const handleVerify = () => {
    router.replace('/login' as never);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.radiatingLinesTop}>
        {Array.from({ length: 15 }).map((_, i) => (
          <View
            key={`top-${i}`}
            style={[styles.line, {transform: [{rotate: `${i * 180 / 15}deg`}, {translateX: -200}], opacity: 0.08}]}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <View style={styles.backIcon}>
          <ChevronLeft size={24} color={colors.textDark} />
        </View>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Verification</Text>
          <Text style={styles.subtitle}>We have sent a code to your email</Text>
          <Text style={styles.email}>rana.romdhane@enicar.ucar.tn</Text>
        </View>

        <View style={styles.form}>
          <View>
            <Text style={styles.label}>CODE</Text>
            <View style={styles.codeContainer}>
              {[0, 1, 2, 3].map((index) => (
                <View key={index} style={styles.codeBox}>
                  <Text style={styles.codeText}>{index === 0 ? '2' : index === 1 ? '0' : index === 2 ? '1' : '5'}</Text>
                </View>
              ))}
            </View>
            <View style={styles.resendRow}>
              <TouchableOpacity>
                <Text style={styles.resendText}>Resend</Text>
              </TouchableOpacity>
              <Text style={styles.timerText}> in.50sec</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleVerify}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>VERIFY</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkNavy,
  },
  radiatingLinesTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 400,
    height: 200,
    overflow: 'hidden',
  },
  line: {
    position: 'absolute',
    width: 400,
    height: 2,
    backgroundColor: colors.white,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
  },
  backIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.mediumGray,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600' as const,
  },
  form: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 40,
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textDark,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  codeBox: {
    width: 60,
    height: 60,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.textDark,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: colors.textDark,
    fontWeight: '600' as const,
  },
  timerText: {
    fontSize: 14,
    color: colors.textLight,
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
