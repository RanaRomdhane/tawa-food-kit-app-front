import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useApp } from '@/contexts/AppContext';
import colors from '@/constants/colors';

export default function Splash() {
  const router = useRouter();
  const { hasCompletedOnboarding, isAuthenticated } = useApp();
  const rotation1 = useRef(new Animated.Value(0)).current;
  const rotation2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    SplashScreen.hideAsync();

    Animated.loop(
      Animated.timing(rotation1, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(rotation2, {
        toValue: 1,
        duration: 25000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

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

  const rotate1 = rotation1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rotate2 = rotation2.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.radiatingLines,
          styles.radiatingLinesTop,
          { transform: [{ rotate: rotate1 }] },
        ]}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <View
            key={`top-${i}`}
            style={[
              styles.line,
              {
                transform: [{ rotate: `${(i * 360) / 20}deg` }],
                opacity: 0.15,
              },
            ]}
          />
        ))}
      </Animated.View>

      <Animated.View
        style={[
          styles.radiatingLines,
          styles.radiatingLinesBottom,
          { transform: [{ rotate: rotate2 }] },
        ]}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <View
            key={`bottom-${i}`}
            style={[
              styles.line,
              {
                transform: [{ rotate: `${(i * 360) / 20}deg` }],
                opacity: 0.15,
              },
            ]}
          />
        ))}
      </Animated.View>

      <View style={styles.logoContainer}>
        <View style={styles.logoWrapper}>
          <View style={styles.speedLines}>
            <View style={[styles.speedLine, { width: 40, left: -50 }]} />
            <View style={[styles.speedLine, { width: 30, left: -45, top: 10 }]} />
            <View style={[styles.speedLine, { width: 35, left: -48, top: 20 }]} />
          </View>

          <View style={styles.logoTextContainer}>
            <View style={styles.textRow}>
              <View style={styles.letterT}>
                <View style={styles.tTop} />
                <View style={styles.tVertical} />
              </View>
              <View style={styles.letterA}>
                <View style={styles.aLeft} />
                <View style={styles.aRight} />
                <View style={styles.aMiddle} />
              </View>
              <View style={styles.letterW}>
                <View style={styles.wLeft} />
                <View style={styles.wMiddleLeft} />
                <View style={styles.wMiddleRight} />
                <View style={styles.wRight} />
              </View>
              <View style={styles.letterA}>
                <View style={styles.aLeft} />
                <View style={styles.aRight} />
                <View style={styles.aMiddle} />
              </View>
            </View>
          </View>

          <View style={styles.cloche}>
            <View style={styles.clocheTop} />
            <View style={styles.clocheBody} />
            <View style={styles.clocheKnob} />
          </View>

          <View style={styles.scooterContainer}>
            <View style={styles.scooterBody}>
              <View style={styles.handlebar} />
              <View style={styles.deck} />
              <View style={styles.rearFender} />
            </View>

            <View style={[styles.wheel, styles.frontWheel]}>
              <View style={styles.wheelRim} />
            </View>
            <View style={[styles.wheel, styles.rearWheel]}>
              <View style={styles.wheelRim} />
            </View>
          </View>

          <View style={styles.foodKitText}>
            <View style={styles.foodKitRow}>
              <View style={styles.foodKitLetter} />
            </View>
          </View>
        </View>
      </View>
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
  radiatingLines: {
    position: 'absolute',
    width: 800,
    height: 800,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radiatingLinesTop: {
    top: -400,
    left: -400,
  },
  radiatingLinesBottom: {
    bottom: -400,
    right: -400,
  },
  line: {
    position: 'absolute',
    width: 400,
    height: 3,
    backgroundColor: colors.primary,
    transformOrigin: 'left center' as const,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
  },
  speedLines: {
    position: 'absolute',
    left: 20,
    top: 60,
  },
  speedLine: {
    height: 2,
    backgroundColor: colors.textDark,
    marginVertical: 2,
    borderRadius: 1,
  },
  logoTextContainer: {
    position: 'absolute',
    top: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  letterT: {
    width: 20,
    height: 28,
    position: 'relative' as const,
  },
  tTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: colors.textDark,
  },
  tVertical: {
    position: 'absolute',
    top: 0,
    left: 7,
    width: 6,
    height: 28,
    backgroundColor: colors.textDark,
  },
  letterA: {
    width: 20,
    height: 28,
    position: 'relative' as const,
  },
  aLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 5,
    height: 28,
    backgroundColor: colors.textDark,
    transform: [{ skewX: '-10deg' }],
  },
  aRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 5,
    height: 28,
    backgroundColor: colors.textDark,
    transform: [{ skewX: '10deg' }],
  },
  aMiddle: {
    position: 'absolute',
    left: 3,
    top: 14,
    right: 3,
    height: 4,
    backgroundColor: colors.textDark,
  },
  letterW: {
    width: 28,
    height: 28,
    position: 'relative' as const,
  },
  wLeft: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 5,
    height: 28,
    backgroundColor: colors.textDark,
    transform: [{ skewX: '10deg' }],
  },
  wMiddleLeft: {
    position: 'absolute',
    left: 7,
    bottom: 0,
    width: 4,
    height: 20,
    backgroundColor: colors.textDark,
    transform: [{ skewX: '-10deg' }],
  },
  wMiddleRight: {
    position: 'absolute',
    right: 7,
    bottom: 0,
    width: 4,
    height: 20,
    backgroundColor: colors.textDark,
    transform: [{ skewX: '10deg' }],
  },
  wRight: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 5,
    height: 28,
    backgroundColor: colors.textDark,
    transform: [{ skewX: '-10deg' }],
  },
  cloche: {
    position: 'absolute',
    top: 34,
    left: 88,
    width: 30,
    height: 30,
    alignItems: 'center',
  },
  clocheTop: {
    width: 6,
    height: 4,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    marginBottom: 1,
  },
  clocheBody: {
    width: 30,
    height: 20,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  clocheKnob: {
    position: 'absolute',
    top: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primaryDark,
  },
  scooterContainer: {
    position: 'absolute',
    bottom: 45,
    right: 30,
    width: 80,
    height: 50,
  },
  scooterBody: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
  },
  handlebar: {
    position: 'absolute',
    left: 8,
    top: -15,
    width: 3,
    height: 18,
    backgroundColor: colors.textDark,
  },
  deck: {
    position: 'absolute',
    left: 15,
    bottom: 0,
    width: 40,
    height: 4,
    backgroundColor: colors.orange,
    borderRadius: 2,
  },
  rearFender: {
    position: 'absolute',
    right: 8,
    bottom: 5,
    width: 20,
    height: 15,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  wheel: {
    position: 'absolute',
    bottom: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.textDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frontWheel: {
    left: 5,
  },
  rearWheel: {
    right: 5,
  },
  wheelRim: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.mediumGray,
  },
  foodKitText: {
    position: 'absolute',
    bottom: 30,
    right: 20,
  },
  foodKitRow: {
    flexDirection: 'row',
    gap: 2,
  },
  foodKitLetter: {
    width: 60,
    height: 12,
  },
});
