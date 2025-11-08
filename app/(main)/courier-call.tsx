import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Phone, Mic, MicOff, Volume2 } from 'lucide-react-native';
import { Image } from 'expo-image';
import colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function CourierCall() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orders } = useApp();
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  const ongoingOrder = orders?.find((o) => o.status === 'ongoing' && o.courier);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={styles.courierInfo}>
          <Image
            source={{ uri: ongoingOrder?.courier?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' }}
            style={styles.avatar}
            contentFit="cover"
          />
          <Text style={styles.courierName}>{ongoingOrder?.courier?.name || 'Ahmed Fadhel'}</Text>
          <Text style={styles.status}>Connecting......</Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={() => setIsMuted(!isMuted)}
          >
            {isMuted ? (
              <MicOff size={28} color={colors.white} />
            ) : (
              <Mic size={28} color={colors.textDark} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.endCallButton}
            onPress={() => router.back()}
          >
            <Phone size={32} color={colors.white} style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, isSpeaker && styles.controlButtonActive]}
            onPress={() => setIsSpeaker(!isSpeaker)}
          >
            <Volume2 size={28} color={isSpeaker ? colors.white : colors.textDark} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mapBackground,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
  },
  courierInfo: {
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
  },
  courierName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.textDark,
    marginBottom: 8,
  },
  status: {
    fontSize: 14,
    color: colors.textLight,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: colors.textLight,
  },
  endCallButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
