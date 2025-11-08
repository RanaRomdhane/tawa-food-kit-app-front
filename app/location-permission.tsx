import { useRouter } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin } from 'lucide-react-native';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import colors from '@/constants/colors';

export default function LocationPermission() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleRequestPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      router.replace('/(main)/home' as never);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=400' }}
            style={styles.image}
            contentFit="cover"
          />
          <View style={styles.iconOverlay}>
            <View style={styles.iconCircle}>
              <MapPin size={48} color={colors.white} />
            </View>
          </View>
        </View>

        <View style={styles.textContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleRequestPermission}
            activeOpacity={0.8}
          >
            <MapPin size={20} color={colors.white} style={styles.buttonIcon} />
            <Text style={styles.buttonText}>ACCESS LOCATION</Text>
          </TouchableOpacity>

          <Text style={styles.description}>
            DFOOD WILL ACCESS YOUR LOCATION{'\n'}ONLY WHILE USING THE APP
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  image: {
    width: 280,
    height: 280,
    borderRadius: 200,
  },
  iconOverlay: {
    position: 'absolute',
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(201, 78, 31, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    paddingHorizontal: 24,
    gap: 24,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});
