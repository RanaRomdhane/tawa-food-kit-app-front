import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Facebook, Twitter } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import colors from '@/constants/colors';

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Validation
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      // Navigation will be handled by auth state change in AppContext
      router.replace('/(main)/home' as never);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific error messages
      let errorMessage = 'An error occurred during login';
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Please verify your email before logging in.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.radiatingLinesTop}>
        {Array.from({ length: 15 }).map((_, i) => (
          <View
            key={`top-${i}`}
            style={[
              styles.line,
              {
                transform: [
                  { rotate: `${(i * 180) / 15}deg` },
                  { translateX: -200 },
                ],
                opacity: 0.08,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.radiatingLinesBottom}>
        {Array.from({ length: 15 }).map((_, i) => (
          <View
            key={`bottom-${i}`}
            style={[
              styles.line,
              {
                transform: [
                  { rotate: `${(i * 180) / 15 + 180}deg` },
                  { translateX: -200 },
                ],
                opacity: 0.08,
              },
            ]}
          />
        ))}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Log In</Text>
            <Text style={styles.subtitle}>Please sign in to your existing account</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>EMAIL</Text>
              <TextInput
                style={styles.input}
                placeholder="example@school.university.tn"
                placeholderTextColor={colors.mediumGray}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••••"
                  placeholderTextColor={colors.mediumGray}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  disabled={loading}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '👁' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setRememberMe(!rememberMe)}
                disabled={loading}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <View style={styles.checkmark} />}
                </View>
                <Text style={styles.checkboxLabel}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => router.push('/forgot-password' as never)}
                disabled={loading}
              >
                <Text style={styles.forgotPassword}>Forgot Password</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
              onPress={handleLogin} 
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.loginButtonText}>LOG IN</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don&apos;t have an account? </Text>
              <TouchableOpacity 
                onPress={() => router.push('/signup' as never)}
                disabled={loading}
              >
                <Text style={styles.signupLink}>SIGN UP</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.orText}>Or</Text>

            <View style={styles.socialButtons}>
              <TouchableOpacity 
                style={[styles.socialButton, styles.facebookButton]}
                disabled={loading}
                onPress={() => Alert.alert('Coming Soon', 'Facebook login will be available soon')}
              >
                <Facebook size={24} color={colors.white} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.socialButton, styles.twitterButton]}
                disabled={loading}
                onPress={() => Alert.alert('Coming Soon', 'Twitter login will be available soon')}
              >
                <Twitter size={24} color={colors.white} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.socialButton, styles.appleButton]}
                disabled={loading}
                onPress={() => Alert.alert('Coming Soon', 'Apple login will be available soon')}
              >
                <Text style={styles.appleIcon}></Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  radiatingLinesBottom: {
    position: 'absolute',
    bottom: 0,
    right: 0,
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
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 40,
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
  },
  form: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 40,
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textDark,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 14,
    color: colors.textDark,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 14,
    color: colors.textDark,
  },
  eyeButton: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 20,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.mediumGray,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    width: 12,
    height: 12,
    backgroundColor: colors.white,
    borderRadius: 2,
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.textDark,
  },
  forgotPassword: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600' as const,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    minHeight: 54,
    justifyContent: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  signupText: {
    fontSize: 14,
    color: colors.textDark,
  },
  signupLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700' as const,
  },
  orText: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 24,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 40,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  facebookButton: {
    backgroundColor: colors.facebook,
  },
  twitterButton: {
    backgroundColor: colors.twitter,
  },
  appleButton: {
    backgroundColor: colors.apple,
  },
  appleIcon: {
    fontSize: 24,
    color: colors.white,
  },
});