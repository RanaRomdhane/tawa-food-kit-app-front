import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Image } from 'expo-image';
import { useApp } from '@/contexts/AppContext';
import colors from '@/constants/colors';

export default function Splash() {
  const router = useRouter();
  const { hasCompletedOnboarding, isAuthenticated } = useApp();

  useEffect(() => {
    SplashScreen.hideAsync();

    const timeout = setTimeout(() => {
      if (!hasCompletedOnboarding) {
        router.replace('/onboarding' as never);
      } else if (!isAuthenticated) {
        router.replace('/login' as never);
      } else {
        router.replace('/(main)/home' as never);
      }
    }, 2500);

    return () => clearTimeout(timeout);
  }, [hasCompletedOnboarding, isAuthenticated]);

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/logo.png')}
        style={styles.logo}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 300,
    height: 300,
  },
});